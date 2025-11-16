//! Domain value objects - immutable objects representing concepts
//!
//! Value objects are immutable and defined by their attributes rather than identity.
//! They encapsulate business rules and provide type safety.

use crate::{CoreError, Result};
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::hash::{Hash, Hasher};
use chrono::{DateTime, Utc};
use regex;

/// Core data value type that can hold any supported data type
/// 
/// **ULTRA-OPTIMIZED**: Variants ordered by frequency for better branch prediction
/// String (most common) first, then primitives (fast copy), then complex types
#[derive(Debug, PartialEq, Serialize, Deserialize)]
pub enum DataValue {
    /// String values (MOST COMMON - placed first for better cache locality)
    String(String),
    
    /// Integer values (64-bit signed) - Copy type, very fast
    Integer(i64),
    
    /// Floating-point values (64-bit) - Copy type, very fast
    Float(f64),
    
    /// Boolean values - Copy type, very fast
    Boolean(bool),
    
    /// Null/empty values - Zero-sized, very fast
    Null,
    
    /// Date and time values
    DateTime(DateTime<Utc>),
    
    /// UUID values
    Uuid(uuid::Uuid),
    
    /// JSON object values (rare, placed last)
    Json(serde_json::Value),
    
    /// Array of values (rare, placed last)
    Array(Vec<DataValue>),
    
    /// Object/map of values (rare, placed last)
    Object(HashMap<String, DataValue>),
}

// ULTRA-OPTIMIZED: Custom Clone implementation optimized for hot paths
// For strings (most common), uses optimized String::clone() which is already fast
// For copy types (Integer, Float, Boolean), uses memcpy which is extremely fast
impl Clone for DataValue {
    #[inline]
    fn clone(&self) -> Self {
        match self {
            // String is the most common case - Rust's String::clone() is already highly optimized
            // It uses memcpy for the string data, which is very fast for small strings
            DataValue::String(s) => DataValue::String(s.clone()),
            
            // Copy types - extremely fast (just memcpy of 8 bytes)
            DataValue::Integer(i) => DataValue::Integer(*i),
            DataValue::Float(f) => DataValue::Float(*f),
            DataValue::Boolean(b) => DataValue::Boolean(*b),
            
            // Zero-sized - no cost
            DataValue::Null => DataValue::Null,
            
            // Other types - use derive behavior (already optimized)
            DataValue::DateTime(dt) => DataValue::DateTime(*dt),
            DataValue::Uuid(u) => DataValue::Uuid(*u),
            DataValue::Json(j) => DataValue::Json(j.clone()),
            DataValue::Array(arr) => DataValue::Array(arr.clone()),
            DataValue::Object(obj) => DataValue::Object(obj.clone()),
        }
    }
}

// Manual implementation of Eq and Hash for DataValue
impl Eq for DataValue {}

impl Hash for DataValue {
    fn hash<H: Hasher>(&self, state: &mut H) {
        std::mem::discriminant(self).hash(state);
        match self {
            DataValue::Null => {}
            DataValue::Boolean(b) => b.hash(state),
            DataValue::Integer(i) => i.hash(state),
            DataValue::Float(f) => {
                // Convert float to integer bits for hashing
                f.to_bits().hash(state);
            }
            DataValue::String(s) => s.hash(state),
            DataValue::DateTime(dt) => dt.hash(state),
            DataValue::Uuid(u) => u.hash(state),
            DataValue::Json(j) => {
                // Hash JSON as string representation
                j.to_string().hash(state);
            }
            DataValue::Array(arr) => arr.hash(state),
            DataValue::Object(obj) => {
                // Hash object as a sorted vector of key-value pairs
                let mut pairs: Vec<_> = obj.iter().collect();
                pairs.sort_by_key(|(k, _)| *k);
                pairs.hash(state);
            }
        }
    }
}

