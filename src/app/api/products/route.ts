import { NextRequest } from "next/server";
import { initializeDatabase } from "@/lib/db/init";
import { Product, Category } from "@/lib/db/models";
import { authenticateRequest } from "@/lib/auth";
import { successResponse, errorResponse, handleApiError } from "@/lib/api-helpers";
import { Op } from "sequelize";

// GET /api/products — list all products
export async function GET(request: NextRequest) {
  try {
    await initializeDatabase();
    const user = authenticateRequest(request);
    if (!user) return errorResponse("Authentication required", 401);

    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "50");
    const search = searchParams.get("search") || "";
    const categoryId = searchParams.get("category_id");

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: any = { is_active: true };

    if (search) {
      where[Op.or] = [
        { name: { [Op.like]: `%${search}%` } },
        { sku: { [Op.like]: `%${search}%` } },
      ];
    }

    if (categoryId) {
      where.category_id = categoryId;
    }

    const { count, rows } = await Product.findAndCountAll({
      where,
      include: [{ model: Category, as: "category", attributes: ["id", "name"] }],
      order: [["name", "ASC"]],
      limit,
      offset: (page - 1) * limit,
    });

    return successResponse({
      products: rows,
      pagination: {
        total: count,
        page,
        limit,
        totalPages: Math.ceil(count / limit),
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}

// POST /api/products — create a product
export async function POST(request: NextRequest) {
  try {
    await initializeDatabase();
    const user = authenticateRequest(request);
    if (!user) return errorResponse("Authentication required", 401);

    const body = await request.json();
    const { name, sku, description, category_id, price, cost_price, stock_quantity, low_stock_threshold, image_url } = body;

    if (!name || !sku || !category_id || price === undefined) {
      return errorResponse("Name, SKU, category, and price are required", 400);
    }

    const product = await Product.create({
      name,
      sku,
      description,
      category_id,
      price: parseFloat(price),
      cost_price: parseFloat(cost_price || 0),
      stock_quantity: parseInt(stock_quantity || 0),
      low_stock_threshold: parseInt(low_stock_threshold || 10),
      image_url,
    });

    return successResponse(product, "Product created successfully", 201);
  } catch (error) {
    return handleApiError(error);
  }
}
