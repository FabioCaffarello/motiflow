---
name: Evolução App Builder - Playground para Produção
overview: "Evoluir o admin/app-builder trazendo funcionalidades do playground do Storybook, começando pelo fluxo de criação de apps (`/apps/new`) e evoluindo incrementalmente: sidebar → preview → design patterns, mantendo Clean Architecture, DDD e design patterns."
todos:
  - id: phase1-state
    content: "Fase 1.1: Evoluir useAppBuilderStateManager com setupMode, globalConfig, activeAccordionId"
    status: pending
  - id: phase1-navigation
    content: "Fase 1.2: Criar useAppBuilderNavigation para gerenciar navegação contextual"
    status: pending
  - id: phase1-global-slot
    content: "Fase 1.3: Criar GlobalConfigSlot adaptado do playground para produção"
    status: pending
  - id: phase1-templates-slot
    content: "Fase 1.4: Criar TemplatesSlot com integração ao TemplateRepository"
    status: pending
  - id: phase1-start-slot
    content: "Fase 1.5: Criar StartComponentsSlot adaptado do playground"
    status: completed
  - id: phase1-sidebar-integration
    content: "Fase 1.6: Atualizar SideNavbarLayout para suportar setupMode e slots contextuais"
    status: pending
  - id: phase2-new-page
    content: "Fase 2.1: Evoluir /apps/new/page.tsx com wizard/steps e setup mode"
    status: completed
  - id: phase2-global-vo
    content: "Fase 2.2: Criar GlobalTokensConfig value object no domain layer"
    status: completed
  - id: phase2-start-service
    content: "Fase 2.3: Criar StartComponentsService no domain layer"
    status: completed
  - id: phase2-create-action
    content: "Fase 2.4: Criar create-app-with-global-config.action.ts Server Action"
    status: completed
  - id: phase3-preview
    content: "Fase 3.1: Evoluir AppPreview com preview em tempo real"
    status: completed
  - id: phase3-content-layout
    content: "Fase 3.2: Evoluir ContentLayout com toggle preview/design"
    status: completed
  - id: phase3-sync
    content: "Fase 3.3: Criar usePreviewSync hook para sincronização em tempo real"
    status: pending
---

# Evolução do App Builder: Do Playground para Produção

## Contexto e Objetivo

O playground do Storybook (`AppBuilderPlayground`) possui funcionalidades avançadas que precisam ser trazidas para o `admin/app-builder` em produção. O foco principal é o fluxo de criação de apps (`/apps/new`), evoluindo incrementalmente mantendo Clean Architecture, DDD e design patterns.

## Análise do Playground (Referência)

### Funcionalidades Principais do Playground

1. **Fluxo de Criação de Apps:**

   - Setup mode com Global Config (Typography, Colors, Spacing)
   - Start Components automáticos (SideNavbar + Container)
   - Templates pré-configurados (Dashboard, Form, Landing)
   - Preview em tempo real

2. **Sidebar com Slots Contextuais:**

   - `AppsSlot`: Lista de apps salvos
   - `TemplatesSlot`: Galeria de templates
   - `FeaturesSlot`: Gerenciamento de features
   - `GlobalConfigSidebar`: Configuração de tokens globais
   - `StartComponentsSlot`: Configuração de componentes iniciais
   - `SettingsSlot`: Configurações gerais

3. **State Management:**

   - `usePlaygroundStateManager`: Gerenciamento centralizado de estado
   - `useAppBuilderNavigation`: Navegação entre seções
   - Cache de Global Config (localStorage)

4. **Design Patterns:**

   - Registry Pattern (Start Components, Slots, Features)
   - Factory Pattern (ContentLayout, SidebarSlotFactory)
   - State Manager Pattern (centralized state)
   - Slot-based Architecture (SidebarSlotProvider)

## Estado Atual do admin/app-builder

### O que já existe:

- ✅ Clean Architecture com DDD (core/domain, core/application, adapters)
- ✅ SideNavbarLayout com slots básicos (home, apps, new-app)
- ✅ AppEditor integrado com AppBuilder do design system
- ✅ Server Actions para CRUD de apps
- ✅ Prisma com persistência real
- ✅ CreateAppForm básico (apenas nome, slug, description)

### O que falta:

- ❌ Fluxo de criação com Global Config
- ❌ Templates visuais
- ❌ Start Components automáticos
- ❌ Preview em tempo real durante criação
- ❌ Sidebar slots contextuais avançados
- ❌ State management centralizado para criação

## Plano de Evolução Incremental

### Fase 1: Evolução da Sidebar e Navegação

**Objetivo:** Implementar sidebar com slots contextuais similar ao playground, adaptada para produção.

#### 1.1 State Management Centralizado

