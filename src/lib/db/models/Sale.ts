import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "../config";

interface SaleAttributes {
  id: number;
  invoice_number: string;
  user_id: number;
  customer_id: number | null;
  subtotal: number;
  discount_amount: number;
  discount_type: "percentage" | "fixed" | null;
  discount_value: number;
  tax_rate: number;
  tax_amount: number;
  grand_total: number;
  amount_paid: number;
  change_amount: number;
  payment_method: "cash" | "card" | "mobile";
  status: "completed" | "refunded" | "cancelled";
  notes: string | null;
  created_at?: Date;
  updated_at?: Date;
  deleted_at?: Date | null;
}

interface SaleCreationAttributes
  extends Optional<
    SaleAttributes,
    "id" | "customer_id" | "discount_amount" | "discount_type" | "discount_value" | "change_amount" | "notes" | "status"
  > {}

class Sale extends Model<SaleAttributes, SaleCreationAttributes> implements SaleAttributes {
  public id!: number;
  public invoice_number!: string;
  public user_id!: number;
  public customer_id!: number | null;
  public subtotal!: number;
  public discount_amount!: number;
  public discount_type!: "percentage" | "fixed" | null;
  public discount_value!: number;
  public tax_rate!: number;
  public tax_amount!: number;
  public grand_total!: number;
  public amount_paid!: number;
  public change_amount!: number;
  public payment_method!: "cash" | "card" | "mobile";
  public status!: "completed" | "refunded" | "cancelled";
  public notes!: string | null;
  public readonly created_at!: Date;
  public readonly updated_at!: Date;
  public readonly deleted_at!: Date | null;
}

Sale.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    invoice_number: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: { name: "sales_invoice_unique", msg: "Invoice number already exists" },
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: "users", key: "id" },
    },
    customer_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: { model: "customers", key: "id" },
    },
    subtotal: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
    },
    discount_amount: {
      type: DataTypes.DECIMAL(12, 2),
      defaultValue: 0,
    },
    discount_type: {
      type: DataTypes.ENUM("percentage", "fixed"),
      allowNull: true,
    },
    discount_value: {
      type: DataTypes.DECIMAL(12, 2),
      defaultValue: 0,
    },
    tax_rate: {
      type: DataTypes.DECIMAL(5, 2),
      defaultValue: 0,
    },
    tax_amount: {
      type: DataTypes.DECIMAL(12, 2),
      defaultValue: 0,
    },
    grand_total: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
    },
    amount_paid: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
    },
    change_amount: {
      type: DataTypes.DECIMAL(12, 2),
      defaultValue: 0,
    },
    payment_method: {
      type: DataTypes.ENUM("cash", "card", "mobile"),
      defaultValue: "cash",
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM("completed", "refunded", "cancelled"),
      defaultValue: "completed",
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: "sales",
    paranoid: true,
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
    deletedAt: "deleted_at",
    indexes: [
      { fields: ["invoice_number"], unique: true },
      { fields: ["user_id"] },
      { fields: ["customer_id"] },
      { fields: ["created_at"] },
      { fields: ["status"] },
    ],
  }
);

export default Sale;
