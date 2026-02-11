import { NextRequest } from "next/server";
import { initializeDatabase } from "@/lib/db/init";
import { Category } from "@/lib/db/models";
import { authenticateRequest, authorizeRoles } from "@/lib/auth";
import { successResponse, errorResponse, handleApiError } from "@/lib/api-helpers";

// GET /api/categories/[id]
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await initializeDatabase();
    const user = authenticateRequest(request);
    if (!user) return errorResponse("Authentication required", 401);

    const { id } = await params;
    const category = await Category.findByPk(id);
    if (!category) return errorResponse("Category not found", 404);

    return successResponse(category);
  } catch (error) {
    return handleApiError(error);
  }
}

// PUT /api/categories/[id]
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await initializeDatabase();
    const user = authenticateRequest(request);
    if (!user) return errorResponse("Authentication required", 401);

    const { id } = await params;
    const category = await Category.findByPk(id);
    if (!category) return errorResponse("Category not found", 404);

    const body = await request.json();
    await category.update(body);

    return successResponse(category, "Category updated successfully");
  } catch (error) {
    return handleApiError(error);
  }
}

// DELETE /api/categories/[id] — soft delete
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await initializeDatabase();
    const user = authenticateRequest(request);
    if (!user) return errorResponse("Authentication required", 401);

    if (!authorizeRoles("admin", "manager")(user)) {
      return errorResponse("Insufficient permissions", 403);
    }

    const { id } = await params;
    const category = await Category.findByPk(id);
    if (!category) return errorResponse("Category not found", 404);

    await category.destroy(); // Soft delete due to paranoid
    return successResponse(null, "Category deleted successfully");
  } catch (error) {
    return handleApiError(error);
  }
}
