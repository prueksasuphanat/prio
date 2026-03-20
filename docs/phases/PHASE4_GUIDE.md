# 📘 Phase 4 Guide — Frontend Structure

**เป้าหมาย:** สร้างโครงสร้าง Vue app พร้อม Auth flow ที่ทำงานกับ API จริง

---

## 📋 Overview

Phase 4 จะสร้างโครงสร้างพื้นฐานของ frontend ทั้งหมด โดยแบ่งเป็น 10 ส่วนหลัก:

1. **TypeScript Types** — กำหนด types สำหรับ Task, User, API responses
2. **API Service Layer** — Axios instance + interceptors
3. **Pinia Stores** — State management (auth, ui)
4. **Composables** — Reusable logic (useAuth, useTasks, useToast, useTheme)
5. **Vue Router** — Routes + navigation guards
6. **Base UI Components** — Button, Input, Modal, Toast
7. **Layout Components** — Sidebar, TopBar, BottomNav
8. **Task Components** — TaskCard, SubTaskList, TaskFormModal, etc.
9. **Views** — Landing, Auth, Dashboard
10. **Testing** — ทดสอบ Auth flow

---

## 🎯 แนวทางการทำงาน

### หลักการสำคัญ

- **API-First**: ทุก component ต้องเชื่อมกับ API จริง ไม่ใช้ mock data
- **Type Safety**: ใช้ TypeScript อย่างเต็มที่ กำหนด types ชัดเจน
- **Composition API**: ใช้ `<script setup>` และ Composition API
- **Reusability**: แยก logic ออกเป็น composables
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
│   ├── api.ts              # Axios instance + interceptors
│   ├── auth.service.ts     # login, register, logout, refresh
│   └── task.service.ts     # CRUD tasks, subtasks, tags
├── stores/
│   ├── auth.store.ts       # user, accessToken, isAuthenticated
│   └── ui.store.ts         # sidebarOpen, theme
├── composables/
│   ├── useAuth.ts          # Auth logic
│   ├── useToast.ts         # Toast notifications
│   ├── useTheme.ts         # Dark/Light mode
│   ├── useTasks.ts         # Task queries + mutations
│   └── useBulk.ts          # Bulk selection + actions
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
│   │   └── BottomNav.vue
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

**ไฟล์:** `services/api.ts`, `services/auth.service.ts`, `services/task.service.ts`

**จุดประสงค์:** จัดการการเรียก API ทั้งหมด

**api.ts (Axios Instance):**

```typescript
import axios from "axios";
import { useAuthStore } from "@/stores/auth.store";

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
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  },
);

export default api;
```

**auth.service.ts:**

```typescript
import api from "./api";
import type { LoginDto, RegisterDto, AuthResponse } from "@/types/auth.types";

export const authService = {
  async login(dto: LoginDto): Promise<AuthResponse> {
    const { data } = await api.post("/auth/login", dto);
    return data;
  },

  async register(dto: RegisterDto): Promise<AuthResponse> {
    const { data } = await api.post("/auth/register", dto);
    return data;
  },

  async logout(): Promise<void> {
    await api.post("/auth/logout");
  },

  async refresh(): Promise<AuthResponse> {
    const { data } = await api.post("/auth/refresh");
    return data;
  },
};
```

**task.service.ts:**

```typescript
import api from "./api";
import type {
  Task,
  CreateTaskDto,
  UpdateTaskDto,
  TaskQuery,
  Tag,
} from "@/types/task.types";

export const taskService = {
  // Tasks
  async getTasks(query: TaskQuery = {}) {
    const { data } = await api.get("/tasks", { params: query });
    return data;
  },

  async createTask(dto: CreateTaskDto) {
    const { data } = await api.post("/tasks", dto);
    return data;
  },

  async updateTask(id: number, dto: UpdateTaskDto) {
    const { data } = await api.patch(`/tasks/${id}`, dto);
    return data;
  },

  async deleteTask(id: number) {
    const { data } = await api.delete(`/tasks/${id}`);
    return data;
  },

  async toggleDone(id: number) {
    const { data } = await api.patch(`/tasks/${id}/done`);
    return data;
  },

  async bulkDone(taskIds: number[]) {
    const { data } = await api.patch("/tasks/bulk/done", { taskIds });
    return data;
  },

  async bulkDelete(taskIds: number[]) {
    const { data } = await api.delete("/tasks/bulk", { data: { taskIds } });
    return data;
  },

  // Subtasks
  async addSubtask(taskId: number, title: string) {
    const { data } = await api.post(`/tasks/${taskId}/subtasks`, { title });
    return data;
  },

  async toggleSubtask(taskId: number, subtaskId: number) {
    const { data } = await api.patch(
      `/tasks/${taskId}/subtasks/${subtaskId}/done`,
    );
    return data;
  },

  async deleteSubtask(taskId: number, subtaskId: number) {
    const { data } = await api.delete(`/tasks/${taskId}/subtasks/${subtaskId}`);
    return data;
  },

  // Tags
  async getTags() {
    const { data } = await api.get("/tags");
    return data;
  },

  async createTag(name: string) {
    const { data } = await api.post("/tags", { name });
    return data;
  },

  async deleteTag(id: number) {
    const { data } = await api.delete(`/tags/${id}`);
    return data;
  },
};
```

