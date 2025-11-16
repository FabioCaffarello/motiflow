# Docker Setup for Synthetic Data Generator

This directory contains Docker configurations for development, testing, and production deployment of the Synthetic Data Generator.

## 🐳 Available Images

### Production Image (`Dockerfile`)

- **Size**: Ultra-optimized multi-stage build (36.6MB final image)
- **Base**: Google Distroless CC (minimal container)
- **Security**: Non-root user, no shell, minimal attack surface
- **Use Cases**: Production deployment, cloud-native environments

### Simple Production Image (`Dockerfile.simple`)

- **Size**: Standard production build (151MB)
- **Base**: Debian Bookworm Slim
- **Security**: Non-root user, minimal dependencies
- **Use Cases**: Compatibility fallback, debugging production issues

### Development Image (`Dockerfile.dev`)

- **Size**: Full development environment (~2GB)
- **Base**: Rust official image with dev tools
- **Features**: Hot-reload, debugging tools, cargo-watch
- **Use Cases**: Local development, CI/CD testing

## 🎯 Which Image to Use?

- **`synthetic-data-generator:latest`** (36.6MB) - Use for production, Kubernetes, cloud deployment
- **`synthetic-data-generator:simple`** (151MB) - Use when you need shell access or debugging
- **`synthetic-data-generator:dev`** (~2GB) - Use for local development only

## 🚀 Quick Start

### Development Environment

```bash
# Start development container with hot-reload
make docker-dev

# Or manually:
docker-compose -f docker/docker-compose.yml up dev
```

### Production Testing

```bash
# Build and test production image
make docker-prod-test

# Or manually:
docker build -f docker/Dockerfile -t synthetic-data-generator .
docker run synthetic-data-generator --help
```

## 📋 Available Services

### Development (`dev`)

Interactive development environment with:

- Volume mounting for hot-reload
- Cargo cache optimization
- Debug logging enabled
- Port 8080 exposed for future API

```bash
docker-compose up dev
```

### Production Test (`prod-test`)

Production-like environment for testing:

- Minimal runtime image
- Read-only example files
- Optimized for size and security

```bash
docker-compose up prod-test
```

### Benchmarking (`benchmark`)

Performance testing environment:

- Full development tools
- Optimized cargo cache
- Benchmark profile enabled

```bash
docker-compose --profile benchmark up benchmark
```

### CI/CD (`ci`)

Automated testing pipeline:

- Format checking
- Linting with clippy
- Full test suite
- Release build verification

```bash
docker-compose --profile ci up ci
```

## ⚡ Performance Optimizations

### Multi-stage Builds

- Dependencies cached in separate layer
- Source code changes don't invalidate dependency cache
- Final image contains only runtime artifacts

### Volume Caching

- Cargo registry cached across container restarts
- Target directory cached for faster rebuilds
- Source code mounted with `:cached` option on macOS

### Build Context

- `.dockerignore` excludes unnecessary files
- Minimal context transfer to Docker daemon
- Optimized for CI/CD pipelines

## 🛠️ Development Workflow

### Local Development

```bash
# Start development environment
make docker-dev

# In container, run development commands
cargo watch -x "check --workspace"
cargo test --workspace
```

### Testing Production Build

```bash
# Build production image
make docker-build

# Test CLI functionality
docker run synthetic-data-generator --help
docker run synthetic-data-generator --version
```

### Running Benchmarks

```bash
# Run performance benchmarks
make docker-benchmark

# View results
docker-compose logs benchmark
```

## 🔒 Security Features

### Non-root Execution

- Production image runs as user `app` (uid: 1001)
- Development image runs as user `dev` (uid: 1001)
- No unnecessary privileges

### Minimal Attack Surface

- Production image based on slim Debian
- Only essential runtime dependencies
- No development tools in production

### Secure Defaults

- Read-only root filesystem (when possible)
- No shell access in production
- Explicit entrypoint and command

## 📊 Image Sizes

| Image                             | Size   | Use Case    | Notes                    |
| --------------------------------- | ------ | ----------- | ------------------------ |
| `synthetic-data-generator:latest` | 36.6MB | Production  | Distroless (optimized)   |
| `synthetic-data-generator:simple` | 151MB  | Production  | Debian-based (fallback)  |
| `synthetic-data-generator:dev`    | ~2GB   | Development | Full dev environment     |

## 🐛 Debugging

### Container Shell Access

```bash
# Development container
docker-compose exec dev bash

# Production container (debugging)
docker run -it --entrypoint bash synthetic-data-generator
```

### Log Analysis

```bash
# View container logs
docker-compose logs dev

# Follow logs in real-time
docker-compose logs -f dev
```

### Resource Usage

```bash
# Monitor container resources
docker stats

# Container inspection
docker inspect synthetic-data-generator
```

## 🚀 Deployment Examples

### Kubernetes Deployment

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: synthetic-data-generator
spec:
  replicas: 3
  selector:
    matchLabels:
      app: synthetic-data-generator
  template:
    metadata:
      labels:
        app: synthetic-data-generator
    spec:
      containers:
        - name: syngen
          image: synthetic-data-generator:latest
          ports:
            - containerPort: 8080
          resources:
            requests:
              memory: "64Mi"
              cpu: "100m"
            limits:
              memory: "256Mi"
              cpu: "500m"
```

### Docker Swarm

```bash
# Deploy as service
docker service create \
  --name synthetic-data-generator \
  --replicas 3 \
  --publish 8080:8080 \
  synthetic-data-generator:latest
```

## 🔧 Customization

### Environment Variables

- `RUST_LOG`: Logging level (debug, info, warn, error)
- `RUST_BACKTRACE`: Enable backtraces (0, 1, full)

### Volume Mounts

- `/workspace`: Development source code
- `/examples`: Example configuration files
- `/data`: Generated data output (production)

## 📝 Best Practices

1. **Use .dockerignore**: Exclude unnecessary files
2. **Multi-stage builds**: Separate build and runtime
3. **Cache optimization**: Layer dependencies separately
4. **Security**: Run as non-root user
5. **Size optimization**: Use slim base images
6. **Health checks**: Implement container health endpoints

## 🤝 Contributing

When adding new Docker features:

1. Update both Dockerfile and Dockerfile.dev
2. Add corresponding docker-compose service
3. Update Makefile targets
4. Test with `make docker-ci`
5. Update this documentation
