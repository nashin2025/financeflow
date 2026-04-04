"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Search, Bell, Menu, X } from "lucide-react";
import { Input } from "@/components/ui";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAppStore } from "@/stores/app-store";
import { getInitials } from "@/lib/utils";

interface HeaderProps {
  className?: string;
  title?: string;
  showSearch?: boolean;
  showNotifications?: boolean;
}

const mobileNavItems = [
  { href: "/", label: "Dashboard", icon: "🏠" },
  { href: "/transactions", label: "Transactions", icon: "💳" },
  { href: "/budgets", label: "Budgets", icon: "📊" },
  { href: "/goals", label: "Goals", icon: "🎯" },
  { href: "/analytics", label: "Analytics", icon: "📈" },
  { href: "/accounts", label: "Accounts", icon: "🏦" },
  { href: "/ai", label: "AI Assistant", icon: "🤖" },
];

const bottomNavItems = [
  { href: "/settings", label: "Settings", icon: "⚙️" },
  { href: "/profile", label: "Profile", icon: "👤" },
];

export function Header({ 
  className, 
  title, 
  showSearch = true, 
  showNotifications = true,
}: HeaderProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useAppStore();
  const [searchOpen, setSearchOpen] = React.useState(false);
  const [notificationsOpen, setNotificationsOpen] = React.useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState("");
  const initials = user ? getInitials(user.name) : "AC";

  return (
    <>
      <header
        className={cn(
          "sticky top-0 z-30 h-16 glass border-b border-white/5 px-4 lg:px-6 flex items-center justify-between",
          className
        )}
      >
        <div className="flex items-center space-x-4">
          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="lg:hidden p-2 rounded-lg hover:bg-white/10 transition-colors"
          >
            <Menu className="h-5 w-5 text-foreground-secondary" />
          </button>
          
          {/* Page Title (Desktop) */}
          {title && (
            <h1 className="text-xl font-semibold text-foreground hidden lg:block">
              {title}
            </h1>
          )}
        </div>

        <div className="flex items-center space-x-3">
          {/* Search */}
          {showSearch && (
            <div className="relative hidden md:block">
              <Input
                placeholder="Search..."
                className="w-64 h-9 bg-white/5 border-white/10 focus:w-80 transition-all"
                icon={<Search className="h-4 w-4" />}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          )}
          
          {/* Mobile Search Toggle */}
          <button
            onClick={() => setSearchOpen(!searchOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-white/10 transition-colors"
          >
            <Search className="h-5 w-5 text-foreground-secondary" />
          </button>

          {/* Notifications */}
          {showNotifications && (
            <div className="relative">
              <button
                onClick={() => setNotificationsOpen(!notificationsOpen)}
                className="relative p-2 rounded-lg hover:bg-white/10 transition-colors"
              >
                <Bell className="h-5 w-5 text-foreground-secondary" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-error rounded-full" />
              </button>
              
              {/* Notifications Dropdown */}
              {notificationsOpen && (
                <div className="absolute right-0 top-full mt-2 w-80 glass-elevated rounded-xl p-4 animate-fadeIn">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-foreground">Notifications</h3>
                    <button
                      className="text-sm text-primary-start hover:underline"
                      onClick={() => {
                        setNotificationsOpen(false);
                        router.push("/notifications");
                      }}
                    >
                      Mark all read
                    </button>
                  </div>
                  <div className="space-y-3">
                    <div className="p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors cursor-pointer">
                      <p className="text-sm text-foreground">Budget alert: Dining Out at 75%</p>
                      <p className="text-xs text-foreground-tertiary mt-1">2 hours ago</p>
                    </div>
                    <div className="p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors cursor-pointer">
                      <p className="text-sm text-foreground">Goal milestone: Emergency Fund 50%</p>
                      <p className="text-xs text-foreground-tertiary mt-1">Yesterday</p>
                    </div>
                  </div>
                  <Link 
                    href="/notifications" 
                    className="block text-center text-sm text-primary-start mt-3 pt-3 border-t border-white/10"
                  >
                    View all notifications
                  </Link>
                </div>
              )}
            </div>
          )}

          {/* User Avatar */}
          <Link href="/profile" className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-full gradient-primary flex items-center justify-center">
              <span className="text-white text-sm font-medium">{initials}</span>
            </div>
          </Link>
        </div>

        {/* Mobile Search Overlay */}
        {searchOpen && (
          <div className="absolute inset-x-0 top-16 p-4 bg-background-secondary border-b border-white/5 md:hidden animate-slideUp">
            <Input
              placeholder="Search transactions, budgets..."
              icon={<Search className="h-4 w-4" />}
              iconRight={
                <button onClick={() => setSearchOpen(false)}>
                  <X className="h-4 w-4 text-foreground-secondary" />
                </button>
              }
            />
          </div>
        )}
      </header>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={() => setMobileMenuOpen(false)}
          />
          
          {/* Drawer */}
          <div className="fixed left-0 top-0 h-full w-72 bg-background-secondary z-50 lg:hidden animate-slideLeft">
            <div className="flex flex-col h-full">
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-white/5">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center">
                    <span className="text-white font-bold text-sm">FF</span>
                  </div>
                  <span className="text-gradient font-bold text-lg">FinanceFlow</span>
                </div>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                >
                  <X className="h-5 w-5 text-foreground-secondary" />
                </button>
              </div>

              {/* Main Navigation */}
              <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                {mobileNavItems.map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={cn(
                        "flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200",
                        isActive 
                          ? "bg-primary-start/10 text-primary-start" 
                          : "text-foreground-secondary hover:bg-white/5 hover:text-foreground"
                      )}
                    >
                      <span className="text-xl">{item.icon}</span>
                      <span className="font-medium">{item.label}</span>
                    </Link>
                  );
                })}
              </nav>

              {/* Bottom Navigation */}
              <div className="p-4 border-t border-white/5 space-y-1">
                {bottomNavItems.map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={cn(
                        "flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200",
                        isActive 
                          ? "bg-primary-start/10 text-primary-start" 
                          : "text-foreground-secondary hover:bg-white/5 hover:text-foreground"
                      )}
                    >
                      <span className="text-xl">{item.icon}</span>
                      <span className="font-medium">{item.label}</span>
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}

export default Header;