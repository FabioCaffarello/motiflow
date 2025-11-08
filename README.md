# 🚀 Motiflow

## Advanced AI-Powered Workflow Automation Platform

[![Next.js](https://img.shields.io/badge/Next.js-16.0.1-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=flat-square&logo=typescript)](https://typescriptlang.org/)
[![Motia](https://img.shields.io/badge/Motia-0.9.0--beta-purple?style=flat-square)](https://motia.dev/)
[![Docker](https://img.shields.io/badge/Docker-Compose-blue?style=flat-square&logo=docker)](https://docker.com/)
[![MinIO](https://img.shields.io/badge/MinIO-S3%20Compatible-red?style=flat-square&logo=minio)](https://min.io/)

> A comprehensive platform that combines AI-driven chat interfaces with powerful workflow automation, featuring file processing capabilities and seamless integration with modern development tools.

---

## 🌟 Features

### 🤖 AI-Powered Chat Interface

- **Advanced Chat System** powered by AI SDK React
- **File Attachments** with intelligent processing
- **Real-time Streaming** responses
- **Multi-format Support** (documents, images, archives)

### ⚡ Workflow Automation

- **Motia Workflow Engine** for complex automation
- **Pet Store API Integration** for demo workflows
- **State Management** with audit capabilities
- **Notification Systems** with step-by-step processing

### 🗄️ File Management

- **MinIO S3-Compatible Storage** for file persistence
- **Intelligent File Type Detection** (archives, images, documents, videos)
- **Secure Upload System** with comprehensive metadata
- **Docker-based Infrastructure** for easy deployment

### 🛠️ Developer Experience

- **TypeScript** throughout the entire stack
- **Comprehensive Makefile** for project management
- **Hot Reload** development environment
- **Docker Compose** for seamless local development

---

## 🏗️ Architecture

```text
motiflow/
├── 🌐 web/motia-bridge/          # Next.js AI Chat Interface
│   ├── app/                      # App Router pages & API routes
│   ├── components/               # Reusable UI components
│   └── lib/                      # Utilities & integrations
├── ⚙️ workflows/motia-flows/     # Motia Workflow Engine
│   ├── src/services/             # Business logic & API integrations
│   ├── steps/                    # Workflow step definitions
│   └── tutorial/                 # Learning resources
├── 🐳 infra/docker/              # Infrastructure as Code
│   ├── docker-compose.yaml      # Service orchestration
│   └── scripts/                  # Deployment utilities
└── 📋 Makefile                   # Project management commands
```

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18+ and npm
- **Docker** and Docker Compose
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

- 🐳 Start MinIO infrastructure
- 🌐 Launch NextJS web app on <http://localhost:3000>
- ⚙️ Start Motia workflow engine
- ⏳ Wait for all services to be ready

### 3️⃣ Access Applications

- **Web Interface**: <http://localhost:3000>
- **MinIO Console**: <http://localhost:9001> (admin/admin123)
- **MinIO API**: <http://localhost:9000>

---

## 📋 Available Commands

Our comprehensive Makefile provides everything you need:

### 🛠️ Development

```bash
make dev                 # 🚀 Start full development environment
make dev-web            # 🌐 Web app only
make dev-workflows      # ⚙️ Workflows only
make status             # 📊 Check all services status
```

### 📦 Dependencies & Building

```bash
make install            # 📦 Install all dependencies
make build              # 🏗️ Build all components
make clean              # 🧹 Clean all artifacts
make update             # 🔄 Update all dependencies
```

### 🐳 Infrastructure

```bash
make start-infra        # 🐳 Start Docker services
make stop-infra         # 🛑 Stop Docker services
make logs               # 📋 View all logs
make backup             # 💾 Backup MinIO data
```

### 🔍 Quality & Testing

```bash
make lint               # 🔍 Lint all code
make test               # 🧪 Run all tests
make format             # ✨ Format all code
make check              # 🔎 Run all quality checks
```

### 🎯 Quick Commands

```bash
make help               # 📚 Show all available commands
make doctor             # 🔍 System health check
make up                 # ⚡ Alias for start-infra
make web                # ⚡ Alias for dev-web
```

---

## 🔧 Configuration

### Environment Variables

#### Web Application (`web/motia-bridge/.env.local`)

```env
# AI Configuration
OPENAI_API_KEY=your_openai_api_key

# MinIO Configuration  
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
// Chat with AI
POST /api/chat
{
  "messages": [...],
  "attachments": [...]
}

// File Upload
POST /api/upload
{
  "file": File,
  "metadata": {...}
}
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

- **AI SDK React Integration** for streaming chat
- **File Upload System** with MinIO persistence
- **Responsive UI** built with Tailwind CSS
- **TypeScript** for type safety

### ⚙️ Workflow Engine (`workflows/motia-flows/`)

Motia-powered automation engine including:

- **Pet Store Services** for demo workflows
- **Step Definitions** for workflow logic
- **State Management** with audit capabilities
- **API Integrations** for external services

### 🐳 Infrastructure (`infra/docker/`)

Docker-based infrastructure featuring:

- **MinIO S3 Storage** for file persistence
- **Automatic Bucket Setup** with initialization scripts
- **Network Configuration** for service communication
- **Volume Management** for data persistence

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

### 2. Testing Uploads

```bash
# Ensure infrastructure is running
make status

# Test file upload via web interface
# Check MinIO console for uploaded files
make open-minio
```

### 3. Workflow Testing

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
# Check system health
make doctor

# Reset everything
make clean
make setup-dev
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
make doctor             # 🔍 System health check  
make logs               # 📋 All service logs
make open-minio         # 🌐 MinIO web console
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
- **[Motia](https://motia.dev/)** - Workflow automation engine
- **[AI SDK](https://sdk.vercel.ai/)** - AI application development
- **[MinIO](https://min.io/)** - S3-compatible object storage
- **[TypeScript](https://typescriptlang.org/)** - Type-safe JavaScript
- **[Docker](https://docker.com/)** - Containerization platform

---

## 🚀 Made by the Motiflow Team

[🌐 Website](https://motiflow.dev) • [📚 Docs](https://docs.motiflow.dev) • [💬 Discord](https://discord.gg/motiflow)