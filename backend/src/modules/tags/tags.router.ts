import { Router } from "express";
import { auth } from "../../middleware/auth";
import { validate } from "../../middleware/validate";
import { z } from "zod";
import * as controller from "./tags.controller";

const router = Router();

// ทุก route ต้องผ่าน auth
router.use(auth);

// Tag schema
const createTagSchema = z.object({
  name: z.string().min(1, "Tag name is required"),
});

// Routes
router.get("/", controller.getTagsController);
router.post("/", validate(createTagSchema), controller.createTagController);
router.delete("/:id", controller.deleteTagController);

export default router;
