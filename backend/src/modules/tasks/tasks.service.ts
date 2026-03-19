import prisma from "../../config/prisma";
import type {
  CreateTaskInput,
  UpdateTaskInput,
  QueryInput,
} from "../../schemas/task.schema";

/**
 * ดึง tasks ทั้งหมดของ user พร้อม filter, search, sort
 */
export async function getTasks(userId: number, query: QueryInput) {
  const { search, view, priority, tag, sort, order, page, limit } = query;

  // Build WHERE clause
  const where: any = { userId };

  // Search
  if (search) {
    where.OR = [
      { title: { contains: search, mode: "insensitive" } },
      { description: { contains: search, mode: "insensitive" } },
    ];
  }

  // Filter by priority
  if (priority) {
    where.priority = priority;
  }

  // Filter by tag
  if (tag) {
    where.taskTags = {
      some: {
        tag: {
          name: { equals: tag, mode: "insensitive" },
        },
      },
    };
  }

  // Filter by view
  if (view) {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    switch (view) {
      case "today":
        where.isDone = false;
        where.dueDate = { gte: today, lt: tomorrow };
        break;
      case "upcoming":
        where.isDone = false;
        where.dueDate = { gte: tomorrow };
        break;
      case "overdue":
        where.isDone = false;
        where.dueDate = { lt: today };
        break;
      case "done":
        where.isDone = true;
        break;
      case "all":
      default:
        // ไม่ filter
        break;
    }
  }

  // Sorting
  const orderBy: any = {};
  if (sort === "due_date") {
    orderBy.dueDate = order;
  } else if (sort === "priority") {
    orderBy.priority = order;
  } else if (sort === "title") {
    orderBy.title = order;
  } else {
    orderBy.createdAt = order;
  }

  // Pagination
  const pageNum = parseInt(page);
  const limitNum = parseInt(limit);
  const skip = (pageNum - 1) * limitNum;

  // Query
  const [tasks, total] = await Promise.all([
    prisma.task.findMany({
      where,
      include: {
        taskTags: {
          include: {
            tag: true,
          },
        },
        subtasks: {
          orderBy: { position: "asc" },
        },
      },
      orderBy,
      skip,
      take: limitNum,
    }),
    prisma.task.count({ where }),
  ]);

  // Format response
  const formattedTasks = tasks.map((task: any) => ({
    ...task,
    tags: task.taskTags.map((tt: any) => tt.tag),
    taskTags: undefined, // ลบ field นี้ออก
  }));

  return {
    tasks: formattedTasks,
    meta: {
      total,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum),
    },
  };
}

/**
 * สร้าง Task ใหม่
 */
export async function createTask(userId: number, data: CreateTaskInput) {
  const { tagIds, ...taskData } = data;

  const task = await prisma.task.create({
    data: {
      ...taskData,
      userId,
      dueDate: data.dueDate ? new Date(data.dueDate) : null,
      taskTags:
        tagIds && tagIds.length > 0
          ? {
              create: tagIds.map((tagId) => ({ tagId })),
            }
          : undefined,
    },
    include: {
      taskTags: {
        include: {
          tag: true,
        },
      },
      subtasks: true,
    },
  });

  return {
    ...task,
    tags: task.taskTags.map((tt: any) => tt.tag),
    taskTags: undefined,
  };
}

/**
 * อัปเดต Task
 */
export async function updateTask(
  userId: number,
  taskId: number,
  data: UpdateTaskInput,
) {
  // ตรวจสอบ ownership
  const existingTask = await prisma.task.findUnique({
    where: { id: taskId },
  });

  if (!existingTask) {
    throw new Error("TASK_NOT_FOUND");
  }

  if (existingTask.userId !== userId) {
    throw new Error("FORBIDDEN");
  }

  const { tagIds, ...taskData } = data;

  // ถ้ามี tagIds ให้ลบ relations เก่าและสร้างใหม่
  if (tagIds !== undefined) {
    await prisma.taskTag.deleteMany({
      where: { taskId },
    });
  }

  const task = await prisma.task.update({
    where: { id: taskId },
    data: {
      ...taskData,
      dueDate:
        data.dueDate !== undefined
          ? data.dueDate
            ? new Date(data.dueDate)
            : null
          : undefined,
      taskTags:
        tagIds !== undefined && tagIds.length > 0
          ? {
              create: tagIds.map((tagId) => ({ tagId })),
            }
          : undefined,
    },
    include: {
      taskTags: {
        include: {
          tag: true,
        },
      },
      subtasks: {
        orderBy: { position: "asc" },
      },
    },
  });

  return {
    ...task,
    tags: task.taskTags.map((tt: any) => tt.tag),
    taskTags: undefined,
  };
}

