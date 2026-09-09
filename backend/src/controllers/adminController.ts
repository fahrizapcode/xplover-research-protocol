import { Request, Response, NextFunction } from "express";
import * as adminService from "../services/adminService";
import { RoleName } from "@prisma/client";
import { ValidationError } from "../utils/errors";
import { config } from "../utils/config";

export async function listUsers(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await adminService.listUsers({
      search: req.query.search as string,
      page: req.query.page ? parseInt(req.query.page as string) : 1,
      limit: req.query.limit ? parseInt(req.query.limit as string) : 20,
    });
    res.json({ success: true, ...result });
  } catch (err) {
    next(err);
  }
}

export async function getUserDetail(req: Request, res: Response, next: NextFunction) {
  try {
    const user = await adminService.getUserDetail(req.params.id);
    res.json({ success: true, data: user });
  } catch (err) {
    next(err);
  }
}

export async function assignRole(req: Request, res: Response, next: NextFunction) {
  try {
    const { role } = req.body;
    if (!Object.values(RoleName).includes(role)) {
      throw new ValidationError(`Invalid role. Must be one of: ${Object.values(RoleName).join(", ")}`);
    }
    const result = await adminService.assignRole(req.params.id, role, req.user!.id);
    res.json({ success: true, ...result });
  } catch (err) {
    next(err);
  }
}

export async function removeRole(req: Request, res: Response, next: NextFunction) {
  try {
    const role = req.params.role as RoleName;
    if (!Object.values(RoleName).includes(role)) {
      throw new ValidationError(`Invalid role.`);
    }
    const result = await adminService.removeRole(req.params.id, role, req.user!.id);
    res.json({ success: true, ...result });
  } catch (err) {
    next(err);
  }
}

export async function getXCRTransactions(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await adminService.getAdminXCRTransactions({
      page: req.query.page ? parseInt(req.query.page as string) : 1,
      limit: req.query.limit ? parseInt(req.query.limit as string) : 20,
    });
    res.json({ success: true, ...result });
  } catch (err) {
    next(err);
  }
}

export async function getBlockchainAttestations(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await adminService.getBlockchainAttestations({
      entityType: req.query.entityType as string,
      entityId: req.query.entityId as string,
      page: req.query.page ? parseInt(req.query.page as string) : 1,
      limit: req.query.limit ? parseInt(req.query.limit as string) : 20,
    });
    res.json({ success: true, ...result });
  } catch (err) {
    next(err);
  }
}

export async function getBlockchainInfo(req: Request, res: Response, next: NextFunction) {
  try {
    res.json({
      success: true,
      data: {
        network: "Arbitrum Sepolia",
        chainId: 421614,
        xcrContractAddress: config.blockchain.xcrContractAddress || "Not deployed",
        contributionContractAddress: config.blockchain.contributionContractAddress || "Not deployed",
        blockchainEnabled: config.blockchain.enabled,
      },
    });
  } catch (err) {
    next(err);
  }
}
