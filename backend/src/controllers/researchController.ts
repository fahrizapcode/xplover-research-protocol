import { Request, Response, NextFunction } from "express";
import * as researchService from "../services/researchService";
import * as ratingService from "../services/ratingService";
import { TechnologyCategory } from "@prisma/client";

export async function createResearch(req: Request, res: Response, next: NextFunction) {
  try {
    const research = await researchService.createResearch(req.user!.id, req.body);
    res.status(201).json({ success: true, data: research });
  } catch (err) {
    next(err);
  }
}

export async function listResearch(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await researchService.listResearch({
      search: req.query.search as string,
      technologyCategory: req.query.technologyCategory as TechnologyCategory,
      publicationYear: req.query.publicationYear ? parseInt(req.query.publicationYear as string) : undefined,
      sortBy: req.query.sortBy as any,
      page: req.query.page ? parseInt(req.query.page as string) : 1,
      limit: req.query.limit ? parseInt(req.query.limit as string) : 12,
    });
    res.json({ success: true, ...result });
  } catch (err) {
    next(err);
  }
}

export async function getResearch(req: Request, res: Response, next: NextFunction) {
  try {
    const research = await researchService.getResearchById(req.params.id);
    res.json({ success: true, data: research });
  } catch (err) {
    next(err);
  }
}

export async function updateResearch(req: Request, res: Response, next: NextFunction) {
  try {
    const research = await researchService.updateResearch(
      req.params.id,
      req.user!.id,
      req.body
    );
    res.json({ success: true, data: research });
  } catch (err) {
    next(err);
  }
}

// === Ratings ===
export async function submitRating(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await ratingService.upsertRating(
      req.params.id,
      req.user!.id,
      req.body.score,
      req.body.comment
    );
    res.status(201).json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
}

export async function getRatings(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await ratingService.getResearchRatings(req.params.id);
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
}

export async function updateRating(req: Request, res: Response, next: NextFunction) {
  try {
    const rating = await ratingService.updateRating(
      req.params.id,
      req.params.ratingId,
      req.user!.id,
      req.body.score,
      req.body.comment
    );
    res.json({ success: true, data: rating });
  } catch (err) {
    next(err);
  }
}
