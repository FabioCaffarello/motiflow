//! Domain services - business logic that doesn't belong to a single entity
//!
//! Domain services contain business logic that operates across multiple entities
//! or coordinates complex business operations.

use crate::{CoreError, Result};
use super::entities::*;
use super::value_objects::*;
use std::collections::{HashMap, HashSet};

/// Schema validation service
pub struct SchemaValidationService;

/// Data generation coordination service  
pub struct DataGenerationService;

/// Data quality analysis service
pub struct QualityAnalysisService;

impl SchemaValidationService {
    /// Validate schema consistency and business rules
    ///
    /// Performs comprehensive validation of a schema including:
    /// - Basic schema validation (fields, duplicates)
    /// - Field relationship validation (references)
    /// - Constraint validation (foreign keys, unique constraints)
    /// - Reference integrity validation (circular references)
    ///
    /// # Arguments
    ///
    /// * `schema` - The schema to validate
    ///
    /// # Returns
    ///
    /// `Ok(())` if the schema is valid
    ///
    /// # Errors
    ///
    /// Returns `CoreError::Schema` with descriptive message if validation fails
    ///
    /// # Example
    ///
    /// ```rust
    /// use synthetic_data_core::*;
    ///
    /// let mut schema = DataSchema::new("users".to_string(), "1.0".to_string());
    /// // ... add fields ...
    /// SchemaValidationService::validate_schema(&schema)?;
    /// ```
    pub fn validate_schema(schema: &DataSchema) -> Result<()> {
        // Basic schema validation
        schema.validate()?;
        
        // Advanced validation rules
        Self::validate_field_relationships(schema)?;
        Self::validate_constraints(schema)?;
        Self::validate_reference_integrity(schema)?;
        
        Ok(())
    }
    
    /// Validate relationships between fields
    fn validate_field_relationships(schema: &DataSchema) -> Result<()> {
        for field in &schema.fields {
            if let FieldType::Reference { field_name, .. } = &field.field_type {
                // Check that referenced field exists
                if !schema.fields.iter().any(|f| f.name == *field_name) {
                    return Err(CoreError::Schema {
                        message: format!(
                            "Field '{}' references non-existent field '{}'",
                            field.name, field_name
                        ),
                    });
                }
            }
        }
        Ok(())
    }
    
    /// Validate schema constraints
    fn validate_constraints(schema: &DataSchema) -> Result<()> {
        for constraint in &schema.constraints {
            match constraint {
                SchemaConstraint::ForeignKey { field, reference_schema: _, reference_field: _ } => {
                    // Check that the field exists in this schema
                    if !schema.fields.iter().any(|f| f.name == *field) {
                        return Err(CoreError::Schema {
                            message: format!("Foreign key constraint references non-existent field '{}'", field),
                        });
                    }
                }
                SchemaConstraint::Unique { fields } => {
                    // Check that all fields in unique constraint exist
                    for field_name in fields {
                        if !schema.fields.iter().any(|f| f.name == *field_name) {
                            return Err(CoreError::Schema {
                                message: format!("Unique constraint references non-existent field '{}'", field_name),
                            });
                        }
                    }
                }
                SchemaConstraint::Conditional { .. } => {
                    // For now, just validate that it's not empty
                    // In a full implementation, we'd parse and validate the condition
                }
            }
        }
        Ok(())
    }
    
    /// Validate reference integrity
    fn validate_reference_integrity(schema: &DataSchema) -> Result<()> {
        // Check for circular references
        let mut reference_graph = HashMap::new();
        
        for field in &schema.fields {
            if let FieldType::Reference { field_name, .. } = &field.field_type {
                reference_graph.insert(field.name.clone(), field_name.clone());
            }
        }
        
        // Simple cycle detection
        for start_field in reference_graph.keys() {
            if Self::has_cycle(&reference_graph, start_field)? {
                return Err(CoreError::Schema {
                    message: format!("Circular reference detected starting from field '{}'", start_field),
                });
            }
        }
        
        Ok(())
    }
    
    /// Detect cycles in reference graph
    fn has_cycle(graph: &HashMap<String, String>, start: &str) -> Result<bool> {
        let mut visited = HashSet::new();
        let mut current = start;
        
        while let Some(next) = graph.get(current) {
            if !visited.insert(current) {
                return Ok(true); // Cycle detected
            }
            current = next;
        }
        
        Ok(false)
    }
}

