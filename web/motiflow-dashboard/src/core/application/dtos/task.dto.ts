export interface TaskDto {
  id: string;
  title: string;
  description?: string;
  status: string;
  priority: string;
  estimate: number | null;
  assignee: string | null;
  storyId: string | null;
  createdAt: string;
  updatedAt: string;
}
