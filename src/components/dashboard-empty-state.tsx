"use client";

import * as React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Wallet, TrendingUp, Plus, Link as LinkIcon } from "lucide-react";
import { useRouter } from "next/navigation";

interface DashboardEmptyStateProps {
  hasTransactions: boolean;
  hasBudgets: boolean;
  hasGoals: boolean;
}

export function DashboardEmptyState({ hasTransactions, hasBudgets, hasGoals }: DashboardEmptyStateProps) {
  const router = useRouter();
  const isEmpty = !hasTransactions && !hasBudgets && !hasGoals;

  if (!isEmpty) return null;

  return (
    <Card variant="glass" className="text-center py-12">
      <CardContent className="flex flex-col items-center">
        <div className="w-20 h-20 rounded-2xl gradient-primary flex items-center justify-center mb-6">
          <Wallet className="h-10 w-10 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-foreground mb-3">Welcome to FinanceFlow!</h2>
        <p className="text-foreground-secondary max-w-md mb-8">
          Start tracking your finances by adding your first transaction, setting up budgets, or creating financial goals.
        </p>
        <div className="flex flex-col sm:flex-row gap-3">
          <Button onClick={() => router.push("/add")} className="min-w-[160px]">
            <Plus className="h-4 w-4 mr-2" />
            Add Transaction
          </Button>
          <Button variant="secondary" onClick={() => router.push("/add-account")} className="min-w-[160px]">
            <LinkIcon className="h-4 w-4 mr-2" />
            Add Account
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
