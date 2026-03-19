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

### Prerequisites

- Node.js 18+ and npm
- PostgreSQL 14+
- Git

### Backend Setup

```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your database credentials
npx prisma migrate dev
npx prisma db seed
npm run dev
```

Backend will run at `http://localhost:3000`

### Frontend Setup

```bash
cd frontend
npm install
cp .env.example .env
# Edit .env if needed
npm run dev
```

Frontend will run at `http://localhost:5173`

## 📚 Documentation

See the `docs/` folder for detailed documentation:

- [PLAN.md](docs/PLAN.md) — Project overview and phases
- [TASKS.md](docs/TASKS.md) — Detailed task breakdown
- [ARCHITECTURE.md](docs/ARCHITECTURE.md) — System design
- [API.md](docs/API.md) — API reference
- [DATABASE.md](docs/DATABASE.md) — Database schema
- [DEPLOYMENT.md](docs/DEPLOYMENT.md) — Deployment guide

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
