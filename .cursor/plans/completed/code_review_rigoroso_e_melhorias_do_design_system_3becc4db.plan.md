---
name: Code Review Rigoroso e Melhorias do Design System
overview: Plano abrangente para realizar code review rigoroso do design system, corrigir bugs, eliminar débito técnico, melhorar qualidade de código, aumentar cobertura de testes, aprimorar Storybook e garantir consistência e acessibilidade em todos os componentes.
todos:
  - id: eliminate-any-types
    content: Eliminar uso de `any` em todos os componentes, substituindo por tipos genéricos corretos (TableActions, TableFilters, TableCell, Tooltip, Breadcrumb, Dropdown, FormContext)
    status: completed
  - id: remove-console-statements
    content: Remover todos os console.log/warn/error de stories e componentes de produção
    status: completed
  - id: standardize-exports
    content: Padronizar exportações em todos os index.ts, garantir que todos os componentes estejam exportados corretamente
    status: completed
  - id: improve-eslint-config
    content: "Adicionar regras rigorosas ao ESLint: proibir any, console.* em produção, regras de acessibilidade"
    status: completed
  - id: test-avatar
    content: Criar testes completos para Avatar e AvatarGroup (fallback, sizes, group, acessibilidade)
    status: completed
  - id: test-progress
    content: Criar testes completos para Progress (variantes, estados, indeterminate, acessibilidade)
    status: completed
  - id: test-datepicker
    content: Criar testes completos para DatePicker (seleção, range, validação, keyboard nav, acessibilidade)
    status: completed
  - id: test-dialog
    content: Criar testes completos para Dialog (abertura/fechamento, focus trap, portal, acessibilidade)
    status: completed
  - id: test-toast
    content: Criar testes completos para Toast (exibição, dismiss, posicionamento, acessibilidade)
    status: completed
  - id: test-tabs
    content: Criar testes completos para Tabs (navegação, keyboard, controlled/uncontrolled, acessibilidade)
    status: completed
  - id: test-remaining-components
    content: "Criar testes para componentes restantes sem testes: InputWithLabel, SidebarHeader, Info, BoxWrapper, Text"
    status: completed
  - id: improve-existing-tests
    content: "Melhorar testes existentes: adicionar testes de acessibilidade, keyboard navigation, edge cases"
    status: completed
  - id: configure-coverage
    content: Configurar vitest coverage com threshold mínimo de 80%, integrar no CI/CD
    status: completed
  - id: complete-accessibility
    content: Implementar melhorias de acessibilidade completas conforme ACCESSIBILITY_AUDIT.md (ARIA, keyboard nav, focus management)
    status: pending
  - id: accessibility-tests
    content: Adicionar testes de acessibilidade com @testing-library/jest-dom e integrar @storybook/addon-a11y
    status: pending
  - id: storybook-mdx-docs
    content: "Criar documentação MDX para componentes complexos: Table, Form, Dialog, DatePicker"
    status: completed
  - id: expand-storybook-addons
    content: "Expandir addons do Storybook: viewport, actions, melhorar a11y, controls, considerar design-tokens"
    status: completed
  - id: improve-stories
    content: "Melhorar stories: adicionar composição, use cases reais, stories de acessibilidade, estados de erro/loading"
    status: pending
  - id: storybook-advanced-config
    content: "Configurar Storybook avançado: theming, toolbar customizado, backgrounds, viewports, organização"
    status: completed
  - id: standardize-components
    content: "Revisar e padronizar todos os componentes: padrões, design tokens, estrutura de arquivos, JSDoc"
    status: pending
  - id: improve-error-handling
    content: Padronizar tratamento de erros, adicionar error boundaries, melhorar mensagens de erro
    status: pending
  - id: performance-audit
    content: Auditar bundle size, identificar code splitting, otimizar imports, verificar tree-shaking
    status: pending
  - id: update-documentation
    content: Atualizar README, criar guia de contribuição, documentar padrões de código, criar guia de migração
    status: pending
---

# Code Review Rigoroso e Melhorias do Design System

## Objetivo

Realizar code review rigoroso do design system, identificar e corrigir bugs, eliminar débito técnico, melhorar qualidade de código, aumentar cobertura de testes, aprimorar Storybook e garantir consistência e acessibilidade em todos os componentes.

## Análise Inicial Identificada

### Componentes Sem Testes

- Avatar / AvatarGroup
- Progress
- DatePicker (e sub-componentes)
- Dialog (e sub-componentes)
- Toast (e sub-componentes)
- Tabs (e sub-componentes)
- InputWithLabel
- SidebarHeader
- Info
- BoxWrapper
- Text

### Problemas de Type Safety

- Uso excessivo de `any` em: TableActions, TableFilters, TableCell, TableTypes, Tooltip, Breadcrumb, Dropdown, FormContext
- Type assertions inseguras (`as any`)
- Genéricos mal definidos

### Console Statements

- 43 ocorrências de `console.log/warn/error` em stories e componentes
- Devem ser removidos ou substituídos por sistema de logging adequado

### Inconsistências de Exportação

- Mistura de `export default` e `export *`
- Alguns componentes não exportados corretamente no index.ts
- Falta padronização

### Acessibilidade Incompleta

- Vários componentes sem ARIA completo (conforme ACCESSIBILITY_AUDIT.md)
- Keyboard navigation incompleta em alguns componentes
- Focus management pode ser melhorado

### Storybook

- Falta documentação MDX para componentes complexos
- Addons podem ser expandidos
- Stories podem ter mais exemplos de uso real
- Falta documentação de design tokens no Storybook

## Plano de Ação

### Fase 1: Type Safety e Qualidade de Código

#### 1.1 Eliminar Uso de `any`

- Refatorar TableActions, TableFilters, TableCell para usar genéricos corretos
- Corrigir Tooltip para não usar `as any`
- Melhorar tipos em Breadcrumb, Dropdown, FormContext
- Adicionar tipos explícitos em todos os componentes

#### 1.2 Remover Console Statements

- Remover todos os `console.log` de stories
- Substituir `console.warn/error` em componentes por sistema de logging ou remover
- Manter apenas logs de desenvolvimento quando necessário (com guards)

#### 1.3 Padronizar Exportações

- Auditar todos os index.ts
- Padronizar para usar `export *` quando possível
- Garantir que todos os componentes estejam exportados
- Documentar padrão de exportação

#### 1.4 Melhorar ESLint Config

- Adicionar regras para proibir `any`
- Adicionar regras para proibir `console.*` em produção
- Adicionar regras de acessibilidade
- Configurar regras de import/export

### Fase 2: Cobertura de Testes

#### 2.1 Criar Testes para Componentes Faltantes

- Avatar / AvatarGroup (testes de fallback, sizes, group)
- Progress (testes de variantes, estados, indeterminate)
- DatePicker (testes de seleção, range, validação)
- Dialog (testes de abertura/fechamento, focus trap, portal)
- Toast (testes de exibição, dismiss, posicionamento)
- Tabs (testes de navegação, keyboard, controlled/uncontrolled)
- InputWithLabel
- SidebarHeader
- Info
- BoxWrapper
- Text

#### 2.2 Melhorar Testes Existentes

- Adicionar testes de acessibilidade em todos os componentes
- Adicionar testes de keyboard navigation
- Adicionar testes de edge cases
- Aumentar cobertura para > 80% em todos os componentes

#### 2.3 Configurar Coverage Reports

- Configurar vitest coverage
- Adicionar threshold mínimo de 80%
- Integrar no CI/CD

### Fase 3: Acessibilidade Completa

#### 3.1 Implementar Melhorias de Acessibilidade

- Completar ARIA attributes em todos os componentes (conforme ACCESSIBILITY_AUDIT.md)
- Implementar keyboard navigation completa
- Melhorar focus management
- Adicionar `aria-live` regions onde necessário
- Validar contraste de cores (WCAG AA)

#### 3.2 Testes de Acessibilidade

- Adicionar testes com @testing-library/jest-dom
- Integrar @storybook/addon-a11y em todas as stories
- Configurar a11y checks no CI/CD

### Fase 4: Storybook Avançado

#### 4.1 Melhorar Documentação

- Criar documentação MDX para componentes complexos (Table, Form, Dialog, DatePicker)
- Adicionar guias de uso e exemplos reais
- Documentar design tokens no Storybook
- Criar página de "Getting Started"

#### 4.2 Expandir Addons

- Configurar @storybook/addon-viewport para testar responsividade
- Adicionar @storybook/addon-actions para log de ações
- Melhorar uso de @storybook/addon-a11y
- Adicionar @storybook/addon-controls para todas as props
- Considerar @storybook/addon-design-tokens

