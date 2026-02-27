# Plano Rigoroso de Revisão e Evolução dos Atoms

## Visão Geral

Plano abrangente e rigoroso para revisar, evoluir e padronizar todos os 27 componentes atoms do design system, aplicando design patterns de classe mundial, princípios SOLID, e estruturando um design system de excelência.

## Objetivos

1. **Padronização Rigorosa**: Aplicar padrões consistentes em todos os componentes
2. **Design Patterns**: Implementar patterns apropriados para cada tipo de componente
3. **Arquitetura Sólida**: Seguir princípios SOLID e boas práticas de engenharia
4. **API Design**: Criar APIs intuitivas, type-safe e flexíveis
5. **Acessibilidade**: Garantir WCAG 2.1 AA em todos os componentes
6. **Performance**: Otimizar renderização e bundle size
7. **Documentação**: Storybook completo e exemplos práticos

## Componentes a Revisar (27 total)

1. Accordion
2. Avatar (+ AvatarGroup)
3. Badge
4. BoxWrapper
5. Button
6. Checkbox
7. Chip
8. Collapsible
9. Drawer (+ subcomponentes)
10. ErrorMessage
11. Info
12. Input
13. Label
14. Menu (+ subcomponentes)
15. NavLink
16. Popover
17. Progress
18. Radio
19. Select
20. Separator
21. Skeleton
22. Slider
23. Spinner
24. Switch
25. Text
26. Textarea
27. Tooltip

---

## Revisão de Categorização (Atomic Design)

### Objetivo

Revisar rigorosamente se todos os componentes em `atoms/` realmente pertencem a essa categoria segundo os princípios do Atomic Design, identificando:

1. **Componentes mal categorizados**: Devem estar em `molecules/` ou `organisms/`
2. **Componentes redundantes**: Duplicam funcionalidade de outros componentes
3. **Componentes desnecessários**: Não agregam valor ou podem ser substituídos por composição

### Critérios para Atoms

Um componente é um **Atom** se:

- ✅ **Indivisível**: Não pode ser quebrado em componentes menores do design system
- ✅ **Sem dependências de outros componentes do design system**: Não importa outros atoms/molecules/organisms
- ✅ **Funcionalidade única e simples**: Faz apenas uma coisa bem definida
- ✅ **Reutilizável em múltiplos contextos**: Pode ser usado em qualquer lugar
- ✅ **Sem lógica de negócio**: Apenas apresentação e interação básica
- ✅ **Não compõe outros componentes do design system**: É usado por molecules/organisms, não os compõe

### Critérios para Molecules

Um componente é uma **Molecule** se:

- 🔄 **Combina múltiplos atoms**: Usa 2+ atoms do design system
- 🔄 **Tem responsabilidade específica**: Resolve um problema de UI específico
- 🔄 **Pode ter lógica de composição**: Gerencia interação entre atoms

### Critérios para Organisms

Um componente é um **Organism** se:

- 🔄 **Combina molecules e atoms**: Usa molecules ou múltiplos atoms complexos
- 🔄 **Tem lógica de negócio ou estado complexo**: Gerencia estado significativo
- 🔄 **É uma feature completa**: Representa uma funcionalidade completa da UI

### Componentes Suspeitos para Revisão

#### 1. NavLink ⚠️

**Análise**:

- Tem lógica de estado (active, disabled)
- Combina estilos específicos de navegação
- Pode ser considerado uma molecule (combina Button/Link + estados de navegação)
- **Decisão necessária**: Manter como atom ou mover para molecules?

**Argumentos para manter como Atom**:

- É um link básico com variantes
- Não compõe outros componentes do design system
- Funcionalidade simples (apenas estilização de link)

**Argumentos para mover para Molecules**:

- Tem lógica específica de navegação (active state)
- Combina comportamento de link com estados visuais
- Pode ser considerado uma composição de Link + Badge/Indicator

**Recomendação**: Avaliar se pode ser substituído por composição `Button` ou `Link` com props, ou mover para molecules se a lógica de navegação for específica demais.

#### 2. BoxWrapper ⚠️

**Análise**:

- É um container genérico
- Pode ser redundante (já existe `div` nativo)
- Não tem funcionalidade específica além de estilização
- **Decisão necessária**: Manter, remover ou simplificar?

**Argumentos para manter**:

- Fornece estilização consistente
- Pode ter props úteis (padding, margin, etc.)

