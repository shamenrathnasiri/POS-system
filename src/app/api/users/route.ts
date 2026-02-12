import { NextRequest } from "next/server";
import { initializeDatabase } from "@/lib/db/init";
import { User } from "@/lib/db/models";
import { authenticateRequest, authorizeRoles } from "@/lib/auth";
import { successResponse, errorResponse, handleApiError } from "@/lib/api-helpers";

// GET /api/users — list all users (admin only)
export async function GET(request: NextRequest) {
  try {
    await initializeDatabase();
    const user = authenticateRequest(request);
    if (!user) return errorResponse("Authentication required", 401);

    if (!authorizeRoles("admin")(user)) {
      return errorResponse("Insufficient permissions", 403);
    }

    const users = await User.findAll({
      attributes: { exclude: ["password"] },
      order: [["created_at", "DESC"]],
    });

    return successResponse({ users });
  } catch (error) {
    return handleApiError(error);
  }
}
