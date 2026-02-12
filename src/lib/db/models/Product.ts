import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "../config";

interface ProductAttributes {
  id: number;
  name: string;
  sku: string;
  description: string | null;
  category_id: number;
  price: number;
  cost_price: number;
  stock_quantity: number;
  low_stock_threshold: number;
  image_url: string | null;
  is_active: boolean;
  created_at?: Date;
  updated_at?: Date;
  deleted_at?: Date | null;
}

interface ProductCreationAttributes extends Optional<ProductAttributes, "id" | "description" | "image_url" | "is_active" | "low_stock_threshold"> {}

class Product extends Model<ProductAttributes, ProductCreationAttributes> implements ProductAttributes {
  declare id: number;
  declare name: string;
  declare sku: string;
  declare description: string | null;
  declare category_id: number;
  declare price: number;
  declare cost_price: number;
  declare stock_quantity: number;
  declare low_stock_threshold: number;
  declare image_url: string | null;
  declare is_active: boolean;
  declare readonly created_at: Date;
  declare readonly updated_at: Date;
  declare readonly deleted_at: Date | null;
}

Product.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING(200),
      allowNull: false,
      validate: {
        notEmpty: { msg: "Product name is required" },
      },
    },
    sku: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: { name: "products_sku_unique", msg: "SKU already exists" },
      validate: {
        notEmpty: { msg: "SKU is required" },
      },
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    category_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "categories",
        key: "id",
      },
    },
    price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      validate: {
        min: { args: [0], msg: "Price must be a positive number" },
      },
    },
    cost_price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
      validate: {
        min: { args: [0], msg: "Cost price must be a positive number" },
      },
    },
    stock_quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      validate: {
        min: { args: [0], msg: "Stock quantity cannot be negative" },
      },
    },
    low_stock_threshold: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 10,
    },
    image_url: {
      type: DataTypes.STRING(500),
      allowNull: true,
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
  },
  {
    sequelize,
    tableName: "products",
    paranoid: true,
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
    deletedAt: "deleted_at",
    indexes: [
      { fields: ["sku"], unique: true },
      { fields: ["category_id"] },
      { fields: ["name"] },
      { fields: ["stock_quantity"] },
    ],
  }
);

export default Product;
