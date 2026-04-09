"use client";

import * as React from "react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatCurrency } from "@/lib/utils";
import { useAppStore } from "@/stores/app-store";
import { Loader2, DollarSign } from "lucide-react";

interface AddMoneyToGoalModalProps {
  goal: {
    id: string;
    name: string;
    currentAmount: number;
    targetAmount: number;
    icon: string;
    color: string;
  } | null;
  isOpen: boolean;
  onClose: () => void;
}

export function AddMoneyToGoalModal({ goal, isOpen, onClose }: AddMoneyToGoalModalProps) {
  const [amount, setAmount] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState("");
  const { updateGoal, syncGoals } = useAppStore();



  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!goal) return;

    const numAmount = parseFloat(amount);
    if (!numAmount || numAmount <= 0) {
      setError("Please enter a valid amount");
      return;
    }

    if (numAmount > 1000000) {
      setError("Amount cannot exceed MVR 1,000,000");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const newCurrentAmount = goal.currentAmount + numAmount;

      // Update goal via API
      const response = await fetch(`/api/goals?id=${goal.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ currentAmount: newCurrentAmount }),
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: "Unknown error" }));
        console.error("API Error:", response.status, errorData);
        
        if (response.status === 404 && errorData.error === "Goal not found") {
          await syncGoals();
          throw new Error("Goal not found. Please refresh and try again.");
        }
        
        throw new Error(errorData?.error || `Failed to update goal (${response.status})`);
      }

      // Update goal in store (this will trigger any necessary recalculations)
      updateGoal(goal.id, { currentAmount: newCurrentAmount });

      // Reset form and close modal
      setAmount("");
      onClose();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to add money to goal. Please try again.";
      console.error('Add money error:', errorMessage);
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setAmount("");
    setError("");
    onClose();
  };

  if (!goal) {
    return null;
  }

  const remainingAmount = goal.targetAmount - goal.currentAmount;
  const percentage = (goal.currentAmount / goal.targetAmount) * 100;

  return (
    <Modal isOpen={isOpen} onClose={handleClose} size="md">
      <form onSubmit={handleSubmit}>
        <div className="text-center mb-6">
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-4"
            style={{ backgroundColor: `${goal.color}20` }}
          >
            {goal.icon}
          </div>
          <h2 className="text-xl font-bold text-foreground mb-2">Add Money to Goal</h2>
          <p className="text-foreground-secondary">{goal.name}</p>
        </div>

        <div className="space-y-4 mb-6">
          <div className="bg-white/5 rounded-lg p-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-foreground-secondary">Current Progress</span>
              <span className="text-sm font-medium text-foreground">{percentage.toFixed(1)}%</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="font-mono text-foreground">
                {formatCurrency(goal.currentAmount)}
              </span>
              <span className="text-foreground-secondary">
                of {formatCurrency(goal.targetAmount)}
              </span>
            </div>
            <div className="w-full h-2 bg-white/10 rounded-full mt-2">
              <div
                className="h-full bg-primary-start rounded-full transition-all"
                style={{ width: `${Math.min(percentage, 100)}%` }}
              />
            </div>
          </div>

          <div>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-foreground-secondary" />
              <Input
                id="amount"
                type="number"
                step="0.01"
                min="0.01"
                max={remainingAmount}
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Amount to add (MVR)"
                className="pl-10"
                required
              />
            </div>
            {remainingAmount > 0 && (
              <p className="text-xs text-foreground-tertiary mt-1">
                Maximum: {formatCurrency(remainingAmount)} remaining
              </p>
            )}
          </div>

          {error && (
            <div className="p-3 rounded-lg bg-error/10 border border-error/20">
              <p className="text-sm text-error">{error}</p>
            </div>
          )}

          {amount && !error && (
            <div className="p-3 rounded-lg bg-success/10 border border-success/20">
              <p className="text-sm text-success">
                After adding {formatCurrency(parseFloat(amount) || 0)}, your progress will be{" "}
                {formatCurrency(goal.currentAmount + (parseFloat(amount) || 0))} of {formatCurrency(goal.targetAmount)}
                ({(((goal.currentAmount + (parseFloat(amount) || 0)) / goal.targetAmount) * 100).toFixed(1)}%)
              </p>
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
            disabled={!amount || isLoading}
            className="flex-1"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Adding...
              </>
            ) : (
              <>
                Add Money
              </>
            )}
          </Button>
        </div>
      </form>
    </Modal>
  );
}