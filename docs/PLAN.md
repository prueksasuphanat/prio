# 📋 PLAN.md — Prio Full Stack Project

> **Stack:** Vue 3 + TypeScript + Vite + TailwindCSS · Node.js + Express · PostgreSQL + Prisma · JWT Auth · Vercel + Railway

---

## 🗺️ Project Structure

```
prio/
├── frontend/
│   ├── src/
│   │   ├── assets/
│   │   ├── components/
│   │   │   ├── ui/              ← BaseButton, BaseInput, BaseModal
│   │   │   ├── task/            ← TaskCard, TaskFormModal, SubTaskList
│   │   │   └── layout/          ← AppSidebar, BottomNav, MobileTopBar
│   │   ├── composables/         ← useTasks, useAuth, useToast
│   │   ├── stores/              ← Pinia: auth.store, ui.store
│   │   ├── services/            ← api.ts, auth.service, task.service
│   │   ├── router/
│   │   ├── types/
│   │   └── views/               ← LandingView, AuthView, DashboardView
│   ├── public/
│   ├── .env
│   ├── .env.example
│   ├── index.html
│   ├── vite.config.ts
│   ├── tailwind.config.ts
│   └── tsconfig.json
├── backend/
│   ├── src/
│   │   ├── config/              ← prisma.ts
│   │   ├── middleware/          ← auth.ts, validate.ts, rateLimit.ts
│   │   ├── modules/
│   │   │   ├── auth/            ← router, controller, service
│   │   │   ├── tasks/           ← router, controller, service
│   │   │   └── tags/            ← router, controller, service
│   │   ├── schemas/             ← Zod: auth.schema, task.schema
│   │   ├── utils/               ← jwt.ts, hash.ts
│   │   └── index.ts
│   ├── prisma/
│   │   ├── schema.prisma
│   │   ├── migrations/
│   │   └── seed.ts
│   ├── .env
│   ├── .env.example
│   ├── tsconfig.json
│   └── package.json
├── docs/
│   ├── PLAN.md
│   ├── TASKS.md
│   ├── ARCHITECTURE.md
│   ├── API.md
│   ├── DATABASE.md
│   └── DEPLOYMENT.md
├── .gitignore
├── .gitattributes
└── README.md
```

---

## 🏁 Phase 0 — Setup & Foundation
> เป้าหมาย: project วิ่งได้บนเครื่อง ก่อนเขียน feature ใด ๆ

### 0.1 Init Monorepo
```bash
mkdir prio && cd prio
mkdir frontend backend docs
git init
touch .gitignore .gitattributes README.md
```

**`.gitignore`**
```
node_modules/
dist/
.env
.env.local
*.log
```

**`.gitattributes`** (บังคับ LF ข้ามระบบ)
```
* text=auto eol=lf
```

### 0.2 Init Frontend
```bash
cd frontend
npm create vue@latest .
# เลือก: TypeScript ✓ | Vue Router ✓ | Pinia ✓ | ESLint ✓ | Prettier ✓

npm i -D tailwindcss @tailwindcss/vite
npm i lucide-vue-next
npm i @vueuse/core pinia @tanstack/vue-query axios
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

**`backend/.env`** (อย่า commit)
```env
DATABASE_URL="postgresql://user:password@localhost:5432/prio_db"
JWT_SECRET="your-super-secret-key"
JWT_REFRESH_SECRET="your-refresh-secret-key"
JWT_EXPIRES_IN="15m"
JWT_REFRESH_EXPIRES_IN="7d"
PORT=3000
CLIENT_URL="http://localhost:5173"
NODE_ENV="development"
```

**`backend/.env.example`** (commit ได้)
```env
DATABASE_URL=postgresql://user:password@localhost:5432/prio_db
JWT_SECRET=your-secret-here
JWT_REFRESH_SECRET=your-refresh-secret-here
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
PORT=3000
CLIENT_URL=http://localhost:5173
NODE_ENV=development
```

**`frontend/.env`**
```env
VITE_API_URL="http://localhost:3000/api"
```

**`frontend/.env.example`**
```env
VITE_API_URL=http://localhost:3000/api
```

---

## 🗄️ Phase 1 — Database & Schema
> เป้าหมาย: schema พร้อม, migrate ได้, seed data ได้

### 1.1 เขียน Prisma Schema
ดูรายละเอียดเต็มใน [`DATABASE.md`](./DATABASE.md)

**ตาราง:**
- `users` — ข้อมูลผู้ใช้ + hashed password
- `tasks` — งาน (title, desc, priority, due_date, is_done)
- `subtasks` — งานย่อยในแต่ละ task
- `tags` — แท็กของแต่ละ user
- `task_tags` — junction table ระหว่าง tasks ↔ tags
- `refresh_tokens` — เก็บ refresh token

### 1.2 Run Migration
```bash
npx prisma migrate dev --name init
npx prisma generate
npx prisma db seed
```

### 1.3 ตรวจสอบด้วย Prisma Studio
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

### 2.1 Endpoints

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/auth/register` | สมัครสมาชิก |
| POST | `/api/auth/login` | เข้าสู่ระบบ |
| POST | `/api/auth/refresh` | แลก refresh token |
| POST | `/api/auth/logout` | revoke refresh token |

