import { create } from "zustand";
import type { Transaction, Account, Budget, Goal, Category } from "@/types";

interface AppState {
  isAuthenticated: boolean;
  isPremium: boolean;
  user: {
    id: string;
    email: string;
    name: string;
    avatar?: string;
  } | null;
  
  transactions: Transaction[];
  accounts: Account[];
  budgets: Budget[];
  goals: Goal[];
  categories: Category[];
  
  theme: "dark" | "light";
  currency: string;
  language: string;
  weekStartsOn: "monday" | "sunday";
  budgetPeriod: "weekly" | "monthly" | "yearly";
  
  notifications: {
    push: boolean;
    email: boolean;
    budgetAlerts: boolean;
    billReminders: boolean;
    aiInsights: boolean;
  };
  
  security: {
    twoFactor: boolean;
    biometric: boolean;
  };
  
  setUser: (user: AppState["user"]) => void;
  logout: () => void;
  setTransactions: (transactions: Transaction[]) => void;
  addTransaction: (transaction: Transaction) => void;
  updateTransaction: (id: string, data: Partial<Transaction>) => void;
  deleteTransaction: (id: string) => void;
  
  setAccounts: (accounts: Account[]) => void;
  addAccount: (account: Account) => void;
  updateAccount: (id: string, data: Partial<Account>) => void;
  deleteAccount: (id: string) => void;
  
  setBudgets: (budgets: Budget[]) => void;
  addBudget: (budget: Budget) => void;
  updateBudget: (id: string, data: Partial<Budget>) => void;
  deleteBudget: (id: string) => void;
  
  setGoals: (goals: Goal[]) => void;
  addGoal: (goal: Goal) => void;
  updateGoal: (id: string, data: Partial<Goal>) => void;
  deleteGoal: (id: string) => void;
  
  setCategories: (categories: Category[]) => void;
  setTheme: (theme: "dark" | "light") => void;
  setPremium: (isPremium: boolean) => void;
  setCurrency: (currency: string) => void;
  setLanguage: (language: string) => void;
  setWeekStartsOn: (weekStartsOn: "monday" | "sunday") => void;
  setBudgetPeriod: (period: "weekly" | "monthly" | "yearly") => void;
  setNotifications: (notifications: Partial<AppState["notifications"]>) => void;
  setSecurity: (security: Partial<AppState["security"]>) => void;
}

const getDefaultCategories = (): Category[] => [
  { id: "1", name: "Housing/Rent", icon: "🏠", color: "#6366F1", type: "expense", isSystem: true, sortOrder: 1, isActive: true },
  { id: "2", name: "Groceries", icon: "🛒", color: "#10B981", type: "expense", isSystem: true, sortOrder: 2, isActive: true },
  { id: "3", name: "Dining Out", icon: "🍕", color: "#F59E0B", type: "expense", isSystem: true, sortOrder: 3, isActive: true },
  { id: "4", name: "Transportation", icon: "🚗", color: "#3B82F6", type: "expense", isSystem: true, sortOrder: 4, isActive: true },
  { id: "5", name: "Gas/Fuel", icon: "⛽", color: "#EF4444", type: "expense", isSystem: true, sortOrder: 5, isActive: true },
  { id: "6", name: "Healthcare", icon: "💊", color: "#EC4899", type: "expense", isSystem: true, sortOrder: 6, isActive: true },
  { id: "7", name: "Entertainment", icon: "🎬", color: "#8B5CF6", type: "expense", isSystem: true, sortOrder: 7, isActive: true },
  { id: "8", name: "Clothing", icon: "👔", color: "#14B8A6", type: "expense", isSystem: true, sortOrder: 8, isActive: true },
  { id: "9", name: "Subscriptions", icon: "📱", color: "#F97316", type: "expense", isSystem: true, sortOrder: 9, isActive: true },
  { id: "10", name: "Education", icon: "🎓", color: "#06B6D4", type: "expense", isSystem: true, sortOrder: 10, isActive: true },
  { id: "11", name: "Travel", icon: "✈️", color: "#A855F7", type: "expense", isSystem: true, sortOrder: 11, isActive: true },
  { id: "12", name: "Utilities", icon: "💡", color: "#FBBF24", type: "expense", isSystem: true, sortOrder: 12, isActive: true },
  { id: "13", name: "Salary", icon: "💼", color: "#10B981", type: "income", isSystem: true, sortOrder: 1, isActive: true },
  { id: "14", name: "Freelance", icon: "🖥️", color: "#14B8A6", type: "income", isSystem: true, sortOrder: 2, isActive: true },
  { id: "15", name: "Investments", icon: "📈", color: "#06B6D4", type: "income", isSystem: true, sortOrder: 3, isActive: true },
];

