import { Request, Response } from "express";
import * as UserService from "../services/user.service";
import {
  updateProfileSchema,
  updateBillingSchema,
  setRoleSchema,
} from "../validators/user.validator";
import { Role } from "../enums/roles.enum";

export const getProfile = async (req: Request, res: Response): Promise<void> => {
  const result = await UserService.getProfile(req.user!.id);
  res.json(result);
};

export const updateProfile = async (req: Request, res: Response): Promise<void> => {
  const { error, value } = updateProfileSchema.validate(req.body);
  if (error) { res.status(400).json({ message: error.message }); return; }

  const result = await UserService.updateProfile(req.user!.id, value);
  res.json(result);
};

export const updateBilling = async (req: Request, res: Response): Promise<void> => {
  const { error, value } = updateBillingSchema.validate(req.body);
  if (error) { res.status(400).json({ message: error.message }); return; }

  const result = await UserService.updateBilling(req.user!.id, value);
  res.json(result);
};

export const upgradeToSeller = async (req: Request, res: Response): Promise<void> => {
  const result = await UserService.upgradeToSeller(req.user!.id);
  res.json(result);
};

// ─── Admin only ───────────────────────────────────────────────────────────────

export const listUsers = async (req: Request, res: Response): Promise<void> => {
  if (req.user!.role !== Role.ADMIN) {
    res.status(403).json({ message: "Admin access required" });
    return;
  }

  const page = parseInt(req.query.page as string) || 1;
  const limit = Math.min(parseInt(req.query.limit as string) || 20, 100);
  const search = req.query.search as string | undefined;

  const result = await UserService.listUsers(page, limit, search);
  res.json(result);
};

export const setUserRole = async (req: Request, res: Response): Promise<void> => {
  if (req.user!.role !== Role.ADMIN) {
    res.status(403).json({ message: "Admin access required" });
    return;
  }

  const targetId = parseInt(req.params.id);
  if (isNaN(targetId)) { res.status(400).json({ message: "Invalid user ID" }); return; }

  const { error, value } = setRoleSchema.validate(req.body);
  if (error) { res.status(400).json({ message: error.message }); return; }

  const result = await UserService.setUserRole(req.user!.id, targetId, value.role as Role);
  res.json(result);
};
