# Hexagonal Architecture

## Overview

The Motiflow Dashboard follows **Hexagonal Architecture** (also known as Ports & Adapters) to ensure clean separation of concerns and maintainability.

## Architecture Layers

```
┌─────────────────────────────────────┐
│     Presentation Layer              │  ← Next.js Pages, Components
│  (React, Next.js App Router)        │
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│     Application Layer               │  ← Use Cases, DTOs, Services
│  (Orchestration, Business Logic)    │
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│     Domain Layer                     │  ← Entities, Value Objects, Events
│  (Pure Business Logic, No Dependencies)│
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│     Infrastructure Layer            │  ← Prisma, External APIs, Event Bus
│  (Adapters, Implementations)        │
└─────────────────────────────────────┘
```

## Core Principles

### 1. Domain Layer (Core)

- **Entities**: Business objects with identity (Epic, Story, Task, Sprint)
- **Value Objects**: Immutable objects without identity (Status, Priority, StoryPoints)
- **Domain Events**: Events that represent business occurrences
- **Domain Services**: Services that contain domain logic not belonging to entities
- **No Dependencies**: Domain layer has zero external dependencies

### 2. Application Layer

- **Use Cases**: Orchestrate domain objects to fulfill use cases
- **DTOs**: Data Transfer Objects for communication between layers
- **Application Services**: Services that coordinate multiple use cases

### 3. Infrastructure Layer

- **Adapters**: Implementations of ports (Prisma repositories, Event bus)
- **External Services**: Integration with external systems

### 4. Presentation Layer

- **Pages**: Next.js pages and routes
- **Components**: React components
- **Server Actions**: Next.js server actions that call use cases

## Ports & Adapters

### Ports (Interfaces)

Ports are defined in the core and represent contracts:

- `EpicRepositoryPort`: Contract for epic persistence
- `StoryRepositoryPort`: Contract for story persistence
- `TaskRepositoryPort`: Contract for task persistence
- `EventBusPort`: Contract for event publishing

### Adapters (Implementations)

Adapters implement ports:

- `EpicPrismaRepository`: Prisma implementation of `EpicRepositoryPort`
- `EventBusAdapter`: In-memory implementation of `EventBusPort`

## Dependency Rule

**Dependencies point inward**: Outer layers depend on inner layers, never the reverse.

- Presentation → Application → Domain
- Infrastructure → Application → Domain
- Domain has no dependencies

## Benefits

1. **Testability**: Core can be tested without infrastructure
2. **Flexibility**: Easy to swap implementations (e.g., Prisma → MongoDB)
3. **Maintainability**: Clear separation of concerns
4. **Independence**: Core is framework-agnostic

## Example Flow

```
User Action
    ↓
Next.js Page (Presentation)
    ↓
Server Action (Presentation)
    ↓
Use Case (Application)
    ↓
Entity (Domain)
    ↓
Repository Port (Application)
    ↓
Prisma Repository (Infrastructure)
    ↓
Database
```