/// FieldType defines how a field should be generated
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum FieldType {
    /// String generation with options
    String {
        /// Minimum length
        min_length: Option<usize>,
        /// Maximum length
        max_length: Option<usize>,
        /// Pattern/format (regex, template, etc.)
        pattern: Option<StringPattern>,
    },
    
    /// Integer generation with range
    Integer {
        /// Minimum value (inclusive)
        min: Option<i64>,
        /// Maximum value (inclusive)  
        max: Option<i64>,
    },
    
    /// Floating-point generation
    Float {
        /// Minimum value (inclusive)
        min: Option<f64>,
        /// Maximum value (inclusive)
        max: Option<f64>,
        /// Decimal precision
        precision: Option<u32>,
    },
    
    /// Boolean generation with probability
    Boolean {
        /// Probability of true (0.0 to 1.0)
        true_probability: Option<f64>,
    },
    
    /// DateTime generation with range
    DateTime {
        /// Start date/time
        start: Option<DateTime<Utc>>,
        /// End date/time
        end: Option<DateTime<Utc>>,
        /// Format string
        format: Option<String>,
    },
    
    /// UUID generation (v4 by default)
    Uuid {
        /// UUID version (4 = random, 1 = time-based)
        version: UuidVersion,
    },
    
    /// JSON object generation
    Json {
        /// Schema for the JSON structure
        schema: Option<JsonSchema>,
    },
    
    /// Array generation
    Array {
        /// Element type
        element_type: Box<FieldType>,
        /// Minimum array length
        min_length: Option<usize>,
        /// Maximum array length
        max_length: Option<usize>,
    },
    
    /// Object/map generation
    Object {
        /// Field definitions for the object
        fields: Vec<ObjectField>,
    },
    
    /// Reference to another field's value
    Reference {
        /// Target field name
        field_name: String,
        /// Optional transformation
        transform: Option<ValueTransform>,
    },
}

/// String generation patterns
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum StringPattern {
    /// Regular expression pattern
    Regex(String),
    
    /// Template with placeholders
    Template(String),
    
    /// Choose from predefined values
    Enum(Vec<String>),
    
    /// Generate names (first, last, full)
    Name(NameType),
    
    /// Generate addresses
    Address(AddressType),
    
    /// Generate email addresses
    Email,
    
    /// Generate phone numbers
    Phone(PhoneFormat),
    
    /// Generate usernames (realistic username patterns)
    Username,
    
    /// Custom generator name
    Custom(String),
}

/// UUID version options
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum UuidVersion {
    /// Random UUID (v4) - default variant
    Random,
    /// Time-based UUID (v1)  
    TimeBased,
}

impl Default for UuidVersion {
    fn default() -> Self {
        UuidVersion::Random
    }
}

/// JSON schema for complex JSON generation
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct JsonSchema {
    /// JSON schema definition (simplified)
    pub schema: serde_json::Value,
}

/// Object field definition
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ObjectField {
    /// Field name
    pub name: String,
    /// Field type
    pub field_type: FieldType,
    /// Whether field is required
    pub required: bool,
}

/// Name generation types
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum NameType {
    First,
    Last,
    Full,
}

/// Address generation types
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum AddressType {
    Street,
    City,
    State,
    Country,
    ZipCode,
    Full,
}

/// Phone number formats
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum PhoneFormat {
    US,
    International,
    Custom(String),
}

/// Value transformation functions
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum ValueTransform {
    /// Convert to uppercase
    ToUppercase,
    /// Convert to lowercase
    ToLowercase,
    /// Add prefix
    AddPrefix(String),
    /// Add suffix
    AddSuffix(String),
    /// Mathematical operations for numbers
    Math(MathOperation),
}

/// Mathematical operations
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum MathOperation {
    Add(f64),
    Subtract(f64),
    Multiply(f64),
    Divide(f64),
}

/// Field-level constraints
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum FieldConstraint {
    /// Value must be unique within the dataset
    Unique,
    
    /// Value must not be null/empty
    NotNull,
    
    /// String length constraints
    Length { min: Option<usize>, max: Option<usize> },
    
    /// Numeric range constraints
    Range { min: Option<f64>, max: Option<f64> },
    
    /// Value must match regex pattern
    Pattern(String),
    
    /// Value must be in enumerated list
    Enum(Vec<DataValue>),
    
    /// Custom validation function name
    Custom(String),
}

