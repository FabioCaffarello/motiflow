//! Port interfaces following Clean Architecture principles
//! 
//! Ports define the interfaces between the domain layer and the outside world.
//! They are implemented by adapters in the infrastructure layer.

use crate::{Result, domain::*};
use async_trait::async_trait;

/// Data generator port - generates synthetic data based on specifications
///
/// This trait defines the interface for generating synthetic data.
/// Implementations should be provided by the infrastructure layer.
///
/// # Thread Safety
///
/// Implementations must be `Send + Sync` to be used in multi-threaded contexts.
#[async_trait]
pub trait DataGeneratorPort: Send + Sync {
    /// Generate a single value based on field definition
    ///
    /// # Arguments
    ///
    /// * `field` - The field definition specifying how to generate the value
    ///
    /// # Returns
    ///
    /// A generated `DataValue` matching the field definition
    async fn generate_value(&self, field: &FieldDefinition) -> Result<DataValue>;
    
    /// Generate multiple values efficiently
    ///
    /// This method should be optimized for batch generation.
    ///
    /// # Arguments
    ///
    /// * `field` - The field definition
    /// * `count` - Number of values to generate
    ///
    /// # Returns
    ///
    /// A vector of generated values
    async fn generate_values(&self, field: &FieldDefinition, count: usize) -> Result<Vec<DataValue>>;
    
    /// Generate a complete row based on schema
    ///
    /// Generates all fields in the schema according to their definitions.
    ///
    /// # Arguments
    ///
    /// * `schema` - The schema defining the row structure
    ///
    /// # Returns
    ///
    /// A complete `DataRow` with all fields generated
    async fn generate_row(&self, schema: &DataSchema) -> Result<DataRow>;
    
    /// Generate multiple rows efficiently
    ///
    /// This method should be optimized for batch generation and may use parallelism.
    ///
    /// # Arguments
    ///
    /// * `schema` - The schema defining the row structure
    /// * `count` - Number of rows to generate
    ///
    /// # Returns
    ///
    /// A vector of generated rows
    async fn generate_rows(&self, schema: &DataSchema, count: usize) -> Result<Vec<DataRow>>;
}

/// Data validation port - validates data against schemas and business rules
#[async_trait]
pub trait DataValidatorPort: Send + Sync {
    /// Validate a single value against field definition
    async fn validate_value(&self, value: &DataValue, field: &FieldDefinition) -> Result<bool>;
    
    /// Validate a row against schema
    async fn validate_row(&self, row: &DataRow, schema: &DataSchema) -> Result<Vec<String>>;
    
    /// Validate an entire dataset
    async fn validate_dataset(&self, dataset: &DataSet) -> Result<QualityReport>;
}

/// Repository port for persisting schemas and datasets
///
/// This trait defines the interface for data persistence.
/// Implementations can use various storage backends (memory, file system, database, etc.).
///
/// # Thread Safety
///
/// Implementations must be `Send + Sync` to be used in multi-threaded contexts.
#[async_trait]
pub trait RepositoryPort: Send + Sync {
    /// Schema operations
    async fn save_schema(&self, schema: &DataSchema) -> Result<()>;
    async fn load_schema(&self, id: uuid::Uuid) -> Result<Option<DataSchema>>;
    async fn delete_schema(&self, id: uuid::Uuid) -> Result<()>;
    async fn list_schemas(&self) -> Result<Vec<DataSchema>>;
    
    /// Dataset operations
    async fn save_dataset(&self, dataset: &DataSet) -> Result<()>;
    async fn load_dataset(&self, id: uuid::Uuid) -> Result<Option<DataSet>>;
    async fn delete_dataset(&self, id: uuid::Uuid) -> Result<()>;
    async fn list_datasets(&self) -> Result<Vec<DataSet>>;
    
    /// Batch operations for performance
    async fn save_rows(&self, dataset_id: uuid::Uuid, rows: &[DataRow]) -> Result<()>;
    async fn load_rows(&self, dataset_id: uuid::Uuid, limit: Option<usize>, offset: Option<usize>) -> Result<Vec<DataRow>>;
}

/// Export port for outputting data in various formats
#[async_trait]
pub trait DataExporterPort: Send + Sync {
    /// Export dataset as CSV
    async fn export_csv(&self, dataset: &DataSet, path: &str) -> Result<()>;
    
    /// Export dataset as JSON
    async fn export_json(&self, dataset: &DataSet, path: &str) -> Result<()>;
    
    /// Export dataset as Parquet
    async fn export_parquet(&self, dataset: &DataSet, path: &str) -> Result<()>;
    
    /// Export schema as JSON
    async fn export_schema(&self, schema: &DataSchema, path: &str) -> Result<()>;
    
    /// Get supported export formats
    fn supported_formats(&self) -> Vec<String>;
}

