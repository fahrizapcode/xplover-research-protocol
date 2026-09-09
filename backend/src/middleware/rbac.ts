import { Request, Response, NextFunction } from "express";
import { RoleName } from "@prisma/client";
import { ForbiddenError, UnauthorizedError } from "../utils/errors";

/**
 * Middleware factory: requires one or more roles.
 * User must have ALL specified roles OR ANY (using requireAny).
 */
export function requireRole(...roles: RoleName[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      next(new UnauthorizedError());
      return;
    }

    const userRoles = req.user.roles;
    const hasRequiredRole = roles.some((role) => userRoles.includes(role));

    if (!hasRequiredRole) {
      next(
        new ForbiddenError(
          `Access denied. Required role: ${roles.join(" or ")}.`
        )
      );
      return;
    }

    next();
  };
}

/**
 * Shorthand role guards
 */
export const requireAdmin = requireRole(RoleName.ADMIN);
export const requireResearcher = requireRole(RoleName.RESEARCHER);
export const requireContentCreator = requireRole(RoleName.CONTENT_CREATOR);
export const requirePeerReviewer = requireRole(RoleName.PEER_REVIEWER);
export const requireVisualDesigner = requireRole(RoleName.VISUAL_DESIGNER);
