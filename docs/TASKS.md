# ✅ TASKS.md — Task Breakdown by Phase

> วิธีใช้: เมื่อทำ task ไหนเสร็จให้เปลี่ยน `[ ]` → `[x]`
> สถานะ: 🔴 ยังไม่เริ่ม · 🟡 กำลังทำ · 🟢 เสร็จแล้ว

---

## PHASE 0 — Project Setup

> **เป้าหมาย:** project วิ่งได้บนเครื่อง, เห็น Hello World ทั้งสองฝั่ง

---

### 0.1 Monorepo Structure

- [x] **สร้าง root folder** และ init git
  - `mkdir prio && cd prio && git init`
- [x] **สร้างโครงสร้าง folders**
  - `mkdir frontend backend docs`
- [x] **เขียน `.gitignore`**
  - ครอบคลุม: `node_modules/`, `dist/`, `.env`, `*.log`
- [x] **เขียน `.gitattributes`**
  - `* text=auto eol=lf` — บังคับ LF ข้ามระบบ
- [x] **เขียน `README.md`**
  - อธิบาย project, tech stack, วิธี run dev

---

### 0.2 Frontend Init

- [x] **สร้าง Vue 3 project**
  - `npm create vue@latest .` เลือก: TypeScript, Vue Router, Pinia, ESLint, Prettier
- [x] **ติดตั้ง TailwindCSS**
  - `npm i -D tailwindcss @tailwindcss/vite` + config ใน `vite.config.ts`
- [x] **ติดตั้ง libraries ทั้งหมด**
  - `lucide-vue-next` — icons
  - `@vueuse/core` — useColorMode, useLocalStorage
  - `@tanstack/vue-query` — server state & caching
  - `vee-validate zod @vee-validate/zod` — form validation
  - `vue-draggable-plus` — drag & drop
  - `@formkit/auto-animate` — list animation
  - `dayjs` — จัดการ date
  - `axios` — HTTP client
  - `@fontsource/plus-jakarta-sans @fontsource/ibm-plex-mono` — fonts
- [x] **ตั้งค่า path alias**
  - `@/` ชี้ไปที่ `src/` ใน `vite.config.ts` และ `tsconfig.json`
- [x] **เขียน `frontend/.env`**
  - `VITE_API_URL=http://localhost:3000/api`
- [x] **เขียน `frontend/.env.example`**
  - template ไม่มีค่าจริง — commit ขึ้น git ได้
- [x] **ทดสอบ:** `npm run dev` → เห็นหน้าเว็บที่ `localhost:5173`

---

### 0.3 Backend Init

- [x] **init Node.js project**
  - `npm init -y`
- [x] **ติดตั้ง dependencies**
  - `express cors helmet express-rate-limit bcryptjs jsonwebtoken dotenv`
- [x] **ติดตั้ง dev dependencies**
  - `typescript @types/express @types/node @types/bcryptjs @types/jsonwebtoken ts-node-dev`
- [x] **ตั้งค่า TypeScript**
  - `npx tsc --init` + ปรับ `tsconfig.json` (target: ES2020, outDir: dist, rootDir: src)
- [x] **สร้าง folder structure**
  ```
  backend/src/
  ├── index.ts
  ├── config/
  ├── middleware/
  ├── modules/
  ├── schemas/
  └── utils/
  ```
- [x] **เขียน `backend/.env`**
  - `DATABASE_URL`, `JWT_SECRET`, `JWT_REFRESH_SECRET`, `PORT=3000`, `CLIENT_URL`
- [x] **เขียน `backend/.env.example`**
  - template ไม่มีค่าจริง — commit ขึ้น git ได้
- [x] **เขียน Express app เบื้องต้น** ใน `src/index.ts`
  - ใส่ `helmet()`, `cors()`, `express.json()`
  - route ทดสอบ: `GET /health → { status: "ok" }`
- [x] **เพิ่ม npm scripts**
  - `"dev": "ts-node-dev src/index.ts"`, `"build": "tsc"`, `"start": "node dist/index.js"`
