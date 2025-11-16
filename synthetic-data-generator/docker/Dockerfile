# Production Dockerfile for Synthetic Data Generator
# Multi-stage build optimized for security, size, and performance
FROM rust:1.82-slim-bookworm AS builder

# Install system dependencies in single layer
RUN apt-get update && apt-get install -y \
    pkg-config \
    libssl-dev \
    build-essential \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/* \
    && apt-get clean

# Create build user for security
RUN useradd -m -u 1001 builder
USER builder
WORKDIR /home/builder/workspace

# Copy workspace configuration first (better cache layers)
COPY --chown=builder:builder Cargo.toml ./
COPY --chown=builder:builder core/Cargo.toml ./core/
COPY --chown=builder:builder infrastructure/Cargo.toml ./infrastructure/
COPY --chown=builder:builder application/Cargo.toml ./application/
COPY --chown=builder:builder cli/Cargo.toml ./cli/

# Create dummy source files for dependency caching
RUN mkdir -p core/src infrastructure/src application/src cli/src \
    && echo "fn main() {}" > core/src/lib.rs \
    && echo "fn main() {}" > infrastructure/src/lib.rs \
    && echo "fn main() {}" > application/src/lib.rs \
    && echo "fn main() {}" > cli/src/main.rs

# Build dependencies only (cached layer)
ENV CARGO_INCREMENTAL=0
ENV CARGO_NET_RETRY=10
ENV RUSTUP_MAX_RETRIES=10
RUN cargo build --workspace --release

# Copy source code and rebuild
COPY --chown=builder:builder . .
# Touch all source files to ensure rebuild
RUN find . -name "*.rs" -exec touch {} \;
RUN cargo build --workspace --release

# Runtime stage - distroless for maximum security
FROM gcr.io/distroless/cc-debian11:nonroot

# Copy binary from builder stage
COPY --from=builder /home/builder/workspace/target/release/syngen /usr/local/bin/syngen

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD ["/usr/local/bin/syngen", "--version"]

# Metadata
LABEL maintainer="synthetic-data-generator-team" \
      version="0.1.0" \
      description="High-performance synthetic data generator" \
      org.opencontainers.image.source="https://github.com/yourorg/synthetic-data-generator"

# Run as non-root user (distroless nonroot user)
USER nonroot:nonroot

# Set entrypoint
ENTRYPOINT ["/usr/local/bin/syngen"]
CMD ["--help"]