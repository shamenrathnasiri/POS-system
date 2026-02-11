"use client";
import React, { useState, useEffect, useCallback } from "react";
import { reportsApi } from "@/lib/api-client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart3, Calendar, TrendingUp, AlertTriangle, Package } from "lucide-react";

export default function ReportsPage() {
  const [dailyData, setDailyData] = useState<any>(null);
  const [monthlyData, setMonthlyData] = useState<any>(null);
  const [topProducts, setTopProducts] = useState<any[]>([]);
  const [lowStock, setLowStock] = useState<any[]>([]);
  const [dailyDate, setDailyDate] = useState(new Date().toISOString().slice(0, 10));
  const [monthlyDate, setMonthlyDate] = useState(new Date().toISOString().slice(0, 7));
  const [loading, setLoading] = useState(false);

  const fetchDaily = useCallback(async () => {
    try { setLoading(true); const r = await reportsApi.daily(dailyDate) as any; setDailyData(r.data); }
    catch (e) { console.error(e); } finally { setLoading(false); }
  }, [dailyDate]);

  const fetchMonthly = useCallback(async () => {
    try { const r = await reportsApi.monthly(monthlyDate + "-01") as any; setMonthlyData(r.data); }
    catch (e) { console.error(e); }
  }, [monthlyDate]);

  const fetchTop = useCallback(async () => {
    try { const r = await reportsApi.topProducts(10) as any; setTopProducts(r.data?.topProducts || []); }
    catch (e) { console.error(e); }
  }, []);

  const fetchLow = useCallback(async () => {
    try { const r = await reportsApi.lowStock() as any; setLowStock(r.data?.products || []); }
    catch (e) { console.error(e); }
  }, []);

  useEffect(() => { fetchDaily(); }, [fetchDaily]);
  useEffect(() => { fetchMonthly(); }, [fetchMonthly]);
  useEffect(() => { fetchTop(); fetchLow(); }, [fetchTop, fetchLow]);

  return (
    <ScrollArea className="h-full">
      <div className="p-6 space-y-6">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-blue-400" /> Reports & Analytics
          </h1>
          <p className="text-sm text-white/40 mt-0.5">Business insights and performance metrics</p>
        </div>

        <Tabs defaultValue="daily" className="space-y-4">
          <TabsList className="bg-white/5 border border-white/[0.06]">
            <TabsTrigger value="daily" className="data-[state=active]:bg-blue-500/20 data-[state=active]:text-blue-300 text-white/50">Daily Sales</TabsTrigger>
            <TabsTrigger value="monthly" className="data-[state=active]:bg-blue-500/20 data-[state=active]:text-blue-300 text-white/50">Monthly</TabsTrigger>
            <TabsTrigger value="top" className="data-[state=active]:bg-blue-500/20 data-[state=active]:text-blue-300 text-white/50">Top Products</TabsTrigger>
            <TabsTrigger value="stock" className="data-[state=active]:bg-blue-500/20 data-[state=active]:text-blue-300 text-white/50">Stock Alerts</TabsTrigger>
          </TabsList>

          <TabsContent value="daily" className="space-y-4">
            <div className="flex items-center gap-3">
              <Calendar className="w-4 h-4 text-white/40" />
              <Input type="date" value={dailyDate} onChange={(e) => setDailyDate(e.target.value)}
                className="w-48 bg-white/5 border-white/10 text-white h-9" />
            </div>
            {dailyData && (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {[
                  { label: "Revenue", value: `Rs. ${dailyData.totalRevenue}`, color: "emerald" },
                  { label: "Total Sales", value: dailyData.totalSales, color: "blue" },
                  { label: "Items Sold", value: dailyData.totalItems, color: "violet" },
                  { label: "Avg Order", value: `Rs. ${dailyData.averageOrderValue}`, color: "amber" },
                ].map((s, i) => (
                  <Card key={i} className="border-white/[0.06] bg-white/[0.02]">
                    <CardContent className="p-5">
                      <p className="text-xs text-white/40 mb-1">{s.label}</p>
                      <p className="text-2xl font-bold text-white">{s.value}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="monthly" className="space-y-4">
            <div className="flex items-center gap-3">
              <Calendar className="w-4 h-4 text-white/40" />
              <Input type="month" value={monthlyDate} onChange={(e) => setMonthlyDate(e.target.value)}
                className="w-48 bg-white/5 border-white/10 text-white h-9" />
            </div>
            {monthlyData && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <Card className="border-white/[0.06] bg-white/[0.02]">
                    <CardContent className="p-5">
                      <p className="text-xs text-white/40 mb-1">Monthly Revenue</p>
                      <p className="text-2xl font-bold text-white">Rs. {monthlyData.totalRevenue}</p>
                    </CardContent>
                  </Card>
                  <Card className="border-white/[0.06] bg-white/[0.02]">
                    <CardContent className="p-5">
                      <p className="text-xs text-white/40 mb-1">Total Sales</p>
                      <p className="text-2xl font-bold text-white">{monthlyData.totalSales}</p>
                    </CardContent>
                  </Card>
                </div>
                <Card className="border-white/[0.06] bg-white/[0.02]">
                  <CardHeader className="pb-2"><CardTitle className="text-sm text-white/70">Daily Breakdown</CardTitle></CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {monthlyData.dailyBreakdown?.map((d: any, i: number) => (
                        <div key={i} className="flex items-center gap-3">
                          <span className="text-xs text-white/40 w-24">{d.date}</span>
                          <div className="flex-1 h-6 bg-white/5 rounded-full overflow-hidden">
                            <div className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full transition-all"
                              style={{ width: `${Math.min(100, (parseFloat(d.revenue) / Math.max(...monthlyData.dailyBreakdown.map((x: any) => parseFloat(x.revenue) || 1))) * 100)}%` }} />
                          </div>
                          <span className="text-xs text-white/60 w-28 text-right">Rs. {parseFloat(d.revenue).toFixed(2)}</span>
                          <span className="text-xs text-white/30 w-16 text-right">{d.total_sales} sales</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </>
            )}
          </TabsContent>

          <TabsContent value="top" className="space-y-3">
            <Card className="border-white/[0.06] bg-white/[0.02]">
              <CardHeader><CardTitle className="text-sm text-white/70 flex items-center gap-2"><TrendingUp className="w-4 h-4 text-blue-400" /> Top 10 Products</CardTitle></CardHeader>
              <CardContent>
                {topProducts.length === 0 ? <p className="text-white/30 text-center py-8">No data</p> : (
                  <div className="space-y-3">
                    {topProducts.map((p, i) => (
                      <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-white/[0.02] border border-white/[0.04]">
                        <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center"><span className="text-xs font-bold text-blue-300">#{i + 1}</span></div>
                        <div className="flex-1"><p className="text-sm font-medium text-white/80">{p.product_name}</p><p className="text-xs text-white/30">{p.total_quantity} units</p></div>
                        <p className="text-sm font-semibold text-emerald-400">Rs. {parseFloat(p.total_revenue).toFixed(2)}</p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="stock" className="space-y-3">
            <Card className="border-white/[0.06] bg-white/[0.02]">
              <CardHeader><CardTitle className="text-sm text-white/70 flex items-center gap-2"><AlertTriangle className="w-4 h-4 text-amber-400" /> Low Stock Alerts <Badge className="bg-amber-500/20 text-amber-300 border-amber-400/30 text-[10px]">{lowStock.length}</Badge></CardTitle></CardHeader>
              <CardContent>
                {lowStock.length === 0 ? <p className="text-white/30 text-center py-8">All stocked ✓</p> : (
                  <div className="space-y-3">
                    {lowStock.map((p) => (
                      <div key={p.id} className="flex items-center gap-3 p-3 rounded-lg bg-white/[0.02] border border-white/[0.04]">
                        <Package className="w-5 h-5 text-amber-400" />
                        <div className="flex-1"><p className="text-sm font-medium text-white/80">{p.name}</p><p className="text-xs text-white/30 font-mono">{p.sku}</p></div>
                        <Badge className={`text-[10px] ${p.stock_quantity === 0 ? "bg-red-500/20 text-red-300" : "bg-amber-500/20 text-amber-300"}`}>{p.stock_quantity} left</Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </ScrollArea>
  );
}
