# Multi-stage build for synthetic-data-generator
FROM rust:1.83-slim as builder

# Install build dependencies
RUN apt-get update && apt-get install -y \
    pkg-config \
    libssl-dev \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /workspace

# Copy workspace files for dependency caching
COPY synthetic-data-generator/Cargo.toml synthetic-data-generator/
COPY synthetic-data-generator/core/Cargo.toml synthetic-data-generator/core/
COPY synthetic-data-generator/infrastructure/Cargo.toml synthetic-data-generator/infrastructure/
COPY synthetic-data-generator/application/Cargo.toml synthetic-data-generator/application/
COPY synthetic-data-generator/cli/Cargo.toml synthetic-data-generator/cli/

# Create dummy source files for dependency caching
RUN mkdir -p synthetic-data-generator/core/src && \
    mkdir -p synthetic-data-generator/infrastructure/src && \
    mkdir -p synthetic-data-generator/application/src && \
    mkdir -p synthetic-data-generator/cli/src && \
    echo "fn main() {}" > synthetic-data-generator/cli/src/main.rs && \
    echo "pub fn dummy() {}" > synthetic-data-generator/core/src/lib.rs && \
    echo "pub fn dummy() {}" > synthetic-data-generator/infrastructure/src/lib.rs && \
    echo "pub fn dummy() {}" > synthetic-data-generator/application/src/lib.rs

# Build dependencies (cached layer)
RUN cd synthetic-data-generator && \
    cargo build --release --bin syngen && \
    rm -rf */src

# Copy actual source code
COPY synthetic-data-generator/ ./synthetic-data-generator/

# Build the actual binary
RUN cd synthetic-data-generator && \
    cargo build --release --bin syngen && \
    cp target/release/syngen /usr/local/bin/syngen

# Runtime stage
FROM debian:bookworm-slim

# Install runtime dependencies
RUN apt-get update && apt-get install -y \
    ca-certificates \
    libssl3 \
    && rm -rf /var/lib/apt/lists/*

# Create app user
RUN useradd -m -u 1000 appuser && \
    mkdir -p /app/data /app/config /app/output && \
    chown -R appuser:appuser /app

# Copy binary from builder
COPY --from=builder /usr/local/bin/syngen /usr/local/bin/syngen

# Set working directory
WORKDIR /app

# Switch to non-root user
USER appuser

# Default command - keep container running
# Use sleep infinity instead of tail to avoid issues
CMD ["sleep", "infinity"]
