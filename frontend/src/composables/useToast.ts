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
