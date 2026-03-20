# 📘 Phase 4 Guide — Frontend Structure

**เป้าหมาย:** สร้างโครงสร้าง Vue app พร้อม Auth flow ที่ทำงานกับ API จริง

---

## 📋 Overview

Phase 4 จะสร้างโครงสร้างพื้นฐานของ frontend ทั้งหมด โดยแบ่งเป็น 9 ส่วนหลัก:

1. **TypeScript Types** — กำหนด types สำหรับ Task, User, API responses
2. **API Service Layer** — Axios instance + interceptors
3. **Pinia Stores** — State management + API calls (auth, tasks, ui)
4. **Composables** — Reusable UI logic (useToast, useTheme)
5. **Vue Router** — Routes + navigation guards
6. **Base UI Components** — Button, Input, Modal, Toast
7. **Layout Components** — Sidebar, TopBar, BottomNav
8. **Task Components** — TaskCard, SubTaskList, TaskFormModal, etc.
9. **Views** — Landing, Auth, Dashboard

---

## 🎯 แนวทางการทำงาน

### หลักการสำคัญ

- **Store-Based API**: เรียก API ใน store actions โดยตรง
- **Type Safety**: ใช้ TypeScript อย่างเต็มที่ กำหนด types ชัดเจน
- **Composition API**: ใช้ `<script setup>` และ Composition API
- **Separation of Concerns**: แยก business logic (stores) กับ UI logic (composables)
- **Responsive**: รองรับทั้ง desktop และ mobile

### ลำดับการทำงานที่แนะนำ

1. เริ่มจาก **Types** → **API Service** → **Stores** (foundation)
2. ต่อด้วย **Composables** → **Router** (logic layer)
3. สร้าง **Base Components** → **Layout** (UI foundation)
4. สร้าง **Task Components** → **Views** (features)
5. ทดสอบ **Auth Flow** ให้ทำงานก่อน
6. ค่อยทำ Task features ทีละส่วน

---

## 📁 โครงสร้างไฟล์ที่จะสร้าง

```
frontend/src/
├── types/
│   ├── auth.types.ts       # User, LoginDto, RegisterDto, AuthResponse
│   └── task.types.ts       # Task, Subtask, Tag, Priority, DTOs
├── services/
│   └── api.ts              # Axios instance + interceptors
├── stores/
│   ├── auth.store.ts       # Auth state + API calls (login, register, logout)
│   ├── task.store.ts       # Task state + API calls (CRUD, bulk operations)
│   └── ui.store.ts         # UI state (sidebarOpen, theme, locale)
├── composables/
│   ├── useToast.ts         # Toast notifications
│   └── useTheme.ts         # Dark/Light mode
├── i18n/
│   ├── index.ts            # i18n setup
│   ├── locales/
│   │   ├── en.json         # English translations
│   │   └── th.json         # Thai translations
├── router/
│   └── index.ts            # Routes + navigation guards
├── components/
│   ├── base/
│   │   ├── BaseButton.vue
│   │   ├── BaseInput.vue
│   │   ├── BaseModal.vue
│   │   └── BaseToast.vue
│   ├── layout/
│   │   ├── AppSidebar.vue
│   │   ├── MobileTopBar.vue
│   │   ├── BottomNav.vue
│   │   └── LanguageSwitcher.vue  # Language toggle component
│   └── tasks/
│       ├── TaskCard.vue
│       ├── SubTaskList.vue
│       ├── TaskFormModal.vue
│       ├── TaskStats.vue
│       └── BulkActionBar.vue
└── views/
    ├── LandingView.vue
    ├── AuthView.vue
    └── DashboardView.vue
```

---

## 🔧 รายละเอียดแต่ละส่วน

### 4.1 TypeScript Types

**ไฟล์:** `types/auth.types.ts`, `types/task.types.ts`

**จุดประสงค์:** กำหนด types สำหรับข้อมูลที่ใช้ใน app

**auth.types.ts:**

```typescript
export interface User {
  id: number;
  name: string;
  email: string;
  createdAt: string;
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface RegisterDto {
  name: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  success: boolean;
  data: {
    user: User;
    accessToken: string;
  };
}
```

**task.types.ts:**

