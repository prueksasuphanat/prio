# 📋 PLAN.md — Taski Full Stack Project

> **Stack:** Vue 3 + TypeScript + Vite + TailwindCSS · Node.js + Express · PostgreSQL + Prisma · JWT Auth · Vercel + Railway

---

## 🗺️ Overview

```
Taski/
├── frontend/     → Vue 3 + Vite + TS + TailwindCSS
├── backend/      → Node.js + Express + TS + Prisma
└── docs/         → ไฟล์ documentation ทั้งหมด
    ├── PLAN.md
    ├── ARCHITECTURE.md
    ├── API.md
    ├── DATABASE.md
    └── DEPLOYMENT.md
```

---

## 🏁 Phase 0 — Setup & Foundation
> เป้าหมาย: project วิ่งได้บนเครื่อง ก่อนเขียน feature ใด ๆ

### 0.1 Init Monorepo
```bash
mkdir taski && cd taski
mkdir frontend backend docs
git init
touch .gitignore README.md
```

**`.gitignore` ที่ต้องมี:**
```
node_modules/
dist/
.env
.env.local
*.log
```

### 0.2 Init Frontend
```bash
cd frontend
npm create vue@latest .
# เลือก: TypeScript ✓ | Vue Router ✓ | Pinia ✓ | ESLint ✓ | Prettier ✓

npm i -D tailwindcss @tailwindcss/vite
npm i lucide-vue-next
npm i @vueuse/core pinia @tanstack/vue-query
npm i vee-validate zod @vee-validate/zod
npm i @formkit/auto-animate vue-draggable-plus dayjs
npm i @fontsource/plus-jakarta-sans @fontsource/ibm-plex-mono
```

### 0.3 Init Backend
```bash
cd backend
npm init -y
npm i express cors helmet express-rate-limit bcryptjs jsonwebtoken dotenv
npm i -D typescript @types/express @types/node @types/bcryptjs @types/jsonwebtoken ts-node-dev
npx tsc --init
npx prisma init
```

### 0.4 Environment Variables

**`backend/.env`**
```env
DATABASE_URL="postgresql://user:password@localhost:5432/taski_db"
JWT_SECRET="your-super-secret-key"
JWT_REFRESH_SECRET="your-refresh-secret-key"
JWT_EXPIRES_IN="15m"
JWT_REFRESH_EXPIRES_IN="7d"
PORT=3000
CLIENT_URL="http://localhost:5173"
NODE_ENV="development"
```

**`frontend/.env`**
```env
VITE_API_URL="http://localhost:3000/api"
```

---

## 🗄️ Phase 1 — Database & Schema
> เป้าหมาย: schema พร้อม, migrate ได้, seed data ได้

### 1.1 เขียน Prisma Schema
ดูรายละเอียดเต็มใน [`DATABASE.md`](./DATABASE.md)

**ตาราง:**
- `users` — ข้อมูลผู้ใช้ + hashed password
- `tasks` — งาน (title, desc, priority, due_date, is_done)
- `tags` — แท็กของแต่ละ user
- `task_tags` — junction table ระหว่าง tasks ↔ tags
- `refresh_tokens` — เก็บ refresh token (optional แต่แนะนำ)

### 1.2 Run Migration
```bash
npx prisma migrate dev --name init
npx prisma generate
npx prisma db seed     # optional: seed ข้อมูลตัวอย่าง
```

### 1.3 เปิด Prisma Studio (ตรวจสอบ)
```bash
npx prisma studio      # http://localhost:5555
```

**Checklist:**
- [ ] tables ถูกสร้างครบ
- [ ] foreign keys ถูกต้อง
- [ ] indexes บน `user_id`, `due_date`, `is_done`

---

## 🔐 Phase 2 — Auth API
> เป้าหมาย: register, login, refresh token ทำงานได้

### 2.1 โครงสร้างไฟล์ Backend
```
backend/src/
├── index.ts              ← Express app entry
├── config/
│   └── prisma.ts         ← Prisma Client instance
├── middleware/
│   ├── auth.ts           ← JWT verify middleware
│   ├── validate.ts       ← Zod validation middleware
│   └── rateLimit.ts      ← Rate limiter config
├── modules/
│   ├── auth/
│   │   ├── auth.router.ts
│   │   ├── auth.controller.ts
│   │   └── auth.service.ts
│   └── tasks/
│       ├── tasks.router.ts
│       ├── tasks.controller.ts
│       └── tasks.service.ts
├── schemas/              ← Zod schemas (shared logic)
│   ├── auth.schema.ts
│   └── task.schema.ts
└── utils/
    ├── jwt.ts
    └── hash.ts
```

### 2.2 Endpoints ที่ต้องทำ

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/auth/register` | สมัครสมาชิก |
| POST | `/api/auth/login` | เข้าสู่ระบบ → return access + refresh token |
| POST | `/api/auth/refresh` | แลก refresh token → access token ใหม่ |
| POST | `/api/auth/logout` | revoke refresh token |

### 2.3 JWT Strategy ที่ถูกต้อง
```
Login Response:
  - access_token  (15 นาที) → เก็บใน memory (Pinia store)
  - refresh_token (7 วัน)   → เก็บใน httpOnly Cookie ← สำคัญมาก!

