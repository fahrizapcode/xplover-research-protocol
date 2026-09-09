import { Router } from "express";
import { body } from "express-validator";
import * as visualController from "../controllers/visualController";
import { authenticate } from "../middleware/auth";
import { requireRole } from "../middleware/rbac";
import { validate } from "../middleware/validate";
import { RoleName } from "@prisma/client";

const router = Router();

// All visual routes require VISUAL_DESIGNER or ADMIN
router.use(authenticate, requireRole(RoleName.VISUAL_DESIGNER, RoleName.ADMIN));

router.get("/queue", visualController.getQueue);
router.get("/:id", visualController.getContentVisual);
router.post("/:id/start", visualController.startVisual);
router.post("/:id/cancel", visualController.cancelVisual);
router.post("/:id/complete", visualController.completeVisual);
router.post("/:id/reopen", visualController.reopenVisual);
router.post("/:id/publish", visualController.publishContent);
router.put(
  "/:id",
  [body("remark").optional().trim()],
  validate,
  visualController.updateVisual
);

export default router;
