import { NextRequest } from "next/server";
import { initializeDatabase } from "@/lib/db/init";
import { Customer } from "@/lib/db/models";
import { authenticateRequest } from "@/lib/auth";
import { successResponse, errorResponse, handleApiError } from "@/lib/api-helpers";
import { Op } from "sequelize";

// GET /api/customers
export async function GET(request: NextRequest) {
  try {
    await initializeDatabase();
    const user = authenticateRequest(request);
    if (!user) return errorResponse("Authentication required", 401);

    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "50");
    const search = searchParams.get("search") || "";
    const phone = searchParams.get("phone") || "";

    // Exact phone lookup — returns single customer or null
    if (phone) {
      const customer = await Customer.findOne({ where: { phone } });
      return successResponse({ customer });
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: any = {};
    if (search) {
      where[Op.or] = [
        { name: { [Op.like]: `%${search}%` } },
        { email: { [Op.like]: `%${search}%` } },
        { phone: { [Op.like]: `%${search}%` } },
      ];
    }

    const { count, rows } = await Customer.findAndCountAll({
      where,
      order: [["name", "ASC"]],
      limit,
      offset: (page - 1) * limit,
    });

    return successResponse({
      customers: rows,
      pagination: { total: count, page, limit, totalPages: Math.ceil(count / limit) },
    });
  } catch (error) {
    return handleApiError(error);
  }
}

// POST /api/customers
export async function POST(request: NextRequest) {
  try {
    await initializeDatabase();
    const user = authenticateRequest(request);
    if (!user) return errorResponse("Authentication required", 401);

    const body = await request.json();
    const { name, email, phone, address } = body;

    // For quick-add: phone is required, name defaults to phone if not provided
    if (!name && !phone) return errorResponse("Customer name or phone is required", 400);

    // If phone provided, check for existing customer first
    if (phone) {
      const existing = await Customer.findOne({ where: { phone } });
      if (existing) {
        // Update name if provided and current name is just the phone number
        if (name && existing.name === existing.phone) {
          await existing.update({ name });
        }
        return successResponse(existing, "Customer already exists", 200);
      }
    }

    const customer = await Customer.create({
      name: name || phone || "Customer",
      email,
      phone,
      address,
    });
    return successResponse(customer, "Customer created successfully", 201);
  } catch (error) {
    return handleApiError(error);
  }
}
