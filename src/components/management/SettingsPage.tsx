"use client";

import React, { useState, useEffect, useCallback } from "react";
import { User } from "@/types";
import { usersApi, authApi } from "@/lib/api-client";
import { useAuth } from "@/contexts/AuthContext";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Settings,
  Plus,
  Edit,
  Trash2,
  Users,
  Shield,
  UserCheck,
  UserX,
} from "lucide-react";
import { toast } from "sonner";

export default function SettingsPage() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "cashier" as string,
  });

  const isAdmin = currentUser?.role === "admin";

  const fetchUsers = useCallback(async () => {
    if (!isAdmin) return;
    try {
      setIsLoading(true);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const res = (await usersApi.getAll()) as any;
      setUsers(res.data?.users || []);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [isAdmin]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const openCreate = () => {
    setEditingUser(null);
    setForm({ name: "", email: "", password: "", role: "cashier" });
    setDialogOpen(true);
  };

  const openEdit = (user: User) => {
    setEditingUser(user);
    setForm({ name: user.name, email: user.email, password: "", role: user.role });
    setDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingUser) {
        const updateData: Record<string, unknown> = {
          name: form.name,
          email: form.email,
          role: form.role,
        };
        if (form.password) updateData.password = form.password;
        await usersApi.update(editingUser.id, updateData);
        toast.success("User updated");
      } else {
        if (!form.password || form.password.length < 6) {
          toast.error("Password must be at least 6 characters");
          return;
        }
        await authApi.register({
          name: form.name,
          email: form.email,
          password: form.password,
          role: form.role,
        });
        toast.success("User created");
      }
      setDialogOpen(false);
      fetchUsers();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed");
    }
  };

  const handleToggleActive = async (user: User) => {
    try {
      await usersApi.update(user.id, { is_active: !user.is_active });
      toast.success(`User ${user.is_active ? "deactivated" : "activated"}`);
      fetchUsers();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed");
    }
  };

  const handleDelete = async (user: User) => {
    if (!confirm(`Delete user "${user.name}"? This action is reversible (soft delete).`)) return;
    try {
      await usersApi.delete(user.id);
      toast.success("User deleted");
      fetchUsers();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed");
    }
  };

  const roleColor = (role: string) => {
    if (role === "admin") return "bg-red-500/10 text-red-300 border-red-400/20";
    if (role === "manager") return "bg-violet-500/10 text-violet-300 border-violet-400/20";
    return "bg-blue-500/10 text-blue-300 border-blue-400/20";
  };

  if (!isAdmin) {
    return (
      <ScrollArea className="h-full">
        <div className="p-6 space-y-6">
          <div>
            <h1 className="text-xl font-bold text-white flex items-center gap-2">
              <Settings className="w-5 h-5 text-blue-400" /> Settings
            </h1>
            <p className="text-sm text-white/40 mt-0.5">Application settings</p>
          </div>

          <Card className="border-white/[0.06] bg-white/[0.02]">
            <CardHeader>
              <CardTitle className="text-sm text-white/70">Your Account</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-white/40 text-xs mb-1">Name</p>
                  <p className="text-white/80">{currentUser?.name}</p>
                </div>
                <div>
                  <p className="text-white/40 text-xs mb-1">Email</p>
                  <p className="text-white/80">{currentUser?.email}</p>
                </div>
                <div>
                  <p className="text-white/40 text-xs mb-1">Role</p>
                  <Badge className={`${roleColor(currentUser?.role || "")} text-[10px] capitalize`}>
                    <Shield className="w-3 h-3 mr-1" />
                    {currentUser?.role}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </ScrollArea>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="p-6 border-b border-white/[0.06]">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-white flex items-center gap-2">
              <Users className="w-5 h-5 text-blue-400" />
              User Management
            </h1>
            <p className="text-sm text-white/40 mt-0.5">Manage system users and roles</p>
          </div>
          <Button
            onClick={openCreate}
            className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white shadow-lg shadow-blue-500/25"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add User
          </Button>
        </div>
      </div>

      <ScrollArea className="flex-1">
        <Table>
          <TableHeader>
            <TableRow className="border-white/[0.06] hover:bg-transparent">
              <TableHead className="text-white/40">Name</TableHead>
              <TableHead className="text-white/40">Email</TableHead>
              <TableHead className="text-white/40 text-center">Role</TableHead>
              <TableHead className="text-white/40 text-center">Status</TableHead>
              <TableHead className="text-white/40">Created</TableHead>
              <TableHead className="text-white/40 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-white/30 py-12">
                  Loading...
                </TableCell>
              </TableRow>
            ) : users.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-white/30 py-12">
                  No users found
                </TableCell>
              </TableRow>
            ) : (
              users.map((user) => (
                <TableRow key={user.id} className="border-white/[0.04] hover:bg-white/[0.02]">
                  <TableCell className="font-medium text-white/80">{user.name}</TableCell>
                  <TableCell className="text-white/40 text-sm">{user.email}</TableCell>
                  <TableCell className="text-center">
                    <Badge className={`${roleColor(user.role)} text-[10px] capitalize`}>
                      <Shield className="w-3 h-3 mr-1" />
                      {user.role}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center">
                    {user.is_active ? (
                      <Badge className="bg-emerald-500/10 text-emerald-300 border-emerald-400/20 text-[10px]">
                        <UserCheck className="w-3 h-3 mr-1" />
                        Active
                      </Badge>
                    ) : (
                      <Badge className="bg-red-500/10 text-red-300 border-red-400/20 text-[10px]">
                        <UserX className="w-3 h-3 mr-1" />
                        Inactive
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-white/30 text-xs">
                    {new Date(user.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openEdit(user)}
                        className="h-8 w-8 p-0 text-white/30 hover:text-blue-400 hover:bg-blue-400/10"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleToggleActive(user)}
                        className={`h-8 w-8 p-0 ${
                          user.is_active
                            ? "text-white/30 hover:text-amber-400 hover:bg-amber-400/10"
                            : "text-white/30 hover:text-emerald-400 hover:bg-emerald-400/10"
                        }`}
                        title={user.is_active ? "Deactivate" : "Activate"}
                      >
                        {user.is_active ? (
                          <UserX className="w-3.5 h-3.5" />
                        ) : (
                          <UserCheck className="w-3.5 h-3.5" />
                        )}
                      </Button>
                      {user.id !== currentUser?.id && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(user)}
                          className="h-8 w-8 p-0 text-white/30 hover:text-red-400 hover:bg-red-400/10"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      )}
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
        <DialogContent className="max-w-md bg-slate-950 border-white/10 text-white">
          <DialogHeader>
            <DialogTitle className="text-white">
              {editingUser ? "Edit User" : "Add New User"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
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
              <Label className="text-white/60 text-xs">Email *</Label>
              <Input
                type="email"
                required
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="bg-white/5 border-white/10 text-white h-9"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-white/60 text-xs">
                Password {editingUser ? "(leave blank to keep current)" : "*"}
              </Label>
              <Input
                type="password"
                required={!editingUser}
                minLength={6}
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                placeholder={editingUser ? "••••••••" : "Min 6 characters"}
                className="bg-white/5 border-white/10 text-white h-9 placeholder:text-white/20"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-white/60 text-xs">Role *</Label>
              <Select
                value={form.role}
                onValueChange={(val) => setForm({ ...form, role: val })}
              >
                <SelectTrigger className="bg-white/5 border-white/10 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-900 border-white/10">
                  <SelectItem value="admin" className="text-white/70 focus:text-white focus:bg-white/10">
                    Admin
                  </SelectItem>
                  <SelectItem value="manager" className="text-white/70 focus:text-white focus:bg-white/10">
                    Manager
                  </SelectItem>
                  <SelectItem value="cashier" className="text-white/70 focus:text-white focus:bg-white/10">
                    Cashier
                  </SelectItem>
                </SelectContent>
              </Select>
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
                className="flex-1 bg-gradient-to-r from-blue-500 to-indigo-600 text-white"
              >
                {editingUser ? "Update User" : "Create User"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
