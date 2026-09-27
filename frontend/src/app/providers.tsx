"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { AuthProvider } from "@/context/AuthContext";
import { usePathname } from "next/navigation";

function TypographyScaler() {
  const pathname = usePathname();

  useEffect(() => {
    if (pathname === "/") {
      document.body.classList.remove("typography-compact");
    } else {
      document.body.classList.add("typography-compact");
    }
  }, [pathname]);

  return null;
}

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TypographyScaler />
        {children}
      </AuthProvider>
    </QueryClientProvider>
  );
}
