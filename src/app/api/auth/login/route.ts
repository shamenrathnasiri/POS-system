import { NextRequest } from "next/server";
import { initializeDatabase } from "@/lib/db/init";
import { User } from "@/lib/db/models";
import { generateToken } from "@/lib/auth";
import { successResponse, errorResponse, handleApiError } from "@/lib/api-helpers";

// POST /api/auth/login
export async function POST(request: NextRequest) {
  try {
    await initializeDatabase();

    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return errorResponse("Email and password are required", 400);
    }

    const user = await User.findOne({ where: { email, is_active: true } });

    if (!user) {
      return errorResponse("Invalid email or password", 401);
    }

    const isPasswordValid = await user.validatePassword(password);

    if (!isPasswordValid) {
      return errorResponse("Invalid email or password", 401);
    }

    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    return successResponse(
      {
        token,
        user: user.toJSON(),
      },
      "Login successful"
    );
  } catch (error) {
    return handleApiError(error);
  }
}
