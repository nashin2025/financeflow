"use client";

import * as React from "react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAppStore } from "@/stores/app-store";
import { Account, AccountType } from "@/types";
import { Loader2 } from "lucide-react";

interface EditAccountModalProps {
  account: Account | null;
  isOpen: boolean;
  onClose: () => void;
}

export function EditAccountModal({ account, isOpen, onClose }: EditAccountModalProps) {
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState("");
  const { updateAccount } = useAppStore();

  const [formData, setFormData] = React.useState({
    name: "",
    type: "checking" as AccountType,
    balance: "",
    currency: "MVR",
    institution: "",
    color: "#3B82F6",
    icon: "💳",
    isActive: true,
  });

  React.useEffect(() => {
    if (account) {
      setFormData({
        name: account.name,
        type: account.type,
        balance: account.balance.toString(),
        currency: account.currency,
        institution: account.institution || "",
        color: account.color,
        icon: account.icon,
        isActive: account.isActive,
      });
    }
  }, [account]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!account) return;

    if (!formData.name.trim()) {
      setError("Account name is required");
      return;
    }

    const numBalance = parseFloat(formData.balance);
    if (isNaN(numBalance)) {
      setError("Please enter a valid balance");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const response = await fetch(`/api/accounts/${account.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          balance: numBalance,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(errorData?.error || `Failed to update account (${response.status})`);
      }

      const { account: updatedAccount } = await response.json();

      // Update account in store
      updateAccount(account.id, updatedAccount);

      // Reset form and close modal
      onClose();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to update account. Please try again.";
      console.error('Update account error:', errorMessage);
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      name: "",
      type: "checking",
      balance: "",
      currency: "MVR",
      institution: "",
      color: "#3B82F6",
      icon: "💳",
      isActive: true,
    });
    setError("");
    onClose();
  };

  if (!account) return null;

  const accountTypeOptions = [
    { value: "checking", label: "Checking", icon: "🏦" },
    { value: "savings", label: "Savings", icon: "💰" },
    { value: "credit_card", label: "Credit Card", icon: "💳" },
    { value: "cash", label: "Cash", icon: "💵" },
    { value: "investment", label: "Investment", icon: "📈" },
    { value: "loan", label: "Loan", icon: "🏠" },
    { value: "mortgage", label: "Mortgage", icon: "🏠" },
    { value: "crypto", label: "Crypto", icon: "₿" },
    { value: "other", label: "Other", icon: "📁" },
  ];

  return (
    <Modal isOpen={isOpen} onClose={handleClose} size="md">
      <form onSubmit={handleSubmit}>
        <div className="text-center mb-6">
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-4"
            style={{ backgroundColor: `${formData.color}20` }}
          >
            {formData.icon}
          </div>
          <h2 className="text-xl font-bold text-foreground mb-2">Edit Account</h2>
          <p className="text-foreground-secondary">{account.name}</p>
        </div>

        <div className="space-y-4 mb-6">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-foreground mb-2">Account Name</label>
            <Input
              id="name"
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Account name"
              required
            />
          </div>

          <div>
            <label htmlFor="type" className="block text-sm font-medium text-foreground mb-2">Account Type</label>
            <select
              id="type"
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value as AccountType })}
              className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-foreground focus:outline-none focus:ring-2 focus:ring-primary-start"
            >
              {accountTypeOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.icon} {option.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="balance" className="block text-sm font-medium text-foreground mb-2">Current Balance</label>
            <Input
              id="balance"
              type="number"
              step="0.01"
              value={formData.balance}
              onChange={(e) => setFormData({ ...formData, balance: e.target.value })}
              placeholder="0.00"
              required
            />
          </div>

          <div>
            <label htmlFor="institution" className="block text-sm font-medium text-foreground mb-2">Institution (Optional)</label>
            <Input
              id="institution"
              type="text"
              value={formData.institution}
              onChange={(e) => setFormData({ ...formData, institution: e.target.value })}
              placeholder="Bank or institution name"
            />
          </div>

          <div className="flex items-center space-x-2">
            <input
              id="isActive"
              type="checkbox"
              checked={formData.isActive}
              onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
              className="rounded border-white/20 bg-white/5 text-primary-start focus:ring-primary-start"
            />
            <label htmlFor="isActive" className="text-sm text-foreground">
              Account is active
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
              "Update Account"
            )}
          </Button>
        </div>
      </form>
    </Modal>
  );
}