**Argumentos para remover**:

- Redundante com `div` + `className`
- Pode ser substituído por composição
- Adiciona complexidade desnecessária

**Recomendação**: Avaliar uso real. Se apenas fornece estilização básica, considerar remover e usar `div` com tokens diretamente.

#### 3. Info ⚠️

**Análise**:

- Componente de informação contextual
- Pode ser redundante com Tooltip ou Badge
- **Decisão necessária**: Manter ou consolidar com outros componentes?

**Argumentos para manter**:

- Pode ter propósito específico diferente de Tooltip/Badge

**Argumentos para remover/consolidar**:

- Pode ser substituído por Badge ou Tooltip
- Redundância com outros componentes

**Recomendação**: Verificar diferença real com Tooltip e Badge. Se for apenas estilização diferente, considerar consolidar.

#### 4. ErrorMessage ⚠️

**Análise**:

- Componente específico para mensagens de erro
- Pode ser considerado uma molecule (combina Text + estilos de erro)
- **Decisão necessária**: Manter como atom ou mover para molecules?

**Argumentos para manter como Atom**:

- É um componente básico de texto com variante de erro
- Funcionalidade simples

**Argumentos para mover para Molecules**:

- Combina Text com lógica de erro
- Pode incluir ícone (composição)

**Recomendação**: Se apenas estiliza Text, manter como atom. Se combina Text + Icon, considerar molecule.

#### 5. Drawer ⚠️

**Análise**:

- Componente complexo com múltiplos sub-componentes
- Tem lógica de estado e animação
- Usa Compound Components pattern
- **Decisão necessária**: Manter como atom ou mover para organisms?

**Argumentos para manter como Atom**:

- É um componente base de UI
- Pode ser usado em múltiplos contextos

**Argumentos para mover para Organisms**:

- Muito complexo (múltiplos sub-componentes)
- Lógica de estado e animação significativa
- Compound Components pattern indica complexidade

**Recomendação**: Avaliar complexidade. Se for muito complexo, considerar mover para organisms. Se for base reutilizável, manter como atom.

#### 6. Menu ⚠️

**Análise**:

- Similar ao Drawer
- Componente complexo com Compound Components
- **Decisão necessária**: Manter como atom ou mover para organisms?

**Recomendação**: Mesma análise do Drawer.

#### 7. Accordion ⚠️

**Análise**:

- Componente expansível com múltiplos itens
- Pode ter lógica complexa
- **Decisão necessária**: Manter como atom ou mover?

**Recomendação**: Avaliar complexidade. Se for simples (apenas expand/collapse), manter. Se tiver múltiplos itens e lógica complexa, considerar molecule.

### Processo de Decisão

Para cada componente suspeito:

1. **Análise de Uso**:

                                                                                                                                                                                                - [ ] Verificar onde e como é usado no codebase
                                                                                                                                                                                                - [ ] Contar dependências (quantos lugares usam)
                                                                                                                                                                                                - [ ] Verificar se é usado por molecules/organisms

2. **Análise de Complexidade**:

                                                                                                                                                                                                - [ ] Contar sub-componentes
                                                                                                                                                                                                - [ ] Avaliar lógica de estado
                                                                                                                                                                                                - [ ] Verificar dependências de outros componentes do design system

3. **Análise de Redundância**:

                                                                                                                                                                                                - [ ] Comparar com outros componentes similares
                                                                                                                                                                                                - [ ] Verificar se pode ser substituído por composição
                                                                                                                                                                                                - [ ] Avaliar se adiciona valor único

4. **Decisão**:

                                                                                                                                                                                                - [ ] **Manter como Atom**: Se atende todos os critérios
                                                                                                                                                                                                - [ ] **Mover para Molecules**: Se combina atoms ou tem lógica específica
                                                                                                                                                                                                - [ ] **Mover para Organisms**: Se é muito complexo
                                                                                                                                                                                                - [ ] **Remover**: Se é redundante ou desnecessário
                                                                                                                                                                                                - [ ] **Consolidar**: Se pode ser mesclado com outro componente

5. **Plano de Migração** (se necessário):

                                                                                                                                                                                                - [ ] Criar migration guide
                                                                                                                                                                                                - [ ] Atualizar exports
                                                                                                                                                                                                - [ ] Atualizar documentação
                                                                                                                                                                                                - [ ] Deprecar versão antiga (se mover)
                                                                                                                                                                                                - [ ] Atualizar todos os usos

