//! # Synthetic Data Infrastructure
//! 
//! Infrastructure layer with generators, memory management, and external adapters.
//! Contains concrete implementations of domain interfaces.
//!
//! ## Organization
//!
//! This layer is organized into:
//! - **capabilities/**: What the system can do (generators, validators, exporters)
//! - **adapters/**: How the system connects to the external world (memory, persistence, external APIs)

pub use synthetic_data_core::{CoreError, Result};

// Capabilities - what the system can do
pub mod capabilities;

// Adapters - how the system connects to the external world
// pub mod adapters;
