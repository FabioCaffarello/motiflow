---
name: Evolução Completa do Storybook e Design System
overview: Plano abrangente para transformar o Storybook em um guia definitivo, migrando eventos e estados para stories individuais, expandindo a arquitetura além de atoms/molecules/organisms, e implementando melhorias de classe mundial no design system.
todos: []
---

# Plano Definitivo: Evolução Completa do Storybook e Design System

## Visão Geral

Este plano estabelece uma estratégia rigorosa e detalhada para transformar o Storybook do react-design-system em um sistema de documentação de classe mundial, com arquitetura expandida, stories ricas em eventos e estados, e uma estrutura de design system extremamente poderosa.

## Fase 1: Migração de Eventos e Estados para Stories Individuais

### 1.1 Estrutura de Documentação por Componente

**Objetivo**: Cada story deve ser auto-contida com sua própria documentação de eventos e estados.

**Estrutura Proposta**:

```
ComponentName/
  ├── ComponentName.tsx
  ├── ComponentName.stories.tsx
  ├── ComponentName.test.tsx
  ├── ComponentName.mdx (opcional, para documentação complexa)
  └── README.md (opcional, para documentação técnica)
```

**Padrão de Story com Eventos e Estados**:

```tsx
// ComponentName.stories.tsx
import type { Meta, StoryObj } from '@storybook/react';
import { fn } from '@storybook/test';
import { expect, userEvent, within, waitFor } from '@storybook/test';
import ComponentName from './ComponentName';

const meta: Meta<typeof ComponentName> = {
  title: 'Category/ComponentName',
  component: ComponentName,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: `
## ComponentName

Descrição do componente.

### Events

