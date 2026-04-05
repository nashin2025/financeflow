"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Mail, CheckCircle, XCircle } from "lucide-react";

export default function VerifyEmailPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [status, setStatus] = React.useState<"verifying" | "success" | "error">("verifying");
  const [message, setMessage] = React.useState("");

  React.useEffect(() => {
    if (!token) {
      setStatus("error");
      setMessage("No verification token provided.");
      return;
    }

    async function verify() {
      try {
        const res = await fetch("/api/auth/verify-email", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token }),
        });

        const data = await res.json();

        if (res.ok) {
          setStatus("success");
          setMessage(data.message || "Email verified successfully!");
        } else {
          setStatus("error");
          setMessage(data.error || "Verification failed.");
        }
      } catch {
        setStatus("error");
        setMessage("Network error. Please try again.");
      }
    }

    verify();
  }, [token]);

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md glass-elevated rounded-2xl p-8 text-center">
        {status === "verifying" && (
          <>
            <div className="w-16 h-16 rounded-full bg-primary-start/20 flex items-center justify-center mx-auto mb-4">
              <div className="w-8 h-8 border-4 border-primary-start/30 border-t-primary-start rounded-full animate-spin" />
            </div>
            <h1 className="text-2xl font-bold text-foreground mb-2">Verifying Email</h1>
            <p className="text-foreground-secondary">Please wait...</p>
          </>
        )}

        {status === "success" && (
          <>
            <div className="w-16 h-16 rounded-full bg-success/20 flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="h-8 w-8 text-success" />
            </div>
            <h1 className="text-2xl font-bold text-foreground mb-2">Email Verified!</h1>
            <p className="text-foreground-secondary mb-6">{message}</p>
            <Link href="/login">
              <Button className="w-full">Sign In</Button>
            </Link>
          </>
        )}

        {status === "error" && (
          <>
            <div className="w-16 h-16 rounded-full bg-error/20 flex items-center justify-center mx-auto mb-4">
              <XCircle className="h-8 w-8 text-error" />
            </div>
            <h1 className="text-2xl font-bold text-foreground mb-2">Verification Failed</h1>
            <p className="text-foreground-secondary mb-6">{message}</p>
            <Link href="/login">
              <Button className="w-full mb-3">Back to Login</Button>
            </Link>
            <Link href="/signup">
              <Button variant="ghost" className="w-full">Create Account</Button>
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
