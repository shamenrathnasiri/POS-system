import { NextRequest } from "next/server";
import { initializeDatabase } from "@/lib/db/init";
import { Sale, SaleItem, User, Customer } from "@/lib/db/models";
import { authenticateRequest } from "@/lib/auth";
import { successResponse, errorResponse, handleApiError } from "@/lib/api-helpers";

// GET /api/sales/[id]
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await initializeDatabase();
    const user = authenticateRequest(request);
    if (!user) return errorResponse("Authentication required", 401);

    const { id } = await params;
    const sale = await Sale.findByPk(id, {
      include: [
        { model: User, as: "user", attributes: ["id", "name", "email"] },
        { model: Customer, as: "customer" },
        { model: SaleItem, as: "items" },
      ],
    });

    if (!sale) return errorResponse("Sale not found", 404);

    return successResponse(sale);
  } catch (error) {
    return handleApiError(error);
  }
}
