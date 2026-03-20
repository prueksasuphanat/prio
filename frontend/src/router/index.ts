import { createRouter, createWebHistory } from "vue-router";
import type { RouteRecordRaw } from "vue-router";
import { useAuthStore } from "@/stores/auth.store";

const routes: RouteRecordRaw[] = [
  {
    path: "/",
    name: "landing",
    component: () => import("@/views/HomeView.vue"),
  },
  {
    path: "/login",
    name: "login",
    component: () => import("@/views/HomeView.vue"),
  },
  {
    path: "/register",
    name: "register",
    component: () => import("@/views/HomeView.vue"),
  },
  {
    path: "/dashboard",
    name: "dashboard",
    component: () => import("@/views/HomeView.vue"),
    meta: { requiresAuth: true },
  },
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
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
