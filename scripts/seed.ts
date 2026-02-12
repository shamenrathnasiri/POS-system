import { initializeDatabase } from "../src/lib/db/init";
import { User, Category, Product, Customer } from "../src/lib/db/models";

async function seed() {
  console.log("🌱 Starting database seed...\n");

  await initializeDatabase();

  // ==========================================
  // 1. Create Admin User
  // ==========================================
  const existingAdmin = await User.findOne({ where: { email: "admin@stylepos.com" } });
  if (!existingAdmin) {
    await User.create({
      name: "Admin User",
      email: "admin@stylepos.com",
      password: "admin123",
      role: "admin",
    });
    console.log("✅ Admin user created (admin@stylepos.com / admin123)");
  } else {
    console.log("ℹ️  Admin user already exists");
  }

  // Create Cashier
  const existingCashier = await User.findOne({ where: { email: "cashier@stylepos.com" } });
  if (!existingCashier) {
    await User.create({
      name: "Jane Cashier",
      email: "cashier@stylepos.com",
      password: "cashier123",
      role: "cashier",
    });
    console.log("✅ Cashier user created (cashier@stylepos.com / cashier123)");
  } else {
    console.log("ℹ️  Cashier user already exists");
  }

  // Create Manager
  const existingManager = await User.findOne({ where: { email: "manager@stylepos.com" } });
  if (!existingManager) {
    await User.create({
      name: "Mike Manager",
      email: "manager@stylepos.com",
      password: "manager123",
      role: "manager",
    });
    console.log("✅ Manager user created (manager@stylepos.com / manager123)");
  } else {
    console.log("ℹ️  Manager user already exists");
  }

  // ==========================================
  // 2. Create Categories
  // ==========================================
  const categoryData = [
    { name: "Men's Clothing", description: "Shirts, trousers, jackets and more for men" },
    { name: "Women's Clothing", description: "Dresses, tops, skirts and more for women" },
    { name: "Kids' Clothing", description: "Clothing items for children" },
    { name: "Accessories", description: "Bags, belts, scarves, hats and accessories" },
    { name: "Footwear", description: "Shoes, sandals, and slippers" },
    { name: "Gift Items", description: "Gift boxes, souvenirs, and special items" },
    { name: "Jewelry", description: "Necklaces, bracelets, earrings and rings" },
  ];

  const categories: Record<string, Category> = {};
  for (const cat of categoryData) {
    const [category] = await Category.findOrCreate({
      where: { name: cat.name },
      defaults: cat,
    });
    categories[cat.name] = category;
  }
  console.log(`✅ ${Object.keys(categories).length} categories seeded`);

  // ==========================================
  // 3. Create Products
  // ==========================================
  const productData = [
    // Men's Clothing
    { name: "Classic White Shirt", sku: "MEN-SH-001", category: "Men's Clothing", price: 2500, cost_price: 1500, stock_quantity: 50, low_stock_threshold: 10 },
    { name: "Slim Fit Chinos", sku: "MEN-TR-001", category: "Men's Clothing", price: 3200, cost_price: 1800, stock_quantity: 35, low_stock_threshold: 8 },
    { name: "Denim Jacket", sku: "MEN-JK-001", category: "Men's Clothing", price: 5500, cost_price: 3200, stock_quantity: 20, low_stock_threshold: 5 },
    { name: "Polo T-Shirt", sku: "MEN-TS-001", category: "Men's Clothing", price: 1800, cost_price: 900, stock_quantity: 60, low_stock_threshold: 15 },
    { name: "Formal Trousers", sku: "MEN-TR-002", category: "Men's Clothing", price: 3500, cost_price: 2000, stock_quantity: 30, low_stock_threshold: 8 },

    // Women's Clothing
    { name: "Floral Maxi Dress", sku: "WMN-DR-001", category: "Women's Clothing", price: 4200, cost_price: 2200, stock_quantity: 25, low_stock_threshold: 5 },
    { name: "Silk Blouse", sku: "WMN-BL-001", category: "Women's Clothing", price: 3000, cost_price: 1500, stock_quantity: 40, low_stock_threshold: 10 },
    { name: "Pencil Skirt", sku: "WMN-SK-001", category: "Women's Clothing", price: 2800, cost_price: 1400, stock_quantity: 30, low_stock_threshold: 8 },
    { name: "Evening Gown", sku: "WMN-GW-001", category: "Women's Clothing", price: 8500, cost_price: 4500, stock_quantity: 10, low_stock_threshold: 3 },
    { name: "Cotton Kurti", sku: "WMN-KR-001", category: "Women's Clothing", price: 1500, cost_price: 700, stock_quantity: 55, low_stock_threshold: 12 },

    // Kids' Clothing
    { name: "Kids Cartoon T-Shirt", sku: "KID-TS-001", category: "Kids' Clothing", price: 1200, cost_price: 500, stock_quantity: 70, low_stock_threshold: 15 },
    { name: "Kids Denim Shorts", sku: "KID-SH-001", category: "Kids' Clothing", price: 1500, cost_price: 700, stock_quantity: 45, low_stock_threshold: 10 },
    { name: "Baby Romper Set", sku: "KID-RM-001", category: "Kids' Clothing", price: 2000, cost_price: 900, stock_quantity: 30, low_stock_threshold: 8 },

    // Accessories
    { name: "Leather Belt", sku: "ACC-BT-001", category: "Accessories", price: 1200, cost_price: 500, stock_quantity: 80, low_stock_threshold: 20 },
    { name: "Silk Scarf", sku: "ACC-SC-001", category: "Accessories", price: 1800, cost_price: 800, stock_quantity: 40, low_stock_threshold: 10 },
    { name: "Canvas Tote Bag", sku: "ACC-BG-001", category: "Accessories", price: 2500, cost_price: 1200, stock_quantity: 25, low_stock_threshold: 5 },
    { name: "Sunglasses", sku: "ACC-SG-001", category: "Accessories", price: 3500, cost_price: 1500, stock_quantity: 35, low_stock_threshold: 8 },

    // Footwear
    { name: "Leather Loafers", sku: "FTW-LF-001", category: "Footwear", price: 4500, cost_price: 2500, stock_quantity: 20, low_stock_threshold: 5 },
    { name: "Sports Sneakers", sku: "FTW-SN-001", category: "Footwear", price: 5200, cost_price: 2800, stock_quantity: 25, low_stock_threshold: 5 },
    { name: "Women's Heels", sku: "FTW-HL-001", category: "Footwear", price: 3800, cost_price: 1800, stock_quantity: 15, low_stock_threshold: 4 },

    // Gift Items
    { name: "Premium Gift Box", sku: "GFT-BX-001", category: "Gift Items", price: 1500, cost_price: 600, stock_quantity: 100, low_stock_threshold: 20 },
    { name: "Scented Candle Set", sku: "GFT-CN-001", category: "Gift Items", price: 2200, cost_price: 900, stock_quantity: 50, low_stock_threshold: 10 },
    { name: "Photo Frame", sku: "GFT-PF-001", category: "Gift Items", price: 1800, cost_price: 700, stock_quantity: 40, low_stock_threshold: 10 },
    { name: "Personalized Mug", sku: "GFT-MG-001", category: "Gift Items", price: 800, cost_price: 300, stock_quantity: 60, low_stock_threshold: 15 },

    // Jewelry
    { name: "Gold Plated Necklace", sku: "JWL-NK-001", category: "Jewelry", price: 3500, cost_price: 1500, stock_quantity: 20, low_stock_threshold: 5 },
    { name: "Silver Bracelet", sku: "JWL-BR-001", category: "Jewelry", price: 2800, cost_price: 1200, stock_quantity: 25, low_stock_threshold: 5 },
    { name: "Pearl Earrings", sku: "JWL-ER-001", category: "Jewelry", price: 2200, cost_price: 900, stock_quantity: 30, low_stock_threshold: 8 },
    { name: "Fashion Ring Set", sku: "JWL-RG-001", category: "Jewelry", price: 1500, cost_price: 500, stock_quantity: 50, low_stock_threshold: 10 },
  ];

  let productsCreated = 0;
  for (const prod of productData) {
    const existing = await Product.findOne({ where: { sku: prod.sku } });
    if (!existing) {
      const category = categories[prod.category];
      if (category) {
        await Product.create({
          name: prod.name,
          sku: prod.sku,
          category_id: category.id,
          price: prod.price,
          cost_price: prod.cost_price,
          stock_quantity: prod.stock_quantity,
          low_stock_threshold: prod.low_stock_threshold,
        });
        productsCreated++;
      }
    }
  }
  console.log(`✅ ${productsCreated} products seeded`);

  // ==========================================
  // 4. Create Sample Customers
  // ==========================================
  const customerData = [
    { name: "Amal Perera", email: "amal@email.com", phone: "0771234567", address: "123 Galle Road, Colombo 03" },
    { name: "Nisha Fernando", email: "nisha@email.com", phone: "0761234567", address: "45 Kandy Road, Kadawatha" },
    { name: "Kasun Silva", phone: "0711234567", address: "78 Main Street, Gampaha" },
    { name: "Dilini Jayawardena", email: "dilini@email.com", phone: "0751234567" },
    { name: "Ruwan Bandara", phone: "0721234567", address: "12 Temple Road, Kandy" },
  ];

  let customersCreated = 0;
  for (const cust of customerData) {
    const existing = await Customer.findOne({ where: { name: cust.name } });
    if (!existing) {
      await Customer.create(cust);
      customersCreated++;
    }
  }
  console.log(`✅ ${customersCreated} customers seeded`);

  console.log("\n🎉 Database seed completed successfully!");
  console.log("\n📋 Login Credentials:");
  console.log("   Admin:   admin@stylepos.com / admin123");
  console.log("   Cashier: cashier@stylepos.com / cashier123");
  console.log("   Manager: manager@stylepos.com / manager123");
  console.log("");

  process.exit(0);
}

seed().catch((err) => {
  console.error("❌ Seed failed:", err);
  process.exit(1);
});
