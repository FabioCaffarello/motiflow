# Synthetic Data Generator

High-performance Rust library for generating realistic synthetic data with NUMA-aware memory management and SIMD optimizations.

## 🏗️ Architecture

This project follows Clean Architecture + Domain-Driven Design principles:

```sh
┌─────────────────┐    ┌─────────────────┐
│   CLI Binary    │    │   Future API    │
│   (Interface)   │    │   (Interface)   │
└─────────┬───────┘    └─────────┬───────┘
          │                      │
          └──────────┬───────────┘
                     │
          ┌─────────────────┐
          │  Application    │  ← Orchestration, Use Cases
          │     Layer       │
          └─────────┬───────┘
                    │
          ┌─────────────────┐
          │   Core Domain   │  ← Business Logic, Entities
          │     Layer       │
          └─────────┬───────┘
                    │
          ┌─────────────────┐
          │ Infrastructure  │  ← Generators, NUMA, Config
          │     Layer       │
          └─────────────────┘
```

## 🚀 Quick Start

### Prerequisites

- Rust 1.75+ with Cargo
- Make (optional, for convenience commands)

### Setup

```bash
# Clone repository
git clone <repository-url>
cd synthetic_data_generator

# Setup development environment
make setup

# Build all crates
make build

# Run tests
make test
```

### Usage

```bash
# Generate data from schema
./target/debug/syngen --schema examples/user_schema.yaml --count 1000

# Run with specific generator
./target/debug/syngen --generator string --pattern "[A-Z]{3}[0-9]{4}"
```

## 🎯 Performance Targets

- **Throughput**: ≥10,000 strings/ms
- **Memory Overhead**: <2% for NUMA allocation
- **Latency**: P99 < 10ms for batch operations
- **Availability**: 99.9% uptime for long-running generation

## 📚 Crate Organization

### Core (`core/`)

Domain entities, business logic, and application services.

- **Domain**: `Schema`, `Field`, `DataType` entities
- **Application**: `GeneratorService`, use case implementations
- **Ports**: Interface traits for external dependencies

### Infrastructure (`infrastructure/`)

Concrete implementations of generators and system integrations.

- **Generators**: String, number, date/time generators with SIMD
- **Memory**: NUMA-aware allocator and memory pools
- **Config**: YAML parsing and validation

### Application (`application/`)

Application layer components and interfaces.

- **CLI**: Command-line argument parsing and user interface
- **API**: Future REST API endpoints
- **Orchestration**: Workflow management and coordination

### CLI (`cli/`)

Binary executable providing command-line interface.

## 🛠️ Development

### Available Commands

```bash
make help       # Show all available commands
make setup      # Install development dependencies
make build      # Build all crates
make test       # Run test suite
make bench      # Run performance benchmarks
make lint       # Run clippy linter
make format     # Format code with rustfmt
make clean      # Clean build artifacts
```

### Project Structure

```
synthetic_data_generator/
├── Cargo.toml              # Workspace configuration
├── Makefile                # Development commands
├── README.md               # This file
├── core/                   # 🔷 Domain & Application Layer
│   ├── Cargo.toml
│   └── src/
│       ├── lib.rs
│       ├── domain/         # Entities, Value Objects
│       ├── application/    # Use Cases, Services
│       └── ports/          # Interface Traits
├── infrastructure/         # 🔧 Infrastructure Layer
│   ├── Cargo.toml
│   └── src/
│       ├── lib.rs
│       ├── config/         # Configuration parsing
│       ├── generators/     # Concrete implementations
│       ├── memory/         # NUMA allocator, pools
│       └── persistence/    # Future: database adapters
├── application/            # 🚀 Application Layer
│   ├── Cargo.toml
│   └── src/
│       ├── lib.rs
│       ├── cli/            # Command-line interface
│       ├── api/            # Future: REST API
│       └── orchestration/  # Workflow management
└── cli/                    # 📟 CLI Binary
    ├── Cargo.toml
    └── src/
        └── main.rs
```

### Testing Strategy

- **Unit Tests**: Individual component testing
- **Integration Tests**: Cross-crate functionality
- **Property Tests**: QuickCheck for input validation
- **Benchmarks**: Performance regression detection

### Development Workflow

1. Make changes to code
2. Run `make format` to format code
3. Run `make lint` to check for issues
4. Run `make test` to verify functionality
5. Run `make build` to ensure compilation
6. Commit changes

## 📊 Performance Monitoring

Performance benchmarks are tracked for:

- Generator throughput measurements
- Memory allocation efficiency
- NUMA locality effectiveness
- SIMD optimization impact

Run benchmarks with:

```bash
make bench
```

## 🔧 Configuration

### Dependencies

The project uses a workspace-level dependency management approach:

#### Core Dependencies

- `tokio`: Async runtime
- `serde`: Serialization framework
- `anyhow`/`thiserror`: Error handling
- `tracing`: Logging and observability

#### Performance Dependencies

- `rayon`: Data parallelism
- `crossbeam`: Lock-free concurrency
- `parking_lot`: High-performance synchronization
- `libc`/`memmap2`: Low-level memory management

#### Development Dependencies

- `criterion`: Benchmarking framework
- `proptest`/`quickcheck`: Property-based testing
- `tempfile`: Temporary file utilities

## 🚦 Current Status

### Phase 1: Foundation Infrastructure ✅

- [x] **Workspace Setup** - Multi-crate architecture established
- [ ] **Domain Model** - Core entities and business logic
- [ ] **Configuration System** - YAML parsing and validation
- [ ] **Memory Management** - NUMA-aware allocators
- [ ] **Core Generators** - String, number, date/time generation

### Future Phases

- **Phase 2**: Advanced Generators
- **Phase 3**: Distribution & Scaling
- **Phase 4**: Machine Learning Integration

## 🤝 Contributing

1. Follow Clean Architecture principles
2. Maintain separation of concerns between layers
3. Add comprehensive tests for new functionality
4. Run `make lint format` before committing
5. Update documentation for public APIs
6. Ensure backward compatibility

### Code Style

- Use `rustfmt` for consistent formatting
- Follow Rust naming conventions
- Add documentation comments for public APIs
- Prefer explicit error handling over panics

## 🔍 Troubleshooting

### Common Issues

#### Build Errors

```bash
# Clean and rebuild
make clean && make build

# Check specific crate
cargo check -p synthetic_data_core
```

#### Test Failures

```bash
# Run specific test
cargo test -p synthetic_data_core test_name

# Run with debug output
cargo test -- --nocapture
```

#### Performance Issues

```bash
# Profile with benchmarks
make bench

# Check for debug builds in production
cargo build --release
```
