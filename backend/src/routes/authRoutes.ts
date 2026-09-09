import { Router } from "express";
import { body } from "express-validator";
import * as authController from "../controllers/authController";
import { authenticate } from "../middleware/auth";
import { validate } from "../middleware/validate";

const router = Router();

router.post(
  "/register",
  [
    body("name").trim().notEmpty().withMessage("Name is required"),
    body("username")
      .trim()
      .notEmpty()
      .isLength({ min: 3, max: 30 })
      .withMessage("Username must be 3-30 characters")
      .matches(/^[a-zA-Z0-9_-]+$/)
      .withMessage("Username can only contain letters, numbers, hyphens and underscores"),
    body("email").isEmail().withMessage("Valid email is required"),
    body("password")
      .isLength({ min: 8 })
      .withMessage("Password must be at least 8 characters"),
  ],
  validate,
  authController.register
);

router.post(
  "/login",
  [
    body("email").isEmail().withMessage("Valid email is required"),
    body("password").notEmpty().withMessage("Password is required"),
  ],
  validate,
  authController.login
);

router.post("/logout", authController.logout);

router.get("/me", authenticate, authController.me);

router.patch(
  "/me",
  authenticate,
  [
    body("name").optional().trim().notEmpty(),
    body("bio").optional().trim(),
    body("walletAddress").optional().trim().isLength({ min: 42, max: 42 }),
  ],
  validate,
  authController.updateProfile
);

export default router;
