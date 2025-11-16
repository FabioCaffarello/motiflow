//! Application layer - Use cases and application services
//! 
//! Contains the application services that orchestrate domain operations
//! and coordinate with infrastructure adapters through ports.

use crate::{Result, domain::*, ports::*};
use std::sync::Arc;
use uuid::Uuid;

/// Schema management application service
pub struct SchemaService {
    repository: Arc<dyn RepositoryPort>,
    validator: Arc<dyn DataValidatorPort>,
}

/// Data generation application service
pub struct GenerationService {
    generator: Arc<dyn DataGeneratorPort>,
    repository: Arc<dyn RepositoryPort>,
    validator: Arc<dyn DataValidatorPort>,
    metrics: Arc<dyn MetricsPort>,
    config: GenerationConfig,
}

/// Data export application service
pub struct ExportService {
    repository: Arc<dyn RepositoryPort>,
    exporter: Arc<dyn DataExporterPort>,
    metrics: Arc<dyn MetricsPort>,
}

/// Quality analysis application service
pub struct QualityService {
    validator: Arc<dyn DataValidatorPort>,
    repository: Arc<dyn RepositoryPort>,
    metrics: Arc<dyn MetricsPort>,
}

impl SchemaService {
    /// Create a new schema service
    ///
    /// # Arguments
    ///
    /// * `repository` - Repository port for persisting schemas
    /// * `validator` - Validator port for validating data against schemas
    ///
    /// # Returns
    ///
    /// A new `SchemaService` instance
    pub fn new(
        repository: Arc<dyn RepositoryPort>,
        validator: Arc<dyn DataValidatorPort>,
    ) -> Self {
        Self { repository, validator }
    }
    
    /// Create a new schema with validation
    ///
    /// Validates the schema using domain validation rules and port-based validation,
    /// then persists it to the repository.
    ///
    /// # Arguments
    ///
    /// * `schema` - The schema to create. If `id` is `Uuid::nil()`, a new UUID will be generated.
    ///
    /// # Returns
    ///
    /// The UUID of the created schema
    ///
    /// # Errors
    ///
    /// Returns `CoreError::Schema` if schema validation fails
    /// Returns `CoreError::Validation` if port-based validation fails
    ///
    /// # Example
    ///
    /// ```no_run
    /// use synthetic_data_core::*;
    /// use std::sync::Arc;
    ///
    /// # async fn example() -> Result<()> {
    /// let schema = DataSchema::new("users".to_string(), "1.0".to_string());
    /// // ... configure schema fields ...
    /// // let service = SchemaService::new(repo, validator);
    /// // let schema_id = service.create_schema(schema).await?;
    /// # Ok(())
    /// # }
    /// ```
    pub async fn create_schema(&self, mut schema: DataSchema) -> Result<Uuid> {
        // Validate schema using domain service
        SchemaValidationService::validate_schema(&schema)?;
        
        // Additional validation through port
        let sample_row = DataRow::new();
        self.validator.validate_row(&sample_row, &schema).await?;
        
        // Generate new ID if not provided
        if schema.id == Uuid::nil() {
            schema.id = Uuid::new_v4();
        }
        
        // Save to repository
        self.repository.save_schema(&schema).await?;
        
        Ok(schema.id)
    }
    
    /// Update an existing schema
    ///
    /// Validates and updates an existing schema. The schema must already exist in the repository.
    ///
    /// # Arguments
    ///
    /// * `schema` - The updated schema with the same ID as the existing one
    ///
    /// # Returns
    ///
    /// `Ok(())` if the schema was successfully updated
    ///
    /// # Errors
    ///
    /// Returns `CoreError::Schema` if:
    /// - Schema validation fails
    /// - Schema with the given ID does not exist
    ///
    /// # Example
    ///
    /// ```no_run
    /// # use synthetic_data_core::*;
    /// # async fn example() -> Result<()> {
    /// // let service = SchemaService::new(repo, validator);
    /// // service.update_schema(updated_schema).await?;
    /// # Ok(())
    /// # }
    /// ```
    pub async fn update_schema(&self, schema: DataSchema) -> Result<()> {
        // Validate the updated schema
        SchemaValidationService::validate_schema(&schema)?;
        
        // Check if schema exists
        let existing = self.repository.load_schema(schema.id).await?;
        if existing.is_none() {
            return Err(crate::CoreError::Schema {
                message: format!("Schema with id {} not found", schema.id),
            });
        }
        
        // Save the updated schema
        self.repository.save_schema(&schema).await?;
        
        Ok(())
    }
    
    /// Get schema by ID
    ///
    /// # Arguments
    ///
    /// * `id` - The UUID of the schema to retrieve
    ///
    /// # Returns
    ///
    /// `Some(DataSchema)` if found, `None` if not found
    ///
    /// # Errors
    ///
    /// Returns `CoreError` if repository operation fails
    pub async fn get_schema(&self, id: Uuid) -> Result<Option<DataSchema>> {
        self.repository.load_schema(id).await
    }
    
    /// List all schemas
    ///
    /// # Returns
    ///
    /// A vector of all schemas in the repository
    ///
    /// # Errors
    ///
    /// Returns `CoreError` if repository operation fails
    pub async fn list_schemas(&self) -> Result<Vec<DataSchema>> {
        self.repository.list_schemas().await
    }
    
    /// Delete schema
    ///
    /// # Arguments
    ///
    /// * `id` - The UUID of the schema to delete
    ///
    /// # Returns
    ///
    /// `Ok(())` if the schema was successfully deleted
    ///
    /// # Errors
    ///
    /// Returns `CoreError` if repository operation fails
    pub async fn delete_schema(&self, id: Uuid) -> Result<()> {
        self.repository.delete_schema(id).await
    }
    
    /// Validate schema
    ///
    /// Performs comprehensive validation of a schema including:
    /// - Domain-level validation (field consistency, constraints)
    /// - Port-based validation (sample row validation)
    ///
    /// # Arguments
    ///
    /// * `schema` - The schema to validate
    ///
    /// # Returns
    ///
    /// A vector of error messages. Empty vector means validation passed.
    ///
    /// # Example
    ///
    /// ```no_run
    /// # use synthetic_data_core::*;
    /// # async fn example() -> Result<()> {
    /// // let service = SchemaService::new(repo, validator);
    /// // let errors = service.validate_schema(&schema).await?;
    /// // if errors.is_empty() {
    /// //     println!("Schema is valid!");
    /// // }
    /// # Ok(())
    /// # }
    /// ```
    pub async fn validate_schema(&self, schema: &DataSchema) -> Result<Vec<String>> {
        let mut errors = Vec::new();
        
        // Domain validation
        if let Err(e) = SchemaValidationService::validate_schema(schema) {
            errors.push(e.to_string());
        }
        
        // Additional port-based validation
        let sample_row = DataRow::new();
        match self.validator.validate_row(&sample_row, schema).await {
            Ok(row_errors) if !row_errors.is_empty() => {
                errors.extend(row_errors);
            }
            Err(e) => {
                errors.push(format!("Port validation error: {}", e));
            }
            _ => {} // No errors, validation passed
        }
        
        Ok(errors)
    }
}

impl GenerationService {
    /// Create a new generation service
    ///
    /// # Arguments
    ///
    /// * `generator` - Port for generating synthetic data
    /// * `repository` - Port for persisting datasets
    /// * `validator` - Port for validating generated data
    /// * `metrics` - Port for recording performance metrics
    /// * `config` - Generation configuration (batch size, validation settings, etc.)
    ///
    /// # Returns
    ///
    /// A new `GenerationService` instance
    ///
    /// # Note
    ///
    /// The configuration is not validated at construction time. Use `new_with_validation`
    /// if you want to ensure the configuration is valid before creating the service.
    pub fn new(
        generator: Arc<dyn DataGeneratorPort>,
        repository: Arc<dyn RepositoryPort>,
        validator: Arc<dyn DataValidatorPort>,
        metrics: Arc<dyn MetricsPort>,
        config: GenerationConfig,
    ) -> Self {
        Self {
            generator,
            repository,
            validator,
            metrics,
            config,
        }
    }
    
