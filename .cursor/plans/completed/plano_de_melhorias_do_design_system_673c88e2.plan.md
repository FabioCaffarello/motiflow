---
name: Plano de Melhorias do Design System
overview: Plano abrangente para evoluir o Storybook com catálogo de eventos e estados, e auditar/melhorar os organisms CommandPalette, Toast, Timeline e Stepper com foco em stories, eventos, estados e acessibilidade.
todos:
  - id: add-storybook-addons
    content: Adicionar @storybook/addon-interactions e @storybook/test ao package.json e configurar no main.ts
    status: in_progress
  - id: create-event-catalog
    content: Criar EventCatalog.mdx documentando todos os eventos dos componentes
    status: pending
  - id: create-state-catalog
    content: Criar StateCatalog.mdx documentando todos os estados dos componentes
    status: pending
  - id: improve-preview-config
    content: Melhorar preview.ts com configurações de interações e eventos
    status: pending
  - id: audit-commandpalette
    content: "Auditar e melhorar CommandPalette: stories, eventos, estados, argTypes"
    status: pending
  - id: audit-toast
    content: "Auditar e melhorar Toast: stories, eventos, estados, argTypes"
    status: pending
  - id: audit-timeline
    content: "Auditar e melhorar Timeline: stories, eventos, estados, argTypes"
    status: pending
  - id: audit-stepper
    content: "Auditar e melhorar Stepper: stories, eventos, estados, argTypes"
    status: pending
  - id: create-organisms-checklist
    content: Criar ORGANISMS_VALIDATION_CHECKLIST.md
    status: pending
  - id: create-story-template
    content: Criar template de story com eventos e estados documentados
    status: pending
---

# Plano de Melhorias do Design System

## Objetivo

Evoluir o Storybook com catálogo de eventos e estados, e auditar/melhorar os organisms CommandPalette, Toast, Timeline e Stepper com foco em stories, eventos, estados e acessibilidade.

## Fase 1: Melhorias no Storybook

### 1.1 Adicionar Addons do Storybook

**Arquivo**: [`.storybook/main.ts`](react-design-system/.storybook/main.ts)

- Adicionar `@storybook/addon-interactions` para testar interações e documentar eventos
- Adicionar `@storybook/addon-essentials` (se ainda não estiver incluído) para controls, actions, viewport
- Configurar addon de interações para capturar eventos automaticamente

**Dependências a adicionar**:

- `@storybook/addon-interactions`
- `@storybook/test` (para funções de teste de interações)

### 1.2 Criar Catálogo de Eventos

**Arquivo**: [`src/docs/EventCatalog.mdx`](react-design-system/src/docs/EventCatalog.mdx) (novo)

Criar documentação MDX que liste todos os eventos dos componentes:

- Tabela de eventos por componente (atoms, molecules, organisms)
- Descrição de cada evento
- Parâmetros do evento
- Exemplos de uso
- Quando o evento é disparado

**Estrutura sugerida**:

- Seção por categoria (atoms, molecules, organisms)
- Tabela com: Componente | Evento | Descrição | Parâmetros | Exemplo
- Links para stories relevantes

### 1.3 Criar Catálogo de Estados

**Arquivo**: [`src/docs/StateCatalog.mdx`](react-design-system/src/docs/StateCatalog.mdx) (novo)

Criar documentação MDX que liste todos os estados dos componentes:

- Tabela de estados por componente
- Descrição de cada estado
- Como ativar/criar o estado
- Visualização do estado
- Transições entre estados

**Estrutura sugerida**:

- Seção por categoria
- Tabela com: Componente | Estado | Descrição | Como Ativar | Visual
- Diagramas de transição de estados (quando relevante)

### 1.4 Melhorar Preview Configuration

**Arquivo**: [`.storybook/preview.ts`](react-design-system/.storybook/preview.ts)

- Configurar addon de interações
- Adicionar decorators globais para capturar eventos
- Configurar parâmetros para documentação de eventos e estados
- Adicionar configurações de actions melhoradas

### 1.5 Criar Template de Story com Eventos e Estados

**Arquivo**: [`src/docs/StoryTemplateWithEvents.mdx`](react-design-system/src/docs/StoryTemplateWithEvents.mdx) (novo)

Criar template/documentação mostrando como criar stories que documentam eventos e estados:

- Exemplo de story com eventos documentados
- Exemplo de story com estados documentados
- Boas práticas para usar `play` function do addon-interactions
- Como usar `expect` e `waitFor` para testar interações

## Fase 2: Auditoria e Melhorias dos Organisms

### 2.1 CommandPalette

**Arquivos**:

- [`src/ui/organisms/CommandPalette/CommandPalette.tsx`](react-design-system/src/ui/organisms/CommandPalette/CommandPalette.tsx)
- [`src/ui/organisms/CommandPalette/CommandPalette.stories.tsx`](react-design-system/src/ui/organisms/CommandPalette/CommandPalette.stories.tsx)

**Tarefas**:

1. Revisar stories existentes e converter para comportamento real
2. Adicionar stories para:

- Keyboard navigation completa (Cmd/Ctrl+K, Arrow keys, Enter, Escape)
- Busca em tempo real com feedback visual
- Grupos com muitos comandos
- Estados: loading, empty, error
- Eventos: onOpenChange, onCommandSelect, onSearch

3. Documentar eventos:

- `onOpenChange(open: boolean)`
- `onCommandSelect(command: CommandItem)` (se existir)
- Eventos de teclado

4. Documentar estados:

- `open` (aberto/fechado)
- `searchQuery` (busca ativa)
- `selectedIndex` (item selecionado)
- `filteredItems` (resultados filtrados)

