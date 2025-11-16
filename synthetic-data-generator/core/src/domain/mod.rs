//! Domain layer - Business logic and entities
//! 
//! Contains the core business logic, entities, value objects,
//! and domain services for the synthetic data generation domain.

pub mod entities;
pub mod value_objects;
pub mod services;

// Re-export main domain types
pub use entities::*;
pub use value_objects::*;
pub use services::*;

// Re-export builders
pub use entities::builders::{DataSchemaBuilder, FieldDefinitionBuilder};