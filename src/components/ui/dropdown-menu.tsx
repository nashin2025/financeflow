"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface DropdownMenuItem {
  label: string;
  onClick: () => void;
  variant?: "default" | "destructive";
}

interface DropdownMenuProps {
  trigger: React.ReactNode;
  items: DropdownMenuItem[];
  className?: string;
}

export function DropdownMenu({ trigger, items, className }: DropdownMenuProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const menuRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className={cn("relative", className)} ref={menuRef}>
      <div onClick={() => setIsOpen(!isOpen)}>{trigger}</div>
      {isOpen && (
        <div className="absolute right-0 z-50 mt-2 w-48 py-2 rounded-xl bg-background-elevated border border-white/10 shadow-lg shadow-black/20 overflow-hidden animate-fadeIn">
          {items.map((item, index) => (
            <button
              key={index}
              type="button"
              onClick={() => {
                item.onClick();
                setIsOpen(false);
              }}
              className={cn(
                "flex items-center w-full px-4 py-2.5 text-sm transition-colors",
                item.variant === "destructive"
                  ? "text-error hover:bg-error/10"
                  : "text-foreground hover:bg-white/5"
              )}
            >
              {item.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
