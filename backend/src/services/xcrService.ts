import prisma from "../utils/prisma";
import { XcrTransactionType } from "@prisma/client";
import { ConflictError } from "../utils/errors";

/**
 * Award XCR to a user.
 * Idempotent — will silently skip if the same referenceId+transactionType already exists.
 */
export async function awardXCR(
  userId: string,
  amount: number,
  transactionType: XcrTransactionType,
  referenceType: string,
  referenceId: string
): Promise<{ awarded: boolean; newBalance: number }> {
  // Check idempotency — unique constraint on (transactionType, referenceId)
  const existing = await prisma.xcrTransaction.findUnique({
    where: {
      idempotency_key: {
        transactionType,
        referenceId,
      },
    },
  });

  if (existing) {
    // Already awarded — get current balance
    const user = await prisma.user.findUnique({ where: { id: userId } });
    return { awarded: false, newBalance: user?.xcrBalance ?? 0 };
  }

  // Create transaction + update balance atomically
  const [, updatedUser] = await prisma.$transaction([
    prisma.xcrTransaction.create({
      data: {
        userId,
        amount,
        transactionType,
        referenceType,
        referenceId,
      },
    }),
    prisma.user.update({
      where: { id: userId },
      data: { xcrBalance: { increment: amount } },
    }),
  ]);

  return { awarded: true, newBalance: updatedUser.xcrBalance };
}

/**
 * Get user's XCR balance and transaction history.
 */
export async function getXCRHistory(userId: string) {
  const [user, transactions] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      select: { xcrBalance: true },
    }),
    prisma.xcrTransaction.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  return {
    balance: user?.xcrBalance ?? 0,
    transactions,
  };
}

/**
 * Log an activity event.
 */
export async function logActivity(
  actorId: string,
  action: string,
  entityType: string,
  entityId: string,
  metadata?: Record<string, unknown>
): Promise<void> {
  try {
    await prisma.activityLog.create({
      data: {
        actorId,
        action,
        entityType,
        entityId,
        metadata: (metadata as any) ?? {},
      },
    });
  } catch (err) {
    // Activity log failure is non-critical
    console.error("[ActivityLog] Failed to log activity:", err);
  }
}
