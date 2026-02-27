---
name: Integração Server Actions Next.js
overview: Revisão e adequação da Application Layer para usar Server Actions do Next.js, criando wrappers que encapsulam Use Cases, seguindo o padrão já estabelecido no projeto.
todos:
  - id: create-action-types
    content: Criar tipos ActionResult<T> e helpers (success, failure)
    status: completed
  - id: create-app-actions
    content: Criar Server Actions para Apps (create, get, list, update, delete, publish)
    status: completed
  - id: create-template-actions
    content: Criar Server Actions para Templates (create, get, list, publish, share)
    status: completed
  - id: create-user-actions
    content: Criar Server Actions para Users (create, get, create-workspace, grant-permission)
    status: completed
  - id: create-di-container
    content: Criar container de dependências para evitar repetição de instanciação
    status: completed
  - id: create-auth-helper
    content: Criar helper getUserId() para autenticação (mock por enquanto)
    status: completed
  - id: validate-serialization
    content: Validar que todos os DTOs são serializáveis para Server Actions
    status: completed
  - id: add-revalidation
    content: Adicionar revalidatePath em todas as mutations
    status: completed
---

# Integração Server Actions Next.js - Revisão e Adequação

## Contexto

A Application Layer foi implementada com Use Cases que retornam DTOs serializáveis, o que é perfeito para Server Actions. Agora precisamos criar a camada de Server Actions que conecta o Next.js App Router aos Use Cases.

## Análise do Estado Atual

### ✅ O que já está pronto

1. **Use Cases**: Retornam DTOs (não entidades de domínio) - compatível com Server Actions
2. **DTOs**: Todos serializáveis (strings, numbers, objetos simples) - compatível com Server Actions
3. **Repositories**: Implementados e funcionais
4. **EventBus**: InMemoryEventBus implementado
5. **Mappers**: Convertem Domain ↔ DTO ↔ Persistence corretamente

### ⚠️ O que precisa ser ajustado/criado

1. **Server Actions**: Criar wrappers que instanciam Use Cases
2. **ActionResult Type**: Criar tipo para retornos type-safe
3. **Autenticação**: Definir como obter userId (por enquanto como parâmetro)
4. **Revalidação**: Adicionar `revalidatePath` após mutations
5. **Tratamento de Erros**: Padronizar com `ActionResult<T>`

## Estrutura Proposta

```
src/adapters/driving/
└── actions/                    # Server Actions (nova camada)
    ├── types.ts                # ActionResult<T> e helpers
    ├── apps/
    │   ├── create-app.action.ts
    │   ├── get-app.action.ts
    │   ├── list-apps.action.ts
    │   ├── update-app.action.ts
    │   ├── delete-app.action.ts
    │   └── publish-app.action.ts
    ├── templates/
    │   ├── create-template.action.ts
    │   ├── get-template.action.ts
    │   ├── list-templates.action.ts
    │   ├── publish-template.action.ts
    │   └── share-template.action.ts
    └── users/
        ├── create-user.action.ts
        ├── get-user.action.ts
        ├── create-workspace.action.ts
        └── grant-permission.action.ts
```

## Fase 1: Criar Tipos e Helpers

### 1.1 Criar `ActionResult<T>` Type

**Arquivo**: `src/adapters/driving/actions/types.ts`

```typescript
/**
 * Result type for Server Actions
 * Provides type-safe success/error handling
 */
export type ActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: string };

/**
 * Helper to create success result
 */
export function success<T>(data: T): ActionResult<T> {
  return { success: true, data };
}

/**
 * Helper to create error result
 */
export function failure(error: string): ActionResult<never> {
  return { success: false, error };
}
```

## Fase 2: Criar Server Actions para Apps

### 2.1 CreateAppAction

**Arquivo**: `src/adapters/driving/actions/apps/create-app.action.ts`

```typescript
'use server';

import { revalidatePath } from 'next/cache';
import { CreateAppUseCase } from '@/core/application/use-cases/apps/CreateAppUseCase';
import { PrismaAppRepository } from '@/adapters/driven/database/repositories/PrismaAppRepository';
import { InMemoryEventBus } from '@/adapters/driven/events/InMemoryEventBus';
import type { CreateAppDto, AppDto } from '@/core/application/dto/AppDto';
import { ActionResult, success, failure } from '../types';

export async function createApp(
  dto: CreateAppDto,
  userId: string
): Promise<ActionResult<AppDto>> {
  try {
    const repository = new PrismaAppRepository();
    const eventBus = new InMemoryEventBus();
    const useCase = new CreateAppUseCase(repository, eventBus);
    
    const app = await useCase.execute(dto, userId);
    
    revalidatePath('/apps');
    revalidatePath('/');
    
    return success(app);
  } catch (error) {
    return failure(
      error instanceof Error ? error.message : 'Failed to create app'
    );
  }
}
```

### 2.2 Outras Server Actions de Apps

Seguir o mesmo padrão para:

- `get-app.action.ts` - GetAppUseCase
- `list-apps.action.ts` - ListAppsUseCase
- `update-app.action.ts` - UpdateAppUseCase
- `delete-app.action.ts` - DeleteAppUseCase
- `publish-app.action.ts` - PublishAppUseCase

**Nota**: Queries (get, list) não precisam de `revalidatePath`, apenas mutations.

## Fase 3: Criar Server Actions para Templates

Seguir o mesmo padrão da Fase 2:

- `create-template.action.ts`
- `get-template.action.ts`
- `list-templates.action.ts`
- `publish-template.action.ts`
- `share-template.action.ts`

## Fase 4: Criar Server Actions para Users

Seguir o mesmo padrão:

- `create-user.action.ts`
- `get-user.action.ts`
- `create-workspace.action.ts`
- `grant-permission.action.ts`

## Fase 5: Ajustes e Melhorias

### 5.1 Helper para Autenticação (Futuro)

**Arquivo**: `src/shared/auth/get-user-id.ts`

```typescript
/**
 * Obtém o userId da sessão atual
 * Por enquanto retorna um valor mockado, mas deve ser integrado
 * com NextAuth.js ou similar no futuro
 */
export async function getUserId(): Promise<string> {
  // TODO: Integrar com NextAuth.js ou sistema de autenticação
  // Por enquanto, retornar um userId mockado para desenvolvimento
  return 'mock-user-id';
}
```

### 5.2 Container de Dependências (Opcional)

Para evitar repetição de instanciação, pode-se criar um helper:

**Arquivo**: `src/shared/di/container.ts`

```typescript
import { PrismaAppRepository } from '@/adapters/driven/database/repositories/PrismaAppRepository';
import { PrismaTemplateRepository } from '@/adapters/driven/database/repositories/PrismaTemplateRepository';
import { PrismaUserRepository } from '@/adapters/driven/database/repositories/PrismaUserRepository';
import { InMemoryEventBus } from '@/adapters/driven/events/InMemoryEventBus';

// Singleton instances
let appRepository: PrismaAppRepository | null = null;
let templateRepository: PrismaTemplateRepository | null = null;
let userRepository: PrismaUserRepository | null = null;
let eventBus: InMemoryEventBus | null = null;

export function getAppRepository(): PrismaAppRepository {
  if (!appRepository) {
    appRepository = new PrismaAppRepository();
  }
  return appRepository;
}

export function getTemplateRepository(): PrismaTemplateRepository {
  if (!templateRepository) {
    templateRepository = new PrismaTemplateRepository();
  }
  return templateRepository;
}

export function getUserRepository(): PrismaUserRepository {
  if (!userRepository) {
    userRepository = new PrismaUserRepository();
  }
  return userRepository;
}

export function getEventBus(): InMemoryEventBus {
  if (!eventBus) {
    eventBus = new InMemoryEventBus();
  }
  return eventBus;
}
```

Isso permite simplificar as Server Actions:

```typescript
const repository = getAppRepository();
const eventBus = getEventBus();
const useCase = new CreateAppUseCase(repository, eventBus);
```

