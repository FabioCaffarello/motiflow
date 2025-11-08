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
	@if [ ! -f $(DOCKER_ENV) ]; then \
		echo "$(YELLOW)⚠️  Creating .env file from template...$(NC)"; \
		cp $(DOCKER_ENV).example $(DOCKER_ENV) 2>/dev/null || echo "MINIO_USERNAME=minio\nMINIO_PASSWORD=minio123\nAWS_ACCESS_KEY_ID=minio\nAWS_SECRET_ACCESS_KEY=minio123" > $(DOCKER_ENV); \
	fi
	@echo "$(GREEN)✅ Infrastructure setup complete$(NC)"

# =============================================================================
# Development
# =============================================================================

dev: ## 🚀 Start full development environment
	@echo "$(GREEN)🚀 Starting full development environment...$(NC)"
	@$(MAKE) start-infra
	@$(MAKE) dev-parallel

dev-parallel: ## 🔄 Run web and workflows in parallel development mode
	@echo "$(BLUE)🔄 Starting parallel development servers...$(NC)"
	@trap 'kill 0' INT; \
	(cd $(WEB_DIR) && npm run dev) & \
	(cd $(WORKFLOWS_DIR) && npm run dev) & \
	wait

dev-web: ## 🌐 Start web application in development mode
	@echo "$(BLUE)🌐 Starting web development server...$(NC)"
	@cd $(WEB_DIR) && npm run dev

dev-workflows: ## ⚙️ Start workflow engine in development mode
	@echo "$(PURPLE)⚙️ Starting workflow development server...$(NC)"
	@cd $(WORKFLOWS_DIR) && npm run dev

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

build-spark: ## ⚡ Build Spark Docker images
	@echo "$(PURPLE)⚡ Building Spark Docker images...$(NC)"
	@$(DOCKER_COMPOSE) build spark-master spark-worker-1 spark-worker-2 spark-connect
	@echo "$(GREEN)✅ Spark images built$(NC)"

# =============================================================================
# Testing
# =============================================================================

test: ## 🧪 Run all tests
	@echo "$(GREEN)🧪 Running all tests...$(NC)"
	@$(MAKE) test-web
	@$(MAKE) test-workflows

test-web: ## 🌐 Run web application tests
	@echo "$(BLUE)🌐 Running web tests...$(NC)"
	@cd $(WEB_DIR) && npm test 2>/dev/null || echo "$(YELLOW)⚠️  No tests configured for web app$(NC)"

test-workflows: ## ⚙️ Run workflow engine tests
	@echo "$(PURPLE)⚙️ Running workflow tests...$(NC)"
	@cd $(WORKFLOWS_DIR) && npm test 2>/dev/null || echo "$(YELLOW)⚠️  No tests configured for workflows$(NC)"

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

start-spark: ## ⚡ Start only Spark cluster services
	@echo "$(PURPLE)⚡ Starting Spark cluster...$(NC)"
	@$(DOCKER_COMPOSE) up -d --build spark-master spark-worker-1 spark-worker-2 spark-connect
	@echo "$(GREEN)✅ Spark cluster started$(NC)"

start-spark-nobuild: ## ⚡ Start Spark cluster without building
	@echo "$(PURPLE)⚡ Starting Spark cluster (no build)...$(NC)"
	@$(DOCKER_COMPOSE) up -d spark-master spark-worker-1 spark-worker-2 spark-connect
	@echo "$(GREEN)✅ Spark cluster started$(NC)"

stop-infra: ## 🛑 Stop Docker infrastructure
	@echo "$(CYAN)🛑 Stopping Docker infrastructure...$(NC)"
	@$(DOCKER_COMPOSE) down
	@echo "$(GREEN)✅ Infrastructure stopped$(NC)"

stop-minio: ## 🛑 Stop MinIO services
	@echo "$(CYAN)🛑 Stopping MinIO services...$(NC)"
	@$(DOCKER_COMPOSE) stop minio mc
	@echo "$(GREEN)✅ MinIO services stopped$(NC)"

