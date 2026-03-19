# ✅ TASKS.md — Task Breakdown by Phase

> วิธีใช้: เมื่อทำ task ไหนเสร็จให้เปลี่ยน `[ ]` → `[x]`
> สถานะ: 🔴 ยังไม่เริ่ม · 🟡 กำลังทำ · 🟢 เสร็จแล้ว

---

## PHASE 0 — Project Setup
> **เป้าหมาย:** project วิ่งได้บนเครื่อง, เห็น Hello World ทั้งสองฝั่ง

---

### 0.1 Monorepo Structure
- [ ] **สร้าง root folder** `taski/` และ init git
  - `mkdir taski && cd taski && git init`
- [ ] **สร้างโครงสร้าง folders**
  - `mkdir frontend backend docs`
- [ ] **เขียน `.gitignore`**
  - ครอบคลุม: `node_modules/`, `dist/`, `.env`, `*.log`
- [ ] **เขียน `README.md`**
  - อธิบาย project, วิธี run dev, tech stack

---

### 0.2 Frontend Init
- [ ] **สร้าง Vue 3 project**
  - `npm create vue@latest .` เลือก: TypeScript, Vue Router, Pinia, ESLint, Prettier
- [ ] **ติดตั้ง TailwindCSS**
  - `npm i -D tailwindcss @tailwindcss/vite` + config ใน `vite.config.ts`
- [ ] **ติดตั้ง libraries ทั้งหมด**
  - `lucide-vue-next` — icons
  - `@vueuse/core` — composable utilities (useColorMode, useLocalStorage)
  - `@tanstack/vue-query` — server state & caching
  - `vee-validate zod @vee-validate/zod` — form validation
  - `vue-draggable-plus` — drag & drop
  - `@formkit/auto-animate` — list animation
  - `dayjs` — จัดการ date
  - `axios` — HTTP client
  - `@fontsource/plus-jakarta-sans @fontsource/ibm-plex-mono` — fonts
- [ ] **ตั้งค่า path alias**
  - `@/` ชี้ไปที่ `src/` ใน `vite.config.ts` และ `tsconfig.json`
- [ ] **เขียน `frontend/.env`**
  - `VITE_API_URL=http://localhost:3000/api`
- [ ] **ทดสอบ:** `npm run dev` → เห็นหน้าเว็บที่ `localhost:5173`

---

### 0.3 Backend Init
- [ ] **init Node.js project**
  - `npm init -y`
- [ ] **ติดตั้ง dependencies**
  - `express cors helmet express-rate-limit bcryptjs jsonwebtoken dotenv`
- [ ] **ติดตั้ง dev dependencies**
  - `typescript @types/express @types/node @types/bcryptjs @types/jsonwebtoken ts-node-dev`
- [ ] **ตั้งค่า TypeScript**
  - `npx tsc --init` + ปรับ `tsconfig.json` (target: ES2020, outDir: dist, rootDir: src)
- [ ] **สร้าง folder structure**
  ```
  backend/src/
  ├── index.ts
  ├── config/
  ├── middleware/
  ├── modules/
  ├── schemas/
  └── utils/
  ```
- [ ] **เขียน `backend/.env`**
  - `DATABASE_URL`, `JWT_SECRET`, `JWT_REFRESH_SECRET`, `PORT=3000`, `CLIENT_URL`
- [ ] **เขียน Express app เบื้องต้น** ใน `src/index.ts`
  - ใส่ `helmet()`, `cors()`, `express.json()`
  - เพิ่ม route ทดสอบ: `GET /health → { status: "ok" }`
- [ ] **เพิ่ม npm scripts**
  - `"dev": "ts-node-dev src/index.ts"`, `"build": "tsc"`, `"start": "node dist/index.js"`
- [ ] **ทดสอบ:** `npm run dev` → `curl localhost:3000/health` ได้ `{ status: "ok" }`

---

### 0.4 Prisma Init
- [ ] **ติดตั้ง Prisma**
  - `npm i prisma @prisma/client`
  - `npx prisma init`
- [ ] **ตั้งค่า DATABASE_URL** ใน `.env`
  - ใช้ local PostgreSQL หรือ Supabase free tier
- [ ] **ทดสอบ connection:** `npx prisma db pull` หรือ `npx prisma migrate dev --name test`

---

