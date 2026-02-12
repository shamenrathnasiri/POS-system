import { Sequelize } from "sequelize";
import { syncDatabase } from "./models";
import fs from "fs";
import path from "path";

let initialized = false;

/**
 * Automatically creates the MySQL database if it doesn't exist,
 * then syncs all Sequelize models (tables).
 * Handles InnoDB tablespace corruption by cleaning orphaned files
 * and recreating the database.
 */
export async function initializeDatabase() {
  if (initialized) return;

  const dbName = process.env.DB_NAME || "pos_system";
  const dbUser = process.env.DB_USER || "root";
  const dbPassword = process.env.DB_PASSWORD || "";
  const dbHost = process.env.DB_HOST || "localhost";
  const dbPort = parseInt(process.env.DB_PORT || "3306");

  const getTempConnection = () =>
    new Sequelize("", dbUser, dbPassword, {
      host: dbHost,
      port: dbPort,
      dialect: "mysql",
      logging: false,
    });

  // Step 1: Connect WITHOUT a database to create it if missing
  let tempConnection = getTempConnection();
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
  try {
    await syncDatabase();
  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    const isTablespaceError =
      errorMsg.includes("ER_TABLESPACE_EXISTS") ||
      errorMsg.includes("Tablespace for table");

    if (isTablespaceError) {
      console.warn(
        "⚠️  Detected corrupted InnoDB tablespace. Cleaning up and recreating database..."
      );

      // Get MySQL data directory and remove orphaned .ibd files
      tempConnection = getTempConnection();
      try {
        const [rows] = (await tempConnection.query(
          "SELECT @@datadir AS datadir"
        )) as [{ datadir: string }[], unknown];
        const dataDir = rows[0]?.datadir;

        if (dataDir) {
          const dbDir = path.join(dataDir, dbName);
          if (fs.existsSync(dbDir)) {
            // Remove orphaned .ibd files
            const files = fs.readdirSync(dbDir);
            for (const file of files) {
              if (file.endsWith(".ibd")) {
                fs.unlinkSync(path.join(dbDir, file));
                console.log(`  🗑️  Removed orphaned file: ${file}`);
              }
            }
          }
        }

        await tempConnection.query(`DROP DATABASE IF EXISTS \`${dbName}\`;`);
        await tempConnection.query(
          `CREATE DATABASE \`${dbName}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`
        );
        console.log(`✅ Database "${dbName}" recreated.`);
      } finally {
        await tempConnection.close();
      }
      // Sync with force to create fresh tables
      await syncDatabase(true);
    } else {
      throw error;
    }
  }

  initialized = true;
}
