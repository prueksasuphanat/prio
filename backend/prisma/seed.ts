import { PrismaClient, Priority } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting seed...");

  // สร้าง demo user
  const passwordHash = await bcrypt.hash("password123", 12);

  const user = await prisma.user.create({
    data: {
      name: "Demo User",
      email: "demo@prio.app",
      passwordHash,
    },
  });

  console.log("✅ Created user:", user.email);

  // สร้าง tags
  const tagWork = await prisma.tag.create({
    data: { userId: user.id, name: "Work" },
  });

  const tagDev = await prisma.tag.create({
    data: { userId: user.id, name: "Dev" },
  });

  const tagDesign = await prisma.tag.create({
    data: { userId: user.id, name: "Design" },
  });

  console.log("✅ Created tags: Work, Dev, Design");

  // สร้าง tasks พร้อม subtasks
  await prisma.task.create({
    data: {
      userId: user.id,
      title: "ส่งรายงาน Q3",
      description: "รวมยอดขายรายไตรมาสและส่ง PDF ให้ผู้บริหาร",
      priority: Priority.High,
      dueDate: new Date("2025-03-22"),
      position: 0,
      taskTags: {
        create: [{ tagId: tagWork.id }],
      },
      subtasks: {
        create: [
          { title: "รวบรวมข้อมูลยอดขาย", isDone: true, position: 0 },
          { title: "สร้าง Slide นำเสนอ", isDone: false, position: 1 },
          { title: "ส่งอีเมลถึงผู้บริหาร", isDone: false, position: 2 },
        ],
      },
    },
  });

  await prisma.task.create({
    data: {
      userId: user.id,
      title: "Review Pull Request #42",
      description: "ตรวจสอบ code และให้ feedback",
      priority: Priority.Medium,
      dueDate: new Date("2025-03-25"),
      position: 1,
      taskTags: {
        create: [{ tagId: tagDev.id }],
      },
    },
  });

  await prisma.task.create({
    data: {
      userId: user.id,
      title: "ออกแบบ Wireframe Dashboard",
      description: "สร้าง mockup หน้า dashboard ใหม่",
      priority: Priority.Low,
      dueDate: new Date("2025-03-30"),
      position: 2,
      taskTags: {
        create: [{ tagId: tagDesign.id }, { tagId: tagWork.id }],
      },
    },
  });

  await prisma.task.create({
    data: {
      userId: user.id,
      title: "ประชุมทีม Sprint Planning",
      priority: Priority.High,
      dueDate: new Date("2025-03-21"),
      position: 3,
      taskTags: {
        create: [{ tagId: tagWork.id }],
      },
      subtasks: {
        create: [
          { title: "เตรียม agenda", isDone: true, position: 0 },
          { title: "ส่งลิงก์ Zoom", isDone: false, position: 1 },
        ],
      },
    },
  });

  await prisma.task.create({
    data: {
      userId: user.id,
      title: "เขียน Unit Tests",
      description: "เพิ่ม test coverage ให้ครบ 80%",
      priority: Priority.Medium,
      dueDate: new Date("2025-03-28"),
      position: 4,
      isDone: true,
      taskTags: {
        create: [{ tagId: tagDev.id }],
      },
    },
  });

  console.log("✅ Created 5 tasks with subtasks");
  console.log("");
  console.log("🎉 Seed complete!");
  console.log("📧 Email: demo@prio.app");
  console.log("🔑 Password: password123");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
