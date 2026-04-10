import { Router } from "express";
import * as CartController from "../controllers/cart.controller";
import { authenticate } from "../middleware/authentication";
import { asyncWrap } from "../utils/asyncWrap";

const router = Router();

router.use(authenticate);

router.get("/",           asyncWrap(CartController.getCart));
router.post("/",          asyncWrap(CartController.addToCart));
router.put("/:id",        asyncWrap(CartController.updateCartItem));
router.delete("/clear",   asyncWrap(CartController.clearCart));
router.delete("/:id",     asyncWrap(CartController.removeCartItem));

export default router;
