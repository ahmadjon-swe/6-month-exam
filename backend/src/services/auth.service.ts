import bcrypt from "bcryptjs";
import { Op } from "sequelize";
import { User } from "../models";
import { Role } from "../enums/roles.enum";
import { generateOTP, sendOTPEmail } from "../utils/email";
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
  TokenPayload,
} from "../utils/jwt";

// ─── Register ────────────────────────────────────────────────────────────────

export const registerUser = async (
  name: string,
  email: string,
  password: string,
  role: Role = Role.USER
) => {
  const existing = await User.findOne({ where: { email } });
  if (existing) {
    if (existing.is_active) throw new Error("Email already registered");
    // Resend OTP if not yet active
    const otp = generateOTP();
    const otp_expiry = new Date(Date.now() + 2 * 60 * 1000);
    await existing.update({ otp, otp_expiry });
    await sendOTPEmail(email, otp, "register");
    return { message: "OTP resent to email" };
  }

  const hashed = await bcrypt.hash(password, 12);
  const otp = generateOTP();
  const otp_expiry = new Date(Date.now() + 2 * 60 * 1000);

  await User.create({ name, email, password: hashed, role, otp, otp_expiry });
  await sendOTPEmail(email, otp, "register");

  return { message: "OTP sent to email. Please verify to activate your account." };
};

// ─── Verify Registration OTP ─────────────────────────────────────────────────

export const verifyRegistrationOtp = async (email: string, otp: string) => {
  const user = await User.findOne({ where: { email } });
  if (!user) throw new Error("User not found");
  if (user.is_active) throw new Error("Account already active");
  if (!user.otp || user.otp !== otp) throw new Error("Invalid OTP");
  if (!user.otp_expiry || new Date() > user.otp_expiry)
    throw new Error("OTP expired");

  await user.update({ is_active: true, otp: null, otp_expiry: null });
  return { message: "Account activated. You can now log in." };
};

// ─── Login Step 1: verify password → send OTP ─────────────────────────────

export const loginStep1 = async (email: string, password: string) => {
  const user = await User.findOne({ where: { email } });
  if (!user) throw new Error("Invalid credentials");
  if (!user.is_active) throw new Error("Account not activated. Check your email.");
  if (!user.password) throw new Error("Invalid credentials");

  const match = await bcrypt.compare(password, user.password);
  if (!match) throw new Error("Invalid credentials");

  const otp = generateOTP();
  const otp_expiry = new Date(Date.now() + 2 * 60 * 1000);
  await user.update({ otp, otp_expiry });
  await sendOTPEmail(email, otp, "login");

  return { message: "OTP sent to your email" };
};

// ─── Login Step 2: verify OTP → issue tokens ─────────────────────────────

export const loginStep2 = async (email: string, otp: string) => {
  const user = await User.findOne({ where: { email } });
  if (!user) throw new Error("User not found");
  if (!user.otp || user.otp !== otp) throw new Error("Invalid OTP");
  if (!user.otp_expiry || new Date() > user.otp_expiry)
    throw new Error("OTP expired");

  const payload: TokenPayload = { id: user.id, email: user.email, role: user.role };
  const access_token = generateAccessToken(payload);
  const refresh_token = generateRefreshToken(payload);

  await user.update({ otp: null, otp_expiry: null, refresh_token });

  return {
    access_token,
    refresh_token,
    user: { id: user.id, name: user.name, email: user.email, role: user.role },
  };
};

// ─── Forgot Password ─────────────────────────────────────────────────────────

export const forgotPassword = async (email: string) => {
  const user = await User.findOne({ where: { email, is_active: true } });
  // Return same message regardless — no user enumeration
  if (!user) return { message: "If that email is registered, an OTP has been sent." };

  const otp = generateOTP();
  const otp_expiry = new Date(Date.now() + 2 * 60 * 1000);
  await user.update({ otp, otp_expiry });
  await sendOTPEmail(email, otp, "reset");

  return { message: "If that email is registered, an OTP has been sent." };
};

// ─── Reset Password ───────────────────────────────────────────────────────────

export const resetPassword = async (
  email: string,
  otp: string,
  new_password: string
) => {
  const user = await User.findOne({ where: { email } });
  if (!user) throw new Error("Invalid request");
  if (!user.otp || user.otp !== otp) throw new Error("Invalid OTP");
  if (!user.otp_expiry || new Date() > user.otp_expiry)
    throw new Error("OTP expired");

  const hashed = await bcrypt.hash(new_password, 12);
  await user.update({ password: hashed, otp: null, otp_expiry: null });

  return { message: "Password reset successfully" };
};

// ─── Refresh Access Token ─────────────────────────────────────────────────────

export const refreshAccessToken = async (refresh_token: string) => {
  let payload: TokenPayload;
  try {
    payload = verifyRefreshToken(refresh_token);
  } catch {
    throw new Error("Invalid or expired refresh token");
  }

  const user = await User.findOne({
    where: { id: payload.id, refresh_token },
  });
  if (!user) throw new Error("Refresh token revoked");

  const newPayload: TokenPayload = { id: user.id, email: user.email, role: user.role };
  const access_token = generateAccessToken(newPayload);

  return { access_token };
};

// ─── Logout ───────────────────────────────────────────────────────────────────

export const logoutUser = async (userId: number) => {
  await User.update({ refresh_token: null }, { where: { id: userId } });
  return { message: "Logged out successfully" };
};
