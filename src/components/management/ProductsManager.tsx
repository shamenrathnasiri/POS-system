"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Product, Category, ApiResponse } from "@/types";
import { productsApi, categoriesApi } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Search, Edit, Trash2, Package } from "lucide-react";
import { toast } from "sonner";

export default function ProductsManager() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [isLoading, setIsLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [form, setForm] = useState({
    name: "",
    sku: "",
    description: "",
    category_id: "",
    price: "",
    cost_price: "",
    stock_quantity: "",
    low_stock_threshold: "10",
    image_url: "",
  });

  const fetchProducts = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = (await productsApi.getAll({
        search,
        category_id: categoryFilter !== "all" ? parseInt(categoryFilter) : undefined,
        limit: 100,
      })) as ApiResponse<{ products: Product[] }>;
      setProducts(res.data?.products || []);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [search, categoryFilter]);

  const fetchCategories = useCallback(async () => {
    try {
      const res = (await categoriesApi.getAll()) as ApiResponse<{ categories: Category[] }>;
      setCategories(res.data?.categories || []);
    } catch (err) {
      console.error(err);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  useEffect(() => {
    const timeout = setTimeout(fetchProducts, 300);
    return () => clearTimeout(timeout);
  }, [fetchProducts]);

  const openCreateDialog = () => {
    setEditingProduct(null);
    setForm({
      name: "",
      sku: "",
      description: "",
      category_id: "",
      price: "",
      cost_price: "",
      stock_quantity: "",
      low_stock_threshold: "10",
      image_url: "",
    });
    setDialogOpen(true);
  };

  const openEditDialog = (product: Product) => {
    setEditingProduct(product);
    setForm({
      name: product.name,
      sku: product.sku,
      description: product.description || "",
      category_id: product.category_id.toString(),
      price: product.price.toString(),
      cost_price: product.cost_price.toString(),
      stock_quantity: product.stock_quantity.toString(),
      low_stock_threshold: product.low_stock_threshold.toString(),
      image_url: product.image_url || "",
    });
    setDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingProduct) {
        await productsApi.update(editingProduct.id, {
          ...form,
          category_id: parseInt(form.category_id),
        });
        toast.success("Product updated successfully");
      } else {
        await productsApi.create({
          ...form,
          category_id: parseInt(form.category_id),
          price: parseFloat(form.price),
          cost_price: parseFloat(form.cost_price || "0"),
          stock_quantity: parseInt(form.stock_quantity || "0"),
          low_stock_threshold: parseInt(form.low_stock_threshold || "10"),
        });
        toast.success("Product created successfully");
      }
      setDialogOpen(false);
      fetchProducts();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to save product");
    }
  };

  const handleDelete = async (product: Product) => {
    if (!confirm(`Delete "${product.name}"?`)) return;
    try {
      await productsApi.delete(product.id);
      toast.success("Product deleted");
      fetchProducts();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to delete");
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-6 border-b border-white/6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-xl font-bold text-white flex items-center gap-2">
              <Package className="w-5 h-5 text-blue-400" />
              Products
            </h1>
            <p className="text-sm text-white/40 mt-0.5">Manage your product inventory</p>
          </div>
          <Button
            onClick={openCreateDialog}
            className="bg-linear-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white shadow-lg shadow-blue-500/25"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Product
          </Button>
        </div>

        <div className="flex gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
            <Input
              placeholder="Search products..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-white/30"
            />
          </div>
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-48 bg-white/5 border-white/10 text-white">
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent className="bg-slate-900 border-white/10">
              <SelectItem value="all" className="text-white/70 focus:text-white focus:bg-white/10">All Categories</SelectItem>
              {categories.map((cat) => (
                <SelectItem key={cat.id} value={cat.id.toString()} className="text-white/70 focus:text-white focus:bg-white/10">
                  {cat.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Table */}
      <ScrollArea className="flex-1">
        <Table>
          <TableHeader>
            <TableRow className="border-white/6 hover:bg-transparent">
              <TableHead className="text-white/40">Product</TableHead>
              <TableHead className="text-white/40">SKU</TableHead>
              <TableHead className="text-white/40">Category</TableHead>
              <TableHead className="text-white/40 text-right">Price</TableHead>
              <TableHead className="text-white/40 text-right">Cost</TableHead>
              <TableHead className="text-white/40 text-right">Stock</TableHead>
              <TableHead className="text-white/40 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-white/30 py-12">
                  Loading...
                </TableCell>
              </TableRow>
            ) : products.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-white/30 py-12">
                  No products found
                </TableCell>
              </TableRow>
            ) : (
              products.map((product) => (
                <TableRow
                  key={product.id}
                  className="border-white/4 hover:bg-white/2"
                >
                  <TableCell className="font-medium text-white/80">
                    {product.name}
                  </TableCell>
                  <TableCell className="font-mono text-xs text-white/40">
                    {product.sku}
                  </TableCell>
                  <TableCell>
                    <Badge className="bg-blue-500/10 text-blue-300 border-blue-400/20 text-[10px]">
                      {product.category?.name || "—"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right text-white/70">
                    Rs. {parseFloat(product.price.toString()).toFixed(2)}
                  </TableCell>
                  <TableCell className="text-right text-white/40">
                    Rs. {parseFloat(product.cost_price.toString()).toFixed(2)}
                  </TableCell>
                  <TableCell className="text-right">
                    <Badge
                      className={`text-[10px] ${
                        product.stock_quantity <= 0
                          ? "bg-red-500/20 text-red-300 border-red-400/30"
                          : product.stock_quantity <= product.low_stock_threshold
                          ? "bg-amber-500/20 text-amber-300 border-amber-400/30"
                          : "bg-emerald-500/20 text-emerald-300 border-emerald-400/30"
                      }`}
                    >
                      {product.stock_quantity}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openEditDialog(product)}
                        className="h-8 w-8 p-0 text-white/30 hover:text-blue-400 hover:bg-blue-400/10"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(product)}
                        className="h-8 w-8 p-0 text-white/30 hover:text-red-400 hover:bg-red-400/10"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </ScrollArea>

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg bg-slate-950 border-white/10 text-white">
          <DialogHeader>
            <DialogTitle className="text-white">
              {editingProduct ? "Edit Product" : "Add New Product"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-white/60 text-xs">Name *</Label>
                <Input
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="bg-white/5 border-white/10 text-white h-9"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-white/60 text-xs">SKU *</Label>
                <Input
                  required
                  value={form.sku}
                  onChange={(e) => setForm({ ...form, sku: e.target.value })}
                  className="bg-white/5 border-white/10 text-white h-9"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-white/60 text-xs">Category *</Label>
              <Select
                value={form.category_id}
                onValueChange={(val) => setForm({ ...form, category_id: val })}
              >
                <SelectTrigger className="bg-white/5 border-white/10 text-white">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent className="bg-slate-900 border-white/10">
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id.toString()} className="text-white/70 focus:text-white focus:bg-white/10">
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-white/60 text-xs">Description</Label>
              <Textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="bg-white/5 border-white/10 text-white resize-none"
                rows={2}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-white/60 text-xs">Selling Price *</Label>
                <Input
                  type="number"
                  step="0.01"
                  required
                  value={form.price}
                  onChange={(e) => setForm({ ...form, price: e.target.value })}
                  className="bg-white/5 border-white/10 text-white h-9"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-white/60 text-xs">Cost Price</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={form.cost_price}
                  onChange={(e) => setForm({ ...form, cost_price: e.target.value })}
                  className="bg-white/5 border-white/10 text-white h-9"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-white/60 text-xs">Stock Quantity</Label>
                <Input
                  type="number"
                  value={form.stock_quantity}
                  onChange={(e) => setForm({ ...form, stock_quantity: e.target.value })}
                  className="bg-white/5 border-white/10 text-white h-9"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-white/60 text-xs">Low Stock Threshold</Label>
                <Input
                  type="number"
                  value={form.low_stock_threshold}
                  onChange={(e) => setForm({ ...form, low_stock_threshold: e.target.value })}
                  className="bg-white/5 border-white/10 text-white h-9"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-white/60 text-xs">Image URL</Label>
              <Input
                value={form.image_url}
                onChange={(e) => setForm({ ...form, image_url: e.target.value })}
                placeholder="https://..."
                className="bg-white/5 border-white/10 text-white h-9 placeholder:text-white/20"
              />
            </div>

            <div className="flex gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setDialogOpen(false)}
                className="flex-1 border-white/10 text-white/70 hover:bg-white/5"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="flex-1 bg-linear-to-r from-blue-500 to-indigo-600 text-white"
              >
                {editingProduct ? "Update Product" : "Create Product"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
