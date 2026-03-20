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
