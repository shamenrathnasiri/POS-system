import { Sequelize } from "sequelize";
import path from "path";

const sqliteStorage = process.env.DB_STORAGE || path.resolve(process.cwd(), "Database", "abcpos.db");

const sequelize = new Sequelize({
  dialect: "sqlite",
  storage: sqliteStorage,
  logging: process.env.NODE_ENV === "development" ? console.log : false,
  define: {
    timestamps: true,
    paranoid: true,
    underscored: true,
  },
});

export default sequelize;
