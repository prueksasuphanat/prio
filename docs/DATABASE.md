# 🗄️ DATABASE.md — Schema & Data Design

## Prisma Schema (เต็ม)

```prisma
// prio/backend/prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// ─────────────────────────────
// USERS
// ─────────────────────────────
model User {
  id            Int      @id @default(autoincrement())
  name          String
  email         String   @unique
  passwordHash  String   @map("password_hash")
  createdAt     DateTime @default(now()) @map("created_at")
  updatedAt     DateTime @updatedAt @map("updated_at")

  tasks         Task[]
  tags          Tag[]
  refreshTokens RefreshToken[]

  @@map("users")
}

// ─────────────────────────────
// TASKS
// ─────────────────────────────
model Task {
  id          Int       @id @default(autoincrement())
  userId      Int       @map("user_id")
  title       String
  description String?
  priority    Priority  @default(Medium)
  dueDate     DateTime? @map("due_date")
  isDone      Boolean   @default(false) @map("is_done")
  position    Int       @default(0)
  createdAt   DateTime  @default(now()) @map("created_at")
  updatedAt   DateTime  @updatedAt @map("updated_at")

  user        User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  taskTags    TaskTag[]
  subtasks    Subtask[]

  @@index([userId])
  @@index([userId, isDone])
  @@index([userId, dueDate])
  @@map("tasks")
}

// ─────────────────────────────
// SUBTASKS
// ─────────────────────────────
model Subtask {
  id        Int      @id @default(autoincrement())
  taskId    Int      @map("task_id")
  title     String
  isDone    Boolean  @default(false) @map("is_done")
  position  Int      @default(0)
  createdAt DateTime @default(now()) @map("created_at")

  task      Task     @relation(fields: [taskId], references: [id], onDelete: Cascade)

  @@index([taskId])
  @@map("subtasks")
}

// ─────────────────────────────
// TAGS
// ─────────────────────────────
model Tag {
  id        Int       @id @default(autoincrement())
  userId    Int       @map("user_id")
  name      String
  createdAt DateTime  @default(now()) @map("created_at")

  user      User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  taskTags  TaskTag[]

  @@unique([userId, name])   // user เดียวกันมี tag ชื่อซ้ำไม่ได้
  @@index([userId])
  @@map("tags")
}

// ─────────────────────────────
// TASK_TAGS (Junction)
// ─────────────────────────────
model TaskTag {
  taskId Int  @map("task_id")
  tagId  Int  @map("tag_id")

  task   Task @relation(fields: [taskId], references: [id], onDelete: Cascade)
  tag    Tag  @relation(fields: [tagId], references: [id], onDelete: Cascade)

  @@id([taskId, tagId])
  @@map("task_tags")
}

// ─────────────────────────────
// REFRESH TOKENS
// ─────────────────────────────
model RefreshToken {
  id        Int      @id @default(autoincrement())
  userId    Int      @map("user_id")
  token     String   @unique
  expiresAt DateTime @map("expires_at")
  createdAt DateTime @default(now()) @map("created_at")

  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
  @@map("refresh_tokens")
}

// ─────────────────────────────
// ENUM
// ─────────────────────────────
enum Priority {
  High
  Medium
  Low
}
```

---

## ER Diagram (Text)

```
users (1) ──────────────────────── (N) tasks
  id                                     id
  name                                   user_id ──► users.id
  email                                  title
  password_hash                          description
                                         priority
                                         due_date
                                         is_done
                                         position

tasks (1) ──────────────────────── (N) subtasks
                                         id
                                         task_id ──► tasks.id
                                         title
                                         is_done
                                         position

tasks (N) ───── task_tags ───── (N) tags
                  task_id              id
                  tag_id               user_id ──► users.id
                                       name
```

---

## Migration Commands

