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

<style scoped>
.language-switcher {
  padding: 0.5rem 1rem;
  border-radius: 0.5rem;
  background-color: transparent;
  border: 1px solid #e5e7eb;
  cursor: pointer;
  transition: all 0.2s;
}

.language-switcher:hover {
  background-color: #f3f4f6;
}

.dark .language-switcher {
  border-color: #374151;
}

.dark .language-switcher:hover {
  background-color: #1f2937;
}
</style>