## PHASE 1 — Database Schema
> **เป้าหมาย:** tables ถูกสร้างใน DB, Prisma Client ใช้งานได้

---

### 1.1 เขียน Prisma Schema
- [ ] **เขียน model `User`**
  - fields: `id, name, email, passwordHash, createdAt, updatedAt`
  - constraint: `email @unique`
- [ ] **เขียน model `Task`**
  - fields: `id, userId, title, description, priority, dueDate, isDone, position, createdAt, updatedAt`
  - relation: `userId → User`
  - indexes: `@@index([userId])`, `@@index([userId, isDone])`, `@@index([userId, dueDate])`
- [ ] **เขียน model `Subtask`**
  - fields: `id, taskId, title, isDone, position, createdAt`
  - relation: `taskId → Task` (onDelete: Cascade)
- [ ] **เขียน model `Tag`**
  - fields: `id, userId, name, createdAt`
  - constraint: `@@unique([userId, name])`
- [ ] **เขียน model `TaskTag`** (junction)
  - fields: `taskId, tagId`
  - `@@id([taskId, tagId])`
- [ ] **เขียน model `RefreshToken`**
  - fields: `id, userId, token, expiresAt, createdAt`
  - constraint: `token @unique`
- [ ] **เพิ่ม enum `Priority`**
  - values: `High, Medium, Low`

---

### 1.2 Migration & Generate
- [ ] **Run migration**
  - `npx prisma migrate dev --name init`
- [ ] **Generate Prisma Client**
  - `npx prisma generate`
- [ ] **ตรวจสอบด้วย Prisma Studio**
  - `npx prisma studio` → เช็กว่า tables ครบและ schema ถูก

---

### 1.3 Prisma Client Setup
- [ ] **สร้าง `src/config/prisma.ts`**
  - export singleton `PrismaClient` instance
  - จัดการ graceful shutdown (`$disconnect`)

---

### 1.4 Seed Data (Optional)
- [ ] **เขียน `prisma/seed.ts`**
  - สร้าง 1 demo user + tasks + tags ตัวอย่าง
- [ ] **เพิ่ม seed script** ใน `package.json`
- [ ] **ทดสอบ:** `npx prisma db seed` → เห็นข้อมูลใน Prisma Studio

---

## PHASE 2 — Auth API
> **เป้าหมาย:** register, login, refresh, logout ทำงานถูกต้อง

---

### 2.1 Utilities
- [ ] **เขียน `utils/hash.ts`**
  - `hashPassword(password)` — bcrypt hash (rounds: 12)
  - `comparePassword(password, hash)` — bcrypt compare
- [ ] **เขียน `utils/jwt.ts`**
  - `signAccessToken(userId)` — expire 15m
  - `signRefreshToken(userId)` — expire 7d
  - `verifyAccessToken(token)` → return payload หรือ throw
  - `verifyRefreshToken(token)` → return payload หรือ throw

---

### 2.2 Schemas (Zod)
- [ ] **เขียน `schemas/auth.schema.ts`**
  - `registerSchema`: name (min 1), email (valid), password (min 8)
  - `loginSchema`: email, password

---

### 2.3 Middleware
- [ ] **เขียน `middleware/validate.ts`**
  - รับ Zod schema → middleware ที่ validate `req.body`
  - ถ้าไม่ผ่าน → return 400 + error details
- [ ] **เขียน `middleware/auth.ts`**
  - ดึง token จาก `Authorization: Bearer <token>`
  - verify → ใส่ `req.userId` เพื่อให้ route ถัดไปใช้ได้
  - ถ้า token หมดอายุหรือผิด → return 401
- [ ] **เขียน `middleware/rateLimit.ts`**
  - `authLimiter`: 10 req / 15 min (สำหรับ login/register)
  - `generalLimiter`: 100 req / 15 min

---

### 2.4 Auth Module
- [ ] **เขียน `modules/auth/auth.service.ts`**
  - `register(name, email, password)`:
    - ตรวจ email ซ้ำ → throw 409 ถ้าซ้ำ
    - hash password → สร้าง user ใน DB
    - return user (ไม่ return passwordHash)
  - `login(email, password)`:
    - หา user ด้วย email → throw 401 ถ้าไม่เจอ
    - compare password → throw 401 ถ้าไม่ตรง
    - สร้าง access + refresh token
    - บันทึก refresh token ใน DB
    - return `{ user, accessToken, refreshToken }`
  - `refresh(token)`:
    - verify refresh token
    - หาใน DB → throw 401 ถ้าไม่เจอหรือ expire
    - สร้าง access token ใหม่
    - return `{ accessToken }`
  - `logout(token)`:
    - ลบ refresh token จาก DB
