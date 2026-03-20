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
