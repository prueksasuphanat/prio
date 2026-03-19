import { Router } from "express";
import { validate } from "../../middleware/validate";
import { auth } from "../../middleware/auth";
import { authLimiter } from "../../middleware/rateLimit";
import { registerSchema, loginSchema } from "../../schemas/auth.schema";
import {
  registerController,
  loginController,
  refreshController,
  logoutController,
} from "./auth.controller";

const router = Router();

// POST /api/auth/register
router.post(
  "/register",
  authLimiter,
  validate(registerSchema),
  registerController,
);

// POST /api/auth/login
router.post("/login", authLimiter, validate(loginSchema), loginController);

// POST /api/auth/refresh
router.post("/refresh", refreshController);

// POST /api/auth/logout
router.post("/logout", auth, logoutController);

export default router;