- [ ] **เขียน `modules/auth/auth.controller.ts`**
  - `register`: เรียก service → return 201
  - `login`: เรียก service → ตั้ง httpOnly cookie สำหรับ refresh token → return 200
  - `refresh`: อ่าน cookie → เรียก service → return 200
  - `logout`: อ่าน cookie → เรียก service → clear cookie → return 200
- [ ] **เขียน `modules/auth/auth.router.ts`**
  - POST `/register` → validate → controller
  - POST `/login` → validate + rateLimit → controller
  - POST `/refresh` → controller
  - POST `/logout` → auth middleware → controller
- [ ] **ลงทะเบียน router** ใน `src/index.ts`

---

### 2.5 ทดสอบ Auth
- [ ] **ทดสอบ register** — สร้าง user ได้ + password ถูก hash
- [ ] **ทดสอบ login** — ได้ access token + refresh token ใน cookie
- [ ] **ทดสอบ protected route** — ถ้าไม่มี token → 401
- [ ] **ทดสอบ refresh** — แลก token ได้
- [ ] **ทดสอบ logout** — cookie ถูกลบ + token ใน DB หาย
- [ ] **ทดสอบ email ซ้ำ** — ได้ 409

---

## PHASE 3 — Tasks API
> **เป้าหมาย:** CRUD tasks ครบ + bulk + filter/sort/search ฝั่ง server

---

### 3.1 Task Schemas (Zod)
- [ ] **เขียน `schemas/task.schema.ts`**
  - `createTaskSchema`: title (required), description, priority (enum), dueDate, tagIds[]
  - `updateTaskSchema`: ทุก field optional (partial)
  - `bulkSchema`: taskIds (array of numbers, min 1)
  - `querySchema`: search, view, priority, tag, sort, order, page, limit

---

### 3.2 Task Service
- [ ] **เขียน `modules/tasks/tasks.service.ts`**
  - `getTasks(userId, query)`:
    - build WHERE clause จาก query params
    - handle view: today, upcoming, overdue, done, all
    - include: taskTags → tag, subtasks
    - sort + paginate
    - return `{ tasks, total }`
  - `createTask(userId, data)`:
    - สร้าง task + เชื่อม tags ผ่าน TaskTag
    - return task พร้อม tags + subtasks
  - `updateTask(userId, taskId, data)`:
    - verify ownership (task ต้องเป็นของ user)
    - อัปเดต fields ที่ส่งมา
    - ถ้าส่ง tagIds มา → ลบ relations เก่า → สร้างใหม่
    - return task ที่อัปเดตแล้ว
  - `deleteTask(userId, taskId)`:
    - verify ownership → ลบ (subtasks + taskTags ถูกลบ cascade)
  - `toggleDone(userId, taskId)`:
    - verify ownership → flip isDone
  - `updatePosition(userId, taskId, position)`:
    - verify ownership → อัปเดต position
  - `bulkDone(userId, taskIds)`:
    - updateMany WHERE id IN taskIds AND userId
    - return count
  - `bulkDelete(userId, taskIds)`:
    - deleteMany WHERE id IN taskIds AND userId
    - return count

---

### 3.3 Subtask Service
- [ ] **เขียน subtask methods** ใน tasks.service.ts (หรือแยก subtasks.service.ts)
  - `addSubtask(userId, taskId, title)` — verify task ownership ก่อน
  - `toggleSubtask(userId, subtaskId)` — verify ผ่าน task.userId
  - `deleteSubtask(userId, subtaskId)` — verify ผ่าน task.userId

---

### 3.4 Tag Service
- [ ] **เขียน `modules/tags/tags.service.ts`**
  - `getTags(userId)` — ดึงพร้อม `_count: { taskTags: true }`
  - `createTag(userId, name)` — ตรวจชื่อซ้ำ (unique userId+name)
  - `deleteTag(userId, tagId)` — verify ownership → ลบ

---

### 3.5 Controllers & Routers
- [ ] **เขียน `modules/tasks/tasks.controller.ts`**
  - map request → service → format response
