import { initializeDatabase } from "../src/lib/db/init";
import { User } from "../src/lib/db/models";

async function seed() {
  console.log("Starting database seed...");

  await initializeDatabase();

  const userAccounts = [
    { name: "Admin One", email: "admin1@pos.com", password: "admin123", role: "admin" },
    { name: "Admin Two", email: "admin2@pos.com", password: "admin123", role: "admin" },
    { name: "Cashier One", email: "cashier1@pos.com", password: "cashier123", role: "cashier" },
    { name: "Cashier Two", email: "cashier2@pos.com", password: "cashier123", role: "cashier" },
    { name: "Manager One", email: "manager1@pos.com", password: "manager123", role: "manager" },
    { name: "Manager Two", email: "manager2@pos.com", password: "manager123", role: "manager" },
  ];

  let createdCount = 0;
  for (const account of userAccounts) {
    const existing = await User.findOne({ where: { email: account.email } });
    if (!existing) {
      await User.create({
        name: account.name,
        email: account.email,
        password: account.password,
        role: account.role as "admin" | "cashier" | "manager",
      });
      console.log(`Created ${account.role} account for ${account.email}`);
      createdCount++;
    } else {
      console.log(`Account already exists for ${account.email}`);
    }
  }

  console.log(`Finished seeding. ${createdCount} accounts created, ${userAccounts.length - createdCount} already existed.`);
  console.log("Seed script completed.");

  process.exit(0);
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
