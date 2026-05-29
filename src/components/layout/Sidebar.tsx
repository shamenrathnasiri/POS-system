"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import logoImage from "@/assests/LOGO.png";
import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  FolderOpen,
  Users,
  Receipt,
  BarChart3,
  LogOut,
  ChevronRight,
  Shield,
  Settings,
} from "lucide-react";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard, roles: ["admin", "manager"] },
  { name: "POS Terminal", href: "/pos", icon: ShoppingCart, roles: ["admin", "manager", "cashier"] },
  { name: "Products", href: "/products", icon: Package, roles: ["admin", "manager"] },
  { name: "Categories", href: "/categories", icon: FolderOpen, roles: ["admin", "manager"] },
  { name: "Customers", href: "/customers", icon: Users, roles: ["admin", "manager", "cashier"] },
  { name: "Sales History", href: "/sales", icon: Receipt, roles: ["admin", "manager", "cashier"] },
  { name: "Reports", href: "/reports", icon: BarChart3, roles: ["admin", "manager"] },
  { name: "Settings", href: "/settings", icon: Settings, roles: ["admin"] },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const filteredNav = navigation.filter(
    (item) => user && item.roles.includes(user.role)
  );

  return (
    <div className="flex flex-col h-full w-64 bg-slate-950/50 border-r border-white/[0.06] backdrop-blur-xl">
      {/* Logo */}
      <div className="p-5">
        <Link href="/pos" className="flex items-center gap-3 group">
          <div className="w-14 h-14 rounded-xl overflow-hidden border border-white/15 shadow-lg shadow-black/40 bg-transparent">
            <Image
              src={logoImage}
              alt="ABC POS logo"
              width={56}
              height={56}
              className="w-full h-full object-contain mix-blend-lighten drop-shadow-[0_0_10px_rgba(255,170,0,0.25)]"
              priority
            />
          </div>
          <div>
            <h1 className="text-lg font-bold text-white tracking-tight">
              {process.env.NEXT_PUBLIC_APP_NAME || "StylePOS"}
            </h1>
            <p className="text-[10px] text-white/30 -mt-0.5">Clothing & Gifts</p>
          </div>
        </Link>
      </div>

      <Separator className="bg-white/[0.06] mx-4" />

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1 mt-2">
        {filteredNav.map((item) => {
          const isActive = pathname === item.href || pathname?.startsWith(item.href + "/");
          const Icon = item.icon;

          return (
            <Link
              key={item.name}
              href={item.href}
              className={`group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                isActive
                  ? "bg-gradient-to-r from-blue-500/15 to-indigo-500/10 text-blue-300 border border-blue-400/20 shadow-sm shadow-blue-500/10"
                  : "text-white/50 hover:text-white/80 hover:bg-white/[0.04]"
              }`}
            >
              <Icon
                className={`w-[18px] h-[18px] transition-colors ${
                  isActive ? "text-blue-400" : "text-white/30 group-hover:text-white/50"
                }`}
              />
              <span className="flex-1">{item.name}</span>
              {isActive && <ChevronRight className="w-3.5 h-3.5 text-blue-400/50" />}
            </Link>
          );
        })}
      </nav>

      {/* User Info */}
      <div className="p-4 border-t border-white/[0.06]">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-blue-500/20 to-indigo-500/20 flex items-center justify-center">
            <span className="text-sm font-semibold text-blue-300">
              {user?.name?.charAt(0)?.toUpperCase() || "U"}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white/80 truncate">{user?.name}</p>
            <div className="flex items-center gap-1 mt-0.5">
              <Shield className="w-3 h-3 text-white/30" />
              <p className="text-[11px] text-white/30 capitalize">{user?.role}</p>
            </div>
          </div>
        </div>
        <Button
          variant="ghost"
          onClick={logout}
          className="w-full justify-start text-white/40 hover:text-red-400 hover:bg-red-400/10 text-xs h-9"
        >
          <LogOut className="w-4 h-4 mr-2" />
          Sign Out
        </Button>
      </div>
    </div>
  );
}
