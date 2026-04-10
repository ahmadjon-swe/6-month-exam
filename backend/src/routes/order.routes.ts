import { Router } from "express";
import * as OrderController from "../controllers/order.controller";
import { authenticate } from "../middleware/authentication";
import { asyncWrap } from "../utils/asyncWrap";

const router = Router();

router.use(authenticate);

router.post("/",              asyncWrap(OrderController.createOrder));
router.get("/",               asyncWrap(OrderController.getMyOrders));
router.get("/all",            asyncWrap(OrderController.getAllOrders));       // admin
router.get("/:id",            asyncWrap(OrderController.getOrderById));
router.patch("/:id/status",   asyncWrap(OrderController.updateOrderStatus));

export default router;