- [x] **ทดสอบ:** `npm run dev` → `curl localhost:3000/health` ได้ `{ status: "ok" }`

---

### 0.4 Prisma Init

- [x] **ติดตั้ง Prisma**
  - `npm i prisma @prisma/client` + `npx prisma init`
- [x] **ตั้งค่า DATABASE_URL** ใน `.env`
  - ใช้ local PostgreSQL หรือ Supabase free tier
- [x] **ทดสอบ connection:** `npx prisma migrate dev --name test`

---

## PHASE 1 — Database Schema

> **เป้าหมาย:** tables ถูกสร้างใน DB, Prisma Client ใช้งานได้

---

### 1.1 เขียน Prisma Schema

- [x] **เขียน model `User`**
  - fields: `id, name, email, passwordHash, createdAt, updatedAt`
  - constraint: `email @unique`
- [x] **เขียน model `Task`**
  - fields: `id, userId, title, description, priority, dueDate, isDone, position, createdAt, updatedAt`
  - relation: `userId → User` (onDelete: Cascade)
  - indexes: `@@index([userId])`, `@@index([userId, isDone])`, `@@index([userId, dueDate])`
- [x] **เขียน model `Subtask`**
  - fields: `id, taskId, title, isDone, position, createdAt`
  - relation: `taskId → Task` (onDelete: Cascade)
- [x] **เขียน model `Tag`**
  - fields: `id, userId, name, createdAt`
  - constraint: `@@unique([userId, name])`
- [x] **เขียน model `TaskTag`** (junction)
  - composite key: `@@id([taskId, tagId])`
  - onDelete: Cascade ทั้งสองฝั่ง
- [x] **เขียน model `RefreshToken`**
  - fields: `id, userId, token, expiresAt, createdAt`
  - constraint: `token @unique`
- [x] **เพิ่ม enum `Priority`**
  - values: `High, Medium, Low`

---

### 1.2 Migration & Generate

- [x] **Run migration**
  - `npx prisma migrate dev --name init`
- [x] **Generate Prisma Client**
  - `npx prisma generate`
- [x] **ตรวจสอบด้วย Prisma Studio**
  - `npx prisma studio` → เช็กว่า tables ครบและ schema ถูก

---

### 1.3 Prisma Client Setup

- [x] **สร้าง `src/config/prisma.ts`**
  - export singleton `PrismaClient` instance
  - จัดการ graceful shutdown (`$disconnect`)

---

### 1.4 Seed Data

- [x] **เขียน `prisma/seed.ts`**
  - สร้าง demo user: `demo@prio.app` / `password123`
  - สร้าง tasks + tags ตัวอย่าง
- [x] **เพิ่ม seed script** ใน `package.json`
  - `"prisma": { "seed": "ts-node prisma/seed.ts" }`
- [x] **ทดสอบ:** `npx prisma db seed` → เห็นข้อมูลใน Prisma Studio

---

## PHASE 2 — Auth API

> **เป้าหมาย:** register, login, refresh, logout ทำงานถูกต้อง

---

### 2.1 Utilities

- [x] **เขียน `utils/hash.ts`**
  - `hashPassword(password)` — bcrypt hash (rounds: 12)
  - `comparePassword(password, hash)` — bcrypt compare
- [x] **เขียน `utils/jwt.ts`**
  - `signAccessToken(userId)` — expire 15m
  - `signRefreshToken(userId)` — expire 7d
  - `verifyAccessToken(token)` → payload หรือ throw
  - `verifyRefreshToken(token)` → payload หรือ throw

---

### 2.2 Schemas (Zod)

- [x] **เขียน `schemas/auth.schema.ts`**
  - `registerSchema`: name (min 1), email (valid), password (min 8)
  - `loginSchema`: email, password

---

### 2.3 Middleware

- [x] **เขียน `middleware/validate.ts`**
  - รับ Zod schema → validate `req.body`
  - ถ้าไม่ผ่าน → return 400 + error details
