//! Default data generator - main implementation of DataGeneratorPort
//!
//! This is the primary implementation of DataGeneratorPort that coordinates
//! different type-specific generators (string, integer, float, etc.)

use synthetic_data_core::{ports::*, domain::*, Result, CoreError};
use async_trait::async_trait;
use std::sync::Arc;
use std::collections::HashMap;
use rayon::prelude::*;
use super::string::StringGenerator;

/// Default implementation of DataGeneratorPort
///
/// Coordinates different type-specific generators to create complete data rows
/// based on schemas.
///
/// # Example
///
/// ```rust
/// use synthetic_data_infrastructure::capabilities::generators::DefaultDataGenerator;
/// use synthetic_data_core::ports::*;
/// use std::sync::Arc;
///
/// let string_gen = Arc::new(StringGenerator::new(None));
/// let generator = DefaultDataGenerator::new(string_gen);
///
/// // Use with GenerationService
/// ```
pub struct DefaultDataGenerator {
    /// String generator for string fields
    string_generator: Arc<StringGenerator>,
    // Future: integer_generator, float_generator, etc.
}

impl DefaultDataGenerator {
    /// Create a new default data generator
    ///
    /// # Arguments
    ///
    /// * `string_generator` - String generator instance
    ///
    /// # Returns
    ///
    /// A new `DefaultDataGenerator` instance
    pub fn new(string_generator: Arc<StringGenerator>) -> Self {
        Self {
            string_generator,
        }
    }
    
    /// Create with default string generator
    ///
    /// Creates a generator with a default string generator (non-deterministic).
    pub fn with_default_string_generator(seed: Option<u64>) -> Self {
        Self::new(Arc::new(StringGenerator::new(seed)))
    }
}

#[async_trait]
impl DataGeneratorPort for DefaultDataGenerator {
    async fn generate_value(&self, field: &FieldDefinition) -> Result<DataValue> {
        match &field.field_type {
            FieldType::String { .. } => {
                let value = self.string_generator.generate(field).await?;
                Ok(DataValue::String(value))
            }
            // Future: implement other types
            FieldType::Integer { .. } => {
                Err(CoreError::Generation {
                    message: format!("Integer generation not yet implemented for field '{}'", field.name),
                })
            }
            FieldType::Float { .. } => {
                Err(CoreError::Generation {
                    message: format!("Float generation not yet implemented for field '{}'", field.name),
                })
            }
            FieldType::Boolean { .. } => {
                Err(CoreError::Generation {
                    message: format!("Boolean generation not yet implemented for field '{}'", field.name),
                })
            }
            FieldType::DateTime { .. } => {
                Err(CoreError::Generation {
                    message: format!("DateTime generation not yet implemented for field '{}'", field.name),
                })
            }
            FieldType::Uuid { .. } => {
                Err(CoreError::Generation {
                    message: format!("Uuid generation not yet implemented for field '{}'", field.name),
                })
            }
            FieldType::Json { .. } => {
                Err(CoreError::Generation {
                    message: format!("Json generation not yet implemented for field '{}'", field.name),
                })
            }
            FieldType::Array { .. } => {
                Err(CoreError::Generation {
                    message: format!("Array generation not yet implemented for field '{}'", field.name),
                })
            }
            FieldType::Object { .. } => {
                Err(CoreError::Generation {
                    message: format!("Object generation not yet implemented for field '{}'", field.name),
                })
            }
            FieldType::Reference { .. } => {
                Err(CoreError::Generation {
                    message: format!("Reference generation not yet implemented for field '{}'", field.name),
                })
            }
        }
    }
    
