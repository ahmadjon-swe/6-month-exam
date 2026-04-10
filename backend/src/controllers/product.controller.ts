import { Request, Response } from "express";
import * as ProductService from "../services/product.service";
import {
  createProductSchema,
  updateProductSchema,
  productQuerySchema,
} from "../validators/product.validator";
import { Role } from "../enums/roles.enum";

export const createProduct = async (req: Request, res: Response): Promise<void> => {
  if (req.user!.role === Role.USER) {
    res.status(403).json({ message: "Only sellers or admins can create products" });
    return;
  }

  // variants may come as JSON string from multipart
  if (typeof req.body.variants === "string") {
    try { req.body.variants = JSON.parse(req.body.variants); }
    catch { res.status(400).json({ message: "Invalid variants JSON" }); return; }
  }

  const { error, value } = createProductSchema.validate(req.body);
  if (error) { res.status(400).json({ message: error.message }); return; }

  const files = (req.files as Express.Multer.File[]) || [];
  const product = await ProductService.createProduct(value, req.user!.id, files);
  res.status(201).json(product);
};

export const getProducts = async (req: Request, res: Response): Promise<void> => {
  const { error, value } = productQuerySchema.validate(req.query);
  if (error) { res.status(400).json({ message: error.message }); return; }

  const result = await ProductService.getProducts(value);
  res.json(result);
};

export const getProduct = async (req: Request, res: Response): Promise<void> => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) { res.status(400).json({ message: "Invalid product ID" }); return; }

  const result = await ProductService.getProductById(id);
  res.json(result);
};

export const updateProduct = async (req: Request, res: Response): Promise<void> => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) { res.status(400).json({ message: "Invalid product ID" }); return; }

  if (typeof req.body.variants === "string") {
    try { req.body.variants = JSON.parse(req.body.variants); }
    catch { res.status(400).json({ message: "Invalid variants JSON" }); return; }
  }

  const { error, value } = updateProductSchema.validate(req.body);
  if (error) { res.status(400).json({ message: error.message }); return; }

  const files = (req.files as Express.Multer.File[]) || [];
  const product = await ProductService.updateProduct(
    id, req.user!.id, req.user!.role as Role, value, files
  );
  res.json(product);
};

export const deleteProduct = async (req: Request, res: Response): Promise<void> => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) { res.status(400).json({ message: "Invalid product ID" }); return; }

  const result = await ProductService.deleteProduct(id, req.user!.id, req.user!.role as Role);
  res.json(result);
};

export const getMostSold = async (req: Request, res: Response): Promise<void> => {
  const limit = Math.min(parseInt(req.query.limit as string) || 10, 50);
  const result = await ProductService.getMostSold(limit);
  res.json(result);
};

export const getDiscountedProducts = async (req: Request, res: Response): Promise<void> => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = Math.min(parseInt(req.query.limit as string) || 20, 100);
  const result = await ProductService.getDiscountedProducts(page, limit);
  res.json(result);
};