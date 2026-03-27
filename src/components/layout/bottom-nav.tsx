"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  Receipt, 
  Plus, 
  PieChart, 
  Settings 
} from "lucide-react";

interface BottomNavProps {
  className?: string;
}

const navItems = [
  { href: "/", label: "Home", icon: LayoutDashboard },
  { href: "/transactions", label: "Txns", icon: Receipt },
  { href: "/add", label: "Add", icon: Plus, isFAB: true },
  { href: "/analytics", label: "Stats", icon: PieChart },
  { href: "/settings", label: "More", icon: Settings },
];

export function BottomNav({ className }: BottomNavProps) {
  const pathname = usePathname();

  return (
    <nav
      className={cn(
        "fixed bottom-0 left-0 right-0 z-50 h-16 glass border-t border-white/5 px-2 flex items-center justify-between lg:hidden",
        className
      )}
    >
      {navItems.map((item) => {
        const isActive = pathname === item.href || 
          (item.href !== "/" && pathname.startsWith(item.href));
        
        if (item.isFAB) {
          return (
            <Link
              key={item.href}
              href={item.href}
              className="relative -top-4"
            >
              <div className="w-14 h-14 rounded-full gradient-primary flex items-center justify-center shadow-lg animate-pulse-glow">
                <item.icon className="h-6 w-6 text-white" />
              </div>
            </Link>
          );
        }
        
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex flex-col items-center justify-center p-2 rounded-lg transition-colors",
              isActive ? "text-primary-start" : "text-foreground-tertiary"
            )}
          >
            <item.icon className={cn("h-5 w-5", isActive && "text-primary-start")} />
            <span className="text-xs mt-1 font-medium">{item.label}</span>
            {isActive && (
              <div className="absolute bottom-0 w-6 h-0.5 bg-primary-start rounded-full" />
            )}
          </Link>
        );
      })}
    </nav>
  );
}

export default BottomNav;