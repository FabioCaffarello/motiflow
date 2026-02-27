---
name: Transformação AppBuilder em Next.js App
overview: Plano completo e rigoroso para transformar o AppBuilder Playground em uma aplicação Next.js de produção, seguindo DDD, Clean Architecture, Hexagonal Architecture, SOLID, com infraestrutura completa, DevOps, TDD e documentação robusta.
todos:
  - id: swot-analysis
    content: Realizar análise SWOT completa do playground atual
    status: completed
  - id: setup-submodule
    content: Adicionar git submodule app-builder em admin/
    status: completed
  - id: create-nextjs-app
    content: Criar aplicação Next.js com CLI
    status: completed
  - id: setup-directory-structure
    content: Criar estrutura de diretórios completa (core, adapters, features)
    status: completed
  - id: setup-prisma
    content: Configurar Prisma com PostgreSQL e criar schema inicial
    status: completed
  - id: implement-domain-layer
    content: Implementar domain layer (entities, value objects, events)
    status: completed
  - id: implement-application-layer
    content: Implementar application layer (use cases, DTOs, mappers)
    status: completed
  - id: implement-repositories
    content: Implementar repositories com Prisma
    status: completed
  - id: setup-server-actions
    content: Criar server actions para mutations
    status: completed
  - id: setup-api-routes
    content: Criar API routes para queries
    status: completed
  - id: integrate-design-system
    content: Integrar react-design-system no Next.js
    status: completed
  - id: migrate-appbuilder
    content: Migrar AppBuilder do design system para o novo app
    status: in_progress
  - id: setup-docker
    content: Configurar Docker e Docker Compose
    status: pending
  - id: setup-cicd
    content: Configurar GitHub Actions CI/CD
    status: pending
  - id: setup-testing
    content: Configurar Jest e Playwright para TDD
    status: pending
  - id: setup-husky
    content: Configurar Husky com git hooks
    status: pending
  - id: create-makefile
    content: Criar Makefile com comandos úteis
    status: pending
  - id: write-adrs
    content: Escrever ADRs iniciais (001-006)
    status: pending
  - id: write-architecture-docs
    content: Escrever documentação arquitetural completa
    status: pending
  - id: write-development-guides
    content: Escrever guias de desenvolvimento
    status: pending
---

# Transformação do AppBuilder Playground em Aplicação Next.js

## Fase 0: Análise SWOT do Playground Atual

### Strengths (Forças)

- **Componente funcional completo**: AppBuilder com todas funcionalidades implementadas
- **Design System integrado**: Uso exclusivo do react-design-system
- **Arquitetura modular**: Componentes bem separados (Header, Canvas, Properties, Toolbar)
- **Funcionalidades avançadas**: Drag-and-drop, undo/redo, keyboard shortcuts, toast com undo
- **Preview real**: Renderização dinâmica de componentes
- **Code generation**: Exportação de código React
- **Templates**: Sistema de templates para quick start
- **State management**: Hook customizado (useAppBuilder) centralizado

### Weaknesses (Fraquezas)

- **Sem persistência real**: Apenas localStorage, sem backend
- **Sem autenticação**: Não há controle de acesso
- **Sem versionamento**: Não há histórico de versões de apps
- **Sem colaboração**: Não há compartilhamento entre usuários
- **Sem validação server-side**: Validação apenas client-side
- **Sem testes automatizados**: Cobertura de testes limitada
- **Sem documentação arquitetural**: Falta ADRs, RFCs
- **Monolito frontend**: Tudo no mesmo componente React

### Opportunities (Oportunidades)

- **Produto SaaS**: Transformar em plataforma de construção de apps
- **Marketplace de templates**: Comunidade compartilhando templates
- **Integração com CI/CD**: Deploy automático de apps gerados
- **Colaboração em tempo real**: Múltiplos usuários editando
- **Analytics**: Métricas de uso e performance
- **Exportação avançada**: Next.js, Remix, outros frameworks
- **API pública**: Permitir integração externa

### Threats (Ameaças)

- **Complexidade crescente**: Risco de arquitetura não escalável
- **Performance**: Renderização de muitos componentes pode degradar
- **Manutenibilidade**: Código pode ficar difícil de manter sem estrutura adequada
- **Concorrência**: Outras ferramentas no mercado (Figma Dev Mode, Builder.io)
- **Dependências**: Risco de breaking changes em dependências

