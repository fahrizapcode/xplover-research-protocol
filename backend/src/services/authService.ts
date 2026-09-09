import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { Response } from "express";
import prisma from "../utils/prisma";
import { config } from "../utils/config";
import { ConflictError, UnauthorizedError, ValidationError } from "../utils/errors";
import { RoleName } from "@prisma/client";
import { JwtPayload } from "../middleware/auth";

const SALT_ROUNDS = 12;
const COOKIE_NAME = "token";

export async function registerUser(data: {
  name: string;
  username: string;
  email: string;
  password: string;
}) {
  // Check for existing user
  const existing = await prisma.user.findFirst({
    where: {
      OR: [{ email: data.email }, { username: data.username }],
    },
  });

  if (existing) {
    if (existing.email === data.email) {
      throw new ConflictError("An account with this email already exists.");
    }
    throw new ConflictError("Username is already taken.");
  }

  const passwordHash = await bcrypt.hash(data.password, SALT_ROUNDS);

  // Every new user starts with RESEARCHER role by default
  const researcherRole = await prisma.role.findUnique({
    where: { name: RoleName.RESEARCHER },
  });

  const user = await prisma.user.create({
    data: {
      name: data.name,
      username: data.username,
      email: data.email,
      passwordHash,
      roles: researcherRole
        ? {
            create: {
              roleId: researcherRole.id,
            },
          }
        : undefined,
    },
    include: {
      roles: { include: { role: true } },
    },
  });

  return {
    id: user.id,
    name: user.name,
    username: user.username,
    email: user.email,
    xcrBalance: user.xcrBalance,
    roles: user.roles.map((ur) => ur.role.name),
    createdAt: user.createdAt,
  };
}

export async function loginUser(data: { email: string; password: string }) {
  const user = await prisma.user.findUnique({
    where: { email: data.email },
    include: {
      roles: { include: { role: true } },
    },
  });

  if (!user) {
    throw new UnauthorizedError("Invalid email or password.");
  }

  const isPasswordValid = await bcrypt.compare(data.password, user.passwordHash);
  if (!isPasswordValid) {
    throw new UnauthorizedError("Invalid email or password.");
  }

  const payload: JwtPayload = {
    userId: user.id,
    email: user.email,
  };

  const token = jwt.sign(payload, config.jwtSecret, {
    expiresIn: config.jwtExpiresIn as any,
  });

  return {
    token,
    user: {
      id: user.id,
      name: user.name,
      username: user.username,
      email: user.email,
      avatar: user.avatar,
      bio: user.bio,
      walletAddress: user.walletAddress,
      xcrBalance: user.xcrBalance,
      roles: user.roles.map((ur) => ur.role.name),
      createdAt: user.createdAt,
    },
  };
}

export function setAuthCookie(res: Response, token: string): void {
  res.cookie(COOKIE_NAME, token, {
    httpOnly: true,
    secure: config.nodeEnv === "production",
    sameSite: "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });
}

export function clearAuthCookie(res: Response): void {
  res.clearCookie(COOKIE_NAME);
}

export async function getCurrentUser(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      roles: { include: { role: true } },
    },
  });

  if (!user) return null;

  return {
    id: user.id,
    name: user.name,
    username: user.username,
    email: user.email,
    avatar: user.avatar,
    bio: user.bio,
    walletAddress: user.walletAddress,
    xcrBalance: user.xcrBalance,
    roles: user.roles.map((ur) => ur.role.name),
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}

export async function updateProfile(userId: string, data: {
  name?: string;
  bio?: string;
  avatar?: string;
  walletAddress?: string;
}) {
  if (data.walletAddress) {
    // Check wallet address uniqueness
    const existing = await prisma.user.findFirst({
      where: { walletAddress: data.walletAddress, NOT: { id: userId } },
    });
    if (existing) {
      throw new ConflictError("This wallet address is already linked to another account.");
    }
  }

  const user = await prisma.user.update({
    where: { id: userId },
    data,
    include: { roles: { include: { role: true } } },
  });

  return {
    id: user.id,
    name: user.name,
    username: user.username,
    email: user.email,
    avatar: user.avatar,
    bio: user.bio,
    walletAddress: user.walletAddress,
    xcrBalance: user.xcrBalance,
    roles: user.roles.map((ur) => ur.role.name),
  };
}
