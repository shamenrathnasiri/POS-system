import { Sequelize } from "sequelize";
import { syncDatabase } from "./models";

let initialized = false;

/**
 * Automatically creates the MySQL database if it doesn't exist,
 * then syncs all Sequelize models (tables).
 */
export async function initializeDatabase() {
  if (initialized) return;

  const dbName = process.env.DB_NAME || "pos_system";
  const dbUser = process.env.DB_USER || "root";
  const dbPassword = process.env.DB_PASSWORD || "";
  const dbHost = process.env.DB_HOST || "localhost";
  const dbPort = parseInt(process.env.DB_PORT || "3306");

  // Step 1: Connect WITHOUT a database to create it if missing
  const tempConnection = new Sequelize("", dbUser, dbPassword, {
    host: dbHost,
    port: dbPort,
    dialect: "mysql",
    logging: false,
  });

  try {
    await tempConnection.query(
      `CREATE DATABASE IF NOT EXISTS \`${dbName}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`
    );
    console.log(`✅ Database "${dbName}" is ready.`);
  } catch (error) {
    console.error(`❌ Failed to create database "${dbName}":`, error);
    throw error;
  } finally {
    await tempConnection.close();
  }

  // Step 2: Sync all models/tables
  await syncDatabase();
  initialized = true;
}
