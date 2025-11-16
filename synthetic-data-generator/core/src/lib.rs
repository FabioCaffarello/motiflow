//! # Synthetic Data Core
//! 
//! Domain layer containing business logic, entities, and application services.
//! This crate implements Clean Architecture + Domain-Driven Design patterns.

pub mod domain;
pub mod ports;
pub mod application;

pub use domain::*;
pub use ports::*;

// Re-export commonly used external types
pub use uuid;
pub use chrono;

/// Core error type for the synthetic data generator
///
/// This error type is used throughout the domain and application layers.
/// It automatically implements `std::error::Error` and can be converted to `anyhow::Error`.
#[derive(thiserror::Error, Debug)]
pub enum CoreError {
    #[error("Validation error: {message}")]
    Validation { message: String },
    
    #[error("Configuration error: {source}")]
    Configuration { #[from] source: anyhow::Error },
    
    #[error("Generation error: {message}")]
    Generation { message: String },
    
    #[error("Schema error: {message}")]
    Schema { message: String },
    
    #[error("Field error: {message}")]
    Field { message: String },
    
    #[error("Type conversion error: {message}")]
    TypeConversion { message: String },
}

// Manual Serialize implementation because anyhow::Error doesn't implement Serialize
impl serde::Serialize for CoreError {
    fn serialize<S>(&self, serializer: S) -> std::result::Result<S::Ok, S::Error>
    where
        S: serde::Serializer,
    {
        use serde::ser::SerializeStruct;
        let mut state = serializer.serialize_struct("CoreError", 2)?;
        state.serialize_field("type", &format!("{:?}", self))?;
        state.serialize_field("message", &self.to_string())?;
        state.end()
    }
}

pub type Result<T> = std::result::Result<T, CoreError>;

// Re-export for convenience
pub use uuid::Uuid;
pub use chrono::{DateTime, Utc};

// Note: CoreError automatically implements std::error::Error via thiserror,
// so it can be converted to anyhow::Error using .into() or ? operator
