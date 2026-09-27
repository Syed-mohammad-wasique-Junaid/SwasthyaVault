"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { 
  LayoutDashboard, FileText, Activity, 
  Share2, LogOut, Menu, X, Shield
} from "lucide-react";
import { BrandLogo } from "@/components/shared/BrandLogo";
import { AtmosphericBackground } from "@/components/shared/AtmosphericBackground";

export default function PatientDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isAuthenticated, isLoading, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [patientDisplayName, setPatientDisplayName] = useState("");

  useEffect(() => {
    if (!isLoading && (!isAuthenticated || user?.role !== "patient")) {
      router.push("/patient/login");
    } else if (isAuthenticated && user?.role === "patient") {
      import("@/lib/api").then(({ api }) => {
        api.get("/patient/profile").then((res) => {
          if (res.data?.full_name) {
            setPatientDisplayName(res.data.full_name);
          }
        }).catch((err) => {
          if (err.response?.status === 404) {
            router.push("/patient/onboarding");
          }
        });
      });
    }
  }, [isAuthenticated, isLoading, user, router]);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  if (isLoading || !isAuthenticated) return null;

  const navItems = [
    { name: "Overview", icon: LayoutDashboard, href: "/patient/dashboard" },
    { name: "Health Locker", icon: FileText, href: "/patient/dashboard/locker" },
    { name: "Timeline", icon: Activity, href: "/patient/dashboard/timeline" },
    { name: "Consent", icon: Share2, href: "/patient/dashboard/consent" },
  ];

  const getInitials = (name?: string) => {
    if (!name) return "PT";
    const parts = name.trim().split(" ");
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <div className="min-h-screen bg-[#051f19] text-[#f2f9f5] flex flex-col md:flex-row relative selection:bg-emerald-500/30 selection:text-white">
      <AtmosphericBackground />

      {/* Desktop Sidebar */}
      <motion.aside 
        initial={{ x: -250 }}
        animate={{ x: 0 }}
        className="w-64 glass-dark border-r border-emerald-500/20 hidden md:flex flex-col sticky top-0 h-screen z-40"
      >
        <div className="p-6">
          {/* SwasthyaVault Logo & Symbol - Strictly Visual Only (Non-clickable) */}
          <div className="flex items-center gap-3 select-none cursor-default" title="SwasthyaVault Patient Portal">
            <div className="bg-emerald-500/20 border border-emerald-400/30 p-2 rounded-xl">
              <BrandLogo className="w-5 h-5 text-emerald-400" />
            </div>
            <span className="text-xl font-bold text-white tracking-tight cursor-default select-none font-heading">
              SwasthyaVault
            </span>
          </div>
        </div>

        <nav className="flex-1 px-4 space-y-1.5 mt-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link key={item.name} href={item.href}>
                <div 
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium text-sm ${
                    isActive 
                      ? "bg-emerald-500/20 border border-emerald-400/30 text-white shadow-sm font-semibold" 
                      : "text-emerald-200/70 hover:bg-emerald-950/40 hover:text-white"
                  }`}
                >
                  <item.icon className={`w-4 h-4 ${isActive ? "text-emerald-400" : "text-emerald-200/60"}`} />
                  {item.name}
                </div>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-emerald-500/20 space-y-2">
          <button 
            onClick={logout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-300 hover:bg-red-950/40 transition-colors font-medium text-sm"
          >
            <LogOut className="w-4 h-4 text-red-400" />
            Logout
          </button>
        </div>
      </motion.aside>

      {/* Mobile Top Header */}
      <div className="md:hidden sticky top-0 z-50 bg-[#051f19]/95 backdrop-blur-xl border-b border-emerald-500/20 px-5 py-3.5 flex items-center justify-between">
        {/* Strictly Visual Brand Mark */}
        <div className="flex items-center gap-2.5 select-none cursor-default">
          <div className="bg-emerald-500/20 border border-emerald-400/30 p-1.5 rounded-lg">
            <BrandLogo className="w-4 h-4 text-emerald-400" />
          </div>
          <span className="text-base font-bold text-white font-heading select-none cursor-default">SwasthyaVault</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-200 hover:text-white"
            aria-label="Toggle mobile menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Dropdown Menu Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden sticky top-[57px] z-40 bg-[#041713]/95 backdrop-blur-2xl border-b border-emerald-500/20 px-4 py-4 space-y-1.5 shadow-2xl"
          >
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link key={item.name} href={item.href} onClick={() => setMobileMenuOpen(false)}>
                  <div 
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                      isActive 
                        ? "bg-emerald-500/20 border border-emerald-400/30 text-white font-semibold" 
                        : "text-emerald-200/80 hover:bg-emerald-950/40 hover:text-white"
                    }`}
                  >
                    <item.icon className={`w-4 h-4 ${isActive ? "text-emerald-400" : "text-emerald-200/60"}`} />
                    {item.name}
                  </div>
                </Link>
              );
            })}
            <div className="pt-2 border-t border-emerald-500/20">
              <button 
                onClick={logout}
                className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-red-300 hover:bg-red-950/40 transition-colors font-medium text-sm"
              >
                <LogOut className="w-4 h-4 text-red-400" />
                Logout
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto min-h-screen flex flex-col">
        <header className="hidden md:flex bg-[#051f19]/80 backdrop-blur-xl border-b border-emerald-500/20 sticky top-0 z-30 px-8 py-4 items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-white tracking-tight font-heading">Patient Health Vault</h2>
          </div>
          <div className="flex items-center gap-3">
            {patientDisplayName && (
              <span className="text-xs text-emerald-200/80 font-medium">
                {patientDisplayName}
              </span>
            )}
            <div 
              className="w-9 h-9 rounded-full bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-300 font-bold text-xs shadow-sm"
              title={patientDisplayName || "Patient Account"}
            >
              {getInitials(patientDisplayName)}
            </div>
          </div>
        </header>

        <div className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto w-full flex-1">
          {children}
        </div>
      </main>
    </div>
  );
}

