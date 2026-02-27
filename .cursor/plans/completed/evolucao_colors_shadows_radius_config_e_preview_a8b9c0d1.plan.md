# Evolução Colors, Shadows e Radius Config e Preview

## Objetivo

Aplicar a mesma evolução feita para Spacing para as categorias Colors, Shadows e Radius:

1. Criar configurators usando Registry/Factory pattern
2. Refatorar Config components para usar Accordion + ConfiguratorFactory
3. Refatorar Content components para mostrar apenas campos (sem preview interno)
4. Garantir que preview seja renderizado na área correta (ContentLayout)

## Estado Atual

### ColorsConfig

- ✅ Já usa Accordion com subcategorias (palette, semantic)
- ❌ Não usa ConfiguratorFactory
- ❌ Não notifica subcategorias corretamente (notifica apenas 'colors')
- ⚠️ Preview pode estar no lugar errado

### ShadowsConfig

- ❌ Não usa Accordion
- ❌ Não usa ConfiguratorFactory
- ❌ Mostra preview dentro do sidebar (não deveria)
- ❌ Não tem subcategorias organizadas

### RadiusConfig

- ❌ Não usa Accordion
- ❌ Não usa ConfiguratorFactory
- ❌ Mostra preview dentro do sidebar (não deveria)
- ❌ Não tem subcategorias organizadas

## Estrutura Proposta

### Colors

**Subcategorias:**

1. **Color Palette** (`colors-palette`)

- Configurator: `ColorPaletteConfigurator`
- Preview Section: `PalettePreview` (já existe)

2. **Semantic Colors** (`colors-semantic`)

- Configurator: `SemanticColorsConfigurator`
- Preview Section: `SemanticColorsPreview` (já existe)

### Shadows

**Subcategorias:**

1. **Shadows Grid** (`shadows-grid`)

- Configurator: `ShadowsGridConfigurator`
- Preview Section: `ShadowsGridPreview` (já existe)

2. **Shadows Usage** (`shadows-usage`)

- Configurator: `ShadowsUsageConfigurator` (opcional, pode ser apenas visual)
- Preview Section: `ShadowsUsagePreview` (já existe)

### Radius

**Subcategorias:**

1. **Radius Scale** (`radius-scale`)

- Configurator: `RadiusScaleConfigurator`
- Preview Section: `RadiusScalePreview` (já existe)

2. **Radius Usage** (`radius-usage`)

- Configurator: `RadiusUsageConfigurator` (opcional, pode ser apenas visual)
- Preview Section: `RadiusUsagePreview` (já existe)

## Implementação

### Fase 1: Colors

#### 1.1. Criar Configurators

- `ColorPaletteConfigurator.tsx`
- `SemanticColorsConfigurator.tsx`

#### 1.2. Refatorar ColorsConfig

- Usar ConfiguratorFactory
- Notificar subcategorias: `colors-palette`, `colors-semantic`
- Primeiro accordion aberto por padrão ('palette')

#### 1.3. Refatorar ColorsContent

- Remover preview interno
- Mostrar apenas campos de configuração

#### 1.4. Registrar no Registry

- Registrar configurators em `registerDefaults.ts`

### Fase 2: Shadows

#### 2.1. Criar Configurators

- `ShadowsGridConfigurator.tsx`
- `ShadowsUsageConfigurator.tsx` (opcional)

#### 2.2. Refatorar ShadowsConfig

- Adicionar Accordion
- Usar ConfiguratorFactory
- Notificar subcategorias: `shadows-grid`, `shadows-usage`
- Primeiro accordion aberto por padrão ('grid')
- Remover preview do sidebar

#### 2.3. Refatorar ShadowsContent

- Adicionar campos de configuração
- Remover preview interno (se houver)

#### 2.4. Registrar no Registry

- Registrar configurators em `registerDefaults.ts`

### Fase 3: Radius

#### 3.1. Criar Configurators

- `RadiusScaleConfigurator.tsx`
- `RadiusUsageConfigurator.tsx` (opcional)

#### 3.2. Refatorar RadiusConfig

- Adicionar Accordion
- Usar ConfiguratorFactory
- Notificar subcategorias: `radius-scale`, `radius-usage`
- Primeiro accordion aberto por padrão ('scale')
- Remover preview do sidebar

#### 3.3. Refatorar RadiusContent

- Adicionar campos de configuração
- Remover preview interno (se houver)

#### 3.4. Registrar no Registry

- Registrar configurators em `registerDefaults.ts`

## Ordem de Implementação

1. ✅ **Colors** (já tem Accordion, mais simples)
2. ✅ **Shadows** (precisa adicionar Accordion)
3. ✅ **Radius** (precisa adicionar Accordion)

## Validação

### Checklist para cada categoria

1. ✅ Config usa Accordion com subcategorias
2. ✅ Config notifica subcategorias corretamente
3. ✅ Config primeiro accordion aberto por padrão
4. ✅ Content mostra campos de configuração
5. ✅ Content não mostra preview interno
6. ✅ Preview renderizado na posição correta (ContentLayout)
7. ✅ Configurators registrados no registry
8. ✅ Preview sections recebem props corretas
9. ✅ Layout consistente com Typography e Spacing

## Referências

- `SpacingConfig.tsx` - Modelo para ShadowsConfig e RadiusConfig
- `SpacingContent.tsx` - Modelo para ShadowsContent e RadiusContent
- `SpacingScaleConfigurator.tsx` - Modelo para todos os configurators
- `TypographyConfig.tsx` - Modelo para ColorsConfig (já tem Accordion)
- `registerDefaults.ts` - Registro de configurators