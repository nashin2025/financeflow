"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Sidebar } from "@/components/layout/sidebar";
import { BottomNav } from "@/components/layout/bottom-nav";
import { Header } from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress, ProgressRing } from "@/components/ui/progress";
import { formatCurrency, formatPercentage } from "@/lib/utils";
import { useAppStore } from "@/stores/app-store";
import { 
  Plus, 
  Target, 
  PieChart, 
  Landmark,
  ArrowRight,
  Wallet,
  ArrowUpRight,
  ArrowDownRight
} from "lucide-react";
import Link from "next/link";

export default function DashboardPage() {
  const router = useRouter();
  const [showAiInsight, setShowAiInsight] = React.useState(true);
  const { user, transactions, accounts, budgets, goals, categories } = useAppStore();

  const isLoggedIn = !!user;
  
  const totalBalance = accounts.reduce((sum, acc) => sum + acc.balance, 0);
  const totalIncome = transactions
    .filter(t => t.type === "income")
    .reduce((sum, t) => sum + t.amount, 0);
  const totalExpenses = transactions
    .filter(t => t.type === "expense")
    .reduce((sum, t) => sum + t.amount, 0);
  const savingsRate = totalIncome > 0 ? ((totalIncome - totalExpenses) / totalIncome) * 100 : 0;

  const getCategoryInfo = (categoryId: string) => {
    const category = categories.find(c => c.id === categoryId);
    return category || { name: "Other", icon: "📦", color: "#9CA3AF" };
  };

  const recentTransactions = transactions.slice(0, 5);
  const currentDate = new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  const now = new Date();
  const currentMonthNum = now.getMonth();
  const currentYear = now.getFullYear();
  const lastMonthNum = currentMonthNum === 0 ? 11 : currentMonthNum - 1;
  const lastMonthYear = currentMonthNum === 0 ? currentYear - 1 : currentYear;

  const currentMonthTransactions = transactions.filter(t => {
    const d = new Date(t.date);
    return d.getMonth() === currentMonthNum && d.getFullYear() === currentYear;
  });
  const lastMonthTransactions = transactions.filter(t => {
    const d = new Date(t.date);
    return d.getMonth() === lastMonthNum && d.getFullYear() === lastMonthYear;
  });

  const currentMonthIncome = currentMonthTransactions.filter(t => t.type === "income").reduce((s, t) => s + t.amount, 0);
  const lastMonthIncome = lastMonthTransactions.filter(t => t.type === "income").reduce((s, t) => s + t.amount, 0);
  const currentMonthExpenses = currentMonthTransactions.filter(t => t.type === "expense").reduce((s, t) => s + t.amount, 0);
  const lastMonthExpenses = lastMonthTransactions.filter(t => t.type === "expense").reduce((s, t) => s + t.amount, 0);

  const incomeChange = lastMonthIncome > 0 ? ((currentMonthIncome - lastMonthIncome) / lastMonthIncome) * 100 : null;
  const expenseChange = lastMonthExpenses > 0 ? ((currentMonthExpenses - lastMonthExpenses) / lastMonthExpenses) * 100 : null;

  const currentSavingsRate = currentMonthIncome > 0 ? ((currentMonthIncome - currentMonthExpenses) / currentMonthIncome) * 100 : 0;
  const lastSavingsRate = lastMonthIncome > 0 ? ((lastMonthIncome - lastMonthExpenses) / lastMonthIncome) * 100 : 0;
  const savingsRateChange = lastMonthIncome > 0 ? currentSavingsRate - lastSavingsRate : null;

  const last6MonthsExpenses = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date();
    d.setMonth(d.getMonth() - i);
    const monthTxns = transactions.filter(t => {
      const td = new Date(t.date);
      return td.getMonth() === d.getMonth() && td.getFullYear() === d.getFullYear() && t.type === "expense";
    });
    last6MonthsExpenses.push(monthTxns.reduce((s, t) => s + t.amount, 0));
  }
  const avg6MonthExpenses = last6MonthsExpenses.length > 0 ? last6MonthsExpenses.reduce((s, v) => s + v, 0) / last6MonthsExpenses.length : 0;
  const vsAvgChange = avg6MonthExpenses > 0 ? ((currentMonthExpenses - avg6MonthExpenses) / avg6MonthExpenses) * 100 : null;

  const diningCategory = categories.find(c => c.name === "Dining Out");
  const currentDining = diningCategory ? currentMonthTransactions.filter(t => t.categoryId === diningCategory.id && t.type === "expense").reduce((s, t) => s + t.amount, 0) : 0;
  const lastDining = diningCategory ? lastMonthTransactions.filter(t => t.categoryId === diningCategory.id && t.type === "expense").reduce((s, t) => s + t.amount, 0) : 0;
  const diningChange = lastDining > 0 ? ((currentDining - lastDining) / lastDining) * 100 : null;

  const groceriesCategory = categories.find(c => c.name === "Groceries");
  const currentGroceries = groceriesCategory ? currentMonthTransactions.filter(t => t.categoryId === groceriesCategory.id && t.type === "expense").reduce((s, t) => s + t.amount, 0) : 0;
  const budgetGroceries = budgets.find(b => b.categoryId === groceriesCategory?.id);
  const groceriesUnderBudget = budgetGroceries && currentGroceries < budgetGroceries.amount;

  const hasData = transactions.length > 0 || accounts.length > 0;
  const hasTransactions = transactions.length > 0;
  const hasAccounts = accounts.length > 0;

  const financialScores = React.useMemo(() => {
    const savings = currentMonthIncome > 0 ? Math.min(((currentMonthIncome - currentMonthExpenses) / currentMonthIncome) * 100, 100) : 0;
    const budgetScore = budgets.length > 0
      ? Math.min(budgets.reduce((s, b) => s + Math.max(0, 100 - (b.spent / b.amount) * 100), 0) / budgets.length, 100)
      : 0;
    const creditAccounts = accounts.filter(a => a.type === "credit_card" || a.type === "loan" || a.type === "mortgage");
    const debtScore = creditAccounts.length > 0
      ? Math.max(0, 100 - (creditAccounts.reduce((s, a) => s + Number(a.balance), 0) / (totalBalance || 1)) * 100)
      : 0;
    const emergency = totalBalance > 0 ? Math.min((totalBalance / (currentMonthExpenses || 1)) * (100 / 3), 100) : 0;
    const consistency = hasTransactions ? Math.min((transactions.length / 20) * 100, 100) : 0;
    return {
      savings: Math.round(savings),
      budget: Math.round(budgetScore),
      debt: Math.round(debtScore),
      emergency: Math.round(emergency),
      consistency: Math.round(consistency),
      overall: Math.round((savings + budgetScore + debtScore + emergency + consistency) / 5),
    };
  }, [currentMonthIncome, currentMonthExpenses, budgets, totalBalance, transactions.length, hasTransactions, accounts]);

  const getHealthLabel = (score: number) => {
    if (score >= 80) return "Excellent";
    if (score >= 60) return "Good";
    if (score >= 40) return "Fair";
    if (score >= 20) return "Needs Improvement";
    return "Just Starting";
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen">
        <div className="hidden lg:block">
          <Sidebar />
        </div>
        <div className="lg:pl-[240px]">
          <Header title="Dashboard" showSearch={false} showNotifications={false} />
          <main className="p-4 lg:p-6 pb-20 lg:pb-6 flex items-center justify-center min-h-[calc(100vh-80px)]">
            <Card variant="glass" className="max-w-md w-full text-center p-8">
              <div className="w-20 h-20 rounded-full gradient-primary flex items-center justify-center mx-auto mb-6">
                <Wallet className="h-10 w-10 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-foreground mb-2">Welcome to FinanceFlow</h1>
              <p className="text-foreground-secondary mb-6">Track your finances, set budgets, and achieve your financial goals.</p>
              <div className="space-y-3">
                <Link href="/signup">
                  <Button className="w-full">
                    <Plus className="h-4 w-4 mr-2" />
                    Get Started - Add Your First Account
                  </Button>
                </Link>
                <Link href="/login">
                  <Button variant="secondary" className="w-full">
                    Sign In
                  </Button>
                </Link>
                <p className="text-sm text-foreground-tertiary">Sign up to save your data and access premium features</p>
              </div>
            </Card>
          </main>
        </div>
        <div className="lg:hidden">
          <BottomNav />
        </div>
      </div>
    );
  }

  const userName = user?.name?.split(' ')[0] || 'User';

  return (
    <div className="min-h-screen">
      {/* Desktop Sidebar - Hidden on mobile */}
      <div className="hidden lg:block">
        <Sidebar />
      </div>

      {/* Main Content Area */}
      <div className="lg:pl-[240px]">
        <Header title="Dashboard" showSearch showNotifications />
        
        <main className="p-4 lg:p-6 pb-20 lg:pb-6 space-y-6">
          {/* Welcome Section */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold text-foreground">
                Hi, {userName} 👋
              </h1>
              <p className="text-foreground-secondary mt-1">
                {currentDate}
              </p>
            </div>
            <div className="flex gap-3">
              <Link href="/transactions">
                <Button variant="secondary" size="sm">
                  <svg className="h-4 w-4 mr-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1Z"/><path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8"/><path d="M12 17V7"/></svg>
                  Transactions
                </Button>
              </Link>
              <Link href="/add">
                <Button size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Transaction
                </Button>
              </Link>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Total Balance */}
            <Card variant="glass" className="relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-primary-start/20 to-primary-end/20 rounded-full -translate-y-8 translate-x-8" />
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-foreground-secondary">Total Balance</p>
                    <p className="text-xl lg:text-2xl font-bold text-foreground mt-1 font-mono">
                      {formatCurrency(totalBalance)}
                    </p>
                  </div>
                  <div className="w-10 h-10 rounded-full bg-success/20 flex items-center justify-center">
                    <Wallet className="h-5 w-5 text-success" />
                  </div>
                </div>
                <div className="flex items-center mt-3 text-sm">
                  {savingsRateChange !== null ? (
                    <>
                      <ArrowUpRight className={`h-4 w-4 mr-1 ${savingsRateChange >= 0 ? 'text-success' : 'text-error'}`} />
                      <span className={savingsRateChange >= 0 ? 'text-success' : 'text-error'}>{savingsRateChange >= 0 ? '+' : ''}{formatPercentage(savingsRateChange)}</span>
                      <span className="text-foreground-tertiary ml-1">savings rate</span>
                    </>
                  ) : (
                    <span className="text-foreground-tertiary">No data yet</span>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Income */}
            <Card variant="glass" className="relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-success/20 to-teal/20 rounded-full -translate-y-8 translate-x-8" />
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-foreground-secondary">Income</p>
                    <p className="text-xl lg:text-2xl font-bold text-success mt-1 font-mono">
                      {formatCurrency(totalIncome)}
                    </p>
                  </div>
                  <div className="w-10 h-10 rounded-full bg-success/20 flex items-center justify-center">
                    <ArrowUpRight className="h-5 w-5 text-success" />
                  </div>
                </div>
                <div className="flex items-center mt-3 text-sm">
                  {expenseChange !== null ? (
                    <>
                      <ArrowDownRight className={`h-4 w-4 mr-1 ${expenseChange <= 0 ? 'text-success' : 'text-error'}`} />
                      <span className={expenseChange <= 0 ? 'text-success' : 'text-error'}>{expenseChange <= 0 ? '' : '+'}{formatPercentage(expenseChange)}</span>
                      <span className="text-foreground-tertiary ml-1">vs last month</span>
                    </>
                  ) : (
                    <span className="text-foreground-tertiary">No data yet</span>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Savings Rate */}
            <Card variant="glass" className="relative overflow-hidden">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-foreground-secondary">Savings Rate</p>
                    <p className="text-xl lg:text-2xl font-bold text-accent-cyan mt-1 font-mono">
                      {formatPercentage(currentSavingsRate)}
                    </p>
                  </div>
                  <ProgressRing value={currentSavingsRate} max={100} size={50} strokeWidth={5}>
                    <span className="text-xs font-bold text-foreground">{Math.round(currentSavingsRate)}%</span>
                  </ProgressRing>
                </div>
                <p className="text-sm text-foreground-tertiary mt-3">
                  Target: 20%
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <Link href="/add">
              <Card variant="glass" className="hover:bg-white/10 transition-colors cursor-pointer p-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center">
                    <Plus className="h-5 w-5 text-white" />
                  </div>
                  <span className="font-medium text-foreground">Add Transaction</span>
                </div>
              </Card>
            </Link>
            <Link href="/budgets">
              <Card variant="glass" className="hover:bg-white/10 transition-colors cursor-pointer p-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-xl bg-warning/20 flex items-center justify-center">
                    <PieChart className="h-5 w-5 text-warning" />
                  </div>
                  <span className="font-medium text-foreground">Budgets</span>
                </div>
              </Card>
            </Link>
            <Link href="/goals">
              <Card variant="glass" className="hover:bg-white/10 transition-colors cursor-pointer p-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-xl bg-success/20 flex items-center justify-center">
                    <Target className="h-5 w-5 text-success" />
                  </div>
                  <span className="font-medium text-foreground">Goals</span>
                </div>
              </Card>
            </Link>
            <Link href="/accounts">
              <Card variant="glass" className="hover:bg-white/10 transition-colors cursor-pointer p-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-xl bg-info/20 flex items-center justify-center">
                    <Landmark className="h-5 w-5 text-info" />
                  </div>
                  <span className="font-medium text-foreground">Accounts</span>
                </div>
              </Card>
            </Link>
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            {/* Budget Overview */}
            <Card variant="glass">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-lg font-semibold">Budget Overview</CardTitle>
                <Link href="/budgets" className="text-sm text-primary-start hover:underline flex items-center">
                  View All <ArrowRight className="h-4 w-4 ml-1" />
                </Link>
              </CardHeader>
              <CardContent className="space-y-4">
                {budgets.map((budget) => {
                  const category = getCategoryInfo(budget.categoryId);
                  const percentage = (budget.spent / budget.amount) * 100;
                  const isOver = percentage > 100;
                  const isWarning = percentage > 75;
                  
                  return (
                    <div key={budget.id} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <span className="text-lg">{category.icon}</span>
                          <span className="font-medium text-foreground">{budget.name}</span>
                        </div>
                        <span className={`text-sm font-mono ${isOver ? "text-error" : "text-foreground-secondary"}`}>
                          {formatCurrency(budget.spent)} / {formatCurrency(budget.amount)}
                        </span>
                      </div>
                      <Progress 
                        value={budget.spent} 
                        max={budget.amount}
                        variant={isOver ? "danger" : isWarning ? "warning" : "default"}
                      />
                      <div className="flex items-center justify-between text-xs text-foreground-tertiary">
                        <span>{percentage.toFixed(0)}% spent</span>
                        <span>{formatCurrency(budget.remaining)} remaining</span>
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>

            {/* Recent Transactions */}
            <Card variant="glass">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-lg font-semibold">Recent Transactions</CardTitle>
                <Link href="/transactions" className="text-sm text-primary-start hover:underline flex items-center">
                  View All <ArrowRight className="h-4 w-4 ml-1" />
                </Link>
              </CardHeader>
              <CardContent className="space-y-1">
                {recentTransactions.map((transaction) => {
                  const category = getCategoryInfo(transaction.categoryId);
                  const isExpense = transaction.type === "expense";
                  
                  return (
                    <div 
                      key={transaction.id} 
                      className="flex items-center justify-between p-3 rounded-xl hover:bg-white/5 transition-colors"
                    >
                      <div className="flex items-center space-x-3">
                        <div 
                          className="w-10 h-10 rounded-full flex items-center justify-center text-lg"
                          style={{ backgroundColor: `${category.color}20` }}
                        >
                          {category.icon}
                        </div>
                        <div>
                          <p className="font-medium text-foreground">{transaction.merchantName}</p>
                          <p className="text-sm text-foreground-tertiary">{category.name}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`font-mono font-medium ${isExpense ? "text-error" : "text-success"}`}>
                          {isExpense ? "-" : "+"}{formatCurrency(transaction.amount)}
                        </p>
                        <p className="text-xs text-foreground-tertiary">{transaction.date}</p>
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          </div>

          {/* Goals Section */}
          <Card variant="glass">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg font-semibold">Active Goals</CardTitle>
              <Link href="/goals" className="text-sm text-primary-start hover:underline flex items-center">
                View All <ArrowRight className="h-4 w-4 ml-1" />
              </Link>
            </CardHeader>
            <CardContent>
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {goals.slice(0, 4).map((goal) => {
                  const percentage = (goal.currentAmount / goal.targetAmount) * 100;
                  
                  return (
                    <div key={goal.id} className="p-4 rounded-xl bg-white/5">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-2xl">{goal.icon}</span>
                        <span className="text-sm font-mono text-foreground-secondary">
                          {percentage.toFixed(0)}%
                        </span>
                      </div>
                      <h4 className="font-medium text-foreground truncate">{goal.name}</h4>
                      <p className="text-sm text-foreground-tertiary mt-1">
                        {formatCurrency(goal.currentAmount)} / {formatCurrency(goal.targetAmount)}
                      </p>
                      <Progress 
                        value={goal.currentAmount} 
                        max={goal.targetAmount}
                        className="mt-3"
                      />
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* AI Insights */}
          {showAiInsight && hasTransactions && (
          <Card variant="elevated" className="bg-gradient-to-r from-primary-start/10 to-primary-end/10 border-primary-start/20">
            <CardContent className="p-6">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 rounded-full gradient-primary flex items-center justify-center flex-shrink-0">
                  <span className="text-2xl">🤖</span>
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-foreground">AI Insight</h3>
                  <p className="text-foreground-secondary mt-1">
                    {diningChange !== null && diningChange > 0
                      ? `Your dining spending is ${diningChange.toFixed(0)}% higher than last month. Consider adjusting your budget or tracking expenses more closely.`
                      : diningChange !== null && diningChange < 0
                      ? `Great job! Your dining spending is ${Math.abs(diningChange).toFixed(0)}% lower than last month. Keep it up!`
                      : groceriesUnderBudget
                      ? `Your grocery spending is under budget. You're on track this month!`
                      : hasTransactions
                      ? `You have ${transactions.length} transaction${transactions.length > 1 ? 's' : ''} recorded. Keep tracking to get personalized insights!`
                      : `Start adding transactions to get AI-powered insights about your spending habits.`
                    }
                  </p>
                  <div className="flex gap-3 mt-4">
                    <Button size="sm" onClick={() => router.push("/budgets")}>Adjust Budget</Button>
                    <Button variant="ghost" size="sm" onClick={() => setShowAiInsight(false)}>Dismiss</Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          )}

          {/* Financial Health Score */}
          {hasTransactions && (
          <Card variant="glass">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row md:items-center gap-6">
                {/* Large Overall Score Ring */}
                <div className="flex-shrink-0">
                  <ProgressRing value={financialScores.overall} max={100} size={100} strokeWidth={8}>
                    <div className="text-center">
                      <span className="text-2xl font-bold text-foreground">{financialScores.overall}</span>
                      <span className="text-xs text-foreground-tertiary">/100</span>
                    </div>
                  </ProgressRing>
                </div>

                {/* Score Details */}
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <svg className="h-5 w-5 text-primary-start" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3l1.5 4.5L18 9l-4.5 1.5L12 15l-1.5-4.5L6 9l4.5-1.5z"/><path d="M5 19l1.5-1.5L8 19l-1.5 1.5z"/><path d="M17 19l1.5-1.5L20 19l-1.5 1.5z"/></svg>
                    <h3 className="text-lg font-semibold text-foreground">Financial Health Score</h3>
                  </div>
                  <p className="text-sm text-foreground-secondary mb-4">
                    Your overall financial health is <span className={financialScores.overall >= 60 ? 'text-success font-medium' : 'text-warning font-medium'}>{getHealthLabel(financialScores.overall)}</span>. {financialScores.overall >= 60 ? 'Keep making smart decisions!' : 'Start building better habits today.'}
                  </p>

                  {/* Horizontal Progress Bars */}
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    {[
                      { label: "Savings", score: financialScores.savings },
                      { label: "Budget", score: financialScores.budget },
                      { label: "Debt", score: financialScores.debt },
                      { label: "Emergency", score: financialScores.emergency },
                      { label: "Consistency", score: financialScores.consistency },
                    ].map((item) => (
                      <div key={item.label} className="flex flex-col items-center gap-1">
                        <Progress value={item.score} max={100} variant={item.score >= 60 ? "default" : item.score >= 30 ? "warning" : "danger"} />
                        <span className="text-xs text-foreground-secondary">{item.label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          )}

          {/* Spending Trend Insight */}
          {hasTransactions && vsAvgChange !== null && (
          <div className="grid lg:grid-cols-2 gap-6">
            <Card variant="glass">
              <CardHeader>
                <CardTitle className="text-lg font-semibold">Spending Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between p-4 rounded-xl bg-white/5">
                  <div>
                    <p className="text-sm text-foreground-secondary">This Month</p>
                    <p className="text-xl font-bold font-mono text-foreground">{formatCurrency(currentMonthExpenses)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-foreground-secondary">vs 6-Month Avg</p>
                    <p className={`text-lg font-mono font-semibold ${vsAvgChange <= 0 ? 'text-success' : 'text-error'}`}>
                      {vsAvgChange <= 0 ? '' : '+'}{formatPercentage(vsAvgChange)}
                    </p>
                  </div>
                </div>
                <p className="text-sm text-foreground-secondary mt-3">
                  {vsAvgChange <= 0
                    ? `Your spending is ${Math.abs(vsAvgChange).toFixed(0)}% lower than the 6-month average. Great job staying on track!`
                    : `Your spending is ${vsAvgChange.toFixed(0)}% higher than the 6-month average. Consider reviewing your expenses.`
                  }
                </p>
              </CardContent>
            </Card>

            <Card variant="glass">
              <CardHeader>
                <CardTitle className="text-lg font-semibold">Category Insights</CardTitle>
              </CardHeader>
              <CardContent>
                {diningChange !== null && diningChange > 0 && (
                  <div className="p-4 rounded-xl bg-error/5 border border-error/10 mb-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-foreground">🍕 Dining Out</span>
                      <span className="text-sm font-mono text-error">+{formatPercentage(diningChange)}</span>
                    </div>
                    <p className="text-xs text-foreground-secondary mt-1">
                      Your dining out expenses are {diningChange.toFixed(0)}% higher than last month.
                    </p>
                  </div>
                )}
                {groceriesUnderBudget && (
                  <div className="p-4 rounded-xl bg-success/5 border border-success/10">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-foreground">🛒 Groceries</span>
                      <span className="text-xs font-mono text-success">Under Budget</span>
                    </div>
                    <p className="text-xs text-foreground-secondary mt-1">
                      Grocery spending is within budget limits.
                    </p>
                  </div>
                )}
                {diningChange === null && !groceriesUnderBudget && (
                  <p className="text-sm text-foreground-secondary text-center py-4">
                    Add more transactions to see category insights.
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
          )}
        </main>
      </div>

      {/* Mobile Bottom Nav */}
      <div className="lg:hidden">
        <BottomNav />
      </div>
    </div>
  );
}