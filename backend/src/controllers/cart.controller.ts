import { Request, Response } from "express";
import * as CartService from "../services/cart.service";
import { cartSchema, updateCartSchema } from "../validators/user.validator";

export const getCart = async (req: Request, res: Response): Promise<void> => {
  const result = await CartService.getCart(req.user!.id);
  res.json(result);
};

export const addToCart = async (req: Request, res: Response): Promise<void> => {
  const { error, value } = cartSchema.validate(req.body);
  if (error) { res.status(400).json({ message: error.message }); return; }

  const result = await CartService.addToCart(
    req.user!.id, value.product_id, value.variant_index, value.quantity
  );
  res.status(201).json(result);
};

export const updateCartItem = async (req: Request, res: Response): Promise<void> => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) { res.status(400).json({ message: "Invalid cart item ID" }); return; }

  const { error, value } = updateCartSchema.validate(req.body);
  if (error) { res.status(400).json({ message: error.message }); return; }

  const result = await CartService.updateCartItem(req.user!.id, id, value.quantity);
  res.json(result);
};

export const removeCartItem = async (req: Request, res: Response): Promise<void> => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) { res.status(400).json({ message: "Invalid cart item ID" }); return; }

  const result = await CartService.removeCartItem(req.user!.id, id);
  res.json(result);
};

export const clearCart = async (req: Request, res: Response): Promise<void> => {
  const result = await CartService.clearCart(req.user!.id);
  res.json(result);
};
