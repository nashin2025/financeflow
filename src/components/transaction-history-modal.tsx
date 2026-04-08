"use client";

import * as React from "react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";
import { useAppStore } from "@/stores/app-store";
import { Account, Transaction } from "@/types";
import { TrendingUp, Calendar, ArrowUpDown } from "lucide-react";

interface TransactionHistoryModalProps {
  account: Account | null;
  isOpen: boolean;
  onClose: () => void;
}

export function TransactionHistoryModal({ account, isOpen, onClose }: TransactionHistoryModalProps) {
  const { transactions, categories } = useAppStore();
  const [sortBy, setSortBy] = React.useState<'date' | 'amount'>('date');
  const [sortOrder, setSortOrder] = React.useState<'asc' | 'desc'>('desc');

  // Sort transactions
  const sortedTransactions = React.useMemo(() => {
    if (!account) return [];
    const accountTransactions = transactions.filter(t => t.accountId === account.id);
    return [...accountTransactions].sort((a, b) => {
      let comparison = 0;

      if (sortBy === 'date') {
        comparison = new Date(a.date).getTime() - new Date(b.date).getTime();
      } else if (sortBy === 'amount') {
        comparison = a.amount - b.amount;
      }

      return sortOrder === 'asc' ? comparison : -comparison;
    });
  }, [account, transactions, sortBy, sortOrder]);

  if (!account) return null;

  const getCategoryInfo = (categoryId: string) => {
    const category = categories.find(c => c.id === categoryId);
    return category || { name: "Other", icon: "📦", color: "#9CA3AF" };
  };

  const totalIncome = sortedTransactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpenses = sortedTransactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl">
      <div className="space-y-6">
        <div className="text-center">
          <div className="w-16 h-16 rounded-2xl gradient-primary flex items-center justify-center text-2xl font-bold text-white mx-auto mb-4">
            {account.icon}
          </div>
          <h2 className="text-xl font-bold text-foreground mb-2">
            {account.name} History
          </h2>
          <p className="text-foreground-secondary">
            Transaction history and analytics
          </p>
        </div>

        {/* Account Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-white/5 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="h-4 w-4 text-success" />
              <span className="text-sm text-foreground-secondary">Total Income</span>
            </div>
            <p className="text-xl font-bold text-success">{formatCurrency(totalIncome)}</p>
          </div>

          <div className="p-4 bg-white/5 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="h-4 w-4 text-error" />
              <span className="text-sm text-foreground-secondary">Total Expenses</span>
            </div>
            <p className="text-xl font-bold text-error">{formatCurrency(totalExpenses)}</p>
          </div>

          <div className="p-4 bg-white/5 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="h-4 w-4 text-primary-start" />
              <span className="text-sm text-foreground-secondary">Transactions</span>
            </div>
            <p className="text-xl font-bold text-foreground">{sortedTransactions.length}</p>
          </div>
        </div>

        {/* Sort Controls */}
        <div className="flex items-center gap-4">
          <span className="text-sm text-foreground-secondary">Sort by:</span>
          <div className="flex gap-2">
            <Button
              variant={sortBy === 'date' ? 'primary' : 'secondary'}
              size="sm"
              onClick={() => setSortBy('date')}
            >
              Date
            </Button>
            <Button
              variant={sortBy === 'amount' ? 'primary' : 'secondary'}
              size="sm"
              onClick={() => setSortBy('amount')}
            >
              Amount
            </Button>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
          >
            <ArrowUpDown className="h-4 w-4" />
          </Button>
        </div>

        {/* Transactions List */}
        <div className="max-h-96 overflow-y-auto">
          {sortedTransactions.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-foreground-secondary">No transactions found for this account</p>
            </div>
          ) : (
            <div className="space-y-2">
              {sortedTransactions.map((transaction) => {
                const category = getCategoryInfo(transaction.categoryId);
                return (
                  <div key={transaction.id} className="flex items-center justify-between p-4 bg-white/5 rounded-lg hover:bg-white/10 transition-colors">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-lg flex items-center justify-center text-lg"
                        style={{ backgroundColor: `${category.color}20` }}
                      >
                        {category.icon}
                      </div>
                      <div>
                        <h4 className="font-medium text-foreground">{transaction.description}</h4>
                        <p className="text-sm text-foreground-secondary">
                          {new Date(transaction.date).toLocaleDateString()} • {category.name}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`font-medium ${transaction.type === 'income' ? 'text-success' : 'text-error'}`}>
                        {transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount)}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end pt-4 border-t border-white/10">
          <Button variant="secondary" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </Modal>
  );
}