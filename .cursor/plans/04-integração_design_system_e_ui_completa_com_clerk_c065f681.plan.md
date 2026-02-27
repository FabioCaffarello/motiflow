# Integração Design System e UI Completa com Clerk - Plano Detalhado

## Contexto e Herança do Plano Pai

Este plano é filho de `transformação_appbuilder_em_next.js_app_bc0254d0.plan.md` e implementa:

- **Fase 4.1 (Integração react-design-system)** - Setup completo com estratégia de dependências
- **Fase 4.4 (Páginas e Componentes)** - Melhorias na UI existente
- **Autenticação** - Clerk (solução moderna e gerenciada)
- **Processo de Evolução do Design System** - Estrutura para melhorias planejadas
- **Preparação para Fase 10** - Base para migração do AppBuilder visual

**Ponto de partida**:

- Domain Layer ✅ implementado
- Application Layer ✅ implementada
- Repositories ✅ implementados
- Server Actions ✅ básicos implementados
- Páginas básicas ✅ criadas (apps, templates)
- Componentes básicos ✅ criados

**Regra fundamental**:

- Usar exclusivamente `react-design-system` como design system
- Em desenvolvimento: usar diretório local (`file:../../react-design-system`)
- Em staging/produção: usar versões estáveis do npm
- Evolução do design system deve ser planejada com planos filhos rigorosos
- **Autenticação**: Usar Clerk (não NextAuth.js)

## Índice de Implementação

### Fase 1: Estratégia de Dependências e Integração react-design-system

1.1. Configuração de dependências com estratégia ambiente-dependente

1.2. Setup de path aliases e webpack para desenvolvimento local

1.3. Setup de providers (ThemeProvider, AppProvider)

1.4. Wrappers para componentes do design system

1.5. Configuração de temas e tokens

1.6. Scripts para sincronização entre ambientes

### Fase 2: Autenticação com Clerk

2.1. Setup Clerk

2.2. Configuração de variáveis de ambiente

2.3. Integração com User domain (webhooks)

2.4. Middleware de autenticação

2.5. Atualização de Server Actions para usar Clerk

2.6. Componentes de autenticação (sign-in, sign-up)

### Fase 3: Melhorias na UI Existente

3.1. Refatorar páginas para usar react-design-system

3.2. Melhorar componentes de Apps

3.3. Melhorar componentes de Templates

3.4. Criar componentes compartilhados (Layout, Navigation, etc.)

### Fase 4: Processo de Evolução do Design System

4.1. Estrutura para identificação de melhorias

4.2. Processo de questionamento e análise

4.3. Criação de planos filhos para melhorias

4.4. Guidelines e padrões para evolução

### Fase 5: Preparação para AppBuilder Visual

5.1. Estrutura de diretórios para AppEditor

5.2. Hooks e utilities para AppBuilder

5.3. Integração com Server Actions para persistência

5.4. Componentes base para editor

---

## Fase 1: Estratégia de Dependências e Integração react-design-system

*(Mantém a mesma estrutura do plano anterior - Fase 1 completa)*

### 1.1 a 1.6 - Mesma estrutura do plano anterior

---

## Fase 2: Autenticação com Clerk

### 2.1 Setup Clerk

**Arquivo**: `package.json`

**Dependências a adicionar**:

```json
{
  "dependencies": {
    "@clerk/nextjs": "^5.0.0"
  }
}
```

**Comando de instalação**:

```bash
npm install @clerk/nextjs
```

**Arquivo**: `.env.local.example`

**Variáveis de ambiente necessárias**:

```env
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...

# Clerk URLs (opcional, para customização)
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/auth/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/auth/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/apps
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/apps
```

### 2.2 Configuração de Clerk

**Arquivo**: `src/infrastructure/auth/clerk-config.ts`

**Responsabilidade**: Configuração centralizada do Clerk.

**Estrutura**:

```typescript
/**
 * Clerk Configuration
 * 
 * Configuração centralizada do Clerk para o app-builder.
 * 
 * Clerk gerencia autenticação, sessões, e usuários.
 * Integramos com nosso domain User através de webhooks.
 */
export const clerkConfig = {
  // URLs customizadas (opcional)
  signInUrl: process.env.NEXT_PUBLIC_CLERK_SIGN_IN_URL || '/auth/sign-in',
  signUpUrl: process.env.NEXT_PUBLIC_CLERK_SIGN_UP_URL || '/auth/sign-up',
  afterSignInUrl: process.env.NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL || '/apps',
  afterSignUpUrl: process.env.NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL || '/apps',
  
  // Configurações adicionais
  appearance: {
    // Customizar aparência dos componentes Clerk
    // Pode ser customizado para usar design system
  },
};
```

