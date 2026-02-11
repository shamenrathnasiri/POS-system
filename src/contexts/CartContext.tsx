"use client";

import React, { createContext, useContext, useReducer, useCallback } from "react";
import { CartItem, CartState } from "@/types";

// ==========================================
// Cart Actions
// ==========================================
type CartAction =
  | { type: "ADD_ITEM"; payload: CartItem }
  | { type: "REMOVE_ITEM"; payload: number }
  | { type: "UPDATE_QUANTITY"; payload: { product_id: number; quantity: number } }
  | { type: "UPDATE_ITEM_DISCOUNT"; payload: { product_id: number; discount: number } }
  | { type: "SET_CUSTOMER"; payload: number | null }
  | { type: "SET_DISCOUNT"; payload: { type: "percentage" | "fixed" | null; value: number } }
  | { type: "SET_TAX_RATE"; payload: number }
  | { type: "SET_PAYMENT_METHOD"; payload: "cash" | "card" | "mobile" }
  | { type: "SET_AMOUNT_PAID"; payload: number }
  | { type: "SET_NOTES"; payload: string }
  | { type: "CLEAR_CART" };

const initialState: CartState = {
  items: [],
  customer_id: null,
  discount_type: null,
  discount_value: 0,
  tax_rate: parseFloat(process.env.NEXT_PUBLIC_TAX_RATE || "0"),
  payment_method: "cash",
  amount_paid: 0,
  notes: "",
};

// ==========================================
// Cart Reducer
// ==========================================
function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case "ADD_ITEM": {
      const existing = state.items.find(
        (item) => item.product_id === action.payload.product_id
      );

      if (existing) {
        const newQty = Math.min(
          existing.quantity + action.payload.quantity,
          existing.max_stock
        );

        return {
          ...state,
          items: state.items.map((item) =>
            item.product_id === action.payload.product_id
              ? { ...item, quantity: newQty }
              : item
          ),
        };
      }

      return { ...state, items: [...state.items, action.payload] };
    }

    case "REMOVE_ITEM":
      return {
        ...state,
        items: state.items.filter((item) => item.product_id !== action.payload),
      };

    case "UPDATE_QUANTITY": {
      const { product_id, quantity } = action.payload;
      if (quantity <= 0) {
        return {
          ...state,
          items: state.items.filter((item) => item.product_id !== product_id),
        };
      }

      return {
        ...state,
        items: state.items.map((item) =>
          item.product_id === product_id
            ? { ...item, quantity: Math.min(quantity, item.max_stock) }
            : item
        ),
      };
    }

    case "UPDATE_ITEM_DISCOUNT":
      return {
        ...state,
        items: state.items.map((item) =>
          item.product_id === action.payload.product_id
            ? { ...item, discount: action.payload.discount }
            : item
        ),
      };

    case "SET_CUSTOMER":
      return { ...state, customer_id: action.payload };

    case "SET_DISCOUNT":
      return {
        ...state,
        discount_type: action.payload.type,
        discount_value: action.payload.value,
      };

    case "SET_TAX_RATE":
      return { ...state, tax_rate: action.payload };

    case "SET_PAYMENT_METHOD":
      return { ...state, payment_method: action.payload };

    case "SET_AMOUNT_PAID":
      return { ...state, amount_paid: action.payload };

    case "SET_NOTES":
      return { ...state, notes: action.payload };

    case "CLEAR_CART":
      return { ...initialState };

    default:
      return state;
  }
}

// ==========================================
// Cart Calculations
// ==========================================
export function calculateCartTotals(state: CartState) {
  const subtotal = state.items.reduce((sum, item) => {
    const itemTotal = item.unit_price * item.quantity - item.discount;
    return sum + Math.max(0, itemTotal);
  }, 0);

  let discountAmount = 0;
  if (state.discount_type === "percentage" && state.discount_value > 0) {
    discountAmount = (subtotal * state.discount_value) / 100;
  } else if (state.discount_type === "fixed" && state.discount_value > 0) {
    discountAmount = state.discount_value;
  }

  const taxableAmount = Math.max(0, subtotal - discountAmount);
  const taxAmount = (taxableAmount * state.tax_rate) / 100;
  const grandTotal = taxableAmount + taxAmount;
  const changeAmount = Math.max(0, state.amount_paid - grandTotal);

  return {
    subtotal: parseFloat(subtotal.toFixed(2)),
    discountAmount: parseFloat(discountAmount.toFixed(2)),
    taxAmount: parseFloat(taxAmount.toFixed(2)),
    grandTotal: parseFloat(grandTotal.toFixed(2)),
    changeAmount: parseFloat(changeAmount.toFixed(2)),
    itemCount: state.items.reduce((sum, item) => sum + item.quantity, 0),
  };
}

// ==========================================
// Context
// ==========================================
interface CartContextType {
  state: CartState;
  dispatch: React.Dispatch<CartAction>;
  addItem: (item: CartItem) => void;
  removeItem: (productId: number) => void;
  updateQuantity: (productId: number, quantity: number) => void;
  updateItemDiscount: (productId: number, discount: number) => void;
  setCustomer: (customerId: number | null) => void;
  setDiscount: (type: "percentage" | "fixed" | null, value: number) => void;
  setTaxRate: (rate: number) => void;
  setPaymentMethod: (method: "cash" | "card" | "mobile") => void;
  setAmountPaid: (amount: number) => void;
  setNotes: (notes: string) => void;
  clearCart: () => void;
  totals: ReturnType<typeof calculateCartTotals>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, initialState);

  const addItem = useCallback(
    (item: CartItem) => dispatch({ type: "ADD_ITEM", payload: item }),
    []
  );

  const removeItem = useCallback(
    (productId: number) => dispatch({ type: "REMOVE_ITEM", payload: productId }),
    []
  );

  const updateQuantity = useCallback(
    (productId: number, quantity: number) =>
      dispatch({ type: "UPDATE_QUANTITY", payload: { product_id: productId, quantity } }),
    []
  );

  const updateItemDiscount = useCallback(
    (productId: number, discount: number) =>
      dispatch({ type: "UPDATE_ITEM_DISCOUNT", payload: { product_id: productId, discount } }),
    []
  );

  const setCustomer = useCallback(
    (customerId: number | null) => dispatch({ type: "SET_CUSTOMER", payload: customerId }),
    []
  );

  const setDiscount = useCallback(
    (type: "percentage" | "fixed" | null, value: number) =>
      dispatch({ type: "SET_DISCOUNT", payload: { type, value } }),
    []
  );

  const setTaxRate = useCallback(
    (rate: number) => dispatch({ type: "SET_TAX_RATE", payload: rate }),
    []
  );

  const setPaymentMethod = useCallback(
    (method: "cash" | "card" | "mobile") =>
      dispatch({ type: "SET_PAYMENT_METHOD", payload: method }),
    []
  );

  const setAmountPaid = useCallback(
    (amount: number) => dispatch({ type: "SET_AMOUNT_PAID", payload: amount }),
    []
  );

  const setNotes = useCallback(
    (notes: string) => dispatch({ type: "SET_NOTES", payload: notes }),
    []
  );

  const clearCart = useCallback(() => dispatch({ type: "CLEAR_CART" }), []);

  const totals = calculateCartTotals(state);

  return (
    <CartContext.Provider
      value={{
        state,
        dispatch,
        addItem,
        removeItem,
        updateQuantity,
        updateItemDiscount,
        setCustomer,
        setDiscount,
        setTaxRate,
        setPaymentMethod,
        setAmountPaid,
        setNotes,
        clearCart,
        totals,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
