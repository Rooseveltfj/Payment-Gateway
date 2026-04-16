"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { MoreVertical } from "lucide-react";

interface DropdownMenuProps {
  children: React.ReactNode;
}

export function DropdownMenu({ children }: DropdownMenuProps) {
  const [open, setOpen] = React.useState(false);
  const triggerRef = React.useRef<HTMLButtonElement>(null);
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
      <button
        ref={triggerRef}
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setOpen(!open);
        }}
        className="flex items-center justify-center rounded-md p-1.5 text-text-secondary hover:bg-hover hover:text-text-primary transition-colors focus:outline-none focus:ring-1 focus:ring-primary focus:ring-offset-1 focus:ring-offset-background"
      >
        <MoreVertical className="h-4 w-4" />
      </button>

      {open && (
        <div 
          ref={menuRef}
          onClick={(e) => e.stopPropagation()}
          className="absolute right-0 z-50 mt-2 w-48 origin-top-right rounded-md border border-border bg-card shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none animate-in fade-in zoom-in-95 duration-100"
        >
          <div className="py-1">
            {React.Children.map(children, (child) => {
              if (React.isValidElement(child)) {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                return React.cloneElement(child as React.ReactElement<any>, {
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  onClick: (e: any) => {
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
        </div>
      )}
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
        "flex w-full items-center px-4 py-2 text-sm transition-colors",
        danger ? "text-error hover:bg-error/10" : "text-text-secondary hover:bg-hover hover:text-text-primary",
        className
      )}
      {...props}
    >
      {Icon && <Icon className="mr-3 h-4 w-4" />}
      {children}
    </button>
  );
}
