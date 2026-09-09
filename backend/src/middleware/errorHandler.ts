import { Request, Response, NextFunction } from "express";
import { AppError } from "../utils/errors";
import { Prisma } from "@prisma/client";

export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void {
  // Operational errors (known, expected)
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      success: false,
      error: err.message,
    });
    return;
  }

  // Prisma unique constraint violation
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === "P2002") {
      res.status(409).json({
        success: false,
        error: "A record with this value already exists.",
      });
      return;
    }
    if (err.code === "P2025") {
      res.status(404).json({
        success: false,
        error: "Record not found.",
      });
      return;
    }
    if (err.code === "P2003") {
      res.status(400).json({
        success: false,
        error: "Invalid reference: related record not found.",
      });
      return;
    }
  }

  // Prisma validation error
  if (err instanceof Prisma.PrismaClientValidationError) {
    res.status(400).json({
      success: false,
      error: "Invalid data provided.",
    });
    return;
  }

  // Unknown / programming errors — don't expose details
  console.error("Unhandled error:", err);
  res.status(500).json({
    success: false,
    error: "An internal server error occurred. Please try again later.",
  });
}
