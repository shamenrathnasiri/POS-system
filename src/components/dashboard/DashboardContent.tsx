"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { reportsApi } from "@/lib/api-client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  DollarSign,
  ShoppingCart,
  TrendingUp,
  AlertTriangle,
  Package,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";

export default function DashboardContent() {
  const { user } = useAuth();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [dailyReport, setDailyReport] = useState<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [monthlyReport, setMonthlyReport] = useState<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [topProducts, setTopProducts] = useState<any[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [lowStockProducts, setLowStockProducts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      const [dailyRes, monthlyRes, topRes, lowStockRes] = await Promise.allSettled([
        reportsApi.daily(),
        reportsApi.monthly(),
        reportsApi.topProducts(5),
        reportsApi.lowStock(),
      ]);

      if (dailyRes.status === "fulfilled") {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        setDailyReport((dailyRes.value as any).data);
      }
      if (monthlyRes.status === "fulfilled") {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        setMonthlyReport((monthlyRes.value as any).data);
      }
      if (topRes.status === "fulfilled") {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        setTopProducts((topRes.value as any).data?.topProducts || []);
      }
      if (lowStockRes.status === "fulfilled") {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        setLowStockProducts((lowStockRes.value as any).data?.products || []);
      }
    } catch (error) {
      console.error("Failed to fetch dashboard data", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const stats = [
    {
      title: "Today's Revenue",
      value: `Rs. ${dailyReport?.totalRevenue || "0.00"}`,
      icon: DollarSign,
      trend: "+12.5%",
      trendUp: true,
      gradient: "from-emerald-500/20 to-green-500/20",
      iconColor: "text-emerald-400",
      borderColor: "border-emerald-400/20",
    },
    {
      title: "Today's Sales",
      value: dailyReport?.totalSales || 0,
      icon: ShoppingCart,
      trend: "+8",
      trendUp: true,
      gradient: "from-blue-500/20 to-indigo-500/20",
      iconColor: "text-blue-400",
      borderColor: "border-blue-400/20",
    },
    {
      title: "Monthly Revenue",
      value: `Rs. ${monthlyReport?.totalRevenue || "0.00"}`,
      icon: TrendingUp,
      trend: "+18.2%",
      trendUp: true,
      gradient: "from-violet-500/20 to-purple-500/20",
      iconColor: "text-violet-400",
      borderColor: "border-violet-400/20",
    },
    {
      title: "Low Stock Alerts",
      value: lowStockProducts.length,
      icon: AlertTriangle,
      trend: "items",
      trendUp: false,
      gradient: "from-amber-500/20 to-orange-500/20",
      iconColor: "text-amber-400",
      borderColor: "border-amber-400/20",
    },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-2 border-blue-400/30 border-t-blue-400 rounded-full animate-spin" />
          <p className="text-white/40 text-sm">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <ScrollArea className="h-full">
      <div className="p-6 space-y-6">
        {/* Welcome */}
        <div>
          <h1 className="text-2xl font-bold text-white">
            Welcome back, {user?.name?.split(" ")[0]} 👋
          </h1>
          <p className="text-white/40 text-sm mt-1">
            Here&apos;s what&apos;s happening with your store today.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <Card
                key={index}
                className={`border-white/[0.06] bg-white/[0.02] backdrop-blur-sm hover:bg-white/[0.04] transition-all duration-300 hover:scale-[1.02] ${stat.borderColor}`}
              >
                <CardContent className="p-5">
                  <div className="flex items-start justify-between">
                    <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${stat.gradient} flex items-center justify-center`}>
                      <Icon className={`w-5 h-5 ${stat.iconColor}`} />
                    </div>
                    <div className={`flex items-center gap-1 text-xs ${stat.trendUp ? "text-emerald-400" : "text-amber-400"}`}>
                      {stat.trendUp ? (
                        <ArrowUpRight className="w-3 h-3" />
                      ) : (
                        <ArrowDownRight className="w-3 h-3" />
                      )}
                      {stat.trend}
                    </div>
                  </div>
                  <p className="text-2xl font-bold text-white mt-3">{stat.value}</p>
                  <p className="text-xs text-white/40 mt-1">{stat.title}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Bottom Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Top Selling Products */}
          <Card className="border-white/[0.06] bg-white/[0.02] backdrop-blur-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold text-white flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-blue-400" />
                Top Selling Products
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              {topProducts.length === 0 ? (
                <p className="text-sm text-white/30 text-center py-8">No sales data yet</p>
              ) : (
                <div className="space-y-3">
                  {topProducts.map((product, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-3 p-3 rounded-lg bg-white/[0.02] border border-white/[0.04]"
                    >
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500/20 to-indigo-500/20 flex items-center justify-center">
                        <span className="text-xs font-bold text-blue-300">#{index + 1}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-white/80 truncate">
                          {product.product_name}
                        </p>
                        <p className="text-xs text-white/30">
                          {product.total_quantity} units sold
                        </p>
                      </div>
                      <p className="text-sm font-semibold text-emerald-400">
                        Rs. {parseFloat(product.total_revenue).toFixed(2)}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Low Stock Alerts */}
          <Card className="border-white/[0.06] bg-white/[0.02] backdrop-blur-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold text-white flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-400" />
                Low Stock Alerts
                {lowStockProducts.length > 0 && (
                  <Badge className="bg-amber-500/20 text-amber-300 border-amber-400/30 text-[10px]">
                    {lowStockProducts.length}
                  </Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              {lowStockProducts.length === 0 ? (
                <p className="text-sm text-white/30 text-center py-8">All products well stocked ✓</p>
              ) : (
                <div className="space-y-3">
                  {lowStockProducts.slice(0, 5).map((product) => (
                    <div
                      key={product.id}
                      className="flex items-center gap-3 p-3 rounded-lg bg-white/[0.02] border border-white/[0.04]"
                    >
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500/20 to-orange-500/20 flex items-center justify-center">
                        <Package className="w-4 h-4 text-amber-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-white/80 truncate">
                          {product.name}
                        </p>
                        <p className="text-xs text-white/30 font-mono">{product.sku}</p>
                      </div>
                      <Badge
                        className={`text-[10px] ${
                          product.stock_quantity === 0
                            ? "bg-red-500/20 text-red-300 border-red-400/30"
                            : "bg-amber-500/20 text-amber-300 border-amber-400/30"
                        }`}
                      >
                        {product.stock_quantity} left
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </ScrollArea>
  );
}
