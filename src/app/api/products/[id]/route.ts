import { NextRequest } from "next/server";
import { initializeDatabase } from "@/lib/db/init";
import { Product, Category } from "@/lib/db/models";
import { authenticateRequest, authorizeRoles } from "@/lib/auth";
import { successResponse, errorResponse, handleApiError } from "@/lib/api-helpers";

// GET /api/products/[id]
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await initializeDatabase();
    const user = authenticateRequest(request);
    if (!user) return errorResponse("Authentication required", 401);

    const { id } = await params;
    const product = await Product.findByPk(id, {
      include: [{ model: Category, as: "category", attributes: ["id", "name"] }],
    });
    if (!product) return errorResponse("Product not found", 404);

    return successResponse(product);
  } catch (error) {
    return handleApiError(error);
  }
}

// PUT /api/products/[id]
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await initializeDatabase();
    const user = authenticateRequest(request);
    if (!user) return errorResponse("Authentication required", 401);

    const { id } = await params;
    const product = await Product.findByPk(id);
    if (!product) return errorResponse("Product not found", 404);

    const body = await request.json();

    // Parse numeric fields
    if (body.price !== undefined) body.price = parseFloat(body.price);
    if (body.cost_price !== undefined) body.cost_price = parseFloat(body.cost_price);
    if (body.stock_quantity !== undefined) body.stock_quantity = parseInt(body.stock_quantity);
    if (body.low_stock_threshold !== undefined) body.low_stock_threshold = parseInt(body.low_stock_threshold);

    await product.update(body);

    return successResponse(product, "Product updated successfully");
  } catch (error) {
    return handleApiError(error);
  }
}

// DELETE /api/products/[id] — soft delete
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
    const product = await Product.findByPk(id);
    if (!product) return errorResponse("Product not found", 404);

    await product.destroy();
    return successResponse(null, "Product deleted successfully");
  } catch (error) {
    return handleApiError(error);
  }
}
