/**
 * Utility functions for data consistency and calculations
 */

import type { Transaction, Budget, Account, Goal, Category } from '@/types';

/**
 * Recalculate budget spent amounts based on transactions
 */
export function recalculateBudgetSpent(
  budgets: Budget[],
  transactions: Transaction[],
  categories: Category[]
): Budget[] {
  const now = new Date();

  return budgets.map(budget => {
    // Find the category for this budget
    const category = categories.find(c => c.id === budget.categoryId);
    if (!category) return budget;

    // Calculate the date range for this budget period
    const startDate = getBudgetPeriodStart(budget, now);
    const endDate = getBudgetPeriodEnd(budget, now);

    // Get transactions for this category within the budget period
    const categoryTransactions = transactions.filter(t => {
      const transactionDate = new Date(t.date);
      return (
        t.categoryId === budget.categoryId &&
        t.type === 'expense' &&
        transactionDate >= startDate &&
        transactionDate <= endDate
      );
    });

    // Calculate total spent
    const spent = categoryTransactions.reduce((sum, t) => sum + Number(t.amount), 0);
    const remaining = Number(budget.amount) - spent;

    return {
      ...budget,
      spent,
      remaining: Math.max(0, remaining) // Ensure remaining doesn't go negative
    };
  });
}

function getBudgetPeriodStart(budget: Budget, currentDate: Date): Date {
  switch (budget.period) {
    case 'weekly':
      const weekStart = new Date(currentDate);
      weekStart.setDate(currentDate.getDate() - currentDate.getDay());
      weekStart.setHours(0, 0, 0, 0);
      return weekStart;
    
    case 'biweekly':
      const biweeklyStart = new Date(currentDate);
      const dayOfWeek = currentDate.getDay();
      const daysSinceStart = dayOfWeek;
      biweeklyStart.setDate(currentDate.getDate() - daysSinceStart);
      biweeklyStart.setHours(0, 0, 0, 0);
      return biweeklyStart;
    
    case 'monthly':
      return new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    
    case 'quarterly':
      const quarter = Math.floor(currentDate.getMonth() / 3);
      return new Date(currentDate.getFullYear(), quarter * 3, 1);
    
    case 'yearly':
      return new Date(currentDate.getFullYear(), 0, 1);
    
    default:
      return new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
  }
}

function getBudgetPeriodEnd(budget: Budget, currentDate: Date): Date {
  switch (budget.period) {
    case 'weekly':
      const weekEnd = getBudgetPeriodStart(budget, currentDate);
      weekEnd.setDate(weekEnd.getDate() + 6);
      weekEnd.setHours(23, 59, 59, 999);
      return weekEnd;
    
    case 'biweekly':
      const biweeklyEnd = getBudgetPeriodStart(budget, currentDate);
      biweeklyEnd.setDate(biweeklyEnd.getDate() + 13);
      biweeklyEnd.setHours(23, 59, 59, 999);
      return biweeklyEnd;
    
    case 'monthly':
      return new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0, 23, 59, 59, 999);
    
    case 'quarterly':
      const quarterEnd = new Date(currentDate.getFullYear(), Math.floor(currentDate.getMonth() / 3) * 3 + 3, 0, 23, 59, 59, 999);
      return quarterEnd;
    
    case 'yearly':
      return new Date(currentDate.getFullYear(), 11, 31, 23, 59, 59, 999);
    
    default:
      return new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0, 23, 59, 59, 999);
  }
}

/**
 * Recalculate account balances based on transactions
 */
export function recalculateAccountBalances(
  accounts: Account[],
  transactions: Transaction[]
): Account[] {
  return accounts.map(account => {
    // Get all transactions for this account
    const accountTransactions = transactions.filter(t => t.accountId === account.id);

    // Calculate balance from scratch: income - expenses
    const balance = accountTransactions.reduce((balance, transaction) => {
      if (transaction.type === 'income') {
        return balance + Number(transaction.amount);
      } else if (transaction.type === 'expense') {
        return balance - Number(transaction.amount);
      }
      return balance;
    }, 0);

    return {
      ...account,
      balance
    };
  });
}

/**
 * Recalculate goal progress based on transactions or manual updates
 */
export function recalculateGoalProgress(
  goals: Goal[],
): Goal[] {
  // For now, goals are manually updated, but this could be extended
  // to automatically track savings transactions toward goals
  return goals;
}

/**
 * Get current month transactions
 */
export function getCurrentMonthTransactions(transactions: Transaction[]): Transaction[] {
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  return transactions.filter(t => {
    const d = new Date(t.date);
    return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
  });
}

/**
 * Get last month transactions
 */
export function getLastMonthTransactions(transactions: Transaction[]): Transaction[] {
  const now = new Date();
  const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);

  return transactions.filter(t => {
    const d = new Date(t.date);
    return d >= lastMonth && d <= lastMonthEnd;
  });
}

/**
 * Calculate total income for a set of transactions
 */
export function calculateTotalIncome(transactions: Transaction[]): number {
  return transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + Number(t.amount), 0);
}

/**
 * Calculate total expenses for a set of transactions
 */
export function calculateTotalExpenses(transactions: Transaction[]): number {
  return transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + Number(t.amount), 0);
}

/**
 * Calculate savings rate
 */
export function calculateSavingsRate(income: number, expenses: number): number {
  return income > 0 ? ((income - expenses) / income) * 100 : 0;
}
