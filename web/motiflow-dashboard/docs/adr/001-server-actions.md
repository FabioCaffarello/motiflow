# ADR 001: Server Actions for Data Mutations

## Status

Accepted

## Context

We needed to decide how to handle data mutations in our Next.js application. Options considered:

1. API Routes (traditional REST)
2. Server Actions (Next.js 13+)
3. GraphQL

## Decision

We chose **Server Actions** as the primary mechanism for data mutations.

## Rationale

1. **Type Safety**: Server Actions provide end-to-end type safety
2. **Performance**: No HTTP round-trip, direct function calls
3. **Simplicity**: Less boilerplate than API routes
4. **Next.js Integration**: Native support, works seamlessly with App Router
5. **Progressive Enhancement**: Forms work without JavaScript

## Implementation

Server Actions are thin wrappers around Use Cases:

```typescript
'use server';

export async function createEpic(
  title: string,
  description?: string,
  priority?: string
): Promise<ActionResult<EpicDto>> {
  const repository = new EpicPrismaRepository();
  const eventBus = new EventBusAdapter();
  const useCase = new CreateEpicUseCase(repository, eventBus);
  
  const epic = await useCase.execute({ title, description, priority });
  
  revalidatePath('/epics');
  return success(EpicDtoMapper.toDto(epic));
}
```

## Consequences

### Positive

- Reduced code complexity
- Better type safety
- Improved performance
- Easier to maintain

### Negative

- Less flexibility for external API consumers
- Tied to Next.js ecosystem

## Alternatives Considered

### API Routes

- More flexible for external consumers
- More boilerplate
- Requires manual type definitions

### GraphQL

- Overkill for current needs
- Additional complexity
- Requires GraphQL server setup

## Notes

- Server Actions are used for mutations (writes)
- Queries can use Server Actions or direct use case calls in Server Components
- Future: May add REST API for external integrations if needed