---

## Fase 1: Setup Inicial e Estrutura Base

### 1.1 Adicionar Git Submodule

**Arquivo**: `.gitmodules`

Adicionar submodule do app-builder:

```bash
git submodule add git@github.com:FabioCaffarello/app-builder.git admin/app-builder
git submodule update --init --recursive
```

**Estrutura resultante**:

```
motiflow/
├── admin/
│   └── app-builder/          # Git submodule (repo privado)
│       └── README.md          # Apenas README inicial
```

### 1.2 Criar Aplicação Next.js

**Comando**:

```bash
cd admin/app-builder
npx create-next-app@latest . --typescript --tailwind --app --no-src-dir --import-alias "@/*"
```

**Configurações**:

- TypeScript: Sim
- ESLint: Sim
- Tailwind CSS: Sim (mas usaremos apenas react-design-system)
- App Router: Sim
- src/ directory: Não (estrutura flat)
- Import alias: `@/*`

### 1.3 Estrutura de Diretórios Inicial

```
admin/app-builder/
├── .github/
│   └── workflows/             # GitHub Actions CI/CD
├── .husky/                    # Git hooks
├── .temp/                     # Arquivos temporários (gitignored)
├── app/                       # Next.js App Router
│   ├── (auth)/                # Route group para autenticação
│   ├── (dashboard)/           # Route group para dashboard
│   ├── api/                   # API routes
│   ├── layout.tsx
│   └── page.tsx
├── docs/                      # Documentação permanente
│   ├── adr/                   # Architecture Decision Records
│   ├── rfc/                   # Request for Comments
│   ├── architecture/          # Documentação arquitetural
│   └── guides/                # Guias de desenvolvimento
├── prisma/                    # Prisma schema e migrations
│   ├── schema.prisma
│   └── migrations/
├── src/
│   ├── core/                  # Core domain (DDD)
│   │   ├── domain/            # Entities, Value Objects, Events
│   │   ├── application/       # Use Cases, DTOs, Services
│   │   └── ports/             # Interfaces (Repository, EventBus)
│   ├── adapters/              # Adapters (Hexagonal Architecture)
│   │   ├── driving/           # Server Actions, API Routes
│   │   └── driven/            # Prisma Repositories, External APIs
│   ├── features/              # Feature-based organization
│   │   ├── apps/              # Feature: Apps Management
│   │   ├── templates/         # Feature: Templates Management
│   │   ├── collaboration/     # Feature: Collaboration
│   │   └── export/            # Feature: Export Management
│   ├── shared/                # Shared code
│   │   ├── components/        # Componentes compartilhados
│   │   ├── hooks/             # Hooks compartilhados
│   │   ├── utils/             # Utilitários
│   │   └── types/             # Types compartilhados
│   └── infrastructure/        # Infrastructure layer
│       ├── database/          # Prisma client, migrations
│       ├── auth/              # Autenticação (NextAuth.js)
│       ├── events/            # Event bus
│       └── external/          # APIs externas
├── tests/                     # Testes
│   ├── unit/                  # Testes unitários
│   ├── integration/           # Testes de integração
│   └── e2e/                   # Testes E2E (Playwright)
├── docker/                    # Docker configuration
│   ├── Dockerfile
│   ├── Dockerfile.dev
│   └── docker-compose.yml
├── .env.example
├── .env.local.example
├── .gitignore
├── .eslintrc.json
├── .prettierrc
├── jest.config.js
├── playwright.config.ts
├── next.config.js
├── package.json
├── tsconfig.json
├── Makefile
└── README.md
```

---

## Fase 2: Arquitetura e Design Patterns

### 2.1 Domain-Driven Design (DDD)

**Bounded Contexts**:

1. **App Management Context**: Gerenciamento de aplicações
2. **Template Context**: Templates e marketplace
3. **Collaboration Context**: Colaboração e compartilhamento
4. **Export Context**: Exportação e deploy

**Aggregates**:

- `App` (Aggregate Root)
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - Entities: `App`, `Feature`, `Component`, `Version`
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - Value Objects: `AppConfig`, `FeatureConfig`, `ComponentConfig`, `LayoutConfig`
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - Domain Events: `AppCreated`, `AppUpdated`, `AppPublished`, `FeatureAdded`, `ComponentAdded`

