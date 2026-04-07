"use client";

import * as React from "react";
import { Sidebar } from "@/components/layout/sidebar";
import { BottomNav } from "@/components/layout/bottom-nav";
import { Header } from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatCurrency, formatPercentage, cn } from "@/lib/utils";
import { useAppStore } from "@/stores/app-store";
import { PremiumLock } from "@/components/premium-lock";
import { SpendingHeatmap } from "@/components/spending-heatmap";
import { FilterModal } from "@/components/filter-modal";
import {
  TrendingUp, 
  TrendingDown,
  ArrowUpRight,
  ArrowDownRight,
  DollarSign,
  PieChart as PieChartIcon,
  BarChart3,
  Calendar,
  Download,
  Filter,
  ChevronDown
} from "lucide-react";

type AnalyticsTab = "spending" | "income" | "networth";

export default function AnalyticsPage() {
  const { transactions, categories, accounts, budgets } = useAppStore();
  const [activeTab, setActiveTab] = React.useState<AnalyticsTab>("spending");
  const [timeRange, setTimeRange] = React.useState("month");
  const [showFilterModal, setShowFilterModal] = React.useState(false);
  const [filters, setFilters] = React.useState<{
    dateRange: 'all' | 'last7days' | 'last30days' | 'last90days' | 'thisYear';
    categories: string[];
    type: 'all' | 'expense' | 'income';
  }>({
    dateRange: 'all',
    categories: [],
    type: 'all',
  });

  const expenseTransactions = transactions.filter(t => t.type === "expense");
  const incomeTransactions = transactions.filter(t => t.type === "income");

  const spendingByCategory = React.useMemo(() => {
    const grouped: Record<string, number> = {};
    expenseTransactions.forEach(t => {
      grouped[t.categoryId] = (grouped[t.categoryId] || 0) + t.amount;
    });
    
    return Object.entries(grouped)
      .map(([categoryId, amount]) => {
        const category = categories.find(c => c.id === categoryId);
        return {
          categoryId,
          name: category?.name || "Other",
          icon: category?.icon || "📦",
          color: category?.color || "#9CA3AF",
          amount,
        };
      })
      .sort((a, b) => b.amount - a.amount);
  }, [expenseTransactions, categories]);

  const totalSpending = spendingByCategory.reduce((sum, c) => sum + c.amount, 0);

  const spendingWithPercentage = spendingByCategory.map(c => ({
    ...c,
    percentage: totalSpending > 0 ? (c.amount / totalSpending) * 100 : 0,
  }));

  const totalIncome = incomeTransactions.reduce((sum, t) => sum + t.amount, 0);
  const totalExpenses = expenseTransactions.reduce((sum, t) => sum + t.amount, 0);

  const netWorth = accounts.reduce((sum, a) => sum + a.balance, 0);

  const currentMonthStr = new Date().toLocaleDateString('en-US', { month: 'short' });

  const handleExport = () => {
    // Create PDF content
    const pdfContent = generatePDFContent();
    const blob = new Blob([pdfContent], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `financeflow_${activeTab}_report.pdf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const generatePDFContent = () => {
    // Simple PDF generation - in a real app, you'd use a library like jsPDF
    // For now, we'll create a basic text representation
    let content = `FinanceFlow ${activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Report\n`;
    content += `Generated on: ${new Date().toLocaleDateString()}\n\n`;

    if (activeTab === "spending") {
      content += "SPENDING BY CATEGORY\n";
      content += "=".repeat(50) + "\n\n";
      spendingWithPercentage.forEach(category => {
        content += `${category.name.padEnd(20)} ${formatCurrency(category.amount).padStart(15)} (${category.percentage.toFixed(1)}%)\n`;
      });
      content += "\n";
      content += `Total Spending: ${formatCurrency(totalExpenses)}\n`;
    } else if (activeTab === "income") {
      content += "INCOME OVER TIME\n";
      content += "=".repeat(50) + "\n\n";
      monthlyData.forEach(month => {
        content += `${month.month.padEnd(15)} ${formatCurrency(month.income).padStart(15)}\n`;
      });
      content += "\n";
      content += `Total Income: ${formatCurrency(totalIncome)}\n`;
    } else {
      content += "FINANCIAL OVERVIEW\n";
      content += "=".repeat(50) + "\n\n";
      monthlyData.forEach(month => {
        const net = month.income - month.expenses;
        content += `${month.month.padEnd(12)} Expenses: ${formatCurrency(month.expenses).padStart(12)} Income: ${formatCurrency(month.income).padStart(12)} Net: ${formatCurrency(net).padStart(12)}\n`;
      });
      content += "\n";
      content += `Total Expenses: ${formatCurrency(totalExpenses)}\n`;
      content += `Total Income: ${formatCurrency(totalIncome)}\n`;
      content += `Net: ${formatCurrency(totalIncome - totalExpenses)}\n`;
    }

    // Convert to basic PDF-like format (this is a placeholder - real PDF generation would use jsPDF)
    return content;
  };

  const monthlyData = React.useMemo(() => {
    const last6Months = [];
    for (let i = 5; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const monthStr = date.toLocaleDateString('en-US', { month: 'short' });
      
      const monthTransactions = transactions.filter(t => {
        const tDate = new Date(t.date);
        return tDate.getMonth() === date.getMonth() && tDate.getFullYear() === date.getFullYear();
      });
      
      const income = monthTransactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0);
      const expenses = monthTransactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);
      
      last6Months.push({ month: monthStr, income, expenses });
    }
    return last6Months;
  }, [transactions]);

  const maxExpense = Math.max(...monthlyData.map(d => d.expenses));

  const topMerchants = React.useMemo(() => {
    const grouped: Record<string, { amount: number; count: number; category: string }> = {};
    expenseTransactions.forEach(t => {
      if (!grouped[t.merchantName]) {
        const category = categories.find(c => c.id === t.categoryId);
        grouped[t.merchantName] = { amount: 0, count: 0, category: category?.name || "Other" };
      }
      grouped[t.merchantName].amount += t.amount;
      grouped[t.merchantName].count += 1;
    });
    
    return Object.entries(grouped)
      .map(([name, data]) => ({ name, ...data }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 5);
  }, [expenseTransactions, categories]);

  const getCategoryInfo = (categoryId: string) => {
    const category = categories.find(c => c.id === categoryId);
    return category || { name: "Other", icon: "📦", color: "#9CA3AF" };
  };

  return (
    <div className="min-h-screen">
      <div className="hidden lg:block">
        <Sidebar />
      </div>

      <div className="lg:pl-[240px]">
        <Header title="Analytics" showSearch showNotifications />
        
        <main className="p-4 lg:p-6 pb-20 lg:pb-6 space-y-6">
          {/* Tabs and Controls */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex gap-2 p-1 bg-white/5 rounded-xl">
              {(["spending", "income", "networth"] as AnalyticsTab[]).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={cn(
                    "px-4 py-2 rounded-lg text-sm font-medium transition-all capitalize",
                    activeTab === tab
                      ? "gradient-primary text-white"
                      : "text-foreground-secondary hover:text-foreground"
                  )}
                >
                  {tab === "networth" ? "Net Worth" : tab}
                </button>
              ))}
            </div>
            
            <div className="flex gap-2">
              <PremiumLock feature="Advanced filtering and data export">
                <Button variant="secondary" size="sm" onClick={() => setShowFilterModal(true)}>
                  <Filter className="h-4 w-4 mr-2" />
                  Filter
                </Button>
              </PremiumLock>
              <PremiumLock feature="Export your financial data">
                <Button variant="secondary" size="sm" onClick={handleExport}>
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
              </PremiumLock>
            </div>
          </div>

          {/* Spending Tab */}
          {activeTab === "spending" && (
            <>
              {/* Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card variant="glass">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-foreground-secondary">Daily Average</p>
                        <p className="text-2xl font-bold font-mono text-foreground mt-1">
                          {formatCurrency(totalSpending / new Date().getDate())}
                        </p>
                      </div>
                      <div className="w-10 h-10 rounded-full bg-error/20 flex items-center justify-center">
                        <ArrowDownRight className="h-5 w-5 text-error" />
                      </div>
                    </div>
                    <div className="flex items-center mt-3 text-sm">
                      {(() => {
                        const currentMonthExp = monthlyData[monthlyData.length - 1]?.expenses || 0;
                        const prevMonthExp = monthlyData[monthlyData.length - 2]?.expenses || 0;
                        const change = prevMonthExp > 0 ? ((currentMonthExp - prevMonthExp) / prevMonthExp) * 100 : null;
                        if (change === null) return <span className="text-foreground-tertiary">No data yet</span>;
                        return (
                          <>
                            <TrendingDown className={`h-4 w-4 mr-1 ${change <= 0 ? 'text-success' : 'text-error'}`} />
                            <span className={change <= 0 ? 'text-success' : 'text-error'}>{change <= 0 ? '' : '+'}{change.toFixed(0)}%</span>
                            <span className="text-foreground-tertiary ml-1">vs last month</span>
                          </>
                        );
                      })()}
                    </div>
                  </CardContent>
                </Card>

                <Card variant="glass">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-foreground-secondary">Daily Average</p>
                        <p className="text-2xl font-bold font-mono text-foreground mt-1">
                          {formatCurrency(totalSpending / new Date().getDate())}
                        </p>
                      </div>
                      <div className="w-10 h-10 rounded-full bg-warning/20 flex items-center justify-center">
                        <DollarSign className="h-5 w-5 text-warning" />
                      </div>
                    </div>
                    <p className="text-sm text-foreground-tertiary mt-3">
                      {(() => {
                        const now = new Date();
                        const month = now.toLocaleDateString('en-US', { month: 'long' });
                        return `${now.getDate()} days into ${month}`;
                      })()}
                    </p>
                  </CardContent>
                </Card>

                <Card variant="glass">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-foreground-secondary">Transactions</p>
                        <p className="text-2xl font-bold font-mono text-foreground mt-1">
                          {expenseTransactions.length}
                        </p>
                      </div>
                      <div className="w-10 h-10 rounded-full bg-info/20 flex items-center justify-center">
                        <BarChart3 className="h-5 w-5 text-info" />
                      </div>
                    </div>
                    <p className="text-sm text-foreground-tertiary mt-3">
                      This month
                    </p>
                  </CardContent>
                </Card>
              </div>

              <div className="grid lg:grid-cols-2 gap-6">
                {/* Category Breakdown */}
                <Card variant="glass">
                  <CardHeader>
                    <CardTitle className="text-lg font-semibold">Spending by Category</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {/* Donut Chart */}
                    <div className="flex items-center justify-center mb-6">
                      <div className="relative w-48 h-48">
                        <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90">
                          {spendingWithPercentage.reduce<React.ReactNode[]>((acc, cat, i) => {
                            const percentage = cat.percentage;
                            const prevPercentages = spendingWithPercentage.slice(0, i).reduce((s, c) => s + c.percentage, 0);
                            const dashArray = `${percentage} ${100 - percentage}`;
                            const dashOffset = -prevPercentages;
                            acc.push(
                              <circle
                                key={cat.categoryId}
                                cx="50"
                                cy="50"
                                r="40"
                                fill="none"
                                stroke={cat.color}
                                strokeWidth="20"
                                strokeDasharray={dashArray}
                                strokeDashoffset={dashOffset}
                                className="transition-all duration-500"
                              />
                            );
                            return acc;
                          }, [])}
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="text-center">
                            <p className="text-2xl font-bold font-mono text-foreground">{formatCurrency(totalSpending)}</p>
                            <p className="text-xs text-foreground-tertiary">Total</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Category List */}
                    <div className="space-y-3">
                      {spendingWithPercentage.slice(0, 8).map((cat) => (
                        <div key={cat.categoryId} className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div 
                              className="w-8 h-8 rounded-lg flex items-center justify-center text-sm"
                              style={{ backgroundColor: `${cat.color}20` }}
                            >
                              {cat.icon}
                            </div>
                            <span className="text-sm text-foreground">{cat.name}</span>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-mono text-foreground">{formatCurrency(cat.amount)}</p>
                            <p className="text-xs text-foreground-tertiary">{cat.percentage.toFixed(1)}%</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Spending Trend */}
                <Card variant="glass">
                  <CardHeader>
                    <CardTitle className="text-lg font-semibold">Spending Trend</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-64 flex items-end justify-between gap-3">
                      {monthlyData.map((data, i) => {
                        const height = (data.expenses / maxExpense) * 100;
                        const isCurrentMonth = data.month === currentMonthStr;
                        
                        return (
                          <div key={data.month} className="flex-1 flex flex-col items-center gap-2">
                            <div className="w-full relative">
                              <div 
                                className={cn(
                                  "w-full rounded-t-lg transition-all",
                                  isCurrentMonth ? "gradient-primary" : "bg-white/20"
                                )}
                                style={{ height: `${height}%` }}
                              />
                              {isCurrentMonth && (
                                <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-xs font-mono text-primary-start">
                                  {formatCurrency(data.expenses)}
                                </div>
                              )}
                            </div>
                            <span className={cn(
                              "text-xs",
                              isCurrentMonth ? "text-primary-start font-medium" : "text-foreground-tertiary"
                            )}>
                              {data.month}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                    <p className="text-center text-sm text-foreground-secondary mt-4">
                      {(() => {
                        const currentMonthExp = monthlyData[monthlyData.length - 1]?.expenses || 0;
                        const avg = monthlyData.length > 0 ? monthlyData.reduce((s, d) => s + d.expenses, 0) / monthlyData.length : 0;
                        if (avg === 0) return "Add transactions to see your spending trend";
                        const change = ((currentMonthExp - avg) / avg) * 100;
                        return change <= 0
                          ? `Your spending is ${Math.abs(change).toFixed(0)}% lower than the 6-month average`
                          : `Your spending is ${change.toFixed(0)}% higher than the 6-month average`;
                      })()}
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Top Merchants */}
              <Card variant="glass">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold">Top Merchants</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {topMerchants.map((merchant, i) => (
                      <div key={merchant.name} className="flex items-center justify-between p-3 rounded-lg bg-white/5">
                        <div className="flex items-center gap-3">
                          <span className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-xs font-bold text-foreground-secondary">
                            {i + 1}
                          </span>
                          <div>
                            <p className="font-medium text-foreground">{merchant.name}</p>
                            <p className="text-xs text-foreground-tertiary">
                              {merchant.count} transactions • {merchant.category}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-mono font-medium text-foreground">{formatCurrency(merchant.amount)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Spending Heatmap */}
              <SpendingHeatmap transactions={transactions} />

              {/* Budget vs Actual */}
              {budgets.length > 0 && (
                <Card variant="glass">
                  <CardHeader>
                    <CardTitle className="text-lg font-semibold">Budget vs Actual</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {budgets.filter(b => b.isActive).map((budget) => {
                        const category = getCategoryInfo(budget.categoryId);
                        const percentage = budget.amount > 0 ? (budget.spent / budget.amount) * 100 : 0;
                        const isOver = percentage > 100;
                        const maxVal = Math.max(budget.amount, budget.spent);
                        
                        return (
                          <div key={budget.id} className="space-y-2">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <span>{category.icon}</span>
                                <span className="text-sm font-medium text-foreground">{budget.name}</span>
                              </div>
                              <span className={`text-xs font-mono ${isOver ? 'text-error' : 'text-foreground-tertiary'}`}>
                                {percentage.toFixed(0)}%
                              </span>
                            </div>
                            <div className="flex gap-1 h-6">
                              {/* Budgeted bar */}
                              <div 
                                className="bg-primary/30 rounded-l-full transition-all"
                                style={{ width: `${(budget.amount / maxVal) * 100}%` }}
                                title={`Budgeted: ${formatCurrency(budget.amount)}`}
                              />
                              {/* Actual spent bar */}
                              <div 
                                className={cn(
                                  "rounded-r-full transition-all",
                                  isOver ? "bg-error" : "bg-primary"
                                )}
                                style={{ width: `${(budget.spent / maxVal) * 100}%` }}
                                title={`Spent: ${formatCurrency(budget.spent)}`}
                              />
                            </div>
                            <div className="flex items-center justify-between text-xs text-foreground-tertiary">
                              <div className="flex items-center gap-3">
                                <span className="flex items-center gap-1">
                                  <span className="w-2 h-2 rounded-full bg-primary/30" />
                                  Budget: {formatCurrency(budget.amount)}
                                </span>
                                <span className="flex items-center gap-1">
                                  <span className={cn("w-2 h-2 rounded-full", isOver ? "bg-error" : "bg-primary")} />
                                  Spent: {formatCurrency(budget.spent)}
                                </span>
                              </div>
                              {isOver && (
                                <span className="text-error">
                                  Over by {formatCurrency(budget.spent - budget.amount)}
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              )}
            </>
          )}

          {/* Income Tab */}
          {activeTab === "income" && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card variant="glass">
                  <CardContent className="p-6">
                    <p className="text-sm text-foreground-secondary">Total Income</p>
                    <p className="text-2xl font-bold font-mono text-success mt-1">
                      {formatCurrency(totalIncome)}
                    </p>
                    <div className="flex items-center mt-3 text-sm">
                      {(() => {
                        const currentMonthExp = monthlyData[monthlyData.length - 1]?.expenses || 0;
                        const prevMonthExp = monthlyData[monthlyData.length - 2]?.expenses || 0;
                        const change = prevMonthExp > 0 ? ((currentMonthExp - prevMonthExp) / prevMonthExp) * 100 : null;
                        if (change === null) return <span className="text-foreground-tertiary">No data yet</span>;
                        return (
                          <>
                            <TrendingDown className={`h-4 w-4 mr-1 ${change <= 0 ? 'text-success' : 'text-error'}`} />
                            <span className={change <= 0 ? 'text-success' : 'text-error'}>{change <= 0 ? '' : '+'}{change.toFixed(0)}%</span>
                            <span className="text-foreground-tertiary ml-1">vs last month</span>
                          </>
                        );
                      })()}
                    </div>
                  </CardContent>
                </Card>

                <Card variant="glass">
                  <CardContent className="p-6">
                    <p className="text-sm text-foreground-secondary">Monthly Average</p>
                    <p className="text-2xl font-bold font-mono text-foreground mt-1">
                      {formatCurrency(monthlyData.reduce((s, d) => s + d.income, 0) / 6)}
                    </p>
                  </CardContent>
                </Card>

                <Card variant="glass">
                  <CardContent className="p-6">
                    <p className="text-sm text-foreground-secondary">Income Sources</p>
                    <p className="text-2xl font-bold font-mono text-foreground mt-1">
                      {incomeTransactions.length}
                    </p>
                    <p className="text-sm text-foreground-tertiary mt-3">
                      Different sources
                    </p>
                  </CardContent>
                </Card>
              </div>

              <Card variant="glass">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold">Income Trend</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64 flex items-end justify-between gap-3">
                    {monthlyData.map((data, i) => {
                      const maxIncome = Math.max(...monthlyData.map(d => d.income));
                      const height = (data.income / maxIncome) * 100;
                      const isCurrentMonth = data.month === currentMonthStr;
                      
                      return (
                        <div key={data.month} className="flex-1 flex flex-col items-center gap-2">
                          <div 
                            className={cn(
                              "w-full rounded-t-lg transition-all",
                              isCurrentMonth ? "bg-success" : "bg-success/30"
                            )}
                            style={{ height: `${height}%` }}
                          />
                          <span className={cn(
                            "text-xs",
                            isCurrentMonth ? "text-success font-medium" : "text-foreground-tertiary"
                          )}>
                            {data.month}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </>
          )}

          {/* Net Worth Tab */}
          {activeTab === "networth" && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card variant="glass" className="col-span-1 md:col-span-2">
                  <CardContent className="p-6">
                    <p className="text-sm text-foreground-secondary">Total Net Worth</p>
                    <p className="text-3xl font-bold font-mono text-foreground mt-1">
                      {formatCurrency(netWorth)}
                    </p>
                    <div className="flex items-center mt-3 text-sm">
                      {(() => {
                        const currentIncome = monthlyData[monthlyData.length - 1]?.income || 0;
                        const prevIncome = monthlyData[monthlyData.length - 2]?.income || 0;
                        const change = prevIncome > 0 ? ((currentIncome - prevIncome) / prevIncome) * 100 : null;
                        if (change === null) return <span className="text-foreground-tertiary">No data yet</span>;
                        return (
                          <>
                            <TrendingUp className={`h-4 w-4 mr-1 ${change >= 0 ? 'text-success' : 'text-error'}`} />
                            <span className={change >= 0 ? 'text-success' : 'text-error'}>{change >= 0 ? '+' : ''}{change.toFixed(0)}%</span>
                            <span className="text-foreground-tertiary ml-1">vs last month</span>
                          </>
                        );
                      })()}
                    </div>
                  </CardContent>
                </Card>

                <Card variant="glass">
                  <CardContent className="p-6">
                    <p className="text-sm text-foreground-secondary">Change</p>
                    <p className={`text-2xl font-bold font-mono mt-1 ${netWorth >= 0 ? 'text-success' : 'text-error'}`}>
                      {netWorth >= 0 ? '+' : ''}{formatCurrency(netWorth)}
                    </p>
                  </CardContent>
                </Card>
              </div>

              <Card variant="glass">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold">Net Worth History</CardTitle>
                </CardHeader>
                <CardContent>
                  {accounts.length > 0 ? (
                    <div className="h-64 flex items-end justify-between gap-3">
                      {(() => {
                        const months = [];
                        for (let i = 5; i >= 0; i--) {
                          const d = new Date();
                          d.setMonth(d.getMonth() - i);
                          months.push(d.toLocaleDateString('en-US', { month: 'short' }));
                        }
                        return months;
                      })().map((month, i) => {
                        const netWorthValues = monthlyData.map(d => d.income - d.expenses);
                        const currentValue = netWorthValues[netWorthValues.length - 1] || netWorth;
                        const values = netWorthValues.map((v, idx) => v || (currentValue * (0.85 + idx * 0.03)));
                        const maxValue = Math.max(...values.map(Math.abs), 1);
                        const height = Math.abs(values[i] || 0) / maxValue * 100;
                        const isCurrentMonth = month === currentMonthStr;
                        
                        return (
                          <div key={month} className="flex-1 flex flex-col items-center gap-2">
                            <div 
                              className={cn(
                                "w-full rounded-t-lg transition-all",
                                isCurrentMonth ? "gradient-primary" : "bg-white/20"
                              )}
                              style={{ height: `${Math.max(height, 5)}%` }}
                            />
                            <span className={cn(
                              "text-xs",
                              isCurrentMonth ? "text-primary-start font-medium" : "text-foreground-tertiary"
                            )}>
                              {month}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="h-64 flex items-center justify-center">
                      <p className="text-foreground-secondary text-sm">Add accounts to see net worth history</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card variant="glass">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold">Assets Breakdown</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {accounts.map((account) => (
                      <div key={account.id} className="flex items-center justify-between p-4 rounded-lg bg-white/5">
                        <div className="flex items-center gap-3">
                          <div 
                            className="w-10 h-10 rounded-xl flex items-center justify-center text-lg"
                            style={{ backgroundColor: `${account.color}20` }}
                          >
                            {account.icon}
                          </div>
                          <div>
                            <p className="font-medium text-foreground">{account.name}</p>
                            <p className="text-xs text-foreground-tertiary capitalize">{account.type.replace("_", " ")}</p>
                          </div>
                        </div>
                        <p className={cn(
                          "font-mono font-semibold",
                          account.balance >= 0 ? "text-foreground" : "text-error"
                        )}>
                          {formatCurrency(account.balance)}
                        </p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </main>
      </div>

      <div className="lg:hidden">
        <BottomNav />
      </div>

      {/* Filter Modal */}
      <FilterModal
        isOpen={showFilterModal}
        onClose={() => setShowFilterModal(false)}
        filters={filters}
        onFiltersChange={setFilters}
      />

    </div>
  );
}