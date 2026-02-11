"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Product, Category } from "@/types";
import { productsApi, categoriesApi } from "@/lib/api-client";
import { useCart } from "@/contexts/CartContext";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Search, Package, AlertTriangle } from "lucide-react";
import { toast } from "sonner";

export default function ProductGrid() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const { addItem } = useCart();

  const fetchProducts = useCallback(async () => {
    try {
      setIsLoading(true);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const res = await productsApi.getAll({
        search,
        category_id: selectedCategory || undefined,
        limit: 100,
      }) as any;
      setProducts(res.data?.products || []);
    } catch (error) {
      console.error("Failed to fetch products", error);
    } finally {
      setIsLoading(false);
    }
  }, [search, selectedCategory]);

  const fetchCategories = useCallback(async () => {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const res = await categoriesApi.getAll() as any;
      setCategories(res.data?.categories || []);
    } catch (error) {
      console.error("Failed to fetch categories", error);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  useEffect(() => {
    const timeout = setTimeout(fetchProducts, 300);
    return () => clearTimeout(timeout);
  }, [fetchProducts]);

  const handleAddToCart = (product: Product) => {
    if (product.stock_quantity <= 0) {
      toast.error("This product is out of stock");
      return;
    }

    addItem({
      product_id: product.id,
      product_name: product.name,
      product_sku: product.sku,
      unit_price: parseFloat(product.price.toString()),
      quantity: 1,
      discount: 0,
      max_stock: product.stock_quantity,
      image_url: product.image_url,
    });

    toast.success(`${product.name} added to cart`);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Search Bar */}
      <div className="p-4 border-b border-white/[0.06]">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
          <Input
            placeholder="Search products by name or SKU..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-white/30 h-10 focus:border-blue-400/50 focus:ring-blue-400/20"
          />
        </div>
      </div>

      {/* Category Pills */}
      <div className="px-4 py-3 border-b border-white/[0.06]">
        <ScrollArea className="w-full">
          <div className="flex gap-2 pb-1">
            <button
              onClick={() => setSelectedCategory(null)}
              className={`px-4 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all duration-200 ${
                selectedCategory === null
                  ? "bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-md shadow-blue-500/25"
                  : "bg-white/5 text-white/60 hover:bg-white/10 hover:text-white/80"
              }`}
            >
              All Items
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-4 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all duration-200 ${
                  selectedCategory === cat.id
                    ? "bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-md shadow-blue-500/25"
                    : "bg-white/5 text-white/60 hover:bg-white/10 hover:text-white/80"
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </ScrollArea>
      </div>

      {/* Product Grid */}
      <ScrollArea className="flex-1">
        <div className="p-4">
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <div className="flex flex-col items-center gap-3">
                <div className="w-8 h-8 border-2 border-blue-400/30 border-t-blue-400 rounded-full animate-spin" />
                <p className="text-white/40 text-sm">Loading products...</p>
              </div>
            </div>
          ) : products.length === 0 ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <Package className="w-12 h-12 mx-auto text-white/20 mb-3" />
                <p className="text-white/40 text-sm">No products found</p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-3">
              {products.map((product) => {
                const isLowStock = product.stock_quantity <= product.low_stock_threshold;
                const isOutOfStock = product.stock_quantity <= 0;

                return (
                  <button
                    key={product.id}
                    onClick={() => handleAddToCart(product)}
                    disabled={isOutOfStock}
                    className={`group relative rounded-xl border text-left transition-all duration-300 ${
                      isOutOfStock
                        ? "border-white/5 bg-white/[0.02] opacity-50 cursor-not-allowed"
                        : "border-white/[0.08] bg-white/[0.03] hover:bg-white/[0.08] hover:border-blue-400/30 hover:shadow-lg hover:shadow-blue-500/10 hover:scale-[1.02] active:scale-[0.98]"
                    }`}
                  >
                    {/* Product Image or Placeholder */}
                    <div className="aspect-square rounded-t-xl bg-gradient-to-br from-white/[0.05] to-white/[0.02] flex items-center justify-center overflow-hidden">
                      {product.image_url ? (
                        <img
                          src={product.image_url}
                          alt={product.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <Package className="w-10 h-10 text-white/10 group-hover:text-blue-400/30 transition-colors" />
                      )}
                    </div>

                    {/* Stock Badge */}
                    {isLowStock && !isOutOfStock && (
                      <div className="absolute top-2 right-2">
                        <Badge className="bg-amber-500/20 text-amber-300 border-amber-400/30 text-[10px] px-1.5">
                          <AlertTriangle className="w-3 h-3 mr-0.5" />
                          Low
                        </Badge>
                      </div>
                    )}
                    {isOutOfStock && (
                      <div className="absolute top-2 right-2">
                        <Badge className="bg-red-500/20 text-red-300 border-red-400/30 text-[10px] px-1.5">
                          Out
                        </Badge>
                      </div>
                    )}

                    {/* Product Info */}
                    <div className="p-3 space-y-1">
                      <p className="text-sm font-medium text-white/90 truncate group-hover:text-white transition-colors">
                        {product.name}
                      </p>
                      <p className="text-[11px] text-white/30 font-mono">{product.sku}</p>
                      <div className="flex items-center justify-between pt-1">
                        <p className="text-base font-bold bg-gradient-to-r from-blue-300 to-indigo-300 bg-clip-text text-transparent">
                          Rs. {parseFloat(product.price.toString()).toFixed(2)}
                        </p>
                        <p className="text-[11px] text-white/30">
                          Qty: {product.stock_quantity}
                        </p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
