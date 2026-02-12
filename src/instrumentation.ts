export async function onRequestError() {
  // Required export for instrumentation
}

export async function register() {
  // Only run on the server side
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const { initializeDatabase } = await import("@/lib/db/init");
    try {
      await initializeDatabase();
      console.log("🚀 Database initialized on server start.");
    } catch (error) {
      console.error("❌ Failed to initialize database on startup:", error);
    }
  }
}
