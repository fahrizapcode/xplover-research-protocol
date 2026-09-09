import { Router } from "express";
import * as xcrController from "../controllers/xcrController";
import { authenticate } from "../middleware/auth";

const router = Router();

router.get("/", authenticate, xcrController.getActivity);
router.get("/users/:id", authenticate, xcrController.getUserActivity);
router.get("/attestations/:entityType/:entityId", xcrController.getBlockchainAttestations);

export default router;
