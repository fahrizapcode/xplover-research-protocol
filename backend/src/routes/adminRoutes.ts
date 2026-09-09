import { Router } from "express";
import { body } from "express-validator";
import * as adminController from "../controllers/adminController";
import { authenticate } from "../middleware/auth";
import { requireAdmin } from "../middleware/rbac";
import { validate } from "../middleware/validate";

const router = Router();

// All routes require authentication and ADMIN role
router.use(authenticate, requireAdmin);

router.get("/users", adminController.listUsers);
router.get("/users/:id", adminController.getUserDetail);
router.post(
  "/users/:id/roles",
  [body("role").trim().notEmpty().withMessage("Role is required")],
  validate,
  adminController.assignRole
);
router.delete("/users/:id/roles/:role", adminController.removeRole);

router.get("/xcr/transactions", adminController.getXCRTransactions);
router.get("/blockchain/attestations", adminController.getBlockchainAttestations);
router.get("/blockchain/info", adminController.getBlockchainInfo);

export default router;
