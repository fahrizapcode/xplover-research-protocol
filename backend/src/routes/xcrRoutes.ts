import { Router } from "express";
import * as xcrController from "../controllers/xcrController";
import { authenticate } from "../middleware/auth";

const router = Router();

router.use(authenticate);

router.get("/me", xcrController.getUserXCR);
router.get("/me/transactions", xcrController.getUserXCRTransactions);
router.get("/users/:id", xcrController.getUserXCR);
router.get("/users/:id/transactions", xcrController.getUserXCRTransactions);

export default router;
