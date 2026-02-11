import { NextRequest } from "next/server";
import { initializeDatabase } from "@/lib/db/init";
import { Sale, SaleItem, Product, Customer, User, sequelize } from "@/lib/db/models";
import { authenticateRequest } from "@/lib/auth";
import { successResponse, errorResponse, handleApiError, generateInvoiceNumber } from "@/lib/api-helpers";

// GET /api/sales — list sales
export async function GET(request: NextRequest) {
  try {
    await initializeDatabase();
    const user = authenticateRequest(request);
    if (!user) return errorResponse("Authentication required", 401);

    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");

    const { count, rows } = await Sale.findAndCountAll({
      include: [
        { model: User, as: "user", attributes: ["id", "name"] },
        { model: Customer, as: "customer", attributes: ["id", "name", "phone"] },
        { model: SaleItem, as: "items" },
      ],
      order: [["created_at", "DESC"]],
      limit,
      offset: (page - 1) * limit,
    });

    return successResponse({
      sales: rows,
      pagination: { total: count, page, limit, totalPages: Math.ceil(count / limit) },
    });
  } catch (error) {
    return handleApiError(error);
  }
}

// POST /api/sales — create a new sale (with transaction)
export async function POST(request: NextRequest) {
  const t = await (async () => {
    await initializeDatabase();
    return sequelize.transaction();
  })();

  try {
    const user = authenticateRequest(request);
    if (!user) {
      await t.rollback();
      return errorResponse("Authentication required", 401);
    }

    const body = await request.json();
    const {
      items,
      customer_id,
      discount_type,
      discount_value,
      tax_rate = 0,
      payment_method = "cash",
      amount_paid,
      notes,
    } = body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      await t.rollback();
      return errorResponse("At least one item is required", 400);
    }

    // Validate and calculate items
    let subtotal = 0;
    const saleItemsData = [];

    for (const item of items) {
      const product = await Product.findByPk(item.product_id, { transaction: t });

      if (!product) {
        await t.rollback();
        return errorResponse(`Product with ID ${item.product_id} not found`, 404);
      }

      if (product.stock_quantity < item.quantity) {
        await t.rollback();
        return errorResponse(
          `Insufficient stock for "${product.name}". Available: ${product.stock_quantity}, Requested: ${item.quantity}`,
          400
        );
      }

      const itemTotal = parseFloat(product.price.toString()) * item.quantity;
      subtotal += itemTotal;

      saleItemsData.push({
        product_id: product.id,
        product_name: product.name,
        product_sku: product.sku,
        quantity: item.quantity,
        unit_price: product.price,
        discount: item.discount || 0,
        total: itemTotal - (item.discount || 0),
      });

      // Decrement stock
      await product.update(
        { stock_quantity: product.stock_quantity - item.quantity },
        { transaction: t }
      );
    }

    // Calculate discount
    let discountAmount = 0;
    if (discount_type === "percentage" && discount_value) {
      discountAmount = (subtotal * discount_value) / 100;
    } else if (discount_type === "fixed" && discount_value) {
      discountAmount = discount_value;
    }

    // Calculate tax
    const taxableAmount = subtotal - discountAmount;
    const taxAmount = (taxableAmount * (tax_rate || 0)) / 100;
    const grandTotal = taxableAmount + taxAmount;
    const changeAmount = (amount_paid || grandTotal) - grandTotal;

    if (amount_paid !== undefined && amount_paid < grandTotal) {
      await t.rollback();
      return errorResponse("Insufficient payment amount", 400);
    }

    // Create sale
    const sale = await Sale.create(
      {
        invoice_number: generateInvoiceNumber(),
        user_id: user.userId,
        customer_id: customer_id || null,
        subtotal,
        discount_amount: discountAmount,
        discount_type: discount_type || null,
        discount_value: discount_value || 0,
        tax_rate: tax_rate || 0,
        tax_amount: taxAmount,
        grand_total: grandTotal,
        amount_paid: amount_paid || grandTotal,
        change_amount: Math.max(0, changeAmount),
        payment_method,
        notes,
        status: "completed",
      },
      { transaction: t }
    );

    // Create sale items
    for (const itemData of saleItemsData) {
      await SaleItem.create(
        { ...itemData, sale_id: sale.id },
        { transaction: t }
      );
    }

    // Add loyalty points if customer
    if (customer_id) {
      const customer = await Customer.findByPk(customer_id, { transaction: t });
      if (customer) {
        const pointsEarned = Math.floor(grandTotal / 100); // 1 point per 100
        await customer.update(
          { loyalty_points: customer.loyalty_points + pointsEarned },
          { transaction: t }
        );
      }
    }

    await t.commit();

    // Fetch full sale with items
    const fullSale = await Sale.findByPk(sale.id, {
      include: [
        { model: User, as: "user", attributes: ["id", "name"] },
        { model: Customer, as: "customer", attributes: ["id", "name", "phone"] },
        { model: SaleItem, as: "items" },
      ],
    });

    return successResponse(fullSale, "Sale completed successfully", 201);
  } catch (error) {
    await t.rollback();
    return handleApiError(error);
  }
}
