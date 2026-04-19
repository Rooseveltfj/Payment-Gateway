"use client"

import * as React from "react"
import { SearchX } from "lucide-react"
import { cn } from "@/lib/utils"
import { Card } from "./Card"

export interface Column<T> {
  header: string
  accessor: keyof T | ((row: T) => React.ReactNode)
  className?: string
  width?: string
}

interface DataTableProps<T> {
  columns: Column<T>[]
  data: T[]
  onRowClick?: (row: T) => void
  loading?: boolean
  emptyMessage?: string
  emptyIcon?: React.ReactNode
}

export function DataTable<T>({
  columns,
  data,
  onRowClick,
  loading,
  emptyMessage = "Nenhum dado encontrado",
  emptyIcon = <SearchX className="w-12 h-12 opacity-20" />,
}: DataTableProps<T>) {
  return (
    <Card padding={0} className="overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-white/[0.02] border-bottom border-white/[0.05]">
              {columns.map((column, idx) => (
                <th
                  key={idx}
                  className={cn(
                    "px-5 py-3 text-left text-[11px] font-medium text-[#64748b] uppercase tracking-[0.06em] whitespace-nowrap",
                    column.className
                  )}
                  style={{ width: column.width }}
                >
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.04]">
            {loading ? (
              Array.from({ length: 3 }).map((_, idx) => (
                <tr key={idx} className="animate-pulse">
                  {columns.map((_, colIdx) => (
                    <td key={colIdx} className="px-5 py-4">
                      <div className="h-4 bg-white/[0.04] rounded-md w-full" />
                    </td>
                  ))}
                </tr>
              ))
            ) : data.length > 0 ? (
              data.map((row, rowIdx) => (
                <tr
                  key={rowIdx}
                  onClick={() => onRowClick?.(row)}
                  className={cn(
                    "group transition-colors duration-150",
                    onRowClick && "cursor-pointer hover:bg-[#8b5cf60a]"
                  )}
                >
                  {columns.map((column, colIdx) => (
                    <td
                      key={colIdx}
                      className={cn(
                        "px-5 py-4 text-[14px] text-[#f1f5f9] whitespace-nowrap",
                        column.className
                      )}
                    >
                      {typeof column.accessor === "function"
                        ? column.accessor(row)
                        : (row[column.accessor] as React.ReactNode)}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={columns.length}>
                  <div className="flex flex-col items-center justify-center py-20 px-4 min-h-[240px] text-center">
                    {emptyIcon}
                    <h3 className="mt-4 text-[16px] font-medium text-[#64748b]">
                      {emptyMessage}
                    </h3>
                    <p className="mt-1 text-[14px] text-[#334155]">
                      Tente ajustar seus filtros ou busca.
                    </p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </Card>
  )
}