ทำไมไม่เก็บ access_token ใน localStorage?
  → โดน XSS ขโมยได้ ควรเก็บใน memory แทน
```

### 2.4 Test Auth ด้วย curl หรือ Postman
```bash
# Register
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"ภูมิ","email":"phumi@test.com","password":"password123"}'

# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"phumi@test.com","password":"password123"}'
```

**Checklist:**
- [ ] register สร้าง user ได้
- [ ] login return access + refresh token
- [ ] endpoint ที่ต้อง auth reject ถ้าไม่มี token
- [ ] refresh token ใช้ได้
- [ ] password ถูก hash (ไม่เก็บ plain text)

---

## ✅ Phase 3 — Tasks API
> เป้าหมาย: CRUD tasks ครบ + filter + search ฝั่ง server

### 3.1 Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/tasks` | ดึงทั้งหมด (+ query params) |
| POST | `/api/tasks` | สร้างงานใหม่ |
| PATCH | `/api/tasks/:id` | แก้ไขงาน |
| DELETE | `/api/tasks/:id` | ลบงาน |
| PATCH | `/api/tasks/:id/done` | toggle done |
| PATCH | `/api/tasks/bulk/done` | bulk mark done |
| DELETE | `/api/tasks/bulk` | bulk delete |

### 3.2 Query Params สำหรับ GET /tasks
```
?search=keyword
?tag=Work
?priority=High
?view=today|upcoming|overdue|done
?sort=due_date|priority|created_at|name
?order=asc|desc
?page=1&limit=20
```

### 3.3 Tags Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/tags` | ดึง tags ทั้งหมดของ user |
| POST | `/api/tags` | สร้าง tag |
| DELETE | `/api/tags/:id` | ลบ tag |

### 3.4 Validation (Zod Schema)
```typescript
// task.schema.ts
const createTaskSchema = z.object({
  title: z.string().min(1).max(255),
  description: z.string().max(2000).optional(),
  priority: z.enum(['High', 'Medium', 'Low']).default('Medium'),
  due_date: z.string().datetime().optional().nullable(),
  tag_ids: z.array(z.number()).optional(),
})
```

**Checklist:**
- [ ] ทุก endpoint ต้องผ่าน auth middleware
- [ ] user เห็นได้เฉพาะ tasks ของตัวเอง
- [ ] validation reject ก่อน DB query เสมอ
- [ ] error response มี format เดียวกัน

---

## 🖥️ Phase 4 — Frontend Structure
> เป้าหมาย: Vue app มีโครงสร้างชัดเจน พร้อมเชื่อมต่อ API

### 4.1 โครงสร้างไฟล์ Frontend
```
frontend/src/
├── assets/
│   └── main.css          ← Tailwind + global styles
├── components/
│   ├── ui/               ← Reusable base components
│   │   ├── BaseButton.vue
│   │   ├── BaseInput.vue
│   │   ├── BaseModal.vue
│   │   └── BaseToast.vue
│   ├── task/             ← Task-specific components
│   │   ├── TaskCard.vue
│   │   ├── TaskFormModal.vue
│   │   ├── SubTaskList.vue
│   │   ├── TaskStats.vue
│   │   └── BulkActionBar.vue
│   └── layout/           ← Layout components
│       ├── AppSidebar.vue
│       ├── MobileTopBar.vue
│       └── BottomNav.vue
├── composables/          ← Reusable logic (Vue Composition API)
│   ├── useTasks.ts       ← CRUD + filter + sort
│   ├── useAuth.ts        ← login, logout, token refresh
│   ├── useToast.ts       ← toast notification
│   ├── useTheme.ts       ← dark/light mode
│   └── useBulk.ts        ← bulk select actions
├── stores/               ← Pinia stores
│   ├── auth.store.ts     ← user state + tokens
│   ├── task.store.ts     ← tasks state
│   └── ui.store.ts       ← modal, sidebar open/close
├── router/
│   └── index.ts          ← Vue Router + auth guard
├── services/             ← API call layer
│   ├── api.ts            ← axios instance + interceptors
│   ├── auth.service.ts
│   └── task.service.ts
├── types/                ← TypeScript types
│   ├── task.types.ts
│   └── auth.types.ts
└── views/
    ├── LandingView.vue
    ├── AuthView.vue
    └── DashboardView.vue
```

### 4.2 Axios Instance + Interceptors
```typescript
// services/api.ts
// สิ่งที่ต้องทำใน interceptor:
// 1. แนบ Authorization header ทุก request
// 2. ถ้า 401 → เรียก /auth/refresh อัตโนมัติ
// 3. ถ้า refresh ล้มเหลว → logout + redirect /login
```

