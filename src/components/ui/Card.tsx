"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { ds } from "@/styles/design-system"

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  padding?: string | number
  hoverable?: boolean
  accent?: boolean
}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, children, padding, hoverable, accent, style, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "relative overflow-hidden",
          "bg-[#0f0f1a] border border-[rgba(255,255,255,0.05)] rounded-[16px]",
          "shadow-[0_1px_3px_rgba(0,0,0,0.4),0_4px_16px_rgba(0,0,0,0.2)]",
          "transition-all duration-250 ease-[cubic-bezier(0.4,0,0.2,1)]",
          hoverable && [
            "hover:bg-[#141422] hover:border-[rgba(255,255,255,0.08)]",
            "hover:shadow-[0_4px_24px_rgba(0,0,0,0.3)] hover:-translate-y-[2px]",
            "cursor-pointer"
          ],
          accent && [
            "border-[rgba(139,92,246,0.30)] shadow-[0_0_24px_rgba(139,92,246,0.08)]"
          ],
          className
        )}
        style={{ 
          padding: padding ?? (className?.includes('p-') ? undefined : '24px'),
          ...style 
        }}
        {...props}
      >
        {children}
      </div>
    )
  }
)
Card.displayName = "Card"

const CardHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("flex flex-col space-y-1.5 p-6", className)} {...props} />
))
CardHeader.displayName = "CardHeader"

const CardTitle = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLHeadingElement>>(({ className, ...props }, ref) => (
  <h3 ref={ref} className={cn("text-xl font-semibold leading-none tracking-tight text-white", className)} {...props} />
))
CardTitle.displayName = "CardTitle"

const CardDescription = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(({ className, ...props }, ref) => (
  <p ref={ref} className={cn("text-sm text-[#64748b]", className)} {...props} />
))
CardDescription.displayName = "CardDescription"

const CardContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
))
CardContent.displayName = "CardContent"

const CardFooter = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("flex items-center p-6 pt-0", className)} {...props} />
))
CardFooter.displayName = "CardFooter"

export { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter }
