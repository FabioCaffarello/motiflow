# Plano de Evolução - Status Atual e Próximos Passos

## 📊 Status Atual (v1.3.2)

### ✅ Design System - Componentes Criados

#### Atoms
- ✅ Button
- ✅ Input
- ✅ Text
- ✅ Badge
- ✅ Label
- ✅ ErrorMessage
- ✅ NavLink
- ✅ Select
- ✅ Textarea
- ✅ Info

#### Molecules
- ✅ Card
- ✅ Form
- ✅ Breadcrumb
- ✅ Pagination
- ✅ InputWithLabel

#### Organisms
- ✅ Modal
- ✅ Table
- ✅ LoginBox

### ✅ Dashboard - Integrações Concluídas

#### Formulários
- ✅ **EpicForm** - Criado e integrado em `/epics/new`
- ✅ Validação com Server Actions funcionando
- ✅ Feedback visual de erro

#### Navegação
- ✅ **DashboardNav** - Criado e integrado no layout
- ✅ Breadcrumb em `/epics/new` e `/epics/[id]`
- ✅ Detecção automática de página ativa

#### Componentes Migrados
- ✅ EpicCard, StoryCard, TaskCard → Card
- ✅ Todos os botões → Button
- ✅ Textos → Text
- ✅ ConfirmDialog criado (pronto para uso)

#### Páginas Migradas
- ✅ `/` (Dashboard) - Card, Button, Text
- ✅ `/epics` - Button, Text
- ✅ `/epics/new` - EpicForm, Breadcrumb
- ✅ `/epics/[id]` - Breadcrumb, Badge, Text
- ✅ `/stories` - Button, Text
- ✅ `/tasks` - Button, Text

## 🎯 Próximos Passos - Prioridades

### Fase 1: Completar Formulários (Alta Prioridade)

#### 1. StoryForm Component
**Objetivo**: Criar formulário para Stories usando componentes do design system

**Tasks**:
- [ ] Criar `StoryForm.tsx` em `src/presentation/components/story/`
- [ ] Usar Form, Input, Textarea, Select, Label, Button do design system
- [ ] Integrar com Server Actions
- [ ] Adicionar validação
- [ ] Criar página `/stories/new` usando StoryForm
- [ ] Adicionar Breadcrumb na página

**Estimativa**: 2-3 horas

#### 2. TaskForm Component
**Objetivo**: Criar formulário para Tasks usando componentes do design system

**Tasks**:
- [ ] Criar `TaskForm.tsx` em `src/presentation/components/task/`
- [ ] Usar Form, Input, Textarea, Select, Label, Button do design system
- [ ] Integrar com Server Actions
- [ ] Adicionar validação
- [ ] Criar página `/tasks/new` usando TaskForm
- [ ] Adicionar Breadcrumb na página

**Estimativa**: 2-3 horas

#### 3. Páginas de Edição
**Objetivo**: Criar páginas de edição para Epics, Stories e Tasks

**Tasks**:
- [ ] Criar `/epics/[id]/edit` usando EpicForm
- [ ] Criar `/stories/[id]/edit` usando StoryForm
- [ ] Criar `/tasks/[id]/edit` usando TaskForm
- [ ] Adicionar Breadcrumb em todas as páginas
- [ ] Implementar Server Actions para atualização

**Estimativa**: 4-5 horas

### Fase 2: Melhorar Listagens (Média Prioridade)

#### 4. Usar Table Component
**Objetivo**: Migrar listagens para usar o componente Table do design system

**Tasks**:
- [ ] Avaliar onde Table seria útil (Epics, Stories, Tasks)
- [ ] Criar componente wrapper se necessário
- [ ] Migrar listagem de Epics para Table (opcional)
- [ ] Migrar listagem de Stories para Table (opcional)
- [ ] Migrar listagem de Tasks para Table (opcional)
- [ ] Adicionar sorting e filtros

**Estimativa**: 3-4 horas

#### 5. Adicionar Pagination
**Objetivo**: Implementar paginação nas listagens

**Tasks**:
- [ ] Adicionar lógica de paginação no backend
- [ ] Integrar componente Pagination do design system
- [ ] Adicionar em `/epics` (se necessário)
- [ ] Adicionar em `/stories` (se necessário)
- [ ] Adicionar em `/tasks` (se necessário)

**Estimativa**: 2-3 horas

### Fase 3: Funcionalidades Avançadas (Baixa Prioridade)

#### 6. Usar ConfirmDialog para Exclusões
**Objetivo**: Implementar confirmação de exclusão usando Modal

**Tasks**:
- [ ] Adicionar botão de exclusão em EpicCard
- [ ] Adicionar botão de exclusão em StoryCard
- [ ] Adicionar botão de exclusão em TaskCard
- [ ] Integrar ConfirmDialog
- [ ] Criar Server Actions para exclusão
- [ ] Adicionar feedback de sucesso/erro

**Estimativa**: 2-3 horas

#### 7. EmptyState Component
**Objetivo**: Criar componente EmptyState no design system

**Tasks**:
- [ ] Criar EmptyState no design system (Atom ou Molecule)
- [ ] Adicionar Storybook stories
- [ ] Adicionar testes
- [ ] Publicar no npm
- [ ] Usar em páginas vazias do dashboard

**Estimativa**: 2-3 horas

## 📋 Roadmap Visual

```
Fase 1: Formulários (1-2 semanas)
├── StoryForm ✅
├── TaskForm ✅
└── Páginas de Edição ✅

Fase 2: Listagens (1 semana)
├── Table Component (opcional)
└── Pagination

Fase 3: Funcionalidades (1 semana)
├── ConfirmDialog para exclusões
└── EmptyState component
```

## 🎨 Design System - Próximos Componentes

### Componentes Potenciais para Futuro

1. **Dropdown** (Molecule)
   - Menu dropdown reutilizável
   - Para ações em cards (edit, delete, etc.)

2. **Tooltip** (Atom)
   - Tooltips informativos
   - Acessibilidade completa

3. **Skeleton** (Atom)
   - Loading states
   - Placeholder durante carregamento

4. **Tabs** (Molecule)
   - Navegação por abas
   - Para organizar conteúdo

5. **Accordion** (Molecule)
   - Conteúdo expansível
   - Para FAQs ou detalhes

## 📝 Processo de Trabalho

### Para cada nova feature:

1. **Criar Epic/Story no Dashboard** (se aplicável)
2. **Desenvolver componente** no design system (se necessário)
3. **Testar localmente** no dashboard
4. **Publicar no npm** (se novo componente)
5. **Integrar no dashboard**
6. **Documentar** mudanças
7. **Marcar como concluído**

## 🔄 Versionamento

- **v1.3.2** (atual) - Correções de 'use client'
- **v1.4.0** (próxima) - EmptyState, melhorias
- **v2.0.0** (futuro) - Breaking changes se necessário

## 📚 Documentação

- ✅ Design System: Storybook disponível
- ✅ Dashboard: Componentes documentados inline
- ⏳ Guia de migração: A criar quando necessário