- [ ] **เขียน `modules/tasks/tasks.router.ts`**
  - ทุก route ผ่าน `auth middleware` ก่อน
  - GET `/` → validate query → getTasks
  - POST `/` → validate body → createTask
  - PATCH `/bulk/done` → validate → bulkDone (ต้องมาก่อน `/:id`)
  - DELETE `/bulk` → validate → bulkDelete
  - PATCH `/:id` → validate → updateTask
  - DELETE `/:id` → deleteTask
  - PATCH `/:id/done` → toggleDone
  - PATCH `/:id/position` → updatePosition
- [ ] **เขียน tags router + controller** เช่นกัน
- [ ] **ลงทะเบียน routers** ใน `src/index.ts`

---

### 3.6 Global Error Handler
- [ ] **เขียน error middleware** ใน `src/index.ts`
  - จับ error ทั้งหมด → format เป็น `{ success: false, error: { code, message } }`
  - handle Prisma errors (P2002 = unique constraint, P2025 = not found)
  - handle Zod errors
  - hide stack trace ใน production

---

### 3.7 ทดสอบ Tasks API
- [ ] **CRUD ทดสอบครบ** ด้วย Postman / curl
- [ ] **ทดสอบ filter** — view=today, overdue, search=keyword
- [ ] **ทดสอบ sort** — due_date, priority
- [ ] **ทดสอบ bulk** — mark done + delete หลาย task
- [ ] **ทดสอบ ownership** — user A ไม่ควรแก้ task ของ user B (ได้ 403)
- [ ] **ทดสอบ subtasks** — add, toggle, delete

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
  - `withCredentials: true` — ส่ง cookie อัตโนมัติ
  - **Request interceptor**: แนบ `Authorization: Bearer <accessToken>` จาก auth store
  - **Response interceptor**: ถ้า 401 → เรียก `/auth/refresh` → retry request เดิม → ถ้า refresh ล้มเหลว → logout + redirect
- [ ] **เขียน `services/auth.service.ts`**
  - `login(dto)`, `register(dto)`, `logout()`, `refresh()`
- [ ] **เขียน `services/task.service.ts`**
  - `getTasks(query)`, `createTask(dto)`, `updateTask(id, dto)`, `deleteTask(id)`
  - `toggleDone(id)`, `bulkDone(ids)`, `bulkDelete(ids)`
  - `getTags()`, `createTag(name)`, `deleteTag(id)`

---

### 4.3 Pinia Stores
- [ ] **เขียน `stores/auth.store.ts`**
  - state: `user`, `accessToken`, `isAuthenticated`
  - actions: `setToken()`, `setUser()`, `logout()` — clear state ทั้งหมด
- [ ] **เขียน `stores/ui.store.ts`**
  - state: `sidebarOpen`, `theme`
  - actions: `toggleSidebar()`, `toggleTheme()`

---

### 4.4 Composables
- [ ] **เขียน `composables/useAuth.ts`**
  - `login()`, `register()`, `logout()` — เรียก service + update store
- [ ] **เขียน `composables/useToast.ts`**
  - `toast(message, type)` — show/hide toast notification
- [ ] **เขียน `composables/useTheme.ts`**
  - `isDark`, `toggle()` — sync กับ `@vueuse/core useColorMode()`
- [ ] **เขียน `composables/useTasks.ts`** (หลักๆ ใช้ Vue Query)
  - `useTasksQuery(query)` — GET /tasks พร้อม filter/sort
  - `useCreateTask()` — mutation + invalidate cache
  - `useUpdateTask()` — mutation
  - `useDeleteTask()` — mutation
  - `useToggleDone()` — mutation (optimistic update)
- [ ] **เขียน `composables/useBulk.ts`**
  - `selectedIds`, `toggleSelect()`, `selectAll()`, `clearSelection()`
  - `bulkDone()`, `bulkDelete()`

---

### 4.5 Vue Router
- [ ] **ตั้งค่า `router/index.ts`**
  - routes: `/` (Landing), `/login`, `/register`, `/dashboard`
  - `meta: { requiresAuth: true }` บน `/dashboard`
- [ ] **เขียน navigation guard (`beforeEach`)**
  - ถ้า route ต้องการ auth และ `!isAuthenticated` → redirect `/login`
  - ถ้า authed แล้วเข้า `/login` หรือ `/register` → redirect `/dashboard`

