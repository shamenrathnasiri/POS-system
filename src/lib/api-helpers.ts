import { NextResponse } from "next/server";

export class ApiError extends Error {
  statusCode: number;
  constructor(message: string, statusCode: number = 500) {
    super(message);
    this.statusCode = statusCode;
    this.name = "ApiError";
  }
}

export function successResponse(data: unknown, message: string = "Success", statusCode: number = 200) {
  return NextResponse.json({ success: true, message, data }, { status: statusCode });
}

export function errorResponse(message: string, statusCode: number = 500, errors?: unknown) {
  return NextResponse.json(
    { success: false, message, errors: errors || null },
    { status: statusCode }
  );
}

export function handleApiError(error: unknown) {
  console.error("API Error:", error);

  if (error instanceof ApiError) {
    return errorResponse(error.message, error.statusCode);
  }

  // Sequelize validation errors
  if (error && typeof error === "object" && "name" in error) {
    const err = error as { name: string; errors?: Array<{ message: string }> };
    if (err.name === "SequelizeValidationError" || err.name === "SequelizeUniqueConstraintError") {
      const messages = err.errors?.map((e) => e.message) || ["Validation error"];
      return errorResponse(messages.join(", "), 400, messages);
    }
  }

  const message = error instanceof Error ? error.message : "Internal server error";
  return errorResponse(message, 500);
}

export function generateInvoiceNumber(): string {
  const now = new Date();
  const dateStr = now.toISOString().slice(0, 10).replace(/-/g, "");
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, "0");
  return `INV-${dateStr}-${random}`;
}
