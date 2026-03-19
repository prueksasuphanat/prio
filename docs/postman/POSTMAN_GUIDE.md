# 📮 Postman Testing Guide

## Import Collection & Environments

### 1. Import Collection

1. เปิด Postman
2. คลิก **Import** (มุมซ้ายบน)
3. เลือกไฟล์ `Prio_API.postman_collection.json`
4. คลิก **Import**

### 2. Import Environments

1. คลิก **Import** อีกครั้ง
2. เลือกไฟล์ทั้งสอง:
   - `Prio_Local.postman_environment.json` (Development)
   - `Prio_Production.postman_environment.json` (Production)
3. คลิก **Import**

### 3. เลือก Environment

1. คลิก dropdown ที่มุมขวาบน (ข้าง ⚙️)
2. เลือก **"Prio Local"** สำหรับ development
3. หรือเลือก **"Prio Production"** เมื่อ deploy แล้ว

---

## Environments

### Prio Local (Development)

- **baseUrl**: `http://localhost:3000`
- **accessToken**: (auto-saved after login)
- ใช้สำหรับทดสอบบน local machine

### Prio Production (Production)

- **baseUrl**: `https://prio-api.railway.app`
- **accessToken**: (auto-saved after login)
- ใช้สำหรับทดสอบบน production server

---

## ลำดับการทดสอบ

### 1. Health Check ✅

- ทดสอบว่า server รันอยู่
- ควรได้ `{ "status": "ok", "timestamp": "..." }`

### 2. Register 📝

- สมัครสมาชิกใหม่
- ใช้ email ที่ไม่ซ้ำ
- ควรได้ status `201 Created`

**ตัวอย่าง Request Body:**

```json
{
  "name": "Test User",
  "email": "test@example.com",
  "password": "password123"
}
```

**Expected Response:**

```json
{
  "success": true,
  "data": {
    "user": {
      "id": 2,
      "name": "Test User",
      "email": "test@example.com",
      "createdAt": "2025-03-20T..."
    }
  }
}
```

### 3. Login 🔐

- เข้าสู่ระบบด้วย email/password
- Access token จะถูกบันทึกอัตโนมัติใน collection variable
- Refresh token จะอยู่ใน cookie (httpOnly)

**ตัวอย่าง Request Body:**

```json
{
  "email": "test@example.com",
  "password": "password123"
}
```

**Expected Response:**

```json
{
  "success": true,
  "data": {
    "user": {
      "id": 2,
      "name": "Test User",
      "email": "test@example.com"
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### 4. Login (Demo User) 👤

- ทดสอบด้วย demo user จาก seed data
- Email: `demo@prio.app`
- Password: `password123`

### 5. Refresh Token 🔄

- แลก refresh token เป็น access token ใหม่
- ไม่ต้องส่ง body (ใช้ cookie อัตโนมัติ)
- Access token ใหม่จะถูกบันทึกอัตโนมัติ

**Expected Response:**

```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### 6. Logout 🚪

- ออกจากระบบ
- ลบ refresh token จาก database
- Clear cookie
- ต้องมี Authorization header (ใช้ {{accessToken}} อัตโนมัติ)

**Expected Response:**

```json
{
  "success": true,
  "data": {
    "message": "Logged out successfully"
  }
}
```

---

## Features ของ Collection

### Auto-save Access Token

- หลัง Login สำเร็จ → access token ถูกบันทึกอัตโนมัติ
- ใช้ `{{accessToken}}` ใน Authorization header
- หลัง Logout → access token ถูกลบอัตโนมัติ

### Cookie Management

- Postman จัดการ cookies อัตโนมัติ
- Refresh token ถูกเก็บใน httpOnly cookie
- ไม่ต้องคัดลอก/วาง cookie เอง

### Console Logs

- เปิด Postman Console (View → Show Postman Console)
- ดู logs หลังแต่ละ request
- ตรวจสอบว่า token ถูกบันทึกหรือไม่

---

## Error Cases ที่ควรทดสอบ

### Register Errors

**Email ซ้ำ:**

```json
{
  "success": false,
  "error": {
    "code": "CONFLICT",
    "message": "Email already exists"
  }
}
```

**Password สั้นเกินไป:**

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input",
    "details": [
      {
        "field": "password",
        "message": "Password must be at least 8 characters"
      }
    ]
  }
}
```

### Login Errors

**Email/Password ผิด:**

```json
{
  "success": false,
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Invalid email or password"
  }
}
```

### Refresh Token Errors

**ไม่มี cookie:**

```json
{
  "success": false,
  "error": {
    "code": "UNAUTHORIZED",
    "message": "No refresh token provided"
  }
}
```

**Token หมดอายุ:**

```json
{
  "success": false,
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Invalid or expired refresh token"
  }
}
```

### Logout Errors

**ไม่มี Authorization header:**

```json
{
  "success": false,
  "error": {
    "code": "UNAUTHORIZED",
    "message": "No token provided"
  }
}
```

---

## Rate Limiting

Auth endpoints มี rate limit:

- **10 requests / 15 minutes** สำหรับ register และ login
- ถ้าเกิน limit จะได้ error:

```json
{
  "success": false,
  "error": {
    "code": "RATE_LIMIT",
    "message": "Too many requests, please try again later"
  }
}
```

---

## Tips

### ดู Cookies

1. คลิก **Cookies** (ใต้ Send button)
2. เลือก domain `localhost:3000`
3. จะเห็น `refresh_token` cookie

### ดู Access Token

1. คลิก **Variables** tab (ขวามือ)
2. ดู `accessToken` variable
3. คัดลอกไปใช้ที่อื่นได้

### Clear All Data

1. ลบ cookies: Cookies → Delete All
2. ลบ token: Variables → Clear `accessToken`
3. หรือ Logout แล้ว Login ใหม่

---

## Troubleshooting

### ❌ "Could not send request"

- ตรวจสอบว่า server รันอยู่: `npm run dev`
- ตรวจสอบ baseUrl: `http://localhost:3000`

### ❌ "No token provided"

- Login ก่อน
- ตรวจสอบว่า `{{accessToken}}` มีค่า

### ❌ "Invalid or expired token"

- Token หมดอายุ (15 นาที)
- ใช้ Refresh Token endpoint
- หรือ Login ใหม่

### ❌ "Email already exists"

- ใช้ email อื่น
- หรือ Login แทน Register

---

## Next Steps

หลังทดสอบ Auth API เสร็จ:

1. ✅ ทุก endpoint ทำงานได้
2. ✅ Tokens ถูกบันทึกและใช้งานได้
3. ✅ Error handling ถูกต้อง

พร้อมเริ่ม Phase 3 — Tasks API! 🚀
