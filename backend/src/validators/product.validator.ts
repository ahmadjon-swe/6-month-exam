import Joi from "joi";
import { ProductCategory } from "../enums/productCategory.enum";

const variantSchema = Joi.object({
  color: Joi.string().max(50).optional(),
  size: Joi.string().max(50).optional(),
  price: Joi.number().positive().optional(), // overrides base_price if set
  stock: Joi.number().integer().min(0).required(),
  attributes: Joi.object().pattern(Joi.string(), Joi.string()).optional(),
});

export const createProductSchema = Joi.object({
  name: Joi.string().min(2).max(255).required(),
  description: Joi.string().min(10).required(),
  category: Joi.string()
    .valid(...Object.values(ProductCategory))
    .required(),
  base_price: Joi.number().positive().required(),
  discount_percentage: Joi.number().min(0).max(100).default(null).optional(),
  discount_expiry: Joi.date().greater("now").optional().allow(null),
  variants: Joi.array().items(variantSchema).min(1).required(),
});

export const updateProductSchema = Joi.object({
  name: Joi.string().min(2).max(255).optional(),
  description: Joi.string().min(10).optional(),
  category: Joi.string()
    .valid(...Object.values(ProductCategory))
    .optional(),
  base_price: Joi.number().positive().optional(),
  discount_percentage: Joi.number().min(0).max(100).optional().allow(null),
  discount_expiry: Joi.date().greater("now").optional().allow(null),
  variants: Joi.array().items(variantSchema).min(1).optional(),
  is_active: Joi.boolean().optional(),
});

export const productQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(20),
  search: Joi.string().optional().allow(""),
  category: Joi.string()
    .valid(...Object.values(ProductCategory))
    .optional(),
  min_price: Joi.number().min(0).optional(),
  max_price: Joi.number().positive().optional(),
  sort: Joi.string()
    .valid("price_asc", "price_desc", "newest", "most_sold")
    .default("newest"),
});