## Considerações Importantes

### 1. Serialização

- ✅ DTOs já são serializáveis (strings, numbers, objetos simples)
- ✅ Use Cases retornam DTOs (não entidades de domínio)
- ✅ Server Actions podem retornar DTOs diretamente

### 2. Autenticação

- Por enquanto, `userId` será passado como parâmetro
- No futuro, integrar com NextAuth.js ou similar
- Criar helper `getUserId()` que lê da sessão

### 3. Revalidação

- Apenas mutations precisam de `revalidatePath`
- Queries (get, list) não precisam
- Revalidar paths relevantes após cada mutation

### 4. Tratamento de Erros

- Todos os erros devem ser capturados e retornados como `ActionResult<T>`
- Mensagens de erro devem ser user-friendly
- Logs de erro devem ser mantidos no servidor

### 5. Type Safety

- Server Actions são tipadas end-to-end
- TypeScript garante que DTOs são serializáveis
- `ActionResult<T>` fornece type safety para sucesso/erro

## Fluxo de Dados

### Server Component (Queries)

```
Server Component
  ↓
Server Action (get/list)
  ↓
Use Case
  ↓
Repository
  ↓
Database
  ↓
Return DTO
```

### Client Component (Mutations)

```
Client Component
  ↓
Server Action (via useActionState)
  ↓
Use Case
  ↓
Repository
  ↓
EventBus
  ↓
Database
  ↓
revalidatePath
  ↓
Return ActionResult<DTO>
```

## Ordem de Implementação

1. **Fase 1**: Criar tipos e helpers (`ActionResult<T>`)
2. **Fase 2**: Criar Server Actions para Apps (6 actions)
3. **Fase 3**: Criar Server Actions para Templates (5 actions)
4. **Fase 4**: Criar Server Actions para Users (4 actions)
5. **Fase 5**: Criar helpers (autenticação, DI container)
6. **Fase 6**: Testes e validação

## Arquivos a Criar

### Core Types

- `src/adapters/driving/actions/types.ts`

### App Actions

- `src/adapters/driving/actions/apps/create-app.action.ts`
- `src/adapters/driving/actions/apps/get-app.action.ts`
- `src/adapters/driving/actions/apps/list-apps.action.ts`
- `src/adapters/driving/actions/apps/update-app.action.ts`
- `src/adapters/driving/actions/apps/delete-app.action.ts`
- `src/adapters/driving/actions/apps/publish-app.action.ts`
- `src/adapters/driving/actions/apps/index.ts`

### Template Actions

- `src/adapters/driving/actions/templates/create-template.action.ts`
- `src/adapters/driving/actions/templates/get-template.action.ts`
- `src/adapters/driving/actions/templates/list-templates.action.ts`
- `src/adapters/driving/actions/templates/publish-template.action.ts`
- `src/adapters/driving/actions/templates/share-template.action.ts`
- `src/adapters/driving/actions/templates/index.ts`

### User Actions

- `src/adapters/driving/actions/users/create-user.action.ts`
- `src/adapters/driving/actions/users/get-user.action.ts`
- `src/adapters/driving/actions/users/create-workspace.action.ts`
- `src/adapters/driving/actions/users/grant-permission.action.ts`
- `src/adapters/driving/actions/users/index.ts`

### Helpers (Opcional)

- `src/shared/di/container.ts`
- `src/shared/auth/get-user-id.ts`

## Validações Necessárias

1. ✅ Use Cases retornam DTOs (não entidades)
2. ✅ DTOs são serializáveis
3. ✅ Server Actions seguem padrão `'use server'`
4. ✅ Mutations incluem `revalidatePath`
5. ✅ Erros são tratados com `ActionResult<T>`
6. ✅ Type safety end-to-end

## Próximos Passos Após Implementação

1. Criar Server Components que usam as Server Actions
2. Criar Client Components com formulários usando `useActionState`
3. Integrar autenticação real (NextAuth.js)
4. Adicionar testes para Server Actions
5. Documentar uso das Server Actions