| Event | Description | Parameters | When Fired |
|-------|-------------|------------|------------|
| \`onClick\` | Click event | \`(event: MouseEvent) => void\` | When user clicks |
| \`onChange\` | Value change | \`(value: string) => void\` | When value changes |

### States

| State | Description | How to Activate | Visual |
|-------|-------------|-----------------|--------|
| \`default\` | Default state | Initial state | Normal appearance |
| \`hover\` | Hover state | Mouse over | Highlighted |
| \`active\` | Active state | Click and hold | Pressed appearance |
| \`disabled\` | Disabled state | \`disabled={true}\` | Grayed out |
        `,
      },
    },
  },
  argTypes: {
    // Document all props including events
    onClick: {
      description: 'Callback fired when component is clicked',
      action: 'onClick',
      table: {
        type: { summary: '(event: MouseEvent) => void' },
        category: 'Events',
      },
    },
    onChange: {
      description: 'Callback fired when value changes',
      action: 'onChange',
      table: {
        type: { summary: '(value: string) => void' },
        category: 'Events',
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof ComponentName>;

// Story para cada estado
export const DefaultState: Story = {
  args: {
    // default props
  },
};

export const HoverState: Story = {
  args: {
    // props for hover
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const component = canvas.getByRole('button');
    await userEvent.hover(component);
    // Verify hover state
  },
};

// Story para demonstrar eventos
export const WithEvents: Story = {
  render: () => {
    const handleClick = fn((event: MouseEvent) => {
      console.log('Clicked:', event);
    });
    
    return (
      <ComponentName onClick={handleClick} />
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole('button');
    await userEvent.click(button);
    // Verify event was fired
  },
};
```

### 1.2 Script de Migração Automatizada

**Arquivo**: `scripts/migrate-events-states.ts`

**Funcionalidades**:

- Ler EventCatalog.mdx e StateCatalog.mdx
- Mapear eventos e estados para componentes
- Gerar/atualizar stories com documentação inline
- Validar que todas as stories têm eventos e estados documentados

### 1.3 Checklist de Migração por Componente

Para cada componente (58 total):

- [ ] Story tem seção "Events" na documentação
- [ ] Story tem seção "States" na documentação
- [ ] Todos os eventos estão documentados no argTypes com `action`
- [ ] Stories separadas para cada estado principal
- [ ] Play functions testam interações e eventos
- [ ] Exemplos interativos demonstram eventos em ação
- [ ] Documentação MDX global removida (EventCatalog/StateCatalog)

## Fase 2: Expansão da Arquitetura de Componentes

### 2.1 Nova Estrutura de Categorias

Além de Atoms, Molecules e Organisms, adicionar:

#### **Templates** (`src/ui/templates/`)

Componentes de layout completos e reutilizáveis que combinam organisms, molecules e atoms.

**Exemplos**:

- `DashboardLayout`
- `AuthLayout`
- `FormLayout`
- `DetailPageLayout`
- `ListPageLayout`
- `WizardLayout`

**Critérios**:

- Combina múltiplos organisms
- Define estrutura de página completa
- Configurável mas com padrões sensatos
- Inclui slots para conteúdo customizado

#### **Patterns** (`src/ui/patterns/`)

Padrões de design reutilizáveis que não são componentes únicos, mas combinações específicas.

**Exemplos**:

- `DataTablePattern` (Table + Pagination + Filters + Actions)
- `FormWizardPattern` (Stepper + Form + Validation)
- `SearchAndFilterPattern` (SearchInput + Filters + Results)
- `MasterDetailPattern` (List + Detail View)
- `CardGridPattern` (Grid layout com Cards)

**Critérios**:

- Combina múltiplos componentes de forma específica
- Resolve um problema de UX comum
- Documentado com casos de uso
- Inclui exemplos de variações

#### **Layouts** (`src/ui/layouts/`)

Componentes de estrutura de página e grid systems.

**Exemplos**:

- `Container`
- `Grid`
- `Stack`
- `Flex`
- `SidebarLayout`
- `HeaderLayout`
- `FooterLayout`

**Critérios**:

- Focam em estrutura e espaçamento
- Não têm lógica de negócio
- Altamente reutilizáveis
- Base para templates

#### **Utilities** (`src/ui/utilities/`)

Componentes utilitários e helpers visuais.

**Exemplos**:

- `Portal` (para modals, tooltips)
- `FocusTrap`
- `ClickOutside`
- `ScrollLock`
- `ResizeObserver`
- `IntersectionObserver`

**Critérios**:

- Funcionalidade pura, sem UI visual
- Reutilizáveis em múltiplos contextos
- Hooks ou componentes wrapper

#### **Providers** (`src/ui/providers/`) - Já existe, expandir

Context providers para estado global e configuração.

**Exemplos**:

- `ThemeProvider` (já existe)
- `ToastProvider` (já existe)
- `DialogProvider`
- `FormProvider`
- `I18nProvider`
- `AnalyticsProvider`

#### **Extensions** (`src/ui/extensions/`) - Já existe, expandir

Extensões especializadas do design system.

**Exemplos**:

- `flow/` (já existe)
- `charts/` (futuro)
- `maps/` (futuro)
- `editors/` (futuro)

### 2.2 Estrutura de Diretórios Final

```
src/ui/
├── atoms/          # Componentes básicos indivisíveis
├── molecules/      # Combinações de atoms
├── organisms/      # Componentes complexos
├── templates/      # Layouts de página completos (NOVO)
├── patterns/       # Padrões de design reutilizáveis (NOVO)
├── layouts/        # Componentes de estrutura (NOVO)
├── utilities/      # Componentes utilitários (NOVO)
├── providers/      # Context providers (EXPANDIR)
├── extensions/    # Extensões especializadas (EXPANDIR)
├── tokens/         # Design tokens (já existe)
└── hooks/          # Custom hooks (já existe)
```

### 2.3 Guia de Categorização

**Decisão Tree para Categorização**:

```
1. É um componente básico indivisível?
   ├─ Sim → atoms/
   └─ Não → 2

2. Combina apenas atoms?
   ├─ Sim → molecules/
   └─ Não → 3

3. Combina molecules e atoms, mas é um componente único?
   ├─ Sim → organisms/
   └─ Não → 4

4. É um layout completo de página?
   ├─ Sim → templates/
   └─ Não → 5

5. É um padrão de design específico (combinação de múltiplos componentes)?
   ├─ Sim → patterns/
   └─ Não → 6

6. É apenas estrutura/espaçamento?
   ├─ Sim → layouts/
   └─ Não → 7

7. É funcionalidade sem UI visual?
   ├─ Sim → utilities/
   └─ Não → 8

8. É um provider de contexto?
   ├─ Sim → providers/
   └─ Não → 9

9. É uma extensão especializada?
   └─ Sim → extensions/
```

## Fase 3: Melhorias Avançadas no Storybook

### 3.1 Addons Essenciais

**Adicionar**:

- `@storybook/addon-interactions` (já incluído no docs)
- `@storybook/addon-viewport` (já existe)
- `@storybook/addon-backgrounds` (já existe)
- `@storybook/addon-measure` (NOVO - medir elementos)
- `@storybook/addon-outline` (NOVO - visualizar outlines)
- `@storybook/addon-designs` (NOVO - integrar Figma)
- `@storybook/addon-coverage` (NOVO - cobertura de código)
- `@storybook/addon-performance` (NOVO - métricas de performance)

**Configurar**:

```typescript
// .storybook/main.ts
addons: [
  '@storybook/addon-docs',
  '@storybook/addon-a11y',
  '@storybook/addon-vitest',
  '@storybook/addon-mcp',
  '@storybook/addon-measure',
  '@storybook/addon-outline',
  '@storybook/addon-designs',
  '@storybook/addon-coverage',
  '@storybook/addon-performance',
]
```

### 3.2 Organização de Stories no Storybook

**Estrutura de Navegação**:

```
Design System/
├── Getting Started/
│   ├── Introduction
│   ├── Installation
│   ├── Quick Start
│   └── Architecture
├── Design Tokens/
│   ├── Colors
│   ├── Typography
│   ├── Spacing
│   ├── Shadows
│   └── Animations
├── Atoms/
│   ├── Button/
│   │   ├── Overview
│   │   ├── Variants
│   │   ├── States
│   │   ├── Events
│   │   └── Examples
│   └── [todos os atoms]
├── Molecules/
│   └── [todos os molecules]
├── Organisms/
│   └── [todos os organisms]
├── Templates/ (NOVO)
│   ├── DashboardLayout
│   ├── AuthLayout
│   └── [outros templates]
├── Patterns/ (NOVO)
│   ├── DataTablePattern
│   ├── FormWizardPattern
│   └── [outros patterns]
├── Layouts/ (NOVO)
│   ├── Container
│   ├── Grid
│   └── [outros layouts]
├── Utilities/ (NOVO)
│   └── [utilities]
├── Providers/
│   └── [providers]
└── Extensions/
    ├── Flow
    └── [outras extensões]
```

### 3.3 Story Templates Avançados

**Template Base para Todos os Componentes**:

```typescript
// .storybook/templates/ComponentStoryTemplate.ts
export const createComponentStory = (config: {
  title: string;
  component: React.ComponentType;
  description: string;
  events: EventDefinition[];
  states: StateDefinition[];
  argTypes: ArgTypes;
}) => {
  // Template completo com todas as seções
};
```

**Seções Obrigatórias em Cada Story**:

1. **Overview**: Descrição do componente
2. **Props**: Tabela completa de props com argTypes
3. **Variants**: Todas as variantes do componente
4. **States**: Stories para cada estado
5. **Events**: Stories demonstrando eventos
6. **Examples**: Exemplos de uso real
7. **Accessibility**: Testes e guias de acessibilidade
8. **Performance**: Métricas e otimizações

### 3.4 Documentação Interativa

**MDX Pages Avançadas**:

- Guias de uso com exemplos interativos
- Playgrounds para experimentação
- Comparações side-by-side de variantes
- Fluxos de estado com diagramas
- Matrizes de compatibilidade

**Exemplo de MDX Avançado**:

```mdx
import { Meta, Story, Canvas } from '@storybook/addon-docs';
import { useState } from 'react';
import Button from './Button';

<Meta title="Atoms/Button" />

# Button Component

## Interactive Playground

<Canvas>
  <Story name="Playground">
    {() => {
      const [variant, setVariant] = useState('primary');
      const [size, setSize] = useState('md');
      const [disabled, setDisabled] = useState(false);
      
      return (
        <div>
          <Button variant={variant} size={size} disabled={disabled}>
            Interactive Button
          </Button>
          {/* Controls */}
        </div>
      );
    }}
  </Story>
</Canvas>

## State Machine

\`\`\`mermaid
stateDiagram-v2
    [*] --> default
    default --> hover: mouseEnter
    hover --> active: mouseDown
    active --> default: mouseUp
    default --> disabled: setDisabled(true)
    disabled --> default: setDisabled(false)
\`\`\`
```

### 3.5 Testes de Interação Avançados

**Padrão de Testes**:

```typescript
export const InteractionTests: Story = {
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);
    
    await step('Initial state', async () => {
      // Verificar estado inicial
    });
    
    await step('User interaction', async () => {
      // Simular interação
    });
    
    await step('State change', async () => {
      // Verificar mudança de estado
    });
    
    await step('Event firing', async () => {
      // Verificar eventos
    });
  },
};
```

### 3.6 Visual Regression Testing

**Configurar Chromatic**:

- Screenshots automáticos de todas as stories
- Comparação visual em PRs
- Histórico de mudanças visuais
- Aprovação manual de mudanças

### 3.7 Accessibility Testing Avançado

**Configuração**:

```typescript
// .storybook/preview.tsx
a11y: {
  config: {
    rules: [
      {
        id: 'color-contrast',
        enabled: true,
      },
      {
        id: 'keyboard-navigation',
        enabled: true,
      },
      // Todas as regras WCAG 2.1 AA
    ],
  },
  options: {
    checks: { 'color-contrast': { options: { noScroll: true } } },
    restoreScroll: true,
  },
}
```

**Stories de Acessibilidade**:

- Story para cada regra WCAG
- Testes automatizados de acessibilidade
- Guias de uso para screen readers
- Exemplos de ARIA patterns

## Fase 4: Melhorias de Design System

### 4.1 Design Tokens Avançados

**Expandir Sistema de Tokens**:

- Tokens semânticos mais granulares
- Tokens de movimento e animação
- Tokens de elevação e profundidade
- Tokens de breakpoints responsivos
- Tokens de z-index system

**Estrutura**:

```
tokens/
├── colors/
│   ├── semantic.ts
│   ├── palette.ts
│   └── themes.ts
├── typography/
│   ├── scales.ts
│   ├── weights.ts
│   └── families.ts
├── spacing/
│   ├── scale.ts
│   └── system.ts
├── shadows/
│   ├── elevation.ts
│   └── focus.ts
├── motion/
│   ├── duration.ts
│   ├── easing.ts
│   └── transitions.ts
└── breakpoints/
    └── responsive.ts
```

### 4.2 Sistema de Temas Avançado

**Melhorias**:

- Theme builder interativo no Storybook
- Preview de temas em tempo real
- Export/import de temas customizados
- Suporte a múltiplos temas simultâneos
- Theme variants (light, dark, high contrast, etc.)

### 4.3 Component Status System

**Expandir ComponentStatus.mdx**:

- Status de cada componente (stable, beta, deprecated)
- Roadmap de componentes
- Changelog por componente
- Breaking changes tracker
- Migration guides

### 4.4 Versionamento e Changelog

**Estrutura**:

- Versionamento semântico rigoroso
- Changelog detalhado por versão
- Migration guides entre versões
- Deprecation warnings nas stories
- Breaking changes destacados

## Fase 5: Ferramentas e Automação

### 5.1 Scripts de Validação

**Scripts a Criar**:

- `scripts/validate-stories.ts`: Valida que todas as stories têm eventos e estados
- `scripts/validate-architecture.ts`: Valida categorização de componentes
- `scripts/generate-story-index.ts`: Gera índice de todas as stories
- `scripts/audit-accessibility.ts`: Audita acessibilidade de todos os componentes

### 5.2 Generators Avançados

**Expandir Plop Templates**:

- Template para atoms com eventos/estados
- Template para molecules
- Template para organisms
- Template para templates (novos)
- Template para patterns (novos)
- Template para layouts (novos)

### 5.3 CI/CD para Storybook

**Pipeline**:

1. Build Storybook
2. Run visual regression tests
3. Run accessibility tests
4. Validate stories structure
5. Deploy to Chromatic
6. Deploy to GitHub Pages

## Fase 6: Documentação e Guias

### 6.1 Guias de Uso

**Criar**:

- `docs/STORYBOOK_GUIDE.md`: Guia completo do Storybook
- `docs/ARCHITECTURE.md`: Arquitetura do design system
- `docs/CONTRIBUTING.md`: Guia de contribuição
- `docs/EVENTS_STATES_GUIDE.md`: Como documentar eventos e estados
- `docs/CATEGORIZATION_GUIDE.md`: Como categorizar componentes

### 6.2 Best Practices

**Documentar**:

- Quando usar cada categoria
- Como compor componentes
- Padrões de nomenclatura
- Convenções de código
- Performance guidelines

## Ordem de Implementação

### Sprint 1: Fundação

1. Criar estrutura de diretórios (templates, patterns, layouts, utilities)
2. Configurar novos addons do Storybook
3. Criar templates de story avançados
4. Implementar script de migração de eventos/estados

### Sprint 2: Migração de Eventos e Estados

1. Migrar eventos de EventCatalog.mdx para stories
2. Migrar estados de StateCatalog.mdx para stories
3. Adicionar play functions para testes de interação
4. Validar todas as stories

### Sprint 3: Expansão de Arquitetura

1. Criar primeiros templates
2. Criar primeiros patterns
3. Criar layouts básicos
4. Documentar guia de categorização

### Sprint 4: Melhorias Avançadas

1. Implementar visual regression testing
2. Expandir testes de acessibilidade
3. Criar playgrounds interativos
4. Implementar theme builder

### Sprint 5: Ferramentas e Automação

1. Criar scripts de validação
2. Expandir generators
3. Configurar CI/CD completo
4. Documentar tudo

## Métricas de Sucesso

- ✅ 100% das stories têm eventos documentados
- ✅ 100% das stories têm estados documentados
- ✅ 100% das stories têm play functions
- ✅ 0 MDX globais de eventos/estados
- ✅ Arquitetura expandida com 5+ categorias
- ✅ 100% de cobertura de testes de acessibilidade
- ✅ Visual regression testing configurado
- ✅ Documentação completa e atualizada

## Arquivos Principais a Modificar/Criar

### Modificar

- `.storybook/main.ts`: Adicionar novos addons
- `.storybook/preview.tsx`: Configurar acessibilidade avançada
- `src/docs/EventCatalog.mdx`: Remover após migração
- `src/docs/StateCatalog.mdx`: Remover após migração
- Todas as `*.stories.tsx`: Adicionar eventos e estados

### Criar

- `src/ui/templates/`: Nova categoria
- `src/ui/patterns/`: Nova categoria
- `src/ui/layouts/`: Nova categoria
- `src/ui/utilities/`: Nova categoria
- `scripts/migrate-events-states.ts`: Script de migração
- `scripts/validate-stories.ts`: Validação
- `.storybook/templates/`: Templates de story
- `docs/STORYBOOK_GUIDE.md`: Documentação