```bash
# สร้าง migration ครั้งแรก
npx prisma migrate dev --name init

# สร้าง migration หลัง schema เปลี่ยน
npx prisma migrate dev --name add_subtasks

# Apply บน production
npx prisma migrate deploy

# Reset (⚠️ ลบข้อมูลทั้งหมด — dev only)
npx prisma migrate reset

# Generate Prisma Client หลังแก้ schema
npx prisma generate

# เปิด GUI ตรวจ data
npx prisma studio
```

---

## Seed Data

```typescript
// prio/backend/prisma/seed.ts
import { PrismaClient, Priority } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  const hash = await bcrypt.hash('password123', 12)

  const user = await prisma.user.create({
    data: {
      name: 'Demo User',
      email: 'demo@prio.app',
      passwordHash: hash,
    },
  })

  const tagWork   = await prisma.tag.create({ data: { userId: user.id, name: 'Work' } })
  const tagDev    = await prisma.tag.create({ data: { userId: user.id, name: 'Dev' } })
  const tagDesign = await prisma.tag.create({ data: { userId: user.id, name: 'Design' } })

  await prisma.task.create({
    data: {
      userId: user.id,
      title: 'ส่งรายงาน Q3',
      description: 'รวมยอดขายรายไตรมาสและส่ง PDF',
      priority: Priority.High,
      dueDate: new Date('2025-03-22'),
      taskTags: { create: [{ tagId: tagWork.id }] },
      subtasks: {
        create: [
          { title: 'รวบรวมข้อมูล', isDone: true,  position: 0 },
          { title: 'สร้าง Slide',   isDone: false, position: 1 },
          { title: 'ส่งอีเมล',      isDone: false, position: 2 },
        ],
      },
    },
  })

  await prisma.task.create({
    data: {
      userId: user.id,
      title: 'Review Pull Request #42',
      priority: Priority.Medium,
      dueDate: new Date('2025-03-25'),
      taskTags: { create: [{ tagId: tagDev.id }] },
    },
  })

  await prisma.task.create({
    data: {
      userId: user.id,
      title: 'ออกแบบ Wireframe Dashboard',
      priority: Priority.Low,
      dueDate: new Date('2025-03-30'),
      taskTags: { create: [{ tagId: tagDesign.id }, { tagId: tagWork.id }] },
    },
  })

  console.log('✅ Seed complete — demo@prio.app / password123')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
```

```json
// package.json — เพิ่ม seed script
{
  "prisma": {
    "seed": "ts-node prisma/seed.ts"
  }
}
```

---

## Query Examples

```typescript
// ดึง tasks ของ user พร้อม tags และ subtasks
const tasks = await prisma.task.findMany({
  where: { userId: req.userId, isDone: false },
  include: {
    taskTags: { include: { tag: true } },
    subtasks: { orderBy: { position: 'asc' } },
  },
  orderBy: { createdAt: 'desc' },
})

// Filter หลายเงื่อนไข (view = today)
const today = new Date()
today.setHours(0, 0, 0, 0)
const tomorrow = new Date(today)
tomorrow.setDate(tomorrow.getDate() + 1)

const todayTasks = await prisma.task.findMany({
  where: {
    userId: req.userId,
    isDone: false,
    dueDate: { gte: today, lt: tomorrow },
  },
})

// Bulk update (ต้องตรวจ ownership เสมอ)
await prisma.task.updateMany({
  where: {
    id: { in: taskIds },
    userId: req.userId,   // ← สำคัญมาก
  },
  data: { isDone: true },
})

// Bulk delete
await prisma.task.deleteMany({
  where: {
    id: { in: taskIds },
    userId: req.userId,
  },
})
```

---

## Indexes ที่ควรมี

| Table | Column(s) | เหตุผล |
|-------|-----------|--------|
| tasks | `user_id` | ทุก query filter ด้วย user |
| tasks | `user_id, is_done` | filter view done/active |
| tasks | `user_id, due_date` | filter today/upcoming/overdue |
| subtasks | `task_id` | load subtasks ตาม task |
| tags | `user_id` | load tags ของ user |
| refresh_tokens | `user_id` | lookup token เร็ว |

---

*อัปเดตล่าสุด: 2025-03-19*