```typescript
export enum Priority {
  High = "High",
  Medium = "Medium",
  Low = "Low",
}

export interface Tag {
  id: number;
  name: string;
  createdAt: string;
  taskCount?: number;
}

export interface Subtask {
  id: number;
  taskId: number;
  title: string;
  isDone: boolean;
  position: number;
  createdAt: string;
}

export interface Task {
  id: number;
  userId: number;
  title: string;
  description?: string;
  priority: Priority;
  dueDate?: string;
  isDone: boolean;
  position: number;
  createdAt: string;
  updatedAt: string;
  tags: Tag[];
  subtasks: Subtask[];
}

export interface CreateTaskDto {
  title: string;
  description?: string;
  priority?: Priority;
  dueDate?: string;
  tagIds?: number[];
}

export interface UpdateTaskDto {
  title?: string;
  description?: string;
  priority?: Priority;
  dueDate?: string;
  isDone?: boolean;
  position?: number;
  tagIds?: number[];
}

export interface TaskQuery {
  search?: string;
  view?: "all" | "today" | "upcoming" | "overdue" | "done";
  priority?: Priority;
  tag?: string;
  sort?: "created_at" | "due_date" | "priority" | "title";
  order?: "asc" | "desc";
  page?: number;
  limit?: number;
}
```

---

### 4.2 API Service Layer

**ไฟล์:** `services/api.ts`

**จุดประสงค์:** สร้าง Axios instance พร้อม interceptors

**api.ts (Axios Instance):**

```typescript
import axios from "axios";
import { useAuthStore } from "@/stores/auth.store";
import router from "@/router";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true, // สำหรับ cookies
});

// Request interceptor: แนบ access token
api.interceptors.request.use((config) => {
  const authStore = useAuthStore();
  if (authStore.accessToken) {
    config.headers.Authorization = `Bearer ${authStore.accessToken}`;
  }
  return config;
});

// Response interceptor: จัดการ 401 (token หมดอายุ)
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // ถ้า 401 และยังไม่เคย retry
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // เรียก refresh token
        const { data } = await axios.post(
          `${import.meta.env.VITE_API_URL}/auth/refresh`,
          {},
          { withCredentials: true },
        );

        // อัปเดต token ใหม่
        const authStore = useAuthStore();
        authStore.setToken(data.data.accessToken);

        // Retry request เดิม
        originalRequest.headers.Authorization = `Bearer ${data.data.accessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        // Refresh ล้มเหลว → logout
        const authStore = useAuthStore();
        authStore.logout();
        router.push("/login");
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  },
);

export default api;
```

---

### 4.3 Pinia Stores

**ไฟล์:** `stores/auth.store.ts`, `stores/ui.store.ts`

**จุดประสงค์:** จัดการ global state + API calls

**auth.store.ts:**

```typescript
import { defineStore } from "pinia";
import api from "@/services/api";
import router from "@/router";
import type { User, LoginDto, RegisterDto } from "@/types/auth.types";

