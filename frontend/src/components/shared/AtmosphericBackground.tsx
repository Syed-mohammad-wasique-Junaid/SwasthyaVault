"use client";

import { motion } from "framer-motion";
import { usePathname } from "next/navigation";

export function AtmosphericBackground() {
  const pathname = usePathname();
  const isDashboard = pathname !== "/";
  
  // Dashboards use a weaker version so they remain clinical and readable
  const intensity = isDashboard ? 0.4 : 1;

  // Very large, heavily blurred CSS radial gradients for soft white atmospheric illumination
  // The opacity remains extremely low so the green background is dominant
  const softGlow = (baseOpacity: number) => ({
    background: `radial-gradient(circle, rgba(244,247,242,${baseOpacity * intensity}) 0%, rgba(244,247,242,${baseOpacity * 0.5 * intensity}) 30%, transparent 70%)`
  });

  return (
    <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden bg-[#051f19]">
      {/* Base radial gradient illumination */}
      <div className="absolute inset-0 bg-radial-illumination opacity-40" />

      {/* Light 1: Large soft white glow near the upper-center/hero area */}
      <motion.div
        animate={{
          y: [0, -20, 0],
          scale: [1, 1.05, 1],
          opacity: [0.8, 1, 0.8]
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute -top-[15%] left-[15%] w-[1200px] h-[1200px] rounded-full blur-[120px]"
        style={softGlow(0.06)}
      />

      {/* Light 2: Very faint white glow toward the middle-right */}
      <motion.div
        animate={{
          x: [0, -30, 0],
          scale: [1.02, 1, 1.02],
          opacity: [0.8, 1, 0.8]
        }}
        transition={{
          duration: 25,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute top-[20%] -right-[10%] w-[1000px] h-[1000px] rounded-full blur-[120px]"
        style={softGlow(0.04)}
      />

      {/* Light 3: Extremely faint white glow near the lower-left */}
      <motion.div
        animate={{
          y: [0, 30, 0],
          x: [0, 20, 0],
          opacity: [0.8, 1, 0.8]
        }}
        transition={{
          duration: 28,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute bottom-[0%] -left-[10%] w-[900px] h-[900px] rounded-full blur-[120px]"
        style={softGlow(0.03)}
      />

      {/* Very subtle grid lines (existing) */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `linear-gradient(to right, #ffffff 1px, transparent 1px), linear-gradient(to bottom, #ffffff 1px, transparent 1px)`,
          backgroundSize: '80px 80px',
        }}
      />
    </div>
  );
}
