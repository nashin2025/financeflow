"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import { cn } from "@/lib/utils";

interface Transaction {
  id: string;
  amount: number;
  date: string | Date;
  type: string;
}

interface SpendingHeatmapProps {
  transactions: Transaction[];
}

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export function SpendingHeatmap({ transactions }: SpendingHeatmapProps) {
  const dailyTotals = React.useMemo(() => {
    const totals: Record<number, number> = {};

    transactions
      .filter(t => t.type === "expense")
      .forEach(t => {
        const date = new Date(t.date);
        // JS getDay(): 0=Sun, 1=Mon... Convert to Mon=0, Sun=6
        let day = date.getDay() - 1;
        if (day < 0) day = 6;
        totals[day] = (totals[day] || 0) + Number(t.amount);
      });

    return totals;
  }, [transactions]);

  const maxAmount = Math.max(...Object.values(dailyTotals), 1);

  const getColorIntensity = (amount: number): string => {
    if (amount === 0) return "bg-white/5";
    const ratio = amount / maxAmount;
    if (ratio > 0.75) return "bg-primary-start";
    if (ratio > 0.5) return "bg-primary-start/70";
    if (ratio > 0.25) return "bg-primary-start/40";
    return "bg-primary-start/20";
  };

  return (
    <Card variant="glass">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Spending by Day</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex gap-2">
          {DAYS.map((day, i) => {
            const amount = dailyTotals[i] || 0;
            return (
              <div key={day} className="flex-1 text-center">
                <div
                  className={cn(
                    "w-full rounded-lg transition-all",
                    getColorIntensity(amount),
                    amount > 0 ? "h-24" : "h-8"
                  )}
                  style={{
                    height: amount > 0 ? `${Math.max(32, (amount / maxAmount) * 96)}px` : "32px",
                  }}
                  title={`${day}: ${formatCurrency(amount)}`}
                />
                <p className="text-xs text-foreground-tertiary mt-2">{day}</p>
                {amount > 0 && (
                  <p className="text-xs text-foreground-secondary mt-1">
                    {formatCurrency(amount)}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
