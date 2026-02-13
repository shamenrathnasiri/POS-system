"use client";
import React, { useState, useEffect, useCallback } from "react";
import { ApiResponse, Pagination, Sale } from "@/types";
import { salesApi } from "@/lib/api-client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Receipt, Eye, ChevronLeft, ChevronRight } from "lucide-react";

export default function SalesHistory() {
  const [sales, setSales] = useState<Sale[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  const fetchSales = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = (await salesApi.getAll(page, 20)) as ApiResponse<{
        sales: Sale[];
        pagination?: Pagination;
      }>;
      setSales(res.data?.sales || []);
      setTotalPages(res.data?.pagination?.totalPages || 1);
    } catch (err) { console.error(err); }
    finally { setIsLoading(false); }
  }, [page]);

  useEffect(() => { fetchSales(); }, [fetchSales]);

  const viewDetails = async (sale: Sale) => {
    try {
      const res = (await salesApi.getById(sale.id)) as ApiResponse<Sale>;
      setSelectedSale(res.data);
      setDetailOpen(true);
    } catch (err) { console.error(err); }
  };

  const statusColor = (s: string) => {
    if (s === "completed") return "bg-emerald-500/10 text-emerald-300 border-emerald-400/20";
    if (s === "refunded") return "bg-amber-500/10 text-amber-300 border-amber-400/20";
    return "bg-red-500/10 text-red-300 border-red-400/20";
  };

  const fmt = (v: number | string) => parseFloat(v.toString()).toFixed(2);

  return (
    <div className="flex flex-col h-full">
      <div className="p-6 border-b border-white/6">
        <h1 className="text-xl font-bold text-white flex items-center gap-2">
          <Receipt className="w-5 h-5 text-blue-400" /> Sales History
        </h1>
        <p className="text-sm text-white/40 mt-0.5">View all completed transactions</p>
      </div>
      <ScrollArea className="flex-1">
        <Table>
          <TableHeader>
            <TableRow className="border-white/6 hover:bg-transparent">
              <TableHead className="text-white/40">Invoice</TableHead>
              <TableHead className="text-white/40">Date</TableHead>
              <TableHead className="text-white/40">Cashier</TableHead>
              <TableHead className="text-white/40">Customer</TableHead>
              <TableHead className="text-white/40 text-center">Status</TableHead>
              <TableHead className="text-white/40 text-right">Total</TableHead>
              <TableHead className="text-white/40 text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow><TableCell colSpan={7} className="text-center text-white/30 py-12">Loading...</TableCell></TableRow>
            ) : sales.length === 0 ? (
              <TableRow><TableCell colSpan={7} className="text-center text-white/30 py-12">No sales found</TableCell></TableRow>
            ) : sales.map((sale) => (
              <TableRow key={sale.id} className="border-white/4 hover:bg-white/2">
                <TableCell className="font-mono text-xs text-blue-300/70">{sale.invoice_number}</TableCell>
                <TableCell className="text-white/40 text-xs">{new Date(sale.created_at).toLocaleString()}</TableCell>
                <TableCell className="text-white/60 text-sm">{sale.user?.name || "—"}</TableCell>
                <TableCell className="text-white/60 text-sm">{sale.customer?.name || "Walk-in"}</TableCell>
                <TableCell className="text-center">
                  <Badge className={`text-[10px] capitalize ${statusColor(sale.status)}`}>{sale.status}</Badge>
                </TableCell>
                <TableCell className="text-right font-semibold text-white/80">Rs. {fmt(sale.grand_total)}</TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="sm" onClick={() => viewDetails(sale)} className="h-8 w-8 p-0 text-white/30 hover:text-blue-400 hover:bg-blue-400/10">
                    <Eye className="w-3.5 h-3.5" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </ScrollArea>
      <div className="p-4 border-t border-white/6 flex items-center justify-between">
        <p className="text-xs text-white/30">Page {page} of {totalPages}</p>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(page - 1)} className="h-8 border-white/10 text-white/50"><ChevronLeft className="w-4 h-4" /></Button>
          <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage(page + 1)} className="h-8 border-white/10 text-white/50"><ChevronRight className="w-4 h-4" /></Button>
        </div>
      </div>
      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="max-w-lg bg-slate-950 border-white/10 text-white">
          <DialogHeader><DialogTitle className="text-white">Invoice: {selectedSale?.invoice_number}</DialogTitle></DialogHeader>
          {selectedSale && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="text-white/40">Date: <span className="text-white/70">{new Date(selectedSale.created_at).toLocaleString()}</span></div>
                <div className="text-white/40">Cashier: <span className="text-white/70">{selectedSale.user?.name}</span></div>
                <div className="text-white/40">Customer: <span className="text-white/70">{selectedSale.customer?.name || "Walk-in"}</span></div>
                <div className="text-white/40">Payment: <span className="text-white/70 capitalize">{selectedSale.payment_method}</span></div>
              </div>
              <Separator className="bg-white/6" />
              {selectedSale.items?.map((item, idx) => (
                <div key={idx} className="flex justify-between text-sm p-2 rounded-lg bg-white/2">
                  <div><p className="text-white/80">{item.product_name}</p><p className="text-xs text-white/30">{item.quantity} × Rs. {fmt(item.unit_price)}</p></div>
                  <p className="text-white/70 font-medium">Rs. {fmt(item.total)}</p>
                </div>
              ))}
              <Separator className="bg-white/6" />
              <div className="space-y-1.5 text-sm">
                <div className="flex justify-between text-white/40"><span>Subtotal</span><span>Rs. {fmt(selectedSale.subtotal)}</span></div>
                {parseFloat(selectedSale.discount_amount.toString()) > 0 && <div className="flex justify-between text-emerald-400/70"><span>Discount</span><span>- Rs. {fmt(selectedSale.discount_amount)}</span></div>}
                <Separator className="bg-white/6" />
                <div className="flex justify-between text-lg font-bold text-white"><span>Total</span><span className="text-blue-300">Rs. {fmt(selectedSale.grand_total)}</span></div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