/**
 * ลบ Task
 */
export async function deleteTask(userId: number, taskId: number) {
  // ตรวจสอบ ownership
  const task = await prisma.task.findUnique({
    where: { id: taskId },
  });

  if (!task) {
    throw new Error("TASK_NOT_FOUND");
  }

  if (task.userId !== userId) {
    throw new Error("FORBIDDEN");
  }

  await prisma.task.delete({
    where: { id: taskId },
  });
}

/**
 * Toggle isDone
 */
export async function toggleDone(userId: number, taskId: number) {
  // ตรวจสอบ ownership
  const task = await prisma.task.findUnique({
    where: { id: taskId },
  });

  if (!task) {
    throw new Error("TASK_NOT_FOUND");
  }

  if (task.userId !== userId) {
    throw new Error("FORBIDDEN");
  }

  const updated = await prisma.task.update({
    where: { id: taskId },
    data: { isDone: !task.isDone },
  });

  return updated;
}

/**
 * อัปเดต position
 */
export async function updatePosition(
  userId: number,
  taskId: number,
  position: number,
) {
  // ตรวจสอบ ownership
  const task = await prisma.task.findUnique({
    where: { id: taskId },
  });

  if (!task) {
    throw new Error("TASK_NOT_FOUND");
  }

  if (task.userId !== userId) {
    throw new Error("FORBIDDEN");
  }

  await prisma.task.update({
    where: { id: taskId },
    data: { position },
  });
}

/**
 * Bulk mark done
 */
export async function bulkDone(userId: number, taskIds: number[]) {
  const result = await prisma.task.updateMany({
    where: {
      id: { in: taskIds },
      userId,
    },
    data: { isDone: true },
  });

  return result.count;
}

/**
 * Bulk delete
 */
export async function bulkDelete(userId: number, taskIds: number[]) {
  const result = await prisma.task.deleteMany({
    where: {
      id: { in: taskIds },
      userId,
    },
  });

  return result.count;
}

// ─────────────────────────────
// SUBTASKS
// ─────────────────────────────

/**
 * เพิ่ม Subtask
 */
export async function addSubtask(
  userId: number,
  taskId: number,
  title: string,
) {
  // ตรวจสอบ task ownership
  const task = await prisma.task.findUnique({
    where: { id: taskId },
  });

  if (!task) {
    throw new Error("TASK_NOT_FOUND");
  }

  if (task.userId !== userId) {
    throw new Error("FORBIDDEN");
  }

  // หา position สูงสุด
  const lastSubtask = await prisma.subtask.findFirst({
    where: { taskId },
    orderBy: { position: "desc" },
  });

  const position = lastSubtask ? lastSubtask.position + 1 : 0;

  const subtask = await prisma.subtask.create({
    data: {
      taskId,
      title,
      position,
    },
  });

  return subtask;
}

/**
 * Toggle subtask done
 */
export async function toggleSubtask(userId: number, subtaskId: number) {
  // ตรวจสอบ ownership ผ่าน task
  const subtask = await prisma.subtask.findUnique({
    where: { id: subtaskId },
    include: { task: true },
  });

  if (!subtask) {
    throw new Error("SUBTASK_NOT_FOUND");
  }

  if (subtask.task.userId !== userId) {
    throw new Error("FORBIDDEN");
  }

  const updated = await prisma.subtask.update({
    where: { id: subtaskId },
    data: { isDone: !subtask.isDone },
  });

  return updated;
}

/**
 * ลบ Subtask
 */
export async function deleteSubtask(userId: number, subtaskId: number) {
  // ตรวจสอบ ownership ผ่าน task
  const subtask = await prisma.subtask.findUnique({
    where: { id: subtaskId },
    include: { task: true },
  });

  if (!subtask) {
    throw new Error("SUBTASK_NOT_FOUND");
  }

  if (subtask.task.userId !== userId) {
    throw new Error("FORBIDDEN");
  }

  await prisma.subtask.delete({
    where: { id: subtaskId },
  });
}
