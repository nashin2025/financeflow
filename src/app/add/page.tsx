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
import { 
  Plus, 
  Minus, 
  Camera, 
  Repeat, 
  Check
} from "lucide-react";

type TransactionType = "expense" | "income";

const quickCategories = [
  { id: "2", name: "Groceries", icon: "🛒" },
  { id: "3", name: "Dining Out", icon: "🍕" },
  { id: "4", name: "Transportation", icon: "🚗" },
  { id: "5", name: "Gas/Fuel", icon: "⛽" },
  { id: "6", name: "Healthcare", icon: "💊" },
  { id: "7", name: "Entertainment", icon: "🎬" },
  { id: "9", name: "Subscriptions", icon: "📱" },
  { id: "1", name: "Housing", icon: "🏠" },
];

export default function AddTransactionPage() {
  const router = useRouter();
  const { categories, addTransaction, accounts, user } = useAppStore();
  
  const [type, setType] = React.useState<TransactionType>("expense");
  const [amount, setAmount] = React.useState("");
  const [categoryId, setCategoryId] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [note, setNote] = React.useState("");
  const [date, setDate] = React.useState(new Date().toISOString().split("T")[0]);
  const [accountId, setAccountId] = React.useState(accounts[0]?.id || "1");
  const [isRecurring, setIsRecurring] = React.useState(false);
  const [showSuccess, setShowSuccess] = React.useState(false);
  const [error, setError] = React.useState("");

  const filteredCategories = categories.filter(c => c.type === (type === "expense" ? "expense" : "income"));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    const parsedAmount = parseFloat(amount);
    if (!amount || isNaN(parsedAmount) || parsedAmount <= 0) {
      setError("Please enter a valid amount");
      return;
    }
    
    const newTransaction = {
      id: Date.now().toString(),
      userId: user?.id || "1",
      accountId,
      categoryId: categoryId || filteredCategories[0]?.id || "1",
      type,
      amount: parsedAmount,
      currency: "USD",
      description: description || "Transaction",
      merchantName: description || "Transaction",
      note: note || undefined,
      date,
      time: new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
      isRecurring,
      isExcluded: false,
      tags: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    addTransaction(newTransaction);
    setShowSuccess(true);
    
    setTimeout(() => {
      router.push("/transactions");
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
        <Header title="Add Transaction" showSearch={false} showNotifications={false} />
        
        <main className="p-4 lg:p-6 pb-20 lg:pb-6">
          {showSuccess ? (
            <div className="flex flex-col items-center justify-center min-h-[60vh]">
              <div className="w-20 h-20 rounded-full bg-success/20 flex items-center justify-center mb-4">
                <Check className="h-10 w-10 text-success" />
              </div>
              <h2 className="text-xl font-semibold text-foreground">Transaction Added!</h2>
              <p className="text-foreground-secondary mt-2">Redirecting to transactions...</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="max-w-lg mx-auto space-y-6">
              {error && (
                <div className="p-3 rounded-lg bg-error/10 border border-error/20 text-sm text-error">
                  {error}
                </div>
              )}
              {/* Type Toggle */}
              <div className="flex rounded-xl bg-white/5 p-1">
                <button
                  type="button"
                  onClick={() => setType("expense")}
                  className={cn(
                    "flex-1 py-3 rounded-lg text-sm font-medium transition-all",
                    type === "expense" 
                      ? "bg-error text-white" 
                      : "text-foreground-secondary hover:text-foreground"
                  )}
                >
                  <Minus className="h-4 w-4 inline mr-1" />
                  Expense
                </button>
                <button
                  type="button"
                  onClick={() => setType("income")}
                  className={cn(
                    "flex-1 py-3 rounded-lg text-sm font-medium transition-all",
                    type === "income" 
                      ? "bg-success text-white" 
                      : "text-foreground-secondary hover:text-foreground"
                  )}
                >
                  <Plus className="h-4 w-4 inline mr-1" />
                  Income
                </button>
              </div>

              {/* Amount Input */}
              <div className="text-center py-4">
                <p className="text-sm text-foreground-secondary mb-2">
                  {type === "expense" ? "How much did you spend?" : "How much did you receive?"}
                </p>
                <div className="flex items-center justify-center text-6xl font-bold font-mono text-foreground">
                  <span>$</span>
                  <input
                    type="text"
                    value={formatDisplayAmount()}
                    onChange={(e) => handleAmountChange(e.target.value)}
                    className="bg-transparent text-center w-48 focus:outline-none"
                    placeholder="0.00"
                    inputMode="decimal"
                  />
                </div>
              </div>

              {/* Category Selection */}
              <div>
                <label className="text-sm text-foreground-secondary mb-3 block">Category</label>
                <div className="grid grid-cols-4 gap-2">
                  {quickCategories.map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setCategoryId(cat.id)}
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

              {/* Additional Fields */}
              <div className="space-y-4">
                <Input
                  label="Description"
                  placeholder="What was this for?"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
                
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="Date"
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                  />
                  <Select
                    label="Account"
                    value={accountId}
                    onChange={(e) => setAccountId(e.target.value)}
                    options={accounts.map(a => ({ value: a.id, label: a.name }))}
                  />
                </div>

                <Input
                  label="Note (optional)"
                  placeholder="Add a note..."
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                />
              </div>

              {/* Options */}
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsRecurring(!isRecurring)}
                  className={cn(
                    "flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition-colors",
                    isRecurring 
                      ? "bg-primary-start/20 text-primary-start" 
                      : "bg-white/5 text-foreground-secondary hover:text-foreground"
                  )}
                >
                  <Repeat className="h-4 w-4" />
                  Recurring
                </button>
                <button
                  type="button"
                  onClick={() => alert("Receipt scanning feature coming soon")}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 text-foreground-secondary hover:text-foreground transition-colors"
                >
                  <Camera className="h-4 w-4" />
                  Scan Receipt
                </button>
              </div>

              {/* Submit */}
              <div className="pt-4">
                <Button type="submit" className="w-full h-14 text-lg" disabled={!amount}>
                  Save Transaction
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