### Checklist de Revisão por Componente

Para cada componente em `atoms/`:

- [ ] É indivisível? (não pode ser quebrado em componentes menores do design system)
- [ ] Não depende de outros componentes do design system?
- [ ] Tem funcionalidade única e simples?
- [ ] É reutilizável em múltiplos contextos?
- [ ] Não tem lógica de negócio complexa?
- [ ] Não compõe outros componentes do design system?
- [ ] Não é redundante com outros componentes?
- [ ] Adiciona valor único ao design system?

**Se alguma resposta for "Não"**: Avaliar mover para molecules/organisms, remover ou consolidar.

### Resultado Esperado

Após a revisão:

1. **Lista de componentes para manter** em atoms
2. **Lista de componentes para mover** (com destino: molecules ou organisms)
3. **Lista de componentes para remover** (redundantes ou desnecessários)
4. **Lista de componentes para consolidar** (mesclar com outros)
5. **Plano de migração** para cada mudança
6. **Documentação atualizada** refletindo as mudanças

---

## Design Patterns a Aplicar

### 1. Compound Components Pattern

**Quando usar**: Componentes com múltiplas partes relacionadas (Menu, Drawer, Accordion)

**Estrutura padrão**:

```typescript
// Componente principal
function Component({ children, ...props }: ComponentProps) {
  return (
    <ComponentProvider value={contextValue}>
      {children}
    </ComponentProvider>
  );
}

// Sub-componentes
Component.SubComponent = SubComponent;
Component.AnotherSub = AnotherSub;

// Export
export default Component;
```

**Checklist**:

- [ ] Context API para compartilhar estado entre sub-componentes
- [ ] Hook customizado `useComponentContext()` com validação
- [ ] Sub-componentes validam se estão dentro do contexto
- [ ] TypeScript types para cada sub-componente
- [ ] Exemplos de uso no Storybook

**Componentes que devem usar**:

- Menu (✅ já usa)
- Drawer (✅ já usa)
- Accordion (verificar se precisa)
- Popover (verificar se precisa)

### 2. Controlled/Uncontrolled Pattern

**Quando usar**: Componentes com estado interno (Input, Select, Checkbox, Switch, etc.)

**Estrutura padrão**:

```typescript
interface ComponentProps {
  value?: string;           // Controlled
  defaultValue?: string;    // Uncontrolled
  onChange?: (value: string) => void;
  // ... outras props
}

function Component({ value, defaultValue, onChange, ...props }: ComponentProps) {
  const isControlled = value !== undefined;
  const [internalValue, setInternalValue] = useState(defaultValue);
  
  const currentValue = isControlled ? value : internalValue;
  
  const handleChange = (newValue: string) => {
    if (!isControlled) {
      setInternalValue(newValue);
    }
    onChange?.(newValue);
  };
  
  // ... implementação
}
```

**Checklist**:

- [ ] Suporta modo controlled e uncontrolled
- [ ] Detecta automaticamente o modo baseado em props
- [ ] Validação: não permite `value` e `defaultValue` simultaneamente
- [ ] TypeScript types diferenciam os modos quando possível
- [ ] Documentação clara sobre quando usar cada modo
- [ ] Exemplos no Storybook para ambos os modos

**Componentes que devem usar**:

- Input (✅ já usa)
- Select (verificar)
- Textarea (verificar)
- Checkbox (verificar)
- Radio (verificar)
- Switch (verificar)
- Slider (verificar)

### 3. Context API Pattern

**Quando usar**: Compartilhar estado entre componentes relacionados

**Estrutura padrão**:

```typescript
// Context
interface ComponentContextValue {
  // estado compartilhado
}

const ComponentContext = createContext<ComponentContextValue | undefined>(undefined);

// Provider
export function ComponentProvider({ children, value }: ProviderProps) {
  return (
    <ComponentContext.Provider value={value}>
      {children}
    </ComponentContext.Provider>
  );
}

// Hook
export function useComponentContext() {
  const context = useContext(ComponentContext);
  if (!context) {
    throw new Error('Component must be used within ComponentProvider');
  }
  return context;
}
```

**Checklist**:

- [ ] Context tipado com TypeScript
- [ ] Provider separado do componente principal
- [ ] Hook customizado com validação de uso
- [ ] Mensagem de erro clara quando usado fora do contexto
- [ ] Documentação sobre quando usar o hook diretamente

**Componentes que devem usar**:

- Menu (✅ já usa)
- Drawer (✅ já usa)
- Accordion (se usar compound pattern)

### 4. Builder Pattern (para classes CSS)

**Quando usar**: Componentes com muitas combinações de classes (Button, Input)

**Estrutura padrão**:

```typescript
class ComponentClassBuilder {
  private classes: string[] = [];
  
  addBase(): this {
    this.classes.push('base-classes');
    return this;
  }
  
  addVariant(variant: Variant): this {
    this.classes.push(...variantClasses[variant]);
    return this;
  }
  
  addSize(size: Size): this {
    this.classes.push(...sizeClasses[size]);
    return this;
  }
  
  addCustom(className: string): this {
    if (className) this.classes.push(className);
    return this;
  }
  
  build(): string {
    return this.classes.filter(Boolean).join(' ');
  }
}
```

**Checklist**:

- [ ] Builder pattern para construção de classes
- [ ] Métodos retornam `this` para chaining
- [ ] Validação de valores antes de adicionar
- [ ] Filtragem de valores vazios/null
- [ ] Documentação sobre quando usar

**Componentes que devem usar**:

- Button (✅ já usa)
- Input (verificar se precisa)
- Outros componentes com muitas variantes

### 5. Render Props Pattern

**Quando usar**: Componentes que precisam de flexibilidade máxima na renderização

**Estrutura padrão**:

```typescript
interface ComponentProps {
  children?: ReactNode;
  render?: (props: RenderProps) => ReactNode;
  // ou
  children: (props: RenderProps) => ReactNode;
}
```

**Checklist**:

- [ ] Suporta children e render prop
- [ ] TypeScript types para render props
- [ ] Exemplos no Storybook
- [ ] Documentação sobre quando usar

**Componentes que podem usar**:

- Tooltip (verificar se faz sentido)
- Popover (verificar se faz sentido)

### 6. Polymorphic Component Pattern

**Quando usar**: Componentes que podem renderizar como diferentes elementos (Button, NavLink)

**Estrutura padrão**:

```typescript
interface ComponentProps {
  as?: ElementType;
  // ... outras props
}

const Component = forwardRef<HTMLElement, ComponentProps>(
  ({ as: Component = 'div', ...props }, ref) => {
    return <Component ref={ref} {...props} />;
  }
);
```

**Checklist**:

- [ ] Suporta prop `as` para mudar elemento
- [ ] TypeScript types corretos para cada elemento
- [ ] Ref forwarding correto
- [ ] Props filtradas corretamente por elemento
- [ ] Exemplos no Storybook

**Componentes que devem usar**:

- Button (✅ já usa)
- NavLink (verificar)

### 7. Factory Pattern (para Design Tokens)

**Já implementado**: Tokens usam Factory Pattern

**Verificar**:

- [ ] Todos os componentes usam tokens via factory
- [ ] Nenhum valor hardcoded
- [ ] Cores sempre via `getColorClass()`
- [ ] Espaçamentos sempre via `getSpacingClass()`
- [ ] Tipografia sempre via `getTypographyClasses()`

---

## Princípios SOLID Aplicados

### Single Responsibility Principle (SRP)

**Cada componente deve ter uma única responsabilidade clara**

**Checklist**:

- [ ] Componente faz apenas uma coisa bem
- [ ] Lógica complexa extraída para hooks ou utilities
- [ ] Sub-componentes para responsabilidades diferentes
- [ ] Separação clara entre lógica e apresentação

**Exemplos**:

- Button: apenas renderizar botão, lógica de loading em hook separado
- Input: apenas input, validação em hook separado
- Menu: apenas estrutura, lógica de posicionamento em hook

### Open/Closed Principle (OCP)

**Componentes devem ser abertos para extensão, fechados para modificação**

**Checklist**:

- [ ] Props permitem customização sem modificar código
- [ ] `className` sempre suportado
- [ ] Variantes extensíveis via props
- [ ] Composição preferida sobre configuração
- [ ] Slots para conteúdo customizado quando necessário

### Liskov Substitution Principle (LSP)

**Componentes devem ser substituíveis por suas variantes sem quebrar funcionalidade**

**Checklist**:

- [ ] Todas as variantes têm mesma interface base
- [ ] Props funcionam consistentemente entre variantes
- [ ] Comportamento acessível mantido em todas variantes
- [ ] Testes garantem substituição

