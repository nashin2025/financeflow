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
import { Transaction } from "@/types";
import { EditTransactionModal } from "@/components/edit-transaction-modal";
import {
  Search,
  Plus,
  ChevronDown,
  ChevronUp,
  MoreHorizontal,
  Pencil,
  Trash2,
  CheckSquare,
  Square,
  X,
  Trash
} from "lucide-react";
import Link from "next/link";

type SortOption = "date" | "amount" | "category";
type Order = "asc" | "desc";

export default function TransactionsPage() {
  const { transactions, categories, deleteTransaction } = useAppStore();
  const [menuOpenId, setMenuOpenId] = React.useState<string | null>(null);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [typeFilter, setTypeFilter] = React.useState<"all" | "expense" | "income">("all");
  const [sortBy, setSortBy] = React.useState<SortOption>("date");
  const [sortOrder, setSortOrder] = React.useState<Order>("desc");
  const [expandedDate, setExpandedDate] = React.useState<string | null>(null);
  const [selectionMode, setSelectionMode] = React.useState(false);
  const [selectedIds, setSelectedIds] = React.useState<string[]>([]);
  const [editingTransaction, setEditingTransaction] = React.useState<Transaction | null>(null);

  const getCategoryInfo = (categoryId: string) => {
    const category = categories.find(c => c.id === categoryId);
    return category || { name: "Other", icon: "📦", color: "#9CA3AF" };
  };

  const filteredTransactions = React.useMemo(() => {
    let filtered = transactions;
    if (typeFilter !== "all") {
      filtered = filtered.filter(t => t.type === typeFilter);
    }
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        t => {
          const cat = categories.find(c => c.id === t.categoryId);
          const catName = cat?.name || "Other";
          return (
            t.merchantName.toLowerCase().includes(query) ||
            t.description?.toLowerCase().includes(query) ||
            catName.toLowerCase().includes(query)
          );
        }
      );
    }
    filtered.sort((a, b) => {
      const multiplier = sortOrder === "asc" ? 1 : -1;
      if (sortBy === "date") return multiplier * (new Date(a.date).getTime() - new Date(b.date).getTime());
      if (sortBy === "amount") return multiplier * (a.amount - b.amount);
      return multiplier * a.categoryId.localeCompare(b.categoryId);
    });
    return filtered;
  }, [transactions, typeFilter, searchQuery, sortBy, sortOrder, categories]);

  const groupedTransactions = React.useMemo(() => {
    const groups: Record<string, typeof transactions> = {};
    filteredTransactions.forEach(t => {
      if (!groups[t.date]) groups[t.date] = [];
      groups[t.date].push(t);
    });
    return Object.entries(groups)
      .sort(([a], [b]) => new Date(b).getTime() - new Date(a).getTime())
      .map(([date, txns]) => ({
        date,
        transactions: txns,
        total: txns.reduce((sum, t) => sum + (t.type === "income" ? t.amount : -t.amount), 0),
      }));
  }, [filteredTransactions]);

  const toggleSelection = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const selectAll = () => {
    const allIds = filteredTransactions.map(t => t.id);
    setSelectedIds(allIds);
  };

  const deselectAll = () => {
    setSelectedIds([]);
  };

  const bulkDelete = () => {
    if (selectedIds.length === 0) return;
    if (confirm(`Delete ${selectedIds.length} transaction(s)?`)) {
      selectedIds.forEach(id => deleteTransaction(id));
      setSelectedIds([]);
      setSelectionMode(false);
    }
  };

  const toggleSelectionMode = () => {
    setSelectionMode(prev => !prev);
    setSelectedIds([]);
  };

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
              <div className="flex gap-2">
                <Button variant="secondary" onClick={toggleSelectionMode}>
                  {selectionMode ? (
                    <X className="h-4 w-4 mr-2" />
                  ) : (
                    <CheckSquare className="h-4 w-4 mr-2" />
                  )}
                  {selectionMode ? "Cancel" : "Select"}
                </Button>
                <Link href="/add">
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Transaction
                  </Button>
                </Link>
              </div>
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
              {selectionMode && (
                <div className="ml-auto flex items-center gap-2">
                  <button
                    onClick={selectedIds.length === filteredTransactions.length ? deselectAll : selectAll}
                    className="px-3 py-2 rounded-lg text-sm text-primary-start hover:bg-white/5 transition-colors"
                  >
                    {selectedIds.length === filteredTransactions.length ? "Deselect All" : "Select All"}
                  </button>
                  <span className="text-sm text-foreground-tertiary">
                    {selectedIds.length} selected
                  </span>
                </div>
              )}
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
                        const isSelected = selectedIds.includes(transaction.id);
                        
                        return (
                          <div 
                            key={transaction.id}
                            className={cn(
                              "flex items-center justify-between p-4 hover:bg-white/5 transition-colors",
                              isSelected && "bg-primary/10"
                            )}
                          >
                            <div className="flex items-center gap-4">
                              {selectionMode && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    toggleSelection(transaction.id);
                                  }}
                                  className="flex-shrink-0"
                                >
                                  {isSelected ? (
                                    <CheckSquare className="h-5 w-5 text-primary-start" />
                                  ) : (
                                    <Square className="h-5 w-5 text-foreground-tertiary" />
                                  )}
                                </button>
                              )}
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
                              {!selectionMode && (
                                <div className="relative">
                                  <button 
                                    className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setMenuOpenId(menuOpenId === transaction.id ? null : transaction.id);
                                    }}
                                  >
                                    <MoreHorizontal className="h-4 w-4 text-foreground-secondary" />
                                  </button>
                                  {menuOpenId === transaction.id && (
                                    <div className="absolute right-0 top-full mt-1 w-40 bg-[#1a1a2e] border border-white/10 rounded-lg shadow-lg z-10 overflow-hidden">
                                       <button
                                         className="flex items-center gap-2 w-full px-3 py-2 text-sm text-foreground hover:bg-white/10 transition-colors"
                                         onClick={(e) => {
                                           e.stopPropagation();
                                           setMenuOpenId(null);
                                           setEditingTransaction(transaction);
                                         }}
                                       >
                                        <Pencil className="h-3.5 w-3.5" />
                                        Edit
                                      </button>
                                      <button
                                        className="flex items-center gap-2 w-full px-3 py-2 text-sm text-error hover:bg-white/10 transition-colors"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          setMenuOpenId(null);
                                          if (confirm("Are you sure you want to delete this transaction?")) {
                                            deleteTransaction(transaction.id);
                                          }
                                        }}
                                      >
                                        <Trash2 className="h-3.5 w-3.5" />
                                        Delete
                                      </button>
                                    </div>
                                  )}
                                </div>
                              )}
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

        {/* Bulk Action Bar */}
        {selectionMode && selectedIds.length > 0 && (
          <div className="fixed bottom-20 lg:bottom-6 left-1/2 -translate-x-1/2 z-50 animate-slideUp">
            <Card variant="elevated" className="px-6 py-3 flex items-center gap-4 shadow-2xl border-white/10 bg-dark-100">
              <span className="text-sm text-foreground-secondary font-medium">
                {selectedIds.length} selected
              </span>
              <div className="h-4 w-px bg-white/10" />
              <Button variant="ghost" size="sm" onClick={deselectAll}>
                Deselect
              </Button>
              <Button variant="danger" size="sm" onClick={bulkDelete}>
                <Trash className="h-4 w-4 mr-1" />
                Delete
              </Button>
            </Card>
          </div>
        )}
      </div>

      <div className="lg:hidden">
        <BottomNav />
      </div>

      {/* Edit Transaction Modal */}
      <EditTransactionModal
        transaction={editingTransaction}
        isOpen={!!editingTransaction}
        onClose={() => setEditingTransaction(null)}
      />
    </div>
  );
}

function cn(...classes: (string | boolean | undefined | null)[]) {
  return classes.filter(Boolean).join(" ");
}
