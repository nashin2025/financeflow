"use client";

import * as React from "react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatCurrency } from "@/lib/utils";
import { useAppStore } from "@/stores/app-store";
import { Transaction } from "@/types";
import { Loader2, Calendar, DollarSign } from "lucide-react";

interface EditTransactionModalProps {
  transaction: Transaction | null;
  isOpen: boolean;
  onClose: () => void;
}

export function EditTransactionModal({ transaction, isOpen, onClose }: EditTransactionModalProps) {
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState("");
  const { categories, accounts, updateTransaction } = useAppStore();

  const [formData, setFormData] = React.useState({
    type: "expense" as Transaction["type"],
    amount: "",
    description: "",
    merchantName: "",
    date: "",
    note: "",
    accountId: "",
    categoryId: "",
  });

  React.useEffect(() => {
    if (transaction) {
      // Handle transfer type by defaulting to expense
      const transactionType = transaction.type === "transfer" ? "expense" : transaction.type;
      setFormData({
        type: transactionType as "expense" | "income",
        amount: transaction.amount.toString(),
        description: transaction.description || "",
        merchantName: transaction.merchantName || "",
        date: new Date(transaction.date).toISOString().split('T')[0],
        note: transaction.note || "",
        accountId: transaction.accountId || "",
        categoryId: transaction.categoryId || "",
      });
    }
  }, [transaction]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!transaction) return;

    const numAmount = parseFloat(formData.amount);
    if (!numAmount || numAmount <= 0) {
      setError("Please enter a valid amount");
      return;
    }

    if (!formData.date) {
      setError("Please select a date");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const response = await fetch(`/api/transactions/${transaction.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          amount: numAmount,
          date: new Date(formData.date).toISOString(),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(errorData?.error || `Failed to update transaction (${response.status})`);
      }

      const { transaction: updatedTransaction } = await response.json();

      // Update transaction in store
      updateTransaction(transaction.id, updatedTransaction);

      // Reset form and close modal
      onClose();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to update transaction. Please try again.";
      console.error('Update transaction error:', errorMessage);
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      type: "expense",
      amount: "",
      description: "",
      merchantName: "",
      date: "",
      note: "",
      accountId: "",
      categoryId: "",
    });
    setError("");
    onClose();
  };

  if (!transaction) return null;

  const availableCategories = categories.filter(c => c.type === formData.type);

  return (
    <Modal isOpen={isOpen} onClose={handleClose} size="md">
      <form onSubmit={handleSubmit}>
        <div className="text-center mb-6">
          <h2 className="text-xl font-bold text-foreground mb-2">Edit Transaction</h2>
          <p className="text-foreground-secondary">
            {formatCurrency(transaction.amount)} • {new Date(transaction.date).toLocaleDateString()}
          </p>
        </div>

        <div className="space-y-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Type</label>
            <div className="flex gap-2">
              <Button
                type="button"
                variant={formData.type === "expense" ? "primary" : "secondary"}
                onClick={() => setFormData({ ...formData, type: "expense", categoryId: "" })}
                className="flex-1"
              >
                Expense
              </Button>
              <Button
                type="button"
                variant={formData.type === "income" ? "primary" : "secondary"}
                onClick={() => setFormData({ ...formData, type: "income", categoryId: "" })}
                className="flex-1"
              >
                Income
              </Button>
            </div>
          </div>

          <div>
            <label htmlFor="amount" className="block text-sm font-medium text-foreground mb-2">Amount</label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-foreground-secondary" />
              <Input
                id="amount"
                type="number"
                step="0.01"
                min="0.01"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                placeholder="0.00"
                className="pl-10"
                required
              />
            </div>
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-foreground mb-2">Description</label>
            <Input
              id="description"
              type="text"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Transaction description"
            />
          </div>

          <div>
            <label htmlFor="merchant" className="block text-sm font-medium text-foreground mb-2">Merchant</label>
            <Input
              id="merchant"
              type="text"
              value={formData.merchantName}
              onChange={(e) => setFormData({ ...formData, merchantName: e.target.value })}
              placeholder="Merchant name"
            />
          </div>

          <div>
            <label htmlFor="date" className="block text-sm font-medium text-foreground mb-2">Date</label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-foreground-secondary" />
              <Input
                id="date"
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="pl-10"
                required
              />
            </div>
          </div>

          <div>
            <label htmlFor="account" className="block text-sm font-medium text-foreground mb-2">Account</label>
            <select
              id="account"
              value={formData.accountId}
              onChange={(e) => setFormData({ ...formData, accountId: e.target.value })}
              className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-foreground focus:outline-none focus:ring-2 focus:ring-primary-start"
            >
              <option value="">Select account</option>
              {accounts.map((account) => (
                <option key={account.id} value={account.id}>
                  {account.name}
                </option>
              ))}
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
              {availableCategories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.icon} {category.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="note" className="block text-sm font-medium text-foreground mb-2">Note</label>
            <Input
              id="note"
              type="text"
              value={formData.note}
              onChange={(e) => setFormData({ ...formData, note: e.target.value })}
              placeholder="Additional notes"
            />
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
              "Update Transaction"
            )}
          </Button>
        </div>
      </form>
    </Modal>
  );
}