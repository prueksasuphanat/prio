# 🛠️ Setup Guide

## Prerequisites

- Node.js 18+
- PostgreSQL 14+
- npm or yarn

---

## Quick Start

### 1. Clone & Install

```bash
# Clone repository
git clone <repository-url>
cd prio

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

---

### 2. Database Setup

**Option A: Local PostgreSQL**

```bash
# Install PostgreSQL (macOS)
brew install postgresql@15
brew services start postgresql@15

# Create database
createdb prio_db

# Configure backend/.env
DATABASE_URL="postgresql://localhost:5432/prio_db"
```

**Option B: Supabase (Production)**

1. Go to https://supabase.com
2. Create new project
3. Copy connection string
4. Update `backend/.env`

---

### 3. Backend Setup

```bash
cd backend

# Copy environment file
cp .env.example .env

# Edit .env with your settings
# DATABASE_URL, JWT_SECRET, etc.

# Run migrations
npx prisma migrate dev --name init

# Generate Prisma Client
npx prisma generate

# Seed demo data
npx prisma db seed

# Start server
npm run dev
```

Server runs at `http://localhost:3000`

---

### 4. Frontend Setup

```bash
cd frontend

# Copy environment file
cp .env.example .env

# Edit .env if needed
# VITE_API_URL=http://localhost:3000/api

# Start dev server
npm run dev
```

Frontend runs at `http://localhost:5173`

---

## Testing API with Postman

### Import Collection

1. Open Postman
2. Click **Import**
3. Select files from `postman/` folder:
   - `postman/Prio_API.postman_collection.json`
   - `postman/Prio_Local.postman_environment.json`
4. Select "Prio Local" environment

### Test Endpoints

1. **Health Check** — Verify server is running
2. **Register** — Create new user
3. **Login** — Get access token
4. **Refresh** — Get new access token
5. **Logout** — Clear session

See [postman/POSTMAN_GUIDE.md](./postman/POSTMAN_GUIDE.md) for details.

---

## Troubleshooting

### Port 3000 already in use

```bash
# Kill process using port 3000
lsof -ti:3000 | xargs kill -9

# Or change port in backend/.env
PORT=3001
```

### Database connection error

```bash
# Check PostgreSQL is running
brew services list | grep postgresql

# Verify DATABASE_URL in .env
# Make sure database exists
psql -l | grep prio_db
```

### Prisma Client not generated

```bash
cd backend
npx prisma generate
```

### Missing dependencies

```bash
# Backend
cd backend
npm install cookie-parser
npm install -D @types/cookie-parser

# Frontend
cd frontend
npm install
```

---

## Environment Variables

### Backend (.env)

```env
DATABASE_URL=postgresql://localhost:5432/prio_db
JWT_SECRET=your-secret-key-min-32-chars
JWT_REFRESH_SECRET=your-refresh-secret-min-32-chars
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
PORT=3000
CLIENT_URL=http://localhost:5173
NODE_ENV=development
```

### Frontend (.env)

```env
VITE_API_URL=http://localhost:3000/api
```

---

## Demo Credentials

After running `npx prisma db seed`:

- **Email**: demo@prio.app
- **Password**: password123

---

## Next Steps

1. ✅ Verify backend health: `curl http://localhost:3000/health`
2. ✅ Test auth endpoints with Postman
3. ✅ Open frontend: `http://localhost:5173`
4. ✅ Login with demo credentials

See [TASKS.md](./TASKS.md) for development roadmap.
