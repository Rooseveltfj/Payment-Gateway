"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { MoreVertical } from "lucide-react";
import { ds } from "@/styles/design-system";
import { motion, AnimatePresence } from "framer-motion";

interface DropdownMenuProps {
  children: React.ReactNode;
  trigger?: React.ReactNode;
  align?: "left" | "right";
}

export function DropdownMenu({ children, trigger, align = "right" }: DropdownMenuProps) {
  const [open, setOpen] = React.useState(false);
  const triggerRef = React.useRef<HTMLDivElement>(null);
  const menuRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        menuRef.current && 
        !menuRef.current.contains(event.target as Node) &&
        triggerRef.current &&
        !triggerRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative inline-block text-left">
      <div
        ref={triggerRef}
        onClick={(e) => {
          e.stopPropagation();
          setOpen(!open);
        }}
        className="cursor-pointer"
      >
        {trigger || (
          <button
            type="button"
            className="flex items-center justify-center rounded-lg p-2 text-[#64748b] hover:bg-white/5 hover:text-[#f1f5f9] transition-all duration-200 focus:outline-none"
          >
            <MoreVertical className="h-4 w-4" />
          </button>
        )}
      </div>

      <AnimatePresence>
        {open && (
          <motion.div 
            ref={menuRef}
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            onClick={(e) => e.stopPropagation()}
            className={cn(
              "absolute z-[100] mt-2 w-52 origin-top rounded-[16px] border border-white/[0.08] bg-[#0f0f1acc] backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.5)] ring-1 ring-black/5 focus:outline-none",
              align === "right" ? "right-0" : "left-0"
            )}
          >
            <div className="py-2 px-1.5">
              {React.Children.map(children, (child) => {
                if (React.isValidElement(child)) {
                  return React.cloneElement(child as React.ReactElement<any>, {
                    onClick: (e: React.MouseEvent) => {
                      const childOnClick = (child.props as any).onClick;
                      if (childOnClick) {
                        childOnClick(e);
                      }
                      setOpen(false);
                    }
                  });
                }
                return child;
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

interface DropdownMenuItemProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon?: React.ElementType;
  danger?: boolean;
}

export function DropdownMenuItem({ children, icon: Icon, danger, className, ...props }: DropdownMenuItemProps) {
  return (
    <button
      className={cn(
        "flex w-full items-center px-3 py-2.5 text-[13px] font-medium rounded-[10px] transition-all duration-200",
        danger 
          ? "text-[#f87171] hover:bg-[#ef44441a]" 
          : "text-[#94a3b8] hover:bg-white/[0.05] hover:text-[#f1f5f9]",
        className
      )}
      {...props}
    >
      {Icon && <Icon className={cn("mr-3 h-4 w-4", danger ? "text-[#f87171]" : "text-[#8b5cf6]")} />}
      {children}
    </button>
  );
}