    async fn generate_values(&self, field: &FieldDefinition, count: usize) -> Result<Vec<DataValue>> {
        match &field.field_type {
            FieldType::String { .. } => {
                // CRITICAL OPTIMIZATION: Use synchronous version directly to eliminate async overhead!
                // Since we're in async context but don't need async, call sync version directly
                let strings = self.string_generator.generate_batch_sync(field, count)?;
                
                // CRITICAL OPTIMIZATION: Move strings directly into DataValue (zero clones!)
                // Using into_iter() moves strings instead of cloning them
                // This eliminates String clones during conversion!
                // ULTRA-OPTIMIZED: Pre-allocate Vec with exact capacity
                let values: Vec<DataValue> = {
                    let mut vec = Vec::with_capacity(strings.len());
                    for s in strings {
                        vec.push(DataValue::String(s));
                    }
                    vec
                };
                Ok(values)
            }
            _ => {
                // For other types, generate one by one (can be optimized later)
                let mut values = Vec::with_capacity(count);
                for _ in 0..count {
                    values.push(self.generate_value(field).await?);
                }
                Ok(values)
            }
        }
    }
    
    async fn generate_row(&self, schema: &DataSchema) -> Result<DataRow> {
        // Create context once (shared, no Arc cloning per field!)
        let ctx = GenerationContext::from_schema(schema);
        
        let mut row = DataRow::new();
        
        // Generate fields in order (respecting dependencies if needed)
        // For MVP, generate in schema order
        for field_def in &schema.fields {
            let value = self.generate_value(field_def).await?;
            row.set_field(field_def.name.clone(), value, Some(&ctx));
        }
        
        Ok(row)
    }
    
