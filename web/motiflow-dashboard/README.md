# Motiflow Dashboard

Aplicação Next.js para gestão completa do Motiflow seguindo Arquitetura Hexagonal (Ports & Adapters), Domain-Driven Design (DDD), com Prisma + PostgreSQL.

## Arquitetura

A aplicação segue **Arquitetura Hexagonal** com:

- **Core (Domain + Application)**: Lógica de negócio isolada
- **Ports**: Interfaces definidas no core
- **Adapters**: Implementações que conectam o core ao mundo externo
  - **Driving Adapters**: Next.js API routes, Pages
  - **Driven Adapters**: Prisma repositories, Event handlers

## Setup

### Pré-requisitos

- Node.js 22+
- Docker e Docker Compose
- PostgreSQL (via Docker)

### 1. Instalar Dependências

```bash
npm install
```

### 2. Configurar Banco de Dados

Certifique-se de que o PostgreSQL está rodando no Docker:

```bash
cd ../../infra/docker
docker-compose up -d postgres
```

### 3. Configurar Variáveis de Ambiente

Crie um arquivo `.env.local` na raiz do projeto:

```env
DATABASE_URL="postgresql://motiflow:motiflow123@localhost:5432/motiflow_dashboard?schema=public"
NEXT_PUBLIC_APP_URL=http://localhost:5000
```

### 4. Executar Migrations

```bash
npm run db:migrate
```

### 5. (Opcional) Seed do Banco

```bash
npm run db:seed
```

### 6. Gerar Prisma Client

```bash
npm run db:generate
```

### 7. Iniciar Desenvolvimento

```bash
npm run dev
```

A aplicação estará disponível em `http://localhost:5000`

## Scripts Disponíveis

- `npm run dev` - Inicia servidor de desenvolvimento na porta 5000
- `npm run build` - Build para produção
- `npm run start` - Inicia servidor de produção
- `npm run db:generate` - Gera Prisma Client
- `npm run db:push` - Push schema para banco (desenvolvimento)
- `npm run db:migrate` - Cria e aplica migrations
- `npm run db:studio` - Abre Prisma Studio
- `npm run db:seed` - Executa seed do banco

## Estrutura do Projeto

```
src/
├── core/                    # Core (Domain + Application)
│   ├── domain/             # Domain Layer
│   │   ├── entities/       # Entidades de negócio
│   │   ├── value-objects/  # Value Objects
│   │   ├── services/       # Domain Services
│   │   └── events/         # Domain Events
│   ├── application/        # Application Layer
│   │   ├── use-cases/      # Use Cases
│   │   └── dtos/           # DTOs
│   └── ports/              # Ports (Interfaces)
├── adapters/               # Adapters (Implementações)
│   ├── driving/            # Driving Adapters (Inbound)
│   │   └── api/            # Next.js API Routes
│   └── driven/             # Driven Adapters (Outbound)
│       ├── persistence/    # Prisma Adapters
│       └── events/         # Event Handlers
```

## Funcionalidades

### Implementadas

- ✅ Estrutura base com Arquitetura Hexagonal
- ✅ Domain Layer (Epic, Story, Task)
- ✅ Prisma + PostgreSQL
- ✅ API REST para Epics
- ✅ Dashboard básico
- ✅ Listagem de Epics

### Em Desenvolvimento

- ⏳ Gestão completa de Stories
- ⏳ Gestão completa de Tasks
- ⏳ Sprint Management
- ⏳ Kanban Board
- ⏳ ADR Management
- ⏳ Roadmap

## Próximos Passos

1. Implementar formulários de criação/edição
2. Implementar gestão completa de Stories e Tasks
3. Implementar Sprint Planning
4. Implementar Kanban Board com drag & drop
5. Implementar ADR Management
6. Implementar Roadmap com timeline