/// Schema-level constraints
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum SchemaConstraint {
    /// Foreign key relationship
    ForeignKey {
        field: String,
        reference_schema: String,
        reference_field: String,
    },
    
    /// Composite uniqueness constraint
    Unique { fields: Vec<String> },
    
    /// Conditional constraint
    Conditional {
        condition: String,
        constraint: Box<SchemaConstraint>,
    },
}

/// Default value strategies
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum DefaultStrategy {
    /// Static value
    Static(DataValue),
    
    /// Generate using field type rules
    Generate,
    
    /// Use current timestamp
    CurrentTimestamp,
    
    /// Use incremental counter
    Counter { start: i64, step: i64 },
    
    /// Use value from another field
    FieldReference(String),
}

/// Dataset metadata
#[derive(Debug, Clone, Serialize, Deserialize, Default)]
pub struct DataSetMetadata {
    /// Total number of rows
    pub row_count: usize,
    
    /// Generation statistics
    pub generation_stats: GenerationStats,
    
    /// Data quality metrics
    pub quality_metrics: QualityMetrics,
    
    /// Custom metadata
    pub custom: HashMap<String, String>,
}

/// Generation performance statistics
#[derive(Debug, Clone, Serialize, Deserialize, Default)]
pub struct GenerationStats {
    /// Total generation time in milliseconds
    pub generation_time_ms: u64,
    
    /// Rows per second throughput
    pub rows_per_second: f64,
    
    /// Memory usage in bytes
    pub memory_usage_bytes: u64,
    
    /// Number of generator threads used
    pub thread_count: u32,
}

/// Data quality metrics
#[derive(Debug, Clone, Serialize, Deserialize, Default)]
pub struct QualityMetrics {
    /// Percentage of null values
    pub null_percentage: f64,
    
    /// Number of unique values
    pub unique_count: HashMap<String, usize>,
    
    /// Number of constraint violations
    pub constraint_violations: u32,
    
    /// Data distribution metrics
    pub distributions: HashMap<String, DistributionStats>,
}

/// Statistical distribution information
#[derive(Debug, Clone, Serialize, Deserialize, Default)]
pub struct DistributionStats {
    /// Mean value (for numeric fields)
    pub mean: Option<f64>,
    
    /// Standard deviation
    pub std_dev: Option<f64>,
    
    /// Minimum value
    pub min: Option<DataValue>,
    
    /// Maximum value
    pub max: Option<DataValue>,
    
    /// Most common values
    pub mode: Vec<DataValue>,
}

impl DataValue {
    /// Get the type name of this value
    pub fn type_name(&self) -> &'static str {
        match self {
            DataValue::String(_) => "string",
            DataValue::Integer(_) => "integer",
            DataValue::Float(_) => "float",
            DataValue::Boolean(_) => "boolean",
            DataValue::DateTime(_) => "datetime",
            DataValue::Uuid(_) => "uuid",
            DataValue::Json(_) => "json",
            DataValue::Null => "null",
            DataValue::Array(_) => "array",
            DataValue::Object(_) => "object",
        }
    }
    
    /// Check if this value is null
    pub fn is_null(&self) -> bool {
        matches!(self, DataValue::Null)
    }
    
    /// Convert to string representation
    pub fn to_string_value(&self) -> String {
        match self {
            DataValue::String(s) => s.clone(),
            DataValue::Integer(i) => i.to_string(),
            DataValue::Float(f) => f.to_string(),
            DataValue::Boolean(b) => b.to_string(),
            DataValue::DateTime(dt) => dt.to_rfc3339(),
            DataValue::Uuid(uuid) => uuid.to_string(),
            DataValue::Json(json) => json.to_string(),
            DataValue::Null => "null".to_string(),
            DataValue::Array(arr) => format!("{:?}", arr),
            DataValue::Object(obj) => format!("{:?}", obj),
        }
    }
}

