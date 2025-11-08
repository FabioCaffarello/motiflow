# 🚀 Motiflow

## Advanced AI-Powered Workflow Automation Platform with Spark Analytics

[![Next.js](https://img.shields.io/badge/Next.js-15.0.3-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-blue?style=flat-square&logo=typescript)](https://typescriptlang.org/)
[![Motia](https://img.shields.io/badge/Motia-0.9.0--beta-purple?style=flat-square)](https://motia.dev/)
[![Apache Spark](https://img.shields.io/badge/Apache%20Spark-4.0.1-orange?style=flat-square&logo=apache-spark)](https://spark.apache.org/)
[![Docker](https://img.shields.io/badge/Docker-Compose-blue?style=flat-square&logo=docker)](https://docker.com/)
[![MinIO](https://img.shields.io/badge/MinIO-S3%20Compatible-red?style=flat-square&logo=minio)](https://min.io/)

> A comprehensive platform that combines AI-driven chat interfaces with powerful workflow automation, featuring advanced data processing with Apache Spark Connect, file management capabilities, and seamless integration with modern development tools.

---

## 🌟 Features

### ⚡ Spark Analytics Engine

- **Apache Spark 4.0.1** with Spark Connect for distributed data processing
- **PySpark Integration** for Python-based data analytics
- **MinIO S3 Integration** for scalable data storage
- **Real-time Processing** with streaming capabilities
- **Jupyter-style Workflows** for interactive data science

### 🤖 AI-Powered Chat Interface

- **Advanced Chat System** powered by Vercel AI SDK
- **File Attachments** with intelligent processing
- **Real-time Streaming** responses
- **Multi-format Support** (documents, images, archives)
- **Context-aware Conversations** with memory

### ⚡ Workflow Automation

- **Motia Workflow Engine** for complex automation
- **Pet Store API Integration** for demo workflows
- **State Management** with audit capabilities
- **Notification Systems** with step-by-step processing

### 🗄️ Enterprise Storage & Infrastructure

- **MinIO S3-Compatible Storage** for scalable data persistence
- **Apache Spark Connect** for distributed computing
- **Intelligent File Type Detection** (archives, images, documents, videos)
- **Secure Upload System** with comprehensive metadata
- **Docker-based Infrastructure** for consistent deployment
- **Health Monitoring** with intelligent service detection

### 🛠️ Developer Experience

- **TypeScript** throughout the entire stack
- **Comprehensive Makefile** with 50+ automation commands
- **Hot Reload** development environment
- **Docker Compose** for seamless local development
- **uv Package Manager** for ultra-fast Python operations
- **Intelligent Health Checks** for service reliability

---

## 🏗️ Architecture

```text
motiflow/
├── 🌐 web/motia-bridge/          # Next.js AI Chat Interface (Port 4000)
│   ├── app/                      # App Router pages & API routes
│   ├── components/               # Reusable UI components + AI elements
│   └── lib/                      # Utilities & MinIO integration
├── ⚙️ workflows/motia-flows/     # Motia Workflow Engine
│   ├── src/services/             # Business logic & API integrations
│   ├── steps/                    # Workflow step definitions
│   └── python_modules/           # Python virtual environment (uv)
├── 🐳 infra/docker/              # Infrastructure as Code
│   ├── docker-compose.yaml      # Service orchestration
│   ├── images/spark/             # Apache Spark Connect container
│   └── scripts/                  # Deployment & health check utilities
├── 🧪 infra-testing/spark/       # Spark Connect testing environment
└── 📋 Makefile                   # 50+ project management commands
```

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18+ and npm
- **Docker** and Docker Compose
- **Python** 3.11+ (for Spark workflows)
- **uv** Python package manager (auto-installed if missing)
- **Git** for version control

### 1️⃣ Clone & Setup

```bash
# Clone the repository
git clone <repository-url> motiflow
cd motiflow

# Complete development environment setup
make setup-dev
```

### 2️⃣ Start Development

```bash
# Start full development environment
make dev
```

This command will:

- 🐳 Start MinIO S3-compatible storage
- ⚡ Launch Apache Spark Connect cluster  
- 🌐 Launch NextJS web app on <http://localhost:4000>
- ⚙️ Start Motia workflow engine
- ⏳ Wait for all services to be ready with intelligent health checks

### 3️⃣ Access Applications

- **Web Interface**: <http://localhost:4000>
- **MinIO Console**: <http://localhost:9001> (minio/minio123)
- **MinIO API**: <http://localhost:9000>
- **Spark Connect**: spark://localhost:15002 (gRPC)
- **Spark UI**: <http://localhost:4040-4045> (when jobs are running)

---

## 📋 Available Commands

Our comprehensive Makefile provides everything you need:

### 🛠️ Development

```bash
make dev                 # 🚀 Start full development environment
make dev-web             # 🌐 Web app only
make dev-workflows       # ⚙️ Workflows only
make status              # 📊 Check all services status
```

### 📦 Dependencies & Building

```bash
make install             # 📦 Install all dependencies
make build               # 🏗️ Build all components
make clean               # 🧹 Clean all artifacts
make update              # 🔄 Update all dependencies
```

### 🐳 Infrastructure

```bash
make start-infra         # 🐳 Start all Docker services
make stop-infra          # 🛑 Stop all Docker services  
make restart-infra       # 🔄 Restart infrastructure
make start-spark         # ⚡ Start only Spark Connect
make start-minio         # 🗄️ Start only MinIO storage
make logs                # 📋 View all service logs
make logs-spark          # ⚡ View Spark Connect logs
make wait-for-services   # ⏳ Wait for all services
```

### ⚡ Spark Analytics

```bash
make test-spark-infra    # 🧪 Test Spark Connect with Python
make spark-connect-shell # � Open PySpark interactive shell
make spark-wait-ready    # ⏳ Wait for Spark to be fully ready
make spark-status        # 📊 Check Spark Connect status
make pyspark             # 🐍 Alias for spark-connect-shell
```

### 🔍 Quality & Testing

```bash
make lint               # 🔍 Lint all code
make test               # 🧪 Run all tests
make test-spark-connect # ⚡ Quick Spark connectivity test
make format             # ✨ Format all code
make check              # 🔎 Run all quality checks
make clean-python       # 🐍 Clean Python caches & temp files
```

### 🎯 Quick Commands & Utilities

```bash
make help               # 📚 Show all available commands (50+)
make doctor             # 🔍 Complete system health check
make cleanup-temp       # 🧹 Clean temporary files
make up                 # ⚡ Alias for start-infra
make web                # ⚡ Alias for dev-web
make open-minio         # 🌐 Open MinIO console in browser
make open-web           # 🌐 Open web app in browser
```

---

## 🔧 Configuration

### Environment Variables

#### Web Application (`web/motia-bridge/.env.local`)

```env
# Application Configuration
PORT=4000

# AI Configuration
OPENAI_API_KEY=your_openai_api_key

# MinIO S3 Configuration  
MINIO_ENDPOINT=localhost:9000
MINIO_ACCESS_KEY=minio
MINIO_SECRET_KEY=minio123
MINIO_BUCKET=motiflow
MINIO_USE_SSL=false
```

#### Infrastructure (`infra/docker/.env`)

```env
# MinIO Credentials
MINIO_USERNAME=minio
MINIO_PASSWORD=minio123
AWS_ACCESS_KEY_ID=minio
AWS_SECRET_ACCESS_KEY=minio123
MINIO_ACCESS_KEY=minio
MINIO_SECRET_KEY=minio123
```

#### Spark Environment Variables

```env
# Python Optimization (Auto-configured)
PYTHONDONTWRITEBYTECODE=1
PYTHONUNBUFFERED=1
UV_NO_CACHE=0
```

### Customization

#### Workflow Configuration (`workflows/motia-flows/motia.config.ts`)

```typescript
export default {
  // Workflow engine configuration
  // API endpoints and integrations
  // State management settings
}
```

---

## 🌐 API Integration

### Chat API Endpoints

```typescript
// AI Chat with file attachments
POST /api/chat
{
  "messages": [...],
  "attachments": [...]
}

// Secure file upload to MinIO
POST /api/upload
{
  "file": File,
  "metadata": {...}
}
```

### Spark Analytics API

```python
# PySpark with Spark Connect
from pyspark.sql import SparkSession

spark = SparkSession.builder \
    .remote("sc://localhost:15002") \
    .getOrCreate()

# Process data from MinIO
df = spark.read.parquet("s3a://motiflow/data/")
result = df.groupBy("category").count().collect()
```

### Workflow Triggers

```typescript
// Pet Store Order Processing
POST /workflows/petstore/create-order
{
  "petId": "123",
  "quantity": 2,
  "shipDate": "2024-11-07"
}
```

---

## 🗂️ Project Components

### 🌐 Web Application (`web/motia-bridge/`)

Next.js application with AI chat interface featuring:

- **Vercel AI SDK Integration** for streaming chat responses
- **File Upload System** with MinIO S3 persistence
- **Responsive UI** built with Tailwind CSS and Shadcn/ui
- **TypeScript** for complete type safety
- **Port 4000** optimized configuration

### ⚡ Spark Analytics Engine (`infra-testing/spark/`)

Apache Spark Connect integration including:

- **Spark 4.0.1** with gRPC Connect protocol
- **Python Testing Suite** with uv package manager
- **MinIO S3 Integration** for data lake operations
- **PySpark Sessions** for interactive data analysis
- **Health Monitoring** with intelligent startup detection

### ⚙️ Workflow Engine (`workflows/motia-flows/`)

Motia-powered automation engine including:

- **Pet Store Services** for demo workflows
- **Step Definitions** for workflow logic
- **State Management** with audit capabilities
- **API Integrations** for external services
- **Python Virtual Environment** with uv optimization

### 🐳 Infrastructure (`infra/docker/`)

Docker-based infrastructure featuring:

- **Apache Spark Connect** with automatic JAR dependency management
- **MinIO S3 Storage** for data lake and file persistence  
- **Intelligent Health Checks** with gRPC protocol support
- **Network Configuration** for service communication
- **Volume Management** for data persistence
- **Optimized Startup** with proper service dependencies

---

## 🔄 Development Workflow

### 1. Feature Development

```bash
# Start development environment
make dev

# Make changes to code
# Files auto-reload in development

# Check code quality
make lint
make test
```

### 2. Testing Spark Analytics

```bash
# Ensure Spark Connect is running
make spark-status

# Test Spark with Python
make test-spark-infra

# Interactive PySpark session
make pyspark
```

### 3. Testing File Uploads

```bash
# Ensure infrastructure is running
make status

# Test file upload via web interface at localhost:4000
# Check MinIO console for uploaded files
make open-minio
```

### 4. Workflow Testing

```bash
# Start workflows in development
make dev-workflows

# Test API endpoints
# Monitor logs for debugging
make logs
```

---

## 📚 Learning Resources

### Tutorials (`workflows/motia-flows/tutorial/`)

- **Pet Store Workflow** - Complete example implementation
- **Step Definitions** - How to create workflow steps  
- **API Integration** - Connecting external services

### Examples (`examples/`)

- Sample configurations
- Common use cases
- Best practices

---

## 🔍 Troubleshooting

### Common Issues

#### Services Not Starting

```bash
# Complete system health check
make doctor

# Check specific service status
make spark-status
make test-spark-connect

# Reset everything
make clean
make setup-dev
```

#### Spark Connect Issues

```bash
# Check if Spark is ready
make spark-wait-ready

# View Spark initialization logs
make logs-spark

# Test Spark connectivity
make test-spark-infra

# Interactive debugging
make spark-connect-shell
```

#### File Upload Errors

```bash
# Check MinIO status
make status

# View MinIO logs
make logs-minio

# Reset MinIO data
make stop-infra
make start-infra
```

#### Workflow Engine Issues

```bash
# Check workflow logs
make logs-workflows

# Regenerate types
make generate-types

# Clean and rebuild
make clean-workflows
make install-workflows
```

### Debug Commands

```bash
make status              # 📊 Overall service status
make doctor             # 🔍 Complete system health check  
make logs               # 📋 All service logs
make logs-spark         # ⚡ Spark Connect specific logs
make spark-status       # 🔍 Detailed Spark Connect status
make open-minio         # 🌐 MinIO web console
make cleanup-temp       # 🧹 Clean temporary files
```

---

## 🤝 Contributing

### Development Setup

1. Fork the repository
2. Run `make setup-dev` for complete environment setup
3. Create feature branch
4. Make changes with `make dev` running
5. Run `make check` before committing
6. Submit pull request

### Code Standards

- **TypeScript** for all new code
- **ESLint** configuration must pass
- **Prettier** formatting enforced
- **Tests** required for new features

### Workflow Guidelines

- Use `make` commands for all operations
- Test locally with `make test`
- Document API changes
- Update README for new features

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙋 Support

### Getting Help

- 📋 Use `make help` for available commands
- 🔍 Run `make doctor` for system diagnostics  
- 📊 Check `make status` for service health
- 📋 View `make logs` for debugging

### Resources

- [Motia Documentation](https://motia.dev/docs)
- [Next.js Documentation](https://nextjs.org/docs)
- [AI SDK Documentation](https://sdk.vercel.ai/)
- [MinIO Documentation](https://min.io/docs)

---

## 🏆 Acknowledgments

Built with ❤️ using:

- **[Next.js](https://nextjs.org/)** - React framework for production
- **[Apache Spark](https://spark.apache.org/)** - Unified analytics engine
- **[Motia](https://motia.dev/)** - Workflow automation engine
- **[Vercel AI SDK](https://sdk.vercel.ai/)** - AI application development
- **[MinIO](https://min.io/)** - S3-compatible object storage
- **[TypeScript](https://typescriptlang.org/)** - Type-safe JavaScript
- **[Docker](https://docker.com/)** - Containerization platform
- **[uv](https://github.com/astral-sh/uv)** - Ultra-fast Python package manager

---

## 🚀 Made by the Motiflow Team

[🌐 Website](https://motiflow.dev) • [📚 Docs](https://docs.motiflow.dev) • [💬 Discord](https://discord.gg/motiflow)
