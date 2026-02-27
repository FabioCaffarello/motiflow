# Evolução Spacing Config e Preview - Plano Rigoroso

## Objetivo

Evoluir a parte de spacing para que:

1. O preview ocupe a posição correta (na área de preview, não no sidebar)
2. O sidebar tenha campos de configuração organizados em subcategorias (usando Accordion)
3. O sistema seja consistente com a arquitetura de Typography (usando Registry/Factory pattern)

## Análise do Estado Atual

### SpacingConfig (Atual)

- ❌ Não usa Accordion (diferente de TypographyConfig)
- ❌ Mostra preview dentro do sidebar (não deveria)
- ❌ Não usa ConfiguratorFactory
- ❌ Não tem subcategorias organizadas
- ❌ Notifica apenas 'spacing' genérico (não subcategorias)

### SpacingContent (Atual)

- ❌ Não mostra campos de configuração
- ❌ Não integra com form context
- ❌ Não mostra preview em tempo real
- ❌ Layout muito simples (apenas grid de valores)

### SpacingPreview (Atual)

- ✅ Usa PreviewSectionFactory
- ✅ Suporta activeAccordionId
- ⚠️ Mas não recebe selectedSpacing dinamicamente

### Comparação com Typography

**TypographyConfig:**

- ✅ Usa Accordion com type="single"
- ✅ Usa ConfiguratorFactory para obter configurators
- ✅ Notifica subcategorias: `typography-fontSizes`, `typography-fontWeights`, etc.
- ✅ Primeiro accordion aberto por padrão
- ✅ Sincroniza estado inicial

**TypographyContent:**

- ✅ Mostra campos de configuração usando ConfiguratorFactory
- ✅ Integra com form context
- ✅ Mostra TypographyPreview em tempo real dentro de Card
- ✅ Layout completo com Container, Stack, Card

## Estrutura Proposta

### Subcategorias de Spacing

1. **Spacing Scale** (`spacing-scale`)

   - Configurator: `SpacingScaleConfigurator`
   - Preview Section: `SpacingScalePreview` (já existe)
   - Campos: Inputs para cada valor de spacing (xs, sm, md, base, lg, xl, etc.)

2. **Spacing Modes** (`spacing-modes`)

   - Configurator: `SpacingModesConfigurator` (opcional, pode ser apenas visual)
   - Preview Section: `SpacingModesPreview` (já existe)
   - Campos: Seleção de spacing para visualizar em diferentes modos

## Implementação Detalhada

### Fase 1: Criar Configurators para Spacing

#### 1.1. SpacingScaleConfigurator

**Arquivo:** `configurators/SpacingScaleConfigurator.tsx`

**Estrutura:**

```typescript
export function SpacingScaleConfigurator({ className = '' }: SpacingScaleConfiguratorProps) {
  const formContext = useFormContextOptional<GlobalTokensConfig>();
  const { register, watch } = formContext?.form || {};
  const spacing = watch?.('spacing') || {};

  return (
    <div className={`space-y-3 ${className}`}>
      <Label>Spacing Values</Label>
      {Object.keys(spacing).map((key) => (
        <div key={key} className="space-y-2">
          <Label htmlFor={`spacing-${key}`} className="text-sm">
            {key}
          </Label>
          <Input
            id={`spacing-${key}`}
            type="text"
            {...register?.(`spacing.${key}` as const)}
            placeholder="16px"
            size="sm"
          />
        </div>
      ))}
    </div>
  );
}
```

**Características:**

- Usa `useFormContextOptional` (similar a FontSizeConfigurator)
- Renderiza inputs para cada chave de spacing
- Placeholder: "16px"
- Size: "sm"

#### 1.2. SpacingModesConfigurator (Opcional)

**Arquivo:** `configurators/SpacingModesConfigurator.tsx`

**Estrutura:**

```typescript
export function SpacingModesConfigurator({ className = '' }: SpacingModesConfiguratorProps) {
  const formContext = useFormContextOptional<GlobalTokensConfig>();
  const { watch } = formContext?.form || {};
  const spacing = watch?.('spacing') || {};

  // Permite selecionar um spacing específico para visualizar
  const [selectedSpacing, setSelectedSpacing] = useState<string | null>(null);

  return (
    <div className={`space-y-3 ${className}`}>
      <Label>Select Spacing to Preview</Label>
      <Select
        value={selectedSpacing || ''}
        onValueChange={setSelectedSpacing}
        placeholder="Select a spacing value"
      >
        {Object.keys(spacing).map((key) => (
          <Select.Item key={key} value={key}>
            {key} ({spacing[key]})
          </Select.Item>
        ))}
      </Select>
      <p className="text-xs text-gray-500">
        Select a spacing value to see it visualized in different modes (box, gap, padding, margin)
      </p>
    </div>
  );
}
```

