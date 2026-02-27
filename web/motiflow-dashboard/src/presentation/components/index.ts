/**
 * Componentes específicos do Motiflow Dashboard
 */

export { DesignSystemExample } from './design-system-example';

// Epic components
export { EpicCard } from './epic/EpicCard';
export { EpicForm } from './epic/EpicForm';
export type { EpicFormData, EpicFormProps } from './epic/EpicForm';

export { DashboardNav } from './shared/DashboardNav';
export { DashboardNavbar } from './navigation/DashboardNavbar';
export { DashboardSidebar } from './navigation/DashboardSidebar';
export { DashboardCustomSidebar } from './navigation/DashboardCustomSidebar';
export { SidebarLayout } from './navigation/SidebarLayout';
export { ConfirmDialog } from './shared/ConfirmDialog';
export type { ConfirmDialogProps } from './shared/ConfirmDialog';

// Story components
export { StoryCard } from './story/StoryCard';
export { StoryForm } from './story/StoryForm';
export type { StoryFormData, StoryFormProps } from './story/StoryForm';

// Task components
export { TaskCard } from './task/TaskCard';
export { TaskForm } from './task/TaskForm';
export type { TaskFormData, TaskFormProps } from './task/TaskForm';

// Sprint components
export { SprintCard } from './sprint/SprintCard';
export { SprintForm } from './sprint/SprintForm';
export type { SprintFormData, SprintFormProps } from './sprint/SprintForm';
export { SprintActions } from './sprint/SprintActions';

// Kanban components
export { KanbanBoardComponent } from './kanban/KanbanBoard';
