//! Data generators - implementations of DataGeneratorPort
//!
//! Generators create synthetic data based on field definitions and schemas.

pub mod data_generator;
pub mod string;

pub use data_generator::DefaultDataGenerator;
pub use string::StringGenerator;