impl DataGenerationService {
    /// Create a generation plan for a dataset
    pub fn create_generation_plan(
        schema: &DataSchema, 
        row_count: usize
    ) -> Result<GenerationPlan> {
        // Validate schema first
        SchemaValidationService::validate_schema(schema)?;
        
        // Analyze dependencies between fields
        let dependency_order = Self::analyze_field_dependencies(schema)?;
        
        // Calculate resource requirements
        let resource_requirements = Self::calculate_resource_requirements(schema, row_count);
        
        Ok(GenerationPlan {
            schema_id: schema.id,
            target_rows: row_count,
            field_order: dependency_order,
            resource_requirements,
            batch_size: Self::calculate_optimal_batch_size(row_count),
        })
    }
    
    /// Analyze dependencies between fields to determine generation order
    fn analyze_field_dependencies(schema: &DataSchema) -> Result<Vec<String>> {
        let mut order = Vec::new();
        let mut remaining_fields: HashSet<String> = schema.fields.iter().map(|f| f.name.clone()).collect();
        let mut dependencies = HashMap::new();
        
        // Build dependency map
        for field in &schema.fields {
            let mut field_deps = Vec::new();
            
            if let FieldType::Reference { field_name, .. } = &field.field_type {
                field_deps.push(field_name.clone());
            }
            
            // Check default strategies that depend on other fields
            if let Some(DefaultStrategy::FieldReference(ref_field)) = &field.default {
                field_deps.push(ref_field.clone());
            }
            
            if !field_deps.is_empty() {
                dependencies.insert(field.name.clone(), field_deps);
            }
        }
        
        // Topological sort
        while !remaining_fields.is_empty() {
            let mut added_this_round = false;
            
            for field_name in remaining_fields.clone() {
                let deps = dependencies.get(&field_name).cloned().unwrap_or_default();
                
                // Check if all dependencies are already in the order
                if deps.iter().all(|dep| order.contains(dep)) {
                    order.push(field_name.clone());
                    remaining_fields.remove(&field_name);
                    added_this_round = true;
                }
            }
            
            if !added_this_round && !remaining_fields.is_empty() {
                return Err(CoreError::Schema {
                    message: "Cannot resolve field dependencies - possible circular reference".to_string(),
                });
            }
        }
        
        Ok(order)
    }
    
    /// Calculate resource requirements for generation
    fn calculate_resource_requirements(schema: &DataSchema, row_count: usize) -> ResourceRequirements {
        let field_count = schema.fields.len();
        
        // Rough estimates - in a real implementation, this would be more sophisticated
        let memory_per_row = field_count * 64; // Bytes per field average
        let estimated_memory = memory_per_row * row_count;
        
        ResourceRequirements {
            estimated_memory_bytes: estimated_memory,
            recommended_thread_count: std::cmp::min(num_cpus::get(), field_count),
            estimated_generation_time_ms: (row_count / 1000) as u64, // Very rough estimate
        }
    }
    
    /// Calculate optimal batch size for generation
    fn calculate_optimal_batch_size(total_rows: usize) -> usize {
        // Simple heuristic - in practice this would consider memory, CPU, etc.
        (total_rows / 10).clamp(100, 1000)
    }
}

impl QualityAnalysisService {
    /// Analyze data quality metrics for a dataset
    ///
    /// This method orchestrates the quality analysis process by:
    /// 1. Analyzing each field individually
    /// 2. Checking schema-level constraint violations
    /// 3. Calculating an overall quality score
    ///
    /// # Performance
    ///
    /// For large datasets, this operation can be expensive. Consider using
    /// batch processing or sampling for very large datasets.
    ///
    /// # Arguments
    ///
    /// * `dataset` - The dataset to analyze
    ///
    /// # Returns
    ///
    /// A comprehensive quality report with field-level and dataset-level metrics
    pub fn analyze_dataset(dataset: &DataSet) -> Result<QualityReport> {
        let mut report = QualityReport {
            dataset_id: dataset.id,
            analysis_timestamp: chrono::Utc::now(),
            total_rows: dataset.rows.len(),
            field_analyses: HashMap::with_capacity(dataset.schema.fields.len()),
            constraint_violations: Vec::new(),
            overall_score: 0.0,
        };
        
        // Analyze each field (parallelizable in future)
        for field_def in &dataset.schema.fields {
            let field_analysis = Self::analyze_field(dataset, field_def)?;
            report.field_analyses.insert(field_def.name.clone(), field_analysis);
        }
        
        // Check constraint violations
        report.constraint_violations = Self::find_constraint_violations(dataset)?;
        
        // Calculate overall quality score
        report.overall_score = Self::calculate_quality_score(&report);
        
        Ok(report)
    }
    
