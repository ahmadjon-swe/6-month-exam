import { Op, WhereOptions } from "sequelize";
import { Product, User } from "../models";
import { ProductVariant } from "../models/Product";
import { Role } from "../enums/roles.enum";
import { ProductCategory } from "../enums/productCategory.enum";

interface ProductQuery {
  page?: number;
  limit?: number;
  search?: string;
  category?: ProductCategory;
  min_price?: number;
  max_price?: number;
  sort?: "price_asc" | "price_desc" | "newest" | "most_sold";
}

const resolveEffectivePrice = (product: Product, variantIndex = 0): number => {
  const variant = product.variants?.[variantIndex];
  const base = Number(product.base_price);
  const price = variant?.price ? Number(variant.price) : base;
  const disc = product.discount_percentage ? Number(product.discount_percentage) : 0;
  const isDiscountActive =
    disc > 0 &&
    (!product.discount_expiry || new Date() < new Date(product.discount_expiry));
  return isDiscountActive ? price * (1 - disc / 100) : price;
};

// ─── Create ───────────────────────────────────────────────────────────────────

export const createProduct = async (
  data: {
    name: string;
    description: string;
    category: ProductCategory;
    base_price: number;
    discount_percentage?: number | null;
    discount_expiry?: Date | null;
    variants: ProductVariant[];
  },
  seller_id: number,
  imageFiles: Express.Multer.File[]
) => {
  const images = imageFiles.map((f) => `/uploads/${f.filename}`);
  const product = await Product.create({ ...data, seller_id, images });
  return product;
};

// ─── Get All (paginated, filtered) ───────────────────────────────────────────

export const getProducts = async (query: ProductQuery) => {
  const {
    page = 1,
    limit = 20,
    search,
    category,
    min_price,
    max_price,
    sort = "newest",
  } = query;

  const where: WhereOptions<any> = { is_active: true };

  if (search) {
    (where as any)[Op.or as any] = [
      { name: { [Op.iLike]: `%${search}%` } },
      { description: { [Op.iLike]: `%${search}%` } },
    ];
  }
  if (category) (where as any).category = category;
  if (min_price !== undefined) (where as any).base_price = { [Op.gte]: min_price };
  if (max_price !== undefined) {
    (where as any).base_price = {
      ...((where as any).base_price || {}),
      [Op.lte]: max_price,
    };
  }

  const orderMap: Record<string, [string, string]> = {
    price_asc: ["base_price", "ASC"],
    price_desc: ["base_price", "DESC"],
    newest: ["created_at", "DESC"],
    most_sold: ["total_sold", "DESC"],
  };
  const order = [orderMap[sort]] as any;

  const offset = (page - 1) * limit;
  const { rows, count } = await Product.findAndCountAll({
    where,
    order,
    limit,
    offset,
    include: [{ model: User, as: "seller", attributes: ["id", "name"] }],
  });

  return {
    data: rows,
    pagination: {
      total: count,
      page,
      limit,
      total_pages: Math.ceil(count / limit),
    },
  };
};

// ─── Get One + Related ────────────────────────────────────────────────────────

export const getProductById = async (id: number) => {
  const product = await Product.findOne({
    where: { id, is_active: true },
    include: [{ model: User, as: "seller", attributes: ["id", "name"] }],
  });
  if (!product) throw new Error("Product not found");

  const related = await Product.findAll({
    where: { category: product.category, id: { [Op.ne]: id }, is_active: true },
    limit: 8,
    order: [["total_sold", "DESC"]],
    include: [{ model: User, as: "seller", attributes: ["id", "name"] }],
  });

  return { product, related };
};

// ─── Update ───────────────────────────────────────────────────────────────────

export const updateProduct = async (
  id: number,
  userId: number,
  userRole: Role,
  data: Partial<{
    name: string;
    description: string;
    category: ProductCategory;
    base_price: number;
    discount_percentage: number | null;
    discount_expiry: Date | null;
    variants?: ProductVariant[];
    is_active: boolean;
  }>,
  imageFiles?: Express.Multer.File[]
) => {
  const product = await Product.findByPk(id);
  if (!product) throw new Error("Product not found");
  if (product.seller_id !== userId && userRole !== Role.ADMIN)
    throw new Error("Forbidden");

  const updateData: any = { ...data };
  if (imageFiles && imageFiles.length > 0) {
    updateData.images = imageFiles.map((f) => `/uploads/${f.filename}`);
  }

  await product.update(updateData);
  return product;
};

// ─── Delete ───────────────────────────────────────────────────────────────────

export const deleteProduct = async (
  id: number,
  userId: number,
  userRole: Role
) => {
  const product = await Product.findByPk(id);
  if (!product) throw new Error("Product not found");
  if (product.seller_id !== userId && userRole !== Role.ADMIN)
    throw new Error("Forbidden");

  await product.update({ is_active: false });
  return { message: "Product deleted" };
};

// ─── Most Sold ────────────────────────────────────────────────────────────────

export const getMostSold = async (limit = 10) => {
  return Product.findAll({
    where: { is_active: true },
    order: [["total_sold", "DESC"]],
    limit,
    include: [{ model: User, as: "seller", attributes: ["id", "name"] }],
  });
};

// ─── Discounted ───────────────────────────────────────────────────────────────

export const getDiscountedProducts = async (page = 1, limit = 20) => {
  const where: WhereOptions<any> = {
    is_active: true,
    discount_percentage: { [Op.gt]: 0 },
    [Op.or]: [
      { discount_expiry: null },
      { discount_expiry: { [Op.gt]: new Date() } },
    ],
  };

  const { rows, count } = await Product.findAndCountAll({
    where,
    order: [["discount_percentage", "DESC"]],
    limit,
    offset: (page - 1) * limit,
    include: [{ model: User, as: "seller", attributes: ["id", "name"] }],
  });

  return {
    data: rows,
    pagination: {
      total: count,
      page,
      limit,
      total_pages: Math.ceil(count / limit),
    },
  };
};