- `Template` (Aggregate Root)
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - Entities: `Template`, `TemplateVersion`
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - Value Objects: `TemplateConfig`, `TemplateMetadata`
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - Domain Events: `TemplateCreated`, `TemplatePublished`, `TemplateShared`

- `User` (Aggregate Root)
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - Entities: `User`, `Workspace`, `Permission`
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - Value Objects: `UserRole`, `PermissionLevel`
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - Domain Events: `UserCreated`, `WorkspaceCreated`, `PermissionGranted`

**Domain Services**:

- `AppValidationService`: Validação de regras de negócio
- `CodeGenerationService`: Geração de código
- `TemplateMatchingService`: Matching de templates com requisitos

### 2.2 Clean Architecture Layers

**Estrutura de camadas**:

```
src/
├── core/                      # Inner layer (no dependencies)
│   ├── domain/                # Entities, Value Objects, Domain Events
│   │   ├── entities/
│   │   │   ├── App.ts
│   │   │   ├── Feature.ts
│   │   │   ├── Component.ts
│   │   │   └── Template.ts
│   │   ├── value-objects/
│   │   │   ├── AppConfig.ts
│   │   │   ├── FeatureConfig.ts
│   │   │   └── ComponentConfig.ts
│   │   ├── events/
│   │   │   ├── AppCreated.ts
│   │   │   └── AppUpdated.ts
│   │   └── services/
│   │       ├── AppValidationService.ts
│   │       └── CodeGenerationService.ts
│   ├── application/           # Use Cases, DTOs
│   │   ├── use-cases/
│   │   │   ├── apps/
│   │   │   │   ├── CreateAppUseCase.ts
│   │   │   │   ├── UpdateAppUseCase.ts
│   │   │   │   ├── DeleteAppUseCase.ts
│   │   │   │   └── PublishAppUseCase.ts
│   │   │   └── templates/
│   │   │       ├── CreateTemplateUseCase.ts
│   │   │       └── ShareTemplateUseCase.ts
│   │   ├── dto/
│   │   │   ├── AppDto.ts
│   │   │   └── TemplateDto.ts
│   │   └── mappers/
│   │       ├── AppMapper.ts
│   │       └── TemplateMapper.ts
│   └── ports/                 # Interfaces (contracts)
│       ├── repositories/
│       │   ├── IAppRepository.ts
│       │   └── ITemplateRepository.ts
│       ├── services/
│       │   ├── ICodeGenerator.ts
│       │   └── IEventBus.ts
│       └── external/
│           ├── IStorageService.ts
│           └── IDeploymentService.ts
├── adapters/                  # Outer layer (implementations)
│   ├── driving/               # Inbound adapters
│   │   ├── http/              # API Routes
│   │   │   └── api/
│   │   │       ├── apps/
│   │   │       └── templates/
│   │   └── server-actions/    # Server Actions
│   │       ├── apps/
│   │       └── templates/
│   └── driven/                # Outbound adapters
│       ├── database/          # Prisma repositories
│       │   ├── PrismaAppRepository.ts
│       │   └── PrismaTemplateRepository.ts
│       ├── events/            # Event bus implementation
│       │   └── InMemoryEventBus.ts
│       └── external/          # External services
│           ├── S3StorageService.ts
│           └── VercelDeploymentService.ts
```

### 2.3 Hexagonal Architecture (Ports & Adapters)

**Ports (Interfaces)**:

- **Driving Ports** (Inbound):
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - `IAppController`: Interface para controladores de apps
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - `ITemplateController`: Interface para controladores de templates

- **Driven Ports** (Outbound):
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - `IAppRepository`: Interface para persistência de apps
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - `ITemplateRepository`: Interface para persistência de templates
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - `IEventBus`: Interface para eventos
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - `IStorageService`: Interface para armazenamento de arquivos
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - `ICodeGenerator`: Interface para geração de código

**Adapters (Implementations)**:

- **Driving Adapters**:
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - Next.js API Routes
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - Server Actions
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - React Server Components

- **Driven Adapters**:
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - Prisma repositories
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - PostgreSQL database
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - S3/MinIO storage
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - Event bus (in-memory ou Redis)

### 2.4 SOLID Principles

