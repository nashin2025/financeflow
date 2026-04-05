"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAppStore } from "@/stores/app-store";
import { Wallet, Mail, Lock, User, Eye, EyeOff, ArrowRight, Shield } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const { setUser, setPremium } = useAppStore();
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [showPassword, setShowPassword] = React.useState(false);
  const [error, setError] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(false);
  const [requires2FA, setRequires2FA] = React.useState(false);
  const [userId, setUserId] = React.useState("");
  const [twoFAToken, setTwoFAToken] = React.useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Login failed");
        return;
      }

      if (data.requires2FA) {
        setRequires2FA(true);
        setUserId(data.userId);
        return;
      }

      setUser({
        id: data.user.id,
        email: data.user.email,
        name: data.user.name,
      });
      setPremium(data.user.isPremium);
      router.push("/");
    } catch {
      setError("Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  const handle2FAVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/auth/two-factor/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, token: twoFAToken }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Invalid code");
        return;
      }

      const loginRes = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, twoFAToken }),
      });

      const loginData = await loginRes.json();

      if (loginData.user) {
        setUser({
          id: loginData.user.id,
          email: loginData.user.email,
          name: loginData.user.name,
        });
        setPremium(loginData.user.isPremium);
        router.push("/");
      }
    } catch {
      setError("Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  if (requires2FA) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-background">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-2xl bg-primary-start/20 flex items-center justify-center mx-auto mb-4">
              <Shield className="h-8 w-8 text-primary-start" />
            </div>
            <h1 className="text-2xl font-bold text-foreground">Two-Factor Authentication</h1>
            <p className="text-foreground-secondary mt-2">Enter the 6-digit code from your authenticator app</p>
          </div>

          <Card variant="glass">
            <CardContent className="p-6">
              <form onSubmit={handle2FAVerify} className="space-y-4">
                {error && (
                  <div className="p-3 rounded-lg bg-error/10 border border-error/20 text-sm text-error">
                    {error}
                  </div>
                )}

                <Input
                  label="Verification Code"
                  placeholder="000000"
                  value={twoFAToken}
                  onChange={(e) => setTwoFAToken(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  maxLength={6}
                  required
                />

                <Button type="submit" className="w-full" disabled={isLoading || twoFAToken.length !== 6}>
                  {isLoading ? "Verifying..." : "Verify & Sign In"}
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </form>

              <div className="mt-6 text-center">
                <p className="text-foreground-secondary text-sm">
                  Lost access?{" "}
                  <button onClick={() => setRequires2FA(false)} className="text-primary-start hover:underline font-medium">
                    Try another method
                  </button>
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl gradient-primary flex items-center justify-center mx-auto mb-4">
            <Wallet className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">Welcome Back</h1>
          <p className="text-foreground-secondary mt-2">Sign in to continue to FinanceFlow</p>
        </div>

        <Card variant="glass">
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="p-3 rounded-lg bg-error/10 border border-error/20 text-sm text-error">
                  {error}
                </div>
              )}

              <Input
                type="email"
                label="Email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                icon={<Mail className="h-4 w-4" />}
                required
              />

              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  label="Password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  icon={<Lock className="h-4 w-4" />}
                  iconRight={
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="focus:outline-none"
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  }
                  required
                />
              </div>

              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center gap-2 text-foreground-secondary">
                  <input type="checkbox" className="rounded border-white/20 bg-white/5" />
                  Remember me
                </label>
                <Link href="/forgot-password" className="text-primary-start hover:underline">
                  Forgot password?
                </Link>
              </div>

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Signing in..." : "Sign In"}
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-foreground-secondary">
                Don&apos;t have an account?{" "}
                <Link href="/signup" className="text-primary-start hover:underline font-medium">
                  Sign up
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>

        <p className="text-center text-sm text-foreground-tertiary mt-6">
          By signing in, you agree to our Terms of Service and Privacy Policy
        </p>
      </div>
    </div>
  );
}