**Arquivo**: `app/layout.tsx`

**Mudanças necessárias**: Envolver com ClerkProvider.

```typescript
import { ClerkProvider } from '@clerk/nextjs';
import { DesignSystemProvider } from '@/shared/providers/DesignSystemProvider';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <html lang="pt-BR">
        <body>
          <DesignSystemProvider>
            {children}
          </DesignSystemProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
```

### 2.3 Integração com User Domain (Webhooks)

**Arquivo**: `app/api/webhooks/clerk/route.ts`

**Responsabilidade**: Webhook para sincronizar usuários do Clerk com nosso domain.

**Estrutura**:

```typescript
import { Webhook } from 'svix';
import { headers } from 'next/headers';
import { WebhookEvent } from '@clerk/nextjs/server';
import { CreateUserUseCase } from '@/core/application/use-cases/users/CreateUserUseCase';
import { UpdateAppUseCase } from '@/core/application/use-cases/apps/UpdateAppUseCase';
import { PrismaUserRepository } from '@/adapters/driven/database/repositories/PrismaUserRepository';
import { InMemoryEventBus } from '@/adapters/driven/events/InMemoryEventBus';

export async function POST(req: Request) {
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;

  if (!WEBHOOK_SECRET) {
    throw new Error('Please add CLERK_WEBHOOK_SECRET to .env.local');
  }

  // Obter headers
  const headerPayload = await headers();
  const svix_id = headerPayload.get('svix-id');
  const svix_timestamp = headerPayload.get('svix-timestamp');
  const svix_signature = headerPayload.get('svix-signature');

  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response('Error occurred -- no svix headers', {
      status: 400,
    });
  }

  // Obter body
  const payload = await req.json();
  const body = JSON.stringify(payload);

  // Criar novo Svix instance com secret
  const wh = new Webhook(WEBHOOK_SECRET);

  let evt: WebhookEvent;

  // Verificar payload
  try {
    evt = wh.verify(body, {
      'svix-id': svix_id,
      'svix-timestamp': svix_timestamp,
      'svix-signature': svix_signature,
    }) as WebhookEvent;
  } catch (err) {
    console.error('Error verifying webhook:', err);
    return new Response('Error occurred', {
      status: 400,
    });
  }

  // Processar eventos
  const eventType = evt.type;
  
  const repository = new PrismaUserRepository();
  const eventBus = new InMemoryEventBus();

  if (eventType === 'user.created') {
    const { id, email_addresses, first_name, last_name, image_url } = evt.data;
    
    const useCase = new CreateUserUseCase(repository, eventBus);
    
    await useCase.execute({
      email: email_addresses[0].email_address,
      name: first_name && last_name ? `${first_name} ${last_name}` : first_name || last_name || null,
      image: image_url || null,
    });
    
    // Nota: O ID do Clerk será armazenado em um campo separado ou mapeado
    // Pode ser necessário adicionar clerkId ao schema User
  }

  if (eventType === 'user.updated') {
    // Atualizar usuário existente
    // Implementar UpdateUserUseCase se necessário
  }

  if (eventType === 'user.deleted') {
    // Deletar usuário
    // Implementar DeleteUserUseCase se necessário
  }

  return new Response('', { status: 200 });
}
```

**Arquivo**: `prisma/schema.prisma`

**Mudanças necessárias**: Adicionar campo `clerkId` ao User.

```prisma
model User {
  id        String   @id @default(cuid())
  clerkId   String?  @unique  // ID do Clerk (opcional para migração)
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
```

### 2.4 Middleware de Autenticação

**Arquivo**: `middleware.ts`

**Estrutura**:

```typescript
import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

/**
 * Clerk Middleware
 * 
 * Protege rotas que requerem autenticação.
 * Rotas públicas não precisam de autenticação.
 */
const isPublicRoute = createRouteMatcher([
  '/',
  '/auth/sign-in(.*)',
  '/auth/sign-up(.*)',
  '/api/webhooks(.*)',
]);

export default clerkMiddleware(async (auth, req) => {
  // Permitir rotas públicas sem autenticação
  if (!isPublicRoute(req)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    // Skip Next.js internals e todos os arquivos estáticos
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};
```

