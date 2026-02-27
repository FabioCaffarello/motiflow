import { Story } from '@/core/domain/entities/story';

export interface StoryDto {
  id: string;
  title: string;
  description?: string;
  as: string;
  iWant: string;
  soThat: string;
  storyPoints: number | null;
  status: string;
  priority: string;
  epicId: string | null;
  createdAt: string;
  updatedAt: string;
}
