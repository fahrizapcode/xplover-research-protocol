import { Router } from "express";
import { body, query } from "express-validator";
import * as researchController from "../controllers/researchController";
import { authenticate } from "../middleware/auth";
import { requireRole } from "../middleware/rbac";
import { validate } from "../middleware/validate";
import { RoleName, TechnologyCategory } from "@prisma/client";

const router = Router();

// Public routes
router.get("/", researchController.listResearch);
router.get("/:id", researchController.getResearch);
router.get("/:id/ratings", researchController.getRatings);

// Protected routes - Researcher or Admin
router.post(
  "/",
  authenticate,
  requireRole(RoleName.RESEARCHER, RoleName.ADMIN),
  [
    body("title").trim().notEmpty().withMessage("Title is required"),
    body("paperUrl").trim().isURL().withMessage("Valid paper URL is required"),
    body("publicationYear")
      .isInt({ min: 1900, max: 2100 })
      .withMessage("Valid publication year is required"),
    body("technologyCategory")
      .isIn(Object.values(TechnologyCategory))
      .withMessage(`Valid category required: ${Object.values(TechnologyCategory).join(", ")}`),
    body("problem").trim().notEmpty().withMessage("Problem statement is required"),
    body("approach").trim().notEmpty().withMessage("Approach is required"),
    body("keyFindings").trim().notEmpty().withMessage("Key findings are required"),
    body("researcherInsight").trim().notEmpty().withMessage("Researcher insight is required"),
    body("whyItMatters").trim().notEmpty().withMessage("Why it matters is required"),
    body("whatCommunityShouldLearn").trim().notEmpty().withMessage("What community should learn is required"),
    body("unclearParts").optional().trim(),
    body("discussionQuestions").optional().trim(),
  ],
  validate,
  researchController.createResearch
);

router.put(
  "/:id",
  authenticate,
  requireRole(RoleName.RESEARCHER, RoleName.ADMIN),
  [
    body("title").optional().trim().notEmpty(),
    body("abstract").optional().trim().notEmpty(),
    body("authors").optional().isArray({ min: 1 }),
    body("publicationYear").optional().isInt({ min: 1900, max: 2100 }),
    body("technologyCategory").optional().isIn(Object.values(TechnologyCategory)),
    body("doi").optional().trim(),
    body("url").optional().trim().isURL(),
    body("tags").optional().isArray(),
  ],
  validate,
  researchController.updateResearch
);

// Rating routes - any authenticated user
router.post(
  "/:id/ratings",
  authenticate,
  [
    body("score")
      .isInt({ min: 1, max: 5 })
      .withMessage("Score must be an integer between 1 and 5"),
    body("comment").optional().trim().isLength({ max: 1000 }),
  ],
  validate,
  researchController.submitRating
);

router.put(
  "/:id/ratings/:ratingId",
  authenticate,
  [
    body("score")
      .isInt({ min: 1, max: 5 })
      .withMessage("Score must be an integer between 1 and 5"),
    body("comment").optional().trim().isLength({ max: 1000 }),
  ],
  validate,
  researchController.updateRating
);

export default router;
