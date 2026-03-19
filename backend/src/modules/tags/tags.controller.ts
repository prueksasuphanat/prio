import { Request, Response, NextFunction } from "express";
import * as tagsService from "./tags.service";

/**
 * GET /api/tags
 */
export async function getTagsController(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const userId = req.userId!;

    const tags = await tagsService.getTags(userId);

    res.json({
      success: true,
      data: { tags },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/tags
 */
export async function createTagController(
  req: Request<{}, {}, { name: string }>,
  res: Response,
  next: NextFunction,
) {
  try {
    const userId = req.userId!;
    const { name } = req.body;

    const tag = await tagsService.createTag(userId, name);

    res.status(201).json({
      success: true,
      data: { tag },
    });
  } catch (error: any) {
    if (error.message === "TAG_EXISTS") {
      return res.status(409).json({
        success: false,
        error: {
          code: "TAG_EXISTS",
          message: "Tag with this name already exists",
        },
      });
    }
    next(error);
  }
}

/**
 * DELETE /api/tags/:id
 */
export async function deleteTagController(
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction,
) {
  try {
    const userId = req.userId!;
    const tagId = parseInt(req.params.id);

    await tagsService.deleteTag(userId, tagId);

    res.json({
      success: true,
      data: { message: "Tag deleted successfully" },
    });
  } catch (error: any) {
    if (error.message === "TAG_NOT_FOUND") {
      return res.status(404).json({
        success: false,
        error: {
          code: "NOT_FOUND",
          message: "Tag not found",
        },
      });
    }
    if (error.message === "FORBIDDEN") {
      return res.status(403).json({
        success: false,
        error: {
          code: "FORBIDDEN",
          message: "You do not have permission to delete this tag",
        },
      });
    }
    next(error);
  }
}
