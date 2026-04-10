import { Router } from "express";
import * as UserController from "../controllers/user.controller";
import { authenticate } from "../middleware/authentication";
import { asyncWrap } from "../utils/asyncWrap";

const router = Router();

router.use(authenticate);

// Self
router.get("/profile",              asyncWrap(UserController.getProfile));
router.put("/profile",              asyncWrap(UserController.updateProfile));
router.put("/billing",              asyncWrap(UserController.updateBilling));
router.post("/upgrade-to-seller",   asyncWrap(UserController.upgradeToSeller));

// Admin
router.get("/",                     asyncWrap(UserController.listUsers));
router.patch("/:id/role",           asyncWrap(UserController.setUserRole));

export default router;