/// Configuration port for loading settings and parameters
pub trait ConfigurationPort: Send + Sync {
    /// Load configuration from various sources
    fn load_config(&self) -> Result<GenerationConfig>;
    
    /// Validate configuration
    fn validate_config(&self, config: &GenerationConfig) -> Result<()>;
    
    /// Get default configuration
    fn default_config(&self) -> GenerationConfig;
}

/// Metrics and monitoring port
#[async_trait]
pub trait MetricsPort: Send + Sync {
    /// Record generation metrics
    async fn record_generation_time(&self, duration_ms: u64, rows_generated: usize);
    
    /// Record validation metrics
    async fn record_validation_result(&self, success: bool, errors_found: usize);
    
    /// Record export metrics
    async fn record_export_operation(&self, format: &str, size_bytes: usize, duration_ms: u64);
    
    /// Get performance statistics
    async fn get_performance_stats(&self) -> Result<PerformanceStats>;
}

/// Performance statistics
#[derive(Debug, Clone, serde::Serialize, serde::Deserialize)]
pub struct PerformanceStats {
    /// Average generation time per row in milliseconds
    pub avg_generation_time_per_row_ms: f64,
    
    /// Total rows generated
    pub total_rows_generated: usize,
    
    /// Total validation operations
    pub total_validations: usize,
    
    /// Validation success rate
    pub validation_success_rate: f64,
    
    /// Export operations count
    pub export_operations: usize,
    
    /// Average export speed in MB/s
    pub avg_export_speed_mbps: f64,
}

/// Generation configuration
#[derive(Debug, Clone, serde::Serialize, serde::Deserialize)]
pub struct GenerationConfig {
    /// Maximum memory usage in bytes
    pub max_memory_bytes: usize,
    
    /// Number of worker threads
    pub worker_threads: usize,
    
    /// Batch size for generation
    pub batch_size: usize,
    
    /// Enable validation during generation
    pub enable_validation: bool,
    
    /// Random seed for reproducible generation
    pub random_seed: Option<u64>,
    
    /// Quality thresholds
    pub quality_thresholds: QualityThresholds,
    
    /// Export settings
    pub export_settings: ExportSettings,
}

/// Quality validation thresholds
#[derive(Debug, Clone, serde::Serialize, serde::Deserialize)]
pub struct QualityThresholds {
    /// Minimum overall quality score (0.0 to 1.0)
    pub min_quality_score: f64,
    
    /// Maximum null percentage allowed
    pub max_null_percentage: f64,
    
    /// Minimum type consistency required
    pub min_type_consistency: f64,
    
    /// Maximum constraint violations allowed
    pub max_constraint_violations: usize,
}

/// Export format settings
#[derive(Debug, Clone, serde::Serialize, serde::Deserialize)]
pub struct ExportSettings {
    /// Default export format
    pub default_format: String,
    
    /// CSV specific settings
    pub csv_delimiter: String,
    
    /// JSON formatting options
    pub json_pretty_print: bool,
    
    /// Compression settings
    pub enable_compression: bool,
    
    /// Maximum file size before splitting
    pub max_file_size_bytes: usize,
}

impl Default for GenerationConfig {
    fn default() -> Self {
        Self {
            max_memory_bytes: 1024 * 1024 * 1024, // 1GB
            worker_threads: num_cpus::get(),
            batch_size: 1000,
            enable_validation: true,
            random_seed: None,
            quality_thresholds: QualityThresholds {
                min_quality_score: 0.8,
                max_null_percentage: 0.1,
                min_type_consistency: 0.95,
                max_constraint_violations: 10,
            },
            export_settings: ExportSettings {
                default_format: "csv".to_string(),
                csv_delimiter: ",".to_string(),
                json_pretty_print: true,
                enable_compression: false,
                max_file_size_bytes: 100 * 1024 * 1024, // 100MB
            },
        }
    }
}

