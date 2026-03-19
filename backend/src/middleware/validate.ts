import { Request, Response, NextFunction } from "express";
import { ZodSchema, ZodError } from "zod";

/**
 * Middleware สำหรับ validate request body หรือ query ด้วย Zod schema
 */
export function validate(schema: ZodSchema, source: "body" | "query" = "body") {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = source === "query" ? req.query : req.body;
      const parsed = schema.parse(data);

      // อัปเดต req ด้วยข้อมูลที่ validated แล้ว
      if (source === "query") {
        req.query = parsed as any;
      } else {
        req.body = parsed;
      }

      next();
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "Invalid input",
            details: error.errors.map((err) => ({
              field: err.path.join("."),
              message: err.message,
            })),
          },
        });
      }
      next(error);
    }
  };
}
