"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { ds } from "@/styles/design-system"

export type BadgeStatus = 'pending' | 'paid' | 'failed' | 'refunded' | 'active' | 'inactive' | 'processing'

interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  status: BadgeStatus
  label?: string
}

const statusMap: Record<BadgeStatus, { label: string; color: string; bg: string; border: string; dot: string }> = {
  pending: { 
    label: "Pendente", 
    color: "#facc15", 
    bg: "rgba(234,179,8,0.12)", 
    border: "rgba(234,179,8,0.25)",
    dot: "#facc15"
  },
  paid: { 
    label: "Pago", 
    color: "#4ade80", 
    bg: "rgba(34,197,94,0.12)", 
    border: "rgba(34,197,94,0.25)",
    dot: "#4ade80"
  },
  failed: { 
    label: "Falhou", 
    color: "#f87171", 
    bg: "rgba(239,68,68,0.12)", 
    border: "rgba(239,68,68,0.25)",
    dot: "#f87171"
  },
  refunded: { 
    label: "Estornado", 
    color: "#60a5fa", 
    bg: "rgba(59,130,246,0.12)", 
    border: "rgba(59,130,246,0.25)",
    dot: "#60a5fa"
  },
  active: { 
    label: "Ativo", 
    color: "#4ade80", 
    bg: "rgba(34,197,94,0.12)", 
    border: "rgba(34,197,94,0.25)",
    dot: "#4ade80"
  },
  inactive: { 
    label: "Inativo", 
    color: "#94a3b8", 
    bg: "rgba(100,116,139,0.12)", 
    border: "rgba(100,116,139,0.2)",
    dot: "#94a3b8"
  },
  processing: { 
    label: "Processando", 
    color: "#a78bfa", 
    bg: "rgba(139,92,246,0.12)", 
    border: "rgba(139,92,246,0.25)",
    dot: "#a78bfa"
  },
}

function Badge({ status, label, className, ...props }: BadgeProps) {
  const config = statusMap[status] || statusMap.pending

  return (
    <div
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[12px] font-medium border transition-colors",
        className
      )}
      style={{
        backgroundColor: config.bg,
        color: config.color,
        borderColor: config.border,
      }}
      {...props}
    >
      <span 
        className="w-1 h-1 rounded-full" 
        style={{ backgroundColor: config.dot }}
      />
      {label || config.label}
    </div>
  )
}

export { Badge }
