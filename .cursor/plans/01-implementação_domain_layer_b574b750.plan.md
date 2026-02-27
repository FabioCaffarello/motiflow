# Implementação Domain Layer - Plano Detalhado

## Contexto e Herança do Plano Pai

Este plano é filho de `transformação_appbuilder_em_next.js_app_bc0254d0.plan.md` e implementa a **Fase 2.1 (Domain-Driven Design)** e parte da **Fase 3 (Backend e Persistência)**.

**Ponto de partida**: Estrutura de diretórios criada em `src/core/domain/` com subdiretórios:

- `entities/`
- `value-objects/`
- `events/`
- `services/`

**Regra fundamental**: Apenas **Aggregates** geram eventos de domínio. Entities são parte de aggregates e não geram eventos diretamente.

## Índice de Implementação

### Fase 1: Value Objects (Base) - Sem dependências

1.1. Value Objects de Configuração (AppConfig, FeatureConfig, ComponentConfig, LayoutConfig)

1.2. Value Objects de Template (TemplateConfig, TemplateMetadata)

1.3. Value Objects de Usuário (UserRole, PermissionLevel)

1.4. Value Objects de Identificação (AppId, TemplateId, UserId, WorkspaceId)

### Fase 2: Entities (Dependem de Value Objects)

2.1. Entities do Aggregate App (Feature, Component)

2.2. Entities do Aggregate Template (TemplateVersion)

2.3. Entities do Aggregate User (Workspace, Permission)

### Fase 3: Aggregate Roots (Dependem de Entities e Value Objects)

3.1. Aggregate App (App.ts)

3.2. Aggregate Template (Template.ts)

3.3. Aggregate User (User.ts)

### Fase 4: Domain Events (Gerados apenas por Aggregates)

4.1. Events do Aggregate App

4.2. Events do Aggregate Template

4.3. Events do Aggregate User

### Fase 5: Domain Services (Dependem de Aggregates e Value Objects)

5.1. AppValidationService

5.2. CodeGenerationService

5.3. TemplateMatchingService

### Fase 6: Base Classes e Interfaces

6.1. Base Entity

6.2. Base Aggregate Root

6.3. Base Domain Event

6.4. Base Value Object

---

## Fase 1: Value Objects (Base)

### 1.1 Value Objects de Configuração

**Ordem de implementação**: ComponentConfig → FeatureConfig → LayoutConfig → AppConfig

#### 1.1.1 ComponentConfig

**Arquivo**: `src/core/domain/value-objects/ComponentConfig.ts`

**Responsabilidade**: Representar configuração imutável de um componente dentro de uma feature.

**Estrutura**:

```typescript
export class ComponentConfig {
  private constructor(
    public readonly id: string,
    public readonly type: ComponentCategory,
    public readonly name: string,
    public readonly props: Record<string, unknown>,
    public readonly children?: ComponentConfig[],
    public readonly parentId?: string,
    public readonly position?: { x: number; y: number },
    public readonly layout?: { gridArea?: string; flexOrder?: number }
  ) {}

  static create(data: ComponentConfigData): ComponentConfig
  static fromJSON(json: unknown): ComponentConfig
  toJSON(): ComponentConfigData
  equals(other: ComponentConfig): boolean
  validate(): ValidationResult
  addChild(child: ComponentConfig): ComponentConfig
  updateProps(props: Record<string, unknown>): ComponentConfig
}
```

**Validações**:

- `id` obrigatório, não vazio
- `type` deve ser um ComponentCategory válido
- `name` obrigatório, não vazio
- `props` deve ser objeto válido
- Se `parentId` existe, deve referenciar componente válido
- `position` se existir, x e y devem ser números válidos

**Dependências**: Nenhuma (base)

#### 1.1.2 LayoutConfig

**Arquivo**: `src/core/domain/value-objects/LayoutConfig.ts`

**Responsabilidade**: Representar configuração de layout imutável.

**Estrutura**:

```typescript
export class LayoutConfig {
  private constructor(
    public readonly type: 'grid' | 'flex' | 'stack' | 'container' | 'custom',
    public readonly config: LayoutConfigData
  ) {}

  static create(data: LayoutConfigData): LayoutConfig
  static fromJSON(json: unknown): LayoutConfig
  toJSON(): LayoutConfigData
  equals(other: LayoutConfig): boolean
  validate(): ValidationResult
}
```

**Validações**:

- `type` deve ser um dos tipos válidos
- `config` deve ser válido conforme o tipo
- Grid: columns, rows, gap válidos
- Flex: direction, wrap, justify, align válidos

**Dependências**: Nenhuma

#### 1.1.3 FeatureConfig

**Arquivo**: `src/core/domain/value-objects/FeatureConfig.ts`

**Responsabilidade**: Representar configuração completa de uma feature.

**Estrutura**:

```typescript
export class FeatureConfig {
  private constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly description: string,
    public readonly category: FeatureCategory,
    public readonly components: ComponentConfig[],
    public readonly layout: LayoutConfig,
    public readonly contexts?: FeatureContextData[],
    public readonly routes?: FeatureRoute[],
    public readonly dependencies?: string[],
    public readonly metadata?: FeatureMetadata
  ) {}

  static create(data: FeatureConfigData): FeatureConfig
  static fromJSON(json: unknown): FeatureConfig
  toJSON(): FeatureConfigData
  equals(other: FeatureConfig): boolean
  validate(): ValidationResult
  addComponent(component: ComponentConfig): FeatureConfig
  removeComponent(componentId: string): FeatureConfig
  updateComponent(componentId: string, updates: Partial<ComponentConfig>): FeatureConfig
}
```

**Validações**:

- `id` obrigatório, único
- `name` obrigatório, não vazio
- `category` deve ser FeatureCategory válido
- `components` array válido (pode ser vazio)
- `layout` obrigatório e válido
- `dependencies` se existir, deve referenciar feature IDs válidos

**Dependências**: ComponentConfig, LayoutConfig

#### 1.1.4 AppConfig

**Arquivo**: `src/core/domain/value-objects/AppConfig.ts`

**Responsabilidade**: Representar configuração completa da aplicação.

**Estrutura**:

```typescript
export class AppConfig {
  private constructor(
    public readonly name: string,
    public readonly description: string,
    public readonly features: FeatureConfig[],
    public readonly globalContexts?: FeatureContextData[],
    public readonly routes?: FeatureRoute[],
    public readonly theme?: ThemeConfig,
    public readonly globalTokens?: GlobalTokensConfig,
    public readonly metadata?: AppMetadata
  ) {}

  static create(data: AppConfigData): AppConfig
  static fromJSON(json: unknown): AppConfig
  toJSON(): AppConfigData
  equals(other: AppConfig): boolean
  validate(): ValidationResult
  addFeature(feature: FeatureConfig): AppConfig
  removeFeature(featureId: string): AppConfig
  updateFeature(featureId: string, updates: Partial<FeatureConfig>): AppConfig
  getFeatureById(featureId: string): FeatureConfig | undefined
}
```

**Validações**:

- `name` obrigatório, não vazio
- `features` array válido (pode ser vazio)
- Cada feature deve ter ID único
- `routes` se existir, deve ser válido
- `globalTokens` se existir, deve ser válido

**Dependências**: FeatureConfig

### 1.2 Value Objects de Template

#### 1.2.1 TemplateMetadata

**Arquivo**: `src/core/domain/value-objects/TemplateMetadata.ts`

**Responsabilidade**: Metadados imutáveis de um template.

**Estrutura**:

```typescript
export class TemplateMetadata {
  private constructor(
    public readonly tags?: string[],
    public readonly version?: string,
    public readonly author?: string,
    public readonly createdAt?: string,
    public readonly updatedAt?: string
  ) {}

  static create(data: TemplateMetadataData): TemplateMetadata
  static fromJSON(json: unknown): TemplateMetadata
  toJSON(): TemplateMetadataData
  equals(other: TemplateMetadata): boolean
  validate(): ValidationResult
}
```

**Dependências**: Nenhuma

#### 1.2.2 TemplateConfig

**Arquivo**: `src/core/domain/value-objects/TemplateConfig.ts`

**Responsabilidade**: Configuração completa de um template (usa AppConfig).

**Estrutura**:

```typescript
export class TemplateConfig {
  private constructor(
    public readonly appConfig: AppConfig,
    public readonly metadata: TemplateMetadata
  ) {}

  static create(data: TemplateConfigData): TemplateConfig
  static fromJSON(json: unknown): TemplateConfig
  toJSON(): TemplateConfigData
  equals(other: TemplateConfig): boolean
  validate(): ValidationResult
}
```

**Dependências**: AppConfig, TemplateMetadata

### 1.3 Value Objects de Usuário

#### 1.3.1 UserRole

**Arquivo**: `src/core/domain/value-objects/UserRole.ts`

**Responsabilidade**: Role imutável de usuário em workspace.

**Estrutura**:

```typescript
export enum WorkspaceRoleEnum {
  OWNER = 'OWNER',
  ADMIN = 'ADMIN',
  MEMBER = 'MEMBER',
  VIEWER = 'VIEWER'
}

export class UserRole {
  private constructor(public readonly value: WorkspaceRoleEnum) {}

  static owner(): UserRole
  static admin(): UserRole
  static member(): UserRole
  static viewer(): UserRole
  static fromString(value: string): UserRole
  equals(other: UserRole): boolean
  canEdit(): boolean
  canDelete(): boolean
  canView(): boolean
}
```

**Dependências**: Nenhuma

#### 1.3.2 PermissionLevel

**Arquivo**: `src/core/domain/value-objects/PermissionLevel.ts`

**Responsabilidade**: Nível de permissão imutável.

**Estrutura**:

```typescript
export enum PermissionLevelEnum {
  READ = 'READ',
  WRITE = 'WRITE',
  DELETE = 'DELETE',
  ADMIN = 'ADMIN'
}

export class PermissionLevel {
  private constructor(public readonly value: PermissionLevelEnum) {}

  static read(): PermissionLevel
  static write(): PermissionLevel
  static delete(): PermissionLevel
  static admin(): PermissionLevel
  static fromString(value: string): PermissionLevel
  equals(other: PermissionLevel): boolean
  includes(other: PermissionLevel): boolean
}
```

**Dependências**: Nenhuma

### 1.4 Value Objects de Identificação

#### 1.4.1 AppId

**Arquivo**: `src/core/domain/value-objects/AppId.ts`

**Estrutura**:

```typescript
export class AppId {
  private constructor(public readonly value: string) {}

  static create(value?: string): AppId
  static fromString(value: string): AppId
  equals(other: AppId): boolean
  toString(): string
  validate(): ValidationResult
}
```

**Dependências**: Nenhuma

#### 1.4.2 TemplateId, UserId, WorkspaceId

**Arquivos**: Similar a AppId, um arquivo para cada.

**Dependências**: Nenhuma

---

## Fase 2: Entities

### 2.1 Entities do Aggregate App

**Regra**: Entities não geram eventos. Apenas o Aggregate Root (App) gera eventos.

#### 2.1.1 Feature (Entity)

**Arquivo**: `src/core/domain/entities/Feature.ts`

**Responsabilidade**: Entity que representa uma feature dentro de um App aggregate.

**Estrutura**:

```typescript
export class Feature extends BaseEntity {
  private constructor(
    id: string,
    private _config: FeatureConfig,
    private _appId: AppId
  ) {
    super(id);
  }

  static create(config: FeatureConfig, appId: AppId): Feature
  static reconstitute(id: string, config: FeatureConfig, appId: AppId): Feature

  get config(): FeatureConfig
  get appId(): AppId

  updateConfig(config: FeatureConfig): void
  addComponent(component: ComponentConfig): void
  removeComponent(componentId: string): void
  updateComponent(componentId: string, updates: Partial<ComponentConfig>): void
}
```

**Regras de negócio**:

- Feature pertence a um App (appId obrigatório)
- Não pode ser criada sem config válida
- Componentes devem ter IDs únicos dentro da feature

**Dependências**: FeatureConfig, AppId, BaseEntity

#### 2.1.2 Component (Entity)

**Arquivo**: `src/core/domain/entities/Component.ts`

**Nota**: Component pode ser uma entity ou value object. Considerando que componentes podem ter estado mutável e lógica, vamos tratá-lo como entity dentro de Feature.

**Estrutura**: Similar a Feature, mas mais simples.

**Dependências**: ComponentConfig, Feature (ou FeatureId)

### 2.2 Entities do Aggregate Template

#### 2.2.1 TemplateVersion (Entity)

**Arquivo**: `src/core/domain/entities/TemplateVersion.ts`

**Estrutura**:

```typescript
export class TemplateVersion extends BaseEntity {
  private constructor(
    id: string,
    private _version: string, // Semantic version
    private _config: TemplateConfig,
    private _changelog: string | null,
    private _templateId: TemplateId
  ) {
    super(id);
  }

  static create(version: string, config: TemplateConfig, templateId: TemplateId, changelog?: string): TemplateVersion
  static reconstitute(id: string, version: string, config: TemplateConfig, templateId: TemplateId, changelog?: string): TemplateVersion

  get version(): string
  get config(): TemplateConfig
  get changelog(): string | null
  get templateId(): TemplateId

  updateChangelog(changelog: string): void
}
```

**Dependências**: TemplateConfig, TemplateId, BaseEntity

### 2.3 Entities do Aggregate User

#### 2.3.1 Workspace (Entity)

**Arquivo**: `src/core/domain/entities/Workspace.ts`

**Estrutura**:

```typescript
export class Workspace extends BaseEntity {
  private constructor(
    id: string,
    private _name: string,
    private _slug: string,
    private _ownerId: UserId
  ) {
    super(id);
  }

  static create(name: string, slug: string, ownerId: UserId): Workspace
  static reconstitute(id: string, name: string, slug: string, ownerId: UserId): Workspace

  get name(): string
  get slug(): string
  get ownerId(): UserId

  updateName(name: string): void
  updateSlug(slug: string): void
}
```

**Dependências**: UserId, BaseEntity

#### 2.3.2 Permission (Entity)

**Arquivo**: `src/core/domain/entities/Permission.ts`

**Estrutura**:

```typescript
export class Permission extends BaseEntity {
  private constructor(
    id: string,
    private _userId: UserId,
    private _resourceId: string, // AppId ou WorkspaceId
    private _resourceType: 'app' | 'workspace',
    private _level: PermissionLevel
  ) {
    super(id);
  }

  static create(userId: UserId, resourceId: string, resourceType: 'app' | 'workspace', level: PermissionLevel): Permission
  static reconstitute(id: string, userId: UserId, resourceId: string, resourceType: 'app' | 'workspace', level: PermissionLevel): Permission

  get userId(): UserId
  get resourceId(): string
  get resourceType(): 'app' | 'workspace'
  get level(): PermissionLevel

  updateLevel(level: PermissionLevel): void
}
```

**Dependências**: UserId, PermissionLevel, BaseEntity

---

## Fase 3: Aggregate Roots

### 3.1 Aggregate App

**Arquivo**: `src/core/domain/entities/App.ts`

**Responsabilidade**: Aggregate Root que gerencia App e suas features/components. ÚNICO que pode gerar eventos de domínio relacionados a App.

**Estrutura**:

```typescript
export class App extends BaseAggregateRoot {
  private constructor(
    id: AppId,
    private _name: string,
    private _description: string | null,
    private _slug: string,
    private _status: AppStatus,
    private _config: AppConfig,
    private _userId: UserId,
    private _workspaceId: WorkspaceId | null,
    private _features: Feature[],
    private _publishedAt: Date | null,
    private _createdAt: Date,
    private _updatedAt: Date
  ) {
    super(id);
  }

  static create(
    name: string,
    description: string | null,
    slug: string,
    config: AppConfig,
    userId: UserId,
    workspaceId?: WorkspaceId
  ): App

  static reconstitute(
    id: AppId,
    name: string,
    description: string | null,
    slug: string,
    status: AppStatus,
    config: AppConfig,
    userId: UserId,
    workspaceId: WorkspaceId | null,
    features: Feature[],
    publishedAt: Date | null,
    createdAt: Date,
    updatedAt: Date
  ): App

  // Getters
  get name(): string
  get description(): string | null
  get slug(): string
  get status(): AppStatus
  get config(): AppConfig
  get userId(): UserId
  get workspaceId(): WorkspaceId | null
  get features(): ReadonlyArray<Feature>
  get publishedAt(): Date | null
  get createdAt(): Date
  get updatedAt(): Date

  // Commands (geram eventos)
  updateName(name: string): void
  updateDescription(description: string | null): void
  updateConfig(config: AppConfig): void
  addFeature(featureConfig: FeatureConfig): void
  removeFeature(featureId: string): void
  updateFeature(featureId: string, updates: Partial<FeatureConfig>): void
  addComponentToFeature(featureId: string, componentConfig: ComponentConfig): void
  removeComponentFromFeature(featureId: string, componentId: string): void
  publish(): void
  archive(): void

  // Queries
  getFeatureById(featureId: string): Feature | undefined
  hasFeature(featureId: string): boolean
  canBePublished(): boolean
}
```

**Eventos gerados**:

- `AppCreated` (no create)
- `AppUpdated` (updateName, updateDescription, updateConfig)
- `AppPublished` (publish)
- `FeatureAdded` (addFeature)
- `ComponentAdded` (addComponentToFeature)

**Regras de negócio**:

- Slug deve ser único por usuário
- Não pode publicar se não tiver pelo menos uma feature
- Não pode arquivar se estiver publicado sem despublicar antes
- Features devem ter IDs únicos dentro do App

**Dependências**: AppId, AppConfig, UserId, WorkspaceId, Feature, BaseAggregateRoot, Domain Events

### 3.2 Aggregate Template

**Arquivo**: `src/core/domain/entities/Template.ts`

**Estrutura similar a App, mas para templates**:

```typescript
export class Template extends BaseAggregateRoot {
  // Similar estrutura, mas com:
  // - TemplateConfig ao invés de AppConfig
  // - TemplateVersion[] ao invés de Feature[]
  // - isPublic: boolean
  // - category: TemplateCategory

  // Eventos gerados:
  // - TemplateCreated
  // - TemplatePublished
  // - TemplateShared
}
```

**Dependências**: TemplateId, TemplateConfig, UserId, TemplateVersion, BaseAggregateRoot, Domain Events

### 3.3 Aggregate User

**Arquivo**: `src/core/domain/entities/User.ts`

**Estrutura**:

```typescript
export class User extends BaseAggregateRoot {
  private constructor(
    id: UserId,
    private _email: string,
    private _name: string | null,
    private _image: string | null,
    private _workspaces: Workspace[],
    private _createdAt: Date,
    private _updatedAt: Date
  ) {
    super(id);
  }

  // Eventos gerados:
  // - UserCreated
  // - WorkspaceCreated (quando cria workspace)
  // - PermissionGranted (quando concede permissão)
}
```

**Dependências**: UserId, Workspace, Permission, BaseAggregateRoot, Domain Events

---

## Fase 4: Domain Events

### 4.1 Events do Aggregate App

**Base**: `src/core/domain/events/BaseDomainEvent.ts`

#### 4.1.1 AppCreated

**Arquivo**: `src/core/domain/events/app/AppCreated.ts`

```typescript
export class AppCreated extends BaseDomainEvent {
  constructor(
    public readonly appId: AppId,
    public readonly name: string,
    public readonly userId: UserId,
    public readonly workspaceId: WorkspaceId | null,
    occurredAt: Date = new Date()
  ) {
    super('AppCreated', occurredAt);
  }
}
```

#### 4.1.2 AppUpdated

**Arquivo**: `src/core/domain/events/app/AppUpdated.ts`

```typescript
export class AppUpdated extends BaseDomainEvent {
  constructor(
    public readonly appId: AppId,
    public readonly changes: {
      name?: string;
      description?: string | null;
      config?: AppConfig;
    },
    occurredAt: Date = new Date()
  ) {
    super('AppUpdated', occurredAt);
  }
}
```

#### 4.1.3 AppPublished

**Arquivo**: `src/core/domain/events/app/AppPublished.ts`

#### 4.1.4 FeatureAdded

**Arquivo**: `src/core/domain/events/app/FeatureAdded.ts`

#### 4.1.5 ComponentAdded

**Arquivo**: `src/core/domain/events/app/ComponentAdded.ts`

### 4.2 Events do Aggregate Template

#### 4.2.1 TemplateCreated

**Arquivo**: `src/core/domain/events/template/TemplateCreated.ts`

#### 4.2.2 TemplatePublished

**Arquivo**: `src/core/domain/events/template/TemplatePublished.ts`

#### 4.2.3 TemplateShared

**Arquivo**: `src/core/domain/events/template/TemplateShared.ts`

### 4.3 Events do Aggregate User

#### 4.3.1 UserCreated

**Arquivo**: `src/core/domain/events/user/UserCreated.ts`

#### 4.3.2 WorkspaceCreated

**Arquivo**: `src/core/domain/events/user/WorkspaceCreated.ts`

#### 4.3.3 PermissionGranted

**Arquivo**: `src/core/domain/events/user/PermissionGranted.ts`

---

## Fase 5: Domain Services

### 5.1 AppValidationService

**Arquivo**: `src/core/domain/services/AppValidationService.ts`

**Responsabilidade**: Validar regras de negócio complexas que não pertencem a uma única entity.

```typescript
export class AppValidationService {
  validateAppConfig(config: AppConfig): ValidationResult
  validateFeatureConfig(featureConfig: FeatureConfig): ValidationResult
  validateComponentConfig(componentConfig: ComponentConfig): ValidationResult
  canPublishApp(app: App): ValidationResult
  validateSlugUniqueness(slug: string, userId: UserId): Promise<ValidationResult>
}
```

**Dependências**: AppConfig, FeatureConfig, ComponentConfig, App

### 5.2 CodeGenerationService

**Arquivo**: `src/core/domain/services/CodeGenerationService.ts`

**Responsabilidade**: Gerar código a partir de AppConfig.

```typescript
export class CodeGenerationService {
  generateAppCode(appConfig: AppConfig, format: ExportFormat): GeneratedCode
  generateFeatureCode(featureConfig: FeatureConfig, format: ExportFormat): GeneratedCode
  validateGeneratedCode(code: GeneratedCode): ValidationResult
}
```

**Dependências**: AppConfig, FeatureConfig

### 5.3 TemplateMatchingService

**Arquivo**: `src/core/domain/services/TemplateMatchingService.ts`

**Responsabilidade**: Matching de templates com requisitos.

```typescript
export class TemplateMatchingService {
  findMatchingTemplates(requirements: TemplateRequirements): Template[]
  scoreTemplateMatch(template: Template, requirements: TemplateRequirements): number
}
```

**Dependências**: Template

---

## Fase 6: Base Classes e Interfaces

### 6.1 Base Value Object

**Arquivo**: `src/core/domain/value-objects/BaseValueObject.ts`

```typescript
export abstract class BaseValueObject {
  abstract equals(other: BaseValueObject): boolean
  abstract validate(): ValidationResult
}
```

### 6.2 Base Entity

**Arquivo**: `src/core/domain/entities/BaseEntity.ts`

```typescript
export abstract class BaseEntity {
  protected constructor(protected readonly _id: string) {}

  get id(): string {
    return this._id;
  }

  equals(other: BaseEntity): boolean {
    return this._id === other._id;
  }
}
```

### 6.3 Base Aggregate Root

**Arquivo**: `src/core/domain/entities/BaseAggregateRoot.ts`

```typescript
export abstract class BaseAggregateRoot extends BaseEntity {
  private _domainEvents: BaseDomainEvent[] = [];

  protected constructor(id: string) {
    super(id);
  }

  protected addDomainEvent(event: BaseDomainEvent): void {
    this._domainEvents.push(event);
  }

  get domainEvents(): ReadonlyArray<BaseDomainEvent> {
    return [...this._domainEvents];
  }

  clearDomainEvents(): void {
    this._domainEvents = [];
  }
}
```

### 6.4 Base Domain Event

**Arquivo**: `src/core/domain/events/BaseDomainEvent.ts`

```typescript
export abstract class BaseDomainEvent {
  constructor(
    public readonly eventType: string,
    public readonly occurredAt: Date
  ) {}
}
```

### 6.5 ValidationResult

**Arquivo**: `src/core/domain/value-objects/ValidationResult.ts`

```typescript
export class ValidationResult {
  constructor(
    public readonly valid: boolean,
    public readonly errors: string[] = [],
    public readonly warnings: string[] = []
  ) {}

  static success(): ValidationResult
  static failure(errors: string[]): ValidationResult
  static withWarnings(warnings: string[]): ValidationResult
}
```

---

## Ordem de Implementação Recomendada

### Sprint 1: Fundação (Fase 6 + Fase 1.4)

1. Base classes (BaseValueObject, BaseEntity, BaseAggregateRoot, BaseDomainEvent)
2. ValidationResult
3. Value Objects de Identificação (AppId, TemplateId, UserId, WorkspaceId)

### Sprint 2: Value Objects de Configuração (Fase 1.1)

1. ComponentConfig
2. LayoutConfig
3. FeatureConfig
4. AppConfig

### Sprint 3: Value Objects Restantes (Fase 1.2 + 1.3)

1. TemplateMetadata
2. TemplateConfig
3. UserRole
4. PermissionLevel

### Sprint 4: Entities (Fase 2)

1. Feature
2. Component
3. TemplateVersion
4. Workspace
5. Permission

### Sprint 5: Aggregates (Fase 3)

1. App
2. Template
3. User

### Sprint 6: Domain Events (Fase 4)

1. Events do App
2. Events do Template
3. Events do User

### Sprint 7: Domain Services (Fase 5)

1. AppValidationService
2. CodeGenerationService
3. TemplateMatchingService

---

## Estrutura de Arquivos Final

```
src/core/domain/
├── entities/
│   ├── BaseEntity.ts
│   ├── BaseAggregateRoot.ts
│   ├── App.ts
│   ├── Template.ts
│   ├── User.ts
│   ├── Feature.ts
│   ├── Component.ts
│   ├── TemplateVersion.ts
│   ├── Workspace.ts
│   └── Permission.ts
├── value-objects/
│   ├── BaseValueObject.ts
│   ├── ValidationResult.ts
│   ├── AppId.ts
│   ├── TemplateId.ts
│   ├── UserId.ts
│   ├── WorkspaceId.ts
│   ├── AppConfig.ts
│   ├── FeatureConfig.ts
│   ├── ComponentConfig.ts
│   ├── LayoutConfig.ts
│   ├── TemplateConfig.ts
│   ├── TemplateMetadata.ts
│   ├── UserRole.ts
│   └── PermissionLevel.ts
├── events/
│   ├── BaseDomainEvent.ts
│   ├── app/
│   │   ├── AppCreated.ts
│   │   ├── AppUpdated.ts
│   │   ├── AppPublished.ts
│   │   ├── FeatureAdded.ts
│   │   └── ComponentAdded.ts
│   ├── template/
│   │   ├── TemplateCreated.ts
│   │   ├── TemplatePublished.ts
│   │   └── TemplateShared.ts
│   └── user/
│       ├── UserCreated.ts
│       ├── WorkspaceCreated.ts
│       └── PermissionGranted.ts
└── services/
    ├── AppValidationService.ts
    ├── CodeGenerationService.ts
    └── TemplateMatchingService.ts
```

---

## Regras e Princípios

1. **Apenas Aggregates geram eventos**: Entities e Value Objects nunca geram eventos diretamente
2. **Imutabilidade**: Value Objects são imutáveis. Métodos de "update" retornam novas instâncias
3. **Validação**: Todos os Value Objects devem validar seus dados no construtor
4. **Factory Methods**: Usar `create()` para novas instâncias e `reconstitute()` para reconstruir de persistência
5. **Encapsulamento**: Propriedades privadas com getters públicos
6. **Sem dependências externas**: Domain layer não depende de frameworks, bibliotecas externas (exceto tipos básicos)
7. **Testabilidade**: Tudo deve ser facilmente testável sem mocks complexos

---

## Testes

Cada arquivo deve ter seu arquivo de teste correspondente em `tests/unit/domain/`:

- `tests/unit/domain/value-objects/`
- `tests/unit/domain/entities/`
- `tests/unit/domain/events/`
- `tests/unit/domain/services/`

**Cobertura mínima**: 80% conforme definido no plano pai.