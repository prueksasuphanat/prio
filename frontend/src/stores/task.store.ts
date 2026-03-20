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
