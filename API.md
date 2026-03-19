# 📡 API.md — API Reference

> **Base URL (dev):** `http://localhost:3000/api`
> **Base URL (prod):** `https://taski-api.railway.app/api`
> **Auth:** Bearer Token in `Authorization` header

---

## Standard Response Format

```json
// Success
{
  "success": true,
  "data": { ... }
}

// Success (list)
{
  "success": true,
  "data": [...],
  "meta": { "total": 20, "page": 1, "limit": 20 }
}

// Error
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Title is required",
    "details": [...]
  }
}
```

---

## 🔐 Auth Endpoints

### POST `/auth/register`
สมัครสมาชิกใหม่

**Body**
```json
{
  "name": "ภูมิ สมชาย",
  "email": "phumi@example.com",
  "password": "password123"
}
```

**Response 201**
```json
{
  "success": true,
  "data": {
    "user": { "id": 1, "name": "ภูมิ สมชาย", "email": "phumi@example.com" }
  }
}
```

---

### POST `/auth/login`
เข้าสู่ระบบ

**Body**
```json
{
  "email": "phumi@example.com",
  "password": "password123"
}
```

**Response 200**
```json
{
  "success": true,
  "data": {
    "access_token": "eyJhbGci...",
    "user": { "id": 1, "name": "ภูมิ สมชาย", "email": "phumi@example.com" }
  }
}
```
> ⚠️ `refresh_token` ส่งกลับมาใน `HttpOnly Cookie` ไม่ใช่ body

---

### POST `/auth/refresh`
แลก refresh token เอา access token ใหม่

**Cookie (อัตโนมัติ):** `refresh_token=xxx`

**Response 200**
```json
{
  "success": true,
  "data": { "access_token": "eyJhbGci..." }
}
```

---

### POST `/auth/logout`
ออกจากระบบ (revoke refresh token)

**Headers:** `Authorization: Bearer <token>`

**Response 200**
```json
{ "success": true }
```

---

## ✅ Tasks Endpoints

> ทุก endpoint ต้องการ: `Authorization: Bearer <access_token>`

---

### GET `/tasks`
ดึง tasks ของ user พร้อม filter/sort

**Query Params**

| Param | Type | Example | Description |
|-------|------|---------|-------------|
| `search` | string | `ส่งรายงาน` | ค้นหาจากชื่อ |
| `view` | string | `today\|upcoming\|overdue\|done\|all` | filter preset |
| `priority` | string | `High\|Medium\|Low` | filter priority |
| `tag` | string | `Work` | filter by tag name |
| `sort` | string | `created_at\|due_date\|priority\|title` | เรียงลำดับ |
| `order` | string | `asc\|desc` | ทิศทาง |
| `page` | number | `1` | หน้า |
| `limit` | number | `20` | จำนวนต่อหน้า |

**Response 200**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "title": "ส่งรายงาน Q3",
      "description": "รวมยอดขาย...",
      "priority": "High",
      "dueDate": "2025-03-22T00:00:00.000Z",
      "isDone": false,
      "position": 0,
      "createdAt": "2025-03-15T10:00:00.000Z",
      "tags": [{ "id": 1, "name": "Work" }],
      "subtasks": [
        { "id": 101, "title": "รวบรวมข้อมูล", "isDone": true }
      ]
    }
  ],
  "meta": { "total": 5, "page": 1, "limit": 20 }
}
```

---

### POST `/tasks`
สร้างงานใหม่

**Body**
```json
{
  "title": "ส่งรายงาน Q3",
  "description": "รวมยอดขาย...",
  "priority": "High",
  "dueDate": "2025-03-22T00:00:00.000Z",
  "tagIds": [1, 2]
}
```

**Response 201** — task object เดียวกับ GET

---

### PATCH `/tasks/:id`
แก้ไขงาน (partial update)

**Body** — field ไหนก็ได้ที่อยากแก้
```json
{
  "title": "ส่งรายงาน Q3 (ปรับปรุง)",
  "priority": "Medium"
}
```

**Response 200** — task object ที่อัปเดตแล้ว

---

### DELETE `/tasks/:id`
ลบงาน

**Response 200**
```json
{ "success": true }
```

---

### PATCH `/tasks/:id/done`
Toggle สถานะ done/not done

**Response 200**
```json
{
  "success": true,
  "data": { "id": 1, "isDone": true }
}
```

---

### PATCH `/tasks/:id/position`
อัปเดตตำแหน่ง (drag & drop)

**Body**
```json
{ "position": 2 }
```

---

### PATCH `/tasks/bulk/done`
Mark หลายงานว่าเสร็จพร้อมกัน

**Body**
```json
{ "taskIds": [1, 2, 3] }
```

**Response 200**
```json
{
  "success": true,
  "data": { "count": 3 }
}
```

---

### DELETE `/tasks/bulk`
ลบหลายงานพร้อมกัน

**Body**
```json
{ "taskIds": [1, 2, 3] }
```

**Response 200**
```json
{
  "success": true,
  "data": { "count": 3 }
}
```

---

## 🏷️ Tags Endpoints

### GET `/tags`
ดึง tags ทั้งหมดของ user

**Response 200**
```json
{
  "success": true,
  "data": [
    { "id": 1, "name": "Work", "taskCount": 3 },
    { "id": 2, "name": "Dev",  "taskCount": 2 }
  ]
}
```

---

### POST `/tags`
สร้าง tag ใหม่

**Body**
```json
{ "name": "Design" }
```

**Response 201**
```json
{
  "success": true,
  "data": { "id": 3, "name": "Design" }
}
```

---

### DELETE `/tags/:id`
ลบ tag (task ที่ใช้ tag นี้จะหลุด tag ออกไปอัตโนมัติ)

**Response 200**
```json
{ "success": true }
```

---

## 🚫 Error Codes

| Code | HTTP | Description |
|------|------|-------------|
| `VALIDATION_ERROR` | 400 | input ไม่ถูกต้อง |
| `UNAUTHORIZED` | 401 | ไม่มี / token หมดอายุ |
| `FORBIDDEN` | 403 | ไม่ใช่เจ้าของ resource |
| `NOT_FOUND` | 404 | หา resource ไม่เจอ |
| `CONFLICT` | 409 | ข้อมูลซ้ำ (เช่น email) |
| `RATE_LIMIT` | 429 | เรียก API บ่อยเกิน |
| `SERVER_ERROR` | 500 | internal error |

---

*อัปเดตล่าสุด: 2025-03-19*
