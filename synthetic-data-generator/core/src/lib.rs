//! # Synthetic Data Core
//! 
//! Domain layer containing business logic, entities, and application services.
//! This crate implements Clean Architecture + Domain-Driven Design patterns.

#[derive(thiserror::Error, Debug)]
pub enum CoreError {
    #[error("Validation error: {message}")]
    Validation { message: String },
    
    #[error("Configuration error: {source}")]
    Configuration { #[from] source: anyhow::Error },
    
    #[error("Generation error: {message}")]
    Generation { message: String },
}

pub type Result<T> = std::result::Result<T, CoreError>;

// Placeholder modules - will be implemented in subsequent tasks
// pub mod domain;
// pub mod application; 
// pub mod ports;

// Temporary placeholder function to avoid empty crate warnings
pub fn placeholder() -> &'static str {
    "Synthetic Data Core - Phase 1 Foundation"
}
