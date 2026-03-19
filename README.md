# 📋 Prio — Task Management App

> Full-stack task management application with Vue 3, Node.js, and PostgreSQL

## 🚀 Tech Stack

**Frontend:**

- Vue 3 + TypeScript + Vite
- TailwindCSS
- Pinia (State Management)
- Vue Router 4
- TanStack Query (Data Fetching)
- Axios (HTTP Client)

**Backend:**

- Node.js + Express + TypeScript
- PostgreSQL + Prisma ORM
- JWT Authentication (Access + Refresh Token)
- bcryptjs (Password Hashing)

**Deployment:**

- Frontend: Vercel
- Backend: Railway
- Database: Railway PostgreSQL

## 📁 Project Structure

```
prio/
├── frontend/          # Vue 3 application
├── backend/           # Express API server
└── docs/              # Documentation
    ├── PLAN.md        # Project plan
    ├── TASKS.md       # Task breakdown
    ├── ARCHITECTURE.md
    ├── API.md
    ├── DATABASE.md
    └── DEPLOYMENT.md
```

## 🛠️ Development Setup

See [docs/SETUP.md](docs/SETUP.md) for detailed setup instructions.

### Quick Start

```bash
# Backend
cd backend
npm install
cp .env.example .env
npx prisma migrate dev
npm run dev

# Frontend
cd frontend
npm install
npm run dev
```

- Backend: `http://localhost:3000`
- Frontend: `http://localhost:5173`
- Demo login: `demo@prio.app` / `password123`

## 📚 Documentation

See the `docs/` folder for detailed documentation:

- [PLAN.md](docs/PLAN.md) — Project overview and phases
- [TASKS.md](docs/TASKS.md) — Detailed task breakdown
- [ARCHITECTURE.md](docs/ARCHITECTURE.md) — System design
- [API.md](docs/API.md) — API reference
- [DATABASE.md](docs/DATABASE.md) — Database schema
- [DEPLOYMENT.md](docs/DEPLOYMENT.md) — Deployment guide
- [SETUP.md](docs/SETUP.md) — Setup instructions
- [Postman Guide](docs/postman/POSTMAN_GUIDE.md) — API testing

**Phase Completion:**

- [Phase 0](docs/phases/PHASE0_COMPLETE.md) — Project Setup ✅
- [Phase 1](docs/phases/PHASE1_COMPLETE.md) — Database Schema ✅
- [Phase 2](docs/phases/PHASE2_COMPLETE.md) — Auth API ✅

- [Phase 0 Complete](docs/PHASE0_COMPLETE.md) — Project Setup ✅
- [Phase 1 Complete](docs/PHASE1_COMPLETE.md) — Database Schema ✅
- [Phase 2 Complete](docs/PHASE2_COMPLETE.md) — Auth API ✅

## ✨ Features

- ✅ User authentication (Register/Login)
- ✅ Create, edit, delete tasks
- ✅ Task priorities (High/Medium/Low)
- ✅ Due dates and reminders
- ✅ Subtasks
- ✅ Tags and filtering
- ✅ Search functionality
- ✅ Bulk actions
- ✅ Drag & drop reordering
- ✅ Dark/Light mode
- ✅ Responsive design

## 📝 License

MIT
