import { Router } from "express";
import * as AuthController from "../controllers/auth.controller";
import { authenticate } from "../middleware/authentication";
import { asyncWrap } from "../utils/asyncWrap";

const router = Router();

router.post("/register",          asyncWrap(AuthController.register));
router.post("/verify-register",   asyncWrap(AuthController.verifyRegisterOtp));
router.post("/login",             asyncWrap(AuthController.login));
router.post("/verify-login",      asyncWrap(AuthController.verifyLoginOtp));
router.post("/forgot-password",   asyncWrap(AuthController.forgotPassword));
router.post("/reset-password",    asyncWrap(AuthController.resetPassword));
router.post("/refresh-token",     asyncWrap(AuthController.refreshToken));
router.post("/logout",            authenticate, asyncWrap(AuthController.logout));

export default router;
