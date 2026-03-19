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
Vue 3 App (prio/frontend/)
│
├── Router (Vue Router 4)
│   ├── /                → LandingView
│   ├── /login           → AuthView
│   ├── /register        → AuthView
│   └── /dashboard       → DashboardView  [requires auth]
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
│   └── services/api.ts
│       ├── baseURL = VITE_API_URL
│       ├── withCredentials: true        ← ส่ง cookie อัตโนมัติ
│       ├── request interceptor          ← แนบ Bearer token
│       └── response interceptor         ← handle 401, auto refresh
│
└── Components
    ├── layout/   → AppSidebar, MobileTopBar, BottomNav
    ├── task/     → TaskCard, TaskFormModal, SubTaskList
    └── ui/       → BaseButton, BaseInput, BaseModal
```

---

## Backend Architecture

```
Express App (prio/backend/)
│
├── Middleware Stack
│   ├── helmet()          → Security headers
│   ├── cors()            → Allow only CLIENT_URL
│   ├── rateLimit()       → 100 req/15min per IP
│   ├── express.json()    → Parse JSON body
│   └── morgan()          → Request logging
│
├── Routes
│   ├── /api/auth         → auth.router
│   ├── /api/tasks        → tasks.router   [auth middleware]
│   └── /api/tags         → tags.router    [auth middleware]
│
├── Auth Middleware
│   └── verifyToken       → decode JWT → req.userId
│
├── Modules (Controller → Service → Prisma)
│   ├── auth/
│   │   ├── controller    → รับ req, ส่ง res
│   │   └── service       → business logic, เรียก prisma
│   ├── tasks/
│   │   ├── controller    → validate, parse params
│   │   └── service       → query builder, prisma calls
│   └── tags/
│       ├── controller
│       └── service
│
└── Error Handling
    └── Global error middleware → format error response
```

---

## Auth Flow

```
REGISTER
  Client → POST /auth/register { name, email, password }
         ← 201 { user }

LOGIN
  Client → POST /auth/login { email, password }
         ← 200 { access_token, user }
              + Set-Cookie: refresh_token=xxx; HttpOnly; Secure

AUTHENTICATED REQUEST
  Client → GET /api/tasks
           Authorization: Bearer <access_token>
         ← 200 { tasks[] }

TOKEN REFRESH (เมื่อ access_token หมดอายุ)
  Client → POST /auth/refresh
           Cookie: refresh_token=xxx  (ส่งอัตโนมัติ)
         ← 200 { access_token }

LOGOUT
  Client → POST /auth/logout
         ← 200 + Clear-Cookie: refresh_token
```

---

## Database Schema (ย่อ)

```
users ──────────────────────── tasks
  id                             id
  name                           user_id (FK → users)
  email                          title
  password_hash                  description
  created_at                     priority (High|Medium|Low)
                                 due_date
                                 is_done
                                 position
                                 created_at
                                  │
                                  ├──── subtasks
                                  │       id
                                  │       task_id (FK)
                                  │       title
                                  │       is_done
                                  │
tags ◄──── task_tags ────────────┘
  id         task_id (FK)
  user_id    tag_id  (FK)
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
| Row-level | Prisma WHERE user_id | user เห็นเฉพาะ data ตัวเอง |

---

## Environment Variables

```
prio/
├── frontend/.env         VITE_API_URL
├── frontend/.env.example (template — commit ได้)
├── backend/.env          DATABASE_URL, JWT_SECRET, PORT, CLIENT_URL ...
└── backend/.env.example  (template — commit ได้)
```

> ไฟล์ `.env` ทั้งหมดอยู่ใน `.gitignore`
> ไฟล์ `.env.example` commit ขึ้น git เพื่อเป็น template ให้ทีม

---

*อัปเดตล่าสุด: 2025-03-19*
