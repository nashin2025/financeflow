"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { 
  LayoutDashboard, 
  Receipt, 
  PieChart, 
  Target, 
  Landmark, 
  Bot, 
  Settings, 
  User,
  ChevronLeft,
  ChevronRight
} from "lucide-react";

interface SidebarProps {
  className?: string;
}

const navItems = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/transactions", label: "Transactions", icon: Receipt },
  { href: "/budgets", label: "Budgets", icon: PieChart },
  { href: "/goals", label: "Goals", icon: Target },
  { href: "/accounts", label: "Accounts", icon: Landmark },
  { href: "/analytics", label: "Analytics", icon: PieChart },
  { href: "/ai", label: "AI Assistant", icon: Bot },
];

const bottomItems = [
  { href: "/settings", label: "Settings", icon: Settings },
  { href: "/profile", label: "Profile", icon: User },
];

export function Sidebar({ className }: SidebarProps) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = React.useState(false);

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 z-40 h-screen glass border-r border-white/5 transition-all duration-300",
        collapsed ? "w-[72px]" : "w-[240px]",
        className
      )}
    >
      <div className="flex flex-col h-full">
        {/* Logo */}
        <div className="flex items-center justify-between p-4 border-b border-white/5">
          <Link href="/" className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center">
              <span className="text-white font-bold text-sm">FF</span>
            </div>
            {!collapsed && (
              <span className="text-gradient font-bold text-lg">FinanceFlow</span>
            )}
          </Link>
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-1.5 rounded-lg hover:bg-white/10 transition-colors hidden lg:block"
          >
            {collapsed ? (
              <ChevronRight className="h-4 w-4 text-foreground-secondary" />
            ) : (
              <ChevronLeft className="h-4 w-4 text-foreground-secondary" />
            )}
          </button>
        </div>

        {/* Main Navigation */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto scrollbar-thin">
          {navItems.map((item) => {
            const isActive = pathname === item.href || 
              (item.href !== "/" && pathname.startsWith(item.href));
            
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center space-x-3 px-3 py-2.5 rounded-xl transition-all duration-200",
                  isActive 
                    ? "bg-primary-start/10 text-primary-start border-l-2 border-primary-start" 
                    : "text-foreground-secondary hover:bg-white/5 hover:text-foreground"
                )}
              >
                <item.icon className={cn("h-5 w-5 flex-shrink-0", isActive && "text-primary-start")} />
                {!collapsed && (
                  <span className="text-sm font-medium">{item.label}</span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Bottom Navigation */}
        <div className="p-3 border-t border-white/5 space-y-1">
          {bottomItems.map((item) => {
            const isActive = pathname === item.href;
            
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center space-x-3 px-3 py-2.5 rounded-xl transition-all duration-200",
                  isActive 
                    ? "bg-primary-start/10 text-primary-start" 
                    : "text-foreground-secondary hover:bg-white/5 hover:text-foreground"
                )}
              >
                <item.icon className={cn("h-5 w-5 flex-shrink-0", isActive && "text-primary-start")} />
                {!collapsed && (
                  <span className="text-sm font-medium">{item.label}</span>
                )}
              </Link>
            );
          })}
        </div>
      </div>
    </aside>
  );
}

export default Sidebar;