### 2.2 JWT Strategy
```
Login Response:
  - access_token  (15 นาที) → เก็บใน Pinia store (memory)
  - refresh_token (7 วัน)   → เก็บใน httpOnly Cookie

ทำไมไม่เก็บ access_token ใน localStorage?
  → โดน XSS ขโมยได้ ควรเก็บใน memory แทน
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
| PATCH | `/api/tasks/:id/position` | reorder (drag & drop) |
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

**Checklist:**
- [ ] ทุก endpoint ต้องผ่าน auth middleware
- [ ] user เห็นได้เฉพาะ tasks ของตัวเอง
- [ ] validation reject ก่อน DB query เสมอ
- [ ] error response มี format เดียวกัน

---

## 🖥️ Phase 4 — Frontend Structure
> เป้าหมาย: Vue app มีโครงสร้างชัดเจน พร้อมเชื่อมต่อ API

### 4.1 Axios Instance + Interceptors
```typescript
// services/api.ts
// 1. แนบ Authorization header ทุก request
// 2. ถ้า 401 → เรียก /auth/refresh อัตโนมัติ
// 3. ถ้า refresh ล้มเหลว → logout + redirect /login
```

### 4.2 Router Guards
```typescript
// router/index.ts
// beforeEach: ถ้า route ต้องการ auth และไม่มี token → redirect /login
// ถ้า authed แล้วเข้า /login → redirect /dashboard
```

**Checklist:**
- [ ] Login ได้และ token เก็บถูกที่
- [ ] หน้า Dashboard โหลด tasks จาก API จริง
- [ ] Create / Edit / Delete ทำงานได้
- [ ] Logout ล้าง token และ redirect

---

## 🔗 Phase 5 — Connect Frontend ↔ Backend
> เป้าหมาย: feature ทุกอย่างทำงานกับ API จริง

### ลำดับการเชื่อม
```
1. Auth flow              → login → เห็น dashboard ได้
2. Load tasks list        → GET /tasks แสดงผล
3. Create task            → POST /tasks → list refresh
4. Toggle done            → PATCH /tasks/:id/done
5. Edit task              → PATCH /tasks/:id
6. Delete task            → DELETE /tasks/:id
7. Search & Filter        → query params → server-side
8. Sort                   → query params → server-side
9. Tags                   → CRUD + assign to task
10. Bulk actions          → PATCH|DELETE /tasks/bulk
```

**Checklist:**
- [ ] ทุก mutation แสดง loading state
- [ ] error แสดง toast message
- [ ] optimistic update บน toggle done

---

## 🚀 Phase 6 — Deploy
> เป้าหมาย: ขึ้น production ได้จริง

### Backend → Railway
```
DATABASE_URL     ← Railway generate ให้
JWT_SECRET       ← random 64 chars
CLIENT_URL       ← https://prio-app.vercel.app
NODE_ENV         ← production
```

### Frontend → Vercel
```
VITE_API_URL     ← https://prio-api.railway.app/api
```

ดูขั้นตอน deploy แบบละเอียดใน [`DEPLOYMENT.md`](./DEPLOYMENT.md)

---

## 📅 Timeline แนะนำ

```
Week 1  │ Phase 0–1  │ Setup + Database schema + Prisma
Week 2  │ Phase 2    │ Auth API (register, login, JWT)
Week 3  │ Phase 3    │ Tasks API (CRUD + bulk + filter)
Week 4  │ Phase 4    │ Frontend structure + connect auth
Week 5  │ Phase 5    │ Connect ทุก feature
Week 6  │ Phase 6    │ Deploy + fix bugs
```

---

## ⚠️ สิ่งที่ต้องระวัง

### Security
- ❌ อย่าเก็บ `JWT_SECRET` ใน code หรือ commit
- ❌ อย่า return password hash ใน response ใด ๆ
- ❌ อย่าลืม validate `user_id` ทุกครั้งที่ query task
- ✅ ใช้ `httpOnly cookie` สำหรับ refresh token เสมอ
- ✅ ใส่ `helmet()` และ `cors()` ทุกครั้ง

### Database
- ❌ อย่า query โดยไม่มี `WHERE user_id = ?`
- ✅ เพิ่ม index บน `user_id` และ `due_date`
- ✅ ใช้ Prisma transaction สำหรับ bulk operations

### Frontend
- ❌ อย่าเก็บ access token ใน `localStorage`
- ✅ เก็บ access token ใน Pinia store (memory)
- ✅ handle expired token ด้วย axios interceptor

---

*อัปเดตล่าสุด: 2025-03-19 | Version: 1.0*
