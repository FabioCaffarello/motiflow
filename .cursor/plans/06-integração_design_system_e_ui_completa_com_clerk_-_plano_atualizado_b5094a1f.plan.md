---
name: Integração Design System e UI Completa com Clerk - Plano Atualizado
overview: Replanejamento do plano original incorporando o progresso atual (componentes de navegação implementados) e evoluindo o system design de forma planejada e estruturada. O plano mantém a estrutura original como baseline, mas atualiza com o contexto atual e identifica próximos passos claros.
todos:
  - id: refactor-apps-pages
    content: Refatorar páginas de Apps para usar componentes do design system (PageHeader, Table, etc.)
    status: completed
  - id: refactor-templates-pages
    content: Refatorar páginas de Templates para usar componentes do design system
    status: completed
  - id: improve-lists
    content: Melhorar AppsList e TemplatesList usando componentes do design system
    status: completed
  - id: integrate-feedback
    content: Integrar Toast e Dialog para feedback ao usuário
    status: completed
  - id: analyze-form-needs
    content: Analisar necessidades de componentes de formulário e criar plano filho se necessário
    status: completed
  - id: analyze-appbuilder-needs
    content: Analisar requisitos do AppBuilder visual e criar plano filho detalhado
    status: completed
---

# Integração Design System e UI Completa com Clerk - Plano Atualizado

## Contexto e Progresso Atual

### ✅ O que já foi implementado

**Fase 1: Design System** - ✅ COMPLETA

- Estratégia de dependências ambiente-dependente
- Path aliases e webpack configurados
- Providers (DesignSystemProvider) integrados
- Re-exports e wrappers criados
- Scripts de sincronização implementados

**Fase 2: Clerk** - ✅ COMPLETA

- Clerk instalado e configurado
- ClerkProvider integrado no layout
- Middleware de autenticação criado
- Webhook handler implementado
- Schema Prisma atualizado (clerkId)
- getUserId() usando Clerk
- Páginas de autenticação criadas
- Componentes de autenticação criados

**Fase 3: UI** - ✅ PARCIAL (Evoluída)

- Componentes de navegação implementados:
  - ✅ NavLink (Atom) - 36 testes
  - ✅ Header (Molecule) - 46 testes
  - ✅ Navigation (Molecule) - 38 testes
  - ✅ PageHeader (Molecule) - 13 testes
- Integração no app-builder:
  - ✅ `app/page.tsx` usando Header
  - ✅ `app/(dashboard)/layout.tsx` usando Header + Navigation
- Componentes deprecated removidos
- Total: 141 testes passando

**Fase 4: Processo de Evolução** - ✅ COMPLETA

- Estrutura de documentação criada
- Guidelines estabelecidas

**Fase 5: AppBuilder Visual** - ⏳ PARCIAL

- Estrutura de diretórios criada
- Hooks básicos criados
- Componente AppEditor básico

---

## Plano Atualizado - Próximos Passos

### Fase 3.1: Consolidação e Melhorias UI (ATUAL)

**Status**: Em progresso - Componentes de navegação implementados

**Tarefas**:

1. **Validação e Documentação dos Componentes de Navegação** ✅

   - Testes completos (141 testes)
   - Acessibilidade validada (30 testes)
   - Validação visual (11 testes)
   - Storybook completo

2. **Refatoração de Páginas Existentes** ⏳

   - Atualizar páginas de Apps para usar componentes do design system
   - Atualizar páginas de Templates para usar componentes do design system
   - Usar PageHeader nas páginas que precisam
   - Garantir consistência visual

3. **Melhorias em Componentes Compartilhados** ⏳

   - Revisar DashboardLayout (já usa Header)
   - Criar/atualizar componentes de lista (AppsList, TemplatesList)
   - Melhorar formulários usando componentes do design system

### Fase 3.2: Evolução do System Design - Componentes de Formulário

**Objetivo**: Identificar e implementar componentes de formulário necessários

**Processo**:

1. Analisar formulários existentes (CreateAppForm, etc.)
2. Identificar padrões comuns
3. Criar plano filho para componentes de formulário (se necessário)
4. Implementar seguindo TDD e Atomic Design

**Componentes Potenciais**:

- FormField (molecule) - wrapper para Input + Label + Error
- Form (organism) - gerenciamento de estado de formulário
- Select, Checkbox, Radio (atoms) - se não existirem no design system

### Fase 3.3: Evolução do System Design - Componentes de Lista/Tabela

**Objetivo**: Melhorar visualização de dados

**Processo**:

1. Analisar AppsList, TemplatesList
2. Verificar se Table do design system atende necessidades
3. Criar plano filho se necessário
4. Implementar melhorias

**Componentes Disponíveis no Design System**:

- Table (organism) - já existe
- DataGrid (organism) - já existe
- Verificar se atendem necessidades

### Fase 3.4: Evolução do System Design - Feedback e Notificações

**Objetivo**: Melhorar feedback ao usuário

**Processo**:

1. Identificar necessidades de feedback (sucesso, erro, loading)
2. Verificar Toast, Dialog, AlertDialog do design system
3. Integrar nos componentes existentes
4. Criar plano filho se necessário

**Componentes Disponíveis no Design System**:

- Toast (organism) - já existe
- Dialog (organism) - já existe
- AlertDialog (organism) - já existe

### Fase 5.1: AppBuilder Visual - Estrutura Base

**Status**: Estrutura básica criada, precisa evolução

**Tarefas**:

1. **Análise de Requisitos** ⏳

   - Definir funcionalidades do editor visual
   - Identificar componentes necessários do design system
   - Criar plano filho detalhado

