import { Request, Response } from "express";
import * as WishlistService from "../services/wishlist.service";
import { wishlistSchema } from "../validators/user.validator";

export const getWishlist = async (req: Request, res: Response): Promise<void> => {
  const result = await WishlistService.getWishlist(req.user!.id);
  res.json(result);
};

export const toggleWishlist = async (req: Request, res: Response): Promise<void> => {
  const { error, value } = wishlistSchema.validate(req.body);
  if (error) { res.status(400).json({ message: error.message }); return; }

  const result = await WishlistService.toggleWishlist(req.user!.id, value.product_id);
  res.json(result);
};

export const moveToCart = async (req: Request, res: Response): Promise<void> => {
  const productId = parseInt(req.params.productId);
  if (isNaN(productId)) { res.status(400).json({ message: "Invalid product ID" }); return; }

  const variantIndex = parseInt(req.query.variant_index as string) || 0;
  const result = await WishlistService.moveToCart(req.user!.id, productId, variantIndex);
  res.json(result);
};
