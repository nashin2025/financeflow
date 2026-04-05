"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { useAppStore } from "@/stores/app-store";
import { Wallet, Globe, PiggyBank, Target, Check, ArrowRight, ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";

const currencies = [
  { code: "MVR", name: "Maldivian Rufiyaa", symbol: "Rf" },
  { code: "USD", name: "US Dollar", symbol: "$" },
  { code: "EUR", name: "Euro", symbol: "€" },
  { code: "GBP", name: "British Pound", symbol: "£" },
  { code: "INR", name: "Indian Rupee", symbol: "₹" },
  { code: "SGD", name: "Singapore Dollar", symbol: "S$" },
];

const defaultCategories = [
  { id: "c1", name: "Housing", icon: "🏠", color: "#6366F1" },
  { id: "c2", name: "Groceries", icon: "🛒", color: "#10B981" },
  { id: "c3", name: "Dining", icon: "🍽️", color: "#F59E0B" },
  { id: "c4", name: "Transport", icon: "🚗", color: "#3B82F6" },
  { id: "c5", name: "Entertainment", icon: "🎬", color: "#8B5CF6" },
  { id: "c6", name: "Shopping", icon: "🛍️", color: "#EC4899" },
  { id: "c7", name: "Health", icon: "💊", color: "#EF4444" },
  { id: "c8", name: "Utilities", icon: "💡", color: "#14B8A6" },
  { id: "c9", name: "Education", icon: "📚", color: "#6366F1" },
  { id: "c10", name: "Savings", icon: "💰", color: "#10B981" },
];

export default function OnboardingPage() {
  const router = useRouter();
  const { user, setCurrency, addCategory, addBudget, addGoal, addAccount } = useAppStore();
  const [step, setStep] = React.useState(0);
  const [currency, setCurrencyVal] = React.useState("MVR");
  const [monthlyIncome, setMonthlyIncome] = React.useState("");
  const [selectedCategories, setSelectedCategories] = React.useState<string[]>([]);
  const [budgetAmounts, setBudgetAmounts] = React.useState<Record<string, string>>({});
  const [goalName, setGoalName] = React.useState("");
  const [goalTarget, setGoalTarget] = React.useState("");
  const [goalMonthly, setGoalMonthly] = React.useState("");
  const [loading, setLoading] = React.useState(false);

  const totalSteps = 4;

  const handleNext = async () => {
    if (step === 0) {
      setStep(1);
    } else if (step === 1) {
      if (selectedCategories.length < 3) return;
      setStep(2);
    } else if (step === 2) {
      setStep(3);
    } else if (step === 3) {
      setLoading(true);
      try {
        setCurrency(currency);
        for (const catId of selectedCategories) {
          const cat = defaultCategories.find(c => c.id === catId);
          if (cat) {
            addCategory({
              id: cat.id,
              userId: user?.id || "1",
              name: cat.name,
              icon: cat.icon,
              color: cat.color,
              type: "expense",
              isSystem: true,
              isActive: true,
              sortOrder: selectedCategories.indexOf(catId),
            });
          }
        }
        for (const [catId, amount] of Object.entries(budgetAmounts)) {
          const cat = defaultCategories.find(c => c.id === catId);
          if (cat && amount) {
            addBudget({
              id: `b-${catId}`,
              userId: user?.id || "1",
              categoryId: catId,
              name: cat.name,
              amount: parseFloat(amount),
              period: "monthly",
              rollover: false,
              alertThreshold: 80,
              isActive: true,
              spent: 0,
              remaining: parseFloat(amount),
            });
          }
        }
        if (goalName && goalTarget) {
          addGoal({
            id: "g-1",
            userId: user?.id || "1",
            name: goalName,
            targetAmount: parseFloat(goalTarget),
            currentAmount: 0,
            type: "savings",
            targetDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
            monthlyContribution: goalMonthly ? parseFloat(goalMonthly) : 0,
            status: "active",
          });
        }
        router.push("/");
      } finally {
        setLoading(false);
      }
    }
  };

  const handleBack = () => {
    if (step > 0) setStep(step - 1);
  };

  const toggleCategory = (id: string) => {
    setSelectedCategories(prev =>
      prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]
    );
  };

  const handleBudgetChange = (catId: string, value: string) => {
    const cleaned = value.replace(/[^0-9.]/g, "");
    setBudgetAmounts(prev => ({ ...prev, [catId]: cleaned }));
  };

  const formatDisplay = (value: string) => {
    if (!value) return "0.00";
    const num = parseFloat(value);
    return isNaN(num) ? "0.00" : num.toFixed(2);
  };

  const incomeNum = parseFloat(monthlyIncome) || 0;
  const budgetTotal = Object.values(budgetAmounts).reduce((s, v) => s + (parseFloat(v) || 0), 0);
  const remaining = incomeNum - budgetTotal;

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        {/* Progress */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-foreground-secondary">Step {step + 1} of {totalSteps}</span>
            <span className="text-sm text-foreground-tertiary">{Math.round(((step + 1) / totalSteps) * 100)}%</span>
          </div>
          <div className="h-2 bg-white/10 rounded-full overflow-hidden">
            <div
              className="h-full gradient-primary transition-all duration-500"
              style={{ width: `${((step + 1) / totalSteps) * 100}%` }}
            />
          </div>
        </div>

        {/* Step 0: Welcome */}
        {step === 0 && (
          <div className="glass-elevated rounded-2xl p-8 text-center">
            <div className="w-20 h-20 rounded-2xl gradient-primary flex items-center justify-center mx-auto mb-6">
              <Wallet className="h-10 w-10 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-foreground mb-3">Welcome to FinanceFlow</h1>
            <p className="text-foreground-secondary mb-8">
              Let's set up your account in just a few steps. We'll help you track spending, set budgets, and reach your financial goals.
            </p>
            <Button onClick={handleNext} className="w-full h-14 text-lg">
              Get Started
              <ArrowRight className="h-5 w-5 ml-2" />
            </Button>
          </div>
        )}

        {/* Step 1: Currency & Income */}
        {step === 1 && (
          <div className="glass-elevated rounded-2xl p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-primary-start/20 flex items-center justify-center">
                <Globe className="h-5 w-5 text-primary-start" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-foreground">Currency & Income</h2>
                <p className="text-sm text-foreground-tertiary">Set your preferences</p>
              </div>
            </div>

            <div className="space-y-6">
              <Select
                label="Currency"
                value={currency}
                onChange={(e) => setCurrencyVal(e.target.value)}
                options={currencies.map(c => ({ value: c.code, label: `${c.name} (${c.symbol})` }))}
              />

              <div>
                <label className="text-sm text-foreground-secondary mb-3 block">Monthly Income</label>
                <div className="flex items-center justify-center text-3xl font-bold font-mono text-foreground py-4 bg-white/5 rounded-xl">
                  <span className="text-foreground-secondary text-xl">
                    {currencies.find(c => c.code === currency)?.symbol || "Rf"}
                  </span>
                  <input
                    type="text"
                    value={formatDisplay(monthlyIncome)}
                    onChange={(e) => {
                      const cleaned = e.target.value.replace(/[^0-9.]/g, "");
                      const parts = cleaned.split(".");
                      if (parts.length <= 2 && (!parts[1] || parts[1].length <= 2)) {
                        setMonthlyIncome(cleaned);
                      }
                    }}
                    className="bg-transparent text-center w-40 focus:outline-none"
                    placeholder="0.00"
                    inputMode="decimal"
                  />
                </div>
              </div>

              <div className="flex gap-3">
                <Button variant="secondary" onClick={handleBack} className="flex-1">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back
                </Button>
                <Button onClick={handleNext} className="flex-1" disabled={!monthlyIncome || incomeNum <= 0}>
                  Continue
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Select Categories & Budgets */}
        {step === 2 && (
          <div className="glass-elevated rounded-2xl p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-primary-start/20 flex items-center justify-center">
                <PiggyBank className="h-5 w-5 text-primary-start" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-foreground">Set Your Budgets</h2>
                <p className="text-sm text-foreground-tertiary">Select categories and set amounts</p>
              </div>
            </div>

            <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
              {defaultCategories.map((cat) => {
                const isSelected = selectedCategories.includes(cat.id);
                return (
                  <div
                    key={cat.id}
                    className={cn(
                      "p-4 rounded-xl border-2 transition-all",
                      isSelected
                        ? "border-primary-start bg-primary-start/10"
                        : "border-white/10 bg-white/5 hover:bg-white/10"
                    )}
                  >
                    <button
                      type="button"
                      onClick={() => toggleCategory(cat.id)}
                      className="w-full flex items-center gap-3 mb-3"
                    >
                      <span className="text-2xl">{cat.icon}</span>
                      <span className="font-medium text-foreground flex-1 text-left">{cat.name}</span>
                      <div className={cn(
                        "w-6 h-6 rounded-full border-2 flex items-center justify-center",
                        isSelected ? "border-primary-start bg-primary-start" : "border-white/30"
                      )}>
                        {isSelected && <Check className="h-4 w-4 text-white" />}
                      </div>
                    </button>
                    {isSelected && (
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-foreground-tertiary">Budget:</span>
                        <input
                          type="text"
                          value={formatDisplay(budgetAmounts[cat.id] || "")}
                          onChange={(e) => handleBudgetChange(cat.id, e.target.value)}
                          className="flex-1 bg-white/10 rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary-start"
                          placeholder="0.00"
                          inputMode="decimal"
                        />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {incomeNum > 0 && (
              <div className={cn(
                "mt-4 p-3 rounded-lg text-sm",
                remaining >= 0 ? "bg-success/10 text-success" : "bg-error/10 text-error"
              )}>
                {remaining >= 0
                  ? `Rf ${remaining.toFixed(2)} remaining from income`
                  : `Rf ${Math.abs(remaining).toFixed(2)} over budget!`
                }
              </div>
            )}

            <div className="flex gap-3 mt-6">
              <Button variant="secondary" onClick={handleBack} className="flex-1">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
              <Button onClick={handleNext} className="flex-1" disabled={selectedCategories.length < 3}>
                Continue
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </div>
        )}

        {/* Step 3: Set a Goal */}
        {step === 3 && (
          <div className="glass-elevated rounded-2xl p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-primary-start/20 flex items-center justify-center">
                <Target className="h-5 w-5 text-primary-start" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-foreground">Set a Financial Goal</h2>
                <p className="text-sm text-foreground-tertiary">Optional - you can skip this</p>
              </div>
            </div>

            <div className="space-y-4">
              <Input
                label="Goal Name"
                placeholder="e.g. Emergency Fund"
                value={goalName}
                onChange={(e) => setGoalName(e.target.value)}
              />
              <div>
                <label className="text-sm text-foreground-secondary mb-3 block">Target Amount</label>
                <div className="flex items-center justify-center text-2xl font-bold font-mono text-foreground py-3 bg-white/5 rounded-xl">
                  <span className="text-foreground-secondary">Rf</span>
                  <input
                    type="text"
                    value={formatDisplay(goalTarget)}
                    onChange={(e) => {
                      const cleaned = e.target.value.replace(/[^0-9.]/g, "");
                      const parts = cleaned.split(".");
                      if (parts.length <= 2 && (!parts[1] || parts[1].length <= 2)) {
                        setGoalTarget(cleaned);
                      }
                    }}
                    className="bg-transparent text-center w-32 focus:outline-none"
                    placeholder="0.00"
                    inputMode="decimal"
                  />
                </div>
              </div>
              <Input
                label="Monthly Contribution (optional)"
                placeholder="0.00"
                value={goalMonthly}
                onChange={(e) => setGoalMonthly(e.target.value.replace(/[^0-9.]/g, ""))}
              />

              <div className="flex gap-3 pt-4">
                <Button variant="secondary" onClick={handleBack} className="flex-1">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back
                </Button>
                <Button onClick={handleNext} className="flex-1" disabled={loading}>
                  {loading ? "Setting up..." : "Finish Setup"}
                  {!loading && <ArrowRight className="h-4 w-4 ml-2" />}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