### 2.5 Atualização de Server Actions para usar Clerk

**Arquivo**: `src/shared/auth/get-user-id.ts`

**Mudanças necessárias**: Usar Clerk ao invés de mock.

```typescript
import { auth, currentUser } from '@clerk/nextjs/server';
import { PrismaUserRepository } from '@/adapters/driven/database/repositories/PrismaUserRepository';
import { GetUserUseCase } from '@/core/application/use-cases/users/GetUserUseCase';

/**
 * Obtém o userId da sessão atual usando Clerk
 * 
 * @returns Promise<string> - O ID do usuário atual (do nosso domain, não do Clerk)
 * @throws Error se usuário não estiver autenticado
 */
export async function getUserId(): Promise<string> {
  // Verificar autenticação com Clerk
  const { userId: clerkUserId } = await auth();
  
  if (!clerkUserId) {
    throw new Error('Unauthorized: User not authenticated');
  }

  // Buscar usuário no nosso domain usando clerkId
  const repository = new PrismaUserRepository();
  const useCase = new GetUserUseCase(repository);
  
  // Buscar por clerkId (ou email se necessário)
  const user = await useCase.executeByClerkId(clerkUserId);
  
  if (!user) {
    // Se usuário não existe no nosso domain, pode ser que o webhook ainda não processou
    // Neste caso, podemos criar sincronamente ou lançar erro
    throw new Error('User not found in domain. Webhook may not have processed yet.');
  }
  
  return user.id.toString();
}

/**
 * Obtém o usuário completo do Clerk (opcional, para dados adicionais)
 */
export async function getClerkUser() {
  return await currentUser();
}
```

**Arquivo**: `src/core/application/use-cases/users/GetUserUseCase.ts`

**Mudanças necessárias**: Adicionar método `executeByClerkId`.

```typescript
// Adicionar ao GetUserUseCase
async executeByClerkId(clerkId: string): Promise<UserDto | null> {
  // Implementar busca por clerkId no repository
  // Requer adicionar método findByClerkId ao IUserRepository e PrismaUserRepository
}
```

### 2.6 Componentes de Autenticação

**Arquivo**: `app/(auth)/sign-in/[[...sign-in]]/page.tsx`

**Estrutura**: Usar componente SignIn do Clerk.

```typescript
import { SignIn } from '@clerk/nextjs';

/**
 * Sign In Page
 * 
 * Página de login usando componentes do Clerk.
 * Clerk gerencia toda a UI de autenticação.
 */
export default function SignInPage() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <SignIn 
        appearance={{
          // Customizar para usar design system se necessário
          elements: {
            // Pode customizar elementos do Clerk
          },
        }}
      />
    </div>
  );
}
```

**Arquivo**: `app/(auth)/sign-up/[[...sign-up]]/page.tsx`

**Estrutura**: Similar ao sign-in.

```typescript
import { SignUp } from '@clerk/nextjs';

export default function SignUpPage() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <SignUp 
        appearance={{
          elements: {
            // Customizar se necessário
          },
        }}
      />
    </div>
  );
}
```

**Arquivo**: `src/shared/components/auth/UserButton.tsx`

**Responsabilidade**: Botão de usuário usando Clerk.

```typescript
'use client';

import { UserButton as ClerkUserButton } from '@clerk/nextjs';

/**
 * UserButton
 * 
 * Wrapper para o UserButton do Clerk.
 * Pode ser customizado para usar design system se necessário.
 */
export function UserButton() {
  return (
    <ClerkUserButton
      appearance={{
        elements: {
          // Customizar se necessário
        },
      }}
    />
  );
}
```

---

## Fase 3: Melhorias na UI Existente

*(Mantém a mesma estrutura do plano anterior)*

### 3.1 a 3.4 - Mesma estrutura do plano anterior

---

## Fase 4: Processo de Evolução do Design System

*(Mantém a mesma estrutura do plano anterior)*

### 4.1 a 4.4 - Mesma estrutura do plano anterior

---

## Fase 5: Preparação para AppBuilder Visual

*(Mantém a mesma estrutura do plano anterior)*

