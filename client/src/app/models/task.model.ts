export type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'BLOCKED' | 'WAITING' | 'DONE';

export interface TaskComment {
  id: number;
  content: string;
  taskId: number;
  createdAt: string;
}

export interface Task {
  id: number;
  title: string;
  description: string;
  status: TaskStatus;
  color: string;
  createdAt: string;
  updatedAt: string;
  comments: TaskComment[];
}

export interface CreateTaskPayload {
  title: string;
  description: string;
  status: TaskStatus;
  color: string;
}

export interface UpdateTaskPayload {
  title?: string;
  description?: string;
  status?: TaskStatus;
  color?: string;
}

export interface CreateCommentPayload {
  content: string;
}

export interface KanbanColumnDefinition {
  key: TaskStatus;
  title: string;
  hint: string;
}

export const TASK_COLORS = [
  { value: '#D64545', label: 'Urgent' },
  { value: '#2F6FED', label: 'Priorité' },
  { value: '#3BA55D', label: 'Personnel' },
  { value: '#D8A100', label: 'Relecture' },
  { value: '#8A5CF6', label: 'Idée' }
];
