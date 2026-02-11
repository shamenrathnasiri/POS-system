import { syncDatabase } from "./db/models";

let initialized = false;

export async function initializeDatabase() {
  if (!initialized) {
    await syncDatabase();
    initialized = true;
  }
}
