import sequelize from "../config";
import User from "./User";
import Category from "./Category";
import Product from "./Product";
import Customer from "./Customer";
import Sale from "./Sale";
import SaleItem from "./SaleItem";

// ==========================================
// Define Associations
// ==========================================

// Category -> Products (One to Many)
Category.hasMany(Product, {
  foreignKey: "category_id",
  as: "products",
});
Product.belongsTo(Category, {
  foreignKey: "category_id",
  as: "category",
});

// User -> Sales (One to Many)
User.hasMany(Sale, {
  foreignKey: "user_id",
  as: "sales",
});
Sale.belongsTo(User, {
  foreignKey: "user_id",
  as: "user",
});

// Customer -> Sales (One to Many)
Customer.hasMany(Sale, {
  foreignKey: "customer_id",
  as: "sales",
});
Sale.belongsTo(Customer, {
  foreignKey: "customer_id",
  as: "customer",
});

// Sale -> SaleItems (One to Many)
Sale.hasMany(SaleItem, {
  foreignKey: "sale_id",
  as: "items",
});
SaleItem.belongsTo(Sale, {
  foreignKey: "sale_id",
  as: "sale",
});

// Product -> SaleItems (One to Many)
Product.hasMany(SaleItem, {
  foreignKey: "product_id",
  as: "sale_items",
});
SaleItem.belongsTo(Product, {
  foreignKey: "product_id",
  as: "product",
});

// ==========================================
// Sync Database
// ==========================================
const syncDatabase = async () => {
  try {
    await sequelize.authenticate();
    console.log("✅ Database connection established successfully.");
    await sequelize.sync({ alter: process.env.NODE_ENV === "development" });
    console.log("✅ Database synced successfully.");
  } catch (error) {
    console.error("❌ Unable to connect to the database:", error);
    throw error;
  }
};

export { sequelize, User, Category, Product, Customer, Sale, SaleItem, syncDatabase };
export default { sequelize, User, Category, Product, Customer, Sale, SaleItem, syncDatabase };
