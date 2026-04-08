"use client";

import * as React from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAppStore } from "@/stores/app-store";

const publicPaths = ["/login", "/signup", "/forgot-password", "/reset-password"];

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { setUser, setPremium, logout, isAuthenticated } = useAppStore();
  const [isChecking, setIsChecking] = React.useState(true);
  const hasCheckedRef = React.useRef(false);

  React.useEffect(() => {
    if (hasCheckedRef.current) return;
    hasCheckedRef.current = true;

    async function checkAuth() {
      try {
        const response = await fetch("/api/auth/me");
        const data = await response.json();

        if (data.user) {
          setUser({
            id: data.user.id,
            email: data.user.email,
            name: data.user.name,
          });
          setPremium(data.user.isPremium ?? false);
          setPremium(data.user.isPremium ?? false);

          if (publicPaths.includes(pathname)) {
            router.replace("/");
            return;
          }
        } else {
          logout();

          if (!publicPaths.includes(pathname)) {
            router.replace("/login");
            return;
          }
        }
      } catch {
        logout();
        if (!publicPaths.includes(pathname)) {
          router.replace("/login");
          return;
        }
      } finally {
        setIsChecking(false);
      }
    }

    checkAuth();
  }, [logout, pathname, router, setPremium, setUser]);

  if (isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-primary-start/30 border-t-primary-start rounded-full animate-spin" />
          <p className="text-foreground-secondary text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
