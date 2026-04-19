"use client"

import * as React from "react"
import { ChevronDown, Check } from "lucide-react"
import { cn } from "@/lib/utils"
import { motion, AnimatePresence } from "framer-motion"

export interface SelectOption {
  label: string
  value: string
}

interface SelectProps {
  label?: string
  options: SelectOption[]
  value?: string
  onChange: (value: string) => void
  placeholder?: string
  error?: string
  className?: string
}

export function Select({
  label,
  options,
  value,
  onChange,
  placeholder = "Selecione uma opção",
  error,
  className
}: SelectProps) {
  const [isOpen, setIsOpen] = React.useState(false)
  const containerRef = React.useRef<HTMLDivElement>(null)
  
  const selectedOption = options.find(opt => opt.value === value)

  // Close dropdown when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  return (
    <div className={cn("w-full", className)} ref={containerRef}>
      {label && (
        <label className="block text-[13px] font-medium text-[#94a3b8] mb-1.5 ml-1">
          {label}
        </label>
      )}

      <div className="relative">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className={cn(
            "flex items-center justify-between w-full h-[42px] bg-[#0d0d1c] border border-white/[0.08] rounded-[10px]",
            "px-3.5 py-2.5 text-[14px] text-[#f1f5f9] transition-all duration-150 outline-none",
            "focus:border-[#8b5cf680] focus:shadow-[0_0_0_3px_rgba(139,92,246,0.10)]",
            isOpen && "border-[#8b5cf680] shadow-[0_0_0_3px_rgba(139,92,246,0.10)]",
            error && "border-[#ef444480]",
          )}
        >
          <span className={cn(!selectedOption && "text-[#334155]")}>
            {selectedOption ? selectedOption.label : placeholder}
          </span>
          <ChevronDown className={cn("w-4 h-4 text-[#64748b] transition-transform", isOpen && "rotate-180")} />
        </button>

        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: 4, scale: 0.98 }}
              animate={{ opacity: 1, y: 8, scale: 1 }}
              exit={{ opacity: 0, y: 4, scale: 0.98 }}
              transition={{ duration: 0.15, ease: "easeOut" }}
              className="absolute z-50 w-full bg-[#141422] border border-white/[0.08] rounded-[12px] shadow-[0_8px_32px_rgba(0,0,0,0.6)] overflow-hidden"
            >
              <div className="p-1.5 max-h-[240px] overflow-y-auto">
                {options.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => {
                      onChange(option.value)
                      setIsOpen(false)
                    }}
                    className={cn(
                      "flex items-center justify-between w-full px-3 py-2 text-[14px] rounded-[8px] transition-colors",
                      "hover:bg-[#8b5cf60a]",
                      value === option.value 
                        ? "bg-[#8b5cf60f] text-[#a78bfa]" 
                        : "text-[#f1f5f9]"
                    )}
                  >
                    {option.label}
                    {value === option.value && <Check className="w-4 h-4" />}
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {error && (
        <p className="mt-1 text-[12px] text-[#f87171] ml-1">
          {error}
        </p>
      )}
    </div>
  )
}
