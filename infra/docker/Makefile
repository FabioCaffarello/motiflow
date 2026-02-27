# Makefile for Docker-based testing and development

.PHONY: help build up down test clean logs

help:
	@echo "Available commands:"
	@echo "  make build          - Build synthetic-data-generator Docker image"
	@echo "  make up             - Start all services"
	@echo "  make up-syngen      - Start only synthetic-data-generator"
	@echo "  make down           - Stop all services"
	@echo "  make test           - Run test suite for synthetic-data-generator"
	@echo "  make logs           - Show logs from synthetic-data-generator"
	@echo "  make clean          - Remove containers and volumes"
	@echo "  make shell          - Open shell in synthetic-data-generator container"

build:
	@echo "🏗️  Building synthetic-data-generator..."
	docker-compose build synthetic-data-generator

up:
	@echo "🚀 Starting all services..."
	docker-compose up -d

up-syngen:
	@echo "🚀 Starting synthetic-data-generator..."
	docker-compose up -d synthetic-data-generator

down:
	@echo "🛑 Stopping services..."
	docker-compose down

test:
	@echo "🧪 Running tests..."
	./scripts/test-synthetic-data.sh

logs:
	@echo "📋 Showing logs..."
	docker-compose logs -f synthetic-data-generator

clean:
	@echo "🧹 Cleaning up..."
	docker-compose down -v
	docker rmi synthetic-data-generator:latest 2>/dev/null || true

shell:
	@echo "🐚 Opening shell in synthetic-data-generator..."
	docker exec -it synthetic-data-generator /bin/bash || docker exec -it synthetic-data-generator /bin/sh

generate:
	@echo "📊 Generating data..."
	docker exec synthetic-data-generator syngen generate \
		--config /app/config/configs/basic-users.yaml

validate:
	@echo "✅ Validating configuration..."
	docker exec synthetic-data-generator syngen validate \
		--config /app/config/configs/basic-users.yaml

schema:
	@echo "📋 Generating JSON Schema..."
	docker exec synthetic-data-generator syngen schema \
		--config /app/config/configs/basic-users.yaml \
		--output /app/output/users.schema.json
