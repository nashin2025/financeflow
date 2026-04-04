"use client";

import * as React from "react";
import { Sidebar } from "@/components/layout/sidebar";
import { BottomNav } from "@/components/layout/bottom-nav";
import { Header } from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/stores/app-store";
import { useRouter } from "next/navigation";
import { Check, Target } from "lucide-react";

type GoalType = "savings" | "debt_payoff" | "emergency_fund" | "purchase" | "investment" | "custom";

const goalTypeOptions: { value: GoalType; label: string; icon: string }[] = [
  { value: "savings", label: "Savings", icon: "💰" },
  { value: "debt_payoff", label: "Debt Payoff", icon: "💳" },
  { value: "emergency_fund", label: "Emergency Fund", icon: "🛡️" },
  { value: "purchase", label: "Purchase", icon: "🛍️" },
  { value: "investment", label: "Investment", icon: "📈" },
  { value: "custom", label: "Custom", icon: "🎯" },
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

export default function AddGoalPage() {
  const router = useRouter();
  const { user, addGoal } = useAppStore();

  const [name, setName] = React.useState("");
  const [type, setType] = React.useState<GoalType>("savings");
  const [targetAmount, setTargetAmount] = React.useState("");
  const [currentAmount, setCurrentAmount] = React.useState("");
  const [targetDate, setTargetDate] = React.useState("");
  const [monthlyContribution, setMonthlyContribution] = React.useState("");
  const [color, setColor] = React.useState("#6366F1");
  const [showSuccess, setShowSuccess] = React.useState(false);
  const [error, setError] = React.useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!name.trim()) {
      setError("Goal name is required");
      return;
    }

    const parsedTarget = parseFloat(targetAmount);
    if (!targetAmount || isNaN(parsedTarget) || parsedTarget <= 0) {
      setError("Please enter a valid target amount");
      return;
    }

    const parsedCurrent = parseFloat(currentAmount) || 0;
    const parsedMonthly = parseFloat(monthlyContribution) || 0;

    const typeInfo = goalTypeOptions.find((t) => t.value === type);

    const newGoal = {
      id: Date.now().toString(),
      userId: user?.id || "1",
      name: name.trim(),
      type,
      targetAmount: parsedTarget,
      currentAmount: parsedCurrent,
      targetDate: targetDate || new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      icon: typeInfo?.icon || "🎯",
      color,
      status: "active" as const,
      monthlyContribution: parsedMonthly,
      createdAt: new Date().toISOString(),
    };

    addGoal(newGoal);
    setShowSuccess(true);

    setTimeout(() => {
      router.push("/goals");
    }, 1500);
  };

  const handleAmountChange = (setter: React.Dispatch<React.SetStateAction<string>>) => (value: string) => {
    const cleaned = value.replace(/[^0-9.]/g, "");
    const parts = cleaned.split(".");
    if (parts.length > 2) return;
    if (parts[1]?.length > 2) return;
    setter(cleaned);
  };

  const formatDisplay = (value: string) => {
    if (!value) return "0.00";
    const num = parseFloat(value);
    if (isNaN(num)) return "0.00";
    return num.toFixed(2);
  };

  const minDate = new Date().toISOString().split("T")[0];

  return (
    <div className="min-h-screen">
      <div className="hidden lg:block">
        <Sidebar />
      </div>

      <div className="lg:pl-[240px]">
        <Header title="Add Goal" showSearch={false} showNotifications={false} />

        <main className="p-4 lg:p-6 pb-20 lg:pb-6">
          {showSuccess ? (
            <div className="flex flex-col items-center justify-center min-h-[60vh]">
              <div className="w-20 h-20 rounded-full bg-success/20 flex items-center justify-center mb-4">
                <Check className="h-10 w-10 text-success" />
              </div>
              <h2 className="text-xl font-semibold text-foreground">Goal Created!</h2>
              <p className="text-foreground-secondary mt-2">Redirecting to goals...</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="max-w-lg mx-auto space-y-6">
              {error && (
                <div className="p-3 rounded-lg bg-error/10 border border-error/20 text-sm text-error">
                  {error}
                </div>
              )}

              {/* Goal Type Selection */}
              <div>
                <label className="text-sm text-foreground-secondary mb-3 block">Goal Type</label>
                <div className="grid grid-cols-3 gap-2">
                  {goalTypeOptions.map((opt) => (
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

              {/* Goal Name */}
              <Input
                label="Goal Name"
                placeholder="e.g. Emergency Fund"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />

              {/* Target Amount */}
              <div>
                <label className="text-sm text-foreground-secondary mb-3 block">Target Amount</label>
                <div className="flex items-center justify-center text-4xl font-bold font-mono text-foreground py-4 bg-white/5 rounded-xl">
                  <span className="text-foreground-secondary">Rf</span>
                  <input
                    type="text"
                    value={formatDisplay(targetAmount)}
                    onChange={(e) => handleAmountChange(setTargetAmount)(e.target.value)}
                    className="bg-transparent text-center w-40 focus:outline-none"
                    placeholder="0.00"
                    inputMode="decimal"
                  />
                </div>
              </div>

              {/* Current Amount */}
              <div>
                <label className="text-sm text-foreground-secondary mb-3 block">
                  Current Amount (optional)
                </label>
                <div className="flex items-center justify-center text-2xl font-bold font-mono text-foreground py-3 bg-white/5 rounded-xl">
                  <span className="text-foreground-secondary">Rf</span>
                  <input
                    type="text"
                    value={formatDisplay(currentAmount)}
                    onChange={(e) => handleAmountChange(setCurrentAmount)(e.target.value)}
                    className="bg-transparent text-center w-32 focus:outline-none"
                    placeholder="0.00"
                    inputMode="decimal"
                  />
                </div>
              </div>

              {/* Monthly Contribution */}
              <div>
                <label className="text-sm text-foreground-secondary mb-3 block">
                  Monthly Contribution (optional)
                </label>
                <div className="flex items-center justify-center text-2xl font-bold font-mono text-foreground py-3 bg-white/5 rounded-xl">
                  <span className="text-foreground-secondary">Rf</span>
                  <input
                    type="text"
                    value={formatDisplay(monthlyContribution)}
                    onChange={(e) => handleAmountChange(setMonthlyContribution)(e.target.value)}
                    className="bg-transparent text-center w-32 focus:outline-none"
                    placeholder="0.00"
                    inputMode="decimal"
                  />
                </div>
              </div>

              {/* Target Date */}
              <Input
                label="Target Date"
                type="date"
                value={targetDate}
                onChange={(e) => setTargetDate(e.target.value)}
                min={minDate}
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
                  <Target className="h-5 w-5 mr-2" />
                  Create Goal
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
