"use client";

import * as React from "react";
import { Sidebar } from "@/components/layout/sidebar";
import { BottomNav } from "@/components/layout/bottom-nav";
import { Header } from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";
import { useAppStore } from "@/stores/app-store";
import { 
  Search, 
  Filter, 
  Plus, 
  ChevronDown,
  ChevronUp,
  Calendar,
  ArrowUpDown,
  MoreHorizontal
} from "lucide-react";
import Link from "next/link";

type SortOption = "date" | "amount" | "category";
type Order = "asc" | "desc";

export default function TransactionsPage() {
  const { transactions, categories } = useAppStore();
  const [searchQuery, setSearchQuery] = React.useState("");
  const [typeFilter, setTypeFilter] = React.useState<"all" | "expense" | "income">("all");
  const [sortBy, setSortBy] = React.useState<SortOption>("date");
  const [sortOrder, setSortOrder] = React.useState<Order>("desc");
  const [expandedDate, setExpandedDate] = React.useState<string | null>(null);

  if (transactions.length === 0) {
    return (
      <div className="min-h-screen">
        <div className="hidden lg:block">
          <Sidebar />
        </div>
        <div className="lg:pl-[240px]">
          <Header title="Transactions" showSearch={false} showNotifications={false} />
          <main className="p-4 lg:p-6 pb-20 lg:pb-6 flex items-center justify-center min-h-[calc(100vh-80px)]">
            <Card variant="glass" className="max-w-md w-full text-center p-8">
              <div className="w-20 h-20 rounded-full bg-white/10 flex items-center justify-center mx-auto mb-6">
                <svg className="h-10 w-10 text-foreground-secondary" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1Z"/><path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8"/><path d="M12 17V7"/></svg>
              </div>
              <h1 className="text-2xl font-bold text-foreground mb-2">No Transactions Yet</h1>
              <p className="text-foreground-secondary mb-6">Start tracking your expenses and income.</p>
              <Button className="w-full">
                <Plus className="h-4 w-4 mr-2" />
                Add Your First Transaction
              </Button>
            </Card>
          </main>
        </div>
        <div className="lg:hidden">
          <BottomNav />
        </div>
      </div>
    );
  }

  const getCategoryInfo = React.useCallback((categoryId: string) => {
    const category = categories.find(c => c.id === categoryId);
    return category || { name: "Other", icon: "📦", color: "#9CA3AF" };
  }, [categories]);

  const filteredTransactions = React.useMemo(() => {
    let filtered = [...transactions];

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(t => 
        t.merchantName.toLowerCase().includes(query) ||
        t.description.toLowerCase().includes(query) ||
        t.note?.toLowerCase().includes(query)
      );
    }

    if (typeFilter !== "all") {
      filtered = filtered.filter(t => t.type === typeFilter);
    }

    filtered.sort((a, b) => {
      let comparison = 0;
      if (sortBy === "date") {
        comparison = new Date(a.date).getTime() - new Date(b.date).getTime();
      } else if (sortBy === "amount") {
        comparison = a.amount - b.amount;
      } else if (sortBy === "category") {
        const catA = getCategoryInfo(a.categoryId).name;
        const catB = getCategoryInfo(b.categoryId).name;
        comparison = catA.localeCompare(catB);
      }
      return sortOrder === "asc" ? comparison : -comparison;
    });

    return filtered;
  }, [transactions, categories, searchQuery, typeFilter, sortBy, sortOrder, getCategoryInfo]);

  const groupedTransactions = React.useMemo(() => {
    const groups: Record<string, typeof filteredTransactions> = {};
    
    filteredTransactions.forEach(transaction => {
      if (!groups[transaction.date]) {
        groups[transaction.date] = [];
      }
      groups[transaction.date].push(transaction);
    });

    return Object.entries(groups).map(([date, txns]) => ({
      date,
      transactions: txns,
      total: txns.reduce((sum, t) => sum + (t.type === "expense" ? -t.amount : t.amount), 0)
    }));
  }, [filteredTransactions]);

  return (
    <div className="min-h-screen">
      <div className="hidden lg:block">
        <Sidebar />
      </div>

      <div className="lg:pl-[240px]">
        <Header title="Transactions" showSearch={false} showNotifications />
        
        <main className="p-4 lg:p-6 pb-20 lg:pb-6 space-y-4">
          {/* Search and Filters */}
          <div className="space-y-4">
            <div className="flex flex-col md:flex-row gap-3">
              <div className="flex-1">
                <Input
                  placeholder="Search transactions..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  icon={<Search className="h-4 w-4" />}
                />
              </div>
              <Link href="/add">
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Transaction
                </Button>
              </Link>
            </div>

            {/* Filter Tabs */}
            <div className="flex gap-2">
              {(["all", "expense", "income"] as const).map((type) => (
                <button
                  key={type}
                  onClick={() => setTypeFilter(type)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    typeFilter === type
                      ? "gradient-primary text-white"
                      : "glass text-foreground-secondary hover:bg-white/10"
                  }`}
                >
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Transactions List */}
          <div className="space-y-4">
            {groupedTransactions.map((group) => {
              const isExpanded = expandedDate === group.date;
              
              return (
                <div key={group.date} className="space-y-2">
                  {/* Date Header */}
                  <button
                    onClick={() => setExpandedDate(isExpanded ? null : group.date)}
                    className="flex items-center justify-between w-full py-2 px-3 rounded-lg hover:bg-white/5 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      {isExpanded ? (
                        <ChevronUp className="h-4 w-4 text-foreground-secondary" />
                      ) : (
                        <ChevronDown className="h-4 w-4 text-foreground-secondary" />
                      )}
                      <span className="font-medium text-foreground">
                        {new Date(group.date).toLocaleDateString("en-US", { 
                          weekday: "long", 
                          month: "long", 
                          day: "numeric" 
                        })}
                      </span>
                    </div>
                    <span className={`font-mono text-sm ${group.total >= 0 ? "text-success" : "text-error"}`}>
                      {group.total >= 0 ? "+" : ""}{formatCurrency(group.total)}
                    </span>
                  </button>

                  {/* Transactions */}
                  {isExpanded && (
                    <Card variant="glass" className="divide-y divide-white/5">
                      {group.transactions.map((transaction) => {
                        const category = getCategoryInfo(transaction.categoryId);
                        const isExpense = transaction.type === "expense";
                        
                        return (
                          <div 
                            key={transaction.id}
                            className="flex items-center justify-between p-4 hover:bg-white/5 transition-colors cursor-pointer"
                          >
                            <div className="flex items-center gap-4">
                              <div 
                                className="w-12 h-12 rounded-xl flex items-center justify-center text-xl"
                                style={{ backgroundColor: `${category.color}20` }}
                              >
                                {category.icon}
                              </div>
                              <div>
                                <p className="font-medium text-foreground">{transaction.merchantName}</p>
                                <div className="flex items-center gap-2 mt-1">
                                  <span className="text-sm text-foreground-tertiary">{category.name}</span>
                                  {transaction.time && (
                                    <>
                                      <span className="text-foreground-disabled">•</span>
                                      <span className="text-sm text-foreground-tertiary">{transaction.time}</span>
                                    </>
                                  )}
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-4">
                              <div className="text-right">
                                <p className={`font-mono font-semibold text-lg ${isExpense ? "text-error" : "text-success"}`}>
                                  {isExpense ? "-" : "+"}{formatCurrency(transaction.amount)}
                                </p>
                                {transaction.isRecurring && (
                                  <Badge variant="info" className="mt-1 text-xs">Recurring</Badge>
                                )}
                              </div>
                              <button className="p-2 rounded-lg hover:bg-white/10 transition-colors">
                                <MoreHorizontal className="h-4 w-4 text-foreground-secondary" />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </Card>
                  )}
                </div>
              );
            })}

            {filteredTransactions.length === 0 && (
              <Card variant="glass" className="p-12 text-center">
                <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center mx-auto mb-4">
                  <svg className="h-8 w-8 text-foreground-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">No transactions found</h3>
                <p className="text-foreground-secondary mb-4">
                  {searchQuery ? "Try a different search term" : "Add your first transaction to get started"}
                </p>
                <Link href="/add">
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Transaction
                  </Button>
                </Link>
              </Card>
            )}
          </div>
        </main>
      </div>

      <div className="lg:hidden">
        <BottomNav />
      </div>
    </div>
  );
}