impl FieldType {
    /// Check if a DataValue is compatible with this field type
    pub fn is_compatible_with(&self, value: &DataValue) -> bool {
        match (self, value) {
            (FieldType::String { .. }, DataValue::String(_)) => true,
            (FieldType::Integer { .. }, DataValue::Integer(_)) => true,
            (FieldType::Float { .. }, DataValue::Float(_)) => true,
            (FieldType::Boolean { .. }, DataValue::Boolean(_)) => true,
            (FieldType::DateTime { .. }, DataValue::DateTime(_)) => true,
            (FieldType::Uuid { .. }, DataValue::Uuid(_)) => true,
            (FieldType::Json { .. }, DataValue::Json(_)) => true,
            (FieldType::Array { .. }, DataValue::Array(_)) => true,
            (FieldType::Object { .. }, DataValue::Object(_)) => true,
            (_, DataValue::Null) => true, // Null is compatible with all types
            _ => false,
        }
    }
    
    /// Get the default value for this field type
    pub fn default_value(&self) -> DataValue {
        match self {
            FieldType::String { .. } => DataValue::String(String::new()),
            FieldType::Integer { .. } => DataValue::Integer(0),
            FieldType::Float { .. } => DataValue::Float(0.0),
            FieldType::Boolean { .. } => DataValue::Boolean(false),
            FieldType::DateTime { .. } => DataValue::DateTime(Utc::now()),
            FieldType::Uuid { .. } => DataValue::Uuid(uuid::Uuid::new_v4()),
            FieldType::Json { .. } => DataValue::Json(serde_json::Value::Null),
            FieldType::Array { .. } => DataValue::Array(Vec::new()),
            FieldType::Object { .. } => DataValue::Object(HashMap::new()),
            FieldType::Reference { .. } => DataValue::Null,
        }
    }
}

impl FieldConstraint {
    /// Validate a value against this constraint
    pub fn validate(&self, value: &DataValue) -> Result<()> {
        match self {
            FieldConstraint::NotNull => {
                if value.is_null() {
                    return Err(CoreError::Validation {
                        message: "Field cannot be null".to_string(),
                    });
                }
            }
            FieldConstraint::Length { min, max } => {
                if let DataValue::String(s) = value {
                    let len = s.len();
                    if let Some(min_len) = min {
                        if len < *min_len {
                            return Err(CoreError::Validation {
                                message: format!("String length {} is less than minimum {}", len, min_len),
                            });
                        }
                    }
                    if let Some(max_len) = max {
                        if len > *max_len {
                            return Err(CoreError::Validation {
                                message: format!("String length {} exceeds maximum {}", len, max_len),
                            });
                        }
                    }
                }
            }
            FieldConstraint::Range { min, max } => {
                let num_value = match value {
                    DataValue::Integer(i) => Some(*i as f64),
                    DataValue::Float(f) => Some(*f),
                    _ => None,
                };
                
                if let Some(num) = num_value {
                    if let Some(min_val) = min {
                        if num < *min_val {
                            return Err(CoreError::Validation {
                                message: format!("Value {} is less than minimum {}", num, min_val),
                            });
                        }
                    }
                    if let Some(max_val) = max {
                        if num > *max_val {
                            return Err(CoreError::Validation {
                                message: format!("Value {} exceeds maximum {}", num, max_val),
                            });
                        }
                    }
                }
            }
            FieldConstraint::Pattern(pattern) => {
                if let DataValue::String(s) = value {
                    // Use regex crate for pattern validation
                    let re = regex::Regex::new(pattern)
                        .map_err(|e| CoreError::Validation {
                            message: format!("Invalid regex pattern '{}': {}", pattern, e),
                        })?;
                    
                    if !re.is_match(s) {
                        return Err(CoreError::Validation {
                            message: format!("Value '{}' does not match pattern '{}'", s, pattern),
                        });
                    }
                } else {
                    return Err(CoreError::Validation {
                        message: "Pattern constraint can only be applied to string values".to_string(),
                    });
                }
            }
            FieldConstraint::Enum(allowed_values) => {
                if !allowed_values.contains(value) {
                    return Err(CoreError::Validation {
                        message: format!("Value {:?} is not in allowed enum values", value),
                    });
                }
            }
            FieldConstraint::Unique => {
                // Uniqueness validation is handled at the dataset level in DataSet::validate_row
                // This constraint is valid at the field level (no immediate error)
                // The actual uniqueness check happens when adding rows to the dataset
            }
            FieldConstraint::Custom(_) => {
                // Custom validation would be handled by the infrastructure layer
            }
        }
        
        Ok(())
    }
}

