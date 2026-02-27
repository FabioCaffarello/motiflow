---
name: Evolução Completa Arquitetura e Storybook Avançado
overview: Plano integrado e realista para evoluir a arquitetura front-end (melhorando Context API existente e hierarquia de contextos) e implementar melhorias avançadas do Storybook (playgrounds, theme builder, addons, diagramas Mermaid, a11y avançado), considerando o estado atual do código e alternativas práticas.
todos:
  - id: phase1-app-provider
    content: Criar AppProvider como root provider com hierarquia de contextos
    status: completed
  - id: phase1-config-provider
    content: Criar ConfigProvider para configurações globais do design system
    status: completed
  - id: phase1-refactor-providers
    content: Refatorar providers existentes para seguir padrões consistentes
    status: completed
  - id: phase2-context-selector
    content: Criar hook useContextSelector para performance otimizada
    status: completed
  - id: phase2-provider-composition
    content: Criar hook useProviderComposition para composição type-safe
    status: completed
  - id: phase2-context-devtools
    content: Criar ContextDevTools para debugging no Storybook
    status: completed
  - id: phase3-addon-measure
    content: Instalar e configurar @storybook/addon-measure
    status: completed
  - id: phase3-addon-outline
    content: Instalar e configurar @storybook/addon-outline
    status: completed
  - id: phase3-addon-designs
    content: Instalar e configurar @storybook/addon-designs para Figma
    status: completed
  - id: phase3-addon-coverage
    content: Instalar e configurar @storybook/addon-coverage
    status: completed
  - id: phase3-addon-performance
    content: Instalar e configurar storybook-addon-performance
    status: completed
  - id: phase4-theme-playground
    content: Criar Theme Playground interativo no Storybook
    status: completed
  - id: phase4-typography-playground
    content: Criar Typography Playground interativo no Storybook
    status: completed
  - id: phase4-spacing-playground
    content: Criar Spacing Playground interativo no Storybook
    status: completed
  - id: phase4-colors-playground
    content: Criar Colors Playground interativo no Storybook
    status: completed
  - id: phase5-theme-builder
    content: Criar Theme Builder component com preview em tempo real
    status: completed
  - id: phase5-theme-builder-story
    content: Criar Theme Builder story no Storybook
    status: completed
  - id: phase6-state-machines
    content: Adicionar diagramas de state machines (Mermaid) nas stories
    status: completed
  - id: phase6-composition-diagrams
    content: Adicionar diagramas de composição (Mermaid) para Patterns e Templates
    status: completed
  - id: phase6-context-diagrams
    content: Adicionar diagramas de hierarquia de contextos (Mermaid)
    status: completed
  - id: phase6-data-flow-diagrams
    content: Adicionar diagramas de fluxo de dados (Mermaid) para providers complexos
    status: completed
  - id: phase7-a11y-config
    content: Expandir configuração do addon a11y com regras WCAG 2.1 AA completas
    status: completed
  - id: phase7-a11y-stories
    content: Criar stories específicas para testes de acessibilidade
    status: completed
  - id: phase7-a11y-docs
    content: Documentar padrões de acessibilidade em ACCESSIBILITY.md
    status: completed
  - id: phase7-a11y-tests
    content: Adicionar testes automatizados de acessibilidade nas play functions
    status: completed
  - id: phase8-validate-scripts
    content: Expandir scripts de validação (a11y, themes, context diagram)
    status: completed
  - id: phase8-ci-cd
    content: Configurar CI/CD completo com todas as validações
    status: completed
---

# Evolução Completa: Arquitetura Front-end e Storybook Avançado

## Análise do Estado Atual

### Estado Real do Código

**Gerenciamento de Estado Atual:**

- **Context API** com `useState`, `useCallback`, `useMemo` (TableProvider, ToastProvider, SideNavbarStateProvider)
- **Hierarquia de Contextos** já existente em SideNavbar (Theme → Config → State)
- **PlaygroundStateManager** como classe customizada com middleware pattern
- **281 usos** de hooks de estado (`useState`, `useReducer`, `useMemo`, `useCallback`) em 35 arquivos

**Storybook Atual:**

- ✅ 100% das stories migradas (63 componentes)
- ✅ Eventos e estados documentados inline
- ✅ Play functions implementadas
- ✅ Chromatic configurado (aguardando token)
- ⏳ Playgrounds, Theme Builder, addons avançados pendentes

### Decisão Arquitetural: Abordagem Híbrida

**Não criar Feature Store do zero**, mas **evoluir o Context API existente** com:

1. **Hierarquia Global de Contextos** (AppProvider como root)
2. **Melhorias Incrementais** nos providers existentes
3. **Padrões de Composição** para providers complexos
4. **Hooks Otimizados** com selectors e memoization
5. **DevTools** para debugging de contextos

