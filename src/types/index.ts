export type TransactionType = "expense" | "income" | "transfer";

export interface Transaction {
  id: string;
  userId: string;
  accountId: string;
  categoryId: string;
  type: TransactionType;
  amount: number;
  currency: string;
  description: string;
  merchantName: string;
  note?: string;
  date: string;
  time?: string;
  latitude?: number;
  longitude?: number;
  receiptUrl?: string;
  isRecurring: boolean;
  recurringId?: string;
  isExcluded: boolean;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: string;
  userId?: string;
  parentId?: string;
  name: string;
  icon: string;
  color: string;
  type: "expense" | "income";
  isSystem: boolean;
  sortOrder: number;
  isActive: boolean;
}

export interface Account {
  id: string;
  userId: string;
  name: string;
  type: AccountType;
  balance: number;
  currency: string;
  institution?: string;
  color: string;
  icon: string;
  isActive: boolean;
  plaidAccountId?: string;
  createdAt: string;
  updatedAt: string;
}

export type AccountType = 
  | "checking" 
  | "savings" 
  | "credit_card" 
  | "cash" 
  | "investment" 
  | "loan" 
  | "mortgage" 
  | "crypto"
  | "other";

export interface Budget {
  id: string;
  userId: string;
  categoryId: string;
  name: string;
  amount: number;
  period: BudgetPeriod;
  startDate: string;
  endDate?: string;
  rollover: boolean;
  alertThreshold: number;
  isActive: boolean;
  createdAt: string;
  spent: number;
  remaining: number;
}

export type BudgetPeriod = "weekly" | "biweekly" | "monthly" | "quarterly" | "yearly";

export interface Goal {
  id: string;
  userId: string;
  name: string;
  type: GoalType;
  targetAmount: number;
  currentAmount: number;
  targetDate: string;
  icon: string;
  color: string;
  status: GoalStatus;
  monthlyContribution: number;
  createdAt: string;
  completedAt?: string;
}

export type GoalType = "savings" | "debt_payoff" | "emergency_fund" | "purchase" | "investment" | "custom";

export type GoalStatus = "active" | "paused" | "completed" | "abandoned";

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  avatarUrl?: string;
  currency: string;
  locale: string;
  timezone: string;
  createdAt: string;
  isPremium: boolean;
  onboarded: boolean;
}

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  data?: Record<string, unknown>;
  isRead: boolean;
  createdAt: string;
}

export type NotificationType = 
  | "budget_alert" 
  | "bill_reminder" 
  | "goal_milestone" 
  | "anomaly" 
  | "insight" 
  | "system";

export interface DashboardStats {
  totalBalance: number;
  totalIncome: number;
  totalExpenses: number;
  savingsRate: number;
  balanceChange: number;
  incomeChange: number;
  expensesChange: number;
}

export interface SpendingByCategory {
  categoryId: string;
  categoryName: string;
  categoryIcon: string;
  categoryColor: string;
  amount: number;
  percentage: number;
}

export interface TransactionGroup {
  date: string;
  transactions: Transaction[];
  total: number;
}

export interface BudgetWithSpending extends Budget {
  spent: number;
  percentage: number;
  isOverBudget: boolean;
  dailyAverage: number;
  projectedTotal: number;
}

export interface AIInsight {
  id: string;
  type: string;
  title: string;
  description: string;
  actionLabel?: string;
  actionUrl?: string;
  dismissible: boolean;
  createdAt: string;
}

export interface FinancialHealthScore {
  overall: number;
  savingsScore: number;
  budgetScore: number;
  debtScore: number;
  emergencyScore: number;
  consistencyScore: number;
}