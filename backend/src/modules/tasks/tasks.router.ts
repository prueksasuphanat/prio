import { Router } from "express";
import { auth } from "../../middleware/auth";
import { validate } from "../../middleware/validate";
import {
  createTaskSchema,
  updateTaskSchema,
  bulkSchema,
  querySchema,
  positionSchema,
  subtaskSchema,
} from "../../schemas/task.schema";
import * as controller from "./tasks.controller";

const router = Router();

// ทุก route ต้องผ่าน auth
router.use(auth);

// Bulk operations (ต้องมาก่อน /:id)
router.patch("/bulk/done", validate(bulkSchema), controller.bulkDoneController);
router.delete("/bulk", validate(bulkSchema), controller.bulkDeleteController);

// Task CRUD
router.get("/", validate(querySchema, "query"), controller.getTasksController);
router.post("/", validate(createTaskSchema), controller.createTaskController);
router.patch(
  "/:id",
  validate(updateTaskSchema),
  controller.updateTaskController,
);
router.delete("/:id", controller.deleteTaskController);

// Task actions
router.patch("/:id/done", controller.toggleDoneController);
router.patch(
  "/:id/position",
  validate(positionSchema),
  controller.updatePositionController,
);

// Subtasks
router.post(
  "/:id/subtasks",
  validate(subtaskSchema),
  controller.addSubtaskController,
);
router.patch(
  "/:taskId/subtasks/:subtaskId/done",
  controller.toggleSubtaskController,
);
router.delete(
  "/:taskId/subtasks/:subtaskId",
  controller.deleteSubtaskController,
);

export default router;
