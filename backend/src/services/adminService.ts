import prisma from "../utils/prisma";
import { RoleName } from "@prisma/client";
import { NotFoundError, ForbiddenError, ConflictError, ValidationError } from "../utils/errors";

export async function listUsers(params: {
  search?: string;
  page?: number;
  limit?: number;
}) {
  const { search, page = 1, limit = 20 } = params;
  const where: any = {};
  if (search) {
    where.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { email: { contains: search, mode: "insensitive" } },
      { username: { contains: search, mode: "insensitive" } },
    ];
  }

  const [total, users] = await Promise.all([
    prisma.user.count({ where }),
    prisma.user.findMany({
      where,
      select: {
        id: true,
        name: true,
        username: true,
        email: true,
        avatar: true,
        walletAddress: true,
        xcrBalance: true,
        createdAt: true,
        roles: { include: { role: true } },
        _count: { select: { research: true, contentCreated: true, contentReviews: true } },
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
  ]);

  return {
    data: users.map((u) => ({
      ...u,
      roles: u.roles.map((ur) => ur.role.name),
    })),
    pagination: { total, page, limit, totalPages: Math.ceil(total / limit) },
  };
}

export async function getUserDetail(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      roles: { include: { role: true } },
      _count: {
        select: {
          research: true,
          contentCreated: true,
          contentReviews: true,
        },
      },
    },
  });

  if (!user) throw new NotFoundError("User not found.");

  const [xcrTransactions, activityLogs, research, content, reviews] =
    await Promise.all([
      prisma.xcrTransaction.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
        take: 20,
      }),
      prisma.activityLog.findMany({
        where: { actorId: userId },
        orderBy: { createdAt: "desc" },
        take: 20,
      }),
      prisma.research.findMany({
        where: { authorId: userId },
        orderBy: { createdAt: "desc" },
        take: 5,
      }),
      prisma.content.findMany({
        where: { createdBy: userId },
        select: { id: true, title: true, status: true, createdAt: true },
        orderBy: { createdAt: "desc" },
        take: 5,
      }),
      prisma.contentReview.findMany({
        where: { reviewerId: userId },
        select: { id: true, contentId: true, reviewRound: true, createdAt: true },
        orderBy: { createdAt: "desc" },
        take: 5,
      }),
    ]);

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
    counts: user._count,
    xcrTransactions,
    activityLogs,
    research,
    content,
    reviews,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}

export async function assignRole(
  targetUserId: string,
  roleName: RoleName,
  assignedBy: string
) {
  const user = await prisma.user.findUnique({ where: { id: targetUserId } });
  if (!user) throw new NotFoundError("User not found.");

  const role = await prisma.role.findUnique({ where: { name: roleName } });
  if (!role) throw new NotFoundError("Role not found.");

  // Check if already has role
  const existing = await prisma.userRole.findUnique({
    where: { userId_roleId: { userId: targetUserId, roleId: role.id } },
  });
  if (existing) {
    throw new ConflictError(`User already has the ${roleName} role.`);
  }

  await prisma.userRole.create({
    data: { userId: targetUserId, roleId: role.id, assignedBy },
  });

  return { message: `Role ${roleName} assigned to ${user.name}.` };
}

export async function removeRole(
  targetUserId: string,
  roleName: RoleName,
  removedBy: string
) {
  const user = await prisma.user.findUnique({ where: { id: targetUserId } });
  if (!user) throw new NotFoundError("User not found.");

  const role = await prisma.role.findUnique({ where: { name: roleName } });
  if (!role) throw new NotFoundError("Role not found.");

  const existing = await prisma.userRole.findUnique({
    where: { userId_roleId: { userId: targetUserId, roleId: role.id } },
  });
  if (!existing) {
    throw new NotFoundError(`User does not have the ${roleName} role.`);
  }

  // Prevent removing own ADMIN role
  if (targetUserId === removedBy && roleName === RoleName.ADMIN) {
    throw new ForbiddenError("You cannot remove your own ADMIN role.");
  }

  await prisma.userRole.delete({
    where: { userId_roleId: { userId: targetUserId, roleId: role.id } },
  });

  return { message: `Role ${roleName} removed from ${user.name}.` };
}

export async function getAdminXCRTransactions(params: {
  page?: number;
  limit?: number;
}) {
  const { page = 1, limit = 20 } = params;

  const [total, transactions] = await Promise.all([
    prisma.xcrTransaction.count(),
    prisma.xcrTransaction.findMany({
      include: {
        user: { select: { id: true, name: true, username: true, email: true } },
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
  ]);

  return {
    data: transactions,
    pagination: { total, page, limit, totalPages: Math.ceil(total / limit) },
  };
}

export async function getBlockchainAttestations(params: {
  entityType?: string;
  entityId?: string;
  page?: number;
  limit?: number;
}) {
  const { entityType, entityId, page = 1, limit = 20 } = params;
  const where: any = {};
  if (entityType) where.entityType = entityType;
  if (entityId) where.entityId = entityId;

  const [total, attestations] = await Promise.all([
    prisma.blockchainAttestation.count({ where }),
    prisma.blockchainAttestation.findMany({
      where,
      include: {
        contributor: { select: { id: true, name: true, username: true, walletAddress: true } },
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
  ]);

  return {
    data: attestations,
    pagination: { total, page, limit, totalPages: Math.ceil(total / limit) },
  };
}
