import { NextRequest } from "next/server";
import { initializeDatabase } from "@/lib/db/init";
import { Customer } from "@/lib/db/models";
import { authenticateRequest, authorizeRoles } from "@/lib/auth";
import { successResponse, errorResponse, handleApiError } from "@/lib/api-helpers";

// GET /api/customers/[id]
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await initializeDatabase();
    const user = authenticateRequest(request);
    if (!user) return errorResponse("Authentication required", 401);

    const { id } = await params;
    const customer = await Customer.findByPk(id);
    if (!customer) return errorResponse("Customer not found", 404);

    return successResponse(customer);
  } catch (error) {
    return handleApiError(error);
  }
}

// PUT /api/customers/[id]
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await initializeDatabase();
    const user = authenticateRequest(request);
    if (!user) return errorResponse("Authentication required", 401);

    const { id } = await params;
    const customer = await Customer.findByPk(id);
    if (!customer) return errorResponse("Customer not found", 404);

    const body = await request.json();
    await customer.update(body);

    return successResponse(customer, "Customer updated successfully");
  } catch (error) {
    return handleApiError(error);
  }
}

// DELETE /api/customers/[id]
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
    const customer = await Customer.findByPk(id);
    if (!customer) return errorResponse("Customer not found", 404);

    await customer.destroy();
    return successResponse(null, "Customer deleted successfully");
  } catch (error) {
    return handleApiError(error);
  }
}
