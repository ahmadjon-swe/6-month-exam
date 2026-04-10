import { Request, Response } from "express";
import * as AuthService from "../services/auth.service";
import {
  registerSchema,
  verifyOtpSchema,
  loginSchema,
  verifyLoginOtpSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  refreshTokenSchema,
} from "../validators/auth.validator";

const COOKIE_OPTS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  maxAge: 60 * 24 * 60 * 60 * 1000, // 60 days
};

export const register = async (req: Request, res: Response): Promise<void> => {
  const { error, value } = registerSchema.validate(req.body);
  if (error) { res.status(400).json({ message: error.message }); return; }

  const result = await AuthService.registerUser(
    value.name, value.email, value.password, value.role
  );
  res.status(201).json(result);
};

export const verifyRegisterOtp = async (req: Request, res: Response): Promise<void> => {
  const { error, value } = verifyOtpSchema.validate(req.body);
  if (error) { res.status(400).json({ message: error.message }); return; }

  const result = await AuthService.verifyRegistrationOtp(value.email, value.otp);
  res.json(result);
};

export const login = async (req: Request, res: Response): Promise<void> => {
  const { error, value } = loginSchema.validate(req.body);
  if (error) { res.status(400).json({ message: error.message }); return; }

  const result = await AuthService.loginStep1(value.email, value.password);
  res.json(result);
};

export const verifyLoginOtp = async (req: Request, res: Response): Promise<void> => {
  const { error, value } = verifyLoginOtpSchema.validate(req.body);
  if (error) { res.status(400).json({ message: error.message }); return; }

  const result = await AuthService.loginStep2(value.email, value.otp);

  res.cookie("refresh_token", result.refresh_token, COOKIE_OPTS);
  res.json({
    access_token: result.access_token,
    refresh_token: result.refresh_token,
    user: result.user,
  });
};

export const forgotPassword = async (req: Request, res: Response): Promise<void> => {
  const { error, value } = forgotPasswordSchema.validate(req.body);
  if (error) { res.status(400).json({ message: error.message }); return; }

  const result = await AuthService.forgotPassword(value.email);
  res.json(result);
};

export const resetPassword = async (req: Request, res: Response): Promise<void> => {
  const { error, value } = resetPasswordSchema.validate(req.body);
  if (error) { res.status(400).json({ message: error.message }); return; }

  const result = await AuthService.resetPassword(
    value.email, value.otp, value.new_password
  );
  res.json(result);
};

export const refreshToken = async (req: Request, res: Response): Promise<void> => {
  const token =
    req.cookies?.refresh_token ||
    req.body?.refresh_token ||
    req.headers["x-refresh-token"];

  if (!token) { res.status(400).json({ message: "Refresh token required" }); return; }

  const result = await AuthService.refreshAccessToken(token);
  res.json(result);
};

export const logout = async (req: Request, res: Response): Promise<void> => {
  const result = await AuthService.logoutUser(req.user!.id);
  res.clearCookie("refresh_token");
  res.json(result);
};
