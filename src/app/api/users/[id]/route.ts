import { NextRequest } from "next/server";
import { initializeDatabase } from "@/lib/db/init";
import { User } from "@/lib/db/models";
import { authenticateRequest, authorizeRoles } from "@/lib/auth";
import { successResponse, errorResponse, handleApiError } from "@/lib/api-helpers";

// PUT /api/users/[id] — update user (admin only)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await initializeDatabase();
    const currentUser = authenticateRequest(request);
    if (!currentUser) return errorResponse("Authentication required", 401);

    if (!authorizeRoles("admin")(currentUser)) {
      return errorResponse("Insufficient permissions", 403);
    }

    const { id } = await params;
    const user = await User.findByPk(id);
    if (!user) return errorResponse("User not found", 404);

    const body = await request.json();
    const { name, email, role, is_active, password } = body;

    const updateData: Record<string, unknown> = {};
    if (name !== undefined) updateData.name = name;
    if (email !== undefined) updateData.email = email;
    if (role !== undefined) updateData.role = role;
    if (is_active !== undefined) updateData.is_active = is_active;
    if (password && password.length >= 6) updateData.password = password;

    await user.update(updateData);

    return successResponse(user.toJSON(), "User updated successfully");
  } catch (error) {
    return handleApiError(error);
  }
}

// DELETE /api/users/[id] — soft delete user (admin only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await initializeDatabase();
    const currentUser = authenticateRequest(request);
    if (!currentUser) return errorResponse("Authentication required", 401);

    if (!authorizeRoles("admin")(currentUser)) {
      return errorResponse("Insufficient permissions", 403);
    }

    const { id } = await params;
    const userId = parseInt(id);

    // Prevent self-deletion
    if (userId === currentUser.userId) {
      return errorResponse("Cannot delete your own account", 400);
    }

    const user = await User.findByPk(userId);
    if (!user) return errorResponse("User not found", 404);

    await user.destroy(); // Soft delete
    return successResponse(null, "User deleted successfully");
  } catch (error) {
    return handleApiError(error);
  }
}
