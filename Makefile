# Motiflow - Makefile
# ===================
# Comprehensive build system for Motiflow project
# Supports web app, workflows, and infrastructure management

.DEFAULT_GOAL := help
.PHONY: help install dev build test clean start stop restart logs status format lint check deploy-local deploy-prod backup restore

# Project directories
WEB_DIR = web/motia-bridge
WORKFLOWS_DIR = workflows/motia-flows
INFRA_DIR = infra/docker

# Docker configuration
DOCKER_COMPOSE = docker compose -f $(INFRA_DIR)/docker-compose.yaml
DOCKER_ENV = $(INFRA_DIR)/.env

# Python optimization environment variables
export PYTHONDONTWRITEBYTECODE = 1
export PYTHONUNBUFFERED = 1

export UV_NO_CACHE = 0

# Colors for output
RED = \033[0;31m
GREEN = \033[0;32m
YELLOW = \033[0;33m
BLUE = \033[0;34m
PURPLE = \033[0;35m
CYAN = \033[0;36m
WHITE = \033[0;37m
NC = \033[0m # No Color

# Help target
help: ## 📚 Show this help message
	@echo "$(CYAN)Motiflow Development Environment$(NC)"
	@echo "================================="
	@echo ""
	@echo "$(GREEN)Available targets:$(NC)"
	@awk 'BEGIN {FS = ":.*?## "} /^[a-zA-Z_-]+:.*?## / {printf "  $(YELLOW)%-20s$(NC) %s\n", $$1, $$2}' $(MAKEFILE_LIST)
	@echo ""
	@echo "$(BLUE)Project Structure:$(NC)"
	@echo "  • web/motia-bridge/     - NextJS web application"
	@echo "  • workflows/motia-flows/ - Motia workflow engine"
	@echo "  • infra/docker/         - Docker infrastructure (MinIO + Spark)"

# =============================================================================
# Installation & Setup
# =============================================================================

install: ## 📦 Install all dependencies (web + workflows + docker)
	@echo "$(GREEN)🚀 Installing all project dependencies...$(NC)"
	@$(MAKE) install-web
	@$(MAKE) install-workflows
	@$(MAKE) install-infra
	@echo "$(GREEN)✅ All dependencies installed successfully!$(NC)"

install-web: ## 🌐 Install web application dependencies
	@echo "$(BLUE)📱 Installing web dependencies...$(NC)"
	@cd $(WEB_DIR) && npm install
	@echo "$(GREEN)✅ Web dependencies installed$(NC)"

install-workflows: ## ⚙️ Install workflow engine dependencies
	@echo "$(PURPLE)⚡ Installing workflow dependencies...$(NC)"
	@cd $(WORKFLOWS_DIR) && npm install
	@echo "$(GREEN)✅ Workflow dependencies installed$(NC)"

install-infra: ## 🐳 Setup Docker infrastructure
	@echo "$(CYAN)🐳 Setting up Docker infrastructure...$(NC)"
	@echo "$(YELLOW)🔍 Checking uv availability...$(NC)"
	@if ! command -v uv >/dev/null 2>&1; then \
		echo "$(YELLOW)⚠️  uv not found. Installing uv...$(NC)"; \
		curl -LsSf https://astral.sh/uv/install.sh | sh; \
		echo "$(GREEN)✅ uv installed$(NC)"; \
	else \
		echo "$(GREEN)✅ uv is available$(NC)"; \
	fi
	@echo "$(YELLOW)⚙️  Setting up Docker environment files...$(NC)"
	@if [ ! -f $(DOCKER_ENV) ]; then \
		echo "$(YELLOW)📝 Creating .env file from template...$(NC)"; \
		if [ -f $(DOCKER_ENV).example ]; then \
			cp $(DOCKER_ENV).example $(DOCKER_ENV) && \
			sed -i '' '/# Copy this file to \.env and adjust values as needed/d' $(DOCKER_ENV); \
		else \
			echo "MINIO_USERNAME=minio\nMINIO_PASSWORD=minio123\nAWS_ACCESS_KEY_ID=minio\nAWS_SECRET_ACCESS_KEY=minio123\nMINIO_ACCESS_KEY=minio\nMINIO_SECRET_KEY=minio123" > $(DOCKER_ENV); \
		fi; \
		echo "$(GREEN)✅ .env file created$(NC)"; \
	else \
		echo "$(GREEN)✅ .env file already exists$(NC)"; \
	fi
	@if [ ! -f $(INFRA_DIR)/.env.next ]; then \
		echo "$(YELLOW)📝 Creating .env.next file from template...$(NC)"; \
		if [ -f $(INFRA_DIR)/.env.next.example ]; then \
			cp $(INFRA_DIR)/.env.next.example $(INFRA_DIR)/.env.next && \
			sed -i '' '/# Copy this file to \.env and adjust values as needed/d' $(INFRA_DIR)/.env.next; \
			echo "$(GREEN)✅ .env.next file created from template$(NC)"; \
		else \
			echo "$(YELLOW)⚠️  .env.next.example not found, creating minimal .env.next...$(NC)"; \
			echo "# NextJS Application Configuration for Docker\nPORT=4000\nMINIO_ENDPOINT=http://minio:9000\nMINIO_ACCESS_KEY=minio\nMINIO_SECRET_KEY=minio123\nMINIO_BUCKET=motiflow\nMINIO_USE_SSL=false\nNODE_ENV=production" > $(INFRA_DIR)/.env.next; \
			echo "$(GREEN)✅ .env.next file created with defaults$(NC)"; \
		fi; \
	else \
		echo "$(GREEN)✅ .env.next file already exists$(NC)"; \
	fi
	@echo "$(GREEN)✅ Infrastructure setup complete$(NC)"

# =============================================================================
# Development
# =============================================================================

dev: ## � Start full Docker development environment
	@echo "$(GREEN)� Starting full Docker development environment...$(NC)"
	@$(MAKE) start-infra
	@$(MAKE) start-all-docker
	@echo "$(GREEN)✅ Full Docker stack is running!$(NC)"
	@echo "$(CYAN)🌍 Service URLs:$(NC)"
	@echo "  • Motia Bridge:   http://localhost:4000"
	@echo "  • Motia Flows:    http://localhost:3000"
	@echo "  • MinIO Console:  http://localhost:9001"
	@echo "  • MinIO API:      http://localhost:9000"

dev-docker: ## 🐳 Alias for dev (Docker development stack)
	@$(MAKE) dev

# =============================================================================
# Building
# =============================================================================

build: ## 🏗️ Build all components
	@echo "$(GREEN)🏗️ Building all components...$(NC)"
	@$(MAKE) build-web
	@$(MAKE) build-workflows
	@$(MAKE) build-spark
	@echo "$(GREEN)✅ All components built successfully!$(NC)"

build-web: ## 🌐 Build web application for production
	@echo "$(BLUE)🌐 Building web application...$(NC)"
	@cd $(WEB_DIR) && npm run build
	@echo "$(GREEN)✅ Web application built$(NC)"

build-workflows: ## ⚙️ Build workflow engine
	@echo "$(PURPLE)⚙️ Building workflow engine...$(NC)"
	@cd $(WORKFLOWS_DIR) && npm run build
	@echo "$(GREEN)✅ Workflow engine built$(NC)"

build-spark: ## ⚡ Build Spark Connect Docker image
	@echo "$(PURPLE)⚡ Building Spark Connect Docker image...$(NC)"
	@$(DOCKER_COMPOSE) build spark-connect
	@echo "$(GREEN)✅ Spark Connect image built$(NC)"

# =============================================================================
# Testing
# =============================================================================

test: ## 🧪 Run all tests
	@echo "$(GREEN)🧪 Running all tests...$(NC)"
	@$(MAKE) test-web
	@$(MAKE) test-workflows
	@$(MAKE) test-spark-infra

test-web: ## 🌐 Run web application tests
	@echo "$(BLUE)🌐 Running web tests...$(NC)"
	@cd $(WEB_DIR) && npm test 2>/dev/null || echo "$(YELLOW)⚠️  No tests configured for web app$(NC)"

test-workflows: ## ⚙️ Run workflow engine tests
	@echo "$(PURPLE)⚙️ Running workflow tests...$(NC)"
	@cd $(WORKFLOWS_DIR) && npm test 2>/dev/null || echo "$(YELLOW)⚠️  No tests configured for workflows$(NC)"

test-spark-infra: ## ⚡ Test Spark Connect infrastructure
	@echo "$(PURPLE)⚡ Testing Spark Connect infrastructure...$(NC)"
	@if [ ! -d "infra-testing/spark" ]; then \
		echo "$(RED)❌ Spark infrastructure test directory not found$(NC)"; \
		exit 1; \
	fi
	@echo "$(YELLOW)🧪 Running Spark Connect tests with uv...$(NC)"
	@cd infra-testing/spark && \
	trap 'rm -rf .uv_tmp __pycache__ *.pyc 2>/dev/null || true' EXIT && \
	uv run --no-project main.py
	@echo "$(GREEN)✅ Spark infrastructure tests completed$(NC)"

test-csv-datasets: ## 📊 Test CSV datasets with Spark Connect
	@echo "$(PURPLE)📊 Testing CSV datasets with Spark Connect...$(NC)"
	@if [ ! -d "infra-testing/spark" ]; then \
		echo "$(RED)❌ Spark infrastructure test directory not found$(NC)"; \
		exit 1; \
	fi
	@if [ ! -d "datasets-examples" ]; then \
		echo "$(RED)❌ Examples directory not found$(NC)"; \
		exit 1; \
	fi
	@echo "$(YELLOW)📁 Testing CSV loading and analysis...$(NC)"
	@cd infra-testing/spark && \
	trap 'rm -rf .uv_tmp __pycache__ *.pyc 2>/dev/null || true' EXIT && \
	uv run --no-project test_csv_datasets.py
	@echo "$(GREEN)✅ CSV dataset tests completed$(NC)"

test-docker-stack: ## 🐳 Test complete Docker stack integration
	@echo "$(CYAN)🐳 Testing complete Docker stack integration...$(NC)"
	@echo "$(YELLOW)⏳ Checking all services are running...$(NC)"
	@if ! $(DOCKER_COMPOSE) ps | grep -q "Up.*minio"; then \
		echo "$(RED)❌ MinIO not running - run 'make start-infra'$(NC)"; \
		exit 1; \
	fi
	@if ! $(DOCKER_COMPOSE) ps | grep -q "Up.*spark-connect"; then \
		echo "$(RED)❌ Spark Connect not running - run 'make start-spark'$(NC)"; \
		exit 1; \
	fi
	@if ! $(DOCKER_COMPOSE) ps | grep -q "Up.*motia-flows"; then \
		echo "$(RED)❌ Motia Flows not running - run 'make start-motia-docker'$(NC)"; \
		exit 1; \
	fi
	@if ! $(DOCKER_COMPOSE) ps | grep -q "Up.*motia-bridge"; then \
		echo "$(RED)❌ Motia Bridge not running - run 'make start-bridge-docker'$(NC)"; \
		exit 1; \
	fi
	@echo "$(GREEN)✅ All Docker services are running$(NC)"
	@echo "$(YELLOW)🧪 Testing service connectivity...$(NC)"
	@curl -s http://localhost:4000 >/dev/null && echo "$(GREEN)✅ Motia Bridge accessible$(NC)" || echo "$(RED)❌ Motia Bridge not accessible$(NC)"
	@curl -s http://localhost:3000 >/dev/null && echo "$(GREEN)✅ Motia Flows accessible$(NC)" || echo "$(RED)❌ Motia Flows not accessible$(NC)"
	@curl -s http://localhost:9001 >/dev/null && echo "$(GREEN)✅ MinIO console accessible$(NC)" || echo "$(RED)❌ MinIO console not accessible$(NC)"
	@echo "$(GREEN)✅ Docker stack integration test completed$(NC)"

test-spark-connect: ## ⚡ Quick Spark Connect connectivity test
	@echo "$(PURPLE)⚡ Testing Spark Connect connectivity...$(NC)"
	@if ! nc -z localhost 15002 >/dev/null 2>&1; then \
		echo "$(RED)❌ Spark Connect server not accessible on port 15002$(NC)"; \
		echo "$(YELLOW)💡 Run 'make start-spark' to start Spark Connect server$(NC)"; \
		exit 1; \
	fi
	@echo "$(YELLOW)⏳ Port 15002 is open, checking if Spark Connect service is ready...$(NC)"
	@if $(DOCKER_COMPOSE) logs spark-connect 2>/dev/null | grep -q "Spark Connect server started at"; then \
		echo "$(GREEN)✅ Spark Connect server is ready and accepting connections$(NC)"; \
	elif timeout 3s bash -c 'exec 3<>/dev/tcp/localhost/15002' 2>/dev/null; then \
		echo "$(GREEN)✅ Spark Connect server is ready and accepting connections$(NC)"; \
	else \
		echo "$(YELLOW)⚠️  Port is open but Spark Connect may still be initializing$(NC)"; \
		echo "$(CYAN)💡 Check initialization status: 'make logs-spark'$(NC)"; \
		echo "$(CYAN)💡 Or test with actual Spark session: 'make test-spark-infra'$(NC)"; \
	fi

# =============================================================================
# Code Quality
# =============================================================================

lint: ## 🔍 Lint all code
	@echo "$(GREEN)🔍 Linting all code...$(NC)"
	@$(MAKE) lint-web
	@$(MAKE) lint-workflows

lint-web: ## 🌐 Lint web application
	@echo "$(BLUE)🌐 Linting web application...$(NC)"
	@cd $(WEB_DIR) && npm run lint

# FIXME: need to add a lint command
lint-workflows: ## ⚙️ Lint workflow engine
	@echo "$(PURPLE)⚙️ Linting workflows...$(NC)"
	@cd $(WORKFLOWS_DIR) && npm run lint 2>/dev/null || echo "$(YELLOW)⚠️  No linting configured for workflows$(NC)"

format: ## ✨ Format all code
	@echo "$(GREEN)✨ Formatting all code...$(NC)"
	@cd $(WEB_DIR) && npx prettier --write . 2>/dev/null || echo "$(YELLOW)⚠️  Prettier not configured$(NC)"
	@cd $(WORKFLOWS_DIR) && npx prettier --write . 2>/dev/null || echo "$(YELLOW)⚠️  Prettier not configured$(NC)"

check: ## 🔎 Run all quality checks (lint + test)
	@$(MAKE) lint
	@$(MAKE) test

# =============================================================================
# Infrastructure Management
# =============================================================================

start-infra: ## 🐳 Start Docker infrastructure (MinIO, Spark, etc.)
	@echo "$(CYAN)🐳 Starting Docker infrastructure...$(NC)"
	@$(DOCKER_COMPOSE) up -d --build
	@echo "$(GREEN)✅ Infrastructure started$(NC)"
	@$(MAKE) wait-for-services

start-minio: ## 🗄️ Start only MinIO services
	@echo "$(CYAN)🗄️ Starting MinIO services...$(NC)"
	@$(DOCKER_COMPOSE) up -d minio mc
	@echo "$(GREEN)✅ MinIO services started$(NC)"

start-spark: ## ⚡ Start only Spark Connect services
	@echo "$(PURPLE)⚡ Starting Spark Connect...$(NC)"
	@$(DOCKER_COMPOSE) up -d --build spark-connect
	@echo "$(GREEN)✅ Spark Connect started$(NC)"
	@echo "$(YELLOW)💡 Spark Connect available at: spark://localhost:15002$(NC)"
	@echo "$(YELLOW)💡 Spark UI will be available at: http://localhost:4040-4045$(NC)"

start-spark-nobuild: ## ⚡ Start Spark Connect without building
	@echo "$(PURPLE)⚡ Starting Spark Connect (no build)...$(NC)"
	@$(DOCKER_COMPOSE) up -d spark-connect
	@echo "$(GREEN)✅ Spark Connect started$(NC)"

stop-infra: ## 🛑 Stop Docker infrastructure
	@echo "$(CYAN)🛑 Stopping Docker infrastructure...$(NC)"
	@$(DOCKER_COMPOSE) down
	@echo "$(GREEN)✅ Infrastructure stopped$(NC)"

stop-minio: ## 🛑 Stop MinIO services
	@echo "$(CYAN)🛑 Stopping MinIO services...$(NC)"
	@$(DOCKER_COMPOSE) stop minio mc
	@echo "$(GREEN)✅ MinIO services stopped$(NC)"

stop-spark: ## 🛑 Stop Spark Connect
	@echo "$(PURPLE)🛑 Stopping Spark Connect...$(NC)"
	@$(DOCKER_COMPOSE) stop spark-connect
	@echo "$(GREEN)✅ Spark Connect stopped$(NC)"

restart-infra: ## 🔄 Restart Docker infrastructure
	@$(MAKE) stop-infra
	@$(MAKE) start-infra

restart-spark: ## 🔄 Restart Spark cluster
	@$(MAKE) stop-spark
	@$(MAKE) start-spark

wait-for-services: ## ⏳ Wait for services to be ready
	@echo "$(YELLOW)⏳ Waiting for services to be ready...$(NC)"
	@sleep 5
	@echo "$(YELLOW)⏳ Checking MinIO...$(NC)"
	@for i in {1..30}; do \
		if curl -s http://localhost:9000/minio/health/live >/dev/null 2>&1; then \
			echo "$(GREEN)✅ MinIO is ready!$(NC)"; \
			break; \
		fi; \
		echo "$(YELLOW)⏳ Waiting for MinIO... ($$i/30)$(NC)"; \
		sleep 2; \
		if [ $$i -eq 30 ]; then \
			echo "$(RED)❌ MinIO failed to start$(NC)"; \
			exit 1; \
		fi; \
	done
	@echo "$(YELLOW)⏳ Checking Spark Connect...$(NC)"
	@echo "$(CYAN)💡 Spark Connect may take 2-5 minutes to download dependencies...$(NC)"
	@for i in {1..60}; do \
		if nc -z localhost 15002 >/dev/null 2>&1; then \
			echo "$(YELLOW)⏳ Port 15002 is open, checking if Spark Connect is ready... ($$i/60)$(NC)"; \
			if $(DOCKER_COMPOSE) logs spark-connect 2>/dev/null | grep -q "Spark Connect server started at"; then \
				echo "$(GREEN)✅ Spark Connect is ready and accepting connections!$(NC)"; \
				break; \
			elif timeout 3s bash -c 'exec 3<>/dev/tcp/localhost/15002' 2>/dev/null; then \
				echo "$(GREEN)✅ Spark Connect is ready and accepting connections!$(NC)"; \
				break; \
			elif [ $$i -ge 45 ]; then \
				echo "$(YELLOW)⚠️  Spark Connect port is open but may still be initializing JARs$(NC)"; \
				echo "$(CYAN)💡 Check logs with 'make logs-spark' for download progress$(NC)"; \
				echo "$(GREEN)✅ Infrastructure started - Spark Connect will be ready shortly$(NC)"; \
				break; \
			fi; \
		else \
			echo "$(YELLOW)⏳ Waiting for Spark Connect to start... ($$i/60)$(NC)"; \
		fi; \
		sleep 3; \
		if [ $$i -eq 60 ]; then \
			echo "$(RED)❌ Spark Connect failed to start within 3 minutes$(NC)"; \
			echo "$(CYAN)💡 Check logs with 'make logs-spark'$(NC)"; \
			exit 1; \
		fi; \
	done

# =============================================================================
# Production Management
# =============================================================================

start: ## � Start all Docker services
	@echo "$(GREEN)� Starting all Docker services...$(NC)"
	@$(MAKE) start-infra
	@$(MAKE) start-all-docker
	@echo "$(GREEN)✅ All Docker services started!$(NC)"

start-docker: dev ## 🐳 Alias for dev (Docker development stack)

stop: ## 🛑 Stop all Docker services
	@echo "$(RED)🛑 Stopping all Docker services...$(NC)"
	@$(MAKE) stop-infra
	@$(MAKE) stop-all-docker
	@echo "$(GREEN)✅ All Docker services stopped$(NC)"

restart: ## 🔄 Restart all services
	@$(MAKE) stop
	@$(MAKE) start

# =============================================================================
# Monitoring & Logs
# =============================================================================
logs: ## 📋 Show all infrastructure logs
	@$(DOCKER_COMPOSE) logs -f

logs-minio: ## 📋 Show MinIO logs
	@$(DOCKER_COMPOSE) logs -f minio

logs-spark: ## 📋 Show Spark Connect logs
	@$(DOCKER_COMPOSE) logs -f spark-connect

status: ## 📊 Show status of all services
	@echo "$(CYAN)📊 Service Status$(NC)"
	@echo "=================="
	@echo "$(BLUE)🐳 Docker Services:$(NC)"
	@$(DOCKER_COMPOSE) ps 2>/dev/null || echo "$(RED)❌ Docker services not running$(NC)"
	@echo ""
	@echo "$(BLUE)🌐 Motia Bridge (Docker):$(NC)"
	@if $(DOCKER_COMPOSE) ps motia-bridge 2>/dev/null | grep -q "Up"; then \
		echo "$(GREEN)✅ Motia Bridge running$(NC)"; \
	else \
		echo "$(RED)❌ Motia Bridge not running - run 'make start-bridge-docker'$(NC)"; \
	fi
	@echo ""
	@echo "$(BLUE)⚙️ Motia Flows (Docker):$(NC)"
	@if $(DOCKER_COMPOSE) ps motia-flows 2>/dev/null | grep -q "Up"; then \
		echo "$(GREEN)✅ Motia Flows running$(NC)"; \
	else \
		echo "$(RED)❌ Motia Flows not running - run 'make start-motia-docker'$(NC)"; \
	fi
	@echo ""
	@echo "$(BLUE)⚡ Infrastructure Services:$(NC)"
	@if $(DOCKER_COMPOSE) ps spark-connect 2>/dev/null | grep -q "Up"; then \
		echo "$(GREEN)✅ Spark Connect running$(NC)"; \
	else \
		echo "$(RED)❌ Spark Connect not running - run 'make start-spark'$(NC)"; \
	fi
	@if $(DOCKER_COMPOSE) ps minio 2>/dev/null | grep -q "Up"; then \
		echo "$(GREEN)✅ MinIO running$(NC)"; \
	else \
		echo "$(RED)❌ MinIO not running - run 'make start-minio'$(NC)"; \
	fi
	@echo ""
	@echo "$(BLUE)🌍 Service Endpoints:$(NC)"
	@echo "  • Web App:        http://localhost:4000"
	@echo "  • Motia UI:       http://localhost:3000"
	@echo "  • MinIO API:      http://localhost:9000"
	@echo "  • MinIO UI:       http://localhost:9001"
	@echo "  • Spark Connect:  sc://localhost:15002"
	@echo "  • Spark UI:       http://localhost:4040-4045"

# =============================================================================
# Cleaning
# =============================================================================

clean: ## 🧹 Clean all build artifacts and dependencies
	@echo "$(RED)🧹 Cleaning all build artifacts...$(NC)"
	@$(MAKE) clean-web
	@$(MAKE) clean-workflows
	@$(MAKE) clean-python
	@$(MAKE) clean-docker
	@echo "$(GREEN)✅ All cleaned!$(NC)"

clean-web: ## 🌐 Clean web application
	@echo "$(BLUE)🧹 Cleaning web application...$(NC)"
	@cd $(WEB_DIR) && rm -rf .next dist node_modules package-lock.json
	@echo "$(GREEN)✅ Web cleaned$(NC)"

clean-workflows: ## ⚙️ Clean workflow engine
	@echo "$(PURPLE)🧹 Cleaning workflow engine...$(NC)"
	@cd $(WORKFLOWS_DIR) && npm run clean 2>/dev/null || rm -rf dist node_modules .motia .mermaid package-lock.json
	@echo "$(GREEN)✅ Workflows cleaned$(NC)"

clean-python: ## 🐍 Clean Python cache, temporary files and uv artifacts
	@echo "$(PURPLE)🧹 Cleaning Python temporary files and caches...$(NC)"
	@find . -type d -name "__pycache__" -exec rm -rf {} + 2>/dev/null || true
	@find . -type f -name "*.pyc" -delete 2>/dev/null || true
	@find . -type f -name "*.pyo" -delete 2>/dev/null || true
	@find . -type d -name "*.egg-info" -exec rm -rf {} + 2>/dev/null || true
	@find . -type d -name ".pytest_cache" -exec rm -rf {} + 2>/dev/null || true
	@find . -type d -name ".uv_tmp" -exec rm -rf {} + 2>/dev/null || true
	@find . -type d -name "venv" -path "*/infra-testing/*" -exec rm -rf {} + 2>/dev/null || true
	@uv cache clean 2>/dev/null || true
	@echo "$(GREEN)✅ Python artifacts cleaned$(NC)"

clean-docker: ## 🧹 Clean Docker data and containers (see docker-cleanup for more complete cleaning)
	@echo "$(CYAN)🧹 Cleaning Docker infrastructure...$(NC)"
	@$(DOCKER_COMPOSE) down -v --remove-orphans
	@docker system prune -f
	@echo "$(YELLOW)⚠️  Note: This will remove Spark cluster state and checkpoints$(NC)"
	@echo "$(CYAN)💡 For more complete cleanup including volumes: make docker-cleanup$(NC)"
	@echo "$(GREEN)✅ Docker cleaned$(NC)"

# =============================================================================
# Deployment
# =============================================================================

deploy-local: ## 🚀 Deploy locally (build + start)
	@echo "$(GREEN)🚀 Deploying locally...$(NC)"
	@$(MAKE) build
	@$(MAKE) start

deploy-prod: ## 🌍 Deploy to production (placeholder)
	@echo "$(RED)🌍 Production deployment not implemented yet$(NC)"
	@echo "$(YELLOW)TODO: Implement production deployment pipeline$(NC)"

# =============================================================================
# Utilities
# =============================================================================

update: ## 🔄 Update all dependencies
	@echo "$(GREEN)🔄 Updating all dependencies...$(NC)"
	@cd $(WEB_DIR) && npm update
	@cd $(WORKFLOWS_DIR) && npm update
	@echo "$(GREEN)✅ All dependencies updated$(NC)"

setup-dev: ## 🐳 Complete Docker development environment setup
	@echo "$(GREEN)🐳 Setting up complete Docker development environment...$(NC)"
	@$(MAKE) clean
	@$(MAKE) install
	@$(MAKE) build-all-docker
	@$(MAKE) start-infra
	@$(MAKE) cleanup-temp
	@echo "$(GREEN)✅ Docker development environment ready! Run 'make dev' to start.$(NC)"

doctor: ## 🔍 Check system health and requirements
	@echo "$(CYAN)🔍 System Health Check$(NC)"
	@echo "======================="
	@echo -n "$(BLUE)Node.js: $(NC)"
	@node --version 2>/dev/null || echo "$(RED)❌ Not installed$(NC)"
	@echo -n "$(BLUE)npm: $(NC)"
	@npm --version 2>/dev/null || echo "$(RED)❌ Not installed$(NC)"
	@echo -n "$(BLUE)Docker: $(NC)"
	@docker --version 2>/dev/null || echo "$(RED)❌ Not installed$(NC)"
	@echo -n "$(BLUE)Docker Compose: $(NC)"
	@docker compose version 2>/dev/null || docker-compose --version 2>/dev/null || echo "$(RED)❌ Not installed$(NC)"
	@echo -n "$(BLUE)Python3: $(NC)"
	@python3 --version 2>/dev/null || echo "$(RED)❌ Not installed$(NC)"
	@echo -n "$(BLUE)uv (Python package manager): $(NC)"
	@uv --version 2>/dev/null || echo "$(RED)❌ Not installed - install: curl -LsSf https://astral.sh/uv/install.sh | sh$(NC)"
	@echo ""
	@echo "$(BLUE)Project Dependencies:$(NC)"
	@if [ -d "$(WEB_DIR)/node_modules" ]; then echo "$(GREEN)✅ Web dependencies$(NC)"; else echo "$(RED)❌ Web dependencies - run 'make install-web'$(NC)"; fi
	@if [ -d "$(WORKFLOWS_DIR)/node_modules" ]; then echo "$(GREEN)✅ Workflow dependencies$(NC)"; else echo "$(RED)❌ Workflow dependencies - run 'make install-workflows'$(NC)"; fi
	@if [ -d "infra-testing/spark" ]; then echo "$(GREEN)✅ Spark test environment$(NC)"; else echo "$(RED)❌ Spark test environment - directory missing$(NC)"; fi
	@if [ -d "infra-testing/spark" ] && [ -f "infra-testing/spark/pyproject.toml" ]; then echo "$(GREEN)✅ Spark test dependencies configured$(NC)"; else echo "$(YELLOW)⚠️  Spark test pyproject.toml - check infra-testing/spark/$(NC)"; fi
	@echo ""
	@echo "$(BLUE)Docker Environment Configuration:$(NC)"
	@if [ -f "$(DOCKER_ENV)" ]; then echo "$(GREEN)✅ Docker .env file configured$(NC)"; else echo "$(RED)❌ Docker .env file missing - run 'make install-infra'$(NC)"; fi
	@if [ -f "$(INFRA_DIR)/.env.next" ]; then echo "$(GREEN)✅ Docker .env.next file configured$(NC)"; else echo "$(RED)❌ Docker .env.next file missing - run 'make install-infra'$(NC)"; fi
	@if [ -f "$(INFRA_DIR)/.env.next.example" ]; then echo "$(GREEN)✅ Docker .env.next.example template available$(NC)"; else echo "$(YELLOW)⚠️  Docker .env.next.example template missing$(NC)"; fi
	@echo ""
	@echo "$(BLUE)Infrastructure Services:$(NC)"
	@if curl -s http://localhost:9000/minio/health/live >/dev/null 2>&1; then echo "$(GREEN)✅ MinIO running$(NC)"; else echo "$(RED)❌ MinIO not running - run 'make start-minio'$(NC)"; fi
	@if nc -z localhost 15002 >/dev/null 2>&1; then \
		if $(DOCKER_COMPOSE) ps spark-connect 2>/dev/null | grep -q "Up"; then \
			echo "$(GREEN)✅ Spark Connect running$(NC)"; \
		else \
			echo "$(YELLOW)⚠️  Spark Connect port open but container not running$(NC)"; \
		fi; \
	else \
		echo "$(RED)❌ Spark Connect not running - run 'make start-spark'$(NC)"; \
	fi
	@echo ""
	@echo "$(BLUE)Docker Services Status:$(NC)"
	@if $(DOCKER_COMPOSE) ps spark-connect 2>/dev/null | grep -q "Up"; then echo "$(GREEN)✅ Spark Connect (Docker)$(NC)"; else echo "$(RED)❌ Spark Connect (Docker) - run 'make start-spark'$(NC)"; fi
	@if $(DOCKER_COMPOSE) ps motia-flows 2>/dev/null | grep -q "Up"; then echo "$(GREEN)✅ Motia Flows (Docker)$(NC)"; else echo "$(RED)❌ Motia Flows (Docker) - run 'make start-motia-docker'$(NC)"; fi
	@if $(DOCKER_COMPOSE) ps motia-bridge 2>/dev/null | grep -q "Up"; then echo "$(GREEN)✅ Motia Bridge (Docker)$(NC)"; else echo "$(RED)❌ Motia Bridge (Docker) - run 'make start-bridge-docker'$(NC)"; fi
	@echo ""
	@echo "$(BLUE)Quick Start Commands:$(NC)"
	@echo "  • Docker setup:       make setup-dev"
	@echo "  • Start Docker stack: make dev"
	@echo "  • Start infra:        make start-infra"
	@echo "  • Test Docker stack:  make test-docker-stack"
	@echo "  • Check Docker:       make docker-status"
	@echo "  • Test Spark:         make test-spark-infra"
	@echo "  • Build all Docker:   make build-all-docker"
	@echo "  • Clean Python:       make clean-python"

# =============================================================================
# Cleanup & Optimization
# =============================================================================

cleanup-temp: ## 🧹 Quick cleanup of temporary files (non-destructive)
	@echo "$(YELLOW)🧹 Cleaning temporary files...$(NC)"
	@find . -type d -name "__pycache__" -exec rm -rf {} + 2>/dev/null || true
	@find . -type f -name "*.pyc" -delete 2>/dev/null || true
	@find . -type d -name ".uv_tmp" -exec rm -rf {} + 2>/dev/null || true
	@echo "$(GREEN)✅ Temporary files cleaned$(NC)"

# =============================================================================
# Spark Connect Management  
# =============================================================================
spark-connect-shell: ## ⚡ Connect to Spark using PySpark shell
	@echo "$(PURPLE)⚡ Opening PySpark shell connected to Spark Connect...$(NC)"
	@echo "$(YELLOW) Use: spark = SparkSession.builder.remote('sc://localhost:15002').getOrCreate()$(NC)"
	@cd infra-testing/spark && \
	trap 'rm -rf .uv_tmp __pycache__ *.pyc 2>/dev/null || true' EXIT && \
	uv run --no-project python3 -c "from pyspark.sql import SparkSession; print('🚀 PySpark shell with uv - ready!'); import code; code.interact(local=locals())"

spark-connect-status: ## 📊 Check Spark Connect server status
	@echo "$(PURPLE)📊 Spark Connect Status$(NC)"
	@echo "========================"
	@echo "$(BLUE)Checking Spark Connect server...$(NC)"
	@if ! nc -z localhost 15002 >/dev/null 2>&1; then \
		echo "$(RED)❌ Spark Connect server not accessible on port 15002$(NC)"; \
		echo "$(YELLOW)💡 Run 'make start-spark' to start the server$(NC)"; \
	elif timeout 5s bash -c 'exec 3<>/dev/tcp/localhost/15002 && echo "test" >&3' 2>/dev/null; then \
		echo "$(GREEN)✅ Spark Connect server is running and ready$(NC)"; \
	else \
		echo "$(YELLOW)⚠️  Port 15002 is open but Spark Connect may still be initializing$(NC)"; \
		echo "$(CYAN)💡 Checking recent logs for initialization progress...$(NC)"; \
		@$(DOCKER_COMPOSE) logs --tail=10 spark-connect 2>/dev/null | grep -E "(Started|Bound|Exception|Error)" || echo "$(YELLOW)Check full logs with 'make logs-spark'$(NC)"; \
	fi
	@echo ""
	@echo "$(BLUE)Docker Container Status:$(NC)"
	@$(DOCKER_COMPOSE) ps spark-connect 2>/dev/null || echo "$(RED)❌ Spark Connect container not running$(NC)"
	@echo ""
	@echo "$(BLUE)MinIO Integration:$(NC)"
	@if curl -s http://localhost:9000/minio/health/live >/dev/null 2>&1; then \
		echo "$(GREEN)✅ MinIO is running and accessible$(NC)"; \
	else \
		echo "$(RED)❌ MinIO not accessible - run 'make start-minio'$(NC)"; \
	fi

spark-submit-test: ## ⚡ Submit our infrastructure test to Spark Connect
	@echo "$(PURPLE)⚡ Submitting infrastructure test to Spark Connect...$(NC)"
	@$(MAKE) test-spark-infra

spark-connect-logs-follow: ## 📋 Follow Spark Connect logs in real-time
	@echo "$(PURPLE)📋 Following Spark Connect logs...$(NC)"
	@$(DOCKER_COMPOSE) logs -f spark-connect

spark-wait-ready: ## ⏳ Wait for Spark Connect to be fully ready
	@echo "$(PURPLE)⏳ Waiting for Spark Connect to be fully initialized...$(NC)"
	@echo "$(CYAN)💡 This may take 2-5 minutes for initial JAR downloads$(NC)"
	@for i in {1..100}; do \
		if nc -z localhost 15002 >/dev/null 2>&1; then \
			if $(DOCKER_COMPOSE) logs spark-connect 2>/dev/null | grep -q "Spark Connect server started at"; then \
				echo "$(GREEN)✅ Spark Connect is fully ready!$(NC)"; \
				break; \
			elif timeout 3s bash -c 'exec 3<>/dev/tcp/localhost/15002' 2>/dev/null; then \
				echo "$(GREEN)✅ Spark Connect is fully ready!$(NC)"; \
				break; \
			else \
				echo "$(YELLOW)⏳ Spark Connect initializing... ($$i/100)$(NC)"; \
				if $(DOCKER_COMPOSE) logs --tail=3 spark-connect 2>/dev/null | grep -q "downloading\|SUCCESSFUL"; then \
					echo "$(CYAN)📦 Still downloading dependencies...$(NC)"; \
				fi; \
			fi; \
		else \
			echo "$(YELLOW)⏳ Waiting for Spark Connect to start... ($$i/100)$(NC)"; \
		fi; \
		sleep 3; \
		if [ $$i -eq 100 ]; then \
			echo "$(RED)❌ Spark Connect failed to become ready within 5 minutes$(NC)"; \
			echo "$(CYAN)💡 Check logs: 'make logs-spark'$(NC)"; \
			exit 1; \
		fi; \
	done

spark-connect-exec: ## 💻 Execute command in Spark Connect container
	@echo "$(PURPLE)💻 Opening shell in Spark Connect container...$(NC)"
	@$(DOCKER_COMPOSE) exec spark-connect bash

spark-pyspark: ## ⚡ Open PySpark shell connected to Spark Connect
	@$(MAKE) spark-connect-shell

spark-status: ## 📊 Show Spark Connect status
	@$(MAKE) spark-connect-status

spark-rebuild: ## ⚡ Rebuild and restart Spark cluster
	@echo "$(PURPLE)⚡ Rebuilding Spark cluster...$(NC)"
	@$(MAKE) stop-spark
	@$(MAKE) build-spark
	@$(MAKE) start-spark-nobuild
	@echo "$(GREEN)✅ Spark cluster rebuilt and restarted$(NC)"

# =============================================================================
# Advanced
# =============================================================================

generate-types: ## 🔧 Generate TypeScript types for workflows
	@echo "$(PURPLE)🔧 Generating TypeScript types...$(NC)"
	@cd $(WORKFLOWS_DIR) && npm run generate-types
	@echo "$(GREEN)✅ Types generated$(NC)"

# =============================================================================
# Documentation Security (GPG)
# =============================================================================

lock-roadmap: ## 🔒 Encrypt roadmap.md with GPG (requires passphrase)
	@echo "$(YELLOW)🔒 Encrypting roadmap.md with GPG...$(NC)"
	@if [ ! -f "docs/roadmap.md" ]; then \
		echo "$(RED)❌ docs/roadmap.md not found$(NC)"; \
		echo "$(CYAN)💡 Use 'make unlock-roadmap' to decrypt first, or create the file$(NC)"; \
		exit 1; \
	fi
	@if command -v gpg >/dev/null 2>&1; then \
		echo "$(BLUE)🔐 You will be prompted for a passphrase...$(NC)"; \
		cd docs && gpg --symmetric --cipher-algo AES256 --output roadmap.md.gpg roadmap.md && \
		echo "$(GREEN)✅ Roadmap encrypted successfully to docs/roadmap.md.gpg$(NC)" && \
		echo "$(YELLOW)💡 Original file preserved for local use$(NC)" && \
		echo "$(CYAN)💡 The encrypted file (.gpg) can be safely committed to git$(NC)" && \
		echo "$(CYAN)💡 Use 'make unlock-roadmap' to decrypt when needed$(NC)"; \
	else \
		echo "$(RED)❌ GPG not installed$(NC)"; \
		echo "$(CYAN)💡 Install with: brew install gnupg$(NC)"; \
		exit 1; \
	fi

unlock-roadmap: ## 🔓 Decrypt roadmap.md.gpg with GPG (requires passphrase)
	@echo "$(YELLOW)🔓 Decrypting roadmap.md.gpg with GPG...$(NC)"
	@if [ ! -f "docs/roadmap.md.gpg" ]; then \
		echo "$(RED)❌ docs/roadmap.md.gpg not found$(NC)"; \
		echo "$(CYAN)💡 Use 'make lock-roadmap' to create encrypted version$(NC)"; \
		exit 1; \
	fi
	@if command -v gpg >/dev/null 2>&1; then \
		echo "$(BLUE)🔐 You will be prompted for the passphrase...$(NC)"; \
		cd docs && gpg --decrypt --output roadmap.md roadmap.md.gpg && \
		echo "$(GREEN)✅ Roadmap decrypted successfully to docs/roadmap.md$(NC)" && \
		echo "$(YELLOW)⚠️  Remember: docs/roadmap.md is in .gitignore and won't be committed$(NC)" && \
		echo "$(CYAN)💡 Make your changes, then use 'make lock-roadmap' to update encrypted version$(NC)"; \
	else \
		echo "$(RED)❌ GPG not installed$(NC)"; \
		echo "$(CYAN)💡 Install with: brew install gnupg$(NC)"; \
		exit 1; \
	fi

check-roadmap: ## 🔍 Check roadmap status (encrypted vs decrypted)
	@echo "$(CYAN)🔍 Roadmap Status$(NC)"
	@echo "=================="
	@echo "$(BLUE)📁 Location: docs/$(NC)"
	@echo ""
	@if [ -f "docs/roadmap.md" ]; then \
		echo "$(GREEN)✅ Decrypted version: docs/roadmap.md$(NC)"; \
		echo "   📊 Size: $$(du -h docs/roadmap.md | cut -f1)"; \
		echo "   📅 Modified: $$(stat -f "%Sm" docs/roadmap.md)"; \
		echo "   🔍 Git status: Not tracked (in .gitignore)"; \
	else \
		echo "$(YELLOW)⚠️  No decrypted version found$(NC)"; \
		echo "   💡 Use 'make unlock-roadmap' to decrypt"; \
	fi
	@echo ""
	@if [ -f "docs/roadmap.md.gpg" ]; then \
		echo "$(GREEN)✅ Encrypted version: docs/roadmap.md.gpg$(NC)"; \
		echo "   📊 Size: $$(du -h docs/roadmap.md.gpg | cut -f1)"; \
		echo "   📅 Modified: $$(stat -f "%Sm" docs/roadmap.md.gpg)"; \
		echo "   🔍 Git status: Can be safely committed"; \
	else \
		echo "$(RED)❌ No encrypted version found$(NC)"; \
		echo "   💡 Use 'make lock-roadmap' to create encrypted version"; \
	fi
	@echo ""
	@echo "$(BLUE)🔧 Available Commands:$(NC)"
	@echo "   🔓 Decrypt:  make unlock-roadmap"
	@echo "   🔒 Encrypt:  make lock-roadmap"
	@echo "   🔍 Status:   make check-roadmap"
	@echo ""
	@echo "$(BLUE)🔐 Security Notes:$(NC)"
	@echo "   • Encryption: AES256 symmetric encryption"
	@echo "   • Passphrase: Interactive prompt (secure)"
	@echo "   • Git: Only .gpg files are tracked"

clean-roadmap: ## 🧹 Remove decrypted roadmap (keep encrypted version)
	@echo "$(YELLOW)🧹 Removing decrypted roadmap...$(NC)"
	@if [ -f "docs/roadmap.md" ]; then \
		rm docs/roadmap.md && \
		echo "$(GREEN)✅ Decrypted version removed$(NC)" && \
		echo "$(CYAN)💡 Encrypted version preserved: docs/roadmap.md.gpg$(NC)"; \
	else \
		echo "$(YELLOW)⚠️  No decrypted version found$(NC)"; \
	fi

roadmap-workflow: ## 📋 Show roadmap workflow guide
	@echo "$(CYAN)📋 Roadmap Workflow Guide$(NC)"
	@echo "=========================="
	@echo ""
	@echo "$(BLUE)🚀 Getting Started:$(NC)"
	@echo "1. make unlock-roadmap    # Decrypt for editing"
	@echo "2. # Edit docs/roadmap.md"
	@echo "3. make lock-roadmap      # Encrypt changes"
	@echo "4. git add docs/roadmap.md.gpg"
	@echo "5. git commit -m 'Update roadmap'"
	@echo ""
	@echo "$(BLUE)🔄 Daily Workflow:$(NC)"
	@echo "• Morning:   make unlock-roadmap"
	@echo "• Work:      Edit docs/roadmap.md"
	@echo "• Evening:   make lock-roadmap"
	@echo "• Cleanup:   make clean-roadmap (optional)"
	@echo ""
	@echo "$(BLUE)🔐 Security Benefits:$(NC)"
	@echo "• Private planning in public repo"
	@echo "• AES256 encryption"
	@echo "• Personal passphrase protection"
	@echo "• No sensitive info in git history"

open-minio: ## 🌐 Open MinIO console in browser
	@echo "$(CYAN)🌐 Opening MinIO console...$(NC)"
	@open http://localhost:9001 2>/dev/null || echo "Visit http://localhost:9001"

open-spark: ## 🌐 Open Spark UI in browser (when available)
	@echo "$(PURPLE)🌐 Opening Spark UI...$(NC)"
	@echo "$(YELLOW)💡 Spark UI available when jobs are running: http://localhost:4040-4045$(NC)"
	@open http://localhost:4040 2>/dev/null || echo "Visit http://localhost:4040 when Spark jobs are running"

open-web: ## 🌐 Open web application in browser (Motia Bridge + Motia Flows)
	@echo "$(BLUE)🌐 Opening Motia application...$(NC)"
	@echo "$(CYAN)💡 Motia Bridge (main UI): http://localhost:4000$(NC)"
	@echo "$(PURPLE)💡 Motia Flows (workflow engine): http://localhost:3000$(NC)"
	@open http://localhost:4000 2>/dev/null || echo "Visit http://localhost:4000"

shell-web: ## 💻 Open shell in web container
	@echo "$(BLUE)💻 Opening shell in web directory...$(NC)"
	@cd $(WEB_DIR) && $(SHELL)

shell-workflows: ## 💻 Open shell in workflows container
	@echo "$(PURPLE)💻 Opening shell in workflows directory...$(NC)"
	@cd $(WORKFLOWS_DIR) && $(SHELL)

# =============================================================================
# Docker Motia Integration
# =============================================================================

build-motia-docker: ## 🐳 Build Motia Docker image
	@echo "$(PURPLE)🐳 Building Motia Docker image...$(NC)"
	@cd $(WORKFLOWS_DIR) && npm run image
	@echo "$(GREEN)✅ Motia Docker image built successfully$(NC)"

build-bridge-docker: ## 🌐 Build Motia Bridge Docker image
	@echo "$(BLUE)🌐 Building Motia Bridge Docker image...$(NC)"
	@cd $(WEB_DIR) && npm run image
	@echo "$(GREEN)✅ Motia Bridge Docker image built successfully$(NC)"

build-all-docker: ## 🐳 Build all Docker images (motia-flows + motia-bridge)
	@echo "$(CYAN)🐳 Building all Docker images...$(NC)"
	@$(MAKE) build-motia-docker
	@$(MAKE) build-bridge-docker
	@echo "$(GREEN)✅ All Docker images built successfully$(NC)"

docker-status: ## 📊 Check all Docker containers status
	@echo "$(CYAN)📊 Docker Containers Status$(NC)"
	@echo "============================="
	@echo "$(BLUE)🐳 All Docker Services:$(NC)"
	@$(DOCKER_COMPOSE) ps 2>/dev/null || echo "$(RED)❌ Docker services not running$(NC)"
	@echo ""
	@echo "$(BLUE)🔍 Individual Service Status:$(NC)"
	@if $(DOCKER_COMPOSE) ps motia-flows 2>/dev/null | grep -q "Up"; then echo "$(GREEN)✅ Motia Flows$(NC)"; else echo "$(RED)❌ Motia Flows$(NC)"; fi
	@if $(DOCKER_COMPOSE) ps motia-bridge 2>/dev/null | grep -q "Up"; then echo "$(GREEN)✅ Motia Bridge$(NC)"; else echo "$(RED)❌ Motia Bridge$(NC)"; fi
	@if $(DOCKER_COMPOSE) ps spark-connect 2>/dev/null | grep -q "Up"; then echo "$(GREEN)✅ Spark Connect$(NC)"; else echo "$(RED)❌ Spark Connect$(NC)"; fi
	@if $(DOCKER_COMPOSE) ps minio 2>/dev/null | grep -q "Up"; then echo "$(GREEN)✅ MinIO$(NC)"; else echo "$(RED)❌ MinIO$(NC)"; fi
	@echo ""
	@echo "$(BLUE)🌐 Service Endpoints:$(NC)"
	@echo "  • Motia Bridge:   http://localhost:4000"
	@echo "  • Motia Flows:    http://localhost:3000"
	@echo "  • MinIO Console:  http://localhost:9001"
	@echo "  • MinIO API:      http://localhost:9000"
	@echo "  • Spark Connect:  sc://localhost:15002"

docker-cleanup: ## 🧹 Clean Docker containers and images
	@echo "$(YELLOW)🧹 Cleaning Docker containers and images...$(NC)"
	@echo "$(RED)⚠️  This will remove all stopped containers, networks, and unused images$(NC)"
	@$(DOCKER_COMPOSE) down -v --remove-orphans
	@docker system prune -f
	@docker volume prune -f
	@echo "$(GREEN)✅ Docker cleanup completed$(NC)"

stop-motia-docker: ## 🛑 Stop Motia docker services
	@echo "$(PURPLE)🛑 Stopping Motia docker services...$(NC)"
	@$(DOCKER_COMPOSE) stop motia-flows
	@echo "$(GREEN)✅ Motia docker services stopped$(NC)"

stop-bridge-docker: ## 🛑 Stop Motia Bridge docker service
	@echo "$(BLUE)🛑 Stopping Motia Bridge docker service...$(NC)"
	@$(DOCKER_COMPOSE) stop motia-bridge
	@echo "$(GREEN)✅ Motia Bridge docker service stopped$(NC)"

stop-all-docker: ## 🛑 Stop all Motia docker services
	@echo "$(CYAN)🛑 Stopping all Motia docker services...$(NC)"
	@$(DOCKER_COMPOSE) stop motia-flows motia-bridge
	@echo "$(GREEN)✅ All Motia docker services stopped$(NC)"

start-motia-docker: ## 🚀 Start Motia Flows docker service
	@echo "$(PURPLE)🚀 Starting Motia Flows docker service...$(NC)"
	@$(DOCKER_COMPOSE) up -d motia-flows
	@echo "$(GREEN)✅ Motia Flows docker service started$(NC)"

start-bridge-docker: ## 🚀 Start Motia Bridge docker service
	@echo "$(BLUE)🚀 Starting Motia Bridge docker service...$(NC)"
	@$(DOCKER_COMPOSE) up -d motia-bridge
	@echo "$(GREEN)✅ Motia Bridge docker service started$(NC)"

start-all-docker: ## 🚀 Start all Motia docker services
	@echo "$(CYAN)🚀 Starting all Motia docker services...$(NC)"
	@$(DOCKER_COMPOSE) up -d motia-flows motia-bridge
	@echo "$(GREEN)✅ All Motia docker services started$(NC)"

logs-motia-docker: ## 📋 View Motia Docker logs
	@echo "$(PURPLE)📋 Viewing Motia Docker logs...$(NC)"
	@$(DOCKER_COMPOSE) logs -f motia-flows

logs-bridge-docker: ## 📋 View Motia Bridge Docker logs
	@echo "$(BLUE)📋 Viewing Motia Bridge Docker logs...$(NC)"
	@$(DOCKER_COMPOSE) logs -f motia-bridge

logs-all-docker: ## 📋 View all Motia Docker logs
	@echo "$(CYAN)📋 Viewing all Motia Docker logs...$(NC)"
	@$(DOCKER_COMPOSE) logs -f motia-flows motia-bridge

rebuild-motia: ## 🔄 Rebuild and restart Motia Docker
	@echo "$(PURPLE)🔄 Rebuilding Motia...$(NC)"
	@$(MAKE) build-motia-docker
	@$(DOCKER_COMPOSE) up -d --force-recreate motia-flows
	@echo "$(GREEN)✅ Motia rebuilt and restarted$(NC)"

rebuild-bridge: ## 🔄 Rebuild and restart Motia Bridge Docker
	@echo "$(BLUE)🔄 Rebuilding Motia Bridge...$(NC)"
	@$(MAKE) build-bridge-docker
	@$(DOCKER_COMPOSE) up -d --force-recreate motia-bridge
	@echo "$(GREEN)✅ Motia Bridge rebuilt and restarted$(NC)"

rebuild-all: ## 🔄 Rebuild and restart all Motia services
	@echo "$(CYAN)🔄 Rebuilding all Motia services...$(NC)"
	@$(MAKE) build-all-docker
	@$(DOCKER_COMPOSE) up -d --force-recreate motia-flows motia-bridge
	@echo "$(GREEN)✅ All Motia services rebuilt and restarted$(NC)"

# =============================================================================
# Quick Commands (aliases)
# =============================================================================

up: start-infra ## 🚀 Alias for start-infra  
up-docker: start ## 🐳 Alias for start (Docker services)
down: stop-infra ## 🛑 Alias for stop-infra
down-docker: stop ## 🛑 Alias for stop (Docker services)
dev-stack: dev ## 🐳 Alias for dev (Docker development)
web: logs-bridge-docker ## 🌐 View web application logs (Docker)
workflows: logs-motia-docker ## ⚙️ View workflows logs (Docker)
pyspark: spark-connect-shell ## 🐍 Alias for spark-connect-shell
spark-ui: open-spark ## 🌐 Alias for open-spark
test-spark: test-spark-infra ## 🧪 Alias for test-spark-infra
test-csv: test-csv-datasets ## 📊 Alias for test-csv-datasets
spark-logs: logs-spark ## 📋 Alias for logs-spark
docker-motia: start-motia-docker ## 🐳 Alias for start-motia-docker
docker-bridge: start-bridge-docker ## 🌐 Alias for start-bridge-docker
docker-all: start-all-docker ## 🚀 Alias for start-all-docker
build-motia: build-motia-docker ## 🏗️ Alias for build-motia-docker
build-bridge: build-bridge-docker ## 🏗️ Alias for build-bridge-docker
build-all: build-all-docker ## 🏗️ Alias for build-all-docker
logs-motia: logs-motia-docker ## 📋 Alias for logs-motia-docker
logs-bridge: logs-bridge-docker ## 📋 Alias for logs-bridge-docker
logs-all: logs-all-docker ## 📋 Alias for logs-all-docker
spark-shell: spark-connect-shell ## ⚡ Alias for spark-connect-shell
cleanup: cleanup-temp ## 🧹 Alias for cleanup-temp
clean-py: clean-python ## 🐍 Alias for clean-python

# Unified command aliases
setup-docker: setup-dev ## 🐳 Alias for setup-dev (unified Docker setup)
stop-docker: stop ## 🛑 Alias for stop (unified Docker stop)
open-workflows: open-web ## 🌐 Alias for open-web (unified web interface)

# Documentation aliases
roadmap: check-roadmap ## 📋 Alias for check-roadmap
unlock: unlock-roadmap ## 🔓 Alias for unlock-roadmap  
lock: lock-roadmap ## 🔒 Alias for lock-roadmap
roadmap-help: roadmap-workflow ## 📚 Alias for roadmap-workflow

# AI Docs aliases
ai-docs: check-ai-docs ## 📋 Alias for check-ai-docs
encrypt-docs: encrypt-ai-docs ## 🔒 Alias for encrypt-ai-docs (root layer)
decrypt-docs: decrypt-ai-docs ## 🔓 Alias for decrypt-ai-docs (root layer)
encrypt-all: encrypt-all-docs ## 🔒 Alias for encrypt-all-docs (both layers)
decrypt-all: decrypt-all-docs ## 🔓 Alias for decrypt-all-docs (both layers)
ai-docs-help: ai-docs-workflow ## 📚 Alias for ai-docs-workflow

# =============================================================================
# AI Docs Security (GPG)
# =============================================================================

encrypt-ai-docs: ## 🔒 Encrypt ai_docs/ directory (root layer, excludes refs/)
	@echo "$(YELLOW)🔒 Encrypting ai_docs/ directory (root layer)...$(NC)"
	@if [ ! -d "ai_docs" ]; then \
		echo "$(RED)❌ ai_docs/ directory not found$(NC)"; \
		echo "$(CYAN)💡 Use 'make decrypt-ai-docs' to decrypt first$(NC)"; \
		exit 1; \
	fi
	@if command -v gpg >/dev/null 2>&1; then \
		echo "$(BLUE)🔐 You will be prompted for AI_DOCS_ROOT_KEY passphrase...$(NC)"; \
		echo "$(YELLOW)⚠️  Note: refs/ directory is NOT encrypted here (use encrypt-refs)$(NC)"; \
		./ai_docs/internal/ENCRYPT_AI_DOCS.sh && \
		echo "$(GREEN)✅ ai_docs/ root encrypted successfully to ai_docs.tar.gz.gpg$(NC)" && \
		echo "$(CYAN)💡 Use 'make encrypt-refs' to encrypt refs/ separately$(NC)"; \
	else \
		echo "$(RED)❌ GPG not installed$(NC)"; \
		echo "$(CYAN)💡 Install with: brew install gnupg$(NC)"; \
		exit 1; \
	fi

decrypt-ai-docs: ## 🔓 Decrypt ai_docs.tar.gz.gpg (root layer, excludes refs/)
	@echo "$(YELLOW)🔓 Decrypting ai_docs.tar.gz.gpg (root layer)...$(NC)"
	@if [ ! -f "ai_docs.tar.gz.gpg" ]; then \
		echo "$(RED)❌ ai_docs.tar.gz.gpg not found$(NC)"; \
		echo "$(CYAN)💡 Use 'make encrypt-ai-docs' to create encrypted version$(NC)"; \
		exit 1; \
	fi
	@if command -v gpg >/dev/null 2>&1; then \
		echo "$(BLUE)🔐 You will be prompted for AI_DOCS_ROOT_KEY passphrase...$(NC)"; \
		echo "$(YELLOW)⚠️  Note: refs/ directory is NOT decrypted here (use decrypt-refs)$(NC)"; \
		(if [ -f "ai_docs/internal/DECRYPT_AI_DOCS.sh" ]; then \
			./ai_docs/internal/DECRYPT_AI_DOCS.sh; \
		else \
			echo "$(YELLOW)⚠️  ai_docs/internal/ not found, decrypting directly...$(NC)" && \
			gpg --decrypt --output ai_docs.tar.gz ai_docs.tar.gz.gpg && \
			tar -xzf ai_docs.tar.gz && \
			rm ai_docs.tar.gz && \
			if [ -d "ai_docs/internal" ]; then \
				chmod +x ai_docs/internal/*.sh 2>/dev/null || true && \
				echo "$(GREEN)✅ Scripts permissions set$(NC)"; \
			fi; \
		fi) && \
		echo "$(GREEN)✅ ai_docs/ root decrypted successfully$(NC)" && \
		echo "$(CYAN)💡 Use 'make decrypt-refs' to decrypt refs/ separately if needed$(NC)"; \
	else \
		echo "$(RED)❌ GPG not installed$(NC)"; \
		echo "$(CYAN)💡 Install with: brew install gnupg$(NC)"; \
		exit 1; \
	fi

check-ai-docs: ## 🔍 Check ai_docs status (multi-layer encryption)
	@echo "$(CYAN)🔍 AI Docs Status (Multi-Layer Encryption)$(NC)"
	@echo "============================================="
	@echo "$(BLUE)📁 Location: repository root$(NC)"
	@echo ""
	@echo "$(YELLOW)Layer 1: AI Docs Root (excluding refs/)$(NC)"
	@if [ -d "ai_docs" ]; then \
		echo "$(GREEN)✅ Decrypted: ai_docs/$(NC)"; \
		echo "   📊 Size: $$(du -sh ai_docs 2>/dev/null | cut -f1 || echo 'N/A')"; \
		echo "   🔍 Git: Not tracked (in .gitignore)"; \
	else \
		echo "$(YELLOW)⚠️  Not decrypted$(NC)"; \
		echo "   💡 Use 'make decrypt-ai-docs'"; \
	fi
	@if [ -f "ai_docs.tar.gz.gpg" ]; then \
		echo "$(GREEN)✅ Encrypted: ai_docs.tar.gz.gpg$(NC)"; \
		echo "   📊 Size: $$(du -h ai_docs.tar.gz.gpg | cut -f1)"; \
		echo "   🔑 Key: AI_DOCS_ROOT_KEY"; \
	else \
		echo "$(RED)❌ Not encrypted$(NC)"; \
		echo "   💡 Use 'make encrypt-ai-docs'"; \
	fi
	@echo ""
	@echo "$(YELLOW)Layer 2: Refs Subdirectory$(NC)"
	@if [ -d "ai_docs/refs" ] && [ -n "$$(ls -A ai_docs/refs 2>/dev/null)" ]; then \
		echo "$(GREEN)✅ Decrypted: ai_docs/refs/$(NC)"; \
		echo "   📊 Size: $$(du -sh ai_docs/refs 2>/dev/null | cut -f1 || echo 'N/A')"; \
	else \
		echo "$(YELLOW)⚠️  Not decrypted or empty$(NC)"; \
		echo "   💡 Use 'make decrypt-refs' if encrypted"; \
	fi
	@if [ -f "ai_docs_refs.tar.gz.gpg" ]; then \
		echo "$(GREEN)✅ Encrypted: ai_docs_refs.tar.gz.gpg$(NC)"; \
		echo "   📊 Size: $$(du -h ai_docs_refs.tar.gz.gpg | cut -f1)"; \
		echo "   🔑 Key: AI_DOCS_REFS_KEY (different from root!)"; \
	else \
		echo "$(YELLOW)⚠️  Not encrypted$(NC)"; \
		echo "   💡 Use 'make encrypt-refs' to encrypt"; \
	fi
	@echo ""
	@echo "$(BLUE)🔧 Available Commands:$(NC)"
	@echo "   🔓 Decrypt root:  make decrypt-ai-docs"
	@echo "   🔒 Encrypt root:  make encrypt-ai-docs"
	@echo "   🔓 Decrypt refs:  make decrypt-refs"
	@echo "   🔒 Encrypt refs:  make encrypt-refs"
	@echo "   🔒 Encrypt all:   make encrypt-all-docs"
	@echo "   🔓 Decrypt all:   make decrypt-all-docs"
	@echo "   🔍 Status:        make check-ai-docs"
	@echo ""
	@echo "$(BLUE)🔐 Security Notes:$(NC)"
	@echo "   • Multi-layer encryption with separate passphrases"
	@echo "   • Root key: AI_DOCS_ROOT_KEY (for ai_docs/ excluding refs/)"
	@echo "   • Refs key: AI_DOCS_REFS_KEY (for refs/ only, different!)"
	@echo "   • Encryption: AES256 symmetric encryption"
	@echo "   • Git: Only .gpg files are tracked"

clean-ai-docs: ## 🧹 Remove decrypted ai_docs/ (keep encrypted version)
	@echo "$(YELLOW)🧹 Removing decrypted ai_docs/ directory...$(NC)"
	@if [ -d "ai_docs" ]; then \
		rm -rf ai_docs && \
		echo "$(GREEN)✅ Decrypted version removed$(NC)" && \
		echo "$(CYAN)💡 Encrypted version preserved: ai_docs.tar.gz.gpg$(NC)"; \
	else \
		echo "$(YELLOW)⚠️  No decrypted version found$(NC)"; \
	fi

encrypt-refs: ## 🔒 Encrypt ai_docs/refs/ directory (separate layer)
	@echo "$(YELLOW)🔒 Encrypting ai_docs/refs/ directory (separate layer)...$(NC)"
	@if [ ! -d "ai_docs/refs" ]; then \
		echo "$(RED)❌ ai_docs/refs/ directory not found$(NC)"; \
		echo "$(CYAN)💡 Use 'make decrypt-refs' to decrypt first, or create the directory$(NC)"; \
		exit 1; \
	fi
	@if command -v gpg >/dev/null 2>&1; then \
		echo "$(BLUE)🔐 You will be prompted for AI_DOCS_REFS_KEY passphrase...$(NC)"; \
		echo "$(YELLOW)⚠️  IMPORTANT: This uses a DIFFERENT passphrase from root encryption!$(NC)"; \
		./ai_docs/internal/ENCRYPT_REFS.sh && \
		echo "$(GREEN)✅ refs/ encrypted successfully to ai_docs_refs.tar.gz.gpg$(NC)"; \
	else \
		echo "$(RED)❌ GPG not installed$(NC)"; \
		echo "$(CYAN)💡 Install with: brew install gnupg$(NC)"; \
		exit 1; \
	fi

decrypt-refs: ## 🔓 Decrypt ai_docs_refs.tar.gz.gpg (separate layer)
	@echo "$(YELLOW)🔓 Decrypting ai_docs_refs.tar.gz.gpg (refs layer)...$(NC)"
	@if [ ! -f "ai_docs_refs.tar.gz.gpg" ]; then \
		echo "$(RED)❌ ai_docs_refs.tar.gz.gpg not found$(NC)"; \
		echo "$(CYAN)💡 Use 'make encrypt-refs' to create encrypted version$(NC)"; \
		exit 1; \
	fi
	@if command -v gpg >/dev/null 2>&1; then \
		echo "$(BLUE)🔐 You will be prompted for AI_DOCS_REFS_KEY passphrase...$(NC)"; \
		echo "$(YELLOW)⚠️  IMPORTANT: This uses a DIFFERENT passphrase from root decryption!$(NC)"; \
		./ai_docs/internal/DECRYPT_REFS.sh && \
		echo "$(GREEN)✅ refs/ decrypted successfully$(NC)"; \
	else \
		echo "$(RED)❌ GPG not installed$(NC)"; \
		echo "$(CYAN)💡 Install with: brew install gnupg$(NC)"; \
		exit 1; \
	fi

encrypt-all-docs: ## 🔒 Encrypt both layers (root + refs)
	@echo "$(CYAN)🔒 Encrypting all ai_docs layers...$(NC)"
	@$(MAKE) encrypt-ai-docs
	@echo ""
	@$(MAKE) encrypt-refs
	@echo ""
	@echo "$(GREEN)✅ All layers encrypted successfully!$(NC)"

decrypt-all-docs: ## 🔓 Decrypt both layers (root + refs)
	@echo "$(CYAN)🔓 Decrypting all ai_docs layers...$(NC)"
	@$(MAKE) decrypt-ai-docs
	@echo ""
	@$(MAKE) decrypt-refs
	@echo ""
	@echo "$(GREEN)✅ All layers decrypted successfully!$(NC)"

ai-docs-workflow: ## 📋 Show ai_docs workflow guide (multi-layer)
	@echo "$(CYAN)📋 AI Docs Workflow Guide (Multi-Layer Encryption)$(NC)"
	@echo "====================================================="
	@echo ""
	@echo "$(BLUE)🚀 Getting Started (New Machine):$(NC)"
	@echo "1. git clone <repo>"
	@echo "2. make decrypt-all-docs    # Decrypt both layers"
	@echo "3. # Use ai_docs/ templates and refs/"
	@echo "4. make encrypt-all-docs    # Encrypt both layers"
	@echo "5. git add ai_docs*.tar.gz.gpg"
	@echo "6. git commit -m 'Update ai_docs'"
	@echo ""
	@echo "$(BLUE)🔄 Daily Workflow:$(NC)"
	@echo "• Morning:   make decrypt-all-docs"
	@echo "• Work:      Use ai_docs/ templates and refs/"
	@echo "• Evening:   make encrypt-all-docs"
	@echo "• Cleanup:   make clean-ai-docs (optional)"
	@echo ""
	@echo "$(BLUE)🔐 Multi-Layer Encryption:$(NC)"
	@echo "• Layer 1: ai_docs/ root (AI_DOCS_ROOT_KEY)"
	@echo "  - Includes: knowledge-graph/, internal/"
	@echo "  - Excludes: refs/"
	@echo "• Layer 2: ai_docs/refs/ (AI_DOCS_REFS_KEY - different!)"
	@echo "  - Includes: reference repositories"
	@echo "  - Separate passphrase for access control"
	@echo ""
	@echo "$(BLUE)🎯 Access Control Levels:$(NC)"
	@echo "• Level 1: Root key only → Access to ai_docs/ (no refs/)"
	@echo "• Level 2: Refs key only → Access to refs/ (no root)"
	@echo "• Level 3: Both keys → Full access"
	@echo ""
	@echo "$(BLUE)🔐 Security Benefits:$(NC)"
	@echo "• Private templates in public repo"
	@echo "• AES256 encryption (multi-layer)"
	@echo "• Separate passphrases for granular access"
	@echo "• Private references protected separately"
	@echo "• No sensitive info in git history"