**Razão**: O código já funciona bem com Context API. A migração para Feature Store seria disruptiva e não traria benefícios imediatos suficientes. Melhor evoluir o que já existe.

## Fase 1: Hierarquia Global de Contextos

### 1.1 Criar AppProvider (Root Provider)

**Arquivo**: `react-design-system/src/ui/providers/AppProvider.tsx`

**Objetivo**: Provider raiz que compõe todos os providers globais do design system.

**Hierarquia Proposta**:

```
AppProvider (Root)
  ├── ThemeProvider (Design System Theme - já existe)
  ├── ConfigProvider (Design System Config - novo)
  └── ComponentProviders (opcionais, por feature)
      ├── ToastProvider (já existe)
      ├── DialogProvider (já existe)
      └── [Outros providers conforme necessário]
```

**Implementação**:

- Compor providers existentes em ordem lógica
- Fornecer hooks type-safe para acessar contextos
- Suportar configuração opcional de cada provider
- Documentar hierarquia e dependências

**Design Pattern**: **Composition Pattern** - composição de providers ao invés de herança

### 1.2 Criar ConfigProvider

**Arquivo**: `react-design-system/src/ui/providers/ConfigProvider.tsx`

**Objetivo**: Centralizar configurações globais do design system.

**Configurações**:

- Breakpoints responsivos
- Tokens de design (spacing, typography, colors)
- Configurações de comportamento (animations, transitions)
- Feature flags

**Design Pattern**: **Strategy Pattern** - diferentes estratégias de configuração (default, custom, theme-based)

### 1.3 Refatorar Providers Existentes

**Objetivo**: Garantir que todos os providers sigam padrões consistentes.

**Padrões a Aplicar**:

- **Controlled/Uncontrolled Pattern**: Suportar ambos os modos
- **Composition Pattern**: Providers aninháveis
- **Hook Pattern**: Hooks type-safe para acessar contextos
- **Error Boundaries**: Tratamento de erros em providers

**Arquivos a Refatorar**:

- `TableProvider.tsx` - adicionar melhorias de performance
- `ToastProvider.tsx` - garantir compatibilidade com AppProvider
- `SideNavbarStateProvider.tsx` - manter hierarquia existente, integrar com AppProvider

## Fase 2: Melhorias de Performance e Hooks

### 2.1 Criar Hooks Otimizados com Selectors

**Arquivo**: `react-design-system/src/ui/hooks/useContextSelector.ts`

**Objetivo**: Hooks que permitem selecionar apenas partes específicas do contexto, evitando re-renders desnecessários.

**Implementação**:

- Usar `useMemo` e `useCallback` para memoização
- Comparação shallow de seletores
- Type-safe com TypeScript generics

**Exemplo**:

```typescript
// Ao invés de:
const { page, pageSize, sortColumn } = useTableContext(); // re-render em qualquer mudança

// Usar:
const page = useTableContextSelector(state => state.page); // re-render apenas se page mudar
```

**Design Pattern**: **Selector Pattern** - seleção granular de estado

### 2.2 Criar Hook useProviderComposition

**Arquivo**: `react-design-system/src/ui/hooks/useProviderComposition.ts`

**Objetivo**: Hook helper para compor múltiplos providers de forma type-safe.

**Benefícios**:

- Reduz boilerplate de composição
- Garante ordem correta de providers
- Facilita testes

### 2.3 Adicionar DevTools para Contextos

**Arquivo**: `react-design-system/src/ui/devtools/ContextDevTools.tsx`

**Objetivo**: Painel de debug para inspecionar contextos no Storybook.

**Features**:

- Visualização de hierarquia de contextos
- Inspeção de valores de contexto
- Timeline de mudanças
- Filtros por contexto

**Integração**: Adicionar como addon do Storybook

## Fase 3: Melhorias Avançadas do Storybook

### 3.1 Instalar e Configurar Addons Avançados

**Addons a Instalar**:

1. **@storybook/addon-measure**

   - Medição de dimensões de componentes
   - Espaçamento e padding
   - Útil para design system

2. **@storybook/addon-outline**

   - Visualização de outlines de elementos
   - Debug de layout
   - Identificação de problemas de espaçamento

3. **@storybook/addon-designs**

   - Integração com Figma
   - Comparação visual com designs
   - Links para designs no Storybook

4. **@storybook/addon-coverage**

   - Cobertura de código das stories
   - Identificar componentes sem stories
   - Métricas de documentação

5. **storybook-addon-performance**

   - Métricas de performance
   - Tempo de renderização
   - Identificar componentes lentos

**Arquivo**: `react-design-system/.storybook/main.ts` - adicionar addons

### 3.2 Criar Playgrounds Interativos

**Objetivo**: Permitir experimentação visual de tokens e configurações do design system.