- [x] **เขียน `middleware/auth.ts`**
  - ดึง token จาก `Authorization: Bearer <token>`
  - verify → ใส่ `req.userId`
  - ถ้า token หมดอายุหรือผิด → return 401
- [x] **เขียน `middleware/rateLimit.ts`**
  - `authLimiter`: 10 req / 15 min (login/register)
  - `generalLimiter`: 100 req / 15 min

---

### 2.4 Auth Module

- [x] **เขียน `modules/auth/auth.service.ts`**
  - `register(name, email, password)`:
    - ตรวจ email ซ้ำ → throw 409 ถ้าซ้ำ
    - hash password → สร้าง user
    - return user (ไม่ return passwordHash)
  - `login(email, password)`:
    - หา user → compare password
    - สร้าง access + refresh token
    - บันทึก refresh token ใน DB
    - return `{ user, accessToken, refreshToken }`
  - `refresh(token)`:
    - verify + หาใน DB → throw 401 ถ้าหมดอายุ
    - สร้าง access token ใหม่
  - `logout(token)`:
    - ลบ refresh token จาก DB
- [x] **เขียน `modules/auth/auth.controller.ts`**
  - `register` → return 201
  - `login` → ตั้ง httpOnly cookie + return 200
  - `refresh` → อ่าน cookie → return 200
  - `logout` → อ่าน cookie → clear cookie → return 200
- [x] **เขียน `modules/auth/auth.router.ts`**
  - POST `/register` → validate → controller
  - POST `/login` → validate + rateLimit → controller
  - POST `/refresh` → controller
  - POST `/logout` → auth → controller
- [x] **ลงทะเบียน router** ใน `src/index.ts`

---

### 2.5 ทดสอบ Auth

- [x] register ได้ + password ถูก hash
- [x] login ได้ access token + refresh token ใน cookie
- [x] endpoint ที่ต้อง auth → reject ถ้าไม่มี token (401)
- [x] refresh token ใช้แลกได้
- [x] logout → cookie หาย + token ใน DB ลบแล้ว
- [x] email ซ้ำ → 409

---

## PHASE 3 — Tasks API

> **เป้าหมาย:** CRUD tasks ครบ + bulk + filter/sort/search ฝั่ง server

---

### 3.1 Task Schemas (Zod)

- [x] **เขียน `schemas/task.schema.ts`**
  - `createTaskSchema`: title (required), description, priority, dueDate, tagIds[]
  - `updateTaskSchema`: ทุก field optional (partial)
  - `bulkSchema`: taskIds (array of numbers, min 1)
  - `querySchema`: search, view, priority, tag, sort, order, page, limit

---

### 3.2 Task Service

- [x] **เขียน `modules/tasks/tasks.service.ts`**
  - `getTasks(userId, query)`:
    - build WHERE clause จาก query params
    - handle view: today, upcoming, overdue, done, all
    - include: taskTags → tag, subtasks
    - sort + paginate
  - `createTask(userId, data)`:
    - สร้าง task + เชื่อม tags ผ่าน TaskTag
  - `updateTask(userId, taskId, data)`:
    - verify ownership ก่อนเสมอ
    - ถ้าส่ง tagIds → ลบ relations เก่า → สร้างใหม่
  - `deleteTask(userId, taskId)`:
    - verify ownership → ลบ (cascade ลบ subtasks + taskTags)
  - `toggleDone(userId, taskId)`:
    - verify ownership → flip isDone
  - `updatePosition(userId, taskId, position)`:
    - verify ownership → อัปเดต position
  - `bulkDone(userId, taskIds)`:
    - updateMany WHERE id IN taskIds AND userId
  - `bulkDelete(userId, taskIds)`:
    - deleteMany WHERE id IN taskIds AND userId

---

### 3.3 Subtask Service

- [x] **เขียน subtask methods** (ใน tasks.service.ts หรือแยก)
  - `addSubtask(userId, taskId, title)` — verify task ownership ก่อน
  - `toggleSubtask(userId, subtaskId)` — verify ผ่าน task.userId
  - `deleteSubtask(userId, subtaskId)` — verify ผ่าน task.userId

