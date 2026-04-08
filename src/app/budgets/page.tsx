"use client";

import * as React from "react";
import { useState } from "react";
import { Sidebar } from "@/components/layout/sidebar";
import { BottomNav } from "@/components/layout/bottom-nav";
import { Header } from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { formatCurrency, formatPercentage, cn } from "@/lib/utils";
import { useAppStore } from "@/stores/app-store";
import { FREE_LIMITS } from "@/lib/features";
import { Budget } from "@/types";
import { EditBudgetModal } from "@/components/edit-budget-modal";
import { DeleteBudgetModal } from "@/components/delete-budget-modal";
import { BudgetDetailsModal } from "@/components/budget-details-modal";
import Link from "next/link";
import {
  Plus,
  ArrowRight,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  MoreHorizontal,
  Calendar,
  ArrowLeft,
  PiggyBank,
  Crown,
  Pencil,
  Trash
} from "lucide-react";

export default function BudgetsPage() {
  const { budgets, categories, transactions, isPremium } = useAppStore();
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [showUpgradeMsg, setShowUpgradeMsg] = useState(false);
  const [editingBudget, setEditingBudget] = useState<Budget | null>(null);
  const [deletingBudget, setDeletingBudget] = useState<Budget | null>(null);
  const [showBudgetDetails, setShowBudgetDetails] = useState(false);
  
  const remainingBudgets = isPremium ? Infinity : Math.max(0, FREE_LIMITS.budgets - budgets.length);
  
  const handleCreateFirstBudget = () => {
    if (!isPremium && budgets.length >= FREE_LIMITS.budgets) {
      setShowUpgradeMsg(true);
      return;
    }
    window.location.href = "/add-budget";
  };

  const handleAddBudgetCategory = () => {
    if (!isPremium && budgets.length >= FREE_LIMITS.budgets) {
      setShowUpgradeMsg(true);
      return;
    }
    window.location.href = "/add-budget";
  };

  const handleEditBudget = (budgetId: string) => {
    const budget = budgets.find(b => b.id === budgetId);
    if (budget) {
      setEditingBudget(budget);
    }
  };

  const handleDeleteBudget = (budgetId: string) => {
    const budget = budgets.find(b => b.id === budgetId);
    if (budget) {
      setDeletingBudget(budget);
    }
  };
  
  if (budgets.length === 0) {
    return (
      <div className="min-h-screen">
        <div className="hidden lg:block">
          <Sidebar />
        </div>
        <div className="lg:pl-[240px]">
          <Header title="Budgets" showSearch={false} showNotifications={false} />
          <main className="p-4 lg:p-6 pb-20 lg:pb-6 flex items-center justify-center min-h-[calc(100vh-80px)]">
            <Card variant="glass" className="max-w-md w-full text-center p-8">
              <div className="w-20 h-20 rounded-full bg-white/10 flex items-center justify-center mx-auto mb-6">
                <PiggyBank className="h-10 w-10 text-foreground-secondary" />
              </div>
              <h1 className="text-2xl font-bold text-foreground mb-2">No Budgets Yet</h1>
              <p className="text-foreground-secondary mb-6">Create budgets to track your spending and save money.</p>
              <Button onClick={handleCreateFirstBudget}>
                <Plus className="h-4 w-4 mr-2" />
                Create Your First Budget
              </Button>
            </Card>
          </main>
        </div>
      <div className="lg:hidden">
        <BottomNav />
      </div>

      {/* Budget Details Modal */}
      <BudgetDetailsModal
        isOpen={showBudgetDetails}
        onClose={() => setShowBudgetDetails(false)}
        onEditBudget={(id) => {
          const budget = budgets.find(b => b.id === id);
          if (budget) setEditingBudget(budget);
        }}
        onDeleteBudget={(id) => {
          const budget = budgets.find(b => b.id === id);
          if (budget) setDeletingBudget(budget);
        }}
      />

      {/* Budget Details Modal */}
      <BudgetDetailsModal
        isOpen={showBudgetDetails}
        onClose={() => setShowBudgetDetails(false)}
        onEditBudget={(id) => {
          const budget = budgets.find(b => b.id === id);
          if (budget) setEditingBudget(budget);
        }}
        onDeleteBudget={(id) => {
          const budget = budgets.find(b => b.id === id);
          if (budget) setDeletingBudget(budget);
        }}
      />

      {/* Upgrade Modal */}
      {showUpgradeMsg && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-black/50"
            onClick={() => setShowUpgradeMsg(false)}
          />
          <div className="relative w-full max-w-md glass-elevated rounded-2xl p-6 animate-fadeIn">
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-primary-start/20 flex items-center justify-center mx-auto mb-4">
                <Crown className="h-8 w-8 text-primary-start" />
              </div>
              <h2 className="text-xl font-semibold text-foreground mb-2">Budget Limit Reached</h2>
              <p className="text-foreground-secondary mb-4">
                Free accounts can create up to {FREE_LIMITS.budgets} budgets. Upgrade to Premium for unlimited budgets.
              </p>
              <p className="text-sm text-foreground-tertiary mb-6">
                Contact your administrator to request a premium upgrade.
              </p>
              <Button onClick={() => setShowUpgradeMsg(false)} className="w-full">
                Got it
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
  
  const totalBudget = budgets.reduce((sum, b) => sum + b.amount, 0);
  const totalSpent = budgets.reduce((sum, b) => sum + b.spent, 0);
  const totalRemaining = totalBudget - totalSpent;
  const overallPercentage = (totalSpent / totalBudget) * 100;
  
  const daysInMonth = 30;
  const currentDay = 15;
  const expectedSpent = (currentDay / daysInMonth) * totalBudget;
  const isOnTrack = totalSpent <= expectedSpent;

  const getCategoryInfo = (categoryId: string) => {
    const category = categories.find(c => c.id === categoryId);
    return category || { name: "Other", icon: "📦", color: "#9CA3AF" };
  };

  const getBudgetStatus = (percentage: number) => {
    if (percentage >= 100) return { variant: "danger" as const, label: "Over Budget", icon: AlertTriangle };
    if (percentage >= 75) return { variant: "warning" as const, label: "Near Limit", icon: AlertTriangle };
    return { variant: "success" as const, label: "On Track", icon: CheckCircle };
  };

  const getStatusColor = (percentage: number) => {
    if (percentage >= 100) return "text-error";
    if (percentage >= 75) return "text-warning";
    return "text-success";
  };

  return (
    <div className="min-h-screen">
      <div className="hidden lg:block">
        <Sidebar />
      </div>

      <div className="lg:pl-[240px]">
        <Header title="Budgets" showSearch showNotifications />
        
        <main className="p-4 lg:p-6 pb-20 lg:pb-6 space-y-6">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold text-foreground">
                {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              </h1>
              <p className="text-foreground-secondary mt-1">
                {(() => {
                  const now = new Date();
                  const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
                  const remaining = lastDay - now.getDate();
                  return `${remaining} day${remaining !== 1 ? 's' : ''} remaining`;
                })()}
              </p>
            </div>
            <Link href="/add-budget">
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Budget
              </Button>
            </Link>
          </div>

          {/* Overall Budget Summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card variant="glass" className="col-span-1 md:col-span-2">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-sm text-foreground-secondary">Total Budget</p>
                    <p className="text-2xl font-bold font-mono text-foreground mt-1">
                      {formatCurrency(totalBudget)}
                    </p>
                  </div>
                  <div className={cn(
                    "flex items-center gap-2 px-3 py-1.5 rounded-full",
                    isOnTrack ? "bg-success/20 text-success" : "bg-warning/20 text-warning"
                  )}>
                    {isOnTrack ? (
                      <TrendingDown className="h-4 w-4" />
                    ) : (
                      <TrendingUp className="h-4 w-4" />
                    )}
                    <span className="text-sm font-medium">
                      {isOnTrack ? "On Track" : "Over Spending"}
                    </span>
                  </div>
                </div>
                
                <Progress 
                  value={totalSpent} 
                  max={totalBudget}
                  variant={overallPercentage > 100 ? "danger" : overallPercentage > 75 ? "warning" : "default"}
                  className="h-3"
                />
                
                <div className="flex items-center justify-between mt-4 text-sm">
                  <span className="text-foreground-secondary">
                    {formatCurrency(totalSpent)} spent ({formatPercentage(overallPercentage)})
                  </span>
                  <span className="text-foreground-secondary">
                    {formatCurrency(totalRemaining)} remaining
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card variant="glass">
              <CardContent className="p-6">
                <p className="text-sm text-foreground-secondary mb-2">Daily Average</p>
                <p className="text-2xl font-bold font-mono text-foreground">
                  {formatCurrency(totalSpent / currentDay)}
                </p>
                <p className="text-sm text-foreground-tertiary mt-2">
                  Recommended: {formatCurrency(totalRemaining / 15)}/day
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Category Budgets */}
          <Card variant="glass">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg font-semibold">Category Budgets</CardTitle>
              <button onClick={() => setShowBudgetDetails(true)} className="text-sm text-primary-start hover:underline flex items-center">
                View All <ArrowRight className="h-4 w-4 ml-1" />
              </button>
            </CardHeader>
            <CardContent className="space-y-4">
              {budgets.map((budget) => {
                const category = getCategoryInfo(budget.categoryId);
                const percentage = (budget.spent / budget.amount) * 100;
                const status = getBudgetStatus(percentage);
                const StatusIcon = status.icon;
                
                return (
                  <div key={budget.id} className="p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-colors">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-10 h-10 rounded-xl flex items-center justify-center text-lg"
                          style={{ backgroundColor: `${category.color}20` }}
                        >
                          {category.icon}
                        </div>
                        <div>
                          <h4 className="font-medium text-foreground">{budget.name}</h4>
                          <div className="flex items-center gap-2 mt-0.5">
                            <StatusIcon className={cn("h-3.5 w-3.5", getStatusColor(percentage))} />
                            <span className={cn("text-xs", getStatusColor(percentage))}>
                              {status.label}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="relative">
                        <button 
                          className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                          onClick={() => setOpenMenuId(openMenuId === budget.id ? null : budget.id)}
                        >
                          <MoreHorizontal className="h-4 w-4 text-foreground-secondary" />
                        </button>
                        {openMenuId === budget.id && (
                          <div className="absolute right-0 top-full z-10 mt-1 w-36 rounded-lg bg-white/10 backdrop-blur-md border border-white/20 shadow-lg overflow-hidden">
                              <button
                                className="flex items-center gap-2 w-full px-3 py-2 text-sm text-foreground hover:bg-white/10 transition-colors"
                                onClick={() => {
                                  setOpenMenuId(null);
                                  handleEditBudget(budget.id);
                                }}
                              >
                                <Pencil className="h-3.5 w-3.5" />
                                Edit
                              </button>
                              <button
                                className="flex items-center gap-2 w-full px-3 py-2 text-sm text-error hover:bg-white/10 transition-colors"
                                onClick={() => {
                                  setOpenMenuId(null);
                                  handleDeleteBudget(budget.id);
                                }}
                              >
                                <Trash className="h-3.5 w-3.5" />
                                Delete
                              </button>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <Progress 
                      value={budget.spent} 
                      max={budget.amount}
                      variant={status.variant}
                      className="h-2 mb-3"
                    />
                    
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-mono text-foreground-secondary">
                        {formatCurrency(budget.spent)} / {formatCurrency(budget.amount)}
                      </span>
                      <span className={cn(
                        "font-medium",
                        percentage > 100 ? "text-error" : percentage > 75 ? "text-warning" : "text-success"
                      )}>
                        {percentage.toFixed(0)}%
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between text-xs text-foreground-tertiary mt-2">
                      <span>{formatCurrency(budget.remaining)} remaining</span>
                      <span>{Math.ceil((30 - currentDay) * (budget.remaining / Math.max(budget.remaining, 1)))} days left</span>
                    </div>
                  </div>
                );
              })}

              {/* Add Budget Button */}
              <button 
                className="w-full p-4 rounded-xl border-2 border-dashed border-white/10 hover:border-primary-start/50 hover:bg-primary-start/5 transition-all flex items-center justify-center gap-2 text-foreground-secondary hover:text-primary-start"
                onClick={handleAddBudgetCategory}
              >
                <Plus className="h-4 w-4" />
                <span>Add New Budget Category</span>
              </button>
            </CardContent>
          </Card>

          {/* Spending Trend */}
          <Card variant="glass">
            <CardHeader>
              <CardTitle className="text-lg font-semibold">Spending Trend</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-48 flex items-end justify-between gap-2">
                {(() => {
                  const now = new Date();
                  const currentMonthLabel = now.toLocaleDateString('en-US', { month: 'short' });
                  const months = [];
                  for (let i = 5; i >= 0; i--) {
                    const d = new Date();
                    d.setMonth(d.getMonth() - i);
                    months.push(d.toLocaleDateString('en-US', { month: 'short' }));
                  }
                  return months.map((month, i) => {
                    const isCurrentMonth = month === currentMonthLabel;
                    const actualDay = isCurrentMonth ? now.getDate() : 15;
                    const heights = [65, 80, 70, 90, 75, actualDay];
                    const height = heights[i];
                    
                    return (
                      <div key={month} className="flex-1 flex flex-col items-center gap-2">
                        <div 
                          className={cn(
                            "w-full rounded-t-lg transition-all",
                            isCurrentMonth ? "gradient-primary" : "bg-white/20"
                          )}
                          style={{ height: `${Math.min(height * 2, 100)}%` }}
                        />
                        <span className={cn(
                          "text-xs",
                          isCurrentMonth ? "text-primary-start font-medium" : "text-foreground-tertiary"
                        )}>
                          {month}
                        </span>
                      </div>
                    );
                  });
                })()}
              </div>
              <p className="text-center text-sm text-foreground-secondary mt-4">
                Your spending is 8% lower than last month at this point
              </p>
            </CardContent>
          </Card>
        </main>
      </div>

      <div className="lg:hidden">
        <BottomNav />
      </div>

      {/* Edit Budget Modal */}
      <EditBudgetModal
        budget={editingBudget}
        isOpen={!!editingBudget}
        onClose={() => setEditingBudget(null)}
      />

      {/* Delete Budget Modal */}
      <DeleteBudgetModal
        budget={deletingBudget}
        isOpen={!!deletingBudget}
        onClose={() => setDeletingBudget(null)}
      />

      {/* Budget Details Modal */}
      <BudgetDetailsModal
        isOpen={showBudgetDetails}
        onClose={() => setShowBudgetDetails(false)}
        onEditBudget={(id) => {
          const budget = budgets.find(b => b.id === id);
          if (budget) setEditingBudget(budget);
        }}
        onDeleteBudget={(id) => {
          const budget = budgets.find(b => b.id === id);
          if (budget) setDeletingBudget(budget);
        }}
      />

      {/* Budget Details Modal */}
      <BudgetDetailsModal
        isOpen={showBudgetDetails}
        onClose={() => setShowBudgetDetails(false)}
        onEditBudget={(id) => {
          const budget = budgets.find(b => b.id === id);
          if (budget) setEditingBudget(budget);
        }}
        onDeleteBudget={(id) => {
          const budget = budgets.find(b => b.id === id);
          if (budget) setDeletingBudget(budget);
        }}
      />

      {/* Budget Details Modal */}
      <BudgetDetailsModal
        isOpen={showBudgetDetails}
        onClose={() => setShowBudgetDetails(false)}
        onEditBudget={(id) => {
          const budget = budgets.find(b => b.id === id);
          if (budget) setEditingBudget(budget);
        }}
        onDeleteBudget={(id) => {
          const budget = budgets.find(b => b.id === id);
          if (budget) setDeletingBudget(budget);
        }}
      />

      {/* Upgrade Modal */}
      {showUpgradeMsg && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-black/50"
            onClick={() => setShowUpgradeMsg(false)}
          />
          <div className="relative w-full max-w-md glass-elevated rounded-2xl p-6 animate-fadeIn">
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-primary-start/20 flex items-center justify-center mx-auto mb-4">
                <Crown className="h-8 w-8 text-primary-start" />
              </div>
              <h2 className="text-xl font-semibold text-foreground mb-2">Budget Limit Reached</h2>
              <p className="text-foreground-secondary mb-4">
                Free accounts can create up to {FREE_LIMITS.budgets} budgets. Upgrade to Premium for unlimited budgets.
              </p>
              <p className="text-sm text-foreground-tertiary mb-6">
                Contact your administrator to request a premium upgrade.
              </p>
              <Button onClick={() => setShowUpgradeMsg(false)} className="w-full">
                Got it
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}