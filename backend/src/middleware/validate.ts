import { Request, Response, NextFunction } from "express";
import { validationResult } from "express-validator";

/**
 * Middleware to check validation results from express-validator.
 * Returns 400 with detailed field errors if validation fails.
 */
export function validate(req: Request, res: Response, next: NextFunction): void {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({
      success: false,
      error: "Validation failed",
      fields: errors.array().map((e) => ({
        field: e.type === "field" ? e.path : "general",
        message: e.msg,
      })),
    });
    return;
  }
  next();
}
