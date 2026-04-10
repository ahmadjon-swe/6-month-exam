import sequelize from "../utils/database";
import { Cart, Product, User, Order, OrderItem } from "../models";
import { PaymentType, OrderStatus } from "../enums/orderStatus.enum";
import { Role } from "../enums/roles.enum";
import { Op } from "sequelize";

interface BillingInput {
  first_name: string;
  company_name?: string;
  street_address: string;
  apartment?: string;
  city: string;
  phone: string;
  email?: string;
}

// ─── Create Order from Cart ───────────────────────────────────────────────────

export const createOrder = async (
  userId: number,
  payment_type: PaymentType,
  billing: BillingInput,
  notes?: string
) => {
  const cartItems = await Cart.findAll({
    where: { user_id: userId },
    include: [{ model: Product, as: "product" }],
  });

  if (!cartItems.length) throw new Error("Cart is empty");

  const t = await sequelize.transaction();
  try {
    let subtotal = 0;
    const itemsData: Omit<InstanceType<typeof OrderItem>, "id" | "order_id">[] = [];

    for (const item of cartItems) {
      const product = (item as any).product as Product;
      if (!product || !product.is_active)
        throw new Error(`Product "${product?.name ?? item.product_id}" is unavailable`);

      const variant = product.variants?.[item.variant_index];
      const stock = variant?.stock ?? 0;
      if (stock < item.quantity)
        throw new Error(`Not enough stock for "${product.name}"`);

      const basePrice = variant?.price
        ? Number(variant.price)
        : Number(product.base_price);

      const disc = product.discount_percentage
        ? Number(product.discount_percentage)
        : 0;
      const isDiscActive =
        disc > 0 &&
        (!product.discount_expiry || new Date() < new Date(product.discount_expiry));

      const unitPrice = isDiscActive ? basePrice * (1 - disc / 100) : basePrice;
      const lineTotal = +(unitPrice * item.quantity).toFixed(2);
      subtotal += lineTotal;

      // Decrement stock
      if (variant) {
        const updatedVariants = [...product.variants];
        updatedVariants[item.variant_index] = {
          ...variant,
          stock: stock - item.quantity,
        };
        await product.update(
          {
            variants: updatedVariants,
            total_sold: product.total_sold + item.quantity,
          },
          { transaction: t }
        );
      }

      const seller = await User.findByPk(product.seller_id, {
        attributes: ["id", "name"],
      });

      itemsData.push({
        product_id: product.id,
        product_name: product.name,
        variant_index: item.variant_index,
        variant_label: variant
          ? [variant.color, variant.size].filter(Boolean).join(" / ") || null
          : null,
        quantity: item.quantity,
        base_price: Number(product.base_price),
        discount_percentage: disc || null,
        unit_price: +unitPrice.toFixed(2),
        line_total: lineTotal,
        seller_id: product.seller_id,
        seller_name: seller?.name ?? "Unknown",
      } as any);
    }

    const order = await Order.create(
      {
        id: undefined as any, // UUID auto
        user_id: userId,
        payment_type,
        status: OrderStatus.PENDING,
        subtotal: +subtotal.toFixed(2),
        total_price: +subtotal.toFixed(2),
        billing_snapshot: billing,
        notes: notes ?? null,
      },
      { transaction: t }
    );

    await OrderItem.bulkCreate(
      itemsData.map((i: any) => ({ ...i, order_id: order.id })),
      { transaction: t }
    );

    // Clear cart
    await Cart.destroy({ where: { user_id: userId }, transaction: t });

    // Save billing to user profile if not set
    const user = await User.findByPk(userId);
    if (user && !user.billing_details) {
      await user.update({ billing_details: billing }, { transaction: t });
    }

    await t.commit();

    return getOrderById(order.id, userId, Role.USER);
  } catch (err) {
    await t.rollback();
    throw err;
  }
};

// ─── Get Single Order ─────────────────────────────────────────────────────────

export const getOrderById = async (
  orderId: string,
  userId: number,
  userRole: Role
) => {
  const where: any = { id: orderId };
  if (userRole !== Role.ADMIN) where.user_id = userId;

  const order = await Order.findOne({
    where,
    include: [{ model: OrderItem, as: "items" }],
  });
  if (!order) throw new Error("Order not found");
  return order;
};

// ─── My Orders ────────────────────────────────────────────────────────────────

export const getMyOrders = async (
  userId: number,
  status?: OrderStatus,
  page = 1,
  limit = 20
) => {
  const where: any = { user_id: userId };
  if (status) where.status = status;

  const { rows, count } = await Order.findAndCountAll({
    where,
    include: [{ model: OrderItem, as: "items" }],
    order: [["created_at", "DESC"]],
    limit,
    offset: (page - 1) * limit,
  });

  return {
    data: rows,
    pagination: { total: count, page, limit, total_pages: Math.ceil(count / limit) },
  };
};

// ─── Admin: All Orders ────────────────────────────────────────────────────────

export const getAllOrders = async (
  status?: OrderStatus,
  page = 1,
  limit = 20
) => {
  const where: any = {};
  if (status) where.status = status;

  const { rows, count } = await Order.findAndCountAll({
    where,
    include: [
      { model: OrderItem, as: "items" },
      { model: User, as: "user", attributes: ["id", "name", "email"] },
    ],
    order: [["created_at", "DESC"]],
    limit,
    offset: (page - 1) * limit,
  });

  return {
    data: rows,
    pagination: { total: count, page, limit, total_pages: Math.ceil(count / limit) },
  };
};

// ─── Update Order Status ──────────────────────────────────────────────────────

export const updateOrderStatus = async (
  orderId: string,
  status: OrderStatus,
  userId: number,
  userRole: Role
) => {
  const where: any = { id: orderId };
  if (userRole !== Role.ADMIN) where.user_id = userId;

  const order = await Order.findOne({ where });
  if (!order) throw new Error("Order not found");

  // Users can only cancel their own pending orders
  if (userRole !== Role.ADMIN) {
    if (status !== OrderStatus.CANCELLED)
      throw new Error("You can only cancel orders");
    if (order.status !== OrderStatus.PENDING)
      throw new Error("Only pending orders can be cancelled");
  }

  await order.update({ status });
  return order;
};
