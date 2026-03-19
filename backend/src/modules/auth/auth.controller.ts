import { Request, Response, NextFunction } from "express";
import * as authService from "./auth.service";
import { RegisterInput, LoginInput } from "../../schemas/auth.schema";

/**
 * Register controller
 */
export async function registerController(
  req: Request<{}, {}, RegisterInput>,
  res: Response,
  next: NextFunction,
) {
  try {
    const { name, email, password } = req.body;

    const user = await authService.register(name, email, password);

    res.status(201).json({
      success: true,
      data: { user },
    });
  } catch (error: any) {
    if (error.message === "EMAIL_EXISTS") {
      return res.status(409).json({
        success: false,
        error: {
          code: "CONFLICT",
          message: "Email already exists",
        },
      });
    }
    next(error);
  }
}

/**
 * Login controller
 */
export async function loginController(
  req: Request<{}, {}, LoginInput>,
  res: Response,
  next: NextFunction,
) {
  try {
    const { email, password } = req.body;

    const result = await authService.login(email, password);

    // ตั้ง refresh token ใน httpOnly cookie
    res.cookie("refresh_token", result.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 วัน
    });

    res.json({
      success: true,
      data: {
        user: result.user,
        accessToken: result.accessToken,
      },
    });
  } catch (error: any) {
    if (error.message === "INVALID_CREDENTIALS") {
      return res.status(401).json({
        success: false,
        error: {
          code: "UNAUTHORIZED",
          message: "Invalid email or password",
        },
      });
    }
    next(error);
  }
}

/**
 * Refresh token controller
 */
export async function refreshController(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const refreshToken = req.cookies.refresh_token;

    if (!refreshToken) {
      return res.status(401).json({
        success: false,
        error: {
          code: "UNAUTHORIZED",
          message: "No refresh token provided",
        },
      });
    }

    const result = await authService.refresh(refreshToken);

    res.json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    if (
      error.message === "INVALID_TOKEN" ||
      error.message === "TOKEN_EXPIRED"
    ) {
      // Clear cookie
      res.clearCookie("refresh_token");

      return res.status(401).json({
        success: false,
        error: {
          code: "UNAUTHORIZED",
          message: "Invalid or expired refresh token",
        },
      });
    }
    next(error);
  }
}

/**
 * Logout controller
 */
export async function logoutController(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const refreshToken = req.cookies.refresh_token;

    if (refreshToken) {
      await authService.logout(refreshToken);
    }

    // Clear cookie
    res.clearCookie("refresh_token");

    res.json({
      success: true,
      data: { message: "Logged out successfully" },
    });
  } catch (error) {
    next(error);
  }
}
