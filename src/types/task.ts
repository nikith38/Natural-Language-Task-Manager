
export type Priority = 'P1' | 'P2' | 'P3' | 'P4';

export interface Task {
  id: string;
  taskName: string;
  assignee?: string;
  dueDate?: string;
  priority: Priority;
}

export interface ParsedTask {
  taskName: string;
  assignee?: string;
  dueDate?: string;
  priority: Priority;
}
