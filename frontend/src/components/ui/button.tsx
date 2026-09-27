import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-xl text-sm font-medium font-nav transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98]",
  {
    variants: {
      variant: {
        default: "bg-emerald-800 text-white hover:bg-emerald-700 shadow-sm border border-emerald-600/30",
        primary: "bg-[#062920]/80 hover:bg-[#083328]/90 text-white font-semibold shadow-[0_0_15px_rgba(52,211,153,0.1)] hover:shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:-translate-y-0.5 border border-emerald-400/30 backdrop-blur-md transition-all duration-200",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow-sm",
        outline: "border border-emerald-500/20 bg-emerald-950/20 hover:bg-emerald-900/40 text-emerald-100 backdrop-blur-md",
        secondary: "bg-emerald-900/40 hover:bg-emerald-800/50 text-emerald-50 border border-emerald-500/30 hover:border-emerald-400/60 shadow-sm hover:shadow-[0_0_15px_rgba(255,255,255,0.12)] hover:-translate-y-[1px] backdrop-blur-md transition-all duration-300",
        ghost: "hover:bg-emerald-900/30 text-emerald-200 hover:text-white",
        link: "text-emerald-400 underline-offset-4 hover:underline",
      },
      size: {
        default: "h-11 px-5 py-2.5",
        sm: "h-9 rounded-lg px-3.5 text-xs",
        lg: "h-12 rounded-xl px-8 text-base",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