impl GenerationConfig {
    /// Validate configuration values and return errors if invalid
    ///
    /// # Returns
    ///
    /// `Ok(())` if configuration is valid, `Err(CoreError)` with validation messages if invalid
    ///
    /// # Example
    ///
    /// ```rust
    /// use synthetic_data_core::ports::*;
    ///
    /// let mut config = GenerationConfig::default();
    /// config.max_memory_bytes = 0; // Invalid
    ///
    /// if let Err(e) = config.validate() {
    ///     println!("Configuration error: {}", e);
    /// }
    /// ```
    pub fn validate(&self) -> crate::Result<()> {
        // Validate memory limits
        if self.max_memory_bytes == 0 {
            return Err(crate::CoreError::Configuration {
                source: anyhow::anyhow!("max_memory_bytes must be greater than 0"),
            });
        }
        
        if self.max_memory_bytes > 1024 * 1024 * 1024 * 1024 { // 1TB
            return Err(crate::CoreError::Configuration {
                source: anyhow::anyhow!("max_memory_bytes exceeds maximum allowed (1TB)"),
            });
        }
        
        // Validate thread count
        if self.worker_threads == 0 {
            return Err(crate::CoreError::Configuration {
                source: anyhow::anyhow!("worker_threads must be greater than 0"),
            });
        }
        
        if self.worker_threads > 128 {
            return Err(crate::CoreError::Configuration {
                source: anyhow::anyhow!("worker_threads exceeds maximum allowed (128)"),
            });
        }
        
        // Validate batch size
        if self.batch_size == 0 {
            return Err(crate::CoreError::Configuration {
                source: anyhow::anyhow!("batch_size must be greater than 0"),
            });
        }
        
        if self.batch_size > 1_000_000 {
            return Err(crate::CoreError::Configuration {
                source: anyhow::anyhow!("batch_size exceeds maximum allowed (1,000,000)"),
            });
        }
        
        // Validate quality thresholds
        if self.quality_thresholds.min_quality_score < 0.0 || self.quality_thresholds.min_quality_score > 1.0 {
            return Err(crate::CoreError::Configuration {
                source: anyhow::anyhow!("min_quality_score must be between 0.0 and 1.0"),
            });
        }
        
        if self.quality_thresholds.max_null_percentage < 0.0 || self.quality_thresholds.max_null_percentage > 1.0 {
            return Err(crate::CoreError::Configuration {
                source: anyhow::anyhow!("max_null_percentage must be between 0.0 and 1.0"),
            });
        }
        
        if self.quality_thresholds.min_type_consistency < 0.0 || self.quality_thresholds.min_type_consistency > 1.0 {
            return Err(crate::CoreError::Configuration {
                source: anyhow::anyhow!("min_type_consistency must be between 0.0 and 1.0"),
            });
        }
        
        // Validate export settings
        if self.export_settings.csv_delimiter.is_empty() {
            return Err(crate::CoreError::Configuration {
                source: anyhow::anyhow!("csv_delimiter cannot be empty"),
            });
        }
        
        if self.export_settings.max_file_size_bytes == 0 {
            return Err(crate::CoreError::Configuration {
                source: anyhow::anyhow!("max_file_size_bytes must be greater than 0"),
            });
        }
        
        Ok(())
    }
    
    /// Create a validated configuration with safe defaults
    ///
    /// This method creates a default configuration and validates it,
    /// ensuring it's safe to use.
    pub fn validated_default() -> crate::Result<Self> {
        let config = Self::default();
        config.validate()?;
        Ok(config)
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    
    #[test]
    fn test_config_validation_success() {
        let config = GenerationConfig::default();
        assert!(config.validate().is_ok());
    }
    
    #[test]
    fn test_config_validation_invalid_memory() {
        let mut config = GenerationConfig::default();
        config.max_memory_bytes = 0;
        assert!(config.validate().is_err());
        
        config.max_memory_bytes = 1024 * 1024 * 1024 * 1024 + 1; // > 1TB
        assert!(config.validate().is_err());
    }
    
    #[test]
    fn test_config_validation_invalid_threads() {
        let mut config = GenerationConfig::default();
        config.worker_threads = 0;
        assert!(config.validate().is_err());
        
        config.worker_threads = 129; // > 128
        assert!(config.validate().is_err());
    }
    
    #[test]
    fn test_config_validation_invalid_batch_size() {
        let mut config = GenerationConfig::default();
        config.batch_size = 0;
        assert!(config.validate().is_err());
        
        config.batch_size = 1_000_001; // > 1M
        assert!(config.validate().is_err());
    }
    
    #[test]
    fn test_config_validation_invalid_quality_thresholds() {
        let mut config = GenerationConfig::default();
        config.quality_thresholds.min_quality_score = -0.1;
        assert!(config.validate().is_err());
        
        config.quality_thresholds.min_quality_score = 1.1;
        assert!(config.validate().is_err());
        
        config.quality_thresholds.min_quality_score = 0.8; // Reset
        config.quality_thresholds.max_null_percentage = -0.1;
        assert!(config.validate().is_err());
        
        config.quality_thresholds.max_null_percentage = 1.1;
        assert!(config.validate().is_err());
    }
    
    #[test]
    fn test_config_validation_invalid_export_settings() {
        let mut config = GenerationConfig::default();
        config.export_settings.csv_delimiter = String::new();
        assert!(config.validate().is_err());
        
        config.export_settings.csv_delimiter = ",".to_string(); // Reset
        config.export_settings.max_file_size_bytes = 0;
        assert!(config.validate().is_err());
    }
    
    #[test]
    fn test_validated_default() {
        let config = GenerationConfig::validated_default();
        assert!(config.is_ok());
    }
}