    /// Create a new generation service with configuration validation
    ///
    /// This method validates the configuration before creating the service,
    /// ensuring it's safe to use.
    ///
    /// # Arguments
    ///
    /// * `generator` - Port for generating synthetic data
    /// * `repository` - Port for persisting datasets
    /// * `validator` - Port for validating generated data
    /// * `metrics` - Port for recording performance metrics
    /// * `config` - Generation configuration to validate
    ///
    /// # Returns
    ///
    /// A new `GenerationService` instance if configuration is valid
    ///
    /// # Errors
    ///
    /// Returns `CoreError::Configuration` if the configuration is invalid
    pub fn new_with_validation(
        generator: Arc<dyn DataGeneratorPort>,
        repository: Arc<dyn RepositoryPort>,
        validator: Arc<dyn DataValidatorPort>,
        metrics: Arc<dyn MetricsPort>,
        config: GenerationConfig,
    ) -> Result<Self> {
        config.validate()?;
        Ok(Self::new(generator, repository, validator, metrics, config))
    }
    
    /// Generate a new dataset
    ///
    /// Generates synthetic data based on a schema, with optional validation during generation.
    /// Data is generated in batches for memory efficiency.
    ///
    /// # Arguments
    ///
    /// * `schema_id` - UUID of the schema to use for generation
    /// * `row_count` - Number of rows to generate
    /// * `name` - Optional name for the dataset. If `None`, defaults to "Generated Dataset"
    ///
    /// # Returns
    ///
    /// The UUID of the generated dataset
    ///
    /// # Errors
    ///
    /// Returns `CoreError::Schema` if schema is not found
    /// Returns `CoreError::Validation` if validation is enabled and generated data fails validation
    /// Returns `CoreError::Generation` if data generation fails
    ///
    /// # Performance
    ///
    /// Generation is performed in batches. Batch size is determined by `config.batch_size`.
    /// If validation is enabled, each batch is validated before being added to the dataset.
    pub async fn generate_dataset(
        &self,
        schema_id: Uuid,
        row_count: usize,
        name: Option<String>,
    ) -> Result<Uuid> {
        let start_time = std::time::Instant::now();
        
        // Load schema
        let schema = self.repository.load_schema(schema_id).await?
            .ok_or_else(|| crate::CoreError::Schema {
                message: format!("Schema with id {} not found", schema_id),
            })?;
        
        // Create generation plan
        let plan = DataGenerationService::create_generation_plan(&schema, row_count)?;
        
        // Create new dataset
        let mut dataset = DataSet::new(name.unwrap_or_else(|| "Generated Dataset".to_string()), schema);
        
        // Generate data in batches
        for batch_start in (0..row_count).step_by(plan.batch_size) {
            let batch_size = std::cmp::min(plan.batch_size, row_count - batch_start);
            
            // Generate batch of rows
            let rows = self.generator.generate_rows(&dataset.schema, batch_size).await?;
            
            // Validate if enabled
            if self.config.enable_validation {
                for row in &rows {
                    let validation_errors = self.validator.validate_row(row, &dataset.schema).await?;
                    if !validation_errors.is_empty() {
                        return Err(crate::CoreError::Validation {
                            message: format!("Validation errors in generated data: {:?}", validation_errors),
                        });
                    }
                }
            }
            
            // Add rows to dataset
            for row in rows {
                dataset.add_row(row)?;
            }
            
            // Save batch to repository (only if not the last batch)
            if batch_start + batch_size < row_count {
                let end = std::cmp::min(batch_start + batch_size, dataset.rows.len());
                if batch_start < end {
                    self.repository.save_rows(dataset.id, &dataset.rows[batch_start..end]).await?;
                }
            }
        }
        
        // Save final dataset
        self.repository.save_dataset(&dataset).await?;
        
        // Record metrics
        let duration = start_time.elapsed();
        self.metrics.record_generation_time(duration.as_millis() as u64, row_count).await;
        
        Ok(dataset.id)
    }
    
