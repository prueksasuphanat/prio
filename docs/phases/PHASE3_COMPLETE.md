# ✅ Phase 3 Complete — Tasks API

**สถานะ:** 🟢 เสร็จสมบูรณ์  
**วันที่:** 2026-03-20

---

## สรุปภาพรวม

Phase 3 เสร็จสมบูรณ์ — Tasks API พร้อมใช้งาน ครอบคลุม CRUD operations, bulk actions, subtasks, tags, และ filter/search/sort

---

## ✅ งานที่เสร็จแล้ว

### 3.1 Task Schemas (Zod)

- ✅ `createTaskSchema` — title, description, priority, dueDate, tagIds
- ✅ `updateTaskSchema` — ทุก field optional
- ✅ `bulkSchema` — taskIds array
- ✅ `querySchema` — search, view, priority, tag, sort, order, page, limit
- ✅ `positionSchema` — position number
- ✅ `subtaskSchema` — title
- ✅ `Priority` enum — High, Medium, Low

### 3.2 Task Service

- ✅ `getTasks()` — filter, search, sort, pagination
  - View filters: all, today, upcoming, overdue, done
  - Search: title และ description
  - Sort: created_at, due_date, priority, title
  - Pagination: page, limit
- ✅ `createTask()` — สร้าง task + เชื่อม tags
- ✅ `updateTask()` — อัปเดต task + verify ownership
- ✅ `deleteTask()` — ลบ task + verify ownership
- ✅ `toggleDone()` — toggle isDone status
- ✅ `updatePosition()` — อัปเดต position สำหรับ drag & drop
- ✅ `bulkDone()` — mark หลาย tasks เป็น done
- ✅ `bulkDelete()` — ลบหลาย tasks

### 3.3 Subtask Service

- ✅ `addSubtask()` — เพิ่ม subtask + verify ownership
- ✅ `toggleSubtask()` — toggle subtask isDone
- ✅ `deleteSubtask()` — ลบ subtask

### 3.4 Tag Service

- ✅ `getTags()` — ดึง tags พร้อมนับจำนวน tasks
- ✅ `createTag()` — สร้าง tag + ตรวจชื่อซ้ำ
- ✅ `deleteTag()` — ลบ tag + verify ownership

### 3.5 Controllers

- ✅ Tasks Controller — 11 endpoints
  - GET /tasks — ดึง tasks พร้อม filter/search/sort
  - POST /tasks — สร้าง task
  - PATCH /tasks/:id — อัปเดต task
  - DELETE /tasks/:id — ลบ task
  - PATCH /tasks/:id/done — toggle done
  - PATCH /tasks/:id/position — อัปเดต position
  - PATCH /tasks/bulk/done — bulk mark done
  - DELETE /tasks/bulk — bulk delete
  - POST /tasks/:id/subtasks — เพิ่ม subtask
  - PATCH /tasks/:taskId/subtasks/:subtaskId/done — toggle subtask
  - DELETE /tasks/:taskId/subtasks/:subtaskId — ลบ subtask
- ✅ Tags Controller — 3 endpoints
  - GET /tags — ดึง tags
  - POST /tags — สร้าง tag
  - DELETE /tags/:id — ลบ tag

### 3.6 Routers

- ✅ Tasks Router — ทุก route ผ่าน auth middleware
- ✅ Tags Router — ทุก route ผ่าน auth middleware
- ✅ ลงทะเบียน routers ใน `index.ts`

### 3.7 Middleware Updates

- ✅ `validate()` — รองรับ query validation
- ✅ Global error handler — จัดการ Prisma errors (P2002, P2025)

### 3.8 Postman Collection

- ✅ อัปเดต collection พร้อม Tasks API endpoints (11 requests)
- ✅ อัปเดต collection พร้อม Tags API endpoints (3 requests)
- ✅ ทุก request มี description และ example body

---

## 📁 ไฟล์ที่สร้าง/แก้ไข

### สร้างใหม่

```
backend/src/schemas/task.schema.ts
backend/src/modules/tasks/tasks.service.ts
backend/src/modules/tasks/tasks.controller.ts
backend/src/modules/tasks/tasks.router.ts
backend/src/modules/tags/tags.service.ts
backend/src/modules/tags/tags.controller.ts
backend/src/modules/tags/tags.router.ts
```

### แก้ไข

```
backend/src/index.ts — ลงทะเบียน routers + Prisma error handling
backend/src/middleware/validate.ts — รองรับ query validation
postman/Prio_API.postman_collection.json — เพิ่ม Tasks & Tags endpoints
```

---

## 🔧 Technical Details

### Ownership Verification

ทุก operation ตรวจสอบ ownership ก่อนดำเนินการ:

- Tasks: ตรวจ `task.userId === req.userId`
- Subtasks: ตรวจผ่าน `task.userId`
- Tags: ตรวจ `tag.userId === req.userId`

### Error Handling

- `TASK_NOT_FOUND` → 404
- `SUBTASK_NOT_FOUND` → 404
- `TAG_NOT_FOUND` → 404
- `TAG_EXISTS` → 409
- `FORBIDDEN` → 403
- Prisma P2002 (unique constraint) → 409
- Prisma P2025 (record not found) → 404

### Query Features

- **Search**: ค้นหาใน title และ description (case-insensitive)
- **View filters**:
  - `all` — ทั้งหมด
  - `today` — due date วันนี้
  - `upcoming` — due date หลังวันนี้
  - `overdue` — due date ก่อนวันนี้
  - `done` — isDone = true
- **Sort**: created_at, due_date, priority, title
- **Order**: asc, desc
- **Pagination**: page, limit (default: page=1, limit=20)

### Response Format

ทุก endpoint ใช้ format เดียวกัน:

```json
{
  "success": true,
  "data": { ... },
  "meta": { ... }  // สำหรับ pagination
}
```

---

## 🧪 การทดสอบ

### ทดสอบด้วย Postman

1. Login ด้วย demo user หรือ register user ใหม่
2. ทดสอบ Tasks endpoints:
   - ✅ GET /tasks — ดึง tasks
   - ✅ POST /tasks — สร้าง task
   - ✅ PATCH /tasks/:id — อัปเดต task
   - ✅ DELETE /tasks/:id — ลบ task
   - ✅ PATCH /tasks/:id/done — toggle done
   - ✅ PATCH /tasks/bulk/done — bulk mark done
   - ✅ DELETE /tasks/bulk — bulk delete
   - ✅ Subtasks: add, toggle, delete
3. ทดสอบ Tags endpoints:
   - ✅ GET /tags — ดึง tags
   - ✅ POST /tags — สร้าง tag
   - ✅ DELETE /tags/:id — ลบ tag
4. ทดสอบ filters:
   - ✅ search=keyword
   - ✅ view=today, upcoming, overdue, done
   - ✅ priority=High, Medium, Low
   - ✅ sort=due_date, priority, title
5. ทดสอบ ownership:
   - ✅ User A ไม่สามารถแก้/ลบ task ของ User B (403)

---

## 📊 API Endpoints Summary

### Tasks (11 endpoints)

- `GET /api/tasks` — ดึง tasks พร้อม filter/search/sort
- `POST /api/tasks` — สร้าง task
- `PATCH /api/tasks/:id` — อัปเดต task
- `DELETE /api/tasks/:id` — ลบ task
- `PATCH /api/tasks/:id/done` — toggle done
- `PATCH /api/tasks/:id/position` — อัปเดต position
- `PATCH /api/tasks/bulk/done` — bulk mark done
- `DELETE /api/tasks/bulk` — bulk delete
- `POST /api/tasks/:id/subtasks` — เพิ่ม subtask
- `PATCH /api/tasks/:taskId/subtasks/:subtaskId/done` — toggle subtask
- `DELETE /api/tasks/:taskId/subtasks/:subtaskId` — ลบ subtask

### Tags (3 endpoints)

- `GET /api/tags` — ดึง tags พร้อมนับจำนวน tasks
- `POST /api/tags` — สร้าง tag
- `DELETE /api/tags/:id` — ลบ tag

---

## 🎯 ต่อไป: Phase 4 — Frontend Structure

Phase 4 จะเริ่มสร้าง frontend:

- TypeScript types
- API service layer (Axios)
- Pinia stores (auth, ui)
- Composables (useAuth, useTasks, useToast)
- Vue Router + navigation guards
- Base UI components
- Layout components
- Task components
- Views (Landing, Auth, Dashboard)

---

_Phase 3 เสร็จสมบูรณ์ — Tasks API พร้อมใช้งาน! 🎉_
