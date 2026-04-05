"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Mail, CheckCircle } from "lucide-react";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [sent, setSent] = React.useState(false);
  const [error, setError] = React.useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (res.ok) {
        setSent(true);
      } else {
        setError(data.error || "Something went wrong");
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-md glass-elevated rounded-2xl p-8 text-center">
          <div className="w-16 h-16 rounded-full bg-success/20 flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="h-8 w-8 text-success" />
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-2">Check Your Email</h1>
          <p className="text-foreground-secondary mb-6">
            If an account exists for <strong>{email}</strong>, we've sent a password reset link.
          </p>
          <p className="text-sm text-foreground-tertiary mb-6">
            Didn't receive it? Check your spam folder or try again.
          </p>
          <Button onClick={() => setSent(false)} variant="secondary" className="w-full mb-3">
            Try another email
          </Button>
          <Link href="/login">
            <Button variant="ghost" className="w-full">
              Back to login
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md glass-elevated rounded-2xl p-8">
        <Link href="/login" className="inline-flex items-center text-sm text-foreground-secondary hover:text-foreground mb-6">
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to login
        </Link>

        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-full bg-primary-start/20 flex items-center justify-center mx-auto mb-4">
            <Mail className="h-6 w-6 text-primary-start" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">Forgot Password?</h1>
          <p className="text-foreground-secondary mt-2">
            Enter your email and we'll send you a reset link.
          </p>
        </div>

        {error && (
          <div className="p-3 rounded-lg bg-error/10 border border-error/20 text-sm text-error mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Email"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <Button type="submit" className="w-full" disabled={loading || !email}>
            {loading ? "Sending..." : "Send Reset Link"}
          </Button>
        </form>
      </div>
    </div>
  );
}