---

### 3.4 Tag Service

- [x] **เขียน `modules/tags/tags.service.ts`**
  - `getTags(userId)` — include `_count: { taskTags: true }`
  - `createTag(userId, name)` — ตรวจชื่อซ้ำ
  - `deleteTag(userId, tagId)` — verify ownership

---

### 3.5 Controllers & Routers

- [x] **เขียน `modules/tasks/tasks.controller.ts`**
- [x] **เขียน `modules/tasks/tasks.router.ts`**
  - ทุก route ผ่าน `auth middleware`
  - PATCH `/bulk/done` และ DELETE `/bulk` ต้องมาก่อน `/:id`
- [x] **เขียน tags router + controller**
- [x] **ลงทะเบียน routers** ใน `src/index.ts`

---

### 3.6 Global Error Handler

- [x] **เขียน error middleware** ใน `src/index.ts`
  - format: `{ success: false, error: { code, message } }`
  - handle Prisma errors (P2002, P2025)
  - handle Zod errors
  - ซ่อน stack trace ใน production

---

### 3.7 ทดสอบ Tasks API

- [x] CRUD ครบด้วย Postman / curl
- [x] filter: view=today, overdue, search=keyword
- [x] sort: due_date, priority
- [x] bulk: mark done + delete
- [x] ownership: user A ไม่แก้ task ของ user B (403)
- [x] subtasks: add, toggle, delete

---

## PHASE 4 — Frontend Structure

> **เป้าหมาย:** Vue app มีโครงสร้างพร้อม, Auth flow ทำงานกับ API จริง

---

### 4.1 TypeScript Types

- [ ] **เขียน `types/task.types.ts`**
  - `Task`, `Subtask`, `Tag`, `Priority` (enum)
  - `CreateTaskDto`, `UpdateTaskDto`, `TaskQuery`
- [ ] **เขียน `types/auth.types.ts`**
  - `User`, `LoginDto`, `RegisterDto`, `AuthResponse`

---

### 4.2 API Service Layer

- [ ] **เขียน `services/api.ts`** (Axios instance)
  - `baseURL = import.meta.env.VITE_API_URL`
  - `withCredentials: true`
  - **Request interceptor**: แนบ `Authorization: Bearer <token>`
  - **Response interceptor**: 401 → refresh → retry → ถ้าล้มเหลว → logout
- [ ] **เขียน `services/auth.service.ts`**
  - `login(dto)`, `register(dto)`, `logout()`, `refresh()`
- [ ] **เขียน `services/task.service.ts`**
  - `getTasks(query)`, `createTask(dto)`, `updateTask(id, dto)`, `deleteTask(id)`
  - `toggleDone(id)`, `bulkDone(ids)`, `bulkDelete(ids)`
  - `addSubtask(taskId, title)`, `toggleSubtask(taskId, subtaskId)`, `deleteSubtask(taskId, subtaskId)`
  - `getTags()`, `createTag(name)`, `deleteTag(id)`

---

### 4.3 Pinia Stores

- [ ] **เขียน `stores/auth.store.ts`**
  - state: `user`, `accessToken`, `isAuthenticated`
  - actions: `setToken()`, `setUser()`, `logout()`
- [ ] **เขียน `stores/ui.store.ts`**
  - state: `sidebarOpen`, `theme`
  - actions: `toggleSidebar()`, `toggleTheme()`

---

### 4.4 Composables

- [ ] **เขียน `composables/useAuth.ts`**
  - `login()`, `register()`, `logout()`
- [ ] **เขียน `composables/useToast.ts`**
  - `toast(message, type)` — show/hide notification
- [ ] **เขียน `composables/useTheme.ts`**
  - `isDark`, `toggle()` — sync กับ `useColorMode()`
- [ ] **เขียน `composables/useTasks.ts`**
  - `useTasksQuery(query)` — GET /tasks + filter/sort
  - `useCreateTask()` — mutation + invalidate cache
  - `useUpdateTask()` — mutation
  - `useDeleteTask()` — mutation
  - `useToggleDone()` — mutation + optimistic update
