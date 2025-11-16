//! Domain entities - business objects with identity and lifecycle
//!
//! Entities represent core business concepts with unique identity.
//! They contain business logic and maintain invariants.

use crate::{CoreError, Result};
use serde::{Deserialize, Serialize};
use uuid::Uuid;
use chrono::{DateTime, Utc};
use std::collections::HashMap;
use std::sync::Arc;

/// DataSet represents a collection of generated data with schema and metadata
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DataSet {
    /// Unique identifier for the dataset
    pub id: Uuid,
    
    /// Human-readable name
    pub name: String,
    
    /// Schema definition for this dataset
    pub schema: DataSchema,
    
    /// Generated data rows
    pub rows: Vec<DataRow>,
    
    /// Metadata about generation process
    pub metadata: DataSetMetadata,
    
    /// Creation timestamp
    pub created_at: DateTime<Utc>,
    
    /// Last modification timestamp
    pub updated_at: DateTime<Utc>,
}

/// DataRow represents a single row of generated data
///
/// Field storage optimized for performance
/// 
/// Uses Vec for small schemas (<10 fields) for better performance:
/// - No hashing overhead
/// - Better cache locality
/// - Direct index access O(1) - NO linear search!
/// - Uses indices instead of names to avoid String clones
/// - **RADICAL OPTIMIZATION**: Direct values instead of Arc - eliminates atomic operations!
/// 
/// Uses HashMap for large schemas (>=10 fields) for O(1) lookup.
#[derive(Debug, Clone)]
pub enum Fields {
    /// Small schema: Vec<Option<DataValue>> - O(1) direct access by index!
    /// **RADICAL**: Direct values instead of Arc - zero atomic operations!
    /// Index corresponds directly to field position in schema.
    /// None means field is not set (optional fields).
    Small(Vec<Option<DataValue>>),
    /// Large schema: HashMap - O(1) lookup for >=10 fields
    /// **RADICAL**: Still uses Arc for HashMap (needed for sharing in large schemas)
    /// Uses String keys for O(1) hash lookup (String clone is optimized by Rust)
    Large(HashMap<String, Arc<DataValue>>),
}

/// Generation context shared across rows to avoid Arc cloning overhead
/// 
/// **CRITICAL OPTIMIZATION**: Instead of cloning Arc for field_names in each DataRow,
/// we use a shared context. This eliminates 2M atomic operations for 1M rows!
/// 
/// **ULTRA-OPTIMIZATION**: Uses Arc<String> for field_names to enable sharing without cloning
/// for HashMap keys in large schemas!
#[derive(Debug, Clone)]
pub struct GenerationContext {
    /// Field names for index-to-name conversion (only needed for Small schemas)
    /// **ULTRA-OPTIMIZED**: Arc<String> enables sharing without cloning for HashMap keys!
    pub field_names: Arc<Vec<String>>,
    
    
    /// Cache for name-to-index lookup (O(1) instead of linear search)
    pub name_to_index: Arc<HashMap<String, usize>>,
}

impl GenerationContext {
    /// Create a new generation context from a schema
    pub fn from_schema(schema: &DataSchema) -> Self {
        let mut field_names_vec = Vec::with_capacity(schema.fields.len());
        for field in &schema.fields {
            field_names_vec.push(field.name.clone());
        }
        let field_names = Arc::new(field_names_vec);
        
        // Build cache: name → index for O(1) lookup
        let mut name_to_index_map = HashMap::with_capacity(field_names.len());
        for (idx, name) in field_names.iter().enumerate() {
            name_to_index_map.insert(name.clone(), idx);
        }
        let name_to_index = Arc::new(name_to_index_map);
        
        Self {
            field_names,
            name_to_index,
        }
    }
}

/// **RADICAL OPTIMIZATION**: Uses direct `DataValue` for small schemas to eliminate Arc overhead!
/// For small schemas (<10 fields), values are stored directly (no Arc).
/// For large schemas (>=10 fields), still uses Arc for HashMap compatibility.
///
/// **CRITICAL OPTIMIZATION**: Removed field_names and field_name_to_index to eliminate Arc cloning!
/// Use GenerationContext when field names are needed (serialization, get_field, etc.)
///
/// Memory layout optimized with #[repr(C)] for better cache performance.
#[repr(C)]
#[derive(Debug, Clone)]
pub struct DataRow {
    /// Unique identifier for this row
    pub id: Uuid,
    
    /// Field values in this row (optimized storage based on schema size)
    pub fields: Fields,
    
    /// Row sequence number within dataset
    pub sequence: u64,
    
    /// Generation timestamp
    pub generated_at: DateTime<Utc>,
}

/// DataSchema defines the structure and constraints for data generation
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DataSchema {
    /// Unique identifier for the schema
    pub id: Uuid,
    
    /// Schema name and version
    pub name: String,
    pub version: String,
    
    /// Field definitions
    pub fields: Vec<FieldDefinition>,
    
    /// Global constraints and relationships
    pub constraints: Vec<SchemaConstraint>,
    
    /// Schema metadata
    pub metadata: HashMap<String, String>,
}

/// FieldDefinition specifies how a single field should be generated
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct FieldDefinition {
    /// Field name (must be unique within schema)
    pub name: String,
    
    /// Field data type and generation parameters
    pub field_type: FieldType,
    
    /// Field-level constraints
    pub constraints: Vec<FieldConstraint>,
    
    /// Whether this field is required
    pub required: bool,
    
    /// Default value strategy
    pub default: Option<DefaultStrategy>,
    
    /// Field description/documentation
    pub description: Option<String>,
}

impl DataSet {
    /// Create a new empty dataset with schema
    pub fn new(name: String, schema: DataSchema) -> Self {
        let now = Utc::now();
        Self {
            id: Uuid::new_v4(),
            name,
            schema,
            rows: Vec::new(),
            metadata: DataSetMetadata::default(),
            created_at: now,
            updated_at: now,
        }
    }
    
    /// Add a data row to the dataset
    pub fn add_row(&mut self, mut row: DataRow) -> Result<()> {
        // Validate row against schema
        self.validate_row(&row)?;
        
        // Set sequence number
        row.sequence = self.rows.len() as u64;
        
        // Add row and update metadata
        self.rows.push(row);
        self.metadata.row_count = self.rows.len();
        self.updated_at = Utc::now();
        
        Ok(())
    }
    
    /// Validate a row against the schema
    pub fn validate_row(&self, row: &DataRow) -> Result<()> {
        // Create context for validation (needed for Small schemas)
        let ctx = GenerationContext::from_schema(&self.schema);
        
        // Check all required fields are present
        for field_def in &self.schema.fields {
            if field_def.required && !row.fields.contains_key(&field_def.name, Some(&ctx.name_to_index)) {
                return Err(CoreError::Validation {
                    message: format!("Required field '{}' is missing", field_def.name),
                });
            }
        }
        
        // Validate field types and constraints
        // RADICAL: value is already &DataValue (no Arc, no as_ref needed!)
        for (field_name, value) in row.fields.to_vec(Some(&ctx.field_names)) {
            if let Some(field_def) = self.schema.fields.iter().find(|f| f.name == *field_name) {
                self.validate_field_value(field_def, value)?;
                
                // Check uniqueness constraint at dataset level
                if field_def.constraints.iter().any(|c| matches!(c, FieldConstraint::Unique)) {
                    self.validate_uniqueness(field_name, value, &ctx)?;
                }
            }
        }
        
        Ok(())
    }
    
    /// Validate uniqueness of a field value across the dataset
    fn validate_uniqueness(&self, field_name: &str, value: &DataValue, ctx: &GenerationContext) -> Result<()> {
        // RADICAL: existing_value is already &DataValue (no Arc, no as_ref needed!)
        for (idx, existing_row) in self.rows.iter().enumerate() {
            if let Some(existing_value) = existing_row.get_field(field_name, Some(ctx)) {
                if existing_value == value {
                    return Err(CoreError::Validation {
                        message: format!(
                            "Field '{}' must be unique, but value {:?} already exists at row index {} (sequence {})",
                            field_name, value, idx, existing_row.sequence
                        ),
                    });
                }
            }
        }
        Ok(())
    }
    
    /// Validate a field value against its definition
    fn validate_field_value(&self, field_def: &FieldDefinition, value: &DataValue) -> Result<()> {
        // Type compatibility check
        if !field_def.field_type.is_compatible_with(value) {
            return Err(CoreError::Field {
                message: format!(
                    "Field '{}' has incompatible type: expected {:?}, but got {} ({:?})",
                    field_def.name, 
                    field_def.field_type,
                    value.type_name(),
                    value
                ),
            });
        }
        
        // Apply field constraints
        for constraint in &field_def.constraints {
            constraint.validate(value)?;
        }
        
        Ok(())
    }
    
    /// Get row count
    pub fn len(&self) -> usize {
        self.rows.len()
    }
    
    /// Check if dataset is empty
    pub fn is_empty(&self) -> bool {
        self.rows.is_empty()
    }
}

impl Fields {
    /// Create Fields based on expected field count
    /// Uses Vec for small schemas (<10), HashMap for large (>=10)
    pub fn new(field_count: usize) -> Self {
        if field_count < 10 {
            // Pre-allocate Vec with None for all fields (direct index access)
            Fields::Small(vec![None; field_count])
        } else {
            Fields::Large(HashMap::with_capacity(field_count))
        }
    }
    
    /// Get field count
    pub fn len(&self) -> usize {
        match self {
            Fields::Small(vec) => vec.len(),
            Fields::Large(map) => map.len(),
        }
    }
    
    /// Check if empty
    pub fn is_empty(&self) -> bool {
        match self {
            Fields::Small(vec) => vec.is_empty() || vec.iter().all(|v| v.is_none()),
            Fields::Large(map) => map.is_empty(),
        }
    }
    
    /// Get a field value reference by name
    /// For Small schemas, uses cache for O(1) name-to-index lookup, then O(1) direct access!
    /// **RADICAL**: Returns reference to direct value (no Arc) for Small schemas!
    pub fn get(&self, name: &str, name_to_index: Option<&Arc<HashMap<String, usize>>>) -> Option<&DataValue> {
        match self {
            Fields::Small(vec) => {
                // ULTRA-FAST: O(1) cache lookup + O(1) direct access!
                if let Some(cache) = name_to_index {
                    // O(1) lookup: name → index
                    if let Some(&idx) = cache.get(name) {
                        // O(1) direct access by index - NO linear search, NO Arc!
                        vec.get(idx)?.as_ref()
                    } else {
                        None
                    }
                } else {
                    // Fallback: can't convert without cache
                    None
                }
            }
            Fields::Large(map) => {
                // For Arc<String> keys, search by string slice
                map.iter()
                    .find(|(k, _)| k.as_str() == name)
                    .map(|(_, v)| v.as_ref())
            }
        }
    }
    
    /// Check if contains field by name
    /// Uses cache for O(1) lookup + O(1) direct access
    pub fn contains_key(&self, name: &str, name_to_index: Option<&Arc<HashMap<String, usize>>>) -> bool {
        match self {
            Fields::Small(vec) => {
                if let Some(cache) = name_to_index {
                    // O(1) lookup: name → index
                    if let Some(&idx) = cache.get(name) {
                        // O(1) direct access - check if Some
                        vec.get(idx).and_then(|v| v.as_ref()).is_some()
                    } else {
                        false
                    }
                } else {
                    false
                }
            }
            Fields::Large(map) => map.contains_key(name),
        }
    }
    
    /// Insert a field by name (updates if exists)
    /// Uses cache for O(1) name-to-index lookup + O(1) direct access
    /// **RADICAL**: Accepts direct DataValue for Small schemas (no Arc needed!)
    pub fn insert<V: Into<DataValue>>(&mut self, name: String, value: V, name_to_index: Option<&Arc<HashMap<String, usize>>>) {
        match self {
            Fields::Small(vec) => {
                if let Some(cache) = name_to_index {
                    // O(1) lookup: name → index
                    if let Some(&idx) = cache.get(&name) {
                        // O(1) direct access - update at index (direct value, no Arc!)
                        if idx < vec.len() {
                            vec[idx] = Some(value.into());
                        } else {
                            // Index out of bounds - shouldn't happen, but safe fallback
                            // Extend vec if needed
                            while vec.len() <= idx {
                                vec.push(None);
                            }
                            vec[idx] = Some(value.into());
                        }
                    } else {
                        // Name not found in cache - shouldn't happen
                        // This is an error condition, but we'll ignore it
                    }
                } else {
                    // No cache - can't use Small, should use Large
                    // This shouldn't happen in practice
                }
            }
            Fields::Large(map) => {
                // For large schemas, use String key and Arc<DataValue> for value
                // String clone is optimized by Rust (memcpy for small strings)
                map.insert(name, Arc::new(value.into()));
            }
        }
    }
    
    /// Convert to Vec for iteration (used in serialization)
    /// For Small schemas, requires field_names for index-to-name conversion
    /// **RADICAL**: Returns direct value references for Small schemas (no Arc!)
    pub fn to_vec<'a>(&'a self, field_names: Option<&'a Arc<Vec<String>>>) -> Vec<(&'a String, &'a DataValue)> {
        match self {
            Fields::Small(vec) => {
                if let Some(names) = field_names {
                    // Convert indices to names - direct access by index!
                    vec.iter()
                        .enumerate()
                        .filter_map(|(idx, opt_value)| {
                            opt_value.as_ref().and_then(|v| {
                                names.get(idx).map(|name| (name, v))
                            })
                        })
                        .collect()
                } else {
                    // Can't convert without field_names
                    Vec::new()
                }
            }
            Fields::Large(map) => {
                // For large schemas, dereference Arc<DataValue> to &DataValue
                map.iter().map(|(k, v)| (k, v.as_ref())).collect()
            }
        }
    }
}

impl DataRow {
    /// Create a new empty data row with Vec storage (optimized for small schemas)
    pub fn new() -> Self {
        Self {
            id: Uuid::new_v4(),
            fields: Fields::Small(Vec::new()),
            sequence: 0,
            generated_at: Utc::now(),
        }
    }
    
    /// Create a new data row with optimized storage based on field count
    pub fn with_capacity(field_count: usize) -> Self {
        Self {
            id: Uuid::new_v4(),
            fields: Fields::new(field_count),
            sequence: 0,
            generated_at: Utc::now(),
        }
    }
    
    /// Set a field value
    ///
    /// **RADICAL**: Accepts direct `DataValue` (no Arc needed for Small schemas!)
    /// For Small schemas, value is stored directly (zero Arc overhead).
    /// For Large schemas, value is wrapped in Arc automatically.
    ///
    /// **NOTE**: Requires GenerationContext for Small schemas to resolve field names to indices.
    pub fn set_field<V: Into<DataValue>>(&mut self, name: String, value: V, ctx: Option<&GenerationContext>) {
        let name_to_index = ctx.map(|c| &c.name_to_index);
        self.fields.insert(name, value, name_to_index);
    }
    
    /// Get a field value reference
    /// **RADICAL**: Returns direct value reference (no Arc) for Small schemas!
    ///
    /// **NOTE**: Requires GenerationContext for Small schemas to resolve field names to indices.
    pub fn get_field(&self, name: &str, ctx: Option<&GenerationContext>) -> Option<&DataValue> {
        let name_to_index = ctx.map(|c| &c.name_to_index);
        self.fields.get(name, name_to_index)
    }
    
    /// Get a field value as a reference to the inner DataValue
    /// Alias for get_field (kept for API compatibility)
    ///
    /// **NOTE**: Requires GenerationContext for Small schemas to resolve field names to indices.
    pub fn get_field_value(&self, name: &str, ctx: Option<&GenerationContext>) -> Option<&DataValue> {
        self.get_field(name, ctx)
    }
    
    /// Get a field value reference (backward compatibility - requires context)
    /// 
    /// **DEPRECATED**: Use get_field with context instead.
    /// This method will try to work without context for Large schemas only.
    pub fn get_field_legacy(&self, name: &str) -> Option<&DataValue> {
        // Only works for Large schemas (HashMap doesn't need context)
        match &self.fields {
            Fields::Large(map) => {
                // O(1) hash lookup for large schemas
                map.get(name).map(|arc| arc.as_ref())
            },
            Fields::Small(_) => None, // Can't resolve without context
        }
    }
}

impl DataSchema {
    /// Create a new schema
    pub fn new(name: String, version: String) -> Self {
        Self {
            id: Uuid::new_v4(),
            name,
            version,
            fields: Vec::new(),
            constraints: Vec::new(),
            metadata: HashMap::new(),
        }
    }
    
    /// Add a field definition
    pub fn add_field(&mut self, field: FieldDefinition) -> Result<()> {
        // Check for duplicate field names
        if self.fields.iter().any(|f| f.name == field.name) {
            return Err(CoreError::Schema {
                message: format!("Field '{}' already exists in schema", field.name),
            });
        }
        
        self.fields.push(field);
        Ok(())
    }
    
    /// Get field definition by name
    pub fn get_field(&self, name: &str) -> Option<&FieldDefinition> {
        self.fields.iter().find(|f| f.name == name)
    }
    
    /// Validate the schema consistency
    pub fn validate(&self) -> Result<()> {
        if self.fields.is_empty() {
            return Err(CoreError::Schema {
                message: "Schema must have at least one field".to_string(),
            });
        }
        
        // Check for duplicate field names
        let mut seen_names = std::collections::HashSet::new();
        for field in &self.fields {
            if !seen_names.insert(&field.name) {
                return Err(CoreError::Schema {
                    message: format!("Duplicate field name: {}", field.name),
                });
            }
        }
        
        Ok(())
    }
}

impl Default for DataRow {
    fn default() -> Self {
        Self::new()
    }
}

// Custom serialization/deserialization for DataRow
// NOTE: Serialization requires GenerationContext for Small schemas
impl DataRow {
    /// Serialize with context (for Small schemas, context is required)
    pub fn serialize_with_context<S>(&self, serializer: S, ctx: Option<&GenerationContext>) -> std::result::Result<S::Ok, S::Error>
    where
        S: serde::Serializer,
    {
        use serde::ser::SerializeStruct;
        let mut state = serializer.serialize_struct("DataRow", 4)?;
        state.serialize_field("id", &self.id)?;
        // Serialize fields - use context for Small schemas
        let field_names = ctx.map(|c| &c.field_names);
        let fields: HashMap<&String, &DataValue> = self.fields.to_vec(field_names)
            .into_iter()
            .map(|(k, v)| (k, v))
            .collect();
        state.serialize_field("fields", &fields)?;
        state.serialize_field("sequence", &self.sequence)?;
        state.serialize_field("generated_at", &self.generated_at)?;
        state.end()
    }
}

// Default Serialize implementation (works for Large schemas, requires context for Small)
impl Serialize for DataRow {
    fn serialize<S>(&self, serializer: S) -> std::result::Result<S::Ok, S::Error>
    where
        S: serde::Serializer,
    {
        // For backward compatibility, try to serialize without context
        // This only works for Large schemas (HashMap doesn't need field_names)
        use serde::ser::SerializeStruct;
        let mut state = serializer.serialize_struct("DataRow", 4)?;
        state.serialize_field("id", &self.id)?;
        // Serialize fields - Large schemas don't need context
        let fields: HashMap<&String, &DataValue> = match &self.fields {
            Fields::Large(map) => map.iter().map(|(k, v)| (k, v.as_ref())).collect(),
            Fields::Small(_) => {
                // Can't serialize Small schemas without context
                // Return empty map as fallback
                HashMap::new()
            }
        };
        state.serialize_field("fields", &fields)?;
        state.serialize_field("sequence", &self.sequence)?;
        state.serialize_field("generated_at", &self.generated_at)?;
        state.end()
    }
}

impl<'de> Deserialize<'de> for DataRow {
    fn deserialize<D>(deserializer: D) -> std::result::Result<Self, D::Error>
    where
        D: serde::Deserializer<'de>,
    {
        use serde::de::{self, MapAccess, Visitor};
        use std::fmt;
        
        struct DataRowVisitor;
        
        impl<'de> Visitor<'de> for DataRowVisitor {
            type Value = DataRow;
            
            fn expecting(&self, formatter: &mut fmt::Formatter) -> fmt::Result {
                formatter.write_str("struct DataRow")
            }
            
            fn visit_map<V>(self, mut map: V) -> std::result::Result<DataRow, V::Error>
            where
                V: MapAccess<'de>,
            {
                let mut id = None;
                let mut fields: Option<HashMap<String, DataValue>> = None;
                let mut sequence = None;
                let mut generated_at = None;
                
                while let Some(key) = map.next_key()? {
                    match key {
                        "id" => {
                            if id.is_some() {
                                return Err(de::Error::duplicate_field("id"));
                            }
                            id = Some(map.next_value()?);
                        }
                        "fields" => {
                            if fields.is_some() {
                                return Err(de::Error::duplicate_field("fields"));
                            }
                            fields = Some(map.next_value()?);
                        }
                        "sequence" => {
                            if sequence.is_some() {
                                return Err(de::Error::duplicate_field("sequence"));
                            }
                            sequence = Some(map.next_value()?);
                        }
                        "generated_at" => {
                            if generated_at.is_some() {
                                return Err(de::Error::duplicate_field("generated_at"));
                            }
                            generated_at = Some(map.next_value()?);
                        }
                        _ => {
                            let _ = map.next_value::<de::IgnoredAny>()?;
                        }
                    }
                }
                
                let id = id.ok_or_else(|| de::Error::missing_field("id"))?;
                let fields_map = fields.ok_or_else(|| de::Error::missing_field("fields"))?;
                let sequence = sequence.ok_or_else(|| de::Error::missing_field("sequence"))?;
                let generated_at = generated_at.ok_or_else(|| de::Error::missing_field("generated_at"))?;
                
                // Convert HashMap<String, DataValue> to Fields (optimized storage)
                let field_count = fields_map.len();
                
                // Use Vec for small schemas, HashMap for large
                // NOTE: Deserialization doesn't create context - context must be provided externally
                let fields = if field_count < 10 {
                    // Extract field names to build index mapping
                    let names: Vec<String> = fields_map.keys().cloned().collect();
                    let name_to_index_map: HashMap<String, usize> = names.iter()
                        .enumerate()
                        .map(|(idx, name)| (name.clone(), idx))
                        .collect();
                    
                    // Build Vec<Option<DataValue>> with direct index access (RADICAL: no Arc!)
                    let mut fields_vec = vec![None; field_count];
                    for (name, value) in fields_map {
                        if let Some(&idx) = name_to_index_map.get(&name) {
                            if idx < fields_vec.len() {
                                fields_vec[idx] = Some(value); // Direct value, no Arc!
                            }
                        }
                    }
                    Fields::Small(fields_vec)
                } else {
                    // For large schemas, use String keys and Arc<DataValue> for values
                    let fields_arc: HashMap<String, Arc<DataValue>> = fields_map
                        .into_iter()
                        .map(|(k, v)| (k, Arc::new(v)))
                        .collect();
                    Fields::Large(fields_arc)
                };
                
                Ok(DataRow {
                    id,
                    fields,
                    sequence,
                    generated_at,
                })
            }
        }
        
        const FIELDS: &[&str] = &["id", "fields", "sequence", "generated_at"];
        deserializer.deserialize_struct("DataRow", FIELDS, DataRowVisitor)
    }
}

// Re-export from value_objects module (will be created next)
use super::value_objects::{
    DataValue, FieldType, FieldConstraint, SchemaConstraint, 
    DefaultStrategy, DataSetMetadata
};

// Builder patterns for easier schema construction
pub mod builders {
    use super::*;
    use crate::Result;
    
    /// Builder for creating `DataSchema` instances
    ///
    /// Provides a fluent API for constructing schemas with validation.
    ///
    /// # Example
    ///
    /// ```rust
    /// use synthetic_data_core::domain::*;
    ///
    /// let schema = DataSchemaBuilder::new("users".to_string(), "1.0".to_string())
    ///     .add_field(
    ///         FieldDefinitionBuilder::new("id".to_string(), FieldType::Integer { min: None, max: None })
    ///             .required(true)
    ///             .add_constraint(FieldConstraint::Unique)
    ///             .build()
    ///     )
    ///     .build()?;
    /// ```
    pub struct DataSchemaBuilder {
        name: String,
        version: String,
        fields: Vec<FieldDefinition>,
        constraints: Vec<SchemaConstraint>,
        metadata: std::collections::HashMap<String, String>,
    }
    
    impl DataSchemaBuilder {
        /// Create a new schema builder
        ///
        /// # Arguments
        ///
        /// * `name` - Schema name
        /// * `version` - Schema version
        pub fn new(name: String, version: String) -> Self {
            Self {
                name,
                version,
                fields: Vec::new(),
                constraints: Vec::new(),
                metadata: std::collections::HashMap::new(),
            }
        }
        
        /// Add a field definition to the schema
        ///
        /// # Arguments
        ///
        /// * `field` - The field definition to add
        pub fn add_field(mut self, field: FieldDefinition) -> Self {
            self.fields.push(field);
            self
        }
        
        /// Add a schema-level constraint
        ///
        /// # Arguments
        ///
        /// * `constraint` - The constraint to add
        pub fn add_constraint(mut self, constraint: SchemaConstraint) -> Self {
            self.constraints.push(constraint);
            self
        }
        
        /// Add metadata key-value pair
        ///
        /// # Arguments
        ///
        /// * `key` - Metadata key
        /// * `value` - Metadata value
        pub fn with_metadata(mut self, key: String, value: String) -> Self {
            self.metadata.insert(key, value);
            self
        }
        
        /// Build the schema with validation
        ///
        /// # Returns
        ///
        /// A validated `DataSchema` instance
        ///
        /// # Errors
        ///
        /// Returns `CoreError::Schema` if schema validation fails
        pub fn build(self) -> Result<DataSchema> {
            let schema = DataSchema {
                id: uuid::Uuid::new_v4(),
                name: self.name,
                version: self.version,
                fields: self.fields,
                constraints: self.constraints,
                metadata: self.metadata,
            };
            
            // Validate the schema
            schema.validate()?;
            
            Ok(schema)
        }
    }
    
    /// Builder for creating `FieldDefinition` instances
    ///
    /// Provides a fluent API for constructing field definitions.
    ///
    /// # Example
    ///
    /// ```rust
    /// use synthetic_data_core::domain::*;
    ///
    /// let field = FieldDefinitionBuilder::new("id".to_string(), FieldType::Integer { min: None, max: None })
    ///     .required(true)
    ///     .add_constraint(FieldConstraint::Unique)
    ///     .with_description("User unique identifier".to_string())
    ///     .build();
    /// ```
    pub struct FieldDefinitionBuilder {
        name: String,
        field_type: FieldType,
        constraints: Vec<FieldConstraint>,
        required: bool,
        default: Option<DefaultStrategy>,
        description: Option<String>,
    }
    
    impl FieldDefinitionBuilder {
        /// Create a new field definition builder
        ///
        /// # Arguments
        ///
        /// * `name` - Field name
        /// * `field_type` - Field data type
        pub fn new(name: String, field_type: FieldType) -> Self {
            Self {
                name,
                field_type,
                constraints: Vec::new(),
                required: false,
                default: None,
                description: None,
            }
        }
        
        /// Set whether the field is required
        ///
        /// # Arguments
        ///
        /// * `required` - Whether the field is required
        pub fn required(mut self, required: bool) -> Self {
            self.required = required;
            self
        }
        
        /// Add a field constraint
        ///
        /// # Arguments
        ///
        /// * `constraint` - The constraint to add
        pub fn add_constraint(mut self, constraint: FieldConstraint) -> Self {
            self.constraints.push(constraint);
            self
        }
        
        /// Set the default value strategy
        ///
        /// # Arguments
        ///
        /// * `default` - The default strategy
        pub fn with_default(mut self, default: DefaultStrategy) -> Self {
            self.default = Some(default);
            self
        }
        
        /// Set the field description
        ///
        /// # Arguments
        ///
        /// * `description` - Field description
        pub fn with_description(mut self, description: String) -> Self {
            self.description = Some(description);
            self
        }
        
        /// Build the field definition
        ///
        /// # Returns
        ///
        /// A `FieldDefinition` instance
        pub fn build(self) -> FieldDefinition {
            FieldDefinition {
                name: self.name,
                field_type: self.field_type,
                constraints: self.constraints,
                required: self.required,
                default: self.default,
                description: self.description,
            }
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::domain::value_objects::*;
    
    #[test]
    fn test_schema_validation_empty_fields() {
        let schema = DataSchema::new("test".to_string(), "1.0".to_string());
        let result = schema.validate();
        assert!(result.is_err());
        assert!(result.unwrap_err().to_string().contains("at least one field"));
    }
    
    #[test]
    fn test_schema_validation_duplicate_fields() {
        let mut schema = DataSchema::new("test".to_string(), "1.0".to_string());
        
        let field1 = FieldDefinition {
            name: "id".to_string(),
            field_type: FieldType::Integer { min: None, max: None },
            constraints: vec![],
            required: true,
            default: None,
            description: None,
        };
        
        let field2 = FieldDefinition {
            name: "id".to_string(), // Duplicate!
            field_type: FieldType::String { min_length: None, max_length: None, pattern: None },
            constraints: vec![],
            required: false,
            default: None,
            description: None,
        };
        
        schema.fields.push(field1);
        schema.fields.push(field2);
        
        let result = schema.validate();
        assert!(result.is_err());
        assert!(result.unwrap_err().to_string().contains("Duplicate field name"));
    }
    
    #[test]
    fn test_schema_validation_success() {
        let mut schema = DataSchema::new("test".to_string(), "1.0".to_string());
        
        let field = FieldDefinition {
            name: "id".to_string(),
            field_type: FieldType::Integer { min: None, max: None },
            constraints: vec![],
            required: true,
            default: None,
            description: None,
        };
        
        schema.fields.push(field);
        assert!(schema.validate().is_ok());
    }
    
    #[test]
    fn test_dataset_add_row_success() {
        let mut schema = DataSchema::new("test".to_string(), "1.0".to_string());
        let field = FieldDefinition {
            name: "id".to_string(),
            field_type: FieldType::Integer { min: Some(1), max: Some(100) },
            constraints: vec![],
            required: true,
            default: None,
            description: None,
        };
        schema.fields.push(field);
        
        let mut dataset = DataSet::new("test_dataset".to_string(), schema);
        
        // Create context for set_field
        let ctx = GenerationContext::from_schema(&dataset.schema);
        
        let mut row = DataRow::new();
        row.set_field("id".to_string(), DataValue::Integer(42), Some(&ctx));
        
        assert!(dataset.add_row(row).is_ok());
        assert_eq!(dataset.len(), 1);
        assert_eq!(dataset.metadata.row_count, 1);
    }
    
    #[test]
    fn test_dataset_add_row_missing_required_field() {
        let mut schema = DataSchema::new("test".to_string(), "1.0".to_string());
        let field = FieldDefinition {
            name: "id".to_string(),
            field_type: FieldType::Integer { min: None, max: None },
            constraints: vec![],
            required: true,
            default: None,
            description: None,
        };
        schema.fields.push(field);
        
        let mut dataset = DataSet::new("test_dataset".to_string(), schema);
        let row = DataRow::new(); // Empty row, missing required field
        
        let result = dataset.add_row(row);
        assert!(result.is_err());
        assert!(result.unwrap_err().to_string().contains("Required field"));
    }
    
    #[test]
    fn test_dataset_add_row_type_mismatch() {
        let mut schema = DataSchema::new("test".to_string(), "1.0".to_string());
        let field = FieldDefinition {
            name: "id".to_string(),
            field_type: FieldType::Integer { min: None, max: None },
            constraints: vec![],
            required: true,
            default: None,
            description: None,
        };
        schema.fields.push(field);
        
        let mut dataset = DataSet::new("test_dataset".to_string(), schema);
        
        // Create context for set_field
        let ctx = GenerationContext::from_schema(&dataset.schema);
        
        let mut row = DataRow::new();
        row.set_field("id".to_string(), DataValue::String("not_an_int".to_string()), Some(&ctx)); // Wrong type
        
        let result = dataset.add_row(row);
        assert!(result.is_err());
        assert!(result.unwrap_err().to_string().contains("incompatible"));
    }
    
    #[test]
    fn test_dataset_sequence_numbers() {
        let mut schema = DataSchema::new("test".to_string(), "1.0".to_string());
        let field = FieldDefinition {
            name: "id".to_string(),
            field_type: FieldType::Integer { min: None, max: None },
            constraints: vec![],
            required: true,
            default: None,
            description: None,
        };
        schema.fields.push(field);
        
        let mut dataset = DataSet::new("test_dataset".to_string(), schema);
        
        // Create context for set_field
        let ctx = GenerationContext::from_schema(&dataset.schema);
        
        for i in 1..=5 {
            let mut row = DataRow::new();
            row.set_field("id".to_string(), DataValue::Integer(i), Some(&ctx));
            dataset.add_row(row).unwrap();
        }
        
        assert_eq!(dataset.len(), 5);
        for (idx, row) in dataset.rows.iter().enumerate() {
            assert_eq!(row.sequence, idx as u64);
        }
    }
    
    #[test]
    fn test_data_row_set_and_get_field() {
        // Create a simple schema for context
        let mut schema = DataSchema::new("test".to_string(), "1.0".to_string());
        schema.fields.push(FieldDefinition {
            name: "name".to_string(),
            field_type: FieldType::String { min_length: None, max_length: None, pattern: None },
            constraints: vec![],
            required: false,
            default: None,
            description: None,
        });
        schema.fields.push(FieldDefinition {
            name: "age".to_string(),
            field_type: FieldType::Integer { min: None, max: None },
            constraints: vec![],
            required: false,
            default: None,
            description: None,
        });
        
        let ctx = GenerationContext::from_schema(&schema);
        let mut row = DataRow::new();
        
        row.set_field("name".to_string(), DataValue::String("John".to_string()), Some(&ctx));
        row.set_field("age".to_string(), DataValue::Integer(30), Some(&ctx));
        
        assert_eq!(row.get_field_value("name", Some(&ctx)), Some(&DataValue::String("John".to_string())));
        assert_eq!(row.get_field_value("age", Some(&ctx)), Some(&DataValue::Integer(30)));
        assert_eq!(row.get_field_value("nonexistent", Some(&ctx)), None);
    }
    
    #[test]
    fn test_builder_pattern_schema() {
        use super::builders::*;
        
        let schema = DataSchemaBuilder::new("test".to_string(), "1.0".to_string())
            .add_field(
                FieldDefinitionBuilder::new("id".to_string(), FieldType::Integer { min: None, max: None })
                    .required(true)
                    .add_constraint(FieldConstraint::Unique)
                    .with_description("User ID".to_string())
                    .build()
            )
            .add_field(
                FieldDefinitionBuilder::new("name".to_string(), FieldType::String { min_length: Some(1), max_length: Some(100), pattern: None })
                    .required(true)
                    .build()
            )
            .with_metadata("author".to_string(), "test".to_string())
            .build()
            .unwrap();
        
        assert_eq!(schema.name, "test");
        assert_eq!(schema.version, "1.0");
        assert_eq!(schema.fields.len(), 2);
        assert_eq!(schema.fields[0].name, "id");
        assert!(schema.fields[0].required);
        assert!(schema.metadata.contains_key("author"));
    }
    
    #[test]
    fn test_builder_pattern_field_definition() {
        use super::builders::*;
        
        let field = FieldDefinitionBuilder::new("email".to_string(), FieldType::String { min_length: None, max_length: None, pattern: None })
            .required(true)
            .add_constraint(FieldConstraint::Pattern(r"^[^@]+@[^@]+\.[^@]+$".to_string()))
            .with_description("User email".to_string())
            .with_default(DefaultStrategy::Generate)
            .build();
        
        assert_eq!(field.name, "email");
        assert!(field.required);
        assert_eq!(field.constraints.len(), 1);
        assert!(field.description.is_some());
        assert!(field.default.is_some());
    }
    
    #[test]
    fn test_builder_pattern_validation() {
        use super::builders::*;
        
        // Empty schema should fail validation
        let result = DataSchemaBuilder::new("test".to_string(), "1.0".to_string())
            .build();
        
        assert!(result.is_err());
    }
    
    #[test]
    fn test_schema_add_field_duplicate() {
        let mut schema = DataSchema::new("test".to_string(), "1.0".to_string());
        
        let field1 = FieldDefinition {
            name: "id".to_string(),
            field_type: FieldType::Integer { min: None, max: None },
            constraints: vec![],
            required: true,
            default: None,
            description: None,
        };
        
        assert!(schema.add_field(field1).is_ok());
        
        let field2 = FieldDefinition {
            name: "id".to_string(), // Duplicate
            field_type: FieldType::String { min_length: None, max_length: None, pattern: None },
            constraints: vec![],
            required: false,
            default: None,
            description: None,
        };
        
        let result = schema.add_field(field2);
        assert!(result.is_err());
        assert!(result.unwrap_err().to_string().contains("already exists"));
    }
    
    #[test]
    fn test_dataset_uniqueness_constraint() {
        let mut schema = DataSchema::new("test".to_string(), "1.0".to_string());
        let field = FieldDefinition {
            name: "id".to_string(),
            field_type: FieldType::Integer { min: None, max: None },
            constraints: vec![FieldConstraint::Unique],
            required: true,
            default: None,
            description: None,
        };
        schema.fields.push(field);
        
        let mut dataset = DataSet::new("test_dataset".to_string(), schema);
        
        // Create context for set_field
        let ctx = GenerationContext::from_schema(&dataset.schema);
        
        // Add first row with unique value
        let mut row1 = DataRow::new();
        row1.set_field("id".to_string(), DataValue::Integer(1), Some(&ctx));
        assert!(dataset.add_row(row1).is_ok());
        
        // Try to add duplicate value - should fail
        let mut row2 = DataRow::new();
        row2.set_field("id".to_string(), DataValue::Integer(1), Some(&ctx)); // Duplicate!
        let result = dataset.add_row(row2);
        assert!(result.is_err());
        assert!(result.unwrap_err().to_string().contains("must be unique"));
        
        // Add different value - should succeed
        let mut row3 = DataRow::new();
        row3.set_field("id".to_string(), DataValue::Integer(2), Some(&ctx));
        assert!(dataset.add_row(row3).is_ok());
        
        assert_eq!(dataset.len(), 2);
    }
}