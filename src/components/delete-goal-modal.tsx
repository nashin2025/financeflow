"use client";

import * as React from "react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { useAppStore } from "@/stores/app-store";

interface DeleteGoalModalProps {
  goal: {
    id: string;
    name: string;
    currentAmount: number;
    targetAmount: number;
    icon: string;
    color: string;
  };
  isOpen: boolean;
  onClose: () => void;
}
import { formatCurrency } from "@/lib/utils";
import { Loader2, AlertTriangle, Trash2 } from "lucide-react";

interface DeleteGoalModalProps {
  goal: {
    id: string;
    name: string;
    currentAmount: number;
    targetAmount: number;
    icon: string;
    color: string;
  };
  isOpen: boolean;
  onClose: () => void;
}

export function DeleteGoalModal({ goal, isOpen, onClose }: DeleteGoalModalProps) {
  const { deleteGoal: storeDeleteGoal } = useAppStore();
  const [isLoading, setIsLoading] = React.useState(false);
  const [confirmText, setConfirmText] = React.useState("");

  const handleDelete = async () => {
    if (confirmText.toLowerCase() !== 'delete') return;

    setIsLoading(true);
    try {
      // Delete via API
      const response = await fetch(`/api/goals?id=${goal.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete goal');
      }

      // Update local store
      storeDeleteGoal(goal.id);
      onClose();
    } catch (error) {
      console.error('Error deleting goal:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setConfirmText("");
    onClose();
  };

  const progress = (goal.currentAmount / goal.targetAmount) * 100;

  return (
    <Modal isOpen={isOpen} onClose={handleClose} size="md">
      <div className="text-center">
        <div className="w-16 h-16 rounded-full bg-error/20 flex items-center justify-center mx-auto mb-4">
          <AlertTriangle className="h-8 w-8 text-error" />
        </div>

        <h2 className="text-xl font-bold text-foreground mb-2">Delete Goal</h2>
        <p className="text-foreground-secondary mb-6">
          Are you sure you want to delete this goal? This action cannot be undone.
        </p>

        {/* Goal Summary */}
        <div className="bg-white/5 rounded-lg p-4 mb-6">
          <div className="flex items-center justify-center gap-3 mb-3">
            <div
              className="w-10 h-10 rounded-lg flex items-center justify-center text-xl"
              style={{ backgroundColor: `${goal.color}20` }}
            >
              {goal.icon}
            </div>
            <div className="text-left">
              <h3 className="font-semibold text-foreground">{goal.name}</h3>
              <p className="text-sm text-foreground-secondary">
                {progress.toFixed(1)}% complete
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <div className="text-foreground-secondary">Current</div>
              <div className="font-mono font-medium text-foreground">
                {formatCurrency(goal.currentAmount)}
              </div>
            </div>
            <div>
              <div className="text-foreground-secondary">Target</div>
              <div className="font-mono font-medium text-foreground">
                {formatCurrency(goal.targetAmount)}
              </div>
            </div>
          </div>
        </div>

        {/* Confirmation */}
        <div className="mb-6">
          <p className="text-sm text-foreground-secondary mb-2">
            Type <strong>&quot;DELETE&quot;</strong> to confirm:
          </p>
          <input
            type="text"
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            placeholder="DELETE"
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-center text-foreground placeholder:text-foreground-tertiary focus:outline-none focus:border-error"
          />
        </div>

        {/* Warning */}
        <div className="bg-error/10 border border-error/20 rounded-lg p-3 mb-6">
          <div className="flex items-start gap-2">
            <Trash2 className="h-4 w-4 text-error mt-0.5 flex-shrink-0" />
            <div className="text-left">
              <p className="text-sm font-medium text-error mb-1">This action is permanent</p>
              <p className="text-xs text-error/80">
                All progress and contribution history will be lost. This cannot be recovered.
              </p>
            </div>
          </div>
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
            onClick={handleDelete}
            disabled={isLoading || confirmText.toLowerCase() !== 'delete'}
            variant="danger"
            className="flex-1"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Deleting...
              </>
            ) : (
              <>
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Goal
              </>
            )}
          </Button>
        </div>
      </div>
    </Modal>
  );
}