**Single Responsibility**:

- Cada use case tem uma única responsabilidade
- Repositories apenas para persistência
- Services apenas para lógica de negócio

**Open/Closed**:

- Interfaces (ports) abertas para extensão
- Implementações fechadas para modificação
- Strategy pattern para code generators

**Liskov Substitution**:

- Implementações de repositories são substituíveis
- Diferentes code generators implementam mesma interface

**Interface Segregation**:

- Interfaces específicas (IAppRepository, ITemplateRepository)
- Não uma interface genérica IRepository

**Dependency Inversion**:

- Core depende de abstrações (ports)
- Adapters implementam abstrações
- Dependency injection via construtor

### 2.5 Feature-Based Organization

**Estrutura por features**:

```
src/features/
├── apps/                      # Feature: Apps Management
│   ├── domain/                # Domain específico da feature
│   ├── application/           # Use cases da feature
│   ├── adapters/              # Adapters da feature
│   │   ├── driving/           # API routes, server actions
│   │   └── driven/            # Repositories específicos
│   └── presentation/          # Componentes React
│       ├── components/
│       ├── pages/
│       └── hooks/
├── templates/                 # Feature: Templates
├── collaboration/              # Feature: Collaboration
└── export/                     # Feature: Export
```

**Regras**:

- Cada feature é independente
- Features podem ter seu próprio domain
- Features compartilham core domain quando necessário
- Features não dependem de outras features diretamente

---

## Fase 3: Backend e Persistência

### 3.1 Escolha do Banco de Dados

**Análise**:

**PostgreSQL** (Recomendado):

- ✅ Suporte robusto a JSON/JSONB (AppConfig, FeatureConfig)
- ✅ Transações ACID
- ✅ Full-text search nativo
- ✅ Suporte a arrays e tipos complexos
- ✅ Escalabilidade horizontal
- ✅ Prisma tem excelente suporte
- ✅ Extensões (PostGIS, pg_trgm)

**Alternativas consideradas**:

- MongoDB: Boa para documentos, mas falta transações complexas
- MySQL: Menos suporte a JSON avançado
- SQLite: Não escala para produção

**Decisão**: PostgreSQL

### 3.2 Schema Prisma

**Arquivo**: `prisma/schema.prisma`

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// User Aggregate
model User {
  id        String   @id @default(cuid())
  email     String   @unique
  name      String?
  image     String?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  workspaces WorkspaceMember[]
  apps       App[]
  templates  Template[]

  @@map("users")
}

// Workspace Aggregate
model Workspace {
  id        String   @id @default(cuid())
  name      String
  slug      String   @unique
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  members WorkspaceMember[]
  apps    App[]

  @@map("workspaces")
}

model WorkspaceMember {
  id         String        @id @default(cuid())
  workspaceId String
  userId     String
  role       WorkspaceRole @default(MEMBER)
  createdAt  DateTime      @default(now())

  workspace Workspace @relation(fields: [workspaceId], references: [id], onDelete: Cascade)
  user      User      @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([workspaceId, userId])
  @@map("workspace_members")
}

enum WorkspaceRole {
  OWNER
  ADMIN
  MEMBER
  VIEWER
}

// App Aggregate Root
model App {
  id          String   @id @default(cuid())
  name        String
  description String?   @db.Text
  slug        String
  status      AppStatus @default(DRAFT)
  config      Json     // AppConfig completo
  userId      String
  workspaceId String?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  publishedAt DateTime?

  user      User       @relation(fields: [userId], references: [id], onDelete: Cascade)
  workspace Workspace? @relation(fields: [workspaceId], references: [id], onDelete: SetNull)
  versions  AppVersion[]
  exports   AppExport[]

  @@unique([userId, slug])
  @@index([userId])
  @@index([workspaceId])
  @@index([status])
  @@map("apps")
}

enum AppStatus {
  DRAFT
  PUBLISHED
  ARCHIVED
}

// App Version (para versionamento)
model AppVersion {
  id        String   @id @default(cuid())
  appId     String
  version   String   // Semantic version: 1.0.0
  config    Json     // AppConfig snapshot
  changelog String?  @db.Text
  createdAt DateTime @default(now())

  app App @relation(fields: [appId], references: [id], onDelete: Cascade)

  @@unique([appId, version])
  @@index([appId])
  @@map("app_versions")
}