// Default implementation is derived - Random is the default variant

// Ordering implementation for DataValue
// Note: Comparing different types uses a type-based ordering which may not be semantically meaningful
// but allows DataValue to be used in ordered collections like BTreeMap
impl PartialOrd for DataValue {
    fn partial_cmp(&self, other: &Self) -> Option<std::cmp::Ordering> {
        Some(self.cmp(other))
    }
}

impl Ord for DataValue {
    fn cmp(&self, other: &Self) -> std::cmp::Ordering {
        // First compare by type order
        let self_type_order = type_order(self);
        let other_type_order = type_order(other);
        
        match self_type_order.cmp(&other_type_order) {
            std::cmp::Ordering::Equal => {
                // Same type - compare values
                match (self, other) {
                    (DataValue::Null, DataValue::Null) => std::cmp::Ordering::Equal,
                    (DataValue::Boolean(a), DataValue::Boolean(b)) => a.cmp(b),
                    (DataValue::Integer(a), DataValue::Integer(b)) => a.cmp(b),
                    (DataValue::Float(a), DataValue::Float(b)) => {
                        // Handle NaN and comparison
                        a.partial_cmp(b).unwrap_or_else(|| {
                            if a.is_nan() && b.is_nan() {
                                std::cmp::Ordering::Equal
                            } else if a.is_nan() {
                                std::cmp::Ordering::Greater
                            } else {
                                std::cmp::Ordering::Less
                            }
                        })
                    }
                    (DataValue::String(a), DataValue::String(b)) => a.cmp(b),
                    (DataValue::DateTime(a), DataValue::DateTime(b)) => a.cmp(b),
                    (DataValue::Uuid(a), DataValue::Uuid(b)) => a.as_bytes().cmp(b.as_bytes()),
                    (DataValue::Json(a), DataValue::Json(b)) => {
                        // Compare JSON by string representation
                        a.to_string().cmp(&b.to_string())
                    }
                    (DataValue::Array(a), DataValue::Array(b)) => {
                        // Compare arrays lexicographically
                        for (a_val, b_val) in a.iter().zip(b.iter()) {
                            match a_val.cmp(b_val) {
                                std::cmp::Ordering::Equal => continue,
                                other => return other,
                            }
                        }
                        a.len().cmp(&b.len())
                    }
                    (DataValue::Object(a), DataValue::Object(b)) => {
                        // Compare objects by sorted key-value pairs
                        let mut a_pairs: Vec<_> = a.iter().collect();
                        let mut b_pairs: Vec<_> = b.iter().collect();
                        a_pairs.sort_by_key(|(k, _)| *k);
                        b_pairs.sort_by_key(|(k, _)| *k);
                        
                        for ((a_key, a_val), (b_key, b_val)) in a_pairs.iter().zip(b_pairs.iter()) {
                            match a_key.cmp(b_key) {
                                std::cmp::Ordering::Equal => {
                                    match a_val.cmp(b_val) {
                                        std::cmp::Ordering::Equal => continue,
                                        other => return other,
                                    }
                                }
                                other => return other,
                            }
                        }
                        a.len().cmp(&b.len())
                    }
                    // This should never happen due to type_order check, but handle it anyway
                    _ => self_type_order.cmp(&other_type_order),
                }
            }
            other => other,
        }
    }
}