### 4.3 Router Guards
```typescript
// router/index.ts
// beforeEach: ถ้า route ต้องการ auth และไม่มี token → redirect /login
// ถ้า login แล้วเข้า /login → redirect /dashboard
```

### 4.4 Vue Query Setup
```typescript
// ใช้ @tanstack/vue-query สำหรับ:
// - useQuery('tasks', fetchTasks)        ← auto refetch, caching
// - useMutation(createTask, { onSuccess: invalidateQueries })
// ข้อดี: จัดการ loading/error state อัตโนมัติ
```

**Checklist:**
- [ ] Login ได้และ token เก็บถูกที่
- [ ] หน้า Dashboard โหลด tasks จาก API จริง
- [ ] Create / Edit / Delete ทำงานได้
- [ ] Logout ล้าง token และ redirect

---

## 🔗 Phase 5 — Connect Frontend ↔ Backend
> เป้าหมาย: feature ทุกอย่างทำงานกับ API จริง

### ลำดับการเชื่อม (ทำทีละชิ้น)
```
1. Auth flow ก่อน         → login → เห็น dashboard ได้
2. Load tasks list        → GET /tasks แสดงผลบนหน้า
3. Create task            → POST /tasks → list refresh
4. Toggle done            → PATCH /tasks/:id/done
5. Edit task              → PATCH /tasks/:id
6. Delete task            → DELETE /tasks/:id (+ confirm)
7. Search & Filter        → query params → server-side filter
8. Sort                   → query params → server-side sort
9. Tags                   → CRUD tags + assign to task
10. Bulk actions          → PATCH|DELETE /tasks/bulk
```

**Checklist:**
- [ ] ทุก mutation แสดง loading state
- [ ] error แสดง toast message
- [ ] optimistic update (optional แต่ UX ดีขึ้นมาก)

---

## 🚀 Phase 6 — Deploy
> เป้าหมาย: ขึ้น production ได้จริง

### 6.1 Backend → Railway
```bash
# 1. push code ขึ้น GitHub
# 2. สร้าง project ใหม่ใน Railway
# 3. Add PostgreSQL service
# 4. Set environment variables
# 5. Railway จะ build + deploy อัตโนมัติ
```

**Environment variables บน Railway:**
```
DATABASE_URL     ← Railway generate ให้อัตโนมัติ
JWT_SECRET
JWT_REFRESH_SECRET
CLIENT_URL       ← https://taski.vercel.app
NODE_ENV         ← production
```

### 6.2 Frontend → Vercel
```bash
# 1. push code ขึ้น GitHub
# 2. import project ใน Vercel
# 3. Set build command: npm run build
# 4. Set output directory: dist
# 5. Set environment variable
```

**Environment variables บน Vercel:**
```
VITE_API_URL     ← https://taski-api.railway.app/api
```

### 6.3 Checklist ก่อน Deploy
- [ ] ปิด CORS ให้เฉพาะ production URL เท่านั้น
- [ ] `NODE_ENV=production` เซ็ตถูกต้อง
- [ ] ไม่มี console.log ที่ sensitive data
- [ ] Rate limiting เปิดอยู่
- [ ] Database connection pooling ตั้งค่าถูกต้อง

---

## 📅 Timeline แนะนำ (สำหรับ solo developer)

```
Week 1  │ Phase 0–1  │ Setup + Database schema + Prisma
Week 2  │ Phase 2    │ Auth API (register, login, JWT)
Week 3  │ Phase 3    │ Tasks API (CRUD + bulk + filter)
Week 4  │ Phase 4    │ Frontend structure + connect auth
Week 5  │ Phase 5    │ Connect ทุก feature
Week 6  │ Phase 6    │ Deploy + fix bugs
```

---

## ⚠️ สิ่งที่ต้องระวัง (Common Mistakes)

### Security
- ❌ อย่าเก็บ `JWT_SECRET` ใน code หรือ commit
- ❌ อย่า return password hash กลับมาใน response ใด ๆ
- ❌ อย่าลืม validate `user_id` ทุกครั้งที่ query task (task ต้องเป็นของ user คนนั้น)
- ✅ ใช้ `httpOnly cookie` สำหรับ refresh token เสมอ
- ✅ ใส่ `helmet()` และ `cors()` ทุกครั้ง

### Database
- ❌ อย่า query โดยไม่มี `WHERE user_id = ?` สำหรับ tasks
- ✅ เพิ่ม index บน `user_id` และ `due_date`
- ✅ ใช้ Prisma transaction สำหรับ bulk operations

### Frontend
- ❌ อย่าเก็บ access token ใน `localStorage`
- ✅ เก็บ access token ใน Pinia store (memory เท่านั้น)
- ✅ handle expired token ด้วย axios interceptor

---

## 🧪 Testing (ทำได้ใน v2)

```
Backend:
  - Unit test: service functions (jest)
  - Integration test: API endpoints (supertest)

Frontend:
  - Component test: Vitest + @vue/test-utils
  - E2E: Playwright
```

---

*อัปเดตล่าสุด: 2025-03-19 | Version: 1.0*
