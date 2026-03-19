import { Request, Response, NextFunction } from "express";
import * as tasksService from "./tasks.service";
import type {
  CreateTaskInput,
  UpdateTaskInput,
  BulkInput,
  QueryInput,
  PositionInput,
  SubtaskInput,
} from "../../schemas/task.schema";

/**
 * GET /api/tasks
 */
export async function getTasksController(
  req: Request<{}, {}, {}, QueryInput>,
  res: Response,
  next: NextFunction,
) {
  try {
    const userId = req.userId!;
    const query = req.query;

    const result = await tasksService.getTasks(userId, query);

    res.json({
      success: true,
      data: result.tasks,
      meta: result.meta,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/tasks
 */
export async function createTaskController(
  req: Request<{}, {}, CreateTaskInput>,
  res: Response,
  next: NextFunction,
) {
  try {
    const userId = req.userId!;
    const data = req.body;

    const task = await tasksService.createTask(userId, data);

    res.status(201).json({
      success: true,
      data: { task },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * PATCH /api/tasks/:id
 */
export async function updateTaskController(
  req: Request<{ id: string }, {}, UpdateTaskInput>,
  res: Response,
  next: NextFunction,
) {
  try {
    const userId = req.userId!;
    const taskId = parseInt(req.params.id);
    const data = req.body;

    const task = await tasksService.updateTask(userId, taskId, data);

    res.json({
      success: true,
      data: { task },
    });
  } catch (error: any) {
    if (error.message === "TASK_NOT_FOUND") {
      return res.status(404).json({
        success: false,
        error: {
          code: "NOT_FOUND",
          message: "Task not found",
        },
      });
    }
    if (error.message === "FORBIDDEN") {
      return res.status(403).json({
        success: false,
        error: {
          code: "FORBIDDEN",
          message: "You do not have permission to update this task",
        },
      });
    }
    return next(error);
  }
}

/**
 * DELETE /api/tasks/:id
 */
export async function deleteTaskController(
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction,
) {
  try {
    const userId = req.userId!;
    const taskId = parseInt(req.params.id);

    await tasksService.deleteTask(userId, taskId);

    res.json({
      success: true,
      data: { message: "Task deleted successfully" },
    });
  } catch (error: any) {
    if (error.message === "TASK_NOT_FOUND") {
      return res.status(404).json({
        success: false,
        error: {
          code: "NOT_FOUND",
          message: "Task not found",
        },
      });
    }
    if (error.message === "FORBIDDEN") {
      return res.status(403).json({
        success: false,
        error: {
          code: "FORBIDDEN",
          message: "You do not have permission to delete this task",
        },
      });
    }
    return next(error);
  }
}

/**
 * PATCH /api/tasks/:id/done
 */
export async function toggleDoneController(
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction,
) {
  try {
    const userId = req.userId!;
    const taskId = parseInt(req.params.id);

    const task = await tasksService.toggleDone(userId, taskId);

    res.json({
      success: true,
      data: { task },
    });
  } catch (error: any) {
    if (error.message === "TASK_NOT_FOUND") {
      return res.status(404).json({
        success: false,
        error: {
          code: "NOT_FOUND",
          message: "Task not found",
        },
      });
    }
    if (error.message === "FORBIDDEN") {
      return res.status(403).json({
        success: false,
        error: {
          code: "FORBIDDEN",
          message: "You do not have permission to update this task",
        },
      });
    }
    return next(error);
  }
}

/**
 * PATCH /api/tasks/:id/position
 */
export async function updatePositionController(
  req: Request<{ id: string }, {}, PositionInput>,
  res: Response,
  next: NextFunction,
) {
  try {
    const userId = req.userId!;
    const taskId = parseInt(req.params.id);
    const { position } = req.body;

    await tasksService.updatePosition(userId, taskId, position);

    res.json({
      success: true,
      data: { message: "Position updated successfully" },
    });
  } catch (error: any) {
    if (error.message === "TASK_NOT_FOUND") {
      return res.status(404).json({
        success: false,
        error: {
          code: "NOT_FOUND",
          message: "Task not found",
        },
      });
    }
    if (error.message === "FORBIDDEN") {
      return res.status(403).json({
        success: false,
        error: {
          code: "FORBIDDEN",
          message: "You do not have permission to update this task",
        },
      });
    }
    return next(error);
  }
}

/**
 * PATCH /api/tasks/bulk/done
 */
export async function bulkDoneController(
  req: Request<{}, {}, BulkInput>,
  res: Response,
  next: NextFunction,
) {
  try {
    const userId = req.userId!;
    const { taskIds } = req.body;

    const count = await tasksService.bulkDone(userId, taskIds);

    res.json({
      success: true,
      data: { count, message: `${count} tasks marked as done` },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * DELETE /api/tasks/bulk
 */
export async function bulkDeleteController(
  req: Request<{}, {}, BulkInput>,
  res: Response,
  next: NextFunction,
) {
  try {
    const userId = req.userId!;
    const { taskIds } = req.body;

    const count = await tasksService.bulkDelete(userId, taskIds);

    res.json({
      success: true,
      data: { count, message: `${count} tasks deleted` },
    });
  } catch (error) {
    next(error);
  }
}

// ─────────────────────────────
// SUBTASKS
// ─────────────────────────────

/**
 * POST /api/tasks/:id/subtasks
 */
export async function addSubtaskController(
  req: Request<{ id: string }, {}, SubtaskInput>,
  res: Response,
  next: NextFunction,
) {
  try {
    const userId = req.userId!;
    const taskId = parseInt(req.params.id);
    const { title } = req.body;

    const subtask = await tasksService.addSubtask(userId, taskId, title);

    res.status(201).json({
      success: true,
      data: { subtask },
    });
  } catch (error: any) {
    if (error.message === "TASK_NOT_FOUND") {
      return res.status(404).json({
        success: false,
        error: {
          code: "NOT_FOUND",
          message: "Task not found",
        },
      });
    }
    if (error.message === "FORBIDDEN") {
      return res.status(403).json({
        success: false,
        error: {
          code: "FORBIDDEN",
          message: "You do not have permission to add subtask to this task",
        },
      });
    }
    return next(error);
  }
}

/**
 * PATCH /api/tasks/:taskId/subtasks/:subtaskId/done
 */
export async function toggleSubtaskController(
  req: Request<{ taskId: string; subtaskId: string }>,
  res: Response,
  next: NextFunction,
) {
  try {
    const userId = req.userId!;
    const subtaskId = parseInt(req.params.subtaskId);

    const subtask = await tasksService.toggleSubtask(userId, subtaskId);

    res.json({
      success: true,
      data: { subtask },
    });
  } catch (error: any) {
    if (error.message === "SUBTASK_NOT_FOUND") {
      return res.status(404).json({
        success: false,
        error: {
          code: "NOT_FOUND",
          message: "Subtask not found",
        },
      });
    }
    if (error.message === "FORBIDDEN") {
      return res.status(403).json({
        success: false,
        error: {
          code: "FORBIDDEN",
          message: "You do not have permission to update this subtask",
        },
      });
    }
    return next(error);
  }
}

/**
 * DELETE /api/tasks/:taskId/subtasks/:subtaskId
 */
export async function deleteSubtaskController(
  req: Request<{ taskId: string; subtaskId: string }>,
  res: Response,
  next: NextFunction,
) {
  try {
    const userId = req.userId!;
    const subtaskId = parseInt(req.params.subtaskId);

    await tasksService.deleteSubtask(userId, subtaskId);

    res.json({
      success: true,
      data: { message: "Subtask deleted successfully" },
    });
  } catch (error: any) {
    if (error.message === "SUBTASK_NOT_FOUND") {
      return res.status(404).json({
        success: false,
        error: {
          code: "NOT_FOUND",
          message: "Subtask not found",
        },
      });
    }
    if (error.message === "FORBIDDEN") {
      return res.status(403).json({
        success: false,
        error: {
          code: "FORBIDDEN",
          message: "You do not have permission to delete this subtask",
        },
      });
    }
    return next(error);
  }
}
