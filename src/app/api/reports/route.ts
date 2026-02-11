import { NextRequest } from "next/server";
import { initializeDatabase } from "@/lib/db/init";
import { Sale, SaleItem, Product, sequelize } from "@/lib/db/models";
import { authenticateRequest, authorizeRoles } from "@/lib/auth";
import { successResponse, errorResponse, handleApiError } from "@/lib/api-helpers";
import { Op, fn, col, literal } from "sequelize";

// GET /api/reports?type=daily|monthly|top-products|low-stock
export async function GET(request: NextRequest) {
  try {
    await initializeDatabase();
    const user = authenticateRequest(request);
    if (!user) return errorResponse("Authentication required", 401);

    if (!authorizeRoles("admin", "manager")(user)) {
      return errorResponse("Insufficient permissions", 403);
    }

    const searchParams = request.nextUrl.searchParams;
    const type = searchParams.get("type") || "daily";
    const dateStr = searchParams.get("date");

    switch (type) {
      case "daily": {
        const targetDate = dateStr ? new Date(dateStr) : new Date();
        const startOfDay = new Date(targetDate);
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date(targetDate);
        endOfDay.setHours(23, 59, 59, 999);

        const sales = await Sale.findAll({
          where: {
            created_at: { [Op.between]: [startOfDay, endOfDay] },
            status: "completed",
          },
          include: [{ model: SaleItem, as: "items" }],
          order: [["created_at", "DESC"]],
        });

        const totalRevenue = sales.reduce((sum, s) => sum + parseFloat(s.grand_total.toString()), 0);
        const totalSales = sales.length;
        const totalItems = sales.reduce(
          (sum, s) => {
            const items = (s as Sale & { items: SaleItem[] }).items || [];
            return sum + items.reduce((iSum, item) => iSum + item.quantity, 0);
          },
          0
        );

        return successResponse({
          date: targetDate.toISOString().slice(0, 10),
          totalRevenue: totalRevenue.toFixed(2),
          totalSales,
          totalItems,
          averageOrderValue: totalSales > 0 ? (totalRevenue / totalSales).toFixed(2) : "0.00",
          sales,
        });
      }

      case "monthly": {
        const now = dateStr ? new Date(dateStr) : new Date();
        const year = now.getFullYear();
        const month = now.getMonth();
        const startOfMonth = new Date(year, month, 1);
        const endOfMonth = new Date(year, month + 1, 0, 23, 59, 59, 999);

        const monthlySales = await Sale.findAll({
          attributes: [
            [fn("DATE", col("created_at")), "date"],
            [fn("COUNT", col("id")), "total_sales"],
            [fn("SUM", col("grand_total")), "revenue"],
          ],
          where: {
            created_at: { [Op.between]: [startOfMonth, endOfMonth] },
            status: "completed",
          },
          group: [fn("DATE", col("created_at"))],
          order: [[fn("DATE", col("created_at")), "ASC"]],
          raw: true,
        });

        const totalRevenue = await Sale.sum("grand_total", {
          where: {
            created_at: { [Op.between]: [startOfMonth, endOfMonth] },
            status: "completed",
          },
        });

        const totalSalesCount = await Sale.count({
          where: {
            created_at: { [Op.between]: [startOfMonth, endOfMonth] },
            status: "completed",
          },
        });

        return successResponse({
          year,
          month: month + 1,
          totalRevenue: (totalRevenue || 0).toFixed(2),
          totalSales: totalSalesCount,
          dailyBreakdown: monthlySales,
        });
      }

      case "top-products": {
        const limitNum = parseInt(searchParams.get("limit") || "10");

        const topProducts = await SaleItem.findAll({
          attributes: [
            "product_id",
            "product_name",
            [fn("SUM", col("quantity")), "total_quantity"],
            [fn("SUM", col("total")), "total_revenue"],
          ],
          include: [
            {
              model: Sale,
              as: "sale",
              attributes: [],
              where: { status: "completed" },
            },
          ],
          group: ["product_id", "product_name"],
          order: [[literal("total_quantity"), "DESC"]],
          limit: limitNum,
          raw: true,
        });

        return successResponse({ topProducts });
      }

      case "low-stock": {
        const lowStockProducts = await Product.findAll({
          where: {
            is_active: true,
            stock_quantity: {
              [Op.lte]: sequelize.col("low_stock_threshold"),
            },
          },
          order: [["stock_quantity", "ASC"]],
        });

        return successResponse({
          lowStockCount: lowStockProducts.length,
          products: lowStockProducts,
        });
      }

      default:
        return errorResponse("Invalid report type. Use: daily, monthly, top-products, low-stock", 400);
    }
  } catch (error) {
    return handleApiError(error);
  }
}
