# 🚀 DEPLOYMENT.md — Deploy Guide

## Overview

```
Frontend → Vercel       (auto deploy จาก GitHub main branch)
Backend  → Railway      (auto deploy จาก GitHub main branch)
Database → Railway PostgreSQL
```

---

## Pre-deploy Checklist

- [ ] ทุก `.env` อยู่ใน `.gitignore` แล้ว
- [ ] ไม่มี hardcoded secret ใน code
- [ ] `NODE_ENV=production` ตั้งค่าถูกต้อง
- [ ] CORS ชี้ไปที่ production URL เท่านั้น
- [ ] `prisma migrate deploy` ทำงานได้

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

### 2. เตรียม `Procfile` (optional แต่ชัดเจนกว่า)
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
2. Deploy from GitHub repo
3. เลือก `backend/` folder เป็น root

### 5. เพิ่ม PostgreSQL Service
1. Railway Dashboard → + New → Database → PostgreSQL
2. คัดลอก `DATABASE_URL` จาก Variables tab

### 6. ตั้ง Environment Variables
```
DATABASE_URL          ← จาก Railway PostgreSQL
JWT_SECRET            ← random string ยาวๆ (min 32 chars)
JWT_REFRESH_SECRET    ← random string อีกตัว
JWT_EXPIRES_IN        ← 15m
JWT_REFRESH_EXPIRES_IN← 7d
PORT                  ← 3000
CLIENT_URL            ← https://taski-app.vercel.app
NODE_ENV              ← production
```

### 7. ได้ URL
```
https://taski-api-production.up.railway.app
```

---

## Frontend → Vercel

### 1. เตรียม `vercel.json` (ถ้าใช้ monorepo)
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "installCommand": "npm install",
  "framework": "vite"
}
```

### 2. Push ขึ้น GitHub

### 3. Import บน Vercel
1. ไปที่ [vercel.com](https://vercel.com) → New Project
2. Import GitHub repo
3. เลือก `frontend/` เป็น Root Directory

### 4. ตั้ง Environment Variables
```
VITE_API_URL    ← https://taski-api-production.up.railway.app/api
```

### 5. Deploy!
```
https://taski-app.vercel.app
```

---

## Production Environment Variables Summary

**Railway (Backend)**
```env
DATABASE_URL=postgresql://...
JWT_SECRET=super-long-random-secret-min-32-chars
JWT_REFRESH_SECRET=another-super-long-random-secret
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
PORT=3000
CLIENT_URL=https://taski-app.vercel.app
NODE_ENV=production
```

**Vercel (Frontend)**
```env
VITE_API_URL=https://taski-api-production.up.railway.app/api
```

---

## การ Generate Secret Keys

```bash
# วิธีที่ 1: Node.js
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# วิธีที่ 2: openssl
openssl rand -hex 64
```

---

## CI/CD Flow (Auto Deploy)

```
Developer pushes to main branch
         ↓
GitHub webhook triggers
    ↓           ↓
Railway       Vercel
  build         build
  migrate       deploy
  deploy
         ↓
Both services live
```

---

## Useful Commands (post-deploy)

```bash
# ดู logs บน Railway (ผ่าน CLI)
railway logs

# Run prisma migrate บน production
railway run npx prisma migrate deploy

# Connect to production DB
railway run npx prisma studio
```

---

*อัปเดตล่าสุด: 2025-03-19*
