//! Domain entities - business objects with identity and lifecycle
//!
//! Entities represent core business concepts with unique identity.
//! They contain business logic and maintain invariants.

use crate::{CoreError, Result};
use serde::{Deserialize, Serialize};
use uuid::Uuid;
use chrono::{DateTime, Utc};
use std::collections::HashMap;

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
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DataRow {
    /// Unique identifier for this row
    pub id: Uuid,
    
    /// Field values in this row
    pub fields: HashMap<String, DataValue>,
    
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
        // Check all required fields are present
        for field_def in &self.schema.fields {
            if field_def.required && !row.fields.contains_key(&field_def.name) {
                return Err(CoreError::Validation {
                    message: format!("Required field '{}' is missing", field_def.name),
                });
            }
        }
        
        // Validate field types and constraints
        for (field_name, value) in &row.fields {
            if let Some(field_def) = self.schema.fields.iter().find(|f| f.name == *field_name) {
                self.validate_field_value(field_def, value)?;
                
                // Check uniqueness constraint at dataset level
                if field_def.constraints.iter().any(|c| matches!(c, FieldConstraint::Unique)) {
                    self.validate_uniqueness(field_name, value)?;
                }
            }
        }
        
        Ok(())
    }
    
    /// Validate uniqueness of a field value across the dataset
    fn validate_uniqueness(&self, field_name: &str, value: &DataValue) -> Result<()> {
        for (idx, existing_row) in self.rows.iter().enumerate() {
            if let Some(existing_value) = existing_row.get_field(field_name) {
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

impl DataRow {
    /// Create a new empty data row
    pub fn new() -> Self {
        Self {
            id: Uuid::new_v4(),
            fields: HashMap::new(),
            sequence: 0,
            generated_at: Utc::now(),
        }
    }
    
    /// Set a field value
    pub fn set_field(&mut self, name: String, value: DataValue) {
        self.fields.insert(name, value);
    }
    
    /// Get a field value
    pub fn get_field(&self, name: &str) -> Option<&DataValue> {
        self.fields.get(name)
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
        
        let mut row = DataRow::new();
        row.set_field("id".to_string(), DataValue::Integer(42));
        
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
        
        let mut row = DataRow::new();
        row.set_field("id".to_string(), DataValue::String("not_an_int".to_string())); // Wrong type
        
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
        
        for i in 1..=5 {
            let mut row = DataRow::new();
            row.set_field("id".to_string(), DataValue::Integer(i));
            dataset.add_row(row).unwrap();
        }
        
        assert_eq!(dataset.len(), 5);
        for (idx, row) in dataset.rows.iter().enumerate() {
            assert_eq!(row.sequence, idx as u64);
        }
    }
    
    #[test]
    fn test_data_row_set_and_get_field() {
        let mut row = DataRow::new();
        
        row.set_field("name".to_string(), DataValue::String("John".to_string()));
        row.set_field("age".to_string(), DataValue::Integer(30));
        
        assert_eq!(row.get_field("name"), Some(&DataValue::String("John".to_string())));
        assert_eq!(row.get_field("age"), Some(&DataValue::Integer(30)));
        assert_eq!(row.get_field("nonexistent"), None);
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
        
        // Add first row with unique value
        let mut row1 = DataRow::new();
        row1.set_field("id".to_string(), DataValue::Integer(1));
        assert!(dataset.add_row(row1).is_ok());
        
        // Try to add duplicate value - should fail
        let mut row2 = DataRow::new();
        row2.set_field("id".to_string(), DataValue::Integer(1)); // Duplicate!
        let result = dataset.add_row(row2);
        assert!(result.is_err());
        assert!(result.unwrap_err().to_string().contains("must be unique"));
        
        // Add different value - should succeed
        let mut row3 = DataRow::new();
        row3.set_field("id".to_string(), DataValue::Integer(2));
        assert!(dataset.add_row(row3).is_ok());
        
        assert_eq!(dataset.len(), 2);
    }
}