stop-spark: ## 🛑 Stop Spark cluster
	@echo "$(PURPLE)🛑 Stopping Spark cluster...$(NC)"
	@$(DOCKER_COMPOSE) stop spark-master spark-worker-1 spark-worker-2 spark-connect
	@echo "$(GREEN)✅ Spark cluster stopped$(NC)"

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
	@echo "$(YELLOW)⏳ Checking Spark Master...$(NC)"
	@for i in {1..30}; do \
		if curl -s http://localhost:9095 >/dev/null 2>&1; then \
			echo "$(GREEN)✅ Spark Master is ready!$(NC)"; \
			break; \
		fi; \
		echo "$(YELLOW)⏳ Waiting for Spark Master... ($$i/30)$(NC)"; \
		sleep 3; \
		if [ $$i -eq 30 ]; then \
			echo "$(YELLOW)⚠️  Spark Master may still be starting$(NC)"; \
			break; \
		fi; \
	done

# =============================================================================
# Production Management
# =============================================================================

start: ## 🚀 Start all services in production mode
	@echo "$(GREEN)🚀 Starting all services...$(NC)"
	@$(MAKE) start-infra
	@$(MAKE) start-web-prod
	@$(MAKE) start-workflows-prod

start-web-prod: ## 🌐 Start web application in production mode
	@echo "$(BLUE)🌐 Starting web in production mode...$(NC)"
	@cd $(WEB_DIR) && npm start

start-workflows-prod: ## ⚙️ Start workflow engine in production mode
	@echo "$(PURPLE)⚙️ Starting workflows in production mode...$(NC)"
	@cd $(WORKFLOWS_DIR) && npm start 2>/dev/null || echo "$(YELLOW)⚠️  No production start script$(NC)"

stop: ## 🛑 Stop all services
	@echo "$(RED)🛑 Stopping all services...$(NC)"
	@pkill -f "next start" 2>/dev/null || true
	@pkill -f "motia" 2>/dev/null || true
	@$(MAKE) stop-infra

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

logs-spark: ## 📋 Show Spark cluster logs
	@$(DOCKER_COMPOSE) logs -f spark-master spark-worker-1 spark-worker-2 spark-connect

logs-spark-master: ## 📋 Show Spark Master logs
	@$(DOCKER_COMPOSE) logs -f spark-master

logs-spark-workers: ## 📋 Show Spark Workers logs
	@$(DOCKER_COMPOSE) logs -f spark-worker-1 spark-worker-2

status: ## 📊 Show status of all services
	@echo "$(CYAN)📊 Service Status$(NC)"
	@echo "=================="
	@echo "$(BLUE)🐳 Docker Services:$(NC)"
	@$(DOCKER_COMPOSE) ps 2>/dev/null || echo "$(RED)❌ Docker services not running$(NC)"
	@echo ""
	@echo "$(BLUE)🌐 Web Application:$(NC)"
	@if pgrep -f "next" >/dev/null; then \
		echo "$(GREEN)✅ NextJS running$(NC)"; \
	else \
		echo "$(RED)❌ NextJS not running$(NC)"; \
	fi
	@echo ""
	@echo "$(BLUE)⚙️ Workflow Engine:$(NC)"
	@if pgrep -f "motia" >/dev/null; then \
		echo "$(GREEN)✅ Motia running$(NC)"; \
	else \
		echo "$(RED)❌ Motia not running$(NC)"; \
	fi
	@echo ""
	@echo "$(BLUE)🌍 Service Endpoints:$(NC)"
	@echo "  • Web App:       http://localhost:3000"
	@echo "  • MinIO API:     http://localhost:9000"
	@echo "  • MinIO UI:      http://localhost:9001"
	@echo "  • Spark Master:  http://localhost:9095"
	@echo "  • Spark Connect: spark://localhost:7077"

# =============================================================================
# Cleaning
# =============================================================================

clean: ## 🧹 Clean all build artifacts and dependencies
	@echo "$(RED)🧹 Cleaning all build artifacts...$(NC)"
	@$(MAKE) clean-web
	@$(MAKE) clean-workflows
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

clean-docker: ## 🐳 Clean Docker data and containers
	@echo "$(CYAN)🧹 Cleaning Docker infrastructure...$(NC)"
	@$(DOCKER_COMPOSE) down -v --remove-orphans
	@docker system prune -f
	@echo "$(YELLOW)⚠️  Note: This will remove Spark cluster state and checkpoints$(NC)"
	@echo "$(GREEN)✅ Docker cleaned$(NC)"

