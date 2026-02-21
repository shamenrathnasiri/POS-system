"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { Customer } from "@/types";
import { customersApi } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  User,
  UserPlus,
  Phone,
  Search,
  X,
  Check,
  Loader2,
  ChevronDown,
} from "lucide-react";
import { toast } from "sonner";

interface CustomerSelectorProps {
  customerId: number | null;
  onCustomerChange: (customerId: number | null) => void;
}

export default function CustomerSelector({
  customerId,
  onCustomerChange,
}: CustomerSelectorProps) {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showQuickAdd, setShowQuickAdd] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoadingCustomers, setIsLoadingCustomers] = useState(false);

  // Quick-add form state
  const [phoneInput, setPhoneInput] = useState("");
  const [nameInput, setNameInput] = useState("");
  const [isSearchingPhone, setIsSearchingPhone] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [phoneLookupResult, setPhoneLookupResult] = useState<Customer | null>(null);
  const [phoneSearchDone, setPhoneSearchDone] = useState(false);

  const dropdownRef = useRef<HTMLDivElement>(null);
  const phoneDebounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  // Fetch customers list
  const fetchCustomers = useCallback(async (search?: string) => {
    setIsLoadingCustomers(true);
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const res = (await customersApi.getAll({ limit: 100, search })) as any;
      setCustomers(res.data?.customers || []);
    } catch {
      console.error("Failed to fetch customers");
    } finally {
      setIsLoadingCustomers(false);
    }
  }, []);

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Sync selectedCustomer when customerId changes externally
  useEffect(() => {
    if (customerId === null) {
      setSelectedCustomer(null);
    } else if (customerId && !selectedCustomer) {
      const found = customers.find((c) => c.id === customerId);
      if (found) setSelectedCustomer(found);
    }
  }, [customerId, customers, selectedCustomer]);

  // Filter customers by search query
  const filteredCustomers = customers.filter((c) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      c.name.toLowerCase().includes(q) ||
      (c.phone && c.phone.includes(q)) ||
      (c.email && c.email.toLowerCase().includes(q))
    );
  });

  // Select a customer
  const handleSelectCustomer = (customer: Customer) => {
    setSelectedCustomer(customer);
    onCustomerChange(customer.id);
    setShowDropdown(false);
    setSearchQuery("");
  };

  // Clear customer (go back to walk-in)
  const handleClearCustomer = () => {
    setSelectedCustomer(null);
    onCustomerChange(null);
  };

  // Auto-search phone number with debounce
  const handlePhoneChange = (value: string) => {
    setPhoneInput(value);
    setPhoneLookupResult(null);
    setPhoneSearchDone(false);

    if (phoneDebounceRef.current) clearTimeout(phoneDebounceRef.current);

    // Only search if phone has at least 4 digits
    if (value.replace(/\D/g, "").length >= 4) {
      phoneDebounceRef.current = setTimeout(async () => {
        setIsSearchingPhone(true);
        try {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const res = (await customersApi.searchByPhone(value)) as any;
          if (res.data?.customer) {
            setPhoneLookupResult(res.data.customer);
            setNameInput(res.data.customer.name || "");
          }
        } catch {
          // No match found — that's fine
        } finally {
          setIsSearchingPhone(false);
          setPhoneSearchDone(true);
        }
      }, 400);
    }
  };

  // Quick-add / select existing customer
  const handleQuickAddSubmit = async () => {
    const cleanPhone = phoneInput.trim();
    if (!cleanPhone) {
      toast.error("Phone number is required");
      return;
    }

    // If we already found an existing customer, just select them
    if (phoneLookupResult) {
      handleSelectCustomer(phoneLookupResult);
      closeQuickAdd();
      toast.success(`Selected: ${phoneLookupResult.name}`);
      return;
    }

    // Create new customer
    setIsCreating(true);
    try {
      const res = (await customersApi.quickAdd({
        phone: cleanPhone,
        name: nameInput.trim() || undefined,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      })) as any;

      const newCustomer = res.data as Customer;
      setCustomers((prev) => [newCustomer, ...prev]);
      handleSelectCustomer(newCustomer);
      closeQuickAdd();
      toast.success(
        res.message === "Customer already exists"
          ? `Selected: ${newCustomer.name}`
          : `Customer created: ${newCustomer.name}`
      );
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to add customer");
    } finally {
      setIsCreating(false);
    }
  };

  const closeQuickAdd = () => {
    setShowQuickAdd(false);
    setPhoneInput("");
    setNameInput("");
    setPhoneLookupResult(null);
    setPhoneSearchDone(false);
  };

  return (
    <>
      <div className="space-y-2">
        <p className="text-xs font-medium text-white/50 uppercase tracking-wider flex items-center gap-1.5">
          <User className="w-3 h-3" /> Customer
        </p>

        <div className="relative" ref={dropdownRef}>
          {/* Selected customer display / trigger */}
          <button
            type="button"
            onClick={() => setShowDropdown(!showDropdown)}
            className="w-full flex items-center justify-between h-9 px-3 rounded-md bg-white/5 border border-white/10 text-xs transition-colors hover:bg-white/8 hover:border-white/15"
          >
            <span className={selectedCustomer ? "text-white" : "text-white/50"}>
              {selectedCustomer
                ? `${selectedCustomer.name}${selectedCustomer.phone ? ` (${selectedCustomer.phone})` : ""}`
                : "Walk-in Customer"}
            </span>
            <div className="flex items-center gap-1">
              {selectedCustomer && (
                <span
                  onClick={(e) => {
                    e.stopPropagation();
                    handleClearCustomer();
                  }}
                  className="p-0.5 rounded hover:bg-white/10 text-white/30 hover:text-white/60"
                >
                  <X className="w-3 h-3" />
                </span>
              )}
              <ChevronDown className="w-3 h-3 text-white/30" />
            </div>
          </button>

          {/* Dropdown */}
          {showDropdown && (
            <div className="absolute z-50 top-full left-0 right-0 mt-1 rounded-lg border border-white/10 bg-slate-900 shadow-2xl shadow-black/50 overflow-hidden">
              {/* Search input */}
              <div className="p-2 border-b border-white/[0.06]">
                <div className="relative">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-white/30" />
                  <Input
                    placeholder="Search customer..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="h-8 pl-7 bg-white/5 border-white/10 text-white text-xs placeholder:text-white/30"
                    autoFocus
                  />
                </div>
              </div>

              {/* Quick-add button */}
              <button
                onClick={() => {
                  setShowDropdown(false);
                  setShowQuickAdd(true);
                }}
                className="w-full flex items-center gap-2 px-3 py-2.5 text-xs text-blue-400 hover:bg-blue-500/10 transition-colors border-b border-white/[0.06]"
              >
                <UserPlus className="w-3.5 h-3.5" />
                Quick Add Customer
              </button>

              {/* Walk-in option */}
              <button
                onClick={() => {
                  handleClearCustomer();
                  setShowDropdown(false);
                }}
                className={`w-full flex items-center gap-2 px-3 py-2 text-xs transition-colors ${
                  !selectedCustomer
                    ? "bg-blue-500/10 text-blue-300"
                    : "text-white/60 hover:bg-white/5 hover:text-white/80"
                }`}
              >
                <User className="w-3 h-3" />
                Walk-in Customer (Guest)
                {!selectedCustomer && <Check className="w-3 h-3 ml-auto" />}
              </button>

              {/* Customer list */}
              <div className="max-h-48 overflow-y-auto">
                {isLoadingCustomers ? (
                  <div className="flex items-center justify-center py-4">
                    <Loader2 className="w-4 h-4 animate-spin text-white/30" />
                  </div>
                ) : filteredCustomers.length === 0 ? (
                  <p className="text-xs text-white/30 text-center py-4">No customers found</p>
                ) : (
                  filteredCustomers.map((customer) => (
                    <button
                      key={customer.id}
                      onClick={() => handleSelectCustomer(customer)}
                      className={`w-full flex items-center justify-between px-3 py-2 text-xs transition-colors ${
                        selectedCustomer?.id === customer.id
                          ? "bg-blue-500/10 text-blue-300"
                          : "text-white/60 hover:bg-white/5 hover:text-white/80"
                      }`}
                    >
                      <div className="flex flex-col items-start">
                        <span className="font-medium">{customer.name}</span>
                        {customer.phone && (
                          <span className="text-[10px] text-white/30">{customer.phone}</span>
                        )}
                      </div>
                      {selectedCustomer?.id === customer.id && (
                        <Check className="w-3 h-3" />
                      )}
                    </button>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Quick Add Customer Dialog */}
      <Dialog open={showQuickAdd} onOpenChange={(open) => !open && closeQuickAdd()}>
        <DialogContent className="max-w-sm bg-slate-950 border-white/10 text-white">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-white text-base">
              <UserPlus className="w-4 h-4 text-blue-400" />
              Quick Add Customer
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 pt-2">
            {/* Phone number (required) */}
            <div className="space-y-1.5">
              <Label className="text-xs text-white/60">
                Phone Number <span className="text-red-400">*</span>
              </Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/30" />
                <Input
                  placeholder="Enter phone number..."
                  value={phoneInput}
                  onChange={(e) => handlePhoneChange(e.target.value)}
                  className="h-10 pl-9 bg-white/5 border-white/10 text-white text-sm placeholder:text-white/30"
                  autoFocus
                />
                {isSearchingPhone && (
                  <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 animate-spin text-blue-400" />
                )}
              </div>

              {/* Phone search result feedback */}
              {phoneSearchDone && phoneInput.trim() && (
                <div
                  className={`text-[11px] px-2 py-1.5 rounded-md ${
                    phoneLookupResult
                      ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                      : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                  }`}
                >
                  {phoneLookupResult ? (
                    <span className="flex items-center gap-1.5">
                      <Check className="w-3 h-3" />
                      Found: <strong>{phoneLookupResult.name}</strong>
                      {phoneLookupResult.phone && ` (${phoneLookupResult.phone})`}
                    </span>
                  ) : (
                    <span className="flex items-center gap-1.5">
                      <UserPlus className="w-3 h-3" />
                      New customer — will be created automatically
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Customer name (optional) */}
            {!phoneLookupResult && (
              <div className="space-y-1.5">
                <Label className="text-xs text-white/60">
                  Customer Name <span className="text-white/30">(optional)</span>
                </Label>
                <Input
                  placeholder="Enter name..."
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  className="h-10 bg-white/5 border-white/10 text-white text-sm placeholder:text-white/30"
                />
              </div>
            )}

            {/* Action buttons */}
            <div className="flex gap-2 pt-1">
              <Button
                variant="outline"
                onClick={closeQuickAdd}
                className="flex-1 h-10 border-white/10 text-white/70 hover:text-white hover:bg-white/5 text-xs"
              >
                Cancel
              </Button>
              <Button
                onClick={handleQuickAddSubmit}
                disabled={!phoneInput.trim() || isCreating}
                className="flex-1 h-10 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-medium text-xs shadow-lg shadow-blue-500/20 disabled:opacity-40"
              >
                {isCreating ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" />
                ) : phoneLookupResult ? (
                  <Check className="w-3.5 h-3.5 mr-1.5" />
                ) : (
                  <UserPlus className="w-3.5 h-3.5 mr-1.5" />
                )}
                {phoneLookupResult ? "Select Customer" : "Add & Select"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
