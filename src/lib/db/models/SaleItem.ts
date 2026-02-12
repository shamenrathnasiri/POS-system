import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "../config";

interface SaleItemAttributes {
  id: number;
  sale_id: number;
  product_id: number;
  product_name: string;
  product_sku: string;
  quantity: number;
  unit_price: number;
  discount: number;
  total: number;
  created_at?: Date;
  updated_at?: Date;
  deleted_at?: Date | null;
}

interface SaleItemCreationAttributes extends Optional<SaleItemAttributes, "id" | "discount"> {}

class SaleItem extends Model<SaleItemAttributes, SaleItemCreationAttributes> implements SaleItemAttributes {
  declare id: number;
  declare sale_id: number;
  declare product_id: number;
  declare product_name: string;
  declare product_sku: string;
  declare quantity: number;
  declare unit_price: number;
  declare discount: number;
  declare total: number;
  declare readonly created_at: Date;
  declare readonly updated_at: Date;
  declare readonly deleted_at: Date | null;
}

SaleItem.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    sale_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: "sales", key: "id" },
    },
    product_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: "products", key: "id" },
    },
    product_name: {
      type: DataTypes.STRING(200),
      allowNull: false,
    },
    product_sku: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: { args: [1], msg: "Quantity must be at least 1" },
      },
    },
    unit_price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    discount: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0,
    },
    total: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: "sale_items",
    paranoid: true,
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
    deletedAt: "deleted_at",
    indexes: [{ fields: ["sale_id"] }, { fields: ["product_id"] }],
  }
);

export default SaleItem;