    /// Analyze a specific field across all rows
    ///
    /// Optimized to minimize clones by collecting values only when needed for constraint validation.
    fn analyze_field(dataset: &DataSet, field_def: &FieldDefinition) -> Result<FieldAnalysis> {
        let mut analysis = FieldAnalysis {
            field_name: field_def.name.clone(),
            null_count: 0,
            unique_count: 0,
            type_consistency: 0.0,
            constraint_compliance: 0.0,
            distribution: None,
        };
        
        // Only collect values if we need to validate constraints
        let needs_constraint_validation = !field_def.constraints.is_empty();
        let mut values = if needs_constraint_validation {
            Vec::with_capacity(dataset.rows.len())
        } else {
            Vec::new()
        };
        
        // Create context from dataset schema (needed for Small schemas)
        let ctx = GenerationContext::from_schema(&dataset.schema);
        
        let mut unique_values = HashSet::new();
        let mut type_violations = 0;
        
        for row in &dataset.rows {
            if let Some(value) = row.get_field_value(&field_def.name, Some(&ctx)) {
                if value.is_null() {
                    analysis.null_count += 1;
                } else {
                    // Only clone if needed for constraint validation
                    if needs_constraint_validation {
                        values.push(value.clone());
                    }
                    unique_values.insert(value.clone());
                    
                    // Check type consistency (no clone needed)
                    if !field_def.field_type.is_compatible_with(value) {
                        type_violations += 1;
                    }
                }
            } else if field_def.required {
                // Missing required field
                analysis.null_count += 1;
            }
        }
        
        analysis.unique_count = unique_values.len();
        analysis.type_consistency = if dataset.rows.is_empty() {
            1.0
        } else {
            1.0 - (type_violations as f64 / dataset.rows.len() as f64)
        };
        
        // Calculate constraint compliance only if we have constraints
        if needs_constraint_validation {
            analysis.constraint_compliance = Self::calculate_constraint_compliance(field_def, &values);
        } else {
            analysis.constraint_compliance = 1.0; // No constraints = 100% compliance
        }
        
        Ok(analysis)
    }
    
    /// Calculate constraint compliance percentage
    fn calculate_constraint_compliance(field_def: &FieldDefinition, values: &[DataValue]) -> f64 {
        if values.is_empty() {
            return 1.0;
        }
        
        let mut violations = 0;
        
        for value in values {
            for constraint in &field_def.constraints {
                if constraint.validate(value).is_err() {
                    violations += 1;
                    break; // Only count one violation per value
                }
            }
        }
        
        1.0 - (violations as f64 / values.len() as f64)
    }
    
    /// Find constraint violations in the dataset
    ///
    /// Analyzes schema-level constraints and identifies violations.
    /// Currently supports:
    /// - Unique constraints (single and composite)
    /// 
    /// Future support:
    /// - Foreign key constraints (requires cross-dataset validation)
    /// - Conditional constraints (requires expression evaluation)
    fn find_constraint_violations(dataset: &DataSet) -> Result<Vec<ConstraintViolation>> {
        let mut violations = Vec::new();
        
        // Check uniqueness constraints
        for constraint in &dataset.schema.constraints {
            match constraint {
                SchemaConstraint::Unique { fields } => {
                    let unique_violations = Self::check_uniqueness_constraint(dataset, fields)?;
                    violations.extend(unique_violations);
                }
                SchemaConstraint::ForeignKey { .. } => {
                    // Foreign key validation would require access to other datasets
                    // This is a limitation that should be documented
                    // Skip for now - would need repository access to validate
                }
                SchemaConstraint::Conditional { .. } => {
                    // Conditional constraint evaluation would require expression parsing
                    // and evaluation engine - complex feature for future implementation
                    // Skip for now
                }
            }
        }
        
        Ok(violations)
    }
    
