import prisma from "../../config/prisma";

/**
 * ดึง tags ทั้งหมดของ user พร้อมนับจำนวน tasks
 */
export async function getTags(userId: number) {
  const tags = await prisma.tag.findMany({
    where: { userId },
    include: {
      _count: {
        select: { taskTags: true },
      },
    },
    orderBy: { createdAt: "asc" },
  });

  return tags.map((tag) => ({
    id: tag.id,
    name: tag.name,
    createdAt: tag.createdAt,
    taskCount: tag._count.taskTags,
  }));
}

/**
 * สร้าง Tag ใหม่
 */
export async function createTag(userId: number, name: string) {
  // ตรวจสอบชื่อซ้ำ
  const existing = await prisma.tag.findUnique({
    where: {
      userId_name: {
        userId,
        name,
      },
    },
  });

  if (existing) {
    throw new Error("TAG_EXISTS");
  }

  const tag = await prisma.tag.create({
    data: {
      userId,
      name,
    },
  });

  return tag;
}

/**
 * ลบ Tag
 */
export async function deleteTag(userId: number, tagId: number) {
  // ตรวจสอบ ownership
  const tag = await prisma.tag.findUnique({
    where: { id: tagId },
  });

  if (!tag) {
    throw new Error("TAG_NOT_FOUND");
  }

  if (tag.userId !== userId) {
    throw new Error("FORBIDDEN");
  }

  await prisma.tag.delete({
    where: { id: tagId },
  });
}
