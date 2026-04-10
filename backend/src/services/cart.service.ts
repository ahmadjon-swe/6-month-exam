import { Cart, Product } from "../models";

// ─── Get Cart ─────────────────────────────────────────────────────────────────

export const getCart = async (userId: number) => {
  const items = await Cart.findAll({
    where: { user_id: userId },
    include: [
      {
        model: Product,
        as: "product",
        attributes: [
          "id", "name", "images", "base_price", "variants",
          "discount_percentage", "discount_expiry", "is_active",
        ],
      },
    ],
  });

  let total_items = 0;
  let total_price = 0;

  const enriched = items.map((item) => {
    const product = (item as any).product as Product;
    const variant = product?.variants?.[item.variant_index];

    const basePrice = variant?.price
      ? Number(variant.price)
      : Number(product?.base_price ?? 0);

    const disc = product?.discount_percentage
      ? Number(product.discount_percentage)
      : 0;
    const isDiscActive =
      disc > 0 &&
      (!product?.discount_expiry ||
        new Date() < new Date(product.discount_expiry));

    const unitPrice = isDiscActive ? basePrice * (1 - disc / 100) : basePrice;
    const lineTotal = unitPrice * item.quantity;

    total_items += item.quantity;
    total_price += lineTotal;

    return {
      ...item.toJSON(),
      unit_price: +unitPrice.toFixed(2),
      line_total: +lineTotal.toFixed(2),
      variant_label: variant
        ? [variant.color, variant.size].filter(Boolean).join(" / ")
        : null,
    };
  });

  return {
    items: enriched,
    summary: {
      total_items,
      total_price: +total_price.toFixed(2),
    },
  };
};

// ─── Add to Cart ──────────────────────────────────────────────────────────────

export const addToCart = async (
  userId: number,
  productId: number,
  variantIndex: number,
  quantity: number
) => {
  const product = await Product.findOne({
    where: { id: productId, is_active: true },
  });
  if (!product) throw new Error("Product not found");

  const variant = product.variants?.[variantIndex];
  if (product.variants.length > 0 && !variant)
    throw new Error("Invalid variant");

  const stock = variant?.stock ?? 0;
  if (stock < quantity) throw new Error(`Only ${stock} items in stock`);

  const existing = await Cart.findOne({
    where: { user_id: userId, product_id: productId, variant_index: variantIndex },
  });

  if (existing) {
    const newQty = existing.quantity + quantity;
    if (stock < newQty) throw new Error(`Only ${stock} items in stock`);
    await existing.update({ quantity: newQty });
    return existing;
  }

  return Cart.create({
    user_id: userId,
    product_id: productId,
    variant_index: variantIndex,
    quantity,
  });
};

// ─── Update Quantity ──────────────────────────────────────────────────────────

export const updateCartItem = async (
  userId: number,
  cartItemId: number,
  quantity: number
) => {
  const item = await Cart.findOne({
    where: { id: cartItemId, user_id: userId },
    include: [{ model: Product, as: "product" }],
  });
  if (!item) throw new Error("Cart item not found");

  const product = (item as any).product as Product;
  const variant = product?.variants?.[item.variant_index];
  const stock = variant?.stock ?? 0;
  if (stock < quantity) throw new Error(`Only ${stock} items in stock`);

  await item.update({ quantity });
  return item;
};

// ─── Remove Item ──────────────────────────────────────────────────────────────

export const removeCartItem = async (userId: number, cartItemId: number) => {
  const item = await Cart.findOne({
    where: { id: cartItemId, user_id: userId },
  });
  if (!item) throw new Error("Cart item not found");
  await item.destroy();
  return { message: "Item removed from cart" };
};

// ─── Clear Cart ───────────────────────────────────────────────────────────────

export const clearCart = async (userId: number) => {
  await Cart.destroy({ where: { user_id: userId } });
  return { message: "Cart cleared" };
};