- **Arquivo:** `src/shared/hooks/useAppBuilderStateManager.ts` (já existe, evoluir)
- **Ações:**
  - Adicionar `setupMode` para fluxo de criação
  - Adicionar `globalConfig` state
  - Adicionar `activeAccordionId` para Global Config
  - Adicionar `activeContentId` para preview
  - Implementar cache de Global Config (sessionStorage)

#### 1.2 Navegação Contextual

- **Arquivo:** `src/shared/hooks/useAppBuilderNavigation.ts` (criar)
- **Ações:**
  - Implementar navegação entre seções (apps, templates, global-config, start-components)
  - Gerenciar estado de sidebar slot ativo
  - Suportar deep linking para seções

#### 1.3 Slots da Sidebar

- **Arquivos:**
  - `src/shared/components/sidebar/slots/new-app/GlobalConfigSlot.tsx` (criar)
  - `src/shared/components/sidebar/slots/new-app/TemplatesSlot.tsx` (criar)
  - `src/shared/components/sidebar/slots/new-app/StartComponentsSlot.tsx` (criar)
- **Ações:**
  - Adaptar componentes do playground para produção
  - Integrar com Server Actions para templates
  - Conectar com domain layer (AppConfig, GlobalTokensConfig)

#### 1.4 Atualizar SideNavbarLayout

- **Arquivo:** `src/shared/components/layout/SideNavbarLayout.tsx`
- **Ações:**
  - Adicionar suporte a `setupMode`
  - Implementar navegação contextual baseada em rota
  - Integrar novos slots quando em `/apps/new`

### Fase 2: Fluxo de Criação de Apps Melhorado

**Objetivo:** Transformar `/apps/new` em um fluxo guiado similar ao playground.

#### 2.1 Página de Criação Evoluída

- **Arquivo:** `app/(dashboard)/apps/new/page.tsx`
- **Ações:**
  - Implementar modo setup inicial
  - Adicionar wizard/steps (Global Config → Templates → Start Components → Review)
  - Integrar com state manager
  - Adicionar preview em tempo real

#### 2.2 Global Config Integration

- **Arquivos:**
  - `src/core/domain/value-objects/GlobalTokensConfig.ts` (criar ou adaptar)
  - `src/core/application/mappers/GlobalTokensMapper.ts` (criar)
- **Ações:**
  - Criar value object para Global Tokens
  - Mapear entre domain e design system
  - Validar configuração de tokens

#### 2.3 Templates Integration

- **Arquivos:**
  - `src/features/templates/application/hooks/useTemplates.ts` (criar)
  - `src/features/templates/presentation/components/TemplateCard.tsx` (criar)
- **Ações:**
  - Buscar templates do repositório
  - Exibir preview visual de templates
  - Permitir carregar template como base

#### 2.4 Start Components Integration

- **Arquivos:**
  - `src/features/apps/application/services/StartComponentsService.ts` (criar)
  - Adaptar lógica do playground para domain layer
- **Ações:**
  - Criar serviço de domínio para Start Components
  - Integrar com AppConfig
  - Popular app com SideNavbar + Container automaticamente

### Fase 3: Preview em Tempo Real

**Objetivo:** Implementar preview interativo durante criação/edição.

#### 3.1 Preview Component

- **Arquivo:** `src/shared/components/preview/AppPreview.tsx` (evoluir)
- **Ações:**
  - Integrar com AppBuilder do design system
  - Suportar preview de Global Config
  - Suportar preview de Start Components
  - Adicionar modo "Live Preview" vs "Structure View"

#### 3.2 ContentLayout Evolution

- **Arquivo:** `src/shared/components/layout/ContentLayout.tsx` (evoluir)
- **Ações:**
  - Adicionar suporte a preview side-by-side
  - Implementar toggle preview/design
  - Integrar com state manager

#### 3.3 Preview Sync

- **Arquivo:** `src/shared/hooks/usePreviewSync.ts` (criar)
- **Ações:**
  - Sincronizar mudanças em tempo real
  - Debounce para performance
  - Error boundaries para preview

### Fase 4: Design Patterns e Arquitetura

**Objetivo:** Aplicar e melhorar design patterns do playground na produção.

#### 4.1 Registry Pattern

- **Arquivos:**
  - `src/shared/patterns/registry/StartComponentsRegistry.ts` (criar)
  - `src/shared/patterns/registry/TemplatesRegistry.ts` (criar)
- **Ações:**
  - Adaptar registries do playground
  - Integrar com domain layer
  - Adicionar validação e type safety

#### 4.2 Factory Pattern

- **Arquivo:** `src/shared/patterns/factory/AppConfigFactory.ts` (criar)
- **Ações:**
  - Factory para criar AppConfig com diferentes configurações
  - Builder pattern para construção incremental
  - Validação durante construção

#### 4.3 State Manager Pattern

