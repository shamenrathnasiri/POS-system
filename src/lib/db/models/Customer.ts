import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "../config";

interface CustomerAttributes {
  id: number;
  name: string;
  email: string | null;
  phone: string | null;
  address: string | null;
  loyalty_points: number;
  created_at?: Date;
  updated_at?: Date;
  deleted_at?: Date | null;
}

interface CustomerCreationAttributes extends Optional<CustomerAttributes, "id" | "email" | "phone" | "address" | "loyalty_points"> {}

class Customer extends Model<CustomerAttributes, CustomerCreationAttributes> implements CustomerAttributes {
  public id!: number;
  public name!: string;
  public email!: string | null;
  public phone!: string | null;
  public address!: string | null;
  public loyalty_points!: number;
  public readonly created_at!: Date;
  public readonly updated_at!: Date;
  public readonly deleted_at!: Date | null;
}

Customer.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
      validate: {
        notEmpty: { msg: "Customer name is required" },
      },
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: true,
      validate: {
        isEmail: { msg: "Must be a valid email" },
      },
    },
    phone: {
      type: DataTypes.STRING(20),
      allowNull: true,
    },
    address: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    loyalty_points: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      validate: {
        min: { args: [0], msg: "Loyalty points cannot be negative" },
      },
    },
  },
  {
    sequelize,
    tableName: "customers",
    paranoid: true,
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
    deletedAt: "deleted_at",
    indexes: [{ fields: ["name"] }, { fields: ["phone"] }, { fields: ["email"] }],
  }
);

export default Customer;
