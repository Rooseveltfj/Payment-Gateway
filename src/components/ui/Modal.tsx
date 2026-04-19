"use client"

import * as React from "react"
import { X } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  description?: string
  children: React.ReactNode
  maxWidth?: string // e.g. "520px"
}

export function Modal({ 
  isOpen, 
  onClose, 
  title, 
  description, 
  children, 
  maxWidth = "520px" 
}: ModalProps) {
  
  // Prevent scrolling when modal is open
  React.useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = "unset"
    }
    return () => {
      document.body.style.overflow = "unset"
    }
  }, [isOpen])

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/75 backdrop-blur-[4px]"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className={cn(
              "relative z-[101] w-full bg-[#0f0f1a] border border-white/[0.08] rounded-[20px]",
              "shadow-[0_8px_32px_rgba(0,0,0,0.6),0_2px_8px_rgba(0,0,0,0.4)]",
              "p-7 flex flex-col"
            )}
            style={{ maxWidth }}
          >
            {/* Header */}
            <div className="flex items-start justify-between mb-5">
              <div className="flex flex-col gap-1">
                {title && (
                  <h2 className="text-[18px] font-semibold text-[#f1f5f9]">
                    {title}
                  </h2>
                )}
                {description && (
                  <p className="text-[14px] text-[#64748b]">
                    {description}
                  </p>
                )}
              </div>
              
              <button
                onClick={onClose}
                className="w-8 h-8 flex items-center justify-center rounded-[8px] transition-colors hover:bg-white/0.06 text-[#64748b] hover:text-[#f1f5f9]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1">
              {children}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
