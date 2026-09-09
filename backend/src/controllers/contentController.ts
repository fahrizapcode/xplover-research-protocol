import { Request, Response, NextFunction } from "express";
import * as contentService from "../services/contentService";
import * as reviewService from "../services/reviewService";
import { ContentStatus } from "@prisma/client";

// === Content CRUD ===
export async function createContent(req: Request, res: Response, next: NextFunction) {
  try {
    const content = await contentService.createContent(req.user!.id, req.body);
    res.status(201).json({ success: true, data: content });
  } catch (err) {
    next(err);
  }
}

export async function listContent(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await contentService.listContent({
      status: req.query.status as ContentStatus,
      createdBy: req.query.createdBy as string,
      researchId: req.query.researchId as string,
      page: req.query.page ? parseInt(req.query.page as string) : 1,
      limit: req.query.limit ? parseInt(req.query.limit as string) : 12,
    });
    res.json({ success: true, ...result });
  } catch (err) {
    next(err);
  }
}

export async function getContent(req: Request, res: Response, next: NextFunction) {
  try {
    const content = await contentService.getContent(req.params.id);
    res.json({ success: true, data: content });
  } catch (err) {
    next(err);
  }
}

export async function updateContent(req: Request, res: Response, next: NextFunction) {
  try {
    const content = await contentService.updateContent(
      req.params.id,
      req.user!.id,
      req.body
    );
    res.json({ success: true, data: content });
  } catch (err) {
    next(err);
  }
}

export async function submitContent(req: Request, res: Response, next: NextFunction) {
  try {
    const content = await contentService.submitContent(req.params.id, req.user!.id);
    res.json({ success: true, data: content });
  } catch (err) {
    next(err);
  }
}

export async function reviseContent(req: Request, res: Response, next: NextFunction) {
  try {
    const content = await contentService.reviseContent(
      req.params.id,
      req.user!.id,
      req.body
    );
    res.json({ success: true, data: content });
  } catch (err) {
    next(err);
  }
}

// === Slides ===
export async function addSlide(req: Request, res: Response, next: NextFunction) {
  try {
    const slide = await contentService.addSlide(req.params.id, req.user!.id, req.body);
    res.status(201).json({ success: true, data: slide });
  } catch (err) {
    next(err);
  }
}

export async function updateSlide(req: Request, res: Response, next: NextFunction) {
  try {
    const slide = await contentService.updateSlide(
      req.params.id,
      req.params.slideId,
      req.user!.id,
      req.body
    );
    res.json({ success: true, data: slide });
  } catch (err) {
    next(err);
  }
}

export async function deleteSlide(req: Request, res: Response, next: NextFunction) {
  try {
    await contentService.deleteSlide(req.params.id, req.params.slideId, req.user!.id);
    res.json({ success: true, message: "Slide deleted." });
  } catch (err) {
    next(err);
  }
}

export async function reorderSlides(req: Request, res: Response, next: NextFunction) {
  try {
    await contentService.reorderSlides(req.params.id, req.user!.id, req.body.orderedIds);
    res.json({ success: true, message: "Slides reordered." });
  } catch (err) {
    next(err);
  }
}

// === Reviews ===
export async function getPendingReviews(req: Request, res: Response, next: NextFunction) {
  try {
    const reviews = await reviewService.getPendingReviews(req.user!.id);
    res.json({ success: true, data: reviews });
  } catch (err) {
    next(err);
  }
}

export async function submitReview(req: Request, res: Response, next: NextFunction) {
  try {
    const review = await reviewService.submitReview(
      req.params.id,
      req.user!.id,
      req.body
    );
    res.status(201).json({ success: true, data: review });
  } catch (err) {
    next(err);
  }
}

export async function getContentReviews(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await reviewService.getReviewResult(req.params.id);
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
}

export async function getReviewResult(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await reviewService.getReviewResult(req.params.id);
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
}