    /// Generate and validate dataset with quality checks
    pub async fn generate_validated_dataset(
        &self,
        schema_id: Uuid,
        row_count: usize,
        name: Option<String>,
    ) -> Result<(Uuid, QualityReport)> {
        // Generate the dataset
        let dataset_id = self.generate_dataset(schema_id, row_count, name).await?;
        
        // Load the generated dataset
        let dataset = self.repository.load_dataset(dataset_id).await?
            .ok_or_else(|| crate::CoreError::Validation {
                message: "Failed to load generated dataset".to_string(),
            })?;
        
        // Analyze quality
        let quality_report = QualityAnalysisService::analyze_dataset(&dataset)?;
        
        // Check if quality meets thresholds
        if quality_report.overall_score < self.config.quality_thresholds.min_quality_score {
            return Err(crate::CoreError::Validation {
                message: format!(
                    "Generated dataset quality score {} is below minimum threshold {}",
                    quality_report.overall_score,
                    self.config.quality_thresholds.min_quality_score
                ),
            });
        }
        
        Ok((dataset_id, quality_report))
    }
    
    /// Get generation configuration
    pub fn get_config(&self) -> &GenerationConfig {
        &self.config
    }
    
    /// Update generation configuration
    ///
    /// # Arguments
    ///
    /// * `config` - New configuration to use
    ///
    /// # Note
    ///
    /// This method does not validate the configuration. Use `update_config_validated`
    /// if you want to ensure the configuration is valid.
    pub fn update_config(&mut self, config: GenerationConfig) {
        self.config = config;
    }
    
    /// Update generation configuration with validation
    ///
    /// # Arguments
    ///
    /// * `config` - New configuration to validate and use
    ///
    /// # Returns
    ///
    /// `Ok(())` if configuration is valid and was updated
    ///
    /// # Errors
    ///
    /// Returns `CoreError::Configuration` if the configuration is invalid
    pub fn update_config_validated(&mut self, config: GenerationConfig) -> Result<()> {
        config.validate()?;
        self.config = config;
        Ok(())
    }
}

impl ExportService {
    /// Create new export service
    pub fn new(
        repository: Arc<dyn RepositoryPort>,
        exporter: Arc<dyn DataExporterPort>,
        metrics: Arc<dyn MetricsPort>,
    ) -> Self {
        Self {
            repository,
            exporter,
            metrics,
        }
    }
    
    /// Export dataset to file
    pub async fn export_dataset(
        &self,
        dataset_id: Uuid,
        format: &str,
        output_path: &str,
    ) -> Result<ExportResult> {
        let start_time = std::time::Instant::now();
        
        // Load dataset
        let dataset = self.repository.load_dataset(dataset_id).await?
            .ok_or_else(|| crate::CoreError::Validation {
                message: format!("Dataset with id {} not found", dataset_id),
            })?;
        
        // Export based on format
        match format.to_lowercase().as_str() {
            "csv" => self.exporter.export_csv(&dataset, output_path).await?,
            "json" => self.exporter.export_json(&dataset, output_path).await?,
            "parquet" => self.exporter.export_parquet(&dataset, output_path).await?,
            _ => return Err(crate::CoreError::Configuration {
                source: anyhow::anyhow!("Unsupported export format: {}", format),
            }),
        }
        
        // Calculate file size and record metrics
        let file_size = std::fs::metadata(output_path)
            .map(|m| m.len() as usize)
            .unwrap_or(0);
        
        let duration = start_time.elapsed();
        self.metrics.record_export_operation(format, file_size, duration.as_millis() as u64).await;
        
        Ok(ExportResult {
            dataset_id,
            format: format.to_string(),
            output_path: output_path.to_string(),
            file_size_bytes: file_size,
            export_time_ms: duration.as_millis() as u64,
            rows_exported: dataset.rows.len(),
        })
    }
    
