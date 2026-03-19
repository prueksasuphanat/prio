import { Request, Response, NextFunction } from "express";
import { verifyAccessToken } from "../utils/jwt";

// Extend Express Request type
declare global {
  namespace Express {
    interface Request {
      userId?: number;
    }
  }
}

/**
 * Middleware สำหรับตรวจสอบ JWT token
 */
export function auth(req: Request, res: Response, next: NextFunction) {
  try {
    // ดึง token จาก Authorization header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        error: {
          code: "UNAUTHORIZED",
          message: "No token provided",
        },
      });
    }

    const token = authHeader.substring(7); // ตัด "Bearer " ออก

    // Verify token
    const payload = verifyAccessToken(token);

    // ใส่ userId ใน request
    req.userId = payload.userId;

    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      error: {
        code: "UNAUTHORIZED",
        message: "Invalid or expired token",
      },
    });
  }
}
