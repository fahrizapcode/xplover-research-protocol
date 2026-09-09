import { Router } from "express";
import { body } from "express-validator";
import * as contentController from "../controllers/contentController";
import { authenticate } from "../middleware/auth";
import { requireRole } from "../middleware/rbac";
import { validate } from "../middleware/validate";
import { RoleName } from "@prisma/client";

const router = Router();

// Review routes (pending reviews for peer reviewers)
router.get(
  "/reviews/pending",
  authenticate,
  requireRole(RoleName.PEER_REVIEWER, RoleName.ADMIN),
  contentController.getPendingReviews
);

// Content CRUD
router.get("/", contentController.listContent);
router.get("/:id", contentController.getContent);

router.post(
  "/",
  authenticate,
  requireRole(RoleName.CONTENT_CREATOR, RoleName.ADMIN),
  [
    body("title").trim().notEmpty().withMessage("Title is required"),
    body("hook").trim().notEmpty().withMessage("Hook is required"),
    body("researchId").trim().notEmpty().withMessage("Research ID is required"),
    body("slides").optional().isArray(),
  ],
  validate,
  contentController.createContent
);

router.put(
  "/:id",
  authenticate,
  requireRole(RoleName.CONTENT_CREATOR, RoleName.ADMIN),
  [
    body("title").optional().trim().notEmpty(),
    body("hook").optional().trim().notEmpty(),
    body("slides").optional().isArray(),
  ],
  validate,
  contentController.updateContent
);

router.post(
  "/:id/submit",
  authenticate,
  requireRole(RoleName.CONTENT_CREATOR, RoleName.ADMIN),
  contentController.submitContent
);

router.post(
  "/:id/revise",
  authenticate,
  requireRole(RoleName.CONTENT_CREATOR, RoleName.ADMIN),
  [
    body("title").optional().trim().notEmpty(),
    body("hook").optional().trim().notEmpty(),
    body("slides").optional().isArray(),
  ],
  validate,
  contentController.reviseContent
);

// Slides management
router.post(
  "/:id/slides",
  authenticate,
  requireRole(RoleName.CONTENT_CREATOR, RoleName.ADMIN),
  [
    body("slideNumber").isInt({ min: 1 }),
    body("headline").trim().notEmpty().withMessage("Slide headline is required"),
    body("mainPoints").isArray({ min: 1 }).withMessage("At least one main point is required"),
    body("visualPrompt").trim().notEmpty().withMessage("Visual prompt is required"),
  ],
  validate,
  contentController.addSlide
);

router.put(
  "/:id/slides/:slideId",
  authenticate,
  requireRole(RoleName.CONTENT_CREATOR, RoleName.ADMIN),
  [
    body("headline").optional().trim().notEmpty(),
    body("mainPoints").optional().isArray({ min: 1 }),
    body("visualPrompt").optional().trim().notEmpty(),
  ],
  validate,
  contentController.updateSlide
);

router.delete(
  "/:id/slides/:slideId",
  authenticate,
  requireRole(RoleName.CONTENT_CREATOR, RoleName.ADMIN),
  contentController.deleteSlide
);

router.post(
  "/:id/slides/reorder",
  authenticate,
  requireRole(RoleName.CONTENT_CREATOR, RoleName.ADMIN),
  [
    body("orderedIds").isArray({ min: 1 }).withMessage("orderedIds array is required"),
  ],
  validate,
  contentController.reorderSlides
);

// Review submission and results
router.post(
  "/:id/reviews",
  authenticate,
  requireRole(RoleName.PEER_REVIEWER, RoleName.ADMIN),
  [
    body("accuracyScore").isInt({ min: 1, max: 10 }),
    body("relevanceScore").isInt({ min: 1, max: 10 }),
    body("clarityScore").isInt({ min: 1, max: 10 }),
    body("hookScore").isInt({ min: 1, max: 10 }),
    body("valueScore").isInt({ min: 1, max: 10 }),
    body("flowScore").isInt({ min: 1, max: 10 }),
    body("ctaScore").isInt({ min: 1, max: 10 }),
    body("consistencyScore").isInt({ min: 1, max: 10 }),
    body("comment").trim().notEmpty().withMessage("Review comment is required"),
  ],
  validate,
  contentController.submitReview
);

router.get("/:id/reviews", authenticate, contentController.getContentReviews);
router.get("/:id/result", authenticate, contentController.getReviewResult);

export default router;