// Template Aggregate Root
model Template {
  id          String         @id @default(cuid())
  name        String
  description String?        @db.Text
  category    TemplateCategory
  config      Json           // AppConfig do template
  isPublic    Boolean        @default(false)
  userId      String
  createdAt   DateTime       @default(now())
  updatedAt   DateTime       @updatedAt

  user     User            @relation(fields: [userId], references: [id], onDelete: Cascade)
  versions TemplateVersion[]
  stats    TemplateStats?

  @@index([category])
  @@index([isPublic])
  @@index([userId])
  @@map("templates")
}

enum TemplateCategory {
  DASHBOARD
  LANDING_PAGE
  ECOMMERCE
  SAAS
  PORTFOLIO
  BLOG
  ADMIN
  CUSTOM
}

model TemplateVersion {
  id          String   @id @default(cuid())
  templateId  String
  version     String
  config      Json
  changelog   String?  @db.Text
  createdAt   DateTime @default(now())

  template Template @relation(fields: [templateId], references: [id], onDelete: Cascade)

  @@unique([templateId, version])
  @@index([templateId])
  @@map("template_versions")
}

model TemplateStats {
  id         String   @id @default(cuid())
  templateId String  @unique
  views      Int      @default(0)
  uses       Int      @default(0)
  likes      Int      @default(0)
  updatedAt  DateTime @updatedAt

  template Template @relation(fields: [templateId], references: [id], onDelete: Cascade)

  @@map("template_stats")
}

// Export Aggregate
model AppExport {
  id        String      @id @default(cuid())
  appId     String
  type      ExportType
  format    ExportFormat
  status    ExportStatus @default(PENDING)
  output    Json?       // Resultado da exportação
  error     String?     @db.Text
  createdAt DateTime    @default(now())
  completedAt DateTime?

  app App @relation(fields: [appId], references: [id], onDelete: Cascade)

  @@index([appId])
  @@index([status])
  @@map("app_exports")
}

enum ExportType {
  CODE
  DEPLOYMENT
  PACKAGE
}

enum ExportFormat {
  NEXTJS
  REACT
  REMIX
  VITE
}

enum ExportStatus {
  PENDING
  PROCESSING
  COMPLETED
  FAILED
}

// Collaboration (futuro)
model Collaboration {
  id        String   @id @default(cuid())
  appId     String
  userId    String
  role      CollaborationRole
  createdAt DateTime @default(now())

  @@unique([appId, userId])
  @@index([appId])
  @@map("collaborations")
}

enum CollaborationRole {
  OWNER
  EDITOR
  VIEWER
}
```

### 3.3 Repositories (Prisma)

**Estrutura**:

```
src/adapters/driven/database/
├── repositories/
│   ├── PrismaAppRepository.ts
│   ├── PrismaTemplateRepository.ts
│   └── PrismaUserRepository.ts
├── mappers/
│   ├── AppMapper.ts
│   └── TemplateMapper.ts
└── prisma.ts                 # Prisma client singleton
```

**Exemplo PrismaAppRepository**:

```typescript
// src/adapters/driven/database/repositories/PrismaAppRepository.ts
import { PrismaClient } from '@prisma/client';
import type { IAppRepository } from '@/core/ports/repositories/IAppRepository';
import type { App } from '@/core/domain/entities/App';
import { AppMapper } from '../mappers/AppMapper';

export class PrismaAppRepository implements IAppRepository {
  constructor(private prisma: PrismaClient) {}

  async findById(id: string): Promise<App | null> {
    const appData = await this.prisma.app.findUnique({
      where: { id },
      include: { versions: true },
    });
    return appData ? AppMapper.toDomain(appData) : null;
  }

  async findByUserId(userId: string): Promise<App[]> {
    const apps = await this.prisma.app.findMany({
      where: { userId },
      orderBy: { updatedAt: 'desc' },
    });
    return apps.map(AppMapper.toDomain);
  }

  async save(app: App): Promise<void> {
    const appData = AppMapper.toPersistence(app);
    await this.prisma.app.upsert({
      where: { id: app.id },
      create: appData,
      update: appData,
    });
  }

