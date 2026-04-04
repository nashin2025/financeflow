"use client";

import * as React from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAppStore } from "@/stores/app-store";

const publicPaths = ["/login", "/signup", "/forgot-password", "/reset-password"];

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { setUser, logout } = useAppStore();
  const [isChecking, setIsChecking] = React.useState(true);

  React.useEffect(() => {
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

          if (publicPaths.includes(pathname)) {
            router.push("/");
            return;
          }
        } else {
          logout();

          if (!publicPaths.includes(pathname)) {
            router.push("/login");
            return;
          }
        }
      } catch {
        logout();
        if (!publicPaths.includes(pathname)) {
          router.push("/login");
          return;
        }
      } finally {
        setIsChecking(false);
      }
    }

    checkAuth();
  }, []);

  React.useEffect(() => {
    if (isChecking) return;

    const { isAuthenticated } = useAppStore.getState();

    if (!isAuthenticated && !publicPaths.includes(pathname)) {
      router.push("/login");
    }

    if (isAuthenticated && publicPaths.includes(pathname)) {
      router.push("/");
    }
  }, [isChecking, pathname, router]);

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
