"use client";

import * as React from "react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { useAppStore } from "@/stores/app-store";
import { Budget } from "@/types";
import { Loader2, AlertTriangle } from "lucide-react";

interface DeleteBudgetModalProps {
  budget: Budget | null;
  isOpen: boolean;
  onClose: () => void;
}

export function DeleteBudgetModal({ budget, isOpen, onClose }: DeleteBudgetModalProps) {
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState("");
  const { deleteBudget } = useAppStore();

  const handleDelete = async () => {
    if (!budget) return;

    setIsLoading(true);
    setError("");

    try {
      const response = await fetch(`/api/budgets/${budget.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(errorData?.error || `Failed to delete budget (${response.status})`);
      }

      // Remove budget from store
      deleteBudget(budget.id);

      // Close modal
      onClose();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to delete budget. Please try again.";
      console.error('Delete budget error:', errorMessage);
      setError(errorMessage);
      setIsLoading(false);
    }
  };

  if (!budget) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="sm">
      <div className="text-center">
        <div className="w-16 h-16 rounded-2xl bg-error/10 flex items-center justify-center mx-auto mb-4">
          <AlertTriangle className="h-8 w-8 text-error" />
        </div>
        <h2 className="text-xl font-bold text-foreground mb-2">Delete Budget</h2>
        <p className="text-foreground-secondary mb-4">
          Are you sure you want to delete <strong>{budget.name}</strong>?
        </p>
        <p className="text-sm text-foreground-tertiary mb-6">
          This action cannot be undone. The budget will be permanently removed.
        </p>

        {error && (
          <div className="p-3 rounded-lg bg-error/10 border border-error/20 mb-4">
            <p className="text-sm text-error">{error}</p>
          </div>
        )}

        <div className="flex gap-3">
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
            disabled={isLoading}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="danger"
            onClick={handleDelete}
            disabled={isLoading}
            className="flex-1"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Deleting...
              </>
            ) : (
              "Delete Budget"
            )}
          </Button>
        </div>
      </div>
    </Modal>
  );
}