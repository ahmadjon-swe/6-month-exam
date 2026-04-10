import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "../utils/database";
import { Role } from "../enums/roles.enum";

export interface BillingDetails {
  first_name?: string;
  company_name?: string;
  street_address?: string;
  apartment?: string;
  city?: string;
  phone?: string;
  email?: string;
}

interface UserAttributes {
  id: number;
  name: string;
  email: string;
  password: string | null;
  role: Role;
  is_active: boolean;
  otp: string | null;
  otp_expiry: Date | null;
  refresh_token: string | null;
  billing_details: BillingDetails | null;
  created_at: Date;
  updated_at: Date;
}

interface UserCreationAttributes
  extends Optional<
    UserAttributes,
    | "id"
    | "password"
    | "role"
    | "is_active"
    | "otp"
    | "otp_expiry"
    | "refresh_token"
    | "billing_details"
    | "created_at"
    | "updated_at"
  > {}

class User
  extends Model<UserAttributes, UserCreationAttributes>
  implements UserAttributes
{
  public id!: number;
  public name!: string;
  public email!: string;
  public password!: string | null;
  public role!: Role;
  public is_active!: boolean;
  public otp!: string | null;
  public otp_expiry!: Date | null;
  public refresh_token!: string | null;
  public billing_details!: BillingDetails | null;
  public readonly created_at!: Date;
  public readonly updated_at!: Date;
}

User.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    name: { type: DataTypes.STRING(100), allowNull: false },
    email: { type: DataTypes.STRING(150), allowNull: false, unique: true },
    password: { type: DataTypes.STRING(255), allowNull: true },
    role: {
      type: DataTypes.ENUM(...Object.values(Role)),
      defaultValue: Role.USER,
    },
    is_active: { type: DataTypes.BOOLEAN, defaultValue: false },
    otp: { type: DataTypes.STRING(6), allowNull: true },
    otp_expiry: { type: DataTypes.DATE, allowNull: true },
    refresh_token: { type: DataTypes.TEXT, allowNull: true },
    billing_details: { type: DataTypes.JSONB, allowNull: true },
    created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    updated_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  },
  {
    sequelize,
    tableName: "users",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

export default User;
