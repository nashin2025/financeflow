/**
 * Financial Health Score Calculator
 * Calculates a 0-100 score based on 5 weighted components.
 * All calculations are client-side using user's financial data.
 */

import type { Transaction, Budget, Goal, Account } from '@/types';

export interface HealthScoreComponent {
  score: number;
  value: number;
  target: number;
  label: string;
}

export interface HealthScoreResult {
  overall: number;
  breakdown: {
    savingsRate: HealthScoreComponent;
    budgetAdherence: HealthScoreComponent;
    debtRatio: HealthScoreComponent;
    emergencyFund: HealthScoreComponent;
    consistency: HealthScoreComponent;
  };
  insights: string[];
}

interface FinancialData {
  transactions: Transaction[];
  budgets: Budget[];
  goals: Goal[];
  accounts: Account[];
}

/**
 * Calculate the financial health score (0-100)
 */
export function calculateHealthScore(data: FinancialData): HealthScoreResult {
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  // Filter current month transactions
  const currentMonthTx = data.transactions.filter(t => {
    const d = new Date(t.date);
    return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
  });

  const income = currentMonthTx
    .filter(t => t.type === 'income')
    .reduce((s, t) => s + Number(t.amount), 0);

  const expenses = currentMonthTx
    .filter(t => t.type === 'expense')
    .reduce((s, t) => s + Number(t.amount), 0);

  // 1. Savings Rate (25% weight)
  const savingsRate = income > 0 ? ((income - expenses) / income) * 100 : 0;
  const savingsScore = calculateSavingsRateScore(savingsRate);

  // 2. Budget Adherence (25% weight)
  const activeBudgets = data.budgets.filter(b => b.isActive);
  const budgetAdherence = activeBudgets.length > 0
    ? (activeBudgets.filter(b => Number(b.spent) <= Number(b.amount)).length / activeBudgets.length) * 100
    : 0;
  const budgetScore = calculateBudgetAdherenceScore(budgetAdherence);

  // 3. Debt-to-Income Ratio (20% weight)
  const debtAccounts = data.accounts.filter(a =>
    a.type === 'credit_card' || a.type === 'loan' || a.type === 'mortgage'
  );
  const totalDebt = debtAccounts.reduce((s, a) => s + Math.abs(Number(a.balance)), 0);
  const monthlyIncome = income || 1;
  const debtRatio = (totalDebt / monthlyIncome) * 100;
  const debtScore = calculateDebtRatioScore(debtRatio);

  // 4. Emergency Fund (15% weight)
  const liquidAssets = data.accounts
    .filter(a => a.type === 'savings' || a.type === 'checking' || a.type === 'cash')
    .reduce((s, a) => s + Number(a.balance), 0);
  const avgMonthlyExpenses = expenses || 1000;
  const emergencyMonths = liquidAssets / avgMonthlyExpenses;
  const emergencyScore = calculateEmergencyFundScore(emergencyMonths);

  // 5. Spending Consistency (15% weight)
  const consistencyScore = calculateConsistencyScore(currentMonthTx);

  // Calculate weighted overall score
  const overall = Math.round(
    savingsScore * 0.25 +
    budgetScore * 0.25 +
    debtScore * 0.20 +
    emergencyScore * 0.15 +
    consistencyScore * 0.15
  );

  // Generate insights
  const insights = generateInsights({
    savingsRate,
    savingsScore,
    budgetAdherence,
    budgetScore,
    debtRatio,
    debtScore,
    emergencyMonths,
    emergencyScore,
    consistencyScore,
  });

  return {
    overall: Math.min(100, Math.max(0, overall)),
    breakdown: {
      savingsRate: { score: savingsScore, value: savingsRate, target: 20, label: 'Savings Rate' },
      budgetAdherence: { score: budgetScore, value: budgetAdherence, target: 100, label: 'Budget Adherence' },
      debtRatio: { score: debtScore, value: debtRatio, target: 0, label: 'Debt Ratio' },
      emergencyFund: { score: emergencyScore, value: emergencyMonths, target: 6, label: 'Emergency Fund' },
      consistency: { score: consistencyScore, value: consistencyScore, target: 100, label: 'Consistency' },
    },
    insights,
  };
}

/**
 * Score savings rate (0-100)
 */
