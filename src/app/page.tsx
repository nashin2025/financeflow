"use client";

import * as React from "react";
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
  const currentMonth = new Date().toLocaleString('default', { month: 'long' });

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
                <Link href="/add">
                  <Button className="w-full">
                    <Plus className="h-4 w-4 mr-2" />
                    Get Started - Add Your First Account
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
                  <ArrowUpRight className="h-4 w-4 text-success mr-1" />
                  <span className="text-success">+{formatPercentage(2.3)}</span>
                  <span className="text-foreground-tertiary ml-1">this month</span>
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
                  <ArrowUpRight className="h-4 w-4 text-success mr-1" />
                  <span className="text-success">+{formatPercentage(5)}</span>
                  <span className="text-foreground-tertiary ml-1">vs last month</span>
                </div>
              </CardContent>
            </Card>

            {/* Expenses */}
            <Card variant="glass" className="relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-error/20 to-warning/20 rounded-full -translate-y-8 translate-x-8" />
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-foreground-secondary">Expenses</p>
                    <p className="text-xl lg:text-2xl font-bold text-error mt-1 font-mono">
                      {formatCurrency(totalExpenses)}
                    </p>
                  </div>
                  <div className="w-10 h-10 rounded-full bg-error/20 flex items-center justify-center">
                    <ArrowDownRight className="h-5 w-5 text-error" />
                  </div>
                </div>
                <div className="flex items-center mt-3 text-sm">
                  <ArrowDownRight className="h-4 w-4 text-success mr-1" />
                  <span className="text-success">-{formatPercentage(3)}</span>
                  <span className="text-foreground-tertiary ml-1">vs last month</span>
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
                      {formatPercentage(savingsRate)}
                    </p>
                  </div>
                  <ProgressRing value={savingsRate} max={100} size={50} strokeWidth={5}>
                    <span className="text-xs font-bold text-foreground">{Math.round(savingsRate)}%</span>
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
          <Card variant="elevated" className="bg-gradient-to-r from-primary-start/10 to-primary-end/10 border-primary-start/20">
            <CardContent className="p-6">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 rounded-full gradient-primary flex items-center justify-center flex-shrink-0">
                  <span className="text-2xl">🤖</span>
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-foreground">AI Insight</h3>
                  <p className="text-foreground-secondary mt-1">
                    Your dining spending is 23% higher than last month. 
                    Consider adjusting your budget or tracking expenses more closely.
                  </p>
                  <div className="flex gap-3 mt-4">
                    <Button size="sm">Adjust Budget</Button>
                    <Button variant="ghost" size="sm">Dismiss</Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </main>
      </div>

      {/* Mobile Bottom Nav */}
      <div className="lg:hidden">
        <BottomNav />
      </div>
    </div>
  );
}