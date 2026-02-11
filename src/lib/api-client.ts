import { ApiResponse } from "@/types";

const API_BASE = "/api";

async function getAuthHeaders(): Promise<HeadersInit> {
  const token = typeof window !== "undefined" ? localStorage.getItem("pos_token") : null;
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

async function apiRequest<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
  const headers = await getAuthHeaders();
  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers: { ...headers, ...options.headers },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "An error occurred");
  }

  return data;
}

// ==========================================
// Auth API
// ==========================================
export const authApi = {
  login: (email: string, password: string) =>
    apiRequest("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),

  register: (data: { name: string; email: string; password: string; role?: string }) =>
    apiRequest("/auth/register", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  me: () => apiRequest("/auth/me"),
};

// ==========================================
// Categories API
// ==========================================
export const categoriesApi = {
  getAll: (page = 1, limit = 50) =>
    apiRequest(`/categories?page=${page}&limit=${limit}`),

  getById: (id: number) => apiRequest(`/categories/${id}`),

  create: (data: { name: string; description?: string }) =>
    apiRequest("/categories", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  update: (id: number, data: { name?: string; description?: string }) =>
    apiRequest(`/categories/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  delete: (id: number) =>
    apiRequest(`/categories/${id}`, { method: "DELETE" }),
};

// ==========================================
// Products API
// ==========================================
export const productsApi = {
  getAll: (params?: { page?: number; limit?: number; search?: string; category_id?: number }) => {
    const query = new URLSearchParams();
    if (params?.page) query.set("page", params.page.toString());
    if (params?.limit) query.set("limit", params.limit.toString());
    if (params?.search) query.set("search", params.search);
    if (params?.category_id) query.set("category_id", params.category_id.toString());
    return apiRequest(`/products?${query.toString()}`);
  },

  getById: (id: number) => apiRequest(`/products/${id}`),

  create: (data: Partial<{
    name: string;
    sku: string;
    description: string;
    category_id: number;
    price: number;
    cost_price: number;
    stock_quantity: number;
    low_stock_threshold: number;
    image_url: string;
  }>) =>
    apiRequest("/products", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  update: (id: number, data: Record<string, unknown>) =>
    apiRequest(`/products/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  delete: (id: number) =>
    apiRequest(`/products/${id}`, { method: "DELETE" }),
};

// ==========================================
// Customers API
// ==========================================
export const customersApi = {
  getAll: (params?: { page?: number; limit?: number; search?: string }) => {
    const query = new URLSearchParams();
    if (params?.page) query.set("page", params.page.toString());
    if (params?.limit) query.set("limit", params.limit.toString());
    if (params?.search) query.set("search", params.search);
    return apiRequest(`/customers?${query.toString()}`);
  },

  getById: (id: number) => apiRequest(`/customers/${id}`),

  create: (data: { name: string; email?: string; phone?: string; address?: string }) =>
    apiRequest("/customers", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  update: (id: number, data: Record<string, unknown>) =>
    apiRequest(`/customers/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  delete: (id: number) =>
    apiRequest(`/customers/${id}`, { method: "DELETE" }),
};

// ==========================================
// Sales API
// ==========================================
export const salesApi = {
  getAll: (page = 1, limit = 20) =>
    apiRequest(`/sales?page=${page}&limit=${limit}`),

  getById: (id: number) => apiRequest(`/sales/${id}`),

  create: (data: {
    items: Array<{ product_id: number; quantity: number; discount?: number }>;
    customer_id?: number | null;
    discount_type?: string | null;
    discount_value?: number;
    tax_rate?: number;
    payment_method?: string;
    amount_paid?: number;
    notes?: string;
  }) =>
    apiRequest("/sales", {
      method: "POST",
      body: JSON.stringify(data),
    }),
};

// ==========================================
// Reports API
// ==========================================
export const reportsApi = {
  daily: (date?: string) => {
    const query = date ? `?type=daily&date=${date}` : "?type=daily";
    return apiRequest(`/reports${query}`);
  },

  monthly: (date?: string) => {
    const query = date ? `?type=monthly&date=${date}` : "?type=monthly";
    return apiRequest(`/reports${query}`);
  },

  topProducts: (limit = 10) =>
    apiRequest(`/reports?type=top-products&limit=${limit}`),

  lowStock: () => apiRequest("/reports?type=low-stock"),
};
