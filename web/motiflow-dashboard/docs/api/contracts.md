# API Contracts

## Server Actions

### Epic Actions

#### createEpic

```typescript
createEpic(
  title: string,
  description?: string,
  priority?: string
): Promise<ActionResult<EpicDto>>
```

**Returns**: `ActionResult<EpicDto>` with success/error

**Side Effects**: 
- Creates epic in database
- Publishes `EpicCreated` event
- Revalidates `/epics` and `/` paths

#### listEpics

```typescript
listEpics(
  filters?: { status?: string; priority?: string }
): Promise<ActionResult<EpicDto[]>>
```

**Returns**: Array of epics matching filters

#### getEpic

```typescript
getEpic(id: string): Promise<ActionResult<EpicDto>>
```

**Returns**: Single epic or error if not found

#### updateEpic

```typescript
updateEpic(
  id: string,
  updates: {
    title?: string;
    description?: string;
    status?: string;
    priority?: string;
  }
): Promise<ActionResult<EpicDto>>
```

**Returns**: Updated epic

#### deleteEpic

```typescript
deleteEpic(id: string): Promise<ActionResult<void>>
```

**Returns**: Success or error

### Story Actions

#### createStory

```typescript
createStory(
  title: string,
  as: string,
  iWant: string,
  soThat: string,
  description?: string,
  acceptanceCriteria?: string[],
  storyPoints?: number,
  priority?: string,
  epicId?: string
): Promise<ActionResult<StoryDto>>
```

**Returns**: Created story

### Task Actions

#### createTask

```typescript
createTask(
  title: string,
  storyId: string,
  description?: string,
  priority?: string,
  estimate?: number,
  assignee?: string
): Promise<ActionResult<TaskDto>>
```

**Returns**: Created task

## ActionResult Type

```typescript
type ActionResult<T> = 
  | { success: true; data: T }
  | { success: false; error: string };
```

## Error Handling

All server actions return `ActionResult<T>` which can be checked:

```typescript
const result = await createEpic('Title', 'Description', 'HIGH');

if (result.success) {
  // Use result.data
} else {
  // Handle result.error
}
```
