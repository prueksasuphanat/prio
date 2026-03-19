# 🚀 Setup Instructions

## Phase 0 Complete! ✅

โครงสร้างโปรเจกต์ถูกสร้างเรียบร้อยแล้ว ขั้นตอนต่อไป:

## ติดตั้ง Dependencies

### Backend

```bash
cd backend
npm install
```

### Frontend

```bash
cd frontend
npm install
```

## ตั้งค่า Environment Variables

ไฟล์ `.env` ถูกสร้างไว้แล้วทั้งสองฝั่ง:

- `backend/.env` — แก้ไข `DATABASE_URL` และ `JWT_SECRET`
- `frontend/.env` — ใช้ค่า default ได้เลย

## ตั้งค่า Database (Phase 1)

```bash
cd backend

# สร้าง database ใน PostgreSQL
createdb prio_db

# หรือใช้ Supabase/Railway free tier

# Run migration (จะทำใน Phase 1)
npx prisma migrate dev --name init
```

## รัน Development Server

### Terminal 1 — Backend

```bash
cd backend
npm run dev
```

Server จะรันที่ `http://localhost:3000`

### Terminal 2 — Frontend

```bash
cd frontend
npm run dev
```

Frontend จะรันที่ `http://localhost:5173`

## ทดสอบ

### Backend Health Check

```bash
curl http://localhost:3000/health
```

ควรได้: `{"status":"ok","timestamp":"..."}`

### Frontend

เปิดเบราว์เซอร์ไปที่ `http://localhost:5173` ควรเห็นหน้า Home

## Next Steps

Phase 0 เสร็จแล้ว! ต่อไปคือ:

- **Phase 1:** สร้าง Database Schema ด้วย Prisma
- **Phase 2:** สร้าง Auth API
- **Phase 3:** สร้าง Tasks API

ดูรายละเอียดใน `docs/TASKS.md`
