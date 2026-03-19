# 🏗️ ARCHITECTURE.md — System Design

## System Overview

```
                    ┌─────────────────────────┐
                    │      USER BROWSER        │
                    │  Vue 3 + Vite + Pinia    │
                    │  (Deployed on Vercel)    │
                    └────────────┬────────────┘
                                 │ HTTPS (REST API)
                    ┌────────────▼────────────┐
                    │      BACKEND API         │
                    │  Node.js + Express + TS  │
                    │  (Deployed on Railway)   │
                    └────────────┬────────────┘
                                 │
                    ┌────────────▼────────────┐
                    │      DATABASE            │
                    │  PostgreSQL + Prisma ORM │
                    │  (Railway PostgreSQL)    │
                    └─────────────────────────┘
```

---

## Frontend Architecture

```
Vue 3 App
│
├── Router (Vue Router 4)
│   ├── /                → LandingView
│   ├── /login           → AuthView
│   ├── /register        → AuthView
│   └── /dashboard       → DashboardView [requires auth]
│
├── State (Pinia Stores)
│   ├── auth.store       → user, accessToken, isAuthenticated
│   ├── task.store       → tasks[], filters, selectedIds
│   └── ui.store         → modalOpen, sidebarOpen, theme
│
├── Data Fetching (@tanstack/vue-query)
│   ├── useTasksQuery    → GET /tasks (cached, refetchable)
│   ├── useCreateTask    → POST /tasks (mutation)
│   ├── useUpdateTask    → PATCH /tasks/:id
│   └── useDeleteTask    → DELETE /tasks/:id
│
├── HTTP (Axios)
│   └── api.ts instance
│       ├── baseURL = VITE_API_URL
│       ├── request interceptor  → แนบ Bearer token
│       └── response interceptor → handle 401, auto refresh
│
└── Components
    ├── layout/   → AppSidebar, MobileTopBar, BottomNav
    ├── task/     → TaskCard, TaskFormModal, SubTaskList
    └── ui/       → BaseButton, BaseInput, BaseModal
```

---

## Backend Architecture

```
Express App
│
├── Middleware Stack (ทุก request ผ่านทั้งหมด)
│   ├── helmet()          → Security headers
│   ├── cors()            → Allow only CLIENT_URL
│   ├── rateLimit()       → 100 req/15min per IP
│   ├── express.json()    → Parse JSON body
│   └── morgan()          → Request logging
│
├── Routes
│   ├── /api/auth         → auth.router
│   └── /api/tasks        → tasks.router  [auth middleware]
│       /api/tags         → tags.router   [auth middleware]
│
├── Auth Middleware
│   └── verifyToken       → decode JWT → req.userId
│
├── Modules (Controller → Service → Prisma)
│   ├── auth/
│   │   ├── controller    → รับ req, ส่ง res
│   │   └── service       → business logic, เรียก prisma
│   └── tasks/
│       ├── controller    → validate, parse params
│       └── service       → query builder, prisma calls
│
└── Error Handling
    └── Global error middleware → format error response
```

---

## Auth Flow

```
REGISTER
  Client → POST /auth/register { name, email, password }
         ← 201 { user }  (password ถูก hash แล้ว)

LOGIN
  Client → POST /auth/login { email, password }
         ← 200 { access_token }
              + Set-Cookie: refresh_token=xxx; HttpOnly; Secure

AUTHENTICATED REQUEST
  Client → GET /api/tasks
           Authorization: Bearer <access_token>
         ← 200 { tasks[] }

TOKEN REFRESH (เมื่อ access_token หมดอายุ)
  Client → POST /auth/refresh
           Cookie: refresh_token=xxx (ส่งอัตโนมัติ)
         ← 200 { access_token }  (ใหม่)

LOGOUT
  Client → POST /auth/logout
         ← 200  +  Clear-Cookie: refresh_token
```

---

## Database Schema (ย่อ)

```
users ──────────────── tasks
  id                     id
  name                   user_id (FK)
  email                  title
  password_hash          description
  created_at             priority (High|Medium|Low)
                         due_date
                         is_done
                         created_at
                         updated_at
                          │
tags ◄──── task_tags ───►┘
  id         task_id
  user_id    tag_id
  name
```

ดูรายละเอียด Prisma Schema เต็มได้ใน [`DATABASE.md`](./DATABASE.md)

---

## Security Layers

| Layer | Tool | หน้าที่ |
|-------|------|--------|
| HTTPS | Vercel / Railway | encrypt in transit |
| CORS | cors() | อนุญาตเฉพาะ origin ที่กำหนด |
| Helmet | helmet() | ตั้ง security headers |
| Rate Limit | express-rate-limit | กัน brute force |
| JWT Auth | jsonwebtoken | verify identity |
| Password | bcryptjs (12 rounds) | hash ก่อนเก็บ |
| Validation | zod | sanitize input ก่อน DB |
| Row-level | Prisma WHERE clause | user เห็นเฉพาะ data ตัวเอง |

---

*อัปเดตล่าสุด: 2025-03-19*
