"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";

interface Transaction {
  id: string;
  amount: number;
  merchantName?: string | null;
  description?: string | null;
  type: string;
}

interface TopMerchantsProps {
  transactions: Transaction[];
  limit?: number;
}

export function TopMerchants({ transactions, limit = 10 }: TopMerchantsProps) {
  const merchantData = React.useMemo(() => {
    const merchants: Record<string, { total: number; count: number }> = {};

    transactions
      .filter(t => t.type === "expense")
      .forEach(t => {
        const name = t.merchantName || t.description || "Unknown";
        if (!merchants[name]) {
          merchants[name] = { total: 0, count: 0 };
        }
        merchants[name].total += Number(t.amount);
        merchants[name].count += 1;
      });

    return Object.entries(merchants)
      .map(([name, data]) => ({ name, ...data }))
      .sort((a, b) => b.total - a.total)
      .slice(0, limit);
  }, [transactions, limit]);

  const maxTotal = merchantData.length > 0 ? merchantData[0].total : 1;

  if (merchantData.length === 0) {
    return (
      <Card variant="glass">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Top Merchants</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-foreground-secondary text-sm">No transaction data yet.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card variant="glass">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Top Merchants</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {merchantData.map((merchant, i) => (
          <div key={merchant.name} className="flex items-center gap-3">
            <span className="text-sm text-foreground-tertiary w-6 text-right">{i + 1}.</span>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1">
                <p className="text-sm font-medium text-foreground truncate">{merchant.name}</p>
                <p className="text-sm text-foreground-secondary ml-2">
                  {formatCurrency(merchant.total)}
                </p>
              </div>
              <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary-start rounded-full transition-all"
                  style={{ width: `${(merchant.total / maxTotal) * 100}%` }}
                />
              </div>
              <p className="text-xs text-foreground-tertiary mt-1">
                {merchant.count} visit{merchant.count !== 1 ? "s" : ""}
              </p>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
