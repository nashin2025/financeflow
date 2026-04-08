"use client";

import * as React from "react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { useAppStore } from "@/stores/app-store";
import { formatCurrency, cn } from "@/lib/utils";
import { Pencil, Trash, TrendingUp, TrendingDown, AlertTriangle, CheckCircle, XCircle } from "lucide-react";

interface BudgetDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onEditBudget: (budgetId: string) => void;
  onDeleteBudget: (budgetId: string) => void;
}

export function BudgetDetailsModal({ isOpen, onClose, onEditBudget, onDeleteBudget }: BudgetDetailsModalProps) {
  const { budgets, categories } = useAppStore();

  const getCategoryInfo = (categoryId: string) => {
    const category = categories.find(c => c.id === categoryId);
    return category || { name: "Other", icon: "📦", color: "#9CA3AF" };
  };

  const getBudgetStatus = (percentage: number) => {
    if (percentage >= 100) return { label: "Over Budget", icon: XCircle, color: "text-error" };
    if (percentage >= 75) return { label: "Warning", icon: AlertTriangle, color: "text-warning" };
    return { label: "On Track", icon: CheckCircle, color: "text-success" };
  };

  const getStatusColor = (percentage: number) => {
    if (percentage >= 100) return "text-error";
    if (percentage >= 75) return "text-warning";
    return "text-success";
  };

  const totalBudgeted = budgets.reduce((sum, b) => sum + b.amount, 0);
  const totalSpent = budgets.reduce((sum, b) => sum + b.spent, 0);
  const overallPercentage = totalBudgeted > 0 ? (totalSpent / totalBudgeted) * 100 : 0;

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl">
      <div className="space-y-6">
        <div className="text-center">
          <div className="w-16 h-16 rounded-2xl gradient-primary flex items-center justify-center text-2xl font-bold text-white mx-auto mb-4">
            📊
          </div>
          <h2 className="text-xl font-bold text-foreground mb-2">All Budget Details</h2>
          <p className="text-foreground-secondary">Comprehensive overview of all your budget categories</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-white/5 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="h-4 w-4 text-primary-start" />
              <span className="text-sm text-foreground-secondary">Total Budgeted</span>
            </div>
            <p className="text-xl font-bold text-foreground">{formatCurrency(totalBudgeted)}</p>
          </div>
          <div className="p-4 bg-white/5 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <TrendingDown className="h-4 w-4 text-error" />
              <span className="text-sm text-foreground-secondary">Total Spent</span>
            </div>
            <p className="text-xl font-bold text-error">{formatCurrency(totalSpent)}</p>
          </div>
          <div className="p-4 bg-white/5 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-sm text-foreground-secondary">Overall Progress</span>
            </div>
            <p className={cn("text-xl font-bold", getStatusColor(overallPercentage))}>{overallPercentage.toFixed(1)}%</p>
          </div>
        </div>

        <div className="space-y-4 max-h-96 overflow-y-auto">
          {budgets.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-foreground-secondary">No budgets created yet</p>
            </div>
          ) : (
            budgets.map((budget) => {
              const category = getCategoryInfo(budget.categoryId);
              const percentage = budget.amount > 0 ? (budget.spent / budget.amount) * 100 : 0;
              const status = getBudgetStatus(percentage);
              const StatusIcon = status.icon;
              const remaining = budget.amount - budget.spent;

              return (
                <div key={budget.id} className="p-4 bg-white/5 rounded-lg hover:bg-white/10 transition-colors">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg" style={{ backgroundColor: category.color + "20" }}>
                        {category.icon}
                      </div>
                      <div>
                        <h4 className="font-medium text-foreground">{budget.name}</h4>
                        <div className="flex items-center gap-2 mt-0.5">
                          <StatusIcon className={cn("h-3.5 w-3.5", status.color)} />
                          <span className={cn("text-xs", status.color)}>{status.label}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="sm" onClick={() => { onClose(); onEditBudget(budget.id); }} className="h-8 w-8 p-0">
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => { onClose(); onDeleteBudget(budget.id); }} className="h-8 w-8 p-0 text-error hover:text-error">
                        <Trash className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-foreground-secondary">{formatCurrency(budget.spent)} of {formatCurrency(budget.amount)}</span>
                    <span className={cn("text-sm font-medium", status.color)}>{percentage.toFixed(0)}%</span>
                  </div>
                  <div className="h-2 bg-white/10 rounded-full overflow-hidden mb-2">
                    <div className={cn("h-full rounded-full transition-all duration-500", percentage >= 100 ? "bg-error" : percentage >= 75 ? "bg-warning" : "bg-success")} style={{ width: Math.min(percentage, 100) + "%" }} />
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-foreground-tertiary">{remaining >= 0 ? formatCurrency(remaining) + " remaining" : formatCurrency(Math.abs(remaining)) + " over budget"}</span>
                    <span className="text-foreground-tertiary">{budget.period}</span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        <div className="flex justify-end pt-4 border-t border-white/10">
          <Button variant="secondary" onClick={onClose}>Close</Button>
        </div>
      </div>
    </Modal>
  );
}
