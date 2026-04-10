import { Request, Response } from "express";
import * as OrderService from "../services/order.service";
import { createOrderSchema, updateOrderStatusSchema } from "../validators/order.validator";
import { Role } from "../enums/roles.enum";
import { OrderStatus } from "../enums/orderStatus.enum";

export const createOrder = async (req: Request, res: Response): Promise<void> => {
  const { error, value } = createOrderSchema.validate(req.body);
  if (error) { res.status(400).json({ message: error.message }); return; }

  const result = await OrderService.createOrder(
    req.user!.id,
    value.payment_type,
    value.billing,
    value.notes
  );
  res.status(201).json(result);
};

export const getMyOrders = async (req: Request, res: Response): Promise<void> => {
  const status = req.query.status as OrderStatus | undefined;
  const page = parseInt(req.query.page as string) || 1;
  const limit = Math.min(parseInt(req.query.limit as string) || 20, 100);

  const result = await OrderService.getMyOrders(req.user!.id, status, page, limit);
  res.json(result);
};

export const getOrderById = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const result = await OrderService.getOrderById(id, req.user!.id, req.user!.role as Role);
  res.json(result);
};

export const updateOrderStatus = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const { error, value } = updateOrderStatusSchema.validate(req.body);
  if (error) { res.status(400).json({ message: error.message }); return; }

  const result = await OrderService.updateOrderStatus(
    id, value.status, req.user!.id, req.user!.role as Role
  );
  res.json(result);
};

// Admin only
export const getAllOrders = async (req: Request, res: Response): Promise<void> => {
  if (req.user!.role !== Role.ADMIN) {
    res.status(403).json({ message: "Admin access required" });
    return;
  }

  const status = req.query.status as OrderStatus | undefined;
  const page = parseInt(req.query.page as string) || 1;
  const limit = Math.min(parseInt(req.query.limit as string) || 20, 100);

  const result = await OrderService.getAllOrders(status, page, limit);
  res.json(result);
};