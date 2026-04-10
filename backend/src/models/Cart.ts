import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "../utils/database";

interface CartAttributes {
  id: number;
  user_id: number;
  product_id: number;
  quantity: number;
  variant_index: number;
  created_at: Date;
  updated_at: Date;
}

interface CartCreationAttributes
  extends Optional<
    CartAttributes,
    "id" | "variant_index" | "created_at" | "updated_at"
  > {}

class Cart
  extends Model<CartAttributes, CartCreationAttributes>
  implements CartAttributes
{
  public id!: number;
  public user_id!: number;
  public product_id!: number;
  public quantity!: number;
  public variant_index!: number;
  public readonly created_at!: Date;
  public readonly updated_at!: Date;
}

Cart.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    user_id: { type: DataTypes.INTEGER, allowNull: false },
    product_id: { type: DataTypes.INTEGER, allowNull: false },
    quantity: { type: DataTypes.INTEGER, defaultValue: 1 },
    variant_index: { type: DataTypes.INTEGER, defaultValue: 0 },
    created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    updated_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  },
  {
    sequelize,
    tableName: "carts",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

export default Cart;
