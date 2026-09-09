import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { config } from "../utils/config";
import { UnauthorizedError } from "../utils/errors";
import prisma from "../utils/prisma";
import { RoleName } from "@prisma/client";

export interface AuthenticatedUser {
  id: string;
  email: string;
  name: string;
  username: string;
  roles: RoleName[];
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
    }
  }
}

export interface JwtPayload {
  userId: string;
  email: string;
}

/**
 * Authenticates the request via JWT stored in HTTP-only cookie or Authorization header.
 */
export async function authenticate(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    let token: string | undefined;

    // Check HTTP-only cookie first
    if (req.cookies?.token) {
      token = req.cookies.token;
    }
    // Fall back to Authorization header
    else if (req.headers.authorization?.startsWith("Bearer ")) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      throw new UnauthorizedError("Authentication required. Please log in.");
    }

    const payload = jwt.verify(token, config.jwtSecret) as JwtPayload;

    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      include: {
        roles: {
          include: { role: true },
        },
      },
    });

    if (!user) {
      throw new UnauthorizedError("User not found. Please log in again.");
    }

    req.user = {
      id: user.id,
      email: user.email,
      name: user.name,
      username: user.username,
      roles: user.roles.map((ur) => ur.role.name),
    };

    next();
  } catch (err) {
    if (err instanceof jwt.JsonWebTokenError) {
      next(new UnauthorizedError("Invalid or expired token. Please log in again."));
    } else {
      next(err);
    }
  }
}

/**
 * Optional authentication — sets req.user if token present, but doesn't fail if not.
 */
export async function optionalAuthenticate(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    await authenticate(req, res, next);
  } catch {
    next(); // Silently continue without auth
  }
}
