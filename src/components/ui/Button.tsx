"use client"

import * as React from "react"
import { Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg' | 'icon'
  isLoading?: boolean
  icon?: React.ReactNode
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ 
    className, 
    variant = "primary", 
    size = "md", 
    isLoading, 
    icon, 
    children, 
    disabled, 
    ...props 
  }, ref) => {
    
    const variants = {
      primary: cn(
        "bg-[#8b5cf6] text-white border-none",
        "hover:bg-[#7c3aed] hover:shadow-[0_0_20px_rgba(139,92,246,0.3)]",
      ),
      secondary: cn(
        "bg-white/[0.05] border border-white/[0.08] text-[#f1f5f9]",
        "hover:bg-white/[0.08]"
      ),
      ghost: cn(
        "bg-transparent border border-[#8b5cf64d] text-[#a78bfa]",
        "hover:bg-[#8b5cf614]"
      ),
      danger: cn(
        "bg-[#ef44441f] border border-[#ef444440] text-[#f87171]",
        "hover:bg-[#ef44442e]"
      ),
    }

    const sizes = {
      sm: "h-[32px] px-3 text-[13px] rounded-[8px]",
      md: "h-[40px] px-4 text-[14px] rounded-[10px]",
      lg: "h-[48px] px-[20px] text-[15px] rounded-[12px]",
      icon: "w-10 h-10 rounded-[10px] p-0 flex items-center justify-center",
    }

    return (
      <button
        ref={ref}
        disabled={isLoading || disabled}
        className={cn(
          "inline-flex items-center justify-center gap-2 whitespace-nowrap font-medium transition-all duration-150 active:scale-[0.98] outline-none",
          "disabled:pointer-events-none disabled:opacity-50",
          variants[variant],
          sizes[size],
          className
        )}
        {...props}
      >
        {isLoading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <>
            {icon && <span className="flex-shrink-0">{icon}</span>}
            {children}
          </>
        )}
      </button>
    )
  }
)
Button.displayName = "Button"

export { Button }
