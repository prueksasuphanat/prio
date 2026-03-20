export enum Priority {
  High = "High",
  Medium = "Medium",
  Low = "Low",
}

export interface Tag {
  id: number;
  name: string;
  createdAt: string;
  taskCount?: number;
}

export interface Subtask {
  id: number;
  taskId: number;
  title: string;
  isDone: boolean;
  position: number;
  createdAt: string;
}

export interface Task {
  id: number;
  userId: number;
  title: string;
  description?: string;
  priority: Priority;
  dueDate?: string;
  isDone: boolean;
  position: number;
  createdAt: string;
  updatedAt: string;
  tags: Tag[];
  subtasks: Subtask[];
}

export interface CreateTaskDto {
  title: string;
  description?: string;
  priority?: Priority;
  dueDate?: string;
  tagIds?: number[];
}

export interface UpdateTaskDto {
  title?: string;
  description?: string;
  priority?: Priority;
  dueDate?: string;
  isDone?: boolean;
  position?: number;
  tagIds?: number[];
}

export interface TaskQuery {
  search?: string;
  view?: "all" | "today" | "upcoming" | "overdue" | "done";
  priority?: Priority;
  tag?: string;
  sort?: "created_at" | "due_date" | "priority" | "title";
  order?: "asc" | "desc";
  page?: number;
  limit?: number;
}