### 5.1 a 5.4 - Mesma estrutura do plano anterior

---

## Ordem de Implementação Recomendada

### Sprint 1: Estratégia de Dependências e Design System (Fase 1)

1. Configurar dependências ambiente-dependente
2. Setup path aliases e webpack
3. Setup providers
4. Criar wrappers e configurações
5. Criar scripts de sincronização
6. Documentar processo de evolução

### Sprint 2: Autenticação com Clerk (Fase 2)

1. Instalar Clerk
2. Configurar variáveis de ambiente
3. Setup ClerkProvider no layout
4. Criar middleware de autenticação
5. Criar webhook para sincronização
6. Atualizar schema Prisma (adicionar clerkId)
7. Atualizar getUserId() para usar Clerk
8. Criar páginas de autenticação
9. Criar componentes de autenticação (UserButton, etc.)

### Sprint 3: Melhorias UI (Fase 3)

1. Refatorar páginas de Apps
2. Melhorar componentes de Apps
3. Melhorar componentes de Templates
4. Criar componentes compartilhados

### Sprint 4: Processo de Evolução (Fase 4)

1. Criar estrutura de documentação
2. Documentar melhorias identificadas
3. Criar template de planos filhos
4. Estabelecer guidelines

### Sprint 5: Preparação AppBuilder (Fase 5)

1. Criar estrutura de diretórios
2. Criar hooks e utilities
3. Integrar com Server Actions
4. Criar página de edição básica

---

## Considerações Técnicas - Clerk

### Vantagens do Clerk

- **Gerenciado**: Não precisa gerenciar servidores de autenticação
- **Seguro**: Segurança gerenciada pela Clerk
- **Completo**: Inclui UI, gerenciamento de sessões, MFA, etc.
- **Integração Fácil**: Integração simples com Next.js
- **Webhooks**: Sincronização automática com nosso domain

### Integração com Domain

- **Webhooks**: Sincronizar usuários do Clerk com nosso domain User
- **clerkId**: Armazenar ID do Clerk no User para mapeamento
- **Separação de Responsabilidades**: Clerk gerencia autenticação, nosso domain gerencia lógica de negócio

### Customização

- **Appearance**: Clerk permite customizar aparência dos componentes
- **Design System**: Pode customizar para usar design system quando necessário
- **Componentes**: Usar componentes do Clerk ou criar wrappers

---

## Estrutura de Arquivos Final

```
admin/app-builder/
├── app/
│   ├── (auth)/
│   │   ├── sign-in/
│   │   │   └── [[...sign-in]]/
│   │   │       └── page.tsx
│   │   └── sign-up/
│   │       └── [[...sign-up]]/
│   │           └── page.tsx
│   ├── (dashboard)/
│   └── api/
│       └── webhooks/
│           └── clerk/
│               └── route.ts
├── docs/
│   └── design-system-evolution/
├── src/
│   ├── infrastructure/
│   │   └── auth/
│   │       └── clerk-config.ts
│   └── shared/
│       ├── auth/
│       │   └── get-user-id.ts
│       └── components/
│           └── auth/
│               └── UserButton.tsx
├── middleware.ts
└── .env.local.example
```

---

## Regras e Princípios

1. **Design System Exclusivo**: Usar apenas react-design-system
2. **Estratégia de Dependências**: Local em dev, npm em outros ambientes
3. **Autenticação**: Clerk (não NextAuth.js)
4. **Evolução Planejada**: Todas as melhorias via planos filhos rigorosos
5. **Questionamento Constante**: Sempre questionar necessidade de melhorias
6. **Documentação**: Rastrear e documentar todas as melhorias
7. **Type Safety**: Manter type safety em todas as integrações

---

## Próximos Passos Após Este Plano

1. Migração completa do AppBuilder visual
2. Funcionalidades avançadas
3. Colaboração em tempo real
4. DevOps completo
5. Documentação completa

---

## Notas Importantes - Clerk

- **Setup Inicial**: Criar conta no Clerk e obter chaves de API
- **Webhooks**: Configurar webhook no dashboard do Clerk apontando para `/api/webhooks/clerk`
- **Sincronização**: Webhook sincroniza usuários automaticamente com nosso domain
- **Customização**: Clerk permite customizar UI, mas pode usar design system quando necessário
- **Migração**: Usuários existentes podem ter clerkId null inicialmente