#### 4.3 Melhorar Stories

- Adicionar stories de composição (componentes trabalhando juntos)
- Criar stories de use cases reais
- Adicionar stories de acessibilidade para todos os componentes interativos
- Adicionar stories de estados de erro/loading onde aplicável
- Melhorar descrições e documentação de props

#### 4.4 Configuração Avançada

- Configurar theming do Storybook
- Adicionar toolbar customizado
- Configurar backgrounds e viewports
- Melhorar organização de categorias

### Fase 5: Consistência e Padrões

#### 5.1 Padronizar Componentes

- Revisar todos os componentes para seguir padrões estabelecidos
- Garantir uso consistente de design tokens
- Padronizar estrutura de arquivos
- Garantir que todos os componentes tenham JSDoc

#### 5.2 Melhorar Error Handling

- Padronizar tratamento de erros
- Adicionar error boundaries onde necessário
- Melhorar mensagens de erro

#### 5.3 Performance

- Auditar bundle size
- Identificar oportunidades de code splitting
- Otimizar imports
- Verificar tree-shaking

### Fase 6: Documentação e Guias

#### 6.1 Documentação Técnica

- Atualizar README com informações completas
- Criar guia de contribuição
- Documentar padrões de código
- Criar guia de migração

#### 6.2 Documentação de Design

- Documentar design tokens
- Criar guia de uso de componentes
- Documentar padrões de design
- Criar exemplos de composição

## Arquivos Principais a Modificar

### Type Safety

- `src/ui/organisms/Table/TableActions.tsx`
- `src/ui/organisms/Table/TableFilters.tsx`
- `src/ui/organisms/Table/TableCell.tsx`
- `src/ui/organisms/Table/TableTypes.ts`
- `src/ui/atoms/Tooltip/Tooltip.tsx`
- `src/ui/molecules/Breadcrumb/Breadcrumb.tsx`
- `src/ui/molecules/Dropdown/Dropdown.tsx`
- `src/ui/molecules/Form/FormContext.tsx`

### Testes

- Criar: `src/ui/atoms/Avatar/Avatar.test.tsx`
- Criar: `src/ui/atoms/Progress/Progress.test.tsx`
- Criar: `src/ui/molecules/DatePicker/DatePicker.test.tsx`
- Criar: `src/ui/organisms/Dialog/Dialog.test.tsx`
- Criar: `src/ui/organisms/Toast/Toast.test.tsx`
- Criar: `src/ui/molecules/Tabs/Tabs.test.tsx`
- E mais 5 componentes sem testes

### Storybook

- `.storybook/main.ts` - Adicionar addons
- `.storybook/preview.ts` - Melhorar configuração
- Criar: `src/ui/organisms/Table/Table.mdx`
- Criar: `src/ui/molecules/Form/Form.mdx`
- Criar: `src/ui/organisms/Dialog/Dialog.mdx`
- Criar: `src/ui/molecules/DatePicker/DatePicker.mdx`

### Configuração

- `eslint.config.js` - Adicionar regras rigorosas
- `vite.config.ts` - Configurar coverage
- `package.json` - Adicionar scripts de coverage

## Critérios de Sucesso

1. **Type Safety**: Zero uso de `any` (exceto onde absolutamente necessário com justificativa)
2. **Cobertura de Testes**: > 80% em todos os componentes
3. **Acessibilidade**: WCAG 2.1 AA compliance em todos os componentes
4. **Console Statements**: Zero em código de produção
5. **Storybook**: Documentação completa com MDX, addons configurados, stories de qualidade
6. **Consistência**: Todos os componentes seguem padrões estabelecidos
7. **Documentação**: README e guias completos e atualizados

## Priorização

### Prioridade Crítica (Fazer Primeiro)

1. Eliminar `any` e melhorar type safety
2. Remover console statements
3. Criar testes para componentes críticos (Dialog, Toast, DatePicker, Tabs)
4. Melhorar acessibilidade em componentes interativos

### Prioridade Alta

1. Completar cobertura de testes para todos os componentes
2. Melhorar Storybook com MDX e addons
3. Padronizar exportações
4. Melhorar ESLint config

### Prioridade Média

1. Documentação MDX para componentes complexos
2. Stories de composição e use cases
3. Performance audit
4. Guias de uso

### Prioridade Baixa

1. Theming do Storybook
2. Toolbar customizado
3. Guias de migração detalhados