- [ ] **เขียน `composables/useBulk.ts`**
  - `selectedIds`, `toggleSelect()`, `selectAll()`, `clearSelection()`
  - `bulkDone()`, `bulkDelete()`

---

### 4.5 Vue Router

- [ ] **ตั้งค่า `router/index.ts`**
  - routes: `/` (Landing), `/login`, `/register`, `/dashboard`
  - `meta: { requiresAuth: true }` บน `/dashboard`
- [ ] **เขียน navigation guard (`beforeEach`)**
  - ไม่ authed → redirect `/login`
  - authed เข้า `/login` → redirect `/dashboard`

---

### 4.6 Base UI Components

- [ ] **`BaseButton.vue`** — props: variant, size, loading, disabled
- [ ] **`BaseInput.vue`** — props: label, error, type + v-model
- [ ] **`BaseModal.vue`** — props: open, title + slots
- [ ] **`BaseToast.vue`** — แสดง toast stack จาก useToast

---

### 4.7 Layout Components

- [ ] **`AppSidebar.vue`** — nav items + tags + user + theme toggle
- [ ] **`MobileTopBar.vue`** — hamburger + logo + add button
- [ ] **`BottomNav.vue`** — 5 tab navigation (mobile)

---

### 4.8 Task Components

- [ ] **`TaskCard.vue`** — checkbox, name, badges, actions
- [ ] **`SubTaskList.vue`** — expandable checklist + progress bar
- [ ] **`TaskFormModal.vue`** — form เพิ่ม/แก้ task
- [ ] **`TaskStats.vue`** — stats bar: ค้างอยู่, เสร็จ, เกินกำหนด, progress
- [ ] **`BulkActionBar.vue`** — แสดงเมื่อ selectedIds > 0

---

### 4.9 Views

- [ ] **`LandingView.vue`** — landing page + hero + mockup
- [ ] **`AuthView.vue`** — login/register form + validation
- [ ] **`DashboardView.vue`** — layout หลัก + task list

---

### 4.10 ทดสอบ Frontend Auth

- [ ] register → สำเร็จ → redirect dashboard
- [ ] login ผิด → เห็น error · ถูก → เข้า dashboard
- [ ] `/dashboard` โดยไม่ login → redirect `/login`
- [ ] logout → redirect `/login` + token ล้าง
- [ ] refresh token → ยัง authed หลัง access token หมดอายุ

---

## PHASE 5 — Connect Features

> **เป้าหมาย:** ทุก feature ใน UI ทำงานกับ backend จริง

---

### 5.1 Task List

- [ ] โหลด tasks จาก GET /tasks เมื่อเข้า dashboard
- [ ] แสดง loading state ระหว่างรอ API
- [ ] แสดง empty state เมื่อไม่มี task
- [ ] แสดง error state เมื่อ API ล้มเหลว

---

### 5.2 Create Task

- [ ] เปิด modal → กรอก → submit → POST /tasks
- [ ] แสดง loading ระหว่าง request
- [ ] หลัง save: modal ปิด + task ใหม่โผล่ใน list
- [ ] toast: "เพิ่มงานใหม่แล้ว!"
- [ ] validation: ไม่ submit ถ้าชื่อว่าง

---

### 5.3 Edit Task

- [ ] คลิกชื่องาน/ไอคอนแก้ไข → modal พร้อมข้อมูลเดิม
- [ ] submit → PATCH /tasks/:id
- [ ] หลัง update: modal ปิด + ข้อมูลใน list อัปเดต
- [ ] toast: "อัปเดตงานแล้ว"

---

### 5.4 Delete Task

- [ ] คลิกถังขยะ → confirm modal
- [ ] ยืนยัน → DELETE /tasks/:id
- [ ] หลัง delete: task หายจาก list + animation
- [ ] toast: "ลบงานแล้ว"

---

### 5.5 Toggle Done

