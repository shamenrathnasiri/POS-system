import { NextRequest } from "next/server";
import { initializeDatabase } from "@/lib/db/init";
import { User } from "@/lib/db/models";
import { authenticateRequest } from "@/lib/auth";
import { successResponse, errorResponse, handleApiError } from "@/lib/api-helpers";

// GET /api/auth/me — get current user
export async function GET(request: NextRequest) {
  try {
    await initializeDatabase();

    const payload = authenticateRequest(request);
    if (!payload) {
      return errorResponse("Authentication required", 401);
    }

    const user = await User.findByPk(payload.userId);
    if (!user) {
      return errorResponse("User not found", 404);
    }

    return successResponse(user.toJSON(), "User retrieved");
  } catch (error) {
    return handleApiError(error);
  }
}
