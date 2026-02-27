# Contributing Guide

## Architecture Guidelines

### 1. Always Start with Domain Layer

When adding new features:

1. **Domain Layer First**: Create entities, value objects, and domain events
2. **Application Layer**: Create use cases
3. **Infrastructure Layer**: Implement repositories and adapters
4. **Presentation Layer**: Create pages and components

### 2. Design Patterns

Apply appropriate design patterns:

- **Repository Pattern**: For data access
- **Factory Pattern**: For complex entity creation
- **Strategy Pattern**: For variable algorithms
- **Observer Pattern**: For event handling
- **Specification Pattern**: For complex queries

### 3. Code Organization

```
src/
├── core/
│   ├── domain/          # Entities, Value Objects, Events
│   ├── application/     # Use Cases, DTOs, Services
│   └── ports/           # Interfaces (Repository, EventBus)
├── adapters/
│   ├── driving/         # Server Actions, API Routes
│   └── driven/          # Prisma Repositories, Event Handlers
└── presentation/        # React Components, Pages
```

### 4. Testing

- **Unit Tests**: Test use cases with mocks
- **Integration Tests**: Test server actions with test database
- **E2E Tests**: Test complete user flows

### 5. Naming Conventions

- **Entities**: PascalCase (e.g., `Epic`, `Story`)
- **Use Cases**: PascalCase with suffix `UseCase` (e.g., `CreateEpicUseCase`)
- **Repositories**: PascalCase with suffix `Repository` (e.g., `EpicRepository`)
- **Server Actions**: camelCase (e.g., `createEpic`)

### 6. Commit Messages

Follow conventional commits:

- `feat: add sprint management`
- `fix: correct epic status validation`
- `refactor: extract notification service`
- `docs: update architecture documentation`

## Development Workflow

1. Create epic/story/task in the application
2. Implement following Clean Architecture
3. Write tests
4. Update documentation
5. Submit for review

## Code Review Checklist

- [ ] Follows Clean Architecture principles
- [ ] Domain layer has no external dependencies
- [ ] Appropriate design patterns applied
- [ ] Tests written and passing
- [ ] Documentation updated
- [ ] No linter errors
