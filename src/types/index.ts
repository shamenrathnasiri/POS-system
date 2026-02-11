// ==========================================
// API Response Types
// ==========================================
export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data: T;
  errors?: string[] | null;
}

// ==========================================
// Model Types
// ==========================================
export interface User {
  id: number;
  name: string;
  email: string;
  role: "admin" | "cashier" | "manager";
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: number;
  name: string;
  description: string | null;
  is_active: boolean;
  created_at: string;
}

export interface Product {
  id: number;
  name: string;
  sku: string;
  description: string | null;
  category_id: number;
  price: number;
  cost_price: number;
  stock_quantity: number;
  low_stock_threshold: number;
  image_url: string | null;
  is_active: boolean;
  category?: Category;
  created_at: string;
}

export interface Customer {
  id: number;
  name: string;
  email: string | null;
  phone: string | null;
  address: string | null;
  loyalty_points: number;
  created_at: string;
}

export interface SaleItem {
  id?: number;
  sale_id?: number;
  product_id: number;
  product_name: string;
  product_sku: string;
  quantity: number;
  unit_price: number;
  discount: number;
  total: number;
}

export interface Sale {
  id: number;
  invoice_number: string;
  user_id: number;
  customer_id: number | null;
  subtotal: number;
  discount_amount: number;
  discount_type: "percentage" | "fixed" | null;
  discount_value: number;
  tax_rate: number;
  tax_amount: number;
  grand_total: number;
  amount_paid: number;
  change_amount: number;
  payment_method: "cash" | "card" | "mobile";
  status: "completed" | "refunded" | "cancelled";
  notes: string | null;
  user?: User;
  customer?: Customer;
  items?: SaleItem[];
  created_at: string;
}

// ==========================================
// Cart Types
// ==========================================
export interface CartItem {
  product_id: number;
  product_name: string;
  product_sku: string;
  unit_price: number;
  quantity: number;
  discount: number;
  max_stock: number;
  image_url?: string | null;
}

export interface CartState {
  items: CartItem[];
  customer_id: number | null;
  discount_type: "percentage" | "fixed" | null;
  discount_value: number;
  tax_rate: number;
  payment_method: "cash" | "card" | "mobile";
  amount_paid: number;
  notes: string;
}

// ==========================================
// Pagination
// ==========================================
export interface Pagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// ==========================================
// Report Types
// ==========================================
export interface DailyReport {
  date: string;
  totalRevenue: string;
  totalSales: number;
  totalItems: number;
  averageOrderValue: string;
  sales: Sale[];
}

export interface MonthlyReport {
  year: number;
  month: number;
  totalRevenue: string;
  totalSales: number;
  dailyBreakdown: Array<{
    date: string;
    total_sales: number;
    revenue: number;
  }>;
}

export interface TopProduct {
  product_id: number;
  product_name: string;
  total_quantity: number;
  total_revenue: number;
}

export interface LowStockReport {
  lowStockCount: number;
  products: Product[];
}
