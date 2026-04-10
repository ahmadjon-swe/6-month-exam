import { Wishlist, Cart, Product } from "../models";

// ─── Get Wishlist ─────────────────────────────────────────────────────────────

export const getWishlist = async (userId: number) => {
  return Wishlist.findAll({
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
};

// ─── Toggle (add / remove) ────────────────────────────────────────────────────

export const toggleWishlist = async (userId: number, productId: number) => {
  const product = await Product.findOne({
    where: { id: productId, is_active: true },
  });
  if (!product) throw new Error("Product not found");

  const existing = await Wishlist.findOne({
    where: { user_id: userId, product_id: productId },
  });

  if (existing) {
    await existing.destroy();
    return { action: "removed", message: "Removed from wishlist" };
  }

  await Wishlist.create({ user_id: userId, product_id: productId });
  return { action: "added", message: "Added to wishlist" };
};

// ─── Move to Cart ─────────────────────────────────────────────────────────────

export const moveToCart = async (
  userId: number,
  productId: number,
  variantIndex = 0
) => {
  const wishlistItem = await Wishlist.findOne({
    where: { user_id: userId, product_id: productId },
  });
  if (!wishlistItem) throw new Error("Item not in wishlist");

  const product = await Product.findOne({
    where: { id: productId, is_active: true },
  });
  if (!product) throw new Error("Product not found");

  const variant = product.variants?.[variantIndex];
  const stock = variant?.stock ?? 0;
  if (stock < 1) throw new Error("Product out of stock");

  const existing = await Cart.findOne({
    where: { user_id: userId, product_id: productId, variant_index: variantIndex },
  });

  if (existing) {
    const newQty = existing.quantity + 1;
    if (stock < newQty) throw new Error(`Only ${stock} items in stock`);
    await existing.update({ quantity: newQty });
  } else {
    await Cart.create({ user_id: userId, product_id: productId, variant_index: variantIndex, quantity: 1 });
  }

  await wishlistItem.destroy();
  return { message: "Moved to cart" };
};
