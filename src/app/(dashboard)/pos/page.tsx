"use client";
import React, { useState } from "react";
import ProductGrid from "@/components/pos/ProductGrid";
import CartPanel from "@/components/pos/CartPanel";
import PaymentModal from "@/components/pos/PaymentModal";

export default function POSPage() {
  const [paymentOpen, setPaymentOpen] = useState(false);

  return (
    <>
      <div className="flex h-full">
        {/* Product Grid — left panel */}
        <div className="flex-1 border-r border-white/[0.06] overflow-hidden">
          <ProductGrid />
        </div>
        {/* Cart — right panel */}
        <div className="w-[380px] overflow-hidden">
          <CartPanel onCheckout={() => setPaymentOpen(true)} />
        </div>
      </div>
      <PaymentModal open={paymentOpen} onClose={() => setPaymentOpen(false)} />
    </>
  );
}
