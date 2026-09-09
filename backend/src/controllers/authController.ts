import { Request, Response, NextFunction } from "express";
import * as authService from "../services/authService";

export async function register(req: Request, res: Response, next: NextFunction) {
  try {
    const user = await authService.registerUser(req.body);
    res.status(201).json({ success: true, data: user });
  } catch (err) {
    next(err);
  }
}

export async function login(req: Request, res: Response, next: NextFunction) {
  try {
    const { token, user } = await authService.loginUser(req.body);
    authService.setAuthCookie(res, token);
    res.json({ success: true, data: { user, token } });
  } catch (err) {
    next(err);
  }
}

export async function logout(req: Request, res: Response, next: NextFunction) {
  try {
    authService.clearAuthCookie(res);
    res.json({ success: true, message: "Logged out successfully." });
  } catch (err) {
    next(err);
  }
}

export async function me(req: Request, res: Response, next: NextFunction) {
  try {
    const user = await authService.getCurrentUser(req.user!.id);
    res.json({ success: true, data: user });
  } catch (err) {
    next(err);
  }
}

export async function updateProfile(req: Request, res: Response, next: NextFunction) {
  try {
    const user = await authService.updateProfile(req.user!.id, req.body);
    res.json({ success: true, data: user });
  } catch (err) {
    next(err);
  }
}