**Playgrounds a Criar**:

1. **Theme Playground**

   - Arquivo: `react-design-system/src/ui/playgrounds/ThemePlayground.tsx`
   - Story: `react-design-system/src/ui/playgrounds/ThemePlayground.stories.tsx`
   - Features: Ajustar cores, espaçamento, tipografia em tempo real

2. **Typography Playground**

   - Arquivo: `react-design-system/src/ui/playgrounds/TypographyPlayground.tsx`
   - Story: `react-design-system/src/ui/playgrounds/TypographyPlayground.stories.tsx`
   - Features: Visualizar todas as variações de tipografia, ajustar scale

3. **Spacing Playground**

   - Arquivo: `react-design-system/src/ui/playgrounds/SpacingPlayground.tsx`
   - Story: `react-design-system/src/ui/playgrounds/SpacingPlayground.stories.tsx`
   - Features: Visualizar escala de espaçamento, testar diferentes valores

4. **Colors Playground**

   - Arquivo: `react-design-system/src/ui/playgrounds/ColorsPlayground.tsx`
   - Story: `react-design-system/src/ui/playgrounds/ColorsPlayground.stories.tsx`
   - Features: Explorar paleta de cores, contrastes, acessibilidade

**Design Pattern**: **Builder Pattern** - construção interativa de configurações

### 3.3 Criar Theme Builder Component

**Arquivo**: `react-design-system/src/ui/tools/ThemeBuilder.tsx`

**Objetivo**: Ferramenta interativa para construir temas customizados.

**Features**:

- Interface visual para ajustar tokens
- Preview em tempo real de componentes
- Exportação de tema (JSON, CSS variables, TypeScript)
- Templates de temas pré-configurados
- Validação de acessibilidade (contraste, WCAG)

**Story**: `react-design-system/src/ui/tools/ThemeBuilder.stories.tsx`

**Design Pattern**: **Builder Pattern** + **Strategy Pattern** (diferentes formatos de export)

### 3.4 Adicionar Diagramas Mermaid nas Stories

**Objetivo**: Documentação visual de arquitetura, fluxos e state machines.

**Tipos de Diagramas**:

1. **State Machines** (para componentes com estados complexos)

   - Modal (open/closed)
   - Stepper (step navigation)
   - Table (sorting, filtering, pagination states)

2. **Composition Diagrams** (para Patterns e Templates)

   - DataTablePattern (composição de componentes)
   - DashboardLayout (estrutura de layout)
   - FormWizardPattern (fluxo de steps)

3. **Context Hierarchy Diagrams**

   - Hierarquia de providers
   - Fluxo de dados entre contextos
   - Dependências entre providers

4. **Data Flow Diagrams** (para Feature Stores futuros)

   - Fluxo de ações → middlewares → state
   - Persistência e sincronização

**Implementação**: Usar `@storybook/addon-docs` com blocos de código Mermaid em `parameters.docs.description.component`

**Exemplo**:

```markdown
\`\`\`mermaid
stateDiagram-v2
    [*] --> Closed
    Closed --> Open: onClick
    Open --> Closed: onClose
\`\`\`
```

### 3.5 Expandir Testes de Acessibilidade

**Objetivo**: Garantir conformidade completa com WCAG 2.1 AA.

**Tarefas**:

1. **Revisar Configuração do Addon A11y**

   - Arquivo: `react-design-system/.storybook/preview.tsx`
   - Expandir regras WCAG 2.1 AA
   - Adicionar regras customizadas

2. **Criar Stories Específicas para A11y**

   - Navegação por teclado
   - Screen reader compatibility
   - Focus management
   - ARIA attributes

3. **Documentar Padrões de Acessibilidade**

   - Arquivo: `react-design-system/docs/ACCESSIBILITY.md`
   - Guia de uso de ARIA
   - Padrões de navegação por teclado
   - Checklist de acessibilidade

4. **Adicionar Testes Automatizados**

   - Integrar `@axe-core/react` nas stories
   - Testes de navegação por teclado nas play functions
   - Validação de contrastes

## Fase 4: Automação e CI/CD

### 4.1 Expandir Scripts de Validação

**Scripts Existentes** (melhorar):

- `validate-stories.ts` - adicionar validação de diagramas Mermaid
- `validate-architecture.ts` - adicionar validação de hierarquia de contextos

**Novos Scripts**:

- `validate-a11y.ts` - validação de acessibilidade
- `validate-themes.ts` - validação de temas
- `generate-context-diagram.ts` - gerar diagrama de hierarquia de contextos

### 4.2 Configurar CI/CD Completo

**Arquivo**: `react-design-system/.github/workflows/ci.yml`

**Validações**:

- ✅ Validação de stories
- ✅ Validação de arquitetura
- ✅ Testes de acessibilidade
- ✅ Visual regression (Chromatic)
- ✅ Build do Storybook
- ✅ Deploy automático do Storybook

**Notificações**: Slack/Discord em caso de falhas

## Estrutura de Arquivos Proposta

```
react-design-system/
├── src/
│   ├── ui/
│   │   ├── providers/
│   │   │   ├── AppProvider.tsx              # NOVO: Root provider
│   │   │   ├── ConfigProvider.tsx           # NOVO: Design system config
│   │   │   ├── ThemeProvider.tsx            # EXISTE: Melhorar
│   │   │   ├── ToastProvider.tsx            # EXISTE: Integrar
│   │   │   └── DialogProvider.tsx           # EXISTE: Integrar
│   │   ├── hooks/
│   │   │   ├── useContextSelector.ts        # NOVO: Hooks otimizados
│   │   │   └── useProviderComposition.ts    # NOVO: Composição de providers
│   │   ├── devtools/
│   │   │   └── ContextDevTools.tsx          # NOVO: DevTools para contextos
│   │   ├── playgrounds/
│   │   │   ├── ThemePlayground.tsx          # NOVO
│   │   │   ├── TypographyPlayground.tsx      # NOVO
│   │   │   ├── SpacingPlayground.tsx        # NOVO
│   │   │   └── ColorsPlayground.tsx         # NOVO
│   │   └── tools/
│   │       └── ThemeBuilder.tsx             # NOVO: Theme builder
│   └── docs/
│       ├── ARCHITECTURE.md                  # Atualizar: Hierarquia de contextos
│       ├── ACCESSIBILITY.md                 # NOVO: Guia de acessibilidade
│       └── CONTEXT_HIERARCHY.md             # NOVO: Documentação de contextos
├── .storybook/
│   ├── main.ts                              # Atualizar: Novos addons
│   └── preview.tsx                          # Atualizar: A11y avançado
└── scripts/
    ├── validate-a11y.ts                     # NOVO
    ├── validate-themes.ts                    # NOVO
    └── generate-context-diagram.ts           # NOVO
```

## Design Patterns Aplicados

### 1. Composition Pattern

- Composição de providers ao invés de herança
- AppProvider compõe outros providers

### 2. Selector Pattern

- Hooks com selectors para performance
- Re-renders apenas quando necessário

### 3. Strategy Pattern

- Diferentes estratégias de configuração (ConfigProvider)
- Diferentes formatos de export (ThemeBuilder)

### 4. Builder Pattern

- ThemeBuilder constrói temas interativamente
- Playgrounds constroem configurações

### 5. Provider Pattern (já em uso)

- Hierarquia de contextos
- Composição de providers

## Benefícios da Abordagem

### Realismo

- Evolui código existente ao invés de reescrever
- Menos disruptivo para o time
- Migração incremental possível

### Performance

- Selectors evitam re-renders desnecessários
- Memoization automática
- Lazy loading de providers quando possível

### Developer Experience

- Playgrounds facilitam experimentação
- Theme Builder acelera customização
- DevTools melhoram debugging

### Qualidade

- A11y avançado garante acessibilidade
- Diagramas melhoram documentação
- CI/CD automatiza validações

## Migração Gradual

### Estratégia

1. **Fase 1**: Criar AppProvider e ConfigProvider (não quebra código existente)
2. **Fase 2**: Adicionar hooks otimizados (opcional, retrocompatível)
3. **Fase 3**: Melhorias do Storybook (aditivo, não disruptivo)
4. **Fase 4**: Automação e CI/CD (melhora processo)

### Compatibilidade

- Todos os providers existentes continuam funcionando
- AppProvider é opcional (pode ser adotado gradualmente)
- Hooks otimizados são opcionais (não substituem hooks existentes)

## Métricas de Sucesso

### Arquitetura

- [ ] AppProvider criado e documentado
- [ ] ConfigProvider centralizando configurações
- [ ] Hooks otimizados implementados
- [ ] DevTools funcionando no Storybook

### Storybook

- [ ] 5 addons avançados instalados e configurados
- [ ] 4 playgrounds interativos criados
- [ ] Theme Builder funcional
- [ ] Diagramas Mermaid em componentes complexos
- [ ] A11y expandido com stories específicas

### Automação

- [ ] CI/CD completo configurado
- [ ] Validações automáticas em PRs
- [ ] Deploy automático do Storybook

## Próximos Passos Imediatos

1. **Criar AppProvider** - Fundação da hierarquia global
2. **Criar ConfigProvider** - Centralizar configurações
3. **Instalar Addons do Storybook** - Melhorar ferramentas
4. **Criar primeiro Playground** - Prova de conceito
5. **Adicionar Diagramas Mermaid** - Melhorar documentação