export const useAuthStore = defineStore("auth", {
  state: () => ({
    user: null as User | null,
    accessToken: "",
    loading: false,
    error: null as string | null,
  }),

  getters: {
    isAuthenticated: (state) => !!state.accessToken,
  },

  actions: {
    setToken(token: string) {
      this.accessToken = token;
    },

    setUser(userData: User) {
      this.user = userData;
    },

    async login(dto: LoginDto) {
      this.loading = true;
      this.error = null;
      try {
        const { data } = await api.post("/auth/login", dto);
        this.accessToken = data.data.accessToken;
        this.user = data.data.user;
        router.push("/dashboard");
      } catch (error: any) {
        this.error = error.response?.data?.error?.message || "Login failed";
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async register(dto: RegisterDto) {
      this.loading = true;
      this.error = null;
      try {
        const { data } = await api.post("/auth/register", dto);
        this.accessToken = data.data.accessToken;
        this.user = data.data.user;
        router.push("/dashboard");
      } catch (error: any) {
        this.error =
          error.response?.data?.error?.message || "Registration failed";
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async logout() {
      try {
        await api.post("/auth/logout");
      } catch (error) {
        console.error("Logout error:", error);
      } finally {
        this.user = null;
        this.accessToken = "";
        router.push("/login");
      }
    },
  },
});
```

**task.store.ts:**

```typescript
import { defineStore } from "pinia";
import api from "@/services/api";
import type {
  Task,
  CreateTaskDto,
  UpdateTaskDto,
  TaskQuery,
  Tag,
} from "@/types/task.types";

export const useTaskStore = defineStore("task", {
  state: () => ({
    tasks: [] as Task[],
    tags: [] as Tag[],
    selectedIds: [] as number[],
    loading: false,
    error: null as string | null,
    // Pagination
    currentPage: 1,
    totalPages: 1,
    total: 0,
  }),

  getters: {
    hasSelection: (state) => state.selectedIds.length > 0,
    selectedCount: (state) => state.selectedIds.length,
  },

  actions: {
    // ==================== TASKS ====================
    async fetchTasks(query: TaskQuery = {}) {
      this.loading = true;
      this.error = null;
      try {
        const { data } = await api.get("/tasks", { params: query });
        this.tasks = data.data;
        this.currentPage = data.meta.page;
        this.totalPages = data.meta.totalPages;
        this.total = data.meta.total;
      } catch (error: any) {
        this.error =
          error.response?.data?.error?.message || "Failed to fetch tasks";
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async createTask(dto: CreateTaskDto) {
      this.loading = true;
      this.error = null;
      try {
        const { data } = await api.post("/tasks", dto);
        this.tasks.unshift(data.data.task);
      } catch (error: any) {
        this.error =
          error.response?.data?.error?.message || "Failed to create task";
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async updateTask(id: number, dto: UpdateTaskDto) {
      this.loading = true;
      this.error = null;
      try {
        const { data } = await api.patch(`/tasks/${id}`, dto);
        const index = this.tasks.findIndex((t) => t.id === id);
        if (index !== -1) {
          this.tasks[index] = data.data.task;
        }
      } catch (error: any) {
        this.error =
          error.response?.data?.error?.message || "Failed to update task";
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async deleteTask(id: number) {
      this.loading = true;
      this.error = null;
      try {
        await api.delete(`/tasks/${id}`);
        this.tasks = this.tasks.filter((t) => t.id !== id);
      } catch (error: any) {
        this.error =
          error.response?.data?.error?.message || "Failed to delete task";
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async toggleDone(id: number) {
      try {
        const { data } = await api.patch(`/tasks/${id}/done`);
        const index = this.tasks.findIndex((t) => t.id === id);
        if (index !== -1) {
          this.tasks[index].isDone = data.data.task.isDone;
        }
      } catch (error: any) {
        this.error =
          error.response?.data?.error?.message || "Failed to toggle task";
        throw error;
      }
    },

    async bulkDone() {
      if (this.selectedIds.length === 0) return;
      this.loading = true;
      try {
        await api.patch("/tasks/bulk/done", { taskIds: this.selectedIds });
        this.selectedIds.forEach((id) => {
          const task = this.tasks.find((t) => t.id === id);
          if (task) task.isDone = true;
        });
        this.selectedIds = [];
      } catch (error: any) {
        this.error =
          error.response?.data?.error?.message ||
          "Failed to mark tasks as done";
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async bulkDelete() {
      if (this.selectedIds.length === 0) return;
      this.loading = true;
      try {
        await api.delete("/tasks/bulk", {
          data: { taskIds: this.selectedIds },
        });
        this.tasks = this.tasks.filter((t) => !this.selectedIds.includes(t.id));
        this.selectedIds = [];
      } catch (error: any) {
        this.error =
          error.response?.data?.error?.message || "Failed to delete tasks";
        throw error;
      } finally {
        this.loading = false;
      }
    },

    // ==================== SUBTASKS ====================
    async addSubtask(taskId: number, title: string) {
      try {
        const { data } = await api.post(`/tasks/${taskId}/subtasks`, { title });
        const task = this.tasks.find((t) => t.id === taskId);
        if (task) {
          task.subtasks.push(data.data.subtask);
        }
      } catch (error: any) {
        this.error =
          error.response?.data?.error?.message || "Failed to add subtask";
        throw error;
      }
    },

    async toggleSubtask(taskId: number, subtaskId: number) {
      try {
        const { data } = await api.patch(
          `/tasks/${taskId}/subtasks/${subtaskId}/done`,
        );
        const task = this.tasks.find((t) => t.id === taskId);
        if (task) {
          const subtask = task.subtasks.find((s) => s.id === subtaskId);
          if (subtask) {
            subtask.isDone = data.data.subtask.isDone;
          }
        }
      } catch (error: any) {
        this.error =
          error.response?.data?.error?.message || "Failed to toggle subtask";
        throw error;
      }
    },

    async deleteSubtask(taskId: number, subtaskId: number) {
      try {
        await api.delete(`/tasks/${taskId}/subtasks/${subtaskId}`);
        const task = this.tasks.find((t) => t.id === taskId);
        if (task) {
          task.subtasks = task.subtasks.filter((s) => s.id !== subtaskId);
        }
      } catch (error: any) {
        this.error =
          error.response?.data?.error?.message || "Failed to delete subtask";
        throw error;
      }
    },

    // ==================== TAGS ====================
    async fetchTags() {
      try {
        const { data } = await api.get("/tags");
        this.tags = data.data.tags;
      } catch (error: any) {
        this.error =
          error.response?.data?.error?.message || "Failed to fetch tags";
        throw error;
      }
    },

    async createTag(name: string) {
      try {
        const { data } = await api.post("/tags", { name });
        this.tags.push(data.data.tag);
      } catch (error: any) {
        this.error =
          error.response?.data?.error?.message || "Failed to create tag";
        throw error;
      }
    },

    async deleteTag(id: number) {
      try {
        await api.delete(`/tags/${id}`);
        this.tags = this.tags.filter((t) => t.id !== id);
      } catch (error: any) {
        this.error =
          error.response?.data?.error?.message || "Failed to delete tag";
        throw error;
      }
    },

    // ==================== SELECTION ====================
    toggleSelect(id: number) {
      const index = this.selectedIds.indexOf(id);
      if (index > -1) {
        this.selectedIds.splice(index, 1);
      } else {
        this.selectedIds.push(id);
      }
    },

    selectAll() {
      this.selectedIds = this.tasks.map((t) => t.id);
    },

    clearSelection() {
      this.selectedIds = [];
    },
  },
});
```

**ui.store.ts:**

```typescript
import { defineStore } from "pinia";

export const useUiStore = defineStore("ui", {
  state: () => ({
    sidebarOpen: true,
    theme: "light" as "light" | "dark",
    locale: "th" as "th" | "en",
  }),

  getters: {
    isDark: (state) => state.theme === "dark",
    isEnglish: (state) => state.locale === "en",
  },

  actions: {
    toggleSidebar() {
      this.sidebarOpen = !this.sidebarOpen;
    },

    toggleTheme() {
      this.theme = this.theme === "light" ? "dark" : "light";
    },

    setTheme(newTheme: "light" | "dark") {
      this.theme = newTheme;
    },

    setLocale(newLocale: "th" | "en") {
      this.locale = newLocale;
    },

    toggleLocale() {
      this.locale = this.locale === "th" ? "en" : "th";
    },
  },
});
```

---

### 4.3.1 i18n Setup (เพิ่มเติม)

**ไฟล์:** `i18n/index.ts`, `i18n/locales/th.json`, `i18n/locales/en.json`

**จุดประสงค์:** ตั้งค่า internationalization (i18n) สำหรับเปลี่ยนภาษา

**ติดตั้ง:**

```bash
npm install vue-i18n
```

**i18n/index.ts:**

```typescript
import { createI18n } from "vue-i18n";
import th from "./locales/th.json";
import en from "./locales/en.json";

const i18n = createI18n({
  legacy: false, // ใช้ Composition API
  locale: "th", // ภาษาเริ่มต้น
  fallbackLocale: "en",
  messages: {
    th,
    en,
  },
});

export default i18n;
```

**i18n/locales/th.json:**

```json
{
  "common": {
    "appName": "Prio",
    "loading": "กำลังโหลด...",
    "save": "บันทึก",
    "cancel": "ยกเลิก",
    "delete": "ลบ",
    "edit": "แก้ไข",
    "search": "ค้นหา"
  },
  "auth": {
    "login": "เข้าสู่ระบบ",
    "register": "สมัครสมาชิก",
    "logout": "ออกจากระบบ",
    "email": "อีเมล",
    "password": "รหัสผ่าน",
    "name": "ชื่อ"
  },
  "task": {
    "title": "งาน",
    "addTask": "เพิ่มงาน",
    "editTask": "แก้ไขงาน",
    "deleteTask": "ลบงาน",
    "priority": "ความสำคัญ",
    "dueDate": "กำหนดส่ง",
    "description": "รายละเอียด"
  }
}
```

**i18n/locales/en.json:**

```json
{
  "common": {
    "appName": "Prio",
    "loading": "Loading...",
    "save": "Save",
    "cancel": "Cancel",
    "delete": "Delete",
    "edit": "Edit",
    "search": "Search"
  },
  "auth": {
    "login": "Login",
    "register": "Register",
    "logout": "Logout",
    "email": "Email",
    "password": "Password",
    "name": "Name"
  },
  "task": {
    "title": "Tasks",
    "addTask": "Add Task",
    "editTask": "Edit Task",
    "deleteTask": "Delete Task",
    "priority": "Priority",
    "dueDate": "Due Date",
    "description": "Description"
  }
}
```

**ลงทะเบียนใน main.ts:**

```typescript
import { createApp } from "vue";
import { createPinia } from "pinia";
import App from "./App.vue";
import router from "./router";
import i18n from "./i18n";

const app = createApp(App);

app.use(createPinia());
app.use(router);
app.use(i18n);

app.mount("#app");
```

**วิธีใช้ใน component:**

```vue
<script setup lang="ts">
import { useI18n } from "vue-i18n";

const { t, locale } = useI18n();

function changeLanguage(lang: "th" | "en") {
  locale.value = lang;
}
</script>

<template>
  <div>
    <h1>{{ t("common.appName") }}</h1>
    <button @click="changeLanguage('th')">ไทย</button>
    <button @click="changeLanguage('en')">English</button>
  </div>
</template>
```

**LanguageSwitcher.vue component:**

```vue
<script setup lang="ts">
import { useI18n } from "vue-i18n";
import { useUiStore } from "@/stores/ui.store";
import { watch } from "vue";

const { locale } = useI18n();
const uiStore = useUiStore();

// Sync i18n locale กับ store
watch(
  () => uiStore.locale,
  (newLocale) => {
    locale.value = newLocale;
  },
  { immediate: true },
);

function toggleLanguage() {
  uiStore.toggleLocale();
}
</script>

<template>
  <button @click="toggleLanguage" class="language-switcher">
    {{ uiStore.locale === "th" ? "🇹🇭 TH" : "🇬🇧 EN" }}
  </button>
</template>
```

---

### 4.4 Composables

**ไฟล์:** `composables/useToast.ts`, `composables/useTheme.ts`

**จุดประสงค์:** แยก reusable UI logic ออกจาก components (API calls อยู่ใน stores แล้ว)

**useToast.ts:**

```typescript
import { ref } from "vue";

interface Toast {
  id: number;
  message: string;
  type: "success" | "error" | "info" | "warning";
}

const toasts = ref<Toast[]>([]);
let nextId = 0;

export function useToast() {
  function toast(
    message: string,
    type: Toast["type"] = "info",
    duration = 3000,
  ) {
    const id = nextId++;
    toasts.value.push({ id, message, type });

    setTimeout(() => {
      toasts.value = toasts.value.filter((t) => t.id !== id);
    }, duration);
  }

  function success(message: string) {
    toast(message, "success");
  }

  function error(message: string) {
    toast(message, "error");
  }

  function info(message: string) {
    toast(message, "info");
  }

  function warning(message: string) {
    toast(message, "warning");
  }

  return {
    toasts,
    toast,
    success,
    error,
    info,
    warning,
  };
}
```

**useTheme.ts:**

```typescript
import { useColorMode } from "@vueuse/core";
import { useUiStore } from "@/stores/ui.store";
import { watch, computed } from "vue";

export function useTheme() {
  const uiStore = useUiStore();
  const colorMode = useColorMode();

  // Sync store กับ useColorMode
  watch(
    () => colorMode.value,
    (newMode) => {
      uiStore.setTheme(newMode as "light" | "dark");
    },
    { immediate: true },
  );

  function toggle() {
    colorMode.value = colorMode.value === "light" ? "dark" : "light";
  }

  return {
    isDark: computed(() => colorMode.value === "dark"),
    toggle,
  };
}
```

return {
selectedIds,
toggleSelect,
selectAll,
clearSelection,
bulkDone,
bulkDelete,
};
}

````

---

### 4.5 Vue Router

**ไฟล์:** `router/index.ts`

**จุดประสงค์:** กำหนด routes และ navigation guards

```typescript
import { createRouter, createWebHistory } from "vue-router";
import { useAuthStore } from "@/stores/auth.store";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/",
      name: "landing",
      component: () => import("@/views/LandingView.vue"),
    },
    {
      path: "/login",
      name: "login",
      component: () => import("@/views/AuthView.vue"),
    },
    {
      path: "/register",
      name: "register",
      component: () => import("@/views/AuthView.vue"),
    },
    {
      path: "/dashboard",
      name: "dashboard",
      component: () => import("@/views/DashboardView.vue"),
      meta: { requiresAuth: true },
    },
  ],
});

// Navigation guard
router.beforeEach((to, from, next) => {
  const authStore = useAuthStore();

  // ถ้า route ต้องการ auth
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    next("/login");
  }
  // ถ้า authed แล้วเข้า login/register → redirect dashboard
  else if (
    (to.name === "login" || to.name === "register") &&
    authStore.isAuthenticated
  ) {
    next("/dashboard");
  } else {
    next();
  }
});

export default router;
````

---

### 4.6 Base UI Components

**ไฟล์:** `components/base/BaseButton.vue`, `BaseInput.vue`, `BaseModal.vue`, `BaseToast.vue`

**จุดประสงค์:** สร้าง reusable UI components

**BaseButton.vue:**

```vue
<script setup lang="ts">
interface Props {
  variant?: "primary" | "secondary" | "danger" | "ghost";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
  disabled?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  variant: "primary",
  size: "md",
  loading: false,
  disabled: false,
});
</script>

<template>
  <button
    :class="[
      'btn',
      `btn-${variant}`,
      `btn-${size}`,
      { 'btn-loading': loading },
    ]"
    :disabled="disabled || loading"
  >
    <span v-if="loading" class="spinner"></span>
    <slot v-else />
  </button>
</template>

<style scoped>
/* TailwindCSS classes */
</style>
```

**BaseInput.vue:**

```vue
<script setup lang="ts">
interface Props {
  modelValue: string;
  label?: string;
  type?: string;
  error?: string;
  placeholder?: string;
}

const props = withDefaults(defineProps<Props>(), {
  type: "text",
});

const emit = defineEmits<{
  "update:modelValue": [value: string];
}>();
</script>

<template>
  <div class="input-group">
    <label v-if="label" class="label">{{ label }}</label>
    <input
      :type="type"
      :value="modelValue"
      :placeholder="placeholder"
      :class="['input', { 'input-error': error }]"
      @input="
        emit('update:modelValue', ($event.target as HTMLInputElement).value)
      "
    />
    <span v-if="error" class="error-message">{{ error }}</span>
  </div>
</template>
```

**BaseModal.vue:**

```vue
<script setup lang="ts">
interface Props {
  open: boolean;
  title?: string;
}

const props = defineProps<Props>();
const emit = defineEmits<{
  close: [];
}>();
</script>

<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="open" class="modal-overlay" @click="emit('close')">
        <div class="modal-content" @click.stop>
          <div class="modal-header">
            <h3>{{ title }}</h3>
            <button @click="emit('close')" class="close-btn">×</button>
          </div>
          <div class="modal-body">
            <slot />
          </div>
          <div class="modal-footer">
            <slot name="footer" />
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>
```

**BaseToast.vue:**

```vue
<script setup lang="ts">
import { useToast } from "@/composables/useToast";

const { toasts } = useToast();
</script>

<template>
  <Teleport to="body">
    <div class="toast-container">
      <TransitionGroup name="toast">
        <div
          v-for="toast in toasts"
          :key="toast.id"
          :class="['toast', `toast-${toast.type}`]"
        >
          {{ toast.message }}
        </div>
      </TransitionGroup>
    </div>
  </Teleport>
</template>
```

---

### 4.7 Layout Components

**ไฟล์:** `components/layout/AppSidebar.vue`, `MobileTopBar.vue`, `BottomNav.vue`

**จุดประสงค์:** สร้าง layout หลักของ app

**AppSidebar.vue (Desktop):**

- Navigation items (All, Today, Upcoming, Overdue, Done)
- Tags list
- User info + logout button
- Theme toggle

**MobileTopBar.vue:**

- Hamburger menu button
- Logo
- Add task button

**BottomNav.vue (Mobile):**

- 5 tab navigation
- Icons: Home, Today, Add, Tags, Profile

---

### 4.8 Task Components

**ไฟล์:** `components/tasks/TaskCard.vue`, `SubTaskList.vue`, `TaskFormModal.vue`, `TaskStats.vue`, `BulkActionBar.vue`

**TaskCard.vue:**

- Checkbox (toggle done)
- Task title + description
- Priority badge
- Due date badge
- Tags
- Action buttons (edit, delete)
- Subtasks progress

**SubTaskList.vue:**

- Expandable section
- Subtask checkboxes
- Add subtask input
- Progress bar

**TaskFormModal.vue:**

- Form fields: title, description, priority, dueDate, tags
- Validation (vee-validate + zod)
- Create/Edit mode

**TaskStats.vue:**

- Stats: ค้างอยู่, เสร็จ, เกินกำหนด
- Progress bar

**BulkActionBar.vue:**

- แสดงเมื่อ selectedIds > 0
- Buttons: Mark Done, Delete
- Selection count

---

### 4.9 Views

**LandingView.vue:**

- Hero section
- Features showcase
- CTA buttons (Login, Register)

**AuthView.vue:**

- Login/Register form (toggle)
- Form validation
- Error handling
- Redirect after success

**DashboardView.vue:**

- Layout: Sidebar + Main content
- TaskStats component
- Search bar
- Filter buttons
- Task list (TaskCard)
- BulkActionBar
- TaskFormModal

---

### 4.10 Testing Auth Flow

**เป้าหมาย:** ทดสอบว่า Auth flow ทำงานถูกต้อง

**Test Cases:**

1. ✅ Register → สำเร็จ → redirect `/dashboard`
2. ✅ Login ผิด → เห็น error message
3. ✅ Login ถูก → redirect `/dashboard`
4. ✅ เข้า `/dashboard` โดยไม่ login → redirect `/login`
5. ✅ Logout → redirect `/login` + token ล้าง
6. ✅ Refresh token → ยัง authed หลัง access token หมดอายุ
7. ✅ Login แล้วเข้า `/login` → redirect `/dashboard`

---

## 🎨 Design Guidelines

### Colors

- Primary: Blue (#3B82F6)
- Success: Green (#10B981)
- Warning: Yellow (#F59E0B)
- Danger: Red (#EF4444)
- Gray scale: 50-900

### Typography

- Font: Plus Jakarta Sans (body), IBM Plex Mono (code)
- Sizes: xs, sm, base, lg, xl, 2xl, 3xl

### Spacing

- ใช้ Tailwind spacing scale (4px increments)
- Consistent padding/margin

### Responsive Breakpoints

- Mobile: < 768px
- Tablet: 768px - 1024px
- Desktop: > 1024px

---

## 🔍 Tips & Best Practices

### 1. Type Safety

- ใช้ TypeScript อย่างเต็มที่
- กำหนด types ชัดเจนสำหรับ props, emits, API responses
- ใช้ `as const` สำหรับ literal types

### 2. Composition API

- ใช้ `<script setup>` syntax
- แยก logic ออกเป็น composables
- ใช้ `ref`, `computed`, `watch` อย่างถูกต้อง

### 3. Performance

- ใช้ `v-memo` สำหรับ list ที่ไม่เปลี่ยนบ่อย
- Lazy load routes ด้วย `() => import()`
- ใช้ `@tanstack/vue-query` สำหรับ caching

### 4. Error Handling

- ใช้ try-catch ใน async functions
- แสดง error message ที่เข้าใจง่าย
- Log errors สำหรับ debugging

### 5. Accessibility

- ใช้ semantic HTML
- เพิ่ม aria-labels
- รองรับ keyboard navigation
- ทดสอบด้วย screen reader

### 6. Testing

- ทดสอบทุก feature ก่อน commit
- ทดสอบบน mobile และ desktop
- ทดสอบ dark/light mode

---

## 📝 Checklist

เมื่อทำเสร็จแต่ละส่วน ให้ตรวจสอบ:

- [ ] Types ครบและถูกต้อง
- [ ] API calls ทำงานกับ backend จริง
- [ ] Error handling ครบทุก case
- [ ] Loading states แสดงถูกต้อง
- [ ] Responsive ทำงานบน mobile/desktop
- [ ] Dark mode ทำงานถูกต้อง
- [ ] Accessibility ผ่านมาตรฐาน
- [ ] No console errors
- [ ] Code clean และ readable

---

## 🚀 Next Steps

หลังจาก Phase 4 เสร็จ:

- **Phase 5**: Connect Features — เชื่อม UI กับ API ทุก feature
- **Phase 6**: Deploy — Deploy ขึ้น production

---

**Good luck! 🎉**

_หากมีคำถามหรือต้องการ review code ส่วนไหน สามารถถามได้เลยครับ_