---

### 4.6 Base UI Components
- [ ] **`BaseButton.vue`** — props: variant, size, loading, disabled + slot
- [ ] **`BaseInput.vue`** — props: label, error, type + v-model
- [ ] **`BaseModal.vue`** — props: open, title + slots: default, footer
- [ ] **`BaseToast.vue`** — แสดง toast stack จาก useToast

---

### 4.7 Layout Components
- [ ] **`AppSidebar.vue`** — nav items + tag list + user profile + theme toggle
- [ ] **`MobileTopBar.vue`** — hamburger + logo + add button
- [ ] **`BottomNav.vue`** — 5 tab navigation สำหรับ mobile

---

### 4.8 Task Components
- [ ] **`TaskCard.vue`** — แสดง task 1 ใบ: checkbox, name, badges, actions
- [ ] **`SubTaskList.vue`** — expandable subtask checklist
- [ ] **`TaskFormModal.vue`** — form เพิ่ม/แก้ task: ชื่อ, priority, due date, tags
- [ ] **`TaskStats.vue`** — stats bar: ค้างอยู่, เสร็จ, เกินกำหนด, progress
- [ ] **`BulkActionBar.vue`** — แสดงเมื่อ selectedIds > 0

---

### 4.9 Views
- [ ] **`LandingView.vue`** — landing page + hero section + mockup
- [ ] **`AuthView.vue`** — login/register form พร้อม validation (vee-validate + zod)
- [ ] **`DashboardView.vue`** — layout หลัก: sidebar + main content + task list

---

### 4.10 ทดสอบ Frontend Auth
- [ ] **ทดสอบ register** — กรอกฟอร์ม → สมัครสำเร็จ → redirect dashboard
- [ ] **ทดสอบ login** — กรอกผิด → เห็น error · กรอกถูก → เข้า dashboard
- [ ] **ทดสอบ route guard** — เข้า `/dashboard` โดยไม่ login → redirect `/login`
- [ ] **ทดสอบ logout** → redirect `/login` + token ล้างแล้ว
- [ ] **ทดสอบ refresh token** — รอ access token หมดอายุ (ตั้ง 1m เพื่อ test) → ยัง authed อยู่

---

## PHASE 5 — Connect Features
> **เป้าหมาย:** ทุก feature ใน UI ทำงานกับ backend จริง

---

### 5.1 Task List
- [ ] **โหลด tasks** จาก GET /tasks เมื่อเข้า dashboard
- [ ] **แสดง loading state** ระหว่างรอ API
- [ ] **แสดง empty state** เมื่อไม่มี task
- [ ] **แสดง error state** เมื่อ API ล้มเหลว

---

### 5.2 Create Task
- [ ] **กดปุ่ม + เปิด modal** → กรอกฟอร์ม → submit
- [ ] **แสดง loading** ระหว่าง POST /tasks
- [ ] **หลัง save**: ปิด modal + task ใหม่โผล่บนรายการทันที
- [ ] **แสดง toast**: "เพิ่มงานใหม่แล้ว!"
- [ ] **validation**: ไม่ให้ submit ถ้าชื่อว่าง

---

### 5.3 Edit Task
- [ ] **คลิกที่ชื่องาน / ไอคอนแก้ไข** → เปิด modal พร้อมข้อมูลเดิม
- [ ] **submit** → PATCH /tasks/:id
- [ ] **หลัง update**: modal ปิด + ข้อมูลใน list อัปเดตทันที
- [ ] **แสดง toast**: "อัปเดตงานแล้ว"

---

### 5.4 Delete Task
- [ ] **กดไอคอนถังขยะ** → confirm modal โผล่
- [ ] **กด "ลบออก"** → DELETE /tasks/:id
- [ ] **หลัง delete**: task หายจาก list พร้อม animation
- [ ] **แสดง toast**: "ลบงานแล้ว"

---

### 5.5 Toggle Done
- [ ] **คลิก checkbox** → PATCH /tasks/:id/done
- [ ] **optimistic update**: ขีดฆ่าชื่อทันที ไม่รอ API
- [ ] **ถ้า API ล้มเหลว**: revert กลับ + แสดง toast error

---

