"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Shield, QrCode, Check, Copy, AlertTriangle } from "lucide-react";

export default function TwoFactorSetupPage() {
  const router = useRouter();
  const [loading, setLoading] = React.useState(true);
  const [enabled, setEnabled] = React.useState(false);
  const [secret, setSecret] = React.useState("");
  const [qrCode, setQrCode] = React.useState("");
  const [token, setToken] = React.useState("");
  const [backupCodes, setBackupCodes] = React.useState<string[]>([]);
  const [showBackup, setShowBackup] = React.useState(false);
  const [error, setError] = React.useState("");
  const [step, setStep] = React.useState<"setup" | "verify" | "backup">("setup");

  React.useEffect(() => {
    fetchSetup();
  }, []);

  async function fetchSetup() {
    try {
      const res = await fetch("/api/auth/two-factor");
      const data = await res.json();
      if (data.enabled) {
        setEnabled(true);
      } else {
        setSecret(data.secret);
        setQrCode(data.qrCode);
      }
    } catch {
      setError("Failed to load 2FA settings");
    } finally {
      setLoading(false);
    }
  }

  async function handleVerify() {
    setError("");
    if (token.length !== 6) {
      setError("Enter a 6-digit code");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/two-factor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, secret }),
      });

      const data = await res.json();
      if (res.ok) {
        setBackupCodes(data.backupCodes || []);
        setStep("backup");
      } else {
        setError(data.error || "Invalid code");
      }
    } catch {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  }

  async function handleDisable() {
    setError("");
    if (!token || token.length !== 6) {
      setError("Enter your current 2FA code to disable");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/two-factor", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });

      if (res.ok) {
        setEnabled(false);
        setStep("setup");
        setQrCode("");
        setSecret("");
      } else {
        const data = await res.json();
        setError(data.error || "Failed to disable");
      }
    } catch {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  }

  function copyBackupCodes() {
    navigator.clipboard.writeText(backupCodes.join("\n"));
  }

  if (loading && step === "setup") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-primary-start/30 border-t-primary-start rounded-full animate-spin" />
      </div>
    );
  }

  if (step === "backup") {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-md glass-elevated rounded-2xl p-8">
          <div className="text-center mb-6">
            <div className="w-16 h-16 rounded-full bg-success/20 flex items-center justify-center mx-auto mb-4">
              <Check className="h-8 w-8 text-success" />
            </div>
            <h1 className="text-2xl font-bold text-foreground">2FA Enabled!</h1>
            <p className="text-foreground-secondary mt-2">
              Save these backup codes in a safe place. You'll need them if you lose access to your authenticator app.
            </p>
          </div>

          <div className="bg-white/5 rounded-xl p-4 mb-6">
            <div className="grid grid-cols-2 gap-2">
              {backupCodes.map((code, i) => (
                <div key={i} className="bg-white/10 rounded-lg px-3 py-2 text-center font-mono text-sm text-foreground">
                  {code}
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-3">
            <Button onClick={copyBackupCodes} variant="secondary" className="flex-1">
              <Copy className="h-4 w-4 mr-2" />
              Copy All
            </Button>
            <Button onClick={() => router.push("/settings")} className="flex-1">
              Done
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (enabled) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-md glass-elevated rounded-2xl p-8">
          <div className="text-center mb-6">
            <div className="w-16 h-16 rounded-full bg-success/20 flex items-center justify-center mx-auto mb-4">
              <Shield className="h-8 w-8 text-success" />
            </div>
            <h1 className="text-2xl font-bold text-foreground">2FA Enabled</h1>
            <p className="text-foreground-secondary mt-2">
              Two-factor authentication is active on your account.
            </p>
          </div>

          {error && (
            <div className="p-3 rounded-lg bg-error/10 border border-error/20 text-sm text-error mb-4">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <Input
              label="Enter 2FA code to disable"
              placeholder="000000"
              value={token}
              onChange={(e) => setToken(e.target.value.replace(/\D/g, "").slice(0, 6))}
              maxLength={6}
            />
            <Button onClick={handleDisable} variant="danger" className="w-full" disabled={loading}>
              {loading ? "Disabling..." : "Disable 2FA"}
            </Button>
            <Button onClick={() => router.push("/settings")} variant="ghost" className="w-full">
              Back to Settings
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md glass-elevated rounded-2xl p-8">
        <div className="text-center mb-6">
          <div className="w-16 h-16 rounded-full bg-primary-start/20 flex items-center justify-center mx-auto mb-4">
            <Shield className="h-8 w-8 text-primary-start" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">Set Up 2FA</h1>
          <p className="text-foreground-secondary mt-2">
            Scan the QR code with your authenticator app, then enter the 6-digit code.
          </p>
        </div>

        {error && (
          <div className="p-3 rounded-lg bg-error/10 border border-error/20 text-sm text-error mb-4">
            {error}
          </div>
        )}

        {step === "setup" && (
          <div className="space-y-6">
            <div className="flex justify-center">
              {qrCode && (
                <div className="bg-white p-4 rounded-xl">
                  <img src={qrCode} alt="2FA QR Code" className="w-48 h-48" />
                </div>
              )}
            </div>

            <div className="text-center">
              <p className="text-sm text-foreground-secondary mb-2">Or enter this code manually:</p>
              <code className="bg-white/10 px-3 py-1 rounded text-sm font-mono text-foreground">{secret}</code>
            </div>

            <Input
              label="Verification Code"
              placeholder="000000"
              value={token}
              onChange={(e) => setToken(e.target.value.replace(/\D/g, "").slice(0, 6))}
              maxLength={6}
            />

            <Button onClick={handleVerify} className="w-full" disabled={loading || token.length !== 6}>
              {loading ? "Verifying..." : "Verify & Enable"}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
