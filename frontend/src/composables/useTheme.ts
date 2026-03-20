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
