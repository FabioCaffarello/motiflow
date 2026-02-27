# Plano de Integração e Evolução do Design System

## Contexto

O Motiflow possui um design system React (`react-design-system`) que:

- É um **git submodule** no repositório
- Está **publicado no npm** como `@fabio.caffarello/react-design-system`
- Segue **Atomic Design** (Atoms, Molecules, Organisms)
- Usa **Storybook** para documentação
- Tem **Plop** para geração de componentes

**Objetivo**: Integrar o design system no Motiflow Dashboard e estabelecer um processo para evoluir componentes.

## Estratégia de Integração

### 1. Desenvolvimento Local vs Produção

**Durante Desenvolvimento**:

- Usar o **submodule** diretamente (link local) para desenvolvimento rápido
- Permite editar componentes e ver mudanças imediatamente
- Não precisa publicar no npm a cada mudança

**Em Produção/CI**:

- Usar o **pacote npm** publicado
- Versão estável e testada
- Melhor para builds reproduzíveis

### 2. Configuração de Workspace

#### Opção A: npm workspaces (Recomendado)

```json
// package.json (raiz)
{
  "name": "motiflow",
  "workspaces": [
    "web/*",
    "react-design-system"
  ]
}
```

**Vantagens**:

- Gerenciamento unificado de dependências
- Link automático entre workspaces
- Fácil de configurar

#### Opção B: link simbólico (Alternativa)

```bash
cd web/motiflow-dashboard
npm link ../../react-design-system
```

**Vantagens**:

- Mais controle manual
- Funciona com qualquer gerenciador de pacotes

### 3. Estrutura de Diretórios

```
motiflow/
├── react-design-system/          # Submodule (código fonte)
│   ├── src/ui/
│   │   ├── atoms/
│   │   ├── molecules/
│   │   └── organisms/
│   └── package.json
│
├── web/
│   └── motiflow-dashboard/
│       ├── package.json          # Usa design system
│       └── src/
│           └── presentation/     # Componentes específicos do app
│
└── package.json                  # Workspace root (opcional)
```

## Processo de Evolução de Componentes

### 1. Planejamento no Backlog

Quando precisamos evoluir o design system, criamos itens no backlog do Motiflow:

**Epic**: "Evoluir Design System - [Nome do Componente]"

- **Story**: "Como desenvolvedor, quero [componente] com [funcionalidade] para [objetivo]"
  - **Task**: Criar componente base
  - **Task**: Adicionar variantes
  - **Task**: Escrever Storybook stories
  - **Task**: Adicionar testes
  - **Task**: Documentar uso
  - **Task**: Publicar no npm

### 2. Workflow de Desenvolvimento

```
1. Criar Epic/Story/Task no Motiflow Dashboard
   ↓
2. Desenvolver componente no react-design-system (submodule)
   ↓
3. Testar localmente no motiflow-dashboard
   ↓
4. Documentar no Storybook
   ↓
5. Adicionar testes
   ↓
6. Fazer PR no react-design-system
   ↓
7. Publicar nova versão no npm
   ↓
8. Atualizar dependência no motiflow-dashboard
   ↓
9. Marcar Task/Story como concluída
```

### 3. Estrutura de Componente no Design System

Cada componente deve seguir:

```
src/ui/[atoms|molecules|organisms]/[ComponentName]/
├── ComponentName.tsx          # Componente
├── ComponentName.stories.tsx  # Storybook stories
├── ComponentName.test.tsx     # Testes (opcional)
└── index.ts                   # Export (opcional)
```

**Template gerado por Plop**:

```bash
cd react-design-system
npm run plop
```

## Integração no Motiflow Dashboard

### 1. Instalação

**Desenvolvimento** (usando workspace):

```json
// web/motiflow-dashboard/package.json
{
  "dependencies": {
    "@fabio.caffarello/react-design-system": "workspace:*"
  }
}
```

**Produção** (usando npm):

```json
{
  "dependencies": {
    "@fabio.caffarello/react-design-system": "^1.0.0"
  }
}
```

### 2. Uso nos Componentes

```typescript
// app/(dashboard)/epics/new/page.tsx
import { Button, Input, Info } from '@fabio.caffarello/react-design-system';

export default function NewEpicPage() {
  return (
    <form>
      <Input name="title" />
      <Button variant="regular">Create</Button>
    </form>
  );
}
```

