# Presentation Layer

Esta camada contém componentes específicos do Motiflow Dashboard que utilizam o design system como base.

## Estrutura

```
src/presentation/
├── components/
│   ├── epic/
│   │   └── EpicCard.tsx      # Card para exibir Epics
│   ├── story/
│   │   └── StoryCard.tsx     # Card para exibir Stories
│   ├── task/
│   │   └── TaskCard.tsx      # Card para exibir Tasks
│   ├── design-system-example.tsx  # Exemplo de uso
│   └── index.ts              # Exports
└── index.ts                  # Exports principais
```

## Princípios

1. **Reutilização**: Componentes do design system são a base
2. **Especificidade**: Componentes aqui são específicos do Motiflow Dashboard
3. **Composição**: Componentes maiores são compostos de componentes menores
4. **Consistência**: Seguir padrões do design system

## Uso

```typescript
import { EpicCard, StoryCard, TaskCard } from '@/presentation/components';

// Em uma página
<EpicCard epic={epicDto} />
```

## Componentes Disponíveis

### EpicCard
Exibe um Epic com título, descrição, status, prioridade e link para detalhes.

**Props:**
- `epic: EpicDto` - Dados do Epic

### StoryCard
Exibe uma User Story com formato "As a... I want... So that...", story points, status e prioridade.

**Props:**
- `story: StoryDto` - Dados da Story

### TaskCard
Exibe uma Task com título, descrição, status, prioridade, estimate e assignee.

**Props:**
- `task: TaskDto` - Dados da Task

## Próximos Componentes

- `EpicForm` - Formulário para criar/editar Epics
- `StoryForm` - Formulário para criar/editar Stories
- `TaskForm` - Formulário para criar/editar Tasks
- `StatusBadge` - Badge para status (quando Badge estiver no design system)
- `PriorityBadge` - Badge para prioridade