**Nota:** Este configurator é opcional. Podemos começar apenas com SpacingScaleConfigurator e adicionar este depois se necessário.

### Fase 2: Refatorar SpacingConfig

**Arquivo:** `SpacingConfig.tsx`

**Mudanças:**

1. **Adicionar Accordion** (similar a TypographyConfig)
2. **Usar ConfiguratorFactory** para obter configurators
3. **Notificar subcategorias** ao invés de apenas 'spacing'
4. **Primeiro accordion aberto por padrão** ('scale')
5. **Sincronizar estado inicial** (similar a TypographyConfig)

**Estrutura:**

```typescript
export function SpacingConfig({ onAccordionChange, className = '' }: SpacingConfigProps) {
  const formContext = useFormContext<GlobalTokensConfig>();
  if (!formContext?.form) {
    return <div className="text-sm text-gray-500">Form context not available</div>;
  }
  const { watch } = formContext.form;
  const spacing = watch('spacing');
  const [openItem, setOpenItem] = useState<string>('scale');
  const hasNotifiedInitial = useRef(false);

  const handleValueChange = (value: string | string[]) => {
    const activeId = Array.isArray(value) ? value[0] || null : value || null;
    setOpenItem(activeId || '');
    onAccordionChange?.(activeId ? `spacing-${activeId}` : null);
  };

  // Notify parent when accordion opens initially
  useEffect(() => {
    if (openItem && !hasNotifiedInitial.current && onAccordionChange) {
      onAccordionChange(`spacing-${openItem}`);
      hasNotifiedInitial.current = true;
    }
  }, [openItem, onAccordionChange]);

  // Obter configurators do registry
  const configurators = ConfiguratorFactory.getAllByCategory('spacing');

  const accordionItems = useMemo(() => {
    return configurators.map((entry) => ({
      id: entry.subcategory,
      title: entry.metadata?.label || entry.subcategory,
      content: ConfiguratorFactory.create('spacing', entry.subcategory),
      disabled: false,
    }));
  }, [configurators]);

  return (
    <div className={className}>
      <Accordion
        type="single"
        items={accordionItems}
        defaultOpen={openItem}
        onValueChange={handleValueChange}
      />
    </div>
  );
}
```

**Características:**

- Usa Accordion com type="single" (exclusivo)
- Primeiro item ('scale') aberto por padrão
- Notifica subcategorias: `spacing-scale`, `spacing-modes`
- Usa ConfiguratorFactory para renderizar configurators
- Remove preview do sidebar (preview vai para ContentLayout)

### Fase 3: Refatorar SpacingContent

**Arquivo:** `content/SpacingContent.tsx`

**Mudanças:**

1. **Adicionar campos de configuração** usando ConfiguratorFactory
2. **Integrar com form context** (similar a TypographyContent)
3. **Mostrar SpacingPreview em tempo real** dentro de Card
4. **Layout completo** com Container, Stack, Card

**Estrutura:**

```typescript
export function SpacingContent({ config }: SpacingContentProps) {
  const formContext = useFormContextOptional<GlobalTokensConfig>();
  const form = formContext?.form;
  const { register, watch } = form || {};
  const watchedSpacing = watch?.('spacing') || config?.spacing;

  if (!config?.spacing && !watchedSpacing) {
    return (
      <Container maxWidth="xl" paddingX="base" paddingY="base">
        <div className="text-center py-8">
          <p className="text-sm text-gray-400">
            No spacing configuration available
          </p>
        </div>
      </Container>
    );
  }

  // Obter configurators do registry
  const configurators = ConfiguratorFactory.getAllByCategory('spacing');

  return (
    <Container maxWidth="xl" paddingX="base" paddingY="base">
      <Stack spacing="lg" direction="column">
        {/* Header */}
        <div>
          <h2 className="text-2xl font-bold text-gray-100 mb-4">
            Spacing Configuration
          </h2>
          <p className="text-sm text-gray-400">
            Configure spacing tokens for your application
          </p>
        </div>

        {/* Campos de Configuração */}
        {form && (
          <div className="space-y-6">
            {configurators.map((entry) => (
              <div key={entry.id}>
                <h3 className="text-lg font-semibold text-gray-100 mb-3">
                  {entry.metadata?.label || entry.subcategory}
                </h3>
                {ConfiguratorFactory.create('spacing', entry.subcategory)}
              </div>
            ))}
          </div>
        )}

        {/* Preview em tempo real dentro de Card */}
        <Card>
          <SpacingPreview 
            config={{ spacing: watchedSpacing || config.spacing }} 
            activeAccordionId={undefined} // Mostrar todos os previews
          />
        </Card>
      </Stack>
    </Container>
  );
}
```

**Características:**

- Layout completo: Container > Stack > Card
- Mostra campos de configuração usando ConfiguratorFactory
- Integra com form context
- Mostra SpacingPreview em tempo real
- Similar a TypographyContent

### Fase 4: Atualizar SpacingPreview para Receber selectedSpacing

**Arquivo:** `previews/SpacingPreview.tsx`

**Mudanças:**

1. **Extrair selectedSpacing do activeAccordionId** (quando houver)
2. **Passar selectedSpacing para preview sections**

**Estrutura:**

```typescript
export function SpacingPreview({ config, activeAccordionId }: SpacingPreviewProps) {
  const { spacing } = config;

  if (!spacing) {
    return null;
  }

  // Extract category and subcategory from activeAccordionId
  const { category: extractedCategory, subcategory: extractedSubcategory } = activeAccordionId
    ? PreviewSectionFactory.extractCategoryAndSubcategory(activeAccordionId)
    : { category: 'spacing', subcategory: null };
  
  const activeSubcategory = extractedSubcategory;
  const category = extractedCategory || 'spacing';

  // Extract selected spacing from activeAccordionId if it's a specific spacing key
  // For now, we'll pass null and let sections handle their own selection
  const selectedSpacing = null; // Can be enhanced later

  // Prepare props for preview sections
  const sectionProps = {
    spacing,
    selectedSpacing,
  };

  return (
    <div className="space-y-6 p-4">
      {/* Main Preview - shows current spacing configuration */}
      <PreviewCard 
        title="Preview" 
        description="Current spacing configuration"
      >
        <SpacingVisualizer
          value={spacing.base || spacing.md || Object.values(spacing)[0] || '16px'}
          mode="box"
          label="Sample Spacing"
        />
      </PreviewCard>

      {/* Dynamic Preview Sections */}
      {activeSubcategory ? (
        PreviewSectionFactory.create(category, activeSubcategory, sectionProps)
      ) : (
        <>
          {PreviewSectionFactory.createAll(category, sectionProps).map((section, index) => (
            <React.Fragment key={index}>{section}</React.Fragment>
          ))}
        </>
      )}
    </div>
  );
}
```

**Características:**

- Passa selectedSpacing para preview sections
- Mantém compatibilidade com activeAccordionId
- Pode ser estendido para extrair selectedSpacing do activeAccordionId no futuro

### Fase 5: Registrar Configurators no Registry

**Arquivo:** `registry/registerDefaults.ts`

**Mudanças:**

1. **Importar SpacingScaleConfigurator**
2. **Registrar configurators de spacing**

**Estrutura:**

```typescript
// Configurators
import { FontSizeConfigurator } from '../configurators/FontSizeConfigurator';
import { FontWeightConfigurator } from '../configurators/FontWeightConfigurator';
import { LineHeightConfigurator } from '../configurators/LineHeightConfigurator';
import { SpacingScaleConfigurator } from '../configurators/SpacingScaleConfigurator';

// ... existing code ...

export function registerDefaultComponents() {
  // ... existing registrations ...

  // Registrar Spacing Configurators
  configuratorRegistry.register({
    id: 'spacing-scale',
    category: 'spacing',
    subcategory: 'scale',
    component: SpacingScaleConfigurator,
    metadata: {
      label: 'Spacing Scale',
      order: 1,
    },
  });

  // SpacingModesConfigurator pode ser adicionado depois se necessário
}
```

### Fase 6: Atualizar GlobalConfigSidebar

**Arquivo:** `GlobalConfigSidebar.tsx`

**Mudanças:**

1. **Garantir que SpacingConfig notifica subcategorias corretamente**
2. **Não precisa de mudanças adicionais** (já está integrado)

**Verificações:**

- SpacingConfig já está sendo usado no sidebar
- onAccordionChange já está sendo passado
- Não precisa de mudanças adicionais

### Fase 7: Atualizar Preview Sections para Receber selectedSpacing

**Arquivos:**

- `sections/spacing/SpacingScalePreview.tsx`
- `sections/spacing/SpacingModesPreview.tsx`

**Mudanças:**

1. **Já recebem selectedSpacing** (já implementado anteriormente)
2. **Verificar se props estão corretas**

**Verificações:**

- SpacingScalePreview já tem `selectedSpacing?: string | null;`
- SpacingModesPreview já tem `selectedSpacing?: string | null;`
- Não precisa de mudanças adicionais

## Estrutura de Arquivos

```
configurators/
├── SpacingScaleConfigurator.tsx (novo)
└── SpacingModesConfigurator.tsx (opcional, futuro)

SpacingConfig.tsx (refatorado)
content/SpacingContent.tsx (refatorado)
previews/SpacingPreview.tsx (atualizado)
registry/registerDefaults.ts (atualizado)
```

## Ordem de Implementação

1. ✅ **Fase 1**: Criar SpacingScaleConfigurator
2. ✅ **Fase 2**: Refatorar SpacingConfig (usar Accordion + ConfiguratorFactory)
3. ✅ **Fase 3**: Refatorar SpacingContent (adicionar campos + preview)
4. ✅ **Fase 4**: Atualizar SpacingPreview (passar selectedSpacing)
5. ✅ **Fase 5**: Registrar configurators no registry
6. ✅ **Fase 6**: Verificar GlobalConfigSidebar (sem mudanças necessárias)
7. ✅ **Fase 7**: Verificar preview sections (já implementado)

## Validação

### Checklist de Validação

1. ✅ SpacingConfig usa Accordion com subcategorias
2. ✅ SpacingConfig notifica subcategorias: `spacing-scale`, `spacing-modes`
3. ✅ SpacingConfig primeiro accordion aberto por padrão
4. ✅ SpacingContent mostra campos de configuração
5. ✅ SpacingContent mostra preview em tempo real
6. ✅ Preview renderizado na posição correta (ContentLayout > Card)
7. ✅ Configurators registrados no registry
8. ✅ Preview sections recebem selectedSpacing
9. ✅ Layout consistente com TypographyContent
10. ✅ Form context integrado corretamente

### Testes Manuais

1. Abrir AppBuilderPlayground
2. Expandir grupo "Spacing" no sidebar
3. Verificar que accordion "Spacing Scale" está aberto por padrão
4. Verificar que campos de configuração aparecem no sidebar
5. Verificar que preview aparece na área de preview (não no sidebar)
6. Alterar valores de spacing e verificar preview atualizando
7. Fechar/abrir accordions e verificar que preview muda dinamicamente
8. Verificar que notificações de accordion estão corretas

## Compatibilidade

### Backward Compatibility

- ✅ Manter interfaces existentes
- ✅ Props opcionais para novas funcionalidades
- ✅ Não quebrar código existente
- ✅ Preview sections já suportam selectedSpacing

### Migração Gradual

1. Criar SpacingScaleConfigurator
2. Refatorar SpacingConfig
3. Refatorar SpacingContent
4. Registrar no registry
5. Testar e validar

## Referências

- `TypographyConfig.tsx` - Modelo para SpacingConfig
- `TypographyContent.tsx` - Modelo para SpacingContent
- `FontSizeConfigurator.tsx` - Modelo para SpacingScaleConfigurator
- `registerDefaults.ts` - Registro de configurators
- `ContentLayout.tsx` - Onde preview é renderizado

## Notas Adicionais

### Decisões de Design

1. **SpacingModesConfigurator é opcional**: Começamos apenas com SpacingScaleConfigurator. SpacingModesConfigurator pode ser adicionado depois se necessário.

2. **Preview na ContentLayout**: O preview é renderizado na ContentLayout (não no sidebar), seguindo o padrão estabelecido.

3. **selectedSpacing**: Por enquanto, passamos `null` como selectedSpacing. Pode ser estendido no futuro para permitir seleção específica.

4. **Consistência com Typography**: Seguimos exatamente o mesmo padrão de Typography para manter consistência arquitetural.

## Próximos Passos (Futuro)

1. Adicionar SpacingModesConfigurator se necessário
2. Melhorar extração de selectedSpacing do activeAccordionId
3. Adicionar validação de valores de spacing
4. Adicionar preview de spacing em diferentes contextos (buttons, cards, etc.)