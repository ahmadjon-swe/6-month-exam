import bcrypt from "bcryptjs";
import { User } from "../models";
import { Role } from "../enums/roles.enum";

// ─── Get Profile ──────────────────────────────────────────────────────────────

export const getProfile = async (userId: number) => {
  const user = await User.findByPk(userId, {
    attributes: ["id", "name", "email", "role", "billing_details", "created_at"],
  });
  if (!user) throw new Error("User not found");
  return user;
};

// ─── Update Profile ───────────────────────────────────────────────────────────

export const updateProfile = async (
  userId: number,
  data: { name?: string; password?: string }
) => {
  const user = await User.findByPk(userId);
  if (!user) throw new Error("User not found");

  const update: any = {};
  if (data.name) update.name = data.name;
  if (data.password) update.password = await bcrypt.hash(data.password, 12);

  await user.update(update);
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
  };
};

// ─── Update Billing ───────────────────────────────────────────────────────────

export const updateBilling = async (userId: number, billing: object) => {
  const user = await User.findByPk(userId);
  if (!user) throw new Error("User not found");
  await user.update({ billing_details: billing });
  return user.billing_details;
};

// ─── Upgrade to Seller ────────────────────────────────────────────────────────

export const upgradeToSeller = async (userId: number) => {
  const user = await User.findByPk(userId);
  if (!user) throw new Error("User not found");
  if (user.role === Role.SELLER) throw new Error("Already a seller");
  if (user.role === Role.ADMIN)
    throw new Error("Admins cannot downgrade to seller");
  await user.update({ role: Role.SELLER });
  return { message: "Upgraded to seller successfully", role: Role.SELLER };
};

// ─── Admin: Set Role ──────────────────────────────────────────────────────────

export const setUserRole = async (
  adminId: number,
  targetUserId: number,
  role: Role
) => {
  if (adminId === targetUserId) throw new Error("Cannot change your own role");
  const user = await User.findByPk(targetUserId);
  if (!user) throw new Error("User not found");
  await user.update({ role });
  return { message: `Role updated to ${role}`, user_id: targetUserId, role };
};

// ─── Admin: List Users ────────────────────────────────────────────────────────

export const listUsers = async (page = 1, limit = 20, search?: string) => {
  const where: any = {};
  if (search) {
    const { Op } = await import("sequelize");
    where[Op.or] = [
      { name: { [Op.iLike]: `%${search}%` } },
      { email: { [Op.iLike]: `%${search}%` } },
    ];
  }

  const { rows, count } = await User.findAndCountAll({
    where,
    attributes: ["id", "name", "email", "role", "is_active", "created_at"],
    order: [["created_at", "DESC"]],
    limit,
    offset: (page - 1) * limit,
  });

  return {
    data: rows,
    pagination: { total: count, page, limit, total_pages: Math.ceil(count / limit) },
  };
};
