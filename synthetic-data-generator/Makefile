.PHONY: help build test lint format clean setup

help:
	@echo "Available targets:"
	@echo "  setup   - Install dependencies and setup development environment"
	@echo "  build   - Build all crates"
	@echo "  test    - Run all tests"
	@echo "  bench   - Run benchmarks"
	@echo "  lint    - Run clippy linter"
	@echo "  format  - Format code with rustfmt"
	@echo "  clean   - Clean build artifacts"
	@echo ""
	@echo "Docker targets:"
	@echo "  docker-build       - Build production Docker image (distroless)"
	@echo "  docker-build-simple - Build production Docker image (debian)"
	@echo "  docker-build-dev   - Build development Docker image"
	@echo "  docker-build-dev-clean - Clean rebuild of development image"
	@echo "  docker-dev         - Start development environment"
	@echo "  docker-dev-restart - Restart dev environment (fixes permissions)"
	@echo "  docker-dev-direct  - Start dev container directly (no compose)"
	@echo "  docker-dev-shell   - Connect to running dev container"
	@echo "  docker-dev-status  - Show dev container status"
	@echo "  docker-dev-logs    - Show dev container logs"
	@echo "  docker-dev-fix-permissions - Fix workspace permissions"
	@echo "  docker-dev-tools   - Install additional dev tools in running container"
	@echo "  docker-test        - Test production images"
	@echo "  docker-prod-test   - Test production image"
	@echo "  docker-benchmark   - Run benchmarks in Docker"
	@echo "  docker-ci          - Run CI pipeline in Docker"
	@echo "  docker-security    - Run security audit in Docker"
	@echo "  docker-size        - Show Docker image sizes"
	@echo "  docker-clean       - Clean Docker resources"
	@echo "  docker-clean-all   - Clean all Docker resources and cache"

setup:
	rustup component add clippy rustfmt
	cargo install cargo-audit

build:
	cargo build --workspace

test:
	cargo test --workspace

lint:
	cargo clippy --all-targets --all-features -- -D warnings

format:
	cargo fmt --all

clean:
	cargo clean

# Development commands
dev-test:
	cargo watch -x "test --workspace"

dev-check:
	cargo watch -x "check --workspace"

audit:
	cargo audit

# Release commands
release-build:
	cargo build --release --workspace

release-test:
	cargo test --release --workspace

# Docker commands
docker-build:
	@echo "🔧 Generating Cargo.lock for Docker build..."
	cargo generate-lockfile
	@echo "🐳 Building production Docker image..."
	DOCKER_BUILDKIT=1 docker build -f docker/Dockerfile -t synthetic-data-generator:latest .

docker-build-dev:
	@echo "🔧 Building development Docker image..."
	DOCKER_BUILDKIT=1 docker build -f docker/Dockerfile.dev -t synthetic-data-generator:dev .

docker-build-dev-clean:
	@echo "🧹 Cleaning and rebuilding development Docker image..."
	docker rmi synthetic-data-generator:dev 2>/dev/null || true
	DOCKER_BUILDKIT=1 docker build --no-cache -f docker/Dockerfile.dev -t synthetic-data-generator:dev .

docker-build-simple:
	@echo "🔧 Generating Cargo.lock for Docker build..."
	cargo generate-lockfile
	@echo "🐳 Building simple production Docker image..."
	DOCKER_BUILDKIT=1 docker build -f docker/Dockerfile.simple -t synthetic-data-generator:simple .

docker-dev:
	docker compose -f docker/docker-compose.yml up -d --build dev

docker-dev-restart:
	@echo "🔄 Restarting development container with correct permissions..."
	docker compose -f docker/docker-compose.yml down
	docker compose -f docker/docker-compose.yml up -d --build dev

docker-dev-stop:
	@echo "🐳 Stopping development container..."
	docker compose -f docker/docker-compose.yml down
	

docker-dev-direct:
	@echo "🐳 Starting development container directly..."
	docker run -it --rm \
		-v $$(pwd):/workspace \
		-v cargo-cache:/usr/local/cargo/registry \
		-p 8080:8080 \
		--name synthetic-data-dev \
		synthetic-data-generator:dev bash

docker-dev-tools:
	@echo "🔧 Installing additional development tools in running container..."
	@echo "Note: Run this after 'make docker-dev' to install cargo-audit, cargo-outdated, etc."
	docker exec -it docker-dev-1 bash -c "cargo install cargo-audit cargo-outdated cargo-deny"

docker-dev-shell:
	@echo "🐚 Connecting to development container..."
	docker exec -it docker-dev-1 bash

docker-dev-status:
	@echo "📊 Development container status:"
	@docker ps --filter "name=docker-dev-1" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"

docker-dev-logs:
	@echo "📋 Development container logs:"
	docker logs docker-dev-1

docker-dev-fix-permissions:
	@echo "🔧 Fixing workspace permissions..."
	docker exec -it --user root docker-dev-1 chown -R dev:dev /workspace
	@echo "✅ Permissions fixed! You can now run cargo commands."

docker-test:
	@echo "🧪 Testing production images..."
	@echo "Testing distroless image:"
	docker run --rm synthetic-data-generator:latest --help
	@echo ""
	@echo "Testing simple image:"
	docker run --rm synthetic-data-generator:simple --help

docker-prod-test:
	docker compose -f docker/docker-compose.yml up --build prod-test

docker-benchmark:
	docker compose -f docker/docker-compose.yml --profile benchmark up --build benchmark

docker-ci:
	docker compose -f docker/docker-compose.yml --profile ci up --build ci

docker-security:
	docker compose -f docker/docker-compose.yml --profile security up --build security

docker-clean:
	docker compose -f docker/docker-compose.yml down -v --remove-orphans
	docker system prune -f --volumes

docker-clean-all:
	docker compose -f docker/docker-compose.yml down -v --remove-orphans
	docker system prune -af --volumes
	docker builder prune -af

docker-logs:
	docker compose -f docker/docker-compose.yml logs -f

docker-shell:
	docker compose -f docker/docker-compose.yml exec dev bash

# Docker image management
docker-scan:
	docker scout quickview synthetic-data-generator:latest || echo "Docker Scout not available"
	
docker-size:
	@echo "📊 Docker Image Sizes:"
	@docker images synthetic-data-generator --format "table {{.Repository}}\t{{.Tag}}\t{{.Size}}\t{{.CreatedAt}}" 2>/dev/null || echo "No images found. Run 'make docker-build' first."

docker-inspect:
	docker inspect synthetic-data-generator:latest | jq '.[0] | {Config: .Config, Size: .Size}'