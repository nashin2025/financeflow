"use client";

import * as React from "react";
import { Sidebar } from "@/components/layout/sidebar";
import { BottomNav } from "@/components/layout/bottom-nav";
import { Header } from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/stores/app-store";
import { useRouter } from "next/navigation";
import { Check, Building2 } from "lucide-react";

type AccountType = "checking" | "savings" | "credit_card" | "cash" | "investment" | "loan" | "mortgage" | "crypto" | "other";

const accountTypeOptions: { value: AccountType; label: string; icon: string }[] = [
  { value: "checking", label: "Checking", icon: "🏦" },
  { value: "savings", label: "Savings", icon: "💰" },
  { value: "credit_card", label: "Credit Card", icon: "💳" },
  { value: "cash", label: "Cash", icon: "💵" },
  { value: "investment", label: "Investment", icon: "📈" },
  { value: "loan", label: "Loan", icon: "🏛️" },
  { value: "mortgage", label: "Mortgage", icon: "🏠" },
  { value: "crypto", label: "Cryptocurrency", icon: "₿" },
  { value: "other", label: "Other", icon: "📦" },
];

const colorOptions = [
  { value: "#6366F1", label: "Indigo" },
  { value: "#10B981", label: "Green" },
  { value: "#3B82F6", label: "Blue" },
  { value: "#F59E0B", label: "Amber" },
  { value: "#EF4444", label: "Red" },
  { value: "#8B5CF6", label: "Purple" },
  { value: "#EC4899", label: "Pink" },
  { value: "#14B8A6", label: "Teal" },
];

export default function AddAccountPage() {
  const router = useRouter();
  const { user, addAccount } = useAppStore();

  const [name, setName] = React.useState("");
  const [type, setType] = React.useState<AccountType>("checking");
  const [balance, setBalance] = React.useState("");
  const [institution, setInstitution] = React.useState("");
  const [color, setColor] = React.useState("#6366F1");
  const [showSuccess, setShowSuccess] = React.useState(false);
  const [error, setError] = React.useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!name.trim()) {
      setError("Account name is required");
      return;
    }

    const parsedBalance = parseFloat(balance);
    if (!balance || isNaN(parsedBalance)) {
      setError("Please enter a valid balance");
      return;
    }

    const typeInfo = accountTypeOptions.find((t) => t.value === type);

    const newAccount = {
      id: Date.now().toString(),
      userId: user?.id || "1",
      name: name.trim(),
      type,
      balance: parsedBalance,
      currency: "MVR",
      institution: institution.trim() || undefined,
      color,
      icon: typeInfo?.icon || "🏦",
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    addAccount(newAccount);
    setShowSuccess(true);

    setTimeout(() => {
      router.push("/accounts");
    }, 1500);
  };

  const handleBalanceChange = (value: string) => {
    const cleaned = value.replace(/[^0-9.-]/g, "");
    const parts = cleaned.split(".");
    if (parts.length > 2) return;
    if (parts[1]?.length > 2) return;
    setBalance(cleaned);
  };

  const formatDisplayBalance = () => {
    if (!balance) return "0.00";
    const num = parseFloat(balance);
    if (isNaN(num)) return "0.00";
    return num.toFixed(2);
  };

  return (
    <div className="min-h-screen">
      <div className="hidden lg:block">
        <Sidebar />
      </div>

      <div className="lg:pl-[240px]">
        <Header title="Add Account" showSearch={false} showNotifications={false} />

        <main className="p-4 lg:p-6 pb-20 lg:pb-6">
          {showSuccess ? (
            <div className="flex flex-col items-center justify-center min-h-[60vh]">
              <div className="w-20 h-20 rounded-full bg-success/20 flex items-center justify-center mb-4">
                <Check className="h-10 w-10 text-success" />
              </div>
              <h2 className="text-xl font-semibold text-foreground">Account Added!</h2>
              <p className="text-foreground-secondary mt-2">Redirecting to accounts...</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="max-w-lg mx-auto space-y-6">
              {error && (
                <div className="p-3 rounded-lg bg-error/10 border border-error/20 text-sm text-error">
                  {error}
                </div>
              )}

              {/* Account Type Selection */}
              <div>
                <label className="text-sm text-foreground-secondary mb-3 block">Account Type</label>
                <div className="grid grid-cols-3 gap-2">
                  {accountTypeOptions.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setType(opt.value)}
                      className={cn(
                        "flex flex-col items-center p-3 rounded-xl transition-all",
                        type === opt.value
                          ? "bg-primary-start/20 border-2 border-primary-start"
                          : "bg-white/5 border-2 border-transparent hover:bg-white/10"
                      )}
                    >
                      <span className="text-2xl mb-1">{opt.icon}</span>
                      <span className="text-xs text-foreground-secondary">{opt.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Account Name */}
              <Input
                label="Account Name"
                placeholder="e.g. Main Checking"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />

              {/* Balance */}
              <div>
                <label className="text-sm text-foreground-secondary mb-3 block">
                  Current Balance
                </label>
                <div className="flex items-center justify-center text-4xl font-bold font-mono text-foreground py-4 bg-white/5 rounded-xl">
                  <span className="text-foreground-secondary">Rf</span>
                  <input
                    type="text"
                    value={formatDisplayBalance()}
                    onChange={(e) => handleBalanceChange(e.target.value)}
                    className="bg-transparent text-center w-40 focus:outline-none"
                    placeholder="0.00"
                    inputMode="decimal"
                  />
                </div>
              </div>

              {/* Institution */}
              <Input
                label="Institution (optional)"
                placeholder="e.g. Bank of Maldives"
                value={institution}
                onChange={(e) => setInstitution(e.target.value)}
              />

              {/* Color */}
              <div>
                <label className="text-sm text-foreground-secondary mb-3 block">Color</label>
                <div className="flex gap-3 flex-wrap">
                  {colorOptions.map((c) => (
                    <button
                      key={c.value}
                      type="button"
                      onClick={() => setColor(c.value)}
                      className={cn(
                        "w-10 h-10 rounded-full transition-all",
                        color === c.value
                          ? "ring-2 ring-white ring-offset-2 ring-offset-background scale-110"
                          : "hover:scale-105"
                      )}
                      style={{ backgroundColor: c.value }}
                      title={c.label}
                    />
                  ))}
                </div>
              </div>

              {/* Submit */}
              <div className="pt-4">
                <Button type="submit" className="w-full h-14 text-lg">
                  <Building2 className="h-5 w-5 mr-2" />
                  Add Account
                </Button>
              </div>
            </form>
          )}
        </main>
      </div>

      <div className="lg:hidden">
        <BottomNav />
      </div>
    </div>
  );
}
