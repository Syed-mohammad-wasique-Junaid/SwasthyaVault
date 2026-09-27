import { SVGProps } from "react";

export interface BrandLogoProps extends SVGProps<SVGSVGElement> {
  size?: "sm" | "md" | "lg" | "xl";
}

export function BrandLogo({ 
  className = "w-6 h-6 text-emerald-400", 
  size,
  ...props 
}: BrandLogoProps) {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-5 h-5",
    lg: "w-7 h-7",
    xl: "w-10 h-10",
  };

  const finalClass = size ? `${sizeClasses[size]} text-emerald-400 ${className || ""}` : className;

  return (
    <svg 
      viewBox="0 0 24 24" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={finalClass}
      aria-label="SwasthyaVault Logo"
      {...props}
    >
      {/* Outer Protective Health Vault / Shield */}
      <path 
        d="M12 2.75L19.5 6.75V12C19.5 16.5 16.3 20.3 12 21.5C7.7 20.3 4.5 16.5 4.5 12V6.75L12 2.75Z" 
        stroke="currentColor" 
        strokeWidth="1.8" 
        strokeLinecap="round" 
        strokeLinejoin="round" 
      />
      {/* Precision Medical Cross */}
      <path 
        d="M12 7.75V16.25M7.75 12H16.25" 
        stroke="currentColor" 
        strokeWidth="2.2" 
        strokeLinecap="round" 
        strokeLinejoin="round" 
      />
      {/* Core Focus Point */}
      <circle 
        cx="12" 
        cy="12" 
        r="1.2" 
        fill="currentColor" 
      />
    </svg>
  );
}
