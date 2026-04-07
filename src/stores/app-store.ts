import { create } from "zustand";
import type { Transaction, Account, Budget, Goal, Category } from "@/types";
import { recalculateBudgetSpent, recalculateAccountBalances } from "@/lib/data-consistency";

const STORAGE_KEY = "financeflow_state";

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

function loadFromStorage() {
  if (typeof window === "undefined") return null;
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return null;
    const parsed = JSON.parse(saved);
    return {
      user: parsed.user || null,
      isPremium: parsed.isPremium || true, // Temporarily enabled for testing
      transactions: parsed.transactions || [],
      accounts: parsed.accounts || [],
      budgets: parsed.budgets || [],
      goals: parsed.goals || [],
      theme: parsed.theme || "dark",
      currency: parsed.currency || "MVR",
      language: parsed.language || "English",
      weekStartsOn: parsed.weekStartsOn || "monday",
      budgetPeriod: parsed.budgetPeriod || "monthly",
      notifications: parsed.notifications || {
        push: true,
        email: true,
        budgetAlerts: true,
        billReminders: true,
        aiInsights: true,
      },
      security: parsed.security || {
        twoFactor: false,
        biometric: false,
      },
    };
  } catch {
    return null;
  }
}

function saveToStorage(state: Partial<AppState>) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      user: state.user,
      isPremium: state.isPremium,
      transactions: state.transactions,
      accounts: state.accounts,
      budgets: state.budgets,
      goals: state.goals,
      theme: state.theme,
      currency: state.currency,
      language: state.language,
      weekStartsOn: state.weekStartsOn,
      budgetPeriod: state.budgetPeriod,
      notifications: state.notifications,
      security: state.security,
    }));
  } catch {
    // Storage full or unavailable
  }
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

const savedState = loadFromStorage();

const initialState = {
  isAuthenticated: !!savedState?.user,
  isPremium: savedState?.isPremium || true, // Temporarily enabled for testing
  user: savedState?.user || null,
  transactions: savedState?.transactions || [],
  accounts: savedState?.accounts || [],
  budgets: savedState?.budgets || [],
  goals: savedState?.goals || [],
  categories: getDefaultCategories(),
  theme: (savedState?.theme || "dark") as "dark" | "light",
  currency: savedState?.currency || "MVR",
  language: savedState?.language || "English",
  weekStartsOn: (savedState?.weekStartsOn || "monday") as "monday" | "sunday",
  budgetPeriod: (savedState?.budgetPeriod || "monthly") as "weekly" | "monthly" | "yearly",
  notifications: savedState?.notifications || {
    push: true,
    email: true,
    budgetAlerts: true,
    billReminders: true,
    aiInsights: true,
  },
  security: savedState?.security || {
    twoFactor: false,
    biometric: false,
  },
};

