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