    /// Check uniqueness constraint across multiple fields
    fn check_uniqueness_constraint(
        dataset: &DataSet, 
        field_names: &[String]
    ) -> Result<Vec<ConstraintViolation>> {
        // Create context from dataset schema (needed for Small schemas)
        let ctx = GenerationContext::from_schema(&dataset.schema);
        
        let mut violations = Vec::new();
        let mut seen_combinations = HashSet::new();
        
        for (row_index, row) in dataset.rows.iter().enumerate() {
            let mut combination = Vec::new();
            
            for field_name in field_names {
                if let Some(value) = row.get_field_value(field_name, Some(&ctx)) {
                    combination.push(value.clone());
                } else {
                    combination.push(DataValue::Null);
                }
            }
            
            if !seen_combinations.insert(combination.clone()) {
                violations.push(ConstraintViolation {
                    constraint_type: "unique".to_string(),
                    fields: field_names.to_vec(),
                    row_index,
                    message: format!("Duplicate combination: {:?}", combination),
                });
            }
        }
        
        Ok(violations)
    }
    
    /// Calculate overall quality score (0.0 to 1.0)
    fn calculate_quality_score(report: &QualityReport) -> f64 {
        if report.field_analyses.is_empty() {
            return 0.0;
        }
        
        let mut total_score = 0.0;
        let mut field_count = 0;
        
        for analysis in report.field_analyses.values() {
            // Weight different aspects of quality
            let field_score = 
                analysis.type_consistency * 0.4 +
                analysis.constraint_compliance * 0.4 +
                (if analysis.null_count == 0 { 1.0 } else { 0.8 }) * 0.2;
            
            total_score += field_score;
            field_count += 1;
        }
        
        let base_score = total_score / field_count as f64;
        
        // Apply penalty for constraint violations
        let violation_penalty = (report.constraint_violations.len() as f64 * 0.1).min(0.5);
        
        (base_score - violation_penalty).max(0.0)
    }
}

/// Generation plan for coordinating data creation
#[derive(Debug, Clone)]
pub struct GenerationPlan {
    /// Schema being used
    pub schema_id: uuid::Uuid,
    /// Target number of rows
    pub target_rows: usize,
    /// Order in which fields should be generated
    pub field_order: Vec<String>,
    /// Resource requirements
    pub resource_requirements: ResourceRequirements,
    /// Optimal batch size for generation
    pub batch_size: usize,
}

/// Resource requirements for data generation
#[derive(Debug, Clone)]
pub struct ResourceRequirements {
    /// Estimated memory usage in bytes
    pub estimated_memory_bytes: usize,
    /// Recommended number of threads
    pub recommended_thread_count: usize,
    /// Estimated generation time in milliseconds
    pub estimated_generation_time_ms: u64,
}

/// Data quality analysis report
#[derive(Debug, Clone)]
pub struct QualityReport {
    /// Dataset being analyzed
    pub dataset_id: uuid::Uuid,
    /// When the analysis was performed
    pub analysis_timestamp: chrono::DateTime<chrono::Utc>,
    /// Total number of rows analyzed
    pub total_rows: usize,
    /// Analysis for each field
    pub field_analyses: HashMap<String, FieldAnalysis>,
    /// Constraint violations found
    pub constraint_violations: Vec<ConstraintViolation>,
    /// Overall quality score (0.0 to 1.0)
    pub overall_score: f64,
}

/// Analysis results for a single field
#[derive(Debug, Clone)]
pub struct FieldAnalysis {
    /// Field name
    pub field_name: String,
    /// Number of null/missing values
    pub null_count: usize,
    /// Number of unique values
    pub unique_count: usize,
    /// Type consistency score (0.0 to 1.0)
    pub type_consistency: f64,
    /// Constraint compliance score (0.0 to 1.0)
    pub constraint_compliance: f64,
    /// Statistical distribution (for numeric fields)
    pub distribution: Option<StatisticalDistribution>,
}

/// Statistical distribution information
#[derive(Debug, Clone)]
pub struct StatisticalDistribution {
    /// Mean value
    pub mean: f64,
    /// Standard deviation
    pub std_dev: f64,
    /// Minimum value
    pub min: f64,
    /// Maximum value
    pub max: f64,
    /// Median value
    pub median: f64,
}

/// Constraint violation record
#[derive(Debug, Clone)]
pub struct ConstraintViolation {
    /// Type of constraint that was violated
    pub constraint_type: String,
    /// Fields involved in the violation
    pub fields: Vec<String>,
    /// Row index where violation occurred
    pub row_index: usize,
    /// Description of the violation
    pub message: String,
}