### 3. Camada de Apresentação

Na **Arquitetura Hexagonal**, o design system fica na camada de **Presentation**:

```
src/
├── core/                    # Domain + Application
├── adapters/
│   ├── driving/
│   │   └── actions/         # Server Actions
│   └── driven/              # Persistence, Events
└── presentation/            # 🆕 Componentes UI
    ├── components/          # Componentes específicos do app
    │   ├── EpicCard.tsx
    │   ├── StoryList.tsx
    │   └── TaskForm.tsx
    └── layouts/              # Layouts
        └── DashboardLayout.tsx
```

**Componentes do Design System** são usados diretamente ou como base para componentes específicos.

## Processo de Planejamento

### 1. Identificar Necessidade

Quando precisamos de um novo componente ou evolução:

1. **Criar Epic** no Motiflow Dashboard:

   - Título: "Evoluir Design System - [Componente]"
   - Descrição: Objetivo e contexto
   - Status: DRAFT

2. **Criar Stories**:

   - "Como desenvolvedor, quero [componente] para [uso]"
   - Incluir Acceptance Criteria:
     - Componente deve ter [variantes]
     - Deve ser acessível
     - Deve ter Storybook stories
     - Deve ter testes

3. **Criar Tasks**:

   - Implementação
   - Documentação
   - Testes
   - Publicação

### 2. Desenvolvimento

1. **Criar branch** no react-design-system
2. **Desenvolver componente** usando Plop
3. **Testar localmente** no motiflow-dashboard
4. **Documentar** no Storybook
5. **Adicionar testes**
6. **Fazer PR** e revisar

### 3. Publicação

1. **Merge** no react-design-system
2. **Publicar** no npm:
   ```bash
   cd react-design-system
   npm version patch|minor|major
   npm publish
   ```

3. **Atualizar** dependência no motiflow-dashboard
4. **Marcar** Tasks/Stories como concluídas

## Componentes Prioritários para Evolução

### Fase 1: Componentes Básicos

1. **Card** (Molecule)

   - Para exibir Epics, Stories, Tasks
   - Variantes: default, hover, selected

2. **Badge** (Atom)

   - Para status (DRAFT, IN_PROGRESS, etc.)
   - Para prioridade (LOW, MEDIUM, HIGH, CRITICAL)

3. **Modal/Dialog** (Organism)

   - Para confirmações
   - Para formulários

### Fase 2: Componentes de Formulário

4. **Select** (Atom)

   - Para dropdowns (status, priority)

5. **Textarea** (Atom)

   - Para descrições

6. **Form** (Molecule)

   - Wrapper para formulários
   - Validação visual

### Fase 3: Componentes de Lista

7. **Table** (Organism)

   - Para listagens (Epics, Stories, Tasks)
   - Com sorting e paginação

8. **List** (Molecule)

   - Para listas simples

## Estrutura de Arquivos Proposta

### Motiflow Dashboard

```
web/motiflow-dashboard/
├── src/
│   ├── core/                    # (existente)
│   ├── adapters/                # (existente)
│   └── presentation/            # 🆕 Nova camada
│       ├── components/
│       │   ├── epic/
│       │   │   ├── EpicCard.tsx
│       │   │   ├── EpicList.tsx
│       │   │   └── EpicForm.tsx
│       │   ├── story/
│       │   │   ├── StoryCard.tsx
│       │   │   └── StoryForm.tsx
│       │   └── task/
│       │       ├── TaskCard.tsx
│       │       └── TaskForm.tsx
│       └── layouts/
│           └── DashboardLayout.tsx
│
└── app/                         # Next.js App Router
    └── (dashboard)/
        └── ...
```

### React Design System

```
react-design-system/
├── src/
│   └── ui/
│       ├── atoms/
│       │   ├── Button/          # ✅ Existente
│       │   ├── Input/           # ✅ Existente
│       │   ├── Text/            # ✅ Existente
│       │   ├── Badge/           # 🆕 A criar
│       │   ├── Card/            # 🆕 A criar
│       │   └── Select/          # 🆕 A criar
│       ├── molecules/
│       │   ├── InputWithLabel/   # ✅ Existente
│       │   ├── Form/            # 🆕 A criar
│       │   └── List/            # 🆕 A criar
│       └── organisms/
│           ├── LoginBox/        # ✅ Existente
│           ├── Modal/           # 🆕 A criar
│           └── Table/           # 🆕 A criar
```

## Configuração Técnica

### 1. Workspace Setup (npm workspaces)

```json
// package.json (raiz do motiflow)
{
  "name": "motiflow",
  "private": true,
  "workspaces": [
    "web/*",
    "react-design-system"
  ],
  "scripts": {
    "dev:design-system": "cd react-design-system && npm run dev",
    "dev:dashboard": "cd web/motiflow-dashboard && npm run dev",
    "build:design-system": "cd react-design-system && npm run build",
    "storybook": "cd react-design-system && npm run storybook"
  }
}
```

### 2. TypeScript Paths

```json
// web/motiflow-dashboard/tsconfig.json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"],
      "@design-system/*": ["../../react-design-system/src/*"]
    }
  }
}
```

### 3. TailwindCSS

O design system usa TailwindCSS. Precisamos garantir compatibilidade:

```js
// web/motiflow-dashboard/tailwind.config.js
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx}',
    './src/**/*.{js,ts,jsx,tsx}',
    '../../react-design-system/src/**/*.{js,ts,jsx,tsx}', // Incluir design system
  ],
  // ... resto da config
}
```

## Processo de Desenvolvimento de Componente

### Exemplo: Criar Componente Badge

1. **Planejamento** (Motiflow Dashboard):

   - Criar Epic: "Evoluir Design System - Badge Component"
   - Criar Story: "Como desenvolvedor, quero um componente Badge para exibir status e prioridade"
   - Acceptance Criteria:
     - Badge deve ter variantes (success, warning, error, info)
     - Deve ser acessível (ARIA labels)
     - Deve ter Storybook stories
     - Deve ter testes

2. **Desenvolvimento** (react-design-system):
   ```bash
   cd react-design-system
   npm run plop
   # Selecionar: Atom > Badge
   ```

3. **Implementação**:
   ```typescript
   // react-design-system/src/ui/atoms/Badge/Badge.tsx
   interface Props {
     variant?: 'success' | 'warning' | 'error' | 'info';
     children: React.ReactNode;
   }
   ```

4. **Teste Local**:
   ```typescript
   // web/motiflow-dashboard/src/presentation/components/epic/EpicCard.tsx
   import { Badge } from '@fabio.caffarello/react-design-system';
   
   <Badge variant="success">{epic.status}</Badge>
   ```

5. **Documentação**:

   - Adicionar Storybook story
   - Documentar props e variantes

6. **Publicação**:
   ```bash
   cd react-design-system
   npm version patch
   npm publish
   ```

7. **Atualização**:
   ```bash
   cd web/motiflow-dashboard
   npm install @fabio.caffarello/react-design-system@latest
   ```


## Benefícios

1. **Reutilização**: Componentes compartilhados entre projetos
2. **Consistência**: UI consistente em toda aplicação
3. **Rapidez**: Desenvolvimento mais rápido com componentes prontos
4. **Documentação**: Storybook como documentação viva
5. **Testes**: Componentes testados isoladamente
6. **Evolução**: Processo claro para evoluir componentes

## Considerações

### Versionamento

- Usar **Semantic Versioning** (MAJOR.MINOR.PATCH)
- **PATCH**: Correções de bugs
- **MINOR**: Novos componentes ou features (backward compatible)
- **MAJOR**: Breaking changes

### Breaking Changes

Quando houver breaking changes:

1. Criar Epic no Motiflow Dashboard
2. Documentar mudanças necessárias
3. Criar Tasks para migração
4. Publicar versão MAJOR

### Dependências

- Design System deve ter **peerDependencies** mínimas
- Evitar dependências pesadas
- Usar TailwindCSS para estilização (já usado)

## Próximos Passos

1. ✅ Configurar workspace (npm workspaces)
2. ✅ Instalar design system no motiflow-dashboard
3. ✅ Criar estrutura `src/presentation/`
4. ✅ Migrar componentes existentes para usar design system
5. ✅ Criar Epic para primeiro componente novo (Badge)
6. ✅ Desenvolver e publicar Badge
7. ✅ Documentar processo completo

## Referências

- [npm workspaces](https://docs.npmjs.com/cli/v7/using-npm/workspaces)
- [Atomic Design](https://bradfrost.com/blog/post/atomic-web-design/)
- [Storybook](https://storybook.js.org/)
- [Plop](https://plopjs.com/)