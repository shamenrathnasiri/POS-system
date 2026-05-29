import { syncDatabase } from "./models";
import fs from "fs";
import path from "path";

let initialized = false;

export async function initializeDatabase() {
  if (initialized) return;

  const sqliteStorage = process.env.DB_STORAGE || path.resolve(process.cwd(), "Database", "abcpos.db");
  const sqliteDir = path.dirname(sqliteStorage);

  if (!fs.existsSync(sqliteDir)) {
    fs.mkdirSync(sqliteDir, { recursive: true });
  }

  try {
    await syncDatabase();
    console.log(`SQLite database is ready at: ${sqliteStorage}`);
  } catch (error) {
    console.error("Failed to initialize SQLite database:", error);
    throw error;
  }

  initialized = true;
}