### Interface Segregation Principle (ISP)

**Interfaces devem ser específicas, não genéricas demais**

**Checklist**:

- [ ] Props agrupadas logicamente
- [ ] Props opcionais quando faz sentido
- [ ] Interfaces separadas para diferentes usos
- [ ] TypeScript types específicos, não `any`

### Dependency Inversion Principle (DIP)

**Componentes devem depender de abstrações, não implementações**

**Checklist**:

- [ ] Dependências injetadas via props quando possível
- [ ] Hooks customizados para lógica reutilizável
- [ ] Context para dependências compartilhadas
- [ ] Não depende de implementações específicas

---

## Padrões de API Design

### 1. Nomenclatura Consistente

**Padrões obrigatórios**:

- Variantes: `variant` (sempre singular)
- Tamanhos: `size` (sempre singular)
- Estados: `disabled`, `error`, `success`, `loading`
- Callbacks: `onXxx` (camelCase, sempre começa com `on`)
- Props booleanas: sem prefixo (`disabled`, não `isDisabled`)

**Checklist**:

- [ ] Nomenclatura consistente em todos componentes
- [ ] Props seguem padrões estabelecidos
- [ ] Types seguem padrões (ex: `ButtonVariant`, não `ButtonVariants`)
- [ ] Documentação sobre convenções

### 2. Props Organization

**Ordem padrão de props**:

1. Children (se aplicável)
2. Variantes e tamanhos (`variant`, `size`)
3. Estados (`disabled`, `error`, `loading`)
4. Conteúdo (`label`, `placeholder`, `helperText`)
5. Callbacks (`onClick`, `onChange`)
6. Acessibilidade (`aria-label`, `aria-describedby`)
7. Customização (`className`, `style`)
8. Props HTML nativas (spread)

**Checklist**:

- [ ] Props organizadas na ordem padrão
- [ ] Props agrupadas logicamente
- [ ] TypeScript interface organizada
- [ ] Documentação reflete organização

### 3. Default Values

**Padrões**:

- `variant`: sempre tem default (geralmente `'primary'` ou `'default'`)
- `size`: sempre tem default (geralmente `'md'`)
- `disabled`: `false`
- Estados booleanos: `false`

**Checklist**:

- [ ] Todos os defaults documentados
- [ ] Defaults fazem sentido para uso comum
- [ ] TypeScript types refletem defaults
- [ ] Storybook mostra comportamento com defaults

### 4. Type Safety

**Padrões**:

- Sempre usar tipos específicos, nunca `any`
- Union types para variantes: `'primary' | 'secondary'`
- Types exportados para uso externo
- Generics quando apropriado

**Checklist**:

- [ ] Zero uso de `any`
- [ ] Types exportados corretamente
- [ ] Union types para valores fixos
- [ ] Generics quando necessário
- [ ] TypeScript strict mode sem erros

---

## Estrutura de Arquivos Padrão

### Estrutura Básica (Componente Simples)

```
ComponentName/
  ├── ComponentName.tsx          # Componente principal
  ├── ComponentName.test.tsx     # Testes
  ├── ComponentName.stories.tsx # Storybook
  └── index.ts                   # Exports
```

### Estrutura com Sub-componentes (Compound)

```
ComponentName/
  ├── ComponentName.tsx          # Componente principal
  ├── ComponentNameContext.tsx   # Context (se necessário)
  ├── ComponentSubComponent.tsx  # Sub-componentes
  ├── ComponentName.test.tsx     # Testes
  ├── ComponentName.stories.tsx # Storybook
  └── index.ts                   # Exports
```

### Estrutura com Utilities

```
ComponentName/
  ├── ComponentName.tsx
  ├── ComponentName.test.tsx
  ├── ComponentName.stories.tsx
  ├── utils.ts                    # Utilities específicas
  ├── types.ts                    # Types compartilhados
  └── index.ts
```

**Checklist por componente**:

- [ ] Estrutura de arquivos segue padrão
- [ ] Nomes de arquivos consistentes
- [ ] Exports organizados no index.ts
- [ ] Types exportados corretamente

---

## Padrões de Código

### 1. Component Structure

````typescript
'use client'; // Se necessário

import { forwardRef } from 'react';
import type { ComponentHTMLAttributes } from 'react';
// ... outros imports

// Types
export type ComponentVariant = 'primary' | 'secondary';
export type ComponentSize = 'sm' | 'md' | 'lg';

export interface ComponentProps 
  extends Omit<ComponentHTMLAttributes<HTMLElement>, 'children'> {
  variant?: ComponentVariant;
  size?: ComponentSize;
  // ... outras props
}

/**
 * ComponentName Component
 * 
 * Descrição clara do componente.
 * 
 * @example
 * ```tsx
 * <ComponentName variant="primary">Content</ComponentName>
 * ```
 */
const ComponentName = forwardRef<HTMLElement, ComponentProps>(
  function ComponentName(
    {
      variant = 'primary',
      size = 'md',
      className = '',
      ...props
    },
    ref
  ) {
    // Implementação
  }
);

ComponentName.displayName = 'ComponentName';

export default ComponentName;
````

**Checklist**:

- [ ] 'use client' quando necessário
- [ ] Imports organizados (React, types, componentes, utils, tokens)
- [ ] Types antes do componente
- [ ] JSDoc completo
- [ ] forwardRef quando necessário
- [ ] displayName definido
- [ ] Default exports

### 2. Hooks Customizados

**Padrão**:

```typescript
export function useComponentState(props: ComponentProps) {
  // Lógica de estado
  return {
    // valores retornados
  };
}
```

**Checklist**:

- [ ] Hooks para lógica complexa
- [ ] Nomes começam com `use`
- [ ] Types para parâmetros e retorno
- [ ] Documentação JSDoc

### 3. Context Pattern

**Padrão**:

```typescript
interface ComponentContextValue {
  // valores do contexto
}

const ComponentContext = createContext<ComponentContextValue | undefined>(undefined);

export function ComponentProvider({ children, value }: ProviderProps) {
  return (
    <ComponentContext.Provider value={value}>
      {children}
    </ComponentContext.Provider>
  );
}

export function useComponentContext() {
  const context = useContext(ComponentContext);
  if (!context) {
    throw new Error('useComponentContext must be used within ComponentProvider');
  }
  return context;
}
```

**Checklist**:

- [ ] Context tipado
- [ ] Provider separado
- [ ] Hook com validação
- [ ] Mensagem de erro clara

---

## Checklist Rigoroso por Componente

### 1. Estrutura e Organização

- [ ] Estrutura de arquivos segue padrão
- [ ] Nomes de arquivos consistentes
- [ ] Exports corretos no index.ts
- [ ] Types exportados publicamente
- [ ] Sem dependências circulares
- [ ] Imports organizados

### 2. Design Patterns

- [ ] Pattern apropriado aplicado (Compound, Controlled/Uncontrolled, etc.)
- [ ] Pattern implementado corretamente
- [ ] Documentação sobre o pattern usado
- [ ] Exemplos no Storybook

### 3. Princípios SOLID

- [ ] Single Responsibility
- [ ] Open/Closed (extensível via props)
- [ ] Liskov Substitution (variantes substituíveis)
- [ ] Interface Segregation (props específicas)
- [ ] Dependency Inversion (dependências injetadas)

### 4. API Design

- [ ] Nomenclatura consistente
- [ ] Props organizadas na ordem padrão
- [ ] Default values apropriados
- [ ] Type safety completo (zero `any`)
- [ ] Types exportados

### 5. Design Tokens

- [ ] Usa `getColorClass()` para cores
- [ ] Usa `getSpacingClass()` para espaçamentos
- [ ] Usa `getTypographyClasses()` para tipografia
- [ ] Usa `getRadiusClass()` para bordas
- [ ] Zero valores hardcoded
- [ ] Cores semânticas (primary, error, etc.)

### 6. Acessibilidade (WCAG 2.1 AA)

- [ ] Atributos ARIA apropriados
- [ ] Navegação por teclado completa
- [ ] Focus management correto
- [ ] Suporte a screen readers
- [ ] Contraste de cores adequado (4.5:1)
- [ ] Labels associados corretamente
- [ ] Estados de erro anunciados
- [ ] Respeita `prefers-reduced-motion`

### 7. Funcionalidade

- [ ] Todos os estados funcionam
- [ ] Variantes funcionam corretamente
- [ ] Tamanhos funcionam corretamente
- [ ] Callbacks funcionam
- [ ] Modos controlled/uncontrolled funcionam
- [ ] Edge cases tratados
- [ ] Performance adequada

### 8. Testes

- [ ] Cobertura > 80%
- [ ] Testes de renderização
- [ ] Testes de interação
- [ ] Testes de acessibilidade
- [ ] Testes de props e variantes
- [ ] Testes de edge cases
- [ ] Testes de navegação por teclado
- [ ] Testes de integração

### 9. Storybook

- [ ] Meta configurado corretamente
- [ ] ArgTypes para todos props principais
- [ ] Story "Default"
- [ ] Stories para todas variantes
- [ ] Stories para todos tamanhos
- [ ] Stories para estados
- [ ] Story "AllVariants"
- [ ] Story "Accessibility"
- [ ] Story "KeyboardNavigation"
- [ ] Exemplos de uso real
- [ ] Documentação inline
- [ ] Exemplos de composição

### 10. Documentação

- [ ] JSDoc completo
- [ ] Exemplos de uso no JSDoc
- [ ] Descrição clara de props
- [ ] Documentação de variantes
- [ ] Notas sobre acessibilidade
- [ ] Notas sobre comportamento especial
- [ ] Documentação do pattern usado

### 11. Performance

- [ ] React.memo quando apropriado
- [ ] Callbacks memoizados quando necessário
- [ ] Sem re-renders desnecessários
- [ ] Lazy loading quando aplicável
- [ ] Code splitting quando apropriado

### 12. Consistência

- [ ] Segue padrões estabelecidos
- [ ] Nomenclatura consistente
- [ ] Estrutura de classes consistente
- [ ] Padrões de composição consistentes
- [ ] Alinhado com outros componentes

---

## Processo de Revisão por Fase

### Fase 1: Análise e Auditoria

Para cada componente:

1. Ler código fonte completo
2. Analisar design pattern usado
3. Verificar princípios SOLID
4. Verificar API design
5. Verificar uso de tokens
6. Executar testes existentes
7. Abrir Storybook e verificar stories
8. Verificar acessibilidade básica
9. Documentar problemas encontrados
10. Criar lista de melhorias

### Fase 2: Aplicação de Design Patterns

Para cada componente:

1. Identificar pattern apropriado
2. Refatorar se necessário
3. Implementar pattern corretamente
4. Adicionar Context se necessário
5. Adicionar hooks customizados se necessário
6. Garantir controlled/uncontrolled quando aplicável

### Fase 3: Padronização

Para cada componente:

1. Padronizar nomenclatura
2. Organizar props na ordem padrão
3. Garantir uso correto de tokens
4. Padronizar estrutura de arquivos
5. Padronizar exports
6. Garantir type safety

### Fase 4: Melhorias de Código

Para cada componente:

1. Aplicar princípios SOLID
2. Extrair lógica para hooks
3. Melhorar organização
4. Otimizar performance
5. Melhorar acessibilidade
6. Adicionar validações

### Fase 5: Testes e Validação

Para cada componente:

1. Adicionar testes faltantes
2. Aumentar cobertura para > 80%
3. Testar acessibilidade
4. Testar em diferentes navegadores
5. Validar responsividade
6. Verificar performance

### Fase 6: Documentação

Para cada componente:

1. Melhorar JSDoc
2. Adicionar stories faltantes
3. Melhorar exemplos no Storybook
4. Documentar patterns usados
5. Adicionar notas de uso
6. Criar exemplos de composição

---

## Priorização por Complexidade e Impacto

### Alta Prioridade (Componentes Base - Padrões Fundamentais)

1. **Button** - Referência para outros componentes

                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - Pattern: Builder (classes), Polymorphic
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - Foco: Padronização completa como referência

2. **Input** - Componente base de formulários

                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - Pattern: Controlled/Uncontrolled
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - Foco: API design, tokens, acessibilidade

3. **Select** - Componente complexo de formulários

                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - Pattern: Controlled/Uncontrolled
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - Foco: API design, acessibilidade

4. **Checkbox** - Componente de seleção

                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - Pattern: Controlled/Uncontrolled
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - Foco: API design, acessibilidade

5. **Radio** - Componente de seleção

                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - Pattern: Controlled/Uncontrolled
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - Foco: API design, acessibilidade

6. **Switch** - Componente de toggle

                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - Pattern: Controlled/Uncontrolled
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - Foco: API design, acessibilidade

7. **Label** - Componente base

                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - Pattern: Simples
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - Foco: Acessibilidade, associação

8. **Text** - Componente base

                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - Pattern: Simples
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - Foco: Tokens, tipografia

### Média Prioridade (Componentes de Feedback e UI)

9. **ErrorMessage** - Feedback de erro

                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - Pattern: Simples
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - Foco: Acessibilidade, tokens

10. **Badge** - Indicador visual

                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - Pattern: Simples
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - Foco: Tokens, variantes

11. **Spinner** - Loading state

                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - Pattern: Simples
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - Foco: Performance, acessibilidade

12. **Progress** - Indicador de progresso

                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - Pattern: Simples
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - Foco: Acessibilidade, animações

13. **Skeleton** - Loading placeholder

                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - Pattern: Simples
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - Foco: Performance, animações

14. **Tooltip** - Informação contextual

                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - Pattern: Render Props (verificar)
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - Foco: Acessibilidade, posicionamento

15. **Chip** - Tag/etiqueta

                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - Pattern: Simples
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - Foco: Tokens, interação

16. **Avatar** - Imagem de perfil

                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - Pattern: Simples
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - Foco: Performance, fallback

17. **Textarea** - Input multi-linha

                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - Pattern: Controlled/Uncontrolled
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - Foco: API design, acessibilidade

18. **Separator** - Divisor visual

                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - Pattern: Simples
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - Foco: Tokens, acessibilidade

19. **NavLink** - Link de navegação

                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - Pattern: Polymorphic
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - Foco: API design, acessibilidade

20. **Info** - Informação contextual

                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - Pattern: Simples
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - Foco: Acessibilidade, tokens

21. **BoxWrapper** - Container genérico

                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - Pattern: Simples
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - Foco: Flexibilidade, tokens

### Baixa Prioridade (Componentes Complexos - Patterns Avançados)

22. **Menu** - Dropdown menu

                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - Pattern: Compound Components, Context API
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - Foco: Refinar pattern, documentação

23. **Drawer** - Painel lateral

                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - Pattern: Compound Components, Context API
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - Foco: Refinar pattern, documentação

24. **Popover** - Popup contextual

                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - Pattern: Verificar se precisa Compound
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - Foco: Acessibilidade, posicionamento

25. **Accordion** - Conteúdo expansível

                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - Pattern: Verificar se precisa Compound
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - Foco: Acessibilidade, animações

26. **Collapsible** - Conteúdo colapsável

                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - Pattern: Verificar se precisa Compound
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - Foco: Acessibilidade, animações

27. **Slider** - Controle de range

                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - Pattern: Controlled/Uncontrolled
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - Foco: Acessibilidade, interação

---

## Ferramentas e Validação

### Ferramentas de Desenvolvimento

- **TypeScript**: Strict mode, zero `any`
- **ESLint**: Regras de acessibilidade e React
- **Prettier**: Formatação consistente
- **Vitest**: Testes unitários
- **Testing Library**: Testes de acessibilidade
- **Storybook**: Documentação e testes visuais

### Ferramentas de Acessibilidade

- **axe-core**: Auditoria automática
- **WAVE**: Análise de acessibilidade
- **Lighthouse**: Auditoria completa
- **Screen Readers**: Testes manuais (NVDA, JAWS, VoiceOver)

### Ferramentas de Performance

- **React DevTools Profiler**: Análise de renderização
- **Lighthouse Performance**: Métricas de performance
- **Bundle Analyzer**: Análise de bundle size

---

## Entregas Finais

1. ✅ Todos os 27 componentes revisados e padronizados
2. ✅ Design patterns aplicados corretamente
3. ✅ Princípios SOLID aplicados
4. ✅ API design consistente e intuitiva
5. ✅ Cobertura de testes > 80% para todos
6. ✅ Stories completos no Storybook
7. ✅ Documentação atualizada (JSDoc + Storybook)
8. ✅ Zero uso de `any` em TypeScript
9. ✅ Zero valores hardcoded (todos via tokens)
10. ✅ Acessibilidade WCAG 2.1 AA em todos
11. ✅ Relatório de melhorias implementadas
12. ✅ Checklist de validação preenchido para cada componente
13. ✅ Guia de padrões documentado
14. ✅ Migration guide se houver breaking changes

---

## Próximos Passos

Após confirmação deste plano:

1. Iniciar Fase 1 (Análise) para todos os componentes
2. Criar documentação de padrões estabelecidos
3. Começar implementação seguindo priorização
4. Validação contínua durante desenvolvimento
5. Revisão final e documentação