2. **Integração com Design System** ⏳

   - Verificar se AppBuilder do design system existe
   - Se não, planejar implementação
   - Se sim, integrar

3. **Persistência** ⏳

   - Integrar com Server Actions existentes
   - Implementar save/load de configurações
   - Adicionar validação

---

## Estrutura de Evolução do System Design

### Princípios

1. **Questionamento Constante**

   - Sempre questionar: "Preciso criar novo componente ou posso usar existente?"
   - Verificar design system antes de criar novo componente
   - Documentar decisões

2. **Processo Planejado**

   - Identificar necessidade
   - Analisar design system
   - Criar plano filho se necessário
   - Implementar seguindo TDD
   - Documentar

3. **Atomic Design**

   - Atoms → Molecules → Organisms → Templates
   - Reutilização máxima
   - Composição sobre criação

4. **TDD Rigoroso**

   - Testes primeiro
   - Cobertura completa
   - Acessibilidade incluída

### Template para Evolução

Quando identificar necessidade de novo componente:

1. **Análise**

   - O que preciso?
   - Existe no design system?
   - Posso compor com componentes existentes?

2. **Planejamento**

   - Criar plano filho detalhado
   - Definir épicos, stories, tasks
   - Seguir backlog estruturado

3. **Implementação**

   - TDD
   - Atomic Design
   - Acessibilidade
   - Documentação

4. **Integração**

   - Integrar no app-builder
   - Remover componentes deprecated
   - Atualizar documentação

---

## Ordem de Implementação Recomendada

### Sprint Atual: Consolidação UI (Fase 3.1)

1. ✅ Componentes de navegação implementados
2. ⏳ Refatorar páginas de Apps
3. ⏳ Refatorar páginas de Templates
4. ⏳ Melhorar componentes de lista
5. ⏳ Integrar feedback (Toast, Dialog)

### Próximo Sprint: Evolução System Design (Fase 3.2-3.4)

1. Analisar necessidades de formulário
2. Criar plano filho para componentes de formulário (se necessário)
3. Implementar componentes de formulário
4. Analisar necessidades de feedback
5. Integrar Toast/Dialog onde necessário

### Sprint Futuro: AppBuilder Visual (Fase 5.1)

1. Análise de requisitos detalhada
2. Criar plano filho para AppBuilder
3. Implementar estrutura base
4. Integrar com Server Actions
5. Implementar funcionalidades core

---

## Arquivos e Estrutura

### Arquivos Existentes (Mantidos)

```
admin/app-builder/
├── app/
│   ├── (auth)/ ✅
│   ├── (dashboard)/ ✅
│   └── api/webhooks/clerk/ ✅
├── src/
│   ├── infrastructure/auth/clerk-config.ts ✅
│   ├── shared/
│   │   ├── components/
│   │   │   ├── design-system/ ✅
│   │   │   ├── auth/ ✅
│   │   │   └── layout/ (parcial - precisa revisão)
│   │   └── providers/DesignSystemProvider.tsx ✅
│   └── core/ ✅
├── docs/design-system-evolution/ ✅
└── middleware.ts ✅
```

### Arquivos a Criar/Modificar

**Fase 3.1**:

- `app/(dashboard)/apps/page.tsx` - Refatorar para usar design system
- `app/(dashboard)/templates/page.tsx` - Refatorar para usar design system
- `src/features/apps/components/AppsList.tsx` - Melhorar com design system
- `src/features/templates/components/TemplatesList.tsx` - Melhorar com design system

**Fase 3.2-3.4**:

- Planos filhos conforme necessário
- Componentes do design system (se necessário)

**Fase 5.1**:

- Plano filho detalhado para AppBuilder
- Estrutura de implementação

---

## Métricas e Validação

### Critérios de Sucesso

**Fase 3.1**:

- ✅ Componentes de navegação: 141 testes passando
- ⏳ Páginas refatoradas usando design system
- ⏳ Consistência visual em todas as páginas
- ⏳ Acessibilidade validada

**Fase 3.2-3.4**:

- Componentes de formulário implementados (se necessário)
- Feedback integrado (Toast, Dialog)
- Testes passando
- Documentação completa

**Fase 5.1**:

- Plano filho criado
- Estrutura base implementada
- Integração com Server Actions
- Funcionalidades core funcionando

---

## Notas Importantes

1. **Design System como Fonte Única**: Sempre verificar design system antes de criar novo componente
2. **Evolução Planejada**: Todas as melhorias via planos filhos rigorosos
3. **TDD**: Sempre seguir TDD para novos componentes
4. **Atomic Design**: Manter hierarquia Atoms → Molecules → Organisms
5. **Acessibilidade**: WCAG 2.1 AA compliance obrigatória
6. **Documentação**: Documentar todas as decisões e melhorias

---

## Próximos Passos Imediatos

1. **Refatorar páginas de Apps** para usar componentes do design system
2. **Refatorar páginas de Templates** para usar componentes do design system
3. **Melhorar componentes de lista** (AppsList, TemplatesList)
4. **Integrar feedback** (Toast para ações, Dialog para confirmações)
5. **Analisar necessidades** para próximas fases (formulário, AppBuilder)

---

## Referências

- Plano Original: `04-integração_design_system_e_ui_completa_com_clerk_c065f681.plan.md`
- Resumo Implementação: `admin/app-builder/.temp/agile/backlog/RESUMO_FINAL_COMPLETO_V2.md`
- Design System: `react-design-system/`
- Documentação Evolução: `admin/app-builder/docs/design-system-evolution/`