"use client";

import * as React from "react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAppStore } from "@/stores/app-store";
import { Budget, BudgetPeriod } from "@/types";
import { Loader2 } from "lucide-react";

interface EditBudgetModalProps {
  budget: Budget | null;
  isOpen: boolean;
  onClose: () => void;
}

export function EditBudgetModal({ budget, isOpen, onClose }: EditBudgetModalProps) {
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState("");
  const { categories, updateBudget } = useAppStore();

  const [formData, setFormData] = React.useState({
    name: "",
    amount: "",
    period: "monthly" as BudgetPeriod,
    categoryId: "",
    alertThreshold: "80",
    rollover: false,
  });

  React.useEffect(() => {
    if (budget) {
      setFormData({
        name: budget.name,
        amount: budget.amount.toString(),
        period: budget.period,
        categoryId: budget.categoryId,
        alertThreshold: budget.alertThreshold.toString(),
        rollover: budget.rollover,
      });
    }
  }, [budget]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!budget) return;

    if (!formData.name.trim()) {
      setError("Budget name is required");
      return;
    }

    const numAmount = parseFloat(formData.amount);
    if (!numAmount || numAmount <= 0) {
      setError("Please enter a valid amount");
      return;
    }

    const threshold = parseFloat(formData.alertThreshold);
    if (threshold < 0 || threshold > 100) {
      setError("Alert threshold must be between 0 and 100");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const response = await fetch(`/api/budgets/${budget.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          amount: numAmount,
          alertThreshold: threshold,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(errorData?.error || `Failed to update budget (${response.status})`);
      }

      const { budget: updatedBudget } = await response.json();

      // Update budget in store
      updateBudget(budget.id, updatedBudget);

      // Reset form and close modal
      onClose();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to update budget. Please try again.";
      console.error('Update budget error:', errorMessage);
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      name: "",
      amount: "",
      period: "monthly",
      categoryId: "",
      alertThreshold: "80",
      rollover: false,
    });
    setError("");
    onClose();
  };

  if (!budget) return null;

  const expenseCategories = categories.filter(c => c.type === "expense");

  return (
    <Modal isOpen={isOpen} onClose={handleClose} size="md">
      <form onSubmit={handleSubmit}>
        <div className="text-center mb-6">
          <div className="w-16 h-16 rounded-2xl gradient-primary flex items-center justify-center text-3xl mx-auto mb-4">
            💰
          </div>
          <h2 className="text-xl font-bold text-foreground mb-2">Edit Budget</h2>
          <p className="text-foreground-secondary">{budget.name}</p>
        </div>

        <div className="space-y-4 mb-6">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-foreground mb-2">Budget Name</label>
            <Input
              id="name"
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Budget name"
              required
            />
          </div>

          <div>
            <label htmlFor="amount" className="block text-sm font-medium text-foreground mb-2">Budget Amount</label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              min="0.01"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              placeholder="0.00"
              required
            />
          </div>

          <div>
            <label htmlFor="period" className="block text-sm font-medium text-foreground mb-2">Budget Period</label>
            <select
              id="period"
              value={formData.period}
              onChange={(e) => setFormData({ ...formData, period: e.target.value as BudgetPeriod })}
              className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-foreground focus:outline-none focus:ring-2 focus:ring-primary-start"
            >
              <option value="weekly">Weekly</option>
              <option value="biweekly">Bi-weekly</option>
              <option value="monthly">Monthly</option>
              <option value="quarterly">Quarterly</option>
              <option value="yearly">Yearly</option>
            </select>
          </div>

          <div>
            <label htmlFor="category" className="block text-sm font-medium text-foreground mb-2">Category</label>
            <select
              id="category"
              value={formData.categoryId}
              onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
              className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-foreground focus:outline-none focus:ring-2 focus:ring-primary-start"
            >
              <option value="">Select category</option>
              {expenseCategories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.icon} {category.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="threshold" className="block text-sm font-medium text-foreground mb-2">Alert Threshold (%)</label>
            <Input
              id="threshold"
              type="number"
              min="0"
              max="100"
              value={formData.alertThreshold}
              onChange={(e) => setFormData({ ...formData, alertThreshold: e.target.value })}
              placeholder="80"
            />
          </div>

          <div className="flex items-center space-x-2">
            <input
              id="rollover"
              type="checkbox"
              checked={formData.rollover}
              onChange={(e) => setFormData({ ...formData, rollover: e.target.checked })}
              className="rounded border-white/20 bg-white/5 text-primary-start focus:ring-primary-start"
            />
            <label htmlFor="rollover" className="text-sm text-foreground">
              Rollover unused budget to next period
            </label>
          </div>

          {error && (
            <div className="p-3 rounded-lg bg-error/10 border border-error/20">
              <p className="text-sm text-error">{error}</p>
            </div>
          )}
        </div>

        <div className="flex gap-3">
          <Button
            type="button"
            variant="secondary"
            onClick={handleClose}
            disabled={isLoading}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isLoading}
            className="flex-1"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Updating...
              </>
            ) : (
              "Update Budget"
            )}
          </Button>
        </div>
      </form>
    </Modal>
  );
}