"use client";

import React, { forwardRef } from "react";
import { Sale } from "@/types";

interface InvoicePrintProps {
  sale: Sale;
  shopName?: string;
  cashierName?: string;
}

const InvoicePrint = forwardRef<HTMLDivElement, InvoicePrintProps>(
  ({ sale, shopName, cashierName }, ref) => {
    const fmt = (v: number | string) => parseFloat(v.toString()).toFixed(2);

    return (
      <div ref={ref} className="font-mono text-black bg-white p-6 max-w-[300px] mx-auto text-xs">
        {/* Header */}
        <div className="text-center mb-4">
          <h1 className="text-base font-bold">{shopName || "StylePOS"}</h1>
          <p className="text-[10px] text-gray-500">Clothing & Gift Items</p>
          <div className="border-t border-dashed border-gray-400 mt-3 mb-2" />
          <p className="text-[10px] text-gray-600">Invoice: {sale.invoice_number}</p>
          <p className="text-[10px] text-gray-600">
            {new Date(sale.created_at).toLocaleString()}
          </p>
          {cashierName && (
            <p className="text-[10px] text-gray-600">Cashier: {cashierName}</p>
          )}
          {sale.customer?.name && (
            <p className="text-[10px] text-gray-600">Customer: {sale.customer.name}</p>
          )}
        </div>

        <div className="border-t border-dashed border-gray-400 my-2" />

        {/* Column Headers */}
        <div className="flex text-[10px] font-bold text-gray-700 mb-1">
          <span className="flex-1">Item</span>
          <span className="w-8 text-center">Qty</span>
          <span className="w-16 text-right">Price</span>
          <span className="w-16 text-right">Total</span>
        </div>

        <div className="border-t border-dashed border-gray-300 my-1" />

        {/* Items */}
        {sale.items?.map((item, idx) => (
          <div key={idx} className="flex text-[10px] py-0.5">
            <span className="flex-1 truncate pr-1">{item.product_name}</span>
            <span className="w-8 text-center">{item.quantity}</span>
            <span className="w-16 text-right">{fmt(item.unit_price)}</span>
            <span className="w-16 text-right">{fmt(item.total)}</span>
          </div>
        ))}

        <div className="border-t border-dashed border-gray-400 my-2" />

        {/* Totals */}
        <div className="space-y-1">
          <div className="flex justify-between text-[10px]">
            <span>Subtotal:</span>
            <span>Rs. {fmt(sale.subtotal)}</span>
          </div>

          {parseFloat(sale.discount_amount.toString()) > 0 && (
            <div className="flex justify-between text-[10px]">
              <span>
                Discount
                {sale.discount_type === "percentage"
                  ? ` (${sale.discount_value}%)`
                  : " (Fixed)"}
                :
              </span>
              <span>- Rs. {fmt(sale.discount_amount)}</span>
            </div>
          )}

          {parseFloat(sale.tax_amount.toString()) > 0 && (
            <div className="flex justify-between text-[10px]">
              <span>Tax ({sale.tax_rate}%):</span>
              <span>Rs. {fmt(sale.tax_amount)}</span>
            </div>
          )}

          <div className="border-t border-dashed border-gray-400 my-1" />

          <div className="flex justify-between font-bold text-xs">
            <span>TOTAL:</span>
            <span>Rs. {fmt(sale.grand_total)}</span>
          </div>

          <div className="flex justify-between text-[10px]">
            <span>Paid ({sale.payment_method}):</span>
            <span>Rs. {fmt(sale.amount_paid)}</span>
          </div>

          {parseFloat(sale.change_amount.toString()) > 0 && (
            <div className="flex justify-between text-[10px] font-bold">
              <span>Change:</span>
              <span>Rs. {fmt(sale.change_amount)}</span>
            </div>
          )}
        </div>

        <div className="border-t border-dashed border-gray-400 my-3" />

        {/* Footer */}
        <div className="text-center space-y-1">
          <p className="text-[10px] text-gray-600">Thank you for your purchase!</p>
          <p className="text-[9px] text-gray-400">Goods once sold are not returnable</p>
          <p className="text-[9px] text-gray-400">
            Powered by {shopName || "StylePOS"}
          </p>
        </div>
      </div>
    );
  }
);

InvoicePrint.displayName = "InvoicePrint";

export default InvoicePrint;
