import { Request, Response, NextFunction } from "express";
import { getXCRHistory } from "../services/xcrService";
import prisma from "../utils/prisma";
import { NotFoundError } from "../utils/errors";

export async function getUserXCR(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.params.id === "me" ? req.user!.id : req.params.id;
    const data = await getXCRHistory(userId);
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

export async function getUserXCRTransactions(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.params.id === "me" ? req.user!.id : req.params.id;
    const page = req.query.page ? parseInt(req.query.page as string) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 20;

    const [total, transactions] = await Promise.all([
      prisma.xcrTransaction.count({ where: { userId } }),
      prisma.xcrTransaction.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
    ]);

    res.json({
      success: true,
      data: transactions,
      pagination: { total, page, limit, totalPages: Math.ceil(total / limit) },
    });
  } catch (err) {
    next(err);
  }
}

export async function getActivity(req: Request, res: Response, next: NextFunction) {
  try {
    const page = req.query.page ? parseInt(req.query.page as string) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 20;
    const actorId = req.query.userId as string || req.user?.id;

    const where = actorId ? { actorId } : {};

    const [total, logs] = await Promise.all([
      prisma.activityLog.count({ where }),
      prisma.activityLog.findMany({
        where,
        include: {
          actor: { select: { id: true, name: true, username: true, avatar: true } },
        },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
    ]);

    res.json({
      success: true,
      data: logs,
      pagination: { total, page, limit, totalPages: Math.ceil(total / limit) },
    });
  } catch (err) {
    next(err);
  }
}

export async function getUserActivity(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.params.id === "me" ? req.user!.id : req.params.id;
    const page = req.query.page ? parseInt(req.query.page as string) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 20;

    const [total, logs] = await Promise.all([
      prisma.activityLog.count({ where: { actorId: userId } }),
      prisma.activityLog.findMany({
        where: { actorId: userId },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
    ]);

    res.json({
      success: true,
      data: logs,
      pagination: { total, page, limit, totalPages: Math.ceil(total / limit) },
    });
  } catch (err) {
    next(err);
  }
}

export async function getBlockchainAttestations(req: Request, res: Response, next: NextFunction) {
  try {
    const { entityType, entityId } = req.params;
    const attestations = await prisma.blockchainAttestation.findMany({
      where: { entityType: entityType.toUpperCase(), entityId },
      include: {
        contributor: { select: { id: true, name: true, walletAddress: true } },
      },
      orderBy: { createdAt: "desc" },
    });
    res.json({ success: true, data: attestations });
  } catch (err) {
    next(err);
  }
}
