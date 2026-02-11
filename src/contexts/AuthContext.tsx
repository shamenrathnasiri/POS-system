"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { User } from "@/types";
import { authApi } from "@/lib/api-client";

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: { name: string; email: string; password: string; role?: string }) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Restore session on mount
  useEffect(() => {
    const savedToken = localStorage.getItem("pos_token");
    if (savedToken) {
      setToken(savedToken);
      authApi
        .me()
        .then((res) => {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          setUser(res.data as any);
        })
        .catch(() => {
          localStorage.removeItem("pos_token");
          setToken(null);
        })
        .finally(() => setIsLoading(false));
    } else {
      setIsLoading(false);
    }
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const res = await authApi.login(email, password);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const data = res.data as any;
    localStorage.setItem("pos_token", data.token);
    setToken(data.token);
    setUser(data.user);
  }, []);

  const register = useCallback(
    async (data: { name: string; email: string; password: string; role?: string }) => {
      const res = await authApi.register(data);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const resData = res.data as any;
      localStorage.setItem("pos_token", resData.token);
      setToken(resData.token);
      setUser(resData.user);
    },
    []
  );

  const logout = useCallback(() => {
    localStorage.removeItem("pos_token");
    setToken(null);
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        isAuthenticated: !!user,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
