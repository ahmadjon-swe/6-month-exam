import Joi from "joi";
import { PaymentType } from "../enums/orderStatus.enum";

export const createOrderSchema = Joi.object({
  payment_type: Joi.string()
    .valid(...Object.values(PaymentType))
    .required(),
  notes: Joi.string().max(500).optional().allow("", null),
  billing: Joi.object({
    first_name: Joi.string().min(1).max(100).required(),
    company_name: Joi.string().max(150).optional().allow("", null),
    street_address: Joi.string().min(5).max(255).required(),
    apartment: Joi.string().max(100).optional().allow("", null),
    city: Joi.string().min(2).max(100).required(),
    phone: Joi.string()
      .pattern(/^\+?[0-9]{7,15}$/)
      .required(),
    email: Joi.string().email().optional().allow("", null),
  }).required(),
});

export const updateOrderStatusSchema = Joi.object({
  status: Joi.string()
    .valid("pending", "paid", "shipped", "delivered", "cancelled")
    .required(),
});
