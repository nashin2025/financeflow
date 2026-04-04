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
import { Check, PiggyBank } from "lucide-react";

type BudgetPeriod = "weekly" | "biweekly" | "monthly" | "quarterly" | "yearly";

const periodOptions: { value: BudgetPeriod; label: string }[] = [
  { value: "weekly", label: "Weekly" },
  { value: "biweekly", label: "Bi-weekly" },
  { value: "monthly", label: "Monthly" },
  { value: "quarterly", label: "Quarterly" },
  { value: "yearly", label: "Yearly" },
];

export default function AddBudgetPage() {
  const router = useRouter();
  const { user, categories, addBudget } = useAppStore();

  const [categoryId, setCategoryId] = React.useState("");
  const [name, setName] = React.useState("");
  const [amount, setAmount] = React.useState("");
  const [period, setPeriod] = React.useState<BudgetPeriod>("monthly");
  const [rollover, setRollover] = React.useState(false);
  const [alertThreshold, setAlertThreshold] = React.useState("75");
  const [showSuccess, setShowSuccess] = React.useState(false);
  const [error, setError] = React.useState("");

  const expenseCategories = categories.filter((c) => c.type === "expense");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!categoryId) {
      setError("Please select a category");
      return;
    }

    const parsedAmount = parseFloat(amount);
    if (!amount || isNaN(parsedAmount) || parsedAmount <= 0) {
      setError("Please enter a valid budget amount");
      return;
    }

    const selectedCategory = categories.find((c) => c.id === categoryId);
    const budgetName = name.trim() || selectedCategory?.name || "Budget";

    const now = new Date();
    const newBudget = {
      id: Date.now().toString(),
      userId: user?.id || "1",
      categoryId,
      name: budgetName,
      amount: parsedAmount,
      period,
      startDate: now.toISOString(),
      rollover,
      alertThreshold: parseInt(alertThreshold) || 75,
      isActive: true,
      createdAt: now.toISOString(),
      spent: 0,
      remaining: parsedAmount,
    };

    addBudget(newBudget);
    setShowSuccess(true);

    setTimeout(() => {
      router.push("/budgets");
    }, 1500);
  };

  const handleAmountChange = (value: string) => {
    const cleaned = value.replace(/[^0-9.]/g, "");
    const parts = cleaned.split(".");
    if (parts.length > 2) return;
    if (parts[1]?.length > 2) return;
    setAmount(cleaned);
  };

  const formatDisplayAmount = () => {
    if (!amount) return "0.00";
    const num = parseFloat(amount);
    if (isNaN(num)) return "0.00";
    return num.toFixed(2);
  };

  return (
    <div className="min-h-screen">
      <div className="hidden lg:block">
        <Sidebar />
      </div>

      <div className="lg:pl-[240px]">
        <Header title="Add Budget" showSearch={false} showNotifications={false} />

        <main className="p-4 lg:p-6 pb-20 lg:pb-6">
          {showSuccess ? (
            <div className="flex flex-col items-center justify-center min-h-[60vh]">
              <div className="w-20 h-20 rounded-full bg-success/20 flex items-center justify-center mb-4">
                <Check className="h-10 w-10 text-success" />
              </div>
              <h2 className="text-xl font-semibold text-foreground">Budget Created!</h2>
              <p className="text-foreground-secondary mt-2">Redirecting to budgets...</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="max-w-lg mx-auto space-y-6">
              {error && (
                <div className="p-3 rounded-lg bg-error/10 border border-error/20 text-sm text-error">
                  {error}
                </div>
              )}

              {/* Category Selection */}
              <div>
                <label className="text-sm text-foreground-secondary mb-3 block">Category</label>
                <div className="grid grid-cols-4 gap-2">
                  {expenseCategories.map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => {
                        setCategoryId(cat.id);
                        setName("");
                      }}
                      className={cn(
                        "flex flex-col items-center p-3 rounded-xl transition-all",
                        categoryId === cat.id
                          ? "bg-primary-start/20 border-2 border-primary-start"
                          : "bg-white/5 border-2 border-transparent hover:bg-white/10"
                      )}
                    >
                      <span className="text-2xl mb-1">{cat.icon}</span>
                      <span className="text-xs text-foreground-secondary">{cat.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Budget Name */}
              <Input
                label="Budget Name (optional)"
                placeholder="Leave blank to use category name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />

              {/* Amount */}
              <div>
                <label className="text-sm text-foreground-secondary mb-3 block">Budget Amount</label>
                <div className="flex items-center justify-center text-4xl font-bold font-mono text-foreground py-4 bg-white/5 rounded-xl">
                  <span className="text-foreground-secondary">Rf</span>
                  <input
                    type="text"
                    value={formatDisplayAmount()}
                    onChange={(e) => handleAmountChange(e.target.value)}
                    className="bg-transparent text-center w-40 focus:outline-none"
                    placeholder="0.00"
                    inputMode="decimal"
                  />
                </div>
              </div>

              {/* Period */}
              <Select
                label="Budget Period"
                value={period}
                onChange={(e) => setPeriod(e.target.value as BudgetPeriod)}
                options={periodOptions}
              />

              {/* Alert Threshold */}
              <div>
                <label className="text-sm text-foreground-secondary mb-3 block">
                  Alert at {alertThreshold}% spent
                </label>
                <input
                  type="range"
                  min="25"
                  max="100"
                  step="5"
                  value={alertThreshold}
                  onChange={(e) => setAlertThreshold(e.target.value)}
                  className="w-full accent-primary-start"
                />
                <div className="flex justify-between text-xs text-foreground-tertiary mt-1">
                  <span>25%</span>
                  <span>50%</span>
                  <span>75%</span>
                  <span>100%</span>
                </div>
              </div>

              {/* Rollover Toggle */}
              <button
                type="button"
                onClick={() => setRollover(!rollover)}
                className={cn(
                  "w-full flex items-center justify-between p-4 rounded-xl transition-all",
                  rollover
                    ? "bg-primary-start/20 border-2 border-primary-start"
                    : "bg-white/5 border-2 border-transparent hover:bg-white/10"
                )}
              >
                <div className="flex items-center gap-3">
                  <PiggyBank className={cn("h-5 w-5", rollover ? "text-primary-start" : "text-foreground-secondary")} />
                  <div className="text-left">
                    <p className="font-medium text-foreground">Rollover</p>
                    <p className="text-xs text-foreground-tertiary">Unused budget carries over to next period</p>
                  </div>
                </div>
                <div className={cn(
                  "w-12 h-6 rounded-full transition-all relative",
                  rollover ? "bg-primary-start" : "bg-white/20"
                )}>
                  <div className={cn(
                    "w-5 h-5 rounded-full bg-white absolute top-0.5 transition-all",
                    rollover ? "left-6" : "left-0.5"
                  )} />
                </div>
              </button>

              {/* Submit */}
              <div className="pt-4">
                <Button type="submit" className="w-full h-14 text-lg">
                  <PiggyBank className="h-5 w-5 mr-2" />
                  Create Budget
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
