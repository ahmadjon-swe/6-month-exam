import Joi from "joi";

export const updateProfileSchema = Joi.object({
  name: Joi.string().min(2).max(100).optional(),
  password: Joi.string().min(6).max(128).optional(),
});

export const updateBillingSchema = Joi.object({
  first_name: Joi.string().min(1).max(100).required(),
  company_name: Joi.string().max(150).optional().allow("", null),
  street_address: Joi.string().min(5).max(255).required(),
  apartment: Joi.string().max(100).optional().allow("", null),
  city: Joi.string().min(2).max(100).required(),
  phone: Joi.string()
    .pattern(/^\+?[0-9]{7,15}$/)
    .required(),
  email: Joi.string().email().optional().allow("", null),
});

export const cartSchema = Joi.object({
  product_id: Joi.number().integer().positive().required(),
  variant_index: Joi.number().integer().min(0).default(0),
  quantity: Joi.number().integer().min(1).default(1),
});

export const updateCartSchema = Joi.object({
  quantity: Joi.number().integer().min(1).required(),
});

export const wishlistSchema = Joi.object({
  product_id: Joi.number().integer().positive().required(),
});

export const setRoleSchema = Joi.object({
  role: Joi.string().valid("user", "seller", "admin").required(),
});