- [ ] คลิก checkbox → PATCH /tasks/:id/done
- [ ] optimistic update: ขีดฆ่าชื่อทันที ไม่รอ API
- [ ] ถ้า API ล้มเหลว: revert + toast error

---

### 5.6 Subtasks

- [ ] expand/collapse subtask section
- [ ] toggle subtask → PATCH subtasks/:sid/done
- [ ] เพิ่ม subtask → Enter → POST
- [ ] ลบ subtask → DELETE
- [ ] progress bar อัปเดตตาม done/total

---

### 5.7 Search & Filter

- [ ] search input → debounce 300ms → GET /tasks?search=
- [ ] filter by view (sidebar/bottom nav)
- [ ] filter by tag
- [ ] sort → GET /tasks?sort=due_date&order=asc

---

### 5.8 Bulk Actions

- [ ] checkbox → bulk bar โผล่
- [ ] Mark all Done → PATCH /tasks/bulk/done
- [ ] Delete Selected → confirm → DELETE /tasks/bulk
- [ ] หลัง bulk: list อัปเดต + clear selection + toast

---

### 5.9 Drag & Drop

- [ ] ลาก task ขึ้น-ลง (vue-draggable-plus)
- [ ] หลัง drop → PATCH /tasks/:id/position
- [ ] visual feedback ระหว่างลาก

---

### 5.10 Tags

- [ ] เพิ่ม tag จาก task form
- [ ] แสดง tags ใน sidebar
- [ ] คลิก tag → filter tasks

---

## PHASE 6 — Deploy

> **เป้าหมาย:** ขึ้น production ใช้งานได้จริง

---

### 6.1 Pre-deploy

- [ ] `.gitignore` ครอบคลุม `.env` ทั้งหมด
- [ ] `.env.example` มีทั้ง `frontend/` และ `backend/`
- [ ] ไม่มี hardcoded secret ใน code
- [ ] `console.log` sensitive data ถูกลบแล้ว
- [ ] CORS ชี้ production URL เท่านั้น
- [ ] `npm run build` ทั้งสองฝั่งผ่าน

---

### 6.2 Deploy Backend (Railway)

- [ ] push code ขึ้น GitHub
- [ ] สร้าง project บน Railway → import from GitHub
- [ ] ตั้ง Root Directory → `backend`
- [ ] เพิ่ม PostgreSQL service
- [ ] ตั้ง environment variables ครบ
- [ ] ตรวจ build log — ไม่มี error
- [ ] ทดสอบ: `curl https://prio-api.railway.app/health`
- [ ] run migration: `railway run npx prisma migrate deploy`

---

### 6.3 Deploy Frontend (Vercel)

- [ ] import project บน Vercel จาก GitHub
- [ ] ตั้ง Root Directory → `frontend`
- [ ] ตั้ง `VITE_API_URL` → Railway URL
- [ ] ตรวจ build log — ไม่มี error
- [ ] ทดสอบ: เปิด Vercel URL → login ได้

---

### 6.4 Post-deploy Checklist

- [ ] Auth flow ทำงานบน production
- [ ] CRUD ทำงานบน production
- [ ] ทดสอบบน mobile — responsive ดี
- [ ] ทดสอบ dark/light mode
- [ ] CORS ไม่มี error

---

## 📊 Progress Summary

| Phase         | Tasks   | Done   | Status |
| ------------- | ------- | ------ | ------ |
| 0 — Setup     | 15      | 15     | 🟢     |
| 1 — Database  | 10      | 10     | 🟢     |
| 2 — Auth API  | 17      | 17     | 🟢     |
| 3 — Tasks API | 19      | 19     | 🟢     |
| 4 — Frontend  | 30      | 0      | 🔴     |
| 5 — Connect   | 28      | 0      | 🔴     |
| 6 — Deploy    | 13      | 0      | 🔴     |
| **Total**     | **132** | **61** | 🟡     |

---

_อัปเดตล่าสุด: 2025-03-20 | Phase 0: 15/15 ✅ | Phase 1: 10/10 ✅ | Phase 2: 17/17 ✅ | Phase 3: 19/19 ✅_
