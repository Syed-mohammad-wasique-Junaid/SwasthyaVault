"use client";

import Link from "next/link";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";
import { BrandLogo } from "./BrandLogo";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";

export function Navbar() {
  const { scrollY } = useScroll();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Derived animation values based on scroll
  const backgroundY = useTransform(scrollY, [0, 60], ["rgba(5, 31, 25, 0.4)", "rgba(5, 31, 25, 0.9)"]);
  const blurY = useTransform(scrollY, [0, 60], ["blur(12px)", "blur(20px)"]);
  const borderY = useTransform(scrollY, [0, 60], ["rgba(52, 211, 153, 0.15)", "rgba(52, 211, 153, 0.3)"]);
  const shadowY = useTransform(scrollY, [0, 60], ["0px 4px 20px rgba(0,0,0,0.1)", "0px 8px 32px rgba(0, 0, 0, 0.4)"]);
  const widthY = useTransform(scrollY, [0, 60], ["92%", "85%"]);
  const paddingY = useTransform(scrollY, [0, 60], ["1.25rem", "0.75rem"]);

  useEffect(() => {
    return scrollY.on("change", (latest) => {
      setIsScrolled(latest > 20);
    });
  }, [scrollY]);

  const scrollToSection = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    if (href.startsWith("#")) {
      e.preventDefault();
      const targetId = href.replace("#", "");
      if (!targetId || targetId === "top") {
        window.scrollTo({ top: 0, behavior: "smooth" });
      } else {
        const elem = document.getElementById(targetId);
        if (elem) {
          elem.scrollIntoView({ behavior: "smooth" });
        }
      }
    }
  };

  return (
    <div className="fixed top-0 inset-x-0 z-50 flex justify-center mt-4 px-4 pointer-events-none">
      <motion.nav 
        style={{
          backgroundColor: backgroundY,
          backdropFilter: blurY,
          WebkitBackdropFilter: blurY,
          borderColor: borderY,
          boxShadow: shadowY,
          width: widthY,
          paddingTop: paddingY,
          paddingBottom: paddingY,
        }}
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="relative pointer-events-auto border rounded-full px-6 flex items-center justify-between max-w-6xl w-full transition-all duration-300"
      >
        {/* Brand Logo (Non-clickable visual mark) */}
        <div className="flex items-center gap-3 select-none cursor-default">
          <div className="bg-emerald-500/20 border border-emerald-400/30 p-2 rounded-xl">
            <BrandLogo className="w-5 h-5 text-emerald-400" />
          </div>
          <span className="text-xl font-bold text-white tracking-tight font-brand cursor-default select-none">SwasthyaVault</span>
        </div>
        
        {/* Public Navigation Links */}
        <div className="hidden md:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 items-center gap-8 font-medium text-emerald-100/80 text-sm font-nav">
          <a 
            href="#top" 
            onClick={(e) => scrollToSection(e, "#top")}
            className="hover:text-white transition-colors"
          >
            Home
          </a>
          <a 
            href="#how-it-works" 
            onClick={(e) => scrollToSection(e, "#how-it-works")}
            className="hover:text-white transition-colors"
          >
            How It Works
          </a>
          <a 
            href="#about-us" 
            onClick={(e) => scrollToSection(e, "#about-us")}
            className="hover:text-white transition-colors"
          >
            About Us
          </a>
        </div>

        {/* Action Controls */}
        <div className="hidden md:flex items-center gap-4">
          <Link href="/patient/login">
            <Button variant="secondary" className="rounded-full px-6 text-sm">
              Patient Access
            </Button>
          </Link>
          <Link href="/doctor/login">
            <Button variant="secondary" className="rounded-full px-6 text-sm">
              Doctor Access
            </Button>
          </Link>
        </div>

        {/* Mobile Menu Toggle */}
        <button 
          className="md:hidden p-2 text-emerald-200 hover:text-white" 
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle Navigation Menu"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </motion.nav>

      {/* Mobile Dropdown Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute top-full left-4 right-4 mt-3 bg-[#06241e]/95 backdrop-blur-2xl border border-emerald-500/30 rounded-3xl p-6 shadow-2xl flex flex-col gap-4 pointer-events-auto"
          >
             <a 
               href="#top" 
               onClick={(e) => { scrollToSection(e, "#top"); setMobileMenuOpen(false); }} 
               className="text-lg font-medium text-emerald-50 py-2 border-b border-emerald-500/20"
             >
               Home
             </a>
             <a 
               href="#how-it-works" 
               onClick={(e) => { scrollToSection(e, "#how-it-works"); setMobileMenuOpen(false); }} 
               className="text-lg font-medium text-emerald-50 py-2 border-b border-emerald-500/20"
             >
               How It Works
             </a>
             <a 
               href="#about-us" 
               onClick={(e) => { scrollToSection(e, "#about-us"); setMobileMenuOpen(false); }} 
               className="text-lg font-medium text-emerald-50 py-2 border-b border-emerald-500/20"
             >
               About Us
             </a>
             <div className="flex flex-col gap-3 mt-4">
                <Link href="/patient/login" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="secondary" className="w-full rounded-2xl">Patient Access</Button>
                </Link>
                <Link href="/doctor/login" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="secondary" className="w-full rounded-2xl">Doctor Access</Button>
                </Link>
             </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
