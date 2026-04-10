import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "../utils/database";
import { OrderStatus, PaymentType } from "../enums/orderStatus.enum";

// ─── Order (parent) ───────────────────────────────────────────────────────────

interface OrderAttributes {
  id: string;
  user_id: number;
  payment_type: PaymentType;
  status: OrderStatus;
  subtotal: number;
  total_price: number;
  billing_snapshot: {
    first_name: string;
    company_name?: string;
    street_address: string;
    apartment?: string;
    city: string;
    phone: string;
    email?: string;
  };
  notes: string | null;
  created_at: Date;
  updated_at: Date;
}

interface OrderCreationAttributes
  extends Optional<
    OrderAttributes,
    "status" | "notes" | "created_at" | "updated_at"
  > {}

export class Order
  extends Model<OrderAttributes, OrderCreationAttributes>
  implements OrderAttributes
{
  public id!: string;
  public user_id!: number;
  public payment_type!: PaymentType;
  public status!: OrderStatus;
  public subtotal!: number;
  public total_price!: number;
  public billing_snapshot!: OrderAttributes["billing_snapshot"];
  public notes!: string | null;
  public readonly created_at!: Date;
  public readonly updated_at!: Date;
}

Order.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    user_id: { type: DataTypes.INTEGER, allowNull: false },
    payment_type: {
      type: DataTypes.ENUM(...Object.values(PaymentType)),
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM(...Object.values(OrderStatus)),
      defaultValue: OrderStatus.PENDING,
    },
    subtotal: { type: DataTypes.DECIMAL(12, 2), allowNull: false },
    total_price: { type: DataTypes.DECIMAL(12, 2), allowNull: false },
    billing_snapshot: { type: DataTypes.JSONB, allowNull: false },
    notes: { type: DataTypes.TEXT, allowNull: true },
    created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    updated_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  },
  {
    sequelize,
    tableName: "orders",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

// ─── OrderItem (child) ────────────────────────────────────────────────────────

interface OrderItemAttributes {
  id: number;
  order_id: string;
  product_id: number;
  product_name: string;
  variant_index: number;
  variant_label: string | null;
  quantity: number;
  base_price: number;
  discount_percentage: number | null;
  unit_price: number;
  line_total: number;
  seller_id: number;
  seller_name: string;
}

interface OrderItemCreationAttributes
  extends Optional<
    OrderItemAttributes,
    "id" | "variant_label" | "discount_percentage"
  > {}

export class OrderItem
  extends Model<OrderItemAttributes, OrderItemCreationAttributes>
  implements OrderItemAttributes
{
  public id!: number;
  public order_id!: string;
  public product_id!: number;
  public product_name!: string;
  public variant_index!: number;
  public variant_label!: string | null;
  public quantity!: number;
  public base_price!: number;
  public discount_percentage!: number | null;
  public unit_price!: number;
  public line_total!: number;
  public seller_id!: number;
  public seller_name!: string;
}

OrderItem.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    order_id: { type: DataTypes.UUID, allowNull: false },
    product_id: { type: DataTypes.INTEGER, allowNull: false },
    product_name: { type: DataTypes.STRING(255), allowNull: false },
    variant_index: { type: DataTypes.INTEGER, defaultValue: 0 },
    variant_label: { type: DataTypes.STRING(100), allowNull: true },
    quantity: { type: DataTypes.INTEGER, allowNull: false },
    base_price: { type: DataTypes.DECIMAL(12, 2), allowNull: false },
    discount_percentage: { type: DataTypes.DECIMAL(5, 2), allowNull: true },
    unit_price: { type: DataTypes.DECIMAL(12, 2), allowNull: false },
    line_total: { type: DataTypes.DECIMAL(12, 2), allowNull: false },
    seller_id: { type: DataTypes.INTEGER, allowNull: false },
    seller_name: { type: DataTypes.STRING(100), allowNull: false },
  },
  {
    sequelize,
    tableName: "order_items",
    timestamps: false,
  }
);

Order.hasMany(OrderItem, { foreignKey: "order_id", as: "items" });
OrderItem.belongsTo(Order, { foreignKey: "order_id", as: "order" });