# =============================================================================
# Backup & Restore
# =============================================================================

backup: ## 💾 Backup MinIO data
	@echo "$(CYAN)💾 Creating backup...$(NC)"
	@mkdir -p backups
	@docker run --rm -v minio-data:/data -v $(PWD)/backups:/backup alpine tar czf /backup/minio-backup-$(shell date +%Y%m%d-%H%M%S).tar.gz -C /data .
	@echo "$(GREEN)✅ Backup created in ./backups/$(NC)"

restore: ## 📥 Restore MinIO data (requires BACKUP_FILE variable)
	@if [ -z "$(BACKUP_FILE)" ]; then \
		echo "$(RED)❌ Please specify BACKUP_FILE=path/to/backup.tar.gz$(NC)"; \
		exit 1; \
	fi
	@echo "$(CYAN)📥 Restoring from $(BACKUP_FILE)...$(NC)"
	@$(MAKE) stop-infra
	@docker volume rm minio-data 2>/dev/null || true
	@docker volume create minio-data
	@docker run --rm -v minio-data:/data -v $(PWD)/backups:/backup alpine tar xzf /backup/$(BACKUP_FILE) -C /data
	@$(MAKE) start-infra
	@echo "$(GREEN)✅ Restore completed$(NC)"

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

setup-dev: ## 🛠️ Complete development environment setup
	@echo "$(GREEN)🛠️ Setting up complete development environment...$(NC)"
	@$(MAKE) clean
	@$(MAKE) install
	@$(MAKE) build
	@$(MAKE) start-infra
	@echo "$(GREEN)✅ Development environment ready! Run 'make dev' to start.$(NC)"

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
	@docker-compose --version 2>/dev/null || echo "$(RED)❌ Not installed$(NC)"
	@echo ""
	@echo "$(BLUE)Project Dependencies:$(NC)"
	@if [ -d "$(WEB_DIR)/node_modules" ]; then echo "$(GREEN)✅ Web dependencies$(NC)"; else echo "$(RED)❌ Web dependencies - run 'make install-web'$(NC)"; fi
	@if [ -d "$(WORKFLOWS_DIR)/node_modules" ]; then echo "$(GREEN)✅ Workflow dependencies$(NC)"; else echo "$(RED)❌ Workflow dependencies - run 'make install-workflows'$(NC)"; fi
	@echo ""
	@echo "$(BLUE)Infrastructure Services:$(NC)"
	@if curl -s http://localhost:9000/minio/health/live >/dev/null 2>&1; then echo "$(GREEN)✅ MinIO running$(NC)"; else echo "$(RED)❌ MinIO not running - run 'make start-minio'$(NC)"; fi
	@if curl -s http://localhost:9095 >/dev/null 2>&1; then echo "$(GREEN)✅ Spark Master running$(NC)"; else echo "$(RED)❌ Spark Master not running - run 'make start-spark'$(NC)"; fi

# =============================================================================
# Spark Management
# =============================================================================

spark-shell: ## ⚡ Open Spark shell in master container
	@echo "$(PURPLE)⚡ Opening Spark shell...$(NC)"
	@$(DOCKER_COMPOSE) exec spark-master spark-shell --master spark://spark-master:7077

spark-submit: ## ⚡ Submit Spark application (requires APP variable)
	@if [ -z "$(APP)" ]; then \
		echo "$(RED)❌ Please specify APP=path/to/app.py$(NC)"; \
		exit 1; \
	fi
	@echo "$(PURPLE)⚡ Submitting Spark application $(APP)...$(NC)"
	@$(DOCKER_COMPOSE) exec spark-master spark-submit --master spark://spark-master:7077 $(APP)

spark-sql: ## ⚡ Open Spark SQL shell
	@echo "$(PURPLE)⚡ Opening Spark SQL shell...$(NC)"
	@$(DOCKER_COMPOSE) exec spark-master spark-sql --master spark://spark-master:7077

spark-pyspark: ## ⚡ Open PySpark shell
	@echo "$(PURPLE)⚡ Opening PySpark shell...$(NC)"
	@$(DOCKER_COMPOSE) exec spark-master pyspark --master spark://spark-master:7077

