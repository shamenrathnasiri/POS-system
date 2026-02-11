import { NextRequest } from "next/server";
import { initializeDatabase } from "@/lib/db/init";
import { Category } from "@/lib/db/models";
import { authenticateRequest } from "@/lib/auth";
import { successResponse, errorResponse, handleApiError } from "@/lib/api-helpers";

// GET /api/categories — list all categories
export async function GET(request: NextRequest) {
  try {
    await initializeDatabase();

    const user = authenticateRequest(request);
    if (!user) return errorResponse("Authentication required", 401);

    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "50");

    const { count, rows } = await Category.findAndCountAll({
      where: { is_active: true },
      order: [["name", "ASC"]],
      limit,
      offset: (page - 1) * limit,
    });

    return successResponse({
      categories: rows,
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

// POST /api/categories — create a category
export async function POST(request: NextRequest) {
  try {
    await initializeDatabase();

    const user = authenticateRequest(request);
    if (!user) return errorResponse("Authentication required", 401);

    const body = await request.json();
    const { name, description } = body;

    if (!name) return errorResponse("Category name is required", 400);

    const category = await Category.create({ name, description });

    return successResponse(category, "Category created successfully", 201);
  } catch (error) {
    return handleApiError(error);
  }
}
