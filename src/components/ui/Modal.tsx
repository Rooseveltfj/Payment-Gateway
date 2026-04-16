"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { X } from "lucide-react"

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  description?: string
  children: React.ReactNode
  size?: "sm" | "md" | "lg" | "xl" | "2xl"
}

export function Modal({ isOpen, onClose, title, description, children, size = "md" }: ModalProps) {
  if (!isOpen) return null

  const sizeClasses = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
    xl: "max-w-xl",
    "2xl": "max-w-2xl"
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className={cn(
        "relative z-50 w-full grid gap-4 border border-border bg-card p-6 shadow-lg duration-200 sm:rounded-3xl animate-in zoom-in-95 duration-200",
        sizeClasses[size]
      )}>
        <div className="flex flex-col space-y-1.5 text-center sm:text-left">
          {title && <h2 className="text-lg font-semibold leading-none tracking-tight text-text-primary">{title}</h2>}
          {description && <p className="text-sm text-text-secondary">{description}</p>}
        </div>
        <div>
          {children}
        </div>
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground"
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </button>
      </div>
    </div>
  )
}