  async delete(id: string): Promise<void> {
    await this.prisma.app.delete({ where: { id } });
  }
}
```

---

## Fase 4: Frontend com Next.js

### 4.1 Integração com react-design-system

**Estrutura**:

```
src/shared/
├── components/
│   └── design-system/         # Wrapper para react-design-system
│       ├── index.ts
│       └── providers.ts
└── lib/
    └── design-system.ts       # Configuração e setup
```

**Configuração**:

- Importar react-design-system como dependência local (via path alias)
- Criar providers wrapper para ThemeProvider, AppProvider
- Nunca usar shadcn ou outros design systems

### 4.2 Server Actions (Next.js App Router)

**Estrutura**:

```
src/adapters/driving/server-actions/
├── apps/
│   ├── create-app.ts
│   ├── update-app.ts
│   ├── delete-app.ts
│   └── publish-app.ts
└── templates/
    ├── create-template.ts
    └── share-template.ts
```

**Exemplo**:

```typescript
// src/adapters/driving/server-actions/apps/create-app.ts
'use server';

import { CreateAppUseCase } from '@/core/application/use-cases/apps/CreateAppUseCase';
import { PrismaAppRepository } from '@/adapters/driven/database/repositories/PrismaAppRepository';
import { getPrismaClient } from '@/infrastructure/database/prisma';
import { getCurrentUser } from '@/infrastructure/auth/session';

export async function createApp(data: CreateAppDto) {
  const user = await getCurrentUser();
  if (!user) throw new Error('Unauthorized');

  const repository = new PrismaAppRepository(getPrismaClient());
  const useCase = new CreateAppUseCase(repository);
  
  return useCase.execute({
    ...data,
    userId: user.id,
  });
}
```

### 4.3 API Routes

**Estrutura**:

```
app/api/
├── apps/
│   ├── route.ts               # GET, POST /api/apps
│   └── [id]/
│       ├── route.ts           # GET, PUT, DELETE /api/apps/[id]
│       └── publish/
│           └── route.ts       # POST /api/apps/[id]/publish
└── templates/
    ├── route.ts
    └── [id]/
        └── route.ts
```

### 4.4 Páginas e Componentes

**Estrutura**:

```
app/
├── (auth)/
│   ├── login/
│   └── signup/
├── (dashboard)/
│   ├── apps/
│   │   ├── page.tsx           # Lista de apps
│   │   ├── new/
│   │   │   └── page.tsx       # Criar novo app
│   │   └── [id]/
│   │       ├── page.tsx       # Editor do app
│   │       └── preview/
│   │           └── page.tsx    # Preview do app
│   ├── templates/
│   └── settings/
└── layout.tsx
```

**Componentes**:

```
src/features/apps/presentation/
├── components/
│   ├── AppList.tsx
│   ├── AppEditor.tsx          # Wrapper do AppBuilder do design system
│   ├── AppPreview.tsx
│   └── AppHeader.tsx
└── hooks/
    ├── useApp.ts
    └── useApps.ts
```

---

## Fase 5: DevOps e Infraestrutura

### 5.1 Docker e Docker Compose

**Arquivo**: `docker/docker-compose.yml`

```yaml
version: '3.8'

services:
  postgres:
    image: postgres:16-alpine
    environment:
      POSTGRES_USER: appbuilder
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
      POSTGRES_DB: appbuilder
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U appbuilder"]
      interval: 10s
      timeout: 5s
      retries: 5

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data

  app:
    build:
      context: ..
      dockerfile: docker/Dockerfile
    environment:
      DATABASE_URL: postgresql://appbuilder:${POSTGRES_PASSWORD}@postgres:5432/appbuilder
      REDIS_URL: redis://redis:6379
      NODE_ENV: production
    ports:
      - "3000:3000"
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_started

volumes:
  postgres_data:
  redis_data:
```

**Arquivo**: `docker/Dockerfile`

```dockerfile
FROM node:20-alpine AS base

# Dependencies
FROM base AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci

# Build
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# Production
FROM base AS runner
WORKDIR /app
ENV NODE_ENV production

COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

EXPOSE 3000
ENV PORT 3000

