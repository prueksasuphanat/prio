# 🚀 DEPLOYMENT.md — Deploy Guide

## Overview

```
Frontend → Vercel       (auto deploy จาก GitHub main branch)
Backend  → Railway      (auto deploy จาก GitHub main branch)
Database → Railway PostgreSQL
```

---

## Pre-deploy Checklist

- [ ] `.env` ทั้งหมดอยู่ใน `.gitignore` แล้ว
- [ ] `.env.example` มีครบทั้ง `frontend/` และ `backend/`
- [ ] ไม่มี hardcoded secret ใน code
- [ ] `NODE_ENV=production` ตั้งค่าถูก
- [ ] CORS ชี้ไปที่ production URL เท่านั้น
- [ ] `npm run build` ทั้งสองฝั่งผ่านโดยไม่ error

---

## Backend → Railway

### 1. เตรียม `package.json`
```json
{
  "scripts": {
    "build": "tsc",
    "start": "node dist/index.js",
    "dev": "ts-node-dev src/index.ts"
  }
}
```

### 2. เตรียม `Procfile`
```
web: npm start
release: npx prisma migrate deploy
```

### 3. Push ขึ้น GitHub
```bash
git add .
git commit -m "feat: ready for deploy"
git push origin main
```

### 4. สร้าง Project บน Railway
1. ไปที่ [railway.app](https://railway.app) → New Project
2. Deploy from GitHub repo → เลือก `prio` repo
3. ตั้ง Root Directory → `backend`

### 5. เพิ่ม PostgreSQL Service
1. Railway Dashboard → + New → Database → PostgreSQL
2. คัดลอก `DATABASE_URL` จาก Variables tab

### 6. ตั้ง Environment Variables
```
DATABASE_URL             ← จาก Railway PostgreSQL (auto-filled)
JWT_SECRET               ← random 64 chars (ดูวิธีสร้างด้านล่าง)
JWT_REFRESH_SECRET       ← random 64 chars
JWT_EXPIRES_IN           ← 15m
JWT_REFRESH_EXPIRES_IN   ← 7d
PORT                     ← 3000
CLIENT_URL               ← https://prio-app.vercel.app
NODE_ENV                 ← production
```

### 7. ได้ URL
```
https://prio-api.railway.app
```

---

## Frontend → Vercel

### 1. เตรียม `vercel.json` ใน `frontend/`
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "installCommand": "npm install",
  "framework": "vite"
}
```

### 2. Import บน Vercel
1. ไปที่ [vercel.com](https://vercel.com) → New Project
2. Import GitHub repo `prio`
3. ตั้ง Root Directory → `frontend`

### 3. ตั้ง Environment Variables
```
VITE_API_URL    ← https://prio-api.railway.app/api
```

### 4. Deploy
```
https://prio-app.vercel.app
```

---

## Environment Variables Summary

**Railway (Backend)**
```env
DATABASE_URL=postgresql://...
JWT_SECRET=<random-64-chars>
JWT_REFRESH_SECRET=<random-64-chars>
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
PORT=3000
CLIENT_URL=https://prio-app.vercel.app
NODE_ENV=production
```

**Vercel (Frontend)**
```env
VITE_API_URL=https://prio-api.railway.app/api
```

---

## Generate Secret Keys

```bash
# วิธีที่ 1: Node.js
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# วิธีที่ 2: openssl
openssl rand -hex 64
```

---

## CI/CD Flow

```
Developer pushes to main
         │
         ├──► Railway builds backend
         │       tsc → node dist/index.js
         │       prisma migrate deploy
         │
         └──► Vercel builds frontend
                 vite build → dist/
```

---

## Useful Commands (post-deploy)

```bash
# ดู logs
railway logs

# Run prisma migrate บน production
railway run npx prisma migrate deploy

# Connect production DB ผ่าน Prisma Studio
railway run npx prisma studio
```

---

## Local → Production Differences

| | Local (dev) | Production |
|--|------------|------------|
| Frontend URL | `localhost:5173` | `https://prio-app.vercel.app` |
| Backend URL | `localhost:3000` | `https://prio-api.railway.app` |
| Database | local PostgreSQL | Railway PostgreSQL |
| NODE_ENV | `development` | `production` |
| CORS | อนุญาตทุก origin | เฉพาะ `prio-app.vercel.app` |
| Error details | แสดง stack trace | ซ่อน (แสดงแค่ message) |

---

*อัปเดตล่าสุด: 2025-03-19*