5. Adicionar argTypes completos
6. Adicionar testes de interação com `play` function

### 2.2 Toast

**Arquivos**:

- [`src/ui/organisms/Toast/Toast.tsx`](react-design-system/src/ui/organisms/Toast/Toast.tsx)
- [`src/ui/organisms/Toast/Toast.stories.tsx`](react-design-system/src/ui/organisms/Toast/Toast.stories.tsx)
- [`src/ui/organisms/Toast/ToastContext.tsx`](react-design-system/src/ui/organisms/Toast/ToastContext.tsx)
- [`src/ui/organisms/Toast/useToast.ts`](react-design-system/src/ui/organisms/Toast/useToast.ts)

**Tarefas**:

1. Revisar stories existentes e melhorar com comportamento real
2. Adicionar stories para:

- Múltiplos toasts simultâneos com gerenciamento
- Diferentes durações e auto-dismiss
- Toasts com ações funcionais
- Toasts persistentes
- Stack de toasts (limite máximo)
- Posicionamento em todos os cantos

3. Documentar eventos:

- `onDismiss(id: string)`
- `onActionClick(action: ToastAction)` (se existir)
- Eventos do hook `useToast` (success, error, warning, info)

4. Documentar estados:

- `isVisible` (animação de entrada)
- `isExiting` (animação de saída)
- `toasts` (array de toasts ativos)
- Estados de variante (success, error, warning, info)

5. Adicionar argTypes completos
6. Adicionar testes de interação (abrir, fechar, ação)

### 2.3 Timeline

**Arquivos**:

- [`src/ui/organisms/Timeline/Timeline.tsx`](react-design-system/src/ui/organisms/Timeline/Timeline.tsx)
- [`src/ui/organisms/Timeline/Timeline.stories.tsx`](react-design-system/src/ui/organisms/Timeline/Timeline.stories.tsx)

**Tarefas**:

1. Revisar stories existentes - muitas usam `args`, converter para comportamento real
2. Adicionar stories para:

- Timeline interativa (clicável)
- Timeline com muitos itens (scroll virtual)
- Timeline dinâmica (adicionar/remover itens)
- Estados de loading
- Timeline com ações por item

3. Documentar eventos:

- `onItemClick(item: TimelineItem)` (se existir)
- Eventos de navegação (se implementado)

4. Documentar estados:

- `orientation` (horizontal/vertical)
- `status` por item (default, active, completed, error)
- Estados visuais de cada item

5. Adicionar argTypes completos
6. Melhorar stories para demonstrar interatividade real

### 2.4 Stepper

**Arquivos**:

- [`src/ui/organisms/Stepper/Stepper.tsx`](react-design-system/src/ui/organisms/Stepper/Stepper.tsx)
- [`src/ui/organisms/Stepper/Stepper.stories.tsx`](react-design-system/src/ui/organisms/Stepper/Stepper.stories.tsx)

**Tarefas**:

1. Revisar stories existentes - já tem comportamento real, melhorar
2. Adicionar stories para:

- Validação de steps (não permitir avançar sem validar)
- Stepper com formulário completo e validação
- Stepper com navegação condicional
- Stepper com loading states
- Stepper com confirmação antes de completar

3. Documentar eventos:

- `onStepChange(stepIndex: number)`
- `onComplete()`
- `onStepClick(stepIndex: number)` (se existir)
- Eventos de validação

4. Documentar estados:

- `currentStep` (step ativo)
- `status` por step (pending, active, completed, error)
- `allowNavigation` (navegação habilitada/desabilitada)
- Estados de validação

5. Adicionar argTypes completos
6. Adicionar testes de interação (navegação, validação, completar)

## Fase 3: Documentação e Templates

### 3.1 Criar Checklist para Organisms

**Arquivo**: [`ORGANISMS_VALIDATION_CHECKLIST.md`](react-design-system/ORGANISMS_VALIDATION_CHECKLIST.md) (novo)

Criar checklist similar ao `ATOM_VALIDATION_CHECKLIST.md` mas adaptado para organisms:

- Funcionalidade
- Acessibilidade
- API e Props
- Estados e Eventos
- Integração com outros componentes
- Testes
- Documentação

### 3.2 Atualizar Documentação de Componentes

**Arquivos**:

- [`src/docs/ComponentStatus.mdx`](react-design-system/src/docs/ComponentStatus.mdx)
- README do design system

Atualizar status dos organisms após auditoria e melhorias.

## Ordem de Execução

1. **Fase 1.1-1.2**: Adicionar addons e criar catálogo de eventos (base)
2. **Fase 1.3-1.4**: Criar catálogo de estados e melhorar preview
3. **Fase 2.1**: Auditar e melhorar CommandPalette
4. **Fase 2.2**: Auditar e melhorar Toast
5. **Fase 2.3**: Auditar e melhorar Timeline
6. **Fase 2.4**: Auditar e melhorar Stepper
7. **Fase 1.5 e 3**: Templates e documentação final

## Entregáveis

1. Storybook com addon de interações configurado
2. Catálogo de eventos (MDX) documentando todos os eventos
3. Catálogo de estados (MDX) documentando todos os estados
4. Stories melhoradas para os 4 organisms com comportamento real
5. Documentação de eventos e estados para cada organism
6. Checklist de validação para organisms
7. Templates e guias de boas práticas

## Métricas de Sucesso

- Todos os 4 organisms com stories que demonstram comportamento real
- Eventos documentados para todos os organisms
- Estados documentados para todos os organisms
- Addon de interações funcionando e capturando eventos
- Catálogos de eventos e estados completos e navegáveis
- 0 erros de lint após implementação