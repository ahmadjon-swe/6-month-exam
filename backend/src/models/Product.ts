import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "../utils/database";
import { ProductCategory } from "../enums/productCategory.enum";

export interface ProductVariant {
  color?: string;
  size?: string;
  price?: number;
  stock: number;
  attributes?: Record<string, string>;
}

interface ProductAttributes {
  id: number;
  name: string;
  description: string;
  category: ProductCategory;
  seller_id: number;
  images: string[];
  variants: ProductVariant[];
  base_price: number;
  total_sold: number;
  discount_percentage: number | null;
  discount_expiry: Date | null;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

interface ProductCreationAttributes
  extends Optional<
    ProductAttributes,
    | "id"
    | "total_sold"
    | "discount_percentage"
    | "discount_expiry"
    | "is_active"
    | "created_at"
    | "updated_at"
  > {}

class Product
  extends Model<ProductAttributes, ProductCreationAttributes>
  implements ProductAttributes
{
  public id!: number;
  public name!: string;
  public description!: string;
  public category!: ProductCategory;
  public seller_id!: number;
  public images!: string[];
  public variants!: ProductVariant[];
  public base_price!: number;
  public total_sold!: number;
  public discount_percentage!: number | null;
  public discount_expiry!: Date | null;
  public is_active!: boolean;
  public readonly created_at!: Date;
  public readonly updated_at!: Date;
}

Product.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    name: { type: DataTypes.STRING(255), allowNull: false },
    description: { type: DataTypes.TEXT, allowNull: false },
    category: {
      type: DataTypes.ENUM(...Object.values(ProductCategory)),
      allowNull: false,
    },
    seller_id: { type: DataTypes.INTEGER, allowNull: false },
    images: { type: DataTypes.JSONB, defaultValue: [] },
    variants: { type: DataTypes.JSONB, defaultValue: [] },
    base_price: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
    total_sold: { type: DataTypes.INTEGER, defaultValue: 0 },
    discount_percentage: { type: DataTypes.DECIMAL(5, 2), allowNull: true },
    discount_expiry: { type: DataTypes.DATE, allowNull: true },
    is_active: { type: DataTypes.BOOLEAN, defaultValue: true },
    created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    updated_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  },
  {
    sequelize,
    tableName: "products",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

export default Product;