export const useAppStore = create<AppState>((set, get) => ({
  ...initialState,
  
  setUser: (user) => {
    set({ user, isAuthenticated: !!user });
    saveToStorage(get());
  },
  logout: () => {
    set({ isAuthenticated: false, user: null });
    saveToStorage(get());
  },
  
  setTransactions: (transactions) => {
    set((state) => {
      const updatedBudgets = recalculateBudgetSpent(state.budgets, transactions, state.categories);
      const updatedAccounts = recalculateAccountBalances(state.accounts, transactions);
      return {
        transactions,
        budgets: updatedBudgets,
        accounts: updatedAccounts
      };
    });
    saveToStorage(get());
  },
  addTransaction: (transaction) => {
    set((state) => {
      const newTransactions = [transaction, ...state.transactions];
      const updatedBudgets = recalculateBudgetSpent(state.budgets, newTransactions, state.categories);
      const updatedAccounts = recalculateAccountBalances(state.accounts, newTransactions);
      return {
        transactions: newTransactions,
        budgets: updatedBudgets,
        accounts: updatedAccounts
      };
    });
    saveToStorage(get());
  },
  updateTransaction: (id, data) => {
    set((state) => {
      const updatedTransactions = state.transactions.map((t) =>
        t.id === id ? { ...t, ...data } : t
      );
      const updatedBudgets = recalculateBudgetSpent(state.budgets, updatedTransactions, state.categories);
      const updatedAccounts = recalculateAccountBalances(state.accounts, updatedTransactions);
      return {
        transactions: updatedTransactions,
        budgets: updatedBudgets,
        accounts: updatedAccounts
      };
    });
    saveToStorage(get());
  },
  deleteTransaction: (id) => {
    set((state) => {
      const filteredTransactions = state.transactions.filter((t) => t.id !== id);
      const updatedBudgets = recalculateBudgetSpent(state.budgets, filteredTransactions, state.categories);
      const updatedAccounts = recalculateAccountBalances(state.accounts, filteredTransactions);
      return {
        transactions: filteredTransactions,
        budgets: updatedBudgets,
        accounts: updatedAccounts
      };
    });
    saveToStorage(get());
  },
  
  setAccounts: (accounts) => {
    set({ accounts });
    saveToStorage(get());
  },
  addAccount: (account) => {
    set((state) => ({ accounts: [...state.accounts, account] }));
    saveToStorage(get());
  },
  updateAccount: (id, data) => {
    set((state) => ({
      accounts: state.accounts.map((a) => 
        a.id === id ? { ...a, ...data } : a
      )
    }));
    saveToStorage(get());
  },
  deleteAccount: (id) => {
    set((state) => ({
      accounts: state.accounts.filter((a) => a.id !== id)
    }));
    saveToStorage(get());
  },
  
  setBudgets: (budgets) => {
    set({ budgets });
    saveToStorage(get());
  },
  addBudget: (budget) => {
    set((state) => ({ budgets: [...state.budgets, budget] }));
    saveToStorage(get());
  },
  updateBudget: (id, data) => {
    set((state) => ({
      budgets: state.budgets.map((b) => 
        b.id === id ? { ...b, ...data } : b
      )
    }));
    saveToStorage(get());
  },
  deleteBudget: (id) => {
    set((state) => ({
      budgets: state.budgets.filter((b) => b.id !== id)
    }));
    saveToStorage(get());
  },
  
  setGoals: (goals) => {
    set({ goals });
    saveToStorage(get());
  },
  addGoal: (goal) => {
    set((state) => ({ goals: [...state.goals, goal] }));
    saveToStorage(get());
  },
  updateGoal: (id, data) => {
    set((state) => ({
      goals: state.goals.map((g) => 
        g.id === id ? { ...g, ...data } : g
      )
    }));
    saveToStorage(get());
  },
  deleteGoal: (id) => {
    set((state) => ({
      goals: state.goals.filter((g) => g.id !== id)
    }));
    saveToStorage(get());
  },
  
  setCategories: (categories) => set({ categories }),
  setTheme: (theme) => {
    set({ theme });
    saveToStorage(get());
  },
  setPremium: (isPremium: boolean) => {
    set({ isPremium });
    saveToStorage(get());
  },
  setCurrency: (currency) => {
    set({ currency });
    saveToStorage(get());
  },
  setLanguage: (language) => {
    set({ language });
    saveToStorage(get());
  },
  setWeekStartsOn: (weekStartsOn) => {
    set({ weekStartsOn });
    saveToStorage(get());
  },
  setBudgetPeriod: (budgetPeriod) => {
    set({ budgetPeriod });
    saveToStorage(get());
  },
  setNotifications: (notifications) => {
    set((state) => ({ 
      notifications: { ...state.notifications, ...notifications } 
    }));
    saveToStorage(get());
  },
  setSecurity: (security) => {
    set((state) => ({ 
      security: { ...state.security, ...security } 
    }));
    saveToStorage(get());
  },
}));
