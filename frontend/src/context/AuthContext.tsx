"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface User {
  id: string;
  role: "patient" | "doctor";
  name?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (token: string, role: "patient" | "doctor") => void;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    const role = localStorage.getItem("user_role") as "patient" | "doctor" | null;

    if (token && role) {
      setUser({ id: "1", role });
    }
    setIsLoading(false);
  }, []);

  const login = (token: string, role: "patient" | "doctor") => {
    localStorage.setItem("access_token", token);
    localStorage.setItem("user_role", role);
    setUser({ id: "1", role });
    router.push(`/${role}/dashboard`);
  };

  const logout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("user_role");
    setUser(null);
    router.push("/");
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