### 5.6 Subtasks
- [ ] **เปิด/ปิด subtask section** → expand/collapse
- [ ] **toggle subtask** → PATCH /tasks/:id/subtasks/:sid
- [ ] **เพิ่ม subtask** → กด Enter ใน input → POST
- [ ] **ลบ subtask** → DELETE /tasks/:id/subtasks/:sid
- [ ] **progress bar อัปเดต** ตาม done/total

---

### 5.7 Search & Filter
- [ ] **search input** → debounce 300ms → GET /tasks?search=xxx
- [ ] **filter by view** (sidebar/bottom nav) → GET /tasks?view=today
- [ ] **filter by tag** → GET /tasks?tag=Work
- [ ] **sort** → GET /tasks?sort=due_date&order=asc
- [ ] **ล้าง filter** กลับ all view

---

### 5.8 Bulk Actions
- [ ] **เลือก task** (checkbox) → bulk bar โผล่
- [ ] **Mark all Done** → PATCH /tasks/bulk/done
- [ ] **Delete Selected** → confirm → DELETE /tasks/bulk
- [ ] **หลัง bulk action**: list อัปเดต + clear selection + toast

---

### 5.9 Drag & Drop
- [ ] **ลาก task** ขึ้น-ลงได้ (vue-draggable-plus)
- [ ] **หลัง drop**: PATCH /tasks/:id/position
- [ ] **visual feedback** ระหว่างลาก

---

### 5.10 Tags Management
- [ ] **เพิ่ม tag** จาก task form → สร้างถ้ายังไม่มี
- [ ] **แสดง tags** ใน sidebar
- [ ] **คลิก tag** ใน sidebar → filter tasks

---

## PHASE 6 — Deploy
> **เป้าหมาย:** ขึ้น production ใช้งานได้จริง

---

### 6.1 Pre-deploy
- [ ] **ตรวจ `.gitignore`** — ไม่มี `.env` อยู่ใน repo
- [ ] **ตรวจ secrets** — ไม่มี hardcoded ใน code
- [ ] **เพิ่ม error handling** ทุก async function
- [ ] **ลบ `console.log`** ที่มี sensitive data
- [ ] **ตั้ง CORS** ให้แคบ — เฉพาะ production URL เท่านั้น
- [ ] **ทดสอบ `npm run build`** ทั้งสองฝั่งผ่าน

---

### 6.2 Deploy Backend (Railway)
- [ ] **push code** ขึ้น GitHub
- [ ] **สร้าง project** บน Railway → import from GitHub
- [ ] **เพิ่ม PostgreSQL** service บน Railway
- [ ] **ตั้ง environment variables** ทั้งหมด
- [ ] **ตรวจ build log** — ไม่มี error
- [ ] **ทดสอบ:** `curl https://xxx.railway.app/health` → `{ status: "ok" }`
- [ ] **Run migration:** `railway run npx prisma migrate deploy`

---

### 6.3 Deploy Frontend (Vercel)
- [ ] **import project** บน Vercel จาก GitHub
- [ ] **ตั้ง Root Directory** → `frontend/`
- [ ] **ตั้ง `VITE_API_URL`** → Railway URL
- [ ] **ตรวจ build log** — ไม่มี error
- [ ] **ทดสอบ:** เปิด Vercel URL → login ได้ → ใช้งานได้จริง

---

### 6.4 Post-deploy Checklist
- [ ] **ทดสอบ Auth flow** บน production จริง
- [ ] **ทดสอบ CRUD** ทั้งหมดบน production
- [ ] **ทดสอบบน mobile** — responsive ดี
- [ ] **ทดสอบ dark/light mode**
- [ ] **ตรวจ CORS** — frontend เรียก backend ผ่าน ไม่มี CORS error

---

## 📊 Progress Summary

| Phase | Tasks | Done | Status |
|-------|-------|------|--------|
| 0 — Setup | 14 | 0 | 🔴 |
| 1 — Database | 10 | 0 | 🔴 |
| 2 — Auth API | 17 | 0 | 🔴 |
| 3 — Tasks API | 19 | 0 | 🔴 |
| 4 — Frontend | 28 | 0 | 🔴 |
| 5 — Connect | 28 | 0 | 🔴 |
| 6 — Deploy | 13 | 0 | 🔴 |
| **Total** | **129** | **0** | 🔴 |

---

*อัปเดตล่าสุด: 2025-03-19 | อัปเดต Progress Summary ทุกครั้งที่จบ phase*
