"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useCart } from "@/contexts/CartContext";
import { Customer } from "@/types";
import { customersApi } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Minus,
  Plus,
  Trash2,
  ShoppingCart,
  Percent,
  DollarSign,
  CreditCard,
  Smartphone,
  Banknote,
  User,
} from "lucide-react";

interface CartPanelProps {
  onCheckout: () => void;
}

export default function CartPanel({ onCheckout }: CartPanelProps) {
  const {
    state,
    removeItem,
    updateQuantity,
    setCustomer,
    setDiscount,
    setPaymentMethod,
    setAmountPaid,
    setNotes,
    clearCart,
    totals,
  } = useCart();

  const [discountInput, setDiscountInput] = useState("");
  const [discountMode, setDiscountMode] = useState<"percentage" | "fixed">("percentage");
  const [customers, setCustomers] = useState<Customer[]>([]);

  const fetchCustomers = useCallback(async () => {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const res = (await customersApi.getAll({ limit: 200 })) as any;
      setCustomers(res.data?.customers || []);
    } catch (err) {
      console.error("Failed to fetch customers", err);
    }
  }, []);

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  const handleApplyDiscount = () => {
    const value = parseFloat(discountInput);
    if (!isNaN(value) && value >= 0) {
      setDiscount(discountMode, value);
    }
  };

  return (
    <div className="flex flex-col h-full bg-white/[0.02]">
      {/* Header */}
      <div className="p-4 border-b border-white/[0.06]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-blue-500/20 to-indigo-500/20 flex items-center justify-center">
              <ShoppingCart className="w-4.5 h-4.5 text-blue-400" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-white">Cart</h2>
              <p className="text-[11px] text-white/40">{totals.itemCount} items</p>
            </div>
          </div>
          {state.items.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearCart}
              className="text-red-400/70 hover:text-red-400 hover:bg-red-400/10 text-xs h-8"
            >
              Clear All
            </Button>
          )}
        </div>
      </div>

      {/* Cart Items */}
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-3">
          {state.items.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-white/20">
              <ShoppingCart className="w-12 h-12 mb-3" />
              <p className="text-sm">Cart is empty</p>
              <p className="text-xs mt-1">Add products to get started</p>
            </div>
          ) : (
            state.items.map((item) => (
              <div
                key={item.product_id}
                className="group rounded-lg border border-white/[0.06] bg-white/[0.03] p-3 transition-all hover:border-white/[0.1]"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white/90 truncate">
                      {item.product_name}
                    </p>
                    <p className="text-[11px] text-white/30 font-mono mt-0.5">
                      {item.product_sku}
                    </p>
                    <p className="text-xs text-blue-300/70 mt-1">
                      Rs. {item.unit_price.toFixed(2)} each
                    </p>
                  </div>
                  <button
                    onClick={() => removeItem(item.product_id)}
                    className="p-1.5 rounded-md text-white/20 hover:text-red-400 hover:bg-red-400/10 transition-colors opacity-0 group-hover:opacity-100"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="flex items-center justify-between mt-3">
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() =>
                        updateQuantity(item.product_id, item.quantity - 1)
                      }
                      className="w-7 h-7 rounded-md bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/60 hover:text-white transition-colors"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <Input
                      value={item.quantity}
                      onChange={(e) => {
                        const v = parseInt(e.target.value);
                        if (!isNaN(v)) updateQuantity(item.product_id, v);
                      }}
                      className="w-12 h-7 text-center text-xs bg-white/5 border-white/10 text-white px-1"
                    />
                    <button
                      onClick={() =>
                        updateQuantity(item.product_id, item.quantity + 1)
                      }
                      className="w-7 h-7 rounded-md bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/60 hover:text-white transition-colors"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                  <p className="text-sm font-semibold text-white">
                    Rs. {(item.unit_price * item.quantity - item.discount).toFixed(2)}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </ScrollArea>

      {/* Bottom Section */}
      {state.items.length > 0 && (
        <div className="border-t border-white/[0.06] p-4 space-y-4">
          {/* Customer Selection */}
          <div className="space-y-2">
            <p className="text-xs font-medium text-white/50 uppercase tracking-wider flex items-center gap-1.5">
              <User className="w-3 h-3" /> Customer
            </p>
            <Select
              value={state.customer_id?.toString() || "walk-in"}
              onValueChange={(val) => setCustomer(val === "walk-in" ? null : parseInt(val))}
            >
              <SelectTrigger className="h-9 bg-white/5 border-white/10 text-white text-xs">
                <SelectValue placeholder="Walk-in Customer" />
              </SelectTrigger>
              <SelectContent className="bg-slate-900 border-white/10">
                <SelectItem value="walk-in" className="text-white/70 focus:text-white focus:bg-white/10">
                  Walk-in Customer
                </SelectItem>
                {customers.map((cust) => (
                  <SelectItem
                    key={cust.id}
                    value={cust.id.toString()}
                    className="text-white/70 focus:text-white focus:bg-white/10"
                  >
                    {cust.name} {cust.phone ? `(${cust.phone})` : ""}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Discount */}
          <div className="space-y-2">
            <p className="text-xs font-medium text-white/50 uppercase tracking-wider">Discount</p>
            <div className="flex gap-1.5">
              <button
                onClick={() => setDiscountMode("percentage")}
                className={`p-2 rounded-lg transition-all ${
                  discountMode === "percentage"
                    ? "bg-blue-500/20 text-blue-400 border border-blue-400/30"
                    : "bg-white/5 text-white/40 border border-transparent hover:bg-white/8"
                }`}
              >
                <Percent className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setDiscountMode("fixed")}
                className={`p-2 rounded-lg transition-all ${
                  discountMode === "fixed"
                    ? "bg-blue-500/20 text-blue-400 border border-blue-400/30"
                    : "bg-white/5 text-white/40 border border-transparent hover:bg-white/8"
                }`}
              >
                <DollarSign className="w-3.5 h-3.5" />
              </button>
              <Input
                type="number"
                placeholder={discountMode === "percentage" ? "%" : "Amount"}
                value={discountInput}
                onChange={(e) => setDiscountInput(e.target.value)}
                className="flex-1 h-9 bg-white/5 border-white/10 text-white text-xs placeholder:text-white/30"
              />
              <Button
                onClick={handleApplyDiscount}
                size="sm"
                className="h-9 bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 text-xs border border-blue-400/20"
              >
                Apply
              </Button>
            </div>
          </div>

          {/* Payment Method */}
          <div className="space-y-2">
            <p className="text-xs font-medium text-white/50 uppercase tracking-wider">Payment</p>
            <div className="grid grid-cols-3 gap-1.5">
              {[
                { value: "cash" as const, icon: Banknote, label: "Cash" },
                { value: "card" as const, icon: CreditCard, label: "Card" },
                { value: "mobile" as const, icon: Smartphone, label: "Mobile" },
              ].map(({ value, icon: Icon, label }) => (
                <button
                  key={value}
                  onClick={() => setPaymentMethod(value)}
                  className={`flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-medium transition-all ${
                    state.payment_method === value
                      ? "bg-gradient-to-r from-blue-500/20 to-indigo-500/20 text-blue-300 border border-blue-400/30"
                      : "bg-white/5 text-white/40 border border-transparent hover:bg-white/8 hover:text-white/60"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Notes */}
          <Input
            placeholder="Add notes..."
            value={state.notes}
            onChange={(e) => setNotes(e.target.value)}
            className="h-9 bg-white/5 border-white/10 text-white text-xs placeholder:text-white/30"
          />

          <Separator className="bg-white/[0.06]" />

          {/* Totals */}
          <div className="space-y-2 text-sm">
            <div className="flex justify-between text-white/50">
              <span>Subtotal</span>
              <span>Rs. {totals.subtotal.toFixed(2)}</span>
            </div>
            {totals.discountAmount > 0 && (
              <div className="flex justify-between text-emerald-400/70">
                <span>Discount</span>
                <span>- Rs. {totals.discountAmount.toFixed(2)}</span>
              </div>
            )}
            {totals.taxAmount > 0 && (
              <div className="flex justify-between text-white/50">
                <span>Tax ({state.tax_rate}%)</span>
                <span>Rs. {totals.taxAmount.toFixed(2)}</span>
              </div>
            )}
            <Separator className="bg-white/[0.06]" />
            <div className="flex justify-between text-lg font-bold">
              <span className="text-white">Total</span>
              <span className="bg-gradient-to-r from-blue-300 to-indigo-300 bg-clip-text text-transparent">
                Rs. {totals.grandTotal.toFixed(2)}
              </span>
            </div>
          </div>

          {/* Amount Paid */}
          {state.payment_method === "cash" && (
            <div className="space-y-2">
              <p className="text-xs font-medium text-white/50 uppercase tracking-wider">Amount Received</p>
              <Input
                type="number"
                placeholder="0.00"
                value={state.amount_paid || ""}
                onChange={(e) => setAmountPaid(parseFloat(e.target.value) || 0)}
                className="h-10 bg-white/5 border-white/10 text-white text-sm placeholder:text-white/30"
              />
              {state.amount_paid > 0 && state.amount_paid >= totals.grandTotal && (
                <div className="flex justify-between text-sm text-emerald-400">
                  <span>Change</span>
                  <span>Rs. {totals.changeAmount.toFixed(2)}</span>
                </div>
              )}
            </div>
          )}

          {/* Checkout Button */}
          <Button
            onClick={onCheckout}
            disabled={
              state.items.length === 0 ||
              (state.payment_method === "cash" && state.amount_paid < totals.grandTotal)
            }
            className="w-full h-12 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-semibold text-sm shadow-lg shadow-blue-500/25 transition-all duration-300 hover:shadow-blue-500/40 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100"
          >
            Complete Sale — Rs. {totals.grandTotal.toFixed(2)}
          </Button>
        </div>
      )}
    </div>
  );
}