    async fn generate_rows(&self, schema: &DataSchema, count: usize) -> Result<Vec<DataRow>> {
        // ULTRA-OPTIMIZED FOR 1M+: Pre-generate everything, then assemble in parallel
        // Strategy: Generate all values sequentially (async), then assemble rows in parallel
        
        // RADICAL: Pre-generate all field values as direct DataValue (no Arc for Small schemas!)
        // This eliminates Arc overhead - zero atomic operations for small schemas!
        // ULTRA-OPTIMIZED: Pre-allocate with exact capacity and reserve space for each Vec
        let field_count = schema.fields.len();
        let mut field_values: Vec<Vec<DataValue>> = Vec::with_capacity(field_count);
        
        // CRITICAL OPTIMIZATION: Generate values for all fields
        // OPTIMIZED: Use explicit loop with pre-allocation for each field's values
        for field_def in &schema.fields {
            // Generate values directly (no Arc needed for Small schemas!)
            // Pre-allocate Vec inside generate_values for better performance
            let values = self.generate_values(field_def, count).await?;
            field_values.push(values);
        }
        
        // CRITICAL OPTIMIZATION: Create GenerationContext ONCE (shared across all rows!)
        // This eliminates 2M Arc::clone() operations for 1M rows!
        // Instead of cloning Arc per row, we use a shared context
        let ctx = GenerationContext::from_schema(schema);
        
        // MAXIMUM PERFORMANCE: Pre-generate ALL UUIDs in batch (parallelized)
        // Using rayon for parallel generation - each thread generates UUIDs independently
        // ULTRA-OPTIMIZED: Use with_min_len for better load balancing
        let uuids: Vec<uuid::Uuid> = (0..count)
            .into_par_iter()
            .with_min_len(1000)  // Better load balancing for large batches
            .map(|_| uuid::Uuid::new_v4())
            .collect();
        
        // Pre-generate timestamp once
        let now = chrono::Utc::now();
        
        // Assemble rows in parallel - use Vec with INDICES for small schemas (<10 fields)!
        // field_count já foi calculado acima, reutilizar
        let use_vec = field_count < 10;
        
        // CRITICAL OPTIMIZATION: Pre-allocate rows Vec with capacity to avoid reallocations
        // OPTIMIZED: Use explicit parallel iteration for better performance
        // NOTE: Reorganization to enable move was attempted but proved slower than cloning
        // The transpose operation cost more than the clones it eliminated
        // Keeping original structure and cloning (clone is optimized for small values)
        // 
        // NEW OPTIMIZATION: Use unsafe unchecked access for maximum performance
        // We know indices are valid, so we can skip bounds checking
        let rows: Vec<DataRow> = if use_vec {
            // MAXIMUM PERFORMANCE: Pre-allocate Vec with None, then fill directly by index!
            // O(1) access - NO linear search, NO String clones!
            // CRITICAL: Pre-allocate with exact capacity to avoid growth
            // ULTRA-OPTIMIZED: Use with_min_len for better load balancing
            (0..count)
                .into_par_iter()
                .with_min_len(1000)  // Better load balancing for large batches
                .map(|i| {
                    let mut fields_vec = vec![None; field_count];
                    
                    // Fill directly by index - O(1) assignment per field!
                    // ULTRA-OPTIMIZED: Use unsafe unchecked access + unrolled loop for small field counts
                    // We know field_idx < field_count and i < count, so bounds are safe
                    // CRITICAL: Custom Clone implementation is optimized for hot paths
                    // For DataValue::String (most common), String::clone() uses memcpy (very fast)
                    // For copy types (Integer, Float, Boolean), uses direct copy (extremely fast)
                    
                    // OPTIMIZATION: Unroll loop for very small schemas (1-4 fields) for better performance
                    // This eliminates loop overhead and improves branch prediction
                    unsafe {
                        match field_count {
                            1 => {
                                *fields_vec.get_unchecked_mut(0) = Some(field_values.get_unchecked(0).get_unchecked(i).clone());
                            }
                            2 => {
                                *fields_vec.get_unchecked_mut(0) = Some(field_values.get_unchecked(0).get_unchecked(i).clone());
                                *fields_vec.get_unchecked_mut(1) = Some(field_values.get_unchecked(1).get_unchecked(i).clone());
                            }
                            3 => {
                                *fields_vec.get_unchecked_mut(0) = Some(field_values.get_unchecked(0).get_unchecked(i).clone());
                                *fields_vec.get_unchecked_mut(1) = Some(field_values.get_unchecked(1).get_unchecked(i).clone());
                                *fields_vec.get_unchecked_mut(2) = Some(field_values.get_unchecked(2).get_unchecked(i).clone());
                            }
                            4 => {
                                *fields_vec.get_unchecked_mut(0) = Some(field_values.get_unchecked(0).get_unchecked(i).clone());
                                *fields_vec.get_unchecked_mut(1) = Some(field_values.get_unchecked(1).get_unchecked(i).clone());
                                *fields_vec.get_unchecked_mut(2) = Some(field_values.get_unchecked(2).get_unchecked(i).clone());
                                *fields_vec.get_unchecked_mut(3) = Some(field_values.get_unchecked(3).get_unchecked(i).clone());
                            }
                            _ => {
                                // For larger schemas, use loop (still optimized with unchecked access)
                                for field_idx in 0..field_count {
                                    *fields_vec.get_unchecked_mut(field_idx) = Some(field_values.get_unchecked(field_idx).get_unchecked(i).clone());
                                }
                            }
                        }
                    }
                    
                    // CRITICAL: No Arc cloning! Context is shared (zero atomic operations!)
                    // ULTRA-OPTIMIZED: Use unchecked access for UUID (bounds guaranteed)
                    DataRow {
                        id: unsafe { *uuids.get_unchecked(i) },
                        fields: Fields::Small(fields_vec),
                        sequence: i as u64,
                        generated_at: now,
                    }
                })
                .collect()
        } else {
            // For large schemas: use HashMap
            // MAXIMUM PERFORMANCE: Pre-reserve capacity and use unchecked access
            // ULTRA-OPTIMIZED: Use with_min_len for better load balancing
            (0..count)
                .into_par_iter()
                .with_min_len(1000)  // Better load balancing for large batches
                .map(|i| {
                    // ULTRA-OPTIMIZED: Pre-allocate HashMap with exact capacity to avoid rehashing
                    // with_capacity already reserves the space, so no need for additional reserve
                    let mut fields = HashMap::with_capacity(field_count);
                    
                    // Use context field_names for large schemas
                    // String clone is necessary but optimized by Rust (memcpy for small strings)
                    // ULTRA-OPTIMIZED: Direct iteration with bounds checking (compiler optimizes this well)
                    for (field_idx, field_name) in ctx.field_names.iter().enumerate() {
                        // Clone String for key (optimized by Rust) and wrap DataValue in Arc
                        fields.insert(field_name.clone(), Arc::new(field_values[field_idx][i].clone()));
                    }
                    
                    // CRITICAL: No Arc cloning! Context is shared (zero atomic operations!)
                    // ULTRA-OPTIMIZED: Use unchecked access for UUID (bounds guaranteed)
                    DataRow {
                        id: unsafe { *uuids.get_unchecked(i) },
                        fields: Fields::Large(fields),
                        sequence: i as u64,
                        generated_at: now,
                    }
                })
                .collect()
        };
        
        Ok(rows)
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use synthetic_data_core::domain::builders::*;
    
    #[tokio::test]
    async fn test_generate_value_string() {
        let generator = DefaultDataGenerator::with_default_string_generator(None);
        
        let field = FieldDefinition {
            name: "name".to_string(),
            field_type: FieldType::String {
                min_length: Some(5),
                max_length: Some(10),
                pattern: None,
            },
            constraints: vec![],
            required: true,
            default: None,
            description: None,
        };
        
        let value = generator.generate_value(&field).await.unwrap();
        
        match value {
            DataValue::String(s) => {
                assert!(s.len() >= 5 && s.len() <= 10);
            }
            _ => panic!("Expected String value"),
        }
    }
    
    #[tokio::test]
    async fn test_generate_row() {
        let generator = DefaultDataGenerator::with_default_string_generator(None);
        
        let schema = DataSchemaBuilder::new("test".to_string(), "1.0".to_string())
            .add_field(
                FieldDefinitionBuilder::new("name".to_string(), FieldType::String {
                    min_length: Some(5),
                    max_length: Some(20),
                    pattern: None,
                })
                .required(true)
                .build()
            )
            .add_field(
                FieldDefinitionBuilder::new("email".to_string(), FieldType::String {
                    min_length: None,
                    max_length: None,
                    pattern: Some(StringPattern::Email),
                })
                .required(true)
                .build()
            )
            .build()
            .unwrap();
        
        let row = generator.generate_row(&schema).await.unwrap();
        
        // Create context for get_field
        let ctx = GenerationContext::from_schema(&schema);
        
        assert!(row.get_field("name", Some(&ctx)).is_some());
        assert!(row.get_field("email", Some(&ctx)).is_some());
        
        if let Some(email_value) = row.get_field("email", Some(&ctx)) {
            if let DataValue::String(email) = email_value {
                assert!(email.contains('@'));
            }
        }
    }
    
    #[tokio::test]
    async fn test_generate_rows() {
        let generator = DefaultDataGenerator::with_default_string_generator(None);
        
        let schema = DataSchemaBuilder::new("test".to_string(), "1.0".to_string())
            .add_field(
                FieldDefinitionBuilder::new("name".to_string(), FieldType::String {
                    min_length: Some(5),
                    max_length: Some(20),
                    pattern: None,
                })
                .required(true)
                .build()
            )
            .build()
            .unwrap();
        
        let rows = generator.generate_rows(&schema, 10).await.unwrap();
        
        assert_eq!(rows.len(), 10);
        
        // Create context for get_field_value
        let ctx = GenerationContext::from_schema(&schema);
        
        for row in rows {
            assert!(row.get_field_value("name", Some(&ctx)).is_some());
        }
    }
    
    #[tokio::test]
    async fn test_generate_values_batch() {
        let generator = DefaultDataGenerator::with_default_string_generator(None);
        
        let field = FieldDefinition {
            name: "name".to_string(),
            field_type: FieldType::String {
                min_length: Some(5),
                max_length: Some(10),
                pattern: None,
            },
            constraints: vec![],
            required: true,
            default: None,
            description: None,
        };
        
        let values = generator.generate_values(&field, 50).await.unwrap();
        
        assert_eq!(values.len(), 50);
        
        for value in values {
            match value {
                DataValue::String(s) => {
                    assert!(s.len() >= 5 && s.len() <= 10);
                }
                _ => panic!("Expected String value"),
            }
        }
    }
}