const initialState = {
  isAuthenticated: false,
  isPremium: false,
  user: null,
  transactions: [],
  accounts: [],
  budgets: [],
  goals: [],
  categories: getDefaultCategories(),
  theme: "dark" as const,
  currency: "MVR",
  language: "English",
  weekStartsOn: "monday" as const,
  budgetPeriod: "monthly" as const,
  notifications: {
    push: true,
    email: true,
    budgetAlerts: true,
    billReminders: true,
    aiInsights: true,
  },
  security: {
    twoFactor: false,
    biometric: false,
  },
};

export const useAppStore = create<AppState>((set) => ({
  ...initialState,
  
  setUser: (user) => set({ user }),
  logout: () => set({ isAuthenticated: false, user: null }),
  
  setTransactions: (transactions) => set({ transactions }),
  addTransaction: (transaction) => set((state) => ({ 
    transactions: [transaction, ...state.transactions] 
  })),
  updateTransaction: (id, data) => set((state) => ({
    transactions: state.transactions.map((t) => 
      t.id === id ? { ...t, ...data } : t
    )
  })),
  deleteTransaction: (id) => set((state) => ({
    transactions: state.transactions.filter((t) => t.id !== id)
  })),
  
  setAccounts: (accounts) => set({ accounts }),
  addAccount: (account) => set((state) => ({ 
    accounts: [...state.accounts, account] 
  })),
  updateAccount: (id, data) => set((state) => ({
    accounts: state.accounts.map((a) => 
      a.id === id ? { ...a, ...data } : a
    )
  })),
  deleteAccount: (id) => set((state) => ({
    accounts: state.accounts.filter((a) => a.id !== id)
  })),
  
  setBudgets: (budgets) => set({ budgets }),
  addBudget: (budget) => set((state) => ({ 
    budgets: [...state.budgets, budget] 
  })),
  updateBudget: (id, data) => set((state) => ({
    budgets: state.budgets.map((b) => 
      b.id === id ? { ...b, ...data } : b
    )
  })),
  deleteBudget: (id) => set((state) => ({
    budgets: state.budgets.filter((b) => b.id !== id)
  })),
  
  setGoals: (goals) => set({ goals }),
  addGoal: (goal) => set((state) => ({ 
    goals: [...state.goals, goal] 
  })),
  updateGoal: (id, data) => set((state) => ({
    goals: state.goals.map((g) => 
      g.id === id ? { ...g, ...data } : g
    )
  })),
  deleteGoal: (id) => set((state) => ({
    goals: state.goals.filter((g) => g.id !== id)
  })),
  
  setCategories: (categories) => set({ categories }),
  setTheme: (theme) => set({ theme }),
  setPremium: (isPremium: boolean) => set({ isPremium }),
  setCurrency: (currency) => set({ currency }),
  setLanguage: (language) => set({ language }),
  setWeekStartsOn: (weekStartsOn) => set({ weekStartsOn }),
  setBudgetPeriod: (budgetPeriod) => set({ budgetPeriod }),
  setNotifications: (notifications) => set((state) => ({ 
    notifications: { ...state.notifications, ...notifications } 
  })),
  setSecurity: (security) => set((state) => ({ 
    security: { ...state.security, ...security } 
  })),
}));