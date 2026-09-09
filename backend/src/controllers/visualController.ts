import { Request, Response, NextFunction } from "express";
import * as visualService from "../services/visualDesignService";

export async function getQueue(req: Request, res: Response, next: NextFunction) {
  try {
    const queue = await visualService.getVisualQueue();
    res.json({ success: true, data: queue });
  } catch (err) {
    next(err);
  }
}

export async function getContentVisual(req: Request, res: Response, next: NextFunction) {
  try {
    const { getContent } = await import("../services/contentService");
    const content = await getContent(req.params.id);
    res.json({ success: true, data: content.visualDesign });
  } catch (err) {
    next(err);
  }
}

export async function startVisual(req: Request, res: Response, next: NextFunction) {
  try {
    await visualService.startVisualDesign(req.params.id, req.user!.id);
    res.json({ success: true, message: "Visual design started." });
  } catch (err) {
    next(err);
  }
}

export async function cancelVisual(req: Request, res: Response, next: NextFunction) {
  try {
    await visualService.cancelVisualDesign(req.params.id, req.user!.id);
    res.json({ success: true, message: "Visual design cancelled." });
  } catch (err) {
    next(err);
  }
}

export async function completeVisual(req: Request, res: Response, next: NextFunction) {
  try {
    await visualService.completeVisualDesign(req.params.id, req.user!.id, req.body.remark);
    res.json({ success: true, message: "Visual design completed." });
  } catch (err) {
    next(err);
  }
}

export async function reopenVisual(req: Request, res: Response, next: NextFunction) {
  try {
    await visualService.reopenVisualDesign(req.params.id, req.user!.id, req.body.remark);
    res.json({ success: true, message: "Visual design reopened." });
  } catch (err) {
    next(err);
  }
}

export async function publishContent(req: Request, res: Response, next: NextFunction) {
  try {
    await visualService.publishContent(req.params.id, req.user!.id);
    res.json({ success: true, message: "Content published." });
  } catch (err) {
    next(err);
  }
}

export async function updateVisual(req: Request, res: Response, next: NextFunction) {
  try {
    const design = await visualService.updateVisualDesign(req.params.id, req.user!.id, req.body.remark);
    res.json({ success: true, data: design });
  } catch (err) {
    next(err);
  }
}