CMD ["node", "server.js"]
```

### 5.2 GitHub Actions CI/CD

**Arquivo**: `.github/workflows/ci.yml`

```yaml
name: CI/CD

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  test:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:16-alpine
        env:
          POSTGRES_PASSWORD: test
          POSTGRES_DB: appbuilder_test
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
        ports:
          - 5432:5432

    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      
      - run: npm ci
      - run: npm run test
      - run: npm run test:e2e
      - run: npm run lint
      - run: npm run type-check

  build:
    runs-on: ubuntu-latest
    needs: test
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      
      - run: npm ci
      - run: npm run build

  deploy-staging:
    runs-on: ubuntu-latest
    needs: build
    if: github.ref == 'refs/heads/develop'
    steps:
      # Deploy para staging

  deploy-production:
    runs-on: ubuntu-latest
    needs: build
    if: github.ref == 'refs/heads/main'
    steps:
      # Deploy para produção
```

### 5.3 Ambientes

**Desenvolvimento**:

- Local com Docker Compose
- Hot reload
- Database local (PostgreSQL)
- Redis local

**Staging**:

- Ambiente de teste
- Database separado
- Deploy automático de `develop`

**Produção**:

- Ambiente de produção
- Database gerenciado
- Deploy automático de `main`
- Monitoring e logging

---

## Fase 6: Testes (TDD)

### 6.1 Estrutura de Testes

```
tests/
├── unit/
│   ├── domain/
│   │   ├── entities/
│   │   └── value-objects/
│   ├── application/
│   │   └── use-cases/
│   └── adapters/
├── integration/
│   ├── api/
│   ├── database/
│   └── server-actions/
└── e2e/
    ├── apps.spec.ts
    └── templates.spec.ts
```

### 6.2 Configuração Jest

**Arquivo**: `jest.config.js`

```javascript
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src', '<rootDir>/tests'],
  testMatch: ['**/__tests__/**/*.ts', '**/?(*.)+(spec|test).ts'],
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.d.ts',
    '!src/**/*.stories.tsx',
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
};
```

### 6.3 Configuração Playwright

**Arquivo**: `playwright.config.ts`

```typescript
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
  },
});
```

---

## Fase 7: Documentação

### 7.1 ADRs (Architecture Decision Records)

**Estrutura**: `docs/adr/`

**Template ADR**:

```markdown
# ADR-XXX: [Título da Decisão]

## Status
[Proposed | Accepted | Deprecated | Superseded]

## Context
[Contexto que levou à decisão]

## Decision
[Decisão tomada]

## Consequences
[Consequências positivas e negativas]
```

**ADRs iniciais**:

- ADR-001: Escolha do PostgreSQL como banco de dados
- ADR-002: Arquitetura Hexagonal para isolamento do core
- ADR-003: Feature-based organization para escalabilidade
- ADR-004: Next.js App Router para routing
- ADR-005: Prisma como ORM
- ADR-006: Server Actions para mutations

### 7.2 RFCs (Request for Comments)

**Estrutura**: `docs/rfc/`

**Template RFC**:

```markdown
# RFC-XXX: [Título da Proposta]

## Summary
[Resumo executivo]

## Motivation
[Motivação]

## Detailed Design
[Design detalhado]

## Alternatives Considered
[Alternativas]

## Implementation Plan
[Plano de implementação]
```

### 7.3 Documentação Arquitetural

**Estrutura**: `docs/architecture/`

- `overview.md`: Visão geral da arquitetura
- `domain-model.md`: Modelo de domínio (DDD)
- `hexagonal-architecture.md`: Arquitetura hexagonal
- `feature-organization.md`: Organização por features
- `database-schema.md`: Schema do banco de dados
- `api-design.md`: Design da API
- `testing-strategy.md`: Estratégia de testes

### 7.4 Guias de Desenvolvimento

**Estrutura**: `docs/guides/`

- `getting-started.md`: Guia de início
- `development-workflow.md`: Fluxo de desenvolvimento
- `adding-a-feature.md`: Como adicionar uma feature
- `testing-guide.md`: Guia de testes
- `deployment-guide.md`: Guia de deploy

### 7.5 Diretório Temporário

**Estrutura**: `.temp/`

- Arquivos temporários
- Documentação em rascunho
- Notas de reunião
- Arquivos que não devem ser commitados

---

## Fase 8: Git Hooks e Qualidade

### 8.1 Husky Setup

**Arquivo**: `package.json`

```json
{
  "scripts": {
    "prepare": "husky install",
    "lint-staged": "lint-staged"
  },
  "lint-staged": {
    "*.{ts,tsx}": [
      "eslint --fix",
      "prettier --write"
    ],
    "*.{json,md}": [
      "prettier --write"
    ]
  }
}
```

**Arquivo**: `.husky/pre-commit`

```bash
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