spark-status: ## 📊 Show Spark cluster status
	@echo "$(PURPLE)📊 Spark Cluster Status$(NC)"
	@echo "========================"
	@echo "$(BLUE)Checking Spark Master...$(NC)"
	@if curl -s http://localhost:9095 >/dev/null 2>&1; then \
		echo "$(GREEN)✅ Spark Master UI available at http://localhost:9095$(NC)"; \
	else \
		echo "$(RED)❌ Spark Master UI not accessible$(NC)"; \
	fi
	@echo ""
	@echo "$(BLUE)Docker Containers:$(NC)"
	@$(DOCKER_COMPOSE) ps spark-master spark-worker-1 spark-worker-2 spark-connect 2>/dev/null || echo "$(RED)❌ Spark services not running$(NC)"

spark-scale-workers: ## ⚡ Scale Spark workers (requires WORKERS variable, e.g., WORKERS=3)
	@if [ -z "$(WORKERS)" ]; then \
		echo "$(RED)❌ Please specify WORKERS=number (e.g., WORKERS=3)$(NC)"; \
		exit 1; \
	fi
	@echo "$(PURPLE)⚡ Scaling Spark workers to $(WORKERS)...$(NC)"
	@$(DOCKER_COMPOSE) up -d --scale spark-worker-1=$(WORKERS)
	@echo "$(GREEN)✅ Spark workers scaled to $(WORKERS)$(NC)"

spark-rebuild: ## ⚡ Rebuild and restart Spark cluster
	@echo "$(PURPLE)⚡ Rebuilding Spark cluster...$(NC)"
	@$(MAKE) stop-spark
	@$(MAKE) build-spark
	@$(MAKE) start-spark-nobuild
	@echo "$(GREEN)✅ Spark cluster rebuilt and restarted$(NC)"

# =============================================================================
# Development Environment with Spark
# =============================================================================

dev-spark: ## 🚀 Start development environment with Spark focus
	@echo "$(GREEN)🚀 Starting development environment with Spark...$(NC)"
	@$(MAKE) start-spark
	@$(MAKE) start-minio
	@echo "$(GREEN)✅ Spark development environment ready!$(NC)"
	@echo "$(YELLOW)💡 Access Spark Master UI: http://localhost:9095$(NC)"
	@echo "$(YELLOW)💡 Connect to cluster: spark://localhost:7077$(NC)"

# =============================================================================
# Advanced
# =============================================================================

generate-types: ## 🔧 Generate TypeScript types for workflows
	@echo "$(PURPLE)🔧 Generating TypeScript types...$(NC)"
	@cd $(WORKFLOWS_DIR) && npm run generate-types
	@echo "$(GREEN)✅ Types generated$(NC)"

open-minio: ## 🌐 Open MinIO console in browser
	@echo "$(CYAN)🌐 Opening MinIO console...$(NC)"
	@open http://localhost:9001 2>/dev/null || echo "Visit http://localhost:9001"

open-spark: ## 🌐 Open Spark Master UI in browser
	@echo "$(PURPLE)🌐 Opening Spark Master UI...$(NC)"
	@open http://localhost:9095 2>/dev/null || echo "Visit http://localhost:9095"

open-web: ## 🌐 Open web application in browser
	@echo "$(BLUE)🌐 Opening web application...$(NC)"
	@open http://localhost:3000 2>/dev/null || echo "Visit http://localhost:3000"

shell-web: ## 💻 Open shell in web container
	@echo "$(BLUE)💻 Opening shell in web directory...$(NC)"
	@cd $(WEB_DIR) && $(SHELL)

shell-workflows: ## 💻 Open shell in workflows container
	@echo "$(PURPLE)💻 Opening shell in workflows directory...$(NC)"
	@cd $(WORKFLOWS_DIR) && $(SHELL)

# =============================================================================
# Quick Commands (aliases)
# =============================================================================

up: start-infra ## 🚀 Alias for start-infra
down: stop-infra ## 🛑 Alias for stop-infra
web: dev-web ## 🌐 Alias for dev-web
workflows: dev-workflows ## ⚙️ Alias for dev-workflows
spark: dev-spark ## ⚡ Alias for dev-spark
pyspark: spark-pyspark ## 🐍 Alias for spark-pyspark
spark-ui: open-spark ## 🌐 Alias for open-spark