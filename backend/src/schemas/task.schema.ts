import { z } from "zod";

// Priority enum (matching Prisma schema)
export enum Priority {
  High = "High",
  Medium = "Medium",
  Low = "Low",
}

/**
 * Schema สำหรับสร้าง Task
 */
export const createTaskSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  priority: z.nativeEnum(Priority).optional().default(Priority.Medium),
  dueDate: z.string().datetime().optional().nullable(),
  tagIds: z.array(z.number()).optional().default([]),
});

/**
 * Schema สำหรับอัปเดต Task (ทุก field optional)
 */
export const updateTaskSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().optional().nullable(),
  priority: z.nativeEnum(Priority).optional(),
  dueDate: z.string().datetime().optional().nullable(),
  isDone: z.boolean().optional(),
  position: z.number().optional(),
  tagIds: z.array(z.number()).optional(),
});

/**
 * Schema สำหรับ Bulk operations
 */
export const bulkSchema = z.object({
  taskIds: z.array(z.number()).min(1, "At least one task ID is required"),
});

/**
 * Schema สำหรับ Query parameters
 */
export const querySchema = z.object({
  search: z.string().optional(),
  view: z.enum(["all", "today", "upcoming", "overdue", "done"]).optional(),
  priority: z.nativeEnum(Priority).optional(),
  tag: z.string().optional(),
  sort: z
    .enum(["created_at", "due_date", "priority", "title"])
    .optional()
    .default("created_at"),
  order: z.enum(["asc", "desc"]).optional().default("desc"),
  page: z.string().optional().default("1"),
  limit: z.string().optional().default("20"),
});

/**
 * Schema สำหรับ Position update
 */
export const positionSchema = z.object({
  position: z.number().min(0),
});

/**
 * Schema สำหรับ Subtask
 */
export const subtaskSchema = z.object({
  title: z.string().min(1, "Subtask title is required"),
});

export type CreateTaskInput = z.infer<typeof createTaskSchema>;
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>;
export type BulkInput = z.infer<typeof bulkSchema>;
export type QueryInput = z.infer<typeof querySchema>;
export type PositionInput = z.infer<typeof positionSchema>;
export type SubtaskInput = z.infer<typeof subtaskSchema>;
