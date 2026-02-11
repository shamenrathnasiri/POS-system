"use client";

import React, { useState, useRef } from "react";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import { salesApi } from "@/lib/api-client";
import { Sale } from "@/types";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Loader2, CheckCircle2, Printer, X, FileText } from "lucide-react";
import { toast } from "sonner";

interface PaymentModalProps {
  open: boolean;
  onClose: () => void;
}

export default function PaymentModal({ open, onClose }: PaymentModalProps) {
  const { state, totals, clearCart } = useCart();
  const { user } = useAuth();
  const [isProcessing, setIsProcessing] = useState(false);
  const [completedSale, setCompletedSale] = useState<Sale | null>(null);
  const invoiceRef = useRef<HTMLDivElement>(null);

  const handleCompleteSale = async () => {
    setIsProcessing(true);

    try {
      const saleData = {
        items: state.items.map((item) => ({
          product_id: item.product_id,
          quantity: item.quantity,
          discount: item.discount,
        })),
        customer_id: state.customer_id,
        discount_type: state.discount_type,
        discount_value: state.discount_value,
        tax_rate: state.tax_rate,
        payment_method: state.payment_method,
        amount_paid: state.payment_method === "cash" ? state.amount_paid : totals.grandTotal,
        notes: state.notes || undefined,
      };

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const res = await salesApi.create(saleData) as any;
      setCompletedSale(res.data);
      toast.success("Sale completed successfully!");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to complete sale");
      setIsProcessing(false);
    }
  };

  const handlePrint = () => {
    if (invoiceRef.current) {
      const printWindow = window.open("", "_blank");
      if (printWindow) {
        printWindow.document.write(`
          <html>
            <head>
              <title>Invoice ${completedSale?.invoice_number}</title>
              <style>
                body { font-family: 'Courier New', monospace; padding: 20px; max-width: 300px; margin: 0 auto; }
                .header { text-align: center; margin-bottom: 20px; }
                .header h1 { font-size: 18px; margin: 0; }
                .header p { font-size: 12px; color: #666; margin: 4px 0; }
                .divider { border-top: 1px dashed #ccc; margin: 10px 0; }
                .item { display: flex; justify-content: space-between; font-size: 12px; margin: 4px 0; }
                .total { font-weight: bold; font-size: 14px; }
                .footer { text-align: center; font-size: 11px; color: #999; margin-top: 20px; }
              </style>
            </head>
            <body>
              ${invoiceRef.current.innerHTML}
            </body>
          </html>
        `);
        printWindow.document.close();
        printWindow.print();
      }
    }
  };

  const handleClose = () => {
    if (completedSale) {
      clearCart();
      setCompletedSale(null);
    }
    setIsProcessing(false);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg bg-slate-950 border-white/10 text-white">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-white">
            {completedSale ? (
              <>
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                Sale Completed
              </>
            ) : (
              <>
                <FileText className="w-5 h-5 text-blue-400" />
                Confirm Payment
              </>
            )}
          </DialogTitle>
        </DialogHeader>

        {!completedSale ? (
          <div className="space-y-4">
            {/* Order Summary */}
            <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4 space-y-3">
              <p className="text-xs font-medium text-white/40 uppercase tracking-wider">Order Summary</p>
              {state.items.map((item) => (
                <div key={item.product_id} className="flex justify-between text-sm">
                  <span className="text-white/70">
                    {item.product_name} × {item.quantity}
                  </span>
                  <span className="text-white/90">
                    Rs. {(item.unit_price * item.quantity).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>

            <Separator className="bg-white/[0.06]" />

            {/* Totals */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm text-white/50">
                <span>Subtotal</span>
                <span>Rs. {totals.subtotal.toFixed(2)}</span>
              </div>
              {totals.discountAmount > 0 && (
                <div className="flex justify-between text-sm text-emerald-400/70">
                  <span>Discount ({state.discount_type === "percentage" ? `${state.discount_value}%` : "Fixed"})</span>
                  <span>- Rs. {totals.discountAmount.toFixed(2)}</span>
                </div>
              )}
              {totals.taxAmount > 0 && (
                <div className="flex justify-between text-sm text-white/50">
                  <span>Tax ({state.tax_rate}%)</span>
                  <span>Rs. {totals.taxAmount.toFixed(2)}</span>
                </div>
              )}
              <Separator className="bg-white/[0.06]" />
              <div className="flex justify-between text-xl font-bold">
                <span>Grand Total</span>
                <span className="bg-gradient-to-r from-blue-300 to-indigo-300 bg-clip-text text-transparent">
                  Rs. {totals.grandTotal.toFixed(2)}
                </span>
              </div>

              <div className="flex justify-between text-sm text-white/50">
                <span>Payment Method</span>
                <span className="capitalize text-white/70">{state.payment_method}</span>
              </div>
              {state.payment_method === "cash" && (
                <>
                  <div className="flex justify-between text-sm text-white/50">
                    <span>Amount Paid</span>
                    <span className="text-white/70">Rs. {state.amount_paid.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm text-emerald-400">
                    <span>Change</span>
                    <span>Rs. {totals.changeAmount.toFixed(2)}</span>
                  </div>
                </>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-2">
              <Button
                variant="outline"
                onClick={handleClose}
                className="flex-1 border-white/10 text-white/70 hover:text-white hover:bg-white/5"
              >
                <X className="w-4 h-4 mr-2" />
                Cancel
              </Button>
              <Button
                onClick={handleCompleteSale}
                disabled={isProcessing}
                className="flex-1 bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white font-semibold shadow-lg shadow-emerald-500/25"
              >
                {isProcessing ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : (
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                )}
                Confirm Sale
              </Button>
            </div>
          </div>
        ) : (
          /* Sale Complete — Invoice Preview */
          <div className="space-y-4">
            <div
              ref={invoiceRef}
              className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-6"
            >
              <div className="text-center mb-4">
                <h3 className="text-lg font-bold text-white">
                  {process.env.NEXT_PUBLIC_APP_NAME || "StylePOS"}
                </h3>
                <p className="text-xs text-white/40 mt-1">Clothing & Gift Items</p>
                <p className="text-xs text-white/30 mt-2 font-mono">
                  Invoice: {completedSale.invoice_number}
                </p>
                <p className="text-xs text-white/30">
                  {new Date(completedSale.created_at).toLocaleString()}
                </p>
                <p className="text-xs text-white/30">
                  Cashier: {user?.name}
                </p>
              </div>

              <Separator className="bg-white/[0.06] my-3" />

              {completedSale.items?.map((item, idx) => (
                <div key={idx} className="flex justify-between text-xs text-white/60 py-1">
                  <span className="flex-1">
                    {item.product_name} × {item.quantity}
                  </span>
                  <span>Rs. {parseFloat(item.total.toString()).toFixed(2)}</span>
                </div>
              ))}

              <Separator className="bg-white/[0.06] my-3" />

              <div className="space-y-1 text-xs">
                <div className="flex justify-between text-white/50">
                  <span>Subtotal</span>
                  <span>Rs. {parseFloat(completedSale.subtotal.toString()).toFixed(2)}</span>
                </div>
                {parseFloat(completedSale.discount_amount.toString()) > 0 && (
                  <div className="flex justify-between text-emerald-400/70">
                    <span>Discount</span>
                    <span>- Rs. {parseFloat(completedSale.discount_amount.toString()).toFixed(2)}</span>
                  </div>
                )}
                {parseFloat(completedSale.tax_amount.toString()) > 0 && (
                  <div className="flex justify-between text-white/50">
                    <span>Tax</span>
                    <span>Rs. {parseFloat(completedSale.tax_amount.toString()).toFixed(2)}</span>
                  </div>
                )}
                <Separator className="bg-white/[0.06] my-2" />
                <div className="flex justify-between text-sm font-bold text-white">
                  <span>Total</span>
                  <span>Rs. {parseFloat(completedSale.grand_total.toString()).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-white/50">
                  <span>Paid ({completedSale.payment_method})</span>
                  <span>Rs. {parseFloat(completedSale.amount_paid.toString()).toFixed(2)}</span>
                </div>
                {parseFloat(completedSale.change_amount.toString()) > 0 && (
                  <div className="flex justify-between text-emerald-400">
                    <span>Change</span>
                    <span>Rs. {parseFloat(completedSale.change_amount.toString()).toFixed(2)}</span>
                  </div>
                )}
              </div>

              <div className="text-center mt-4 text-[10px] text-white/30">
                Thank you for your purchase!
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <Button
                onClick={handlePrint}
                variant="outline"
                className="flex-1 border-white/10 text-white/70 hover:text-white hover:bg-white/5"
              >
                <Printer className="w-4 h-4 mr-2" />
                Print Invoice
              </Button>
              <Button
                onClick={handleClose}
                className="flex-1 bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-semibold"
              >
                New Sale
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