#[cfg(test)]
mod tests {
    use super::*;
    
    #[test]
    fn test_schema_validation_service_basic() {
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
        
        assert!(SchemaValidationService::validate_schema(&schema).is_ok());
    }
    
    #[test]
    fn test_schema_validation_service_empty_schema() {
        let schema = DataSchema::new("test".to_string(), "1.0".to_string());
        let result = SchemaValidationService::validate_schema(&schema);
        assert!(result.is_err());
    }
    
    #[test]
    fn test_schema_validation_service_reference_integrity() {
        let mut schema = DataSchema::new("test".to_string(), "1.0".to_string());
        
        // Add a field that references another field
        let field1 = FieldDefinition {
            name: "id".to_string(),
            field_type: FieldType::Integer { min: None, max: None },
            constraints: vec![],
            required: true,
            default: None,
            description: None,
        };
        
        let field2 = FieldDefinition {
            name: "ref_id".to_string(),
            field_type: FieldType::Reference {
                field_name: "id".to_string(),
                transform: None,
            },
            constraints: vec![],
            required: false,
            default: None,
            description: None,
        };
        
        schema.fields.push(field1);
        schema.fields.push(field2);
        
        assert!(SchemaValidationService::validate_schema(&schema).is_ok());
    }
    
    #[test]
    fn test_schema_validation_service_invalid_reference() {
        let mut schema = DataSchema::new("test".to_string(), "1.0".to_string());
        
        let field = FieldDefinition {
            name: "ref_id".to_string(),
            field_type: FieldType::Reference {
                field_name: "nonexistent".to_string(), // References non-existent field
                transform: None,
            },
            constraints: vec![],
            required: false,
            default: None,
            description: None,
        };
        
        schema.fields.push(field);
        
        let result = SchemaValidationService::validate_schema(&schema);
        assert!(result.is_err());
        assert!(result.unwrap_err().to_string().contains("non-existent field"));
    }
    
    #[test]
    fn test_schema_validation_service_circular_reference() {
        let mut schema = DataSchema::new("test".to_string(), "1.0".to_string());
        
        // Create circular reference: field1 -> field2 -> field1
        let field1 = FieldDefinition {
            name: "field1".to_string(),
            field_type: FieldType::Reference {
                field_name: "field2".to_string(),
                transform: None,
            },
            constraints: vec![],
            required: true,
            default: None,
            description: None,
        };
        
        let field2 = FieldDefinition {
            name: "field2".to_string(),
            field_type: FieldType::Reference {
                field_name: "field1".to_string(),
                transform: None,
            },
            constraints: vec![],
            required: true,
            default: None,
            description: None,
        };
        
        schema.fields.push(field1);
        schema.fields.push(field2);
        
        let result = SchemaValidationService::validate_schema(&schema);
        assert!(result.is_err());
        assert!(result.unwrap_err().to_string().contains("Circular reference"));
    }
    
    #[test]
    fn test_quality_analysis_service_basic() {
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
        
        let mut dataset = DataSet::new("test".to_string(), schema);
        
        // Create context for set_field
        let ctx = GenerationContext::from_schema(&dataset.schema);
        
        // Add some valid rows
        for i in 1..=5 {
            let mut row = DataRow::new();
            row.set_field("id".to_string(), DataValue::Integer(i), Some(&ctx));
            dataset.add_row(row).unwrap();
        }
        
        let report = QualityAnalysisService::analyze_dataset(&dataset).unwrap();
        assert_eq!(report.total_rows, 5);
        assert!(report.overall_score >= 0.0 && report.overall_score <= 1.0);
        assert_eq!(report.field_analyses.len(), 1);
    }
    
    #[test]
    fn test_quality_analysis_service_empty_dataset() {
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
        
        let dataset = DataSet::new("test".to_string(), schema);
        
        let report = QualityAnalysisService::analyze_dataset(&dataset).unwrap();
        assert_eq!(report.total_rows, 0);
        assert_eq!(report.field_analyses.len(), 1);
    }
    
    #[test]
    fn test_generation_service_create_plan() {
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
        
        let plan = DataGenerationService::create_generation_plan(&schema, 1000).unwrap();
        assert_eq!(plan.target_rows, 1000);
        assert_eq!(plan.schema_id, schema.id);
        assert!(!plan.field_order.is_empty());
        assert!(plan.batch_size > 0);
    }
}