function calculateSavingsRateScore(rate: number): number {
  if (rate >= 30) return 100;
  if (rate >= 20) return 80 + Math.round((rate - 20) * 2);
  if (rate >= 10) return 60 + Math.round((rate - 10) * 2);
  if (rate >= 5) return 40 + Math.round((rate - 5) * 4);
  return Math.round(rate * 8);
}

/**
 * Score budget adherence (0-100)
 */
function calculateBudgetAdherenceScore(pct: number): number {
  return Math.round(pct);
}

/**
 * Score debt-to-income ratio (0-100, lower is better)
 */
function calculateDebtRatioScore(ratio: number): number {
  if (ratio === 0) return 100;
  if (ratio <= 20) return 90 + Math.round((20 - ratio) * 0.5);
  if (ratio <= 36) return 70 + Math.round((36 - ratio) * 0.55);
  if (ratio <= 50) return 50 + Math.round((50 - ratio) * 1.4);
  return Math.max(0, 50 - Math.round((ratio - 50) * 0.5));
}

/**
 * Score emergency fund (0-100, based on months of expenses covered)
 */
function calculateEmergencyFundScore(months: number): number {
  if (months >= 6) return 100;
  if (months >= 3) return 70 + Math.round((months - 3) * 10);
  if (months >= 1) return 40 + Math.round((months - 1) * 15);
  return Math.round(months * 40);
}

/**
 * Score spending consistency using coefficient of variation
 */
function calculateConsistencyScore(transactions: Transaction[]): number {
  const dailySpending: Record<string, number> = {};

  transactions
    .filter(t => t.type === 'expense')
    .forEach(t => {
      const day = new Date(t.date).getDate().toString();
      dailySpending[day] = (dailySpending[day] || 0) + Number(t.amount);
    });

  const values = Object.values(dailySpending);
  if (values.length < 2) return 80;

  const mean = values.reduce((s, v) => s + v, 0) / values.length;
  if (mean === 0) return 100;

  const variance = values.reduce((s, v) => s + Math.pow(v - mean, 2), 0) / values.length;
  const stdDev = Math.sqrt(variance);
  const cv = (stdDev / mean) * 100; // Coefficient of variation as percentage

  if (cv < 20) return 100;
  if (cv < 40) return 80 + Math.round((40 - cv) * 1);
  if (cv < 60) return 60 + Math.round((60 - cv) * 1);
  return Math.max(0, 60 - Math.round((cv - 60) * 0.5));
}

/**
 * Generate insights based on score breakdown
 */
function generateInsights(data: {
  savingsRate: number;
  savingsScore: number;
  budgetAdherence: number;
  budgetScore: number;
  debtRatio: number;
  debtScore: number;
  emergencyMonths: number;
  emergencyScore: number;
  consistencyScore: number;
}): string[] {
  const insights: string[] = [];

  if (data.savingsRate < 10) {
    insights.push('Your savings rate is below 10%. Try to save at least 20% of your income.');
  } else if (data.savingsRate >= 20) {
    insights.push('Great savings rate! You\'re saving more than 20% of your income.');
  }

  if (data.budgetAdherence < 75) {
    insights.push('Several budgets are over limit. Review your spending and adjust budgets.');
  }

  if (data.debtRatio > 36) {
    insights.push('Your debt-to-income ratio is high. Focus on paying down debt.');
  }

  if (data.emergencyMonths < 3) {
    insights.push(`Your emergency fund covers ${data.emergencyMonths.toFixed(1)} months. Aim for 3-6 months.`);
  } else if (data.emergencyMonths >= 6) {
    insights.push('Excellent emergency fund! You have 6+ months of expenses saved.');
  }

  if (data.consistencyScore < 60) {
    insights.push('Your spending is inconsistent. Try to maintain steady daily spending habits.');
  }

  if (insights.length === 0) {
    insights.push('Your financial health looks good! Keep up the great work.');
  }

  return insights;
}

/**
 * Get a label for the overall score
 */
export function getHealthLabel(score: number): { label: string; color: string } {
  if (score >= 80) return { label: 'Excellent', color: 'text-success' };
  if (score >= 60) return { label: 'Good', color: 'text-success' };
  if (score >= 40) return { label: 'Fair', color: 'text-warning' };
  if (score >= 20) return { label: 'Needs Improvement', color: 'text-warning' };
  return { label: 'Just Starting', color: 'text-error' };
}
