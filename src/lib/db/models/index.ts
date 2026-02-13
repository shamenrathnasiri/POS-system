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

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const syncDatabase = async (force = false) => {
  const maxRetries = 3;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      await sequelize.authenticate();
      console.log("✅ Database connection established successfully.");

      if (force) {
        await sequelize.sync({ force: true });
      } else {
        // Use sync without alter to avoid heavy introspection queries
        // that can cause ECONNRESET on some MySQL configurations.
        // For schema changes, use migrations instead.
        await sequelize.sync();
      }
      console.log("✅ Database synced successfully.");
      return; // Success — exit the retry loop
    } catch (error: unknown) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      const isConnectionError =
        errorMsg.includes("ECONNRESET") ||
        errorMsg.includes("ETIMEDOUT") ||
        errorMsg.includes("ECONNREFUSED") ||
        errorMsg.includes("PROTOCOL_CONNECTION_LOST");

      if (isConnectionError && attempt < maxRetries) {
        const waitTime = attempt * 2000;
        console.warn(
          `⚠️  Database connection lost (attempt ${attempt}/${maxRetries}). Retrying in ${waitTime / 1000}s...`
        );
        // Close stale connections before retrying
        try {
          await sequelize.close();
        } catch {
          // Ignore close errors
        }
        await delay(waitTime);
        continue;
      }

      console.error("❌ Unable to connect to the database:", error);
      throw error;
    }
  }
};

export { sequelize, User, Category, Product, Customer, Sale, SaleItem, syncDatabase };
export default { sequelize, User, Category, Product, Customer, Sale, SaleItem, syncDatabase };