    /// Export schema to file
    pub async fn export_schema(&self, schema_id: Uuid, output_path: &str) -> Result<()> {
        // Load schema
        let schema = self.repository.load_schema(schema_id).await?
            .ok_or_else(|| crate::CoreError::Validation {
                message: format!("Schema with id {} not found", schema_id),
            })?;
        
        // Export schema as JSON
        self.exporter.export_schema(&schema, output_path).await
    }
    
    /// Get supported export formats
    pub fn supported_formats(&self) -> Vec<String> {
        self.exporter.supported_formats()
    }
}

impl QualityService {
    /// Create new quality service
    pub fn new(
        validator: Arc<dyn DataValidatorPort>,
        repository: Arc<dyn RepositoryPort>,
        metrics: Arc<dyn MetricsPort>,
    ) -> Self {
        Self {
            validator,
            repository,
            metrics,
        }
    }
    
    /// Analyze dataset quality
    pub async fn analyze_dataset(&self, dataset_id: Uuid) -> Result<QualityReport> {
        // Load dataset
        let dataset = self.repository.load_dataset(dataset_id).await?
            .ok_or_else(|| crate::CoreError::Validation {
                message: format!("Dataset with id {} not found", dataset_id),
            })?;
        
        // Perform analysis using domain service
        let report = QualityAnalysisService::analyze_dataset(&dataset)?;
        
        // Record metrics
        self.metrics.record_validation_result(
            report.overall_score > 0.8,
            report.constraint_violations.len(),
        ).await;
        
        Ok(report)
    }
    
    /// Validate dataset against schema
    pub async fn validate_dataset(&self, dataset_id: Uuid) -> Result<Vec<String>> {
        // Load dataset
        let dataset = self.repository.load_dataset(dataset_id).await?
            .ok_or_else(|| crate::CoreError::Validation {
                message: format!("Dataset with id {} not found", dataset_id),
            })?;
        
        // Use validator port for detailed validation
        self.validator.validate_dataset(&dataset).await
            .map(|report| {
                report.constraint_violations
                    .into_iter()
                    .map(|v| v.message)
                    .collect()
            })
    }
    
    /// Get quality summary for dataset
    pub async fn get_quality_summary(&self, dataset_id: Uuid) -> Result<QualitySummary> {
        let report = self.analyze_dataset(dataset_id).await?;
        
        Ok(QualitySummary {
            dataset_id,
            overall_score: report.overall_score,
            total_rows: report.total_rows,
            total_violations: report.constraint_violations.len(),
            field_count: report.field_analyses.len(),
            analysis_timestamp: report.analysis_timestamp,
        })
    }
}

/// Export operation result
#[derive(Debug, Clone, serde::Serialize, serde::Deserialize)]
pub struct ExportResult {
    /// Dataset that was exported
    pub dataset_id: Uuid,
    /// Export format used
    pub format: String,
    /// Output file path
    pub output_path: String,
    /// Size of exported file in bytes
    pub file_size_bytes: usize,
    /// Export time in milliseconds
    pub export_time_ms: u64,
    /// Number of rows exported
    pub rows_exported: usize,
}

/// Quality summary for quick overview
#[derive(Debug, Clone, serde::Serialize, serde::Deserialize)]
pub struct QualitySummary {
    /// Dataset ID
    pub dataset_id: Uuid,
    /// Overall quality score
    pub overall_score: f64,
    /// Total number of rows
    pub total_rows: usize,
    /// Total constraint violations
    pub total_violations: usize,
    /// Number of fields analyzed
    pub field_count: usize,
    /// When analysis was performed
    pub analysis_timestamp: chrono::DateTime<chrono::Utc>,
}