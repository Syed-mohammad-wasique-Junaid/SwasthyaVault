"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Users, Activity, FileText,
  Settings, LogOut, CheckCircle
} from "lucide-react";
import { BrandLogo } from "@/components/shared/BrandLogo";
import { AtmosphericBackground } from "@/components/shared/AtmosphericBackground";

export default function DoctorDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isAuthenticated, isLoading, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isLoading && (!isAuthenticated || user?.role !== "doctor")) {
      router.push("/doctor/login");
    }
  }, [isAuthenticated, isLoading, user, router]);

  const [doctorName, setDoctorName] = useState<string>("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedName = localStorage.getItem("doctor_name");
      if (storedName) {
        setDoctorName(storedName);
      }
    }
  }, []);

  const getInitials = (name?: string) => {
    if (!name) return "DR";
    const clean = name.replace(/^Dr\.?\s*/i, "").trim();
    const parts = clean.split(" ");
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return clean.slice(0, 2).toUpperCase() || "DR";
  };

  return (
    <div className="min-h-screen bg-[#051f19] text-[#f2f9f5] flex flex-col relative selection:bg-emerald-500/30 selection:text-white">
      <AtmosphericBackground />

      {/* Top Clinical Header (Full Viewport Width) */}
      <header className="bg-[#051f19]/90 backdrop-blur-xl border-b border-emerald-500/20 sticky top-0 z-40 px-6 sm:px-8 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3 select-none cursor-default" title="SwasthyaVault Clinical Portal">
            <div className="bg-emerald-500/20 border border-emerald-400/30 p-2 rounded-xl shadow-sm">
              <BrandLogo className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <span className="text-lg font-bold text-white tracking-tight flex items-center gap-2 cursor-default select-none font-heading">
                SwasthyaVault <span className="text-emerald-400 font-semibold text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-400/30">Clinical Portal</span>
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right hidden sm:block">
            <p className="text-xs font-bold text-white">{doctorName || "Clinical Provider"}</p>
            <p className="text-[10px] text-emerald-200/60 font-mono">SwasthyaVault Doctor Network</p>
          </div>
          
          <div 
            className="w-9 h-9 rounded-full bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-300 font-bold text-xs shadow-sm"
            title={doctorName || "Doctor Account"}
          >
            {getInitials(doctorName)}
          </div>

          <button
            onClick={logout}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-950/30 border border-red-500/20 hover:border-red-400/40 text-red-300 hover:text-white hover:bg-red-900/40 transition-all text-xs font-semibold shadow-sm"
            title="Sign out of Clinical Portal"
          >
            <LogOut className="w-3.5 h-3.5 text-red-400" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </header>

      {/* Main Content Area (Full Width) */}
      <main className="flex-1 w-full p-6 sm:p-8 max-w-7xl mx-auto">
        {children}
      </main>
    </div>
  );
}
