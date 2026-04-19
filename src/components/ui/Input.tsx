"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  prefix?: React.ReactNode
  suffix?: React.ReactNode
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, label, error, prefix, suffix, id, ...props }, ref) => {
    const inputId = id || React.useId()

    return (
      <div className="w-full">
        {label && (
          <label 
            htmlFor={inputId}
            className="block text-[13px] font-medium text-[#94a3b8] mb-1.5 ml-1"
          >
            {label}
          </label>
        )}
        
        <div className="relative group">
          {prefix && (
            <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#64748b]">
              {prefix}
            </div>
          )}
          
          <input
            id={inputId}
            type={type}
            className={cn(
              "flex w-full h-[42px] bg-[#0d0d1c] border border-white/[0.08] rounded-[10px]",
              "px-3.5 py-2.5 text-[14px] text-[#f1f5f9] placeholder:text-[#334155]",
              "transition-all duration-150 outline-none",
              "focus:border-[#8b5cf680] focus:shadow-[0_0_0_3px_rgba(139,92,246,0.10)]",
              error && "border-[#ef444480] focus:border-[#ef444480] focus:shadow-[0_0_0_3px_rgba(239,68,68,0.08)]",
              prefix && "pl-10",
              suffix && "pr-10",
              className
            )}
            ref={ref}
            {...props}
          />
          
          {suffix && (
            <div className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#64748b]">
              {suffix}
            </div>
          )}
        </div>
        
        {error && (
          <p className="mt-1 text-[12px] text-[#f87171] ml-1 animate-in fade-in slide-in-from-top-1">
            {error}
          </p>
        )}
      </div>
    )
  }
)
Input.displayName = "Input"

export { Input }