- **Arquivo:** `src/shared/patterns/state/AppBuilderStateManager.ts` (evoluir)
- **Ações:**
  - Centralizar toda lógica de estado
  - Actions type-safe
  - Middleware para side effects (cache, sync)

#### 4.4 Adapter Pattern para Design System

- **Arquivo:** `src/shared/adapters/AppBuilderAdapter.ts` (criar)
- **Ações:**
  - Adaptar AppConfig do domain para design system
  - Adaptar GlobalTokensConfig
  - Tratar diferenças entre playground e produção

## Estrutura de Arquivos Proposta

```
admin/app-builder/
├── src/
│   ├── core/
│   │   ├── domain/
│   │   │   └── value-objects/
│   │   │       └── GlobalTokensConfig.ts (criar)
│   │   └── application/
│   │       ├── mappers/
│   │       │   └── GlobalTokensMapper.ts (criar)
│   │       └── services/
│   │           └── StartComponentsService.ts (criar)
│   ├── features/
│   │   ├── apps/
│   │   │   └── application/
│   │   │       └── services/
│   │   │           └── StartComponentsService.ts (criar)
│   │   └── templates/
│   │       └── presentation/
│   │           └── components/
│   │               └── TemplateCard.tsx (criar)
│   ├── shared/
│   │   ├── hooks/
│   │   │   ├── useAppBuilderStateManager.ts (evoluir)
│   │   │   ├── useAppBuilderNavigation.ts (criar)
│   │   │   └── usePreviewSync.ts (criar)
│   │   ├── components/
│   │   │   ├── sidebar/
│   │   │   │   └── slots/
│   │   │   │       └── new-app/
│   │   │   │           ├── GlobalConfigSlot.tsx (criar)
│   │   │   │           ├── TemplatesSlot.tsx (criar)
│   │   │   │           └── StartComponentsSlot.tsx (criar)
│   │   │   └── preview/
│   │   │       └── AppPreview.tsx (evoluir)
│   │   └── patterns/
│   │       ├── registry/
│   │       │   ├── StartComponentsRegistry.ts (criar)
│   │       │   └── TemplatesRegistry.ts (criar)
│   │       ├── factory/
│   │       │   └── AppConfigFactory.ts (criar)
│   │       └── adapters/
│   │           └── AppBuilderAdapter.ts (criar)
│   └── adapters/
│       └── driving/
│           └── actions/
│               └── apps/
│                   └── create-app-with-global-config.action.ts (criar)
└── app/
    └── (dashboard)/
        └── apps/
            └── new/
                └── page.tsx (evoluir)
```

## Fluxo de Criação Proposto

1. **Usuário clica "New App"** → Navega para `/apps/new`
2. **Setup Mode Ativado** → Sidebar mostra Global Config slot
3. **Configurar Global Tokens** → Typography, Colors, Spacing
4. **Escolher Template (opcional)** → Templates slot com preview
5. **Configurar Start Components** → SideNavbar + Container
6. **Preview em Tempo Real** → Ver app sendo construído
7. **Review e Criar** → Finalizar criação com Server Action
8. **Redirecionar para Editor** → `/apps/[id]/edit` com AppBuilder completo

## Princípios de Implementação

1. **Clean Architecture:** Manter separação de camadas (domain → application → adapters)
2. **DDD:** Value Objects para GlobalTokensConfig, Services para lógica de domínio
3. **Design Patterns:** Registry, Factory, Adapter, State Manager
4. **Type Safety:** TypeScript strict, validação em runtime quando necessário
5. **Incremental:** Cada fase é independente e pode ser testada isoladamente
6. **Reusabilidade:** Adaptar código do playground, não copiar

## Metodologia de Trabalho

### Para Cada Fase:

1. **Estudar:** Analisar implementação do playground
2. **Documentar:** Anotar patterns, decisões, trade-offs
3. **Adaptar:** Adaptar para Clean Architecture e DDD
4. **Implementar:** Criar código seguindo padrões do admin/app-builder
5. **Testar:** Testes unitários e de integração
6. **Refatorar:** Melhorar baseado em feedback

### Ordem de Execução:

1. **Fase 1.1:** Estudar e evoluir state management
2. **Fase 1.2:** Estudar e criar navegação contextual
3. **Fase 1.3:** Estudar e evoluir slots (começar por Global Config)
4. **Fase 1.4:** Integrar tudo na SideNavbarLayout
5. **Fase 1.5:** Testar fluxo completo de criação
6. **Fase 2:** Evoluir página `/apps/new` com novo fluxo
7. **Fase 3:** Implementar preview em tempo real
8. **Fase 4:** Aplicar e melhorar design patterns

## Notas Importantes

- **Playground é referência, não código a copiar**
- **Foco em evoluir admin/app-builder, não o playground**
- **Manter Clean Architecture e DDD rigorosamente**
- **Cada funcionalidade deve passar pelo domain layer**
- **Testes são obrigatórios para cada fase**