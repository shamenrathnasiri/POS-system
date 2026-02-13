import { Sequelize } from "sequelize";

const sequelize = new Sequelize(
  process.env.DB_NAME || "pos_system",
  process.env.DB_USER || "root",
  process.env.DB_PASSWORD || "",
  {
    host: process.env.DB_HOST || "localhost",
    port: parseInt(process.env.DB_PORT || "3306"),
    dialect: "mysql",
    logging: process.env.NODE_ENV === "development" ? console.log : false,
    dialectOptions: {
      connectTimeout: 60000,
      // Keep connection alive
      flags: ["FOUND_ROWS"],
    },
    pool: {
      max: 5,
      min: 0,
      acquire: 60000,
      idle: 10000,
      evict: 1000,
    },
    retry: {
      max: 5,
      backoffBase: 1000,
      backoffExponent: 1.5,
    },
    define: {
      timestamps: true,
      paranoid: true, // Enable soft deletes globally
      underscored: true,
    },
  },
);

export default sequelize;