npm run lint-staged
npm run test:unit
```

**Arquivo**: `.husky/pre-push`

```bash
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

npm run test
npm run type-check
npm run build
```

### 8.2 ESLint e Prettier

**Arquivo**: `.eslintrc.json`

```json
{
  "extends": [
    "next/core-web-vitals",
    "plugin:@typescript-eslint/recommended",
    "prettier"
  ],
  "rules": {
    "@typescript-eslint/no-unused-vars": "error",
    "@typescript-eslint/no-explicit-any": "warn",
    "prefer-const": "error"
  }
}
```

---

## Fase 9: Makefile

**Arquivo**: `Makefile`

```makefile
.PHONY: help install dev build test clean

help: ## Mostrar ajuda
	@cat $(MAKEFILE_LIST) | grep -E '^[a-zA-Z_-]+:.*?## .*$$' | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-20s\033[0m %s\n", $$1, $$2}'

install: ## Instalar dependências
	npm install
	npx prisma generate

dev: ## Iniciar desenvolvimento
	npm run dev

build: ## Build de produção
	npm run build

test: ## Rodar todos os testes
	npm run test
	npm run test:e2e

test:unit: ## Testes unitários
	npm run test:unit

test:e2e: ## Testes E2E
	npm run test:e2e

lint: ## Lint do código
	npm run lint

type-check: ## Verificar tipos
	npm run type-check

db:migrate: ## Rodar migrations
	npx prisma migrate dev

db:studio: ## Abrir Prisma Studio
	npx prisma studio

docker:up: ## Subir Docker Compose
	docker compose -f docker/docker-compose.yml up -d

docker:down: ## Parar Docker Compose
	docker compose -f docker/docker-compose.yml down

clean: ## Limpar arquivos gerados
	rm -rf .next node_modules .temp
```

---

## Fase 10: Migração do AppBuilder

### 10.1 Extrair AppBuilder do Design System

**Estratégia**:

1. Copiar código do AppBuilder para o novo projeto
2. Adaptar imports para usar react-design-system como dependência
3. Criar wrappers para componentes do design system
4. Manter compatibilidade com a API atual

**Arquivos a migrar**:

- `AppBuilder.tsx` → `src/features/apps/presentation/components/AppEditor.tsx`
- `useAppBuilder.ts` → `src/features/apps/application/hooks/useAppBuilder.ts`
- `types.ts` → `src/core/domain/value-objects/AppConfig.ts`
- Componentes relacionados

### 10.2 Integração com Backend

**Adaptações necessárias**:

- Substituir `StorageManager` (localStorage) por chamadas de API
- Integrar `useAppBuilder` com Server Actions
- Adicionar loading states durante operações async
- Adicionar error handling para erros de rede

---

## Ordem de Execução

### Sprint 1: Fundação

1. Setup inicial (submodule, Next.js)
2. Estrutura de diretórios
3. Configuração básica (ESLint, Prettier, TypeScript)
4. ADR-001 a ADR-006

### Sprint 2: Backend Core

1. Schema Prisma
2. Domain entities e value objects
3. Repositories (Prisma)
4. Use cases básicos (CreateApp, GetApp)

### Sprint 3: Frontend Core

1. Integração react-design-system
2. Páginas básicas (login, dashboard)
3. Server Actions
4. API Routes

### Sprint 4: AppBuilder Integration

1. Migração do AppBuilder
2. Integração com backend
3. Persistência de apps
4. Testes de integração

### Sprint 5: Features Avançadas

1. Templates
2. Versionamento
3. Exportação
4. Colaboração (básico)

### Sprint 6: DevOps e Qualidade

1. Docker setup
2. CI/CD
3. Testes E2E
4. Documentação completa

---

## Métricas de Sucesso

- **Cobertura de testes**: > 80%
- **Performance**: First Contentful Paint < 1.5s
- **Disponibilidade**: 99.9% uptime
- **Documentação**: 100% das features documentadas
- **Code quality**: 0 critical issues no SonarQube