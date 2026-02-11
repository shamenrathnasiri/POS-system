import { NextRequest } from "next/server";
import { initializeDatabase } from "@/lib/db/init";
import { User } from "@/lib/db/models";
import { generateToken, authenticateRequest, authorizeRoles } from "@/lib/auth";
import { successResponse, errorResponse, handleApiError } from "@/lib/api-helpers";

// POST /api/auth/register
export async function POST(request: NextRequest) {
  try {
    await initializeDatabase();

    // Only admins can register new users
    const currentUser = authenticateRequest(request);
    const isAdmin = authorizeRoles("admin")(currentUser);

    // Allow first user creation without auth (bootstrap admin)
    const userCount = await User.count();
    if (userCount > 0 && !isAdmin) {
      return errorResponse("Only admins can register new users", 403);
    }

    const body = await request.json();
    const { name, email, password, role } = body;

    if (!name || !email || !password) {
      return errorResponse("Name, email, and password are required", 400);
    }

    if (password.length < 6) {
      return errorResponse("Password must be at least 6 characters", 400);
    }

    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return errorResponse("Email already exists", 409);
    }

    const user = await User.create({
      name,
      email,
      password,
      role: userCount === 0 ? "admin" : role || "cashier",
    });

    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    return successResponse(
      { token, user: user.toJSON() },
      "User registered successfully",
      201
    );
  } catch (error) {
    return handleApiError(error);
  }
}