---

### 4.3 Pinia Stores

**ไฟล์:** `stores/auth.store.ts`, `stores/ui.store.ts`

**จุดประสงค์:** จัดการ global state

**auth.store.ts:**

```typescript
import { defineStore } from "pinia";
import type { User } from "@/types/auth.types";

export const useAuthStore = defineStore("auth", {
  state: () => ({
    user: null as User | null,
    accessToken: "",
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

    logout() {
      this.user = null;
      this.accessToken = "";
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
  }),

  getters: {
    isDark: (state) => state.theme === "dark",
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
  },
});
```

---

### 4.4 Composables

**ไฟล์:** `composables/useAuth.ts`, `composables/useTasks.ts`, `composables/useToast.ts`, `composables/useTheme.ts`, `composables/useBulk.ts`

**จุดประสงค์:** แยก reusable logic ออกจาก components

**useAuth.ts:**

```typescript
import { useAuthStore } from "@/stores/auth.store";
import { authService } from "@/services/auth.service";
import { useRouter } from "vue-router";
import type { LoginDto, RegisterDto } from "@/types/auth.types";

export function useAuth() {
  const authStore = useAuthStore();
  const router = useRouter();

  async function login(dto: LoginDto) {
    try {
      const response = await authService.login(dto);
      authStore.setToken(response.data.accessToken);
      authStore.setUser(response.data.user);
      router.push("/dashboard");
    } catch (error) {
      throw error;
    }
  }

  async function register(dto: RegisterDto) {
    try {
      const response = await authService.register(dto);
      authStore.setToken(response.data.accessToken);
      authStore.setUser(response.data.user);
      router.push("/dashboard");
    } catch (error) {
      throw error;
    }
  }

  async function logout() {
    try {
      await authService.logout();
      authStore.logout();
      router.push("/login");
    } catch (error) {
      // Logout ฝั่ง client ต่อไปเลย
      authStore.logout();
      router.push("/login");
    }
  }

  return {
    login,
    register,
    logout,
  };
}
```

**useTasks.ts (ใช้ @tanstack/vue-query):**

```typescript
import { useQuery, useMutation, useQueryClient } from "@tanstack/vue-query";
import { taskService } from "@/services/task.service";
import type {
  TaskQuery,
  CreateTaskDto,
  UpdateTaskDto,
} from "@/types/task.types";

export function useTasks(query: TaskQuery = {}) {
  const queryClient = useQueryClient();

  // Query: ดึง tasks
  const tasksQuery = useQuery({
    queryKey: ["tasks", query],
    queryFn: () => taskService.getTasks(query),
  });

  // Mutation: สร้าง task
  const createTask = useMutation({
    mutationFn: (dto: CreateTaskDto) => taskService.createTask(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
  });

  // Mutation: อัปเดต task
  const updateTask = useMutation({
    mutationFn: ({ id, dto }: { id: number; dto: UpdateTaskDto }) =>
      taskService.updateTask(id, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
  });

  // Mutation: ลบ task
  const deleteTask = useMutation({
    mutationFn: (id: number) => taskService.deleteTask(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
  });

  // Mutation: toggle done (with optimistic update)
  const toggleDone = useMutation({
    mutationFn: (id: number) => taskService.toggleDone(id),
    onMutate: async (id) => {
      // Cancel outgoing queries
      await queryClient.cancelQueries({ queryKey: ["tasks"] });

      // Snapshot previous value
      const previousTasks = queryClient.getQueryData(["tasks", query]);

      // Optimistically update
      queryClient.setQueryData(["tasks", query], (old: any) => {
        if (!old) return old;
        return {
          ...old,
          data: old.data.map((task: any) =>
            task.id === id ? { ...task, isDone: !task.isDone } : task,
          ),
        };
      });

      return { previousTasks };
    },
    onError: (err, id, context) => {
      // Rollback on error
      queryClient.setQueryData(["tasks", query], context?.previousTasks);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
  });

  return {
    tasks: tasksQuery.data,
    isLoading: tasksQuery.isLoading,
    error: tasksQuery.error,
    createTask,
    updateTask,
    deleteTask,
    toggleDone,
  };
}
```

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
import { watch } from "vue";

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

**useBulk.ts:**

```typescript
import { ref } from "vue";
import { useMutation, useQueryClient } from "@tanstack/vue-query";
import { taskService } from "@/services/task.service";

export function useBulk() {
  const queryClient = useQueryClient();
  const selectedIds = ref<number[]>([]);

  function toggleSelect(id: number) {
    const index = selectedIds.value.indexOf(id);
    if (index > -1) {
      selectedIds.value.splice(index, 1);
    } else {
      selectedIds.value.push(id);
    }
  }

  function selectAll(ids: number[]) {
    selectedIds.value = [...ids];
  }

  function clearSelection() {
    selectedIds.value = [];
  }

  const bulkDone = useMutation({
    mutationFn: () => taskService.bulkDone(selectedIds.value),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      clearSelection();
    },
  });

  const bulkDelete = useMutation({
    mutationFn: () => taskService.bulkDelete(selectedIds.value),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      clearSelection();
    },
  });

  return {
    selectedIds,
    toggleSelect,
    selectAll,
    clearSelection,
    bulkDone,
    bulkDelete,
  };
}
```

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
```

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
