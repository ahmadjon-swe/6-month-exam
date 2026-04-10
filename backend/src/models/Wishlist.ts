import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "../utils/database";

interface WishlistAttributes {
  id: number;
  user_id: number;
  product_id: number;
  created_at: Date;
}

interface WishlistCreationAttributes
  extends Optional<WishlistAttributes, "id" | "created_at"> {}

class Wishlist
  extends Model<WishlistAttributes, WishlistCreationAttributes>
  implements WishlistAttributes
{
  public id!: number;
  public user_id!: number;
  public product_id!: number;
  public readonly created_at!: Date;
}

Wishlist.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    user_id: { type: DataTypes.INTEGER, allowNull: false },
    product_id: { type: DataTypes.INTEGER, allowNull: false },
    created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  },
  {
    sequelize,
    tableName: "wishlists",
    timestamps: false,
  }
);

export default Wishlist;