/// Get type order for comparison between different types
fn type_order(value: &DataValue) -> u8 {
    match value {
        DataValue::Null => 0,
        DataValue::Boolean(_) => 1,
        DataValue::Integer(_) => 2,
        DataValue::Float(_) => 3,
        DataValue::String(_) => 4,
        DataValue::DateTime(_) => 5,
        DataValue::Uuid(_) => 6,
        DataValue::Json(_) => 7,
        DataValue::Array(_) => 8,
        DataValue::Object(_) => 9,
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    
    #[test]
    fn test_field_constraint_not_null() {
        let constraint = FieldConstraint::NotNull;
        
        assert!(constraint.validate(&DataValue::Integer(42)).is_ok());
        assert!(constraint.validate(&DataValue::String("test".to_string())).is_ok());
        assert!(constraint.validate(&DataValue::Null).is_err());
    }
    
    #[test]
    fn test_field_constraint_length() {
        let constraint = FieldConstraint::Length {
            min: Some(3),
            max: Some(10),
        };
        
        // Valid lengths
        assert!(constraint.validate(&DataValue::String("abc".to_string())).is_ok());
        assert!(constraint.validate(&DataValue::String("abcdefghij".to_string())).is_ok());
        
        // Too short
        assert!(constraint.validate(&DataValue::String("ab".to_string())).is_err());
        
        // Too long
        assert!(constraint.validate(&DataValue::String("abcdefghijk".to_string())).is_err());
        
        // Non-string values should pass (length only applies to strings)
        assert!(constraint.validate(&DataValue::Integer(42)).is_ok());
    }
    
    #[test]
    fn test_field_constraint_range() {
        let constraint = FieldConstraint::Range {
            min: Some(10.0),
            max: Some(100.0),
        };
        
        // Valid integers
        assert!(constraint.validate(&DataValue::Integer(50)).is_ok());
        assert!(constraint.validate(&DataValue::Integer(10)).is_ok());
        assert!(constraint.validate(&DataValue::Integer(100)).is_ok());
        
        // Valid floats
        assert!(constraint.validate(&DataValue::Float(50.5)).is_ok());
        
        // Out of range
        assert!(constraint.validate(&DataValue::Integer(5)).is_err());
        assert!(constraint.validate(&DataValue::Integer(200)).is_err());
        assert!(constraint.validate(&DataValue::Float(5.5)).is_err());
        
        // Non-numeric values should pass
        assert!(constraint.validate(&DataValue::String("test".to_string())).is_ok());
    }
    
    #[test]
    fn test_field_constraint_pattern() {
        let constraint = FieldConstraint::Pattern(r"^\d{3}-\d{2}-\d{4}$".to_string());
        
        // Valid pattern
        assert!(constraint.validate(&DataValue::String("123-45-6789".to_string())).is_ok());
        
        // Invalid pattern
        assert!(constraint.validate(&DataValue::String("123456789".to_string())).is_err());
        assert!(constraint.validate(&DataValue::String("abc-def-ghij".to_string())).is_err());
        
        // Non-string should error
        assert!(constraint.validate(&DataValue::Integer(42)).is_err());
    }
    
    #[test]
    fn test_field_constraint_enum() {
        let constraint = FieldConstraint::Enum(vec![
            DataValue::String("red".to_string()),
            DataValue::String("green".to_string()),
            DataValue::String("blue".to_string()),
        ]);
        
        assert!(constraint.validate(&DataValue::String("red".to_string())).is_ok());
        assert!(constraint.validate(&DataValue::String("green".to_string())).is_ok());
        assert!(constraint.validate(&DataValue::String("blue".to_string())).is_ok());
        assert!(constraint.validate(&DataValue::String("yellow".to_string())).is_err());
    }
    
    #[test]
    fn test_field_type_is_compatible_with() {
        let string_type = FieldType::String {
            min_length: None,
            max_length: None,
            pattern: None,
        };
        
        assert!(string_type.is_compatible_with(&DataValue::String("test".to_string())));
        assert!(!string_type.is_compatible_with(&DataValue::Integer(42)));
        assert!(string_type.is_compatible_with(&DataValue::Null)); // Null is compatible with all
        
        let int_type = FieldType::Integer { min: None, max: None };
        assert!(int_type.is_compatible_with(&DataValue::Integer(42)));
        assert!(!int_type.is_compatible_with(&DataValue::String("test".to_string())));
    }
    
    #[test]
    fn test_data_value_type_name() {
        assert_eq!(DataValue::String("test".to_string()).type_name(), "string");
        assert_eq!(DataValue::Integer(42).type_name(), "integer");
        assert_eq!(DataValue::Float(3.14).type_name(), "float");
        assert_eq!(DataValue::Boolean(true).type_name(), "boolean");
        assert_eq!(DataValue::Null.type_name(), "null");
    }
    
    #[test]
    fn test_data_value_is_null() {
        assert!(DataValue::Null.is_null());
        assert!(!DataValue::Integer(42).is_null());
        assert!(!DataValue::String("test".to_string()).is_null());
    }
    
    #[test]
    fn test_data_value_ordering_same_type() {
        // Same type comparisons
        assert!(DataValue::Integer(1) < DataValue::Integer(2));
        assert!(DataValue::Integer(2) > DataValue::Integer(1));
        assert!(DataValue::Integer(1) == DataValue::Integer(1));
        
        assert!(DataValue::String("a".to_string()) < DataValue::String("b".to_string()));
        assert!(DataValue::Boolean(false) < DataValue::Boolean(true));
        
        let dt1 = chrono::Utc::now();
        let dt2 = dt1 + chrono::Duration::seconds(1);
        assert!(DataValue::DateTime(dt1) < DataValue::DateTime(dt2));
    }
    
    #[test]
    fn test_data_value_ordering_different_types() {
        // Different types use type-based ordering
        assert!(DataValue::Null < DataValue::Boolean(true));
        assert!(DataValue::Boolean(true) < DataValue::Integer(1));
        assert!(DataValue::Integer(1) < DataValue::Float(1.0));
        assert!(DataValue::Float(1.0) < DataValue::String("test".to_string()));
    }
    
    #[test]
    fn test_data_value_ordering_arrays() {
        let arr1 = vec![DataValue::Integer(1), DataValue::Integer(2)];
        let arr2 = vec![DataValue::Integer(1), DataValue::Integer(3)];
        let arr3 = vec![DataValue::Integer(1), DataValue::Integer(2), DataValue::Integer(3)];
        
        assert!(DataValue::Array(arr1.clone()) < DataValue::Array(arr2));
        assert!(DataValue::Array(arr1) < DataValue::Array(arr3));
    }
    
    #[test]
    fn test_data_value_btreemap_usage() {
        use std::collections::BTreeMap;
        
        let mut map = BTreeMap::new();
        map.insert(DataValue::Integer(1), "one");
        map.insert(DataValue::Integer(2), "two");
        map.insert(DataValue::String("key".to_string()), "value");
        
        assert_eq!(map.get(&DataValue::Integer(1)), Some(&"one"));
        assert_eq!(map.get(&DataValue::String("key".to_string())), Some(&"value"));
    }
    
    #[test]
    fn test_data_value_sorting() {
        let mut values = vec![
            DataValue::Integer(3),
            DataValue::Integer(1),
            DataValue::Integer(2),
            DataValue::String("b".to_string()),
            DataValue::String("a".to_string()),
        ];
        
        values.sort();
        
        // Integers come before strings (type ordering)
        assert!(matches!(values[0], DataValue::Integer(1)));
        assert!(matches!(values[1], DataValue::Integer(2)));
        assert!(matches!(values[2], DataValue::Integer(3)));
        assert!(matches!(values[3], DataValue::String(_)));
        assert!(matches!(values[4], DataValue::String(_)));
    }
}