/**
 * FinanceAI Engine
 * Client-side AI for financial queries using pattern matching and data analysis.
 * No external API calls - all calculations are done locally.
 */

import type { Transaction, Budget, Goal, Account } from '@/types';
import { formatCurrency, formatDate } from '@/lib/utils';

export interface AIResponse {
  message: string;
  suggestions?: string[];
  actions?: Array<{
    label: string;
    route?: string;
  }>;
}

interface FinancialData {
  transactions: Transaction[];
  budgets: Budget[];
  goals: Goal[];
  accounts: Account[];
}

export class FinanceAI {
  private data: FinancialData;
  private now: Date;

  constructor(data: FinancialData) {
    this.data = data;
    this.now = new Date();
  }

  /**
   * Main query handler - routes input to appropriate handler
   */
  async query(input: string): Promise<AIResponse> {
    const lower = input.toLowerCase().trim();

    // Greeting patterns
    if (/^(hi|hello|hey|good\s*(morning|afternoon|evening))/.test(lower)) {
      return this.handleGreeting();
    }

    // Help/commands
    if (/^(help|what\s*can\s*you\s*do|commands)/.test(lower)) {
      return this.handleHelp();
    }

    // Spending queries
    if (/how\s*(much|many).*(spend|spent|spending|cost)/.test(lower) ||
        /spending\s*on/.test(lower) ||
        /spent\s*on/.test(lower)) {
      return this.handleSpendingQuery(lower);
    }

    // Budget queries
    if (/budget|over\s*budget|under\s*budget|budget\s*status/.test(lower)) {
      return this.handleBudgetQuery(lower);
    }

    // Goal queries
    if (/goal|saving\s*goal|progress|how.*(saving|saved)/.test(lower)) {
      return this.handleGoalQuery(lower);
    }

    // Comparison queries
    if (/compare|versus|vs|last\s*month|previous\s*month|trend/.test(lower)) {
      return this.handleComparisonQuery(lower);
    }

    // Income queries
    if (/income|earn|salary|earned/.test(lower)) {
      return this.handleIncomeQuery(lower);
    }

    // Savings queries
    if (/savings?\s*rate|save|saving\s*rate/.test(lower)) {
      return this.handleSavingsQuery(lower);
    }

    // Net worth queries
    if (/net\s*worth|total\s*balance|worth/.test(lower)) {
      return this.handleNetWorthQuery(lower);
    }

    // Tip/advice queries
    if (/tip|advice|suggest|recommend|improve|should\s*i/.test(lower)) {
      return this.generateTip();
    }

    // Default response
    return {
      message: `I'm not sure I understand "${input}". Try asking about:\n` +
        `• Spending on a category ("How much on coffee?")\n` +
        `• Budget status ("Am I over budget?")\n` +
        `• Goal progress ("How's my savings goal?")\n` +
        `• Comparisons ("Compare this month to last")\n` +
        `• Tips ("Give me financial advice")`,
      suggestions: [
        'How much did I spend this month?',
        'Am I over budget?',
        'How are my goals?',
        'Give me a tip',
      ],
    };
  }

  /**
   * Handle greeting messages
   */
  private handleGreeting(): AIResponse {
    const hour = this.now.getHours();
    let greeting = 'Good morning';
    if (hour >= 12 && hour < 17) greeting = 'Good afternoon';
    else if (hour >= 17) greeting = 'Good evening';

    const totalSpent = this.getCurrentMonthExpenses();
    const totalIncome = this.getCurrentMonthIncome();

    return {
      message: `${greeting}! 👋 I'm your FinanceFlow assistant. ` +
        `This month you've spent ${formatCurrency(totalSpent)} and earned ${formatCurrency(totalIncome)}. ` +
        `How can I help you today?`,
      suggestions: [
        'How much did I spend on coffee?',
        'Am I over budget?',
        'How are my goals?',
        'Give me a tip',
      ],
    };
  }

  /**
   * Handle help/commands query
   */
  private handleHelp(): AIResponse {
    return {
      message: `I can help you with:\n\n` +
        `💰 **Spending**: "How much did I spend on [category]?"\n` +
        `📊 **Budgets**: "Am I over budget?" or "Budget status"\n` +
        `🎯 **Goals**: "How's my savings goal?"\n` +
        `📈 **Comparisons**: "Compare this month to last month"\n` +
        `💡 **Tips**: "Give me financial advice"\n` +
        `💵 **Income**: "How much did I earn this month?"\n` +
        `💎 **Net Worth**: "What's my net worth?"`,
      suggestions: [
        'How much did I spend this month?',
        'Show my budget status',
        'How are my goals?',
        'Give me financial advice',
      ],
    };
  }

  /**
   * Handle spending queries
   */
  private handleSpendingQuery(input: string): AIResponse {
    const currentMonth = this.getCurrentMonthTransactions();
    const expenses = currentMonth.filter(t => t.type === 'expense');

    // Check for specific category/merchant mentions
    const categoryKeywords: Record<string, string[]> = {
      'coffee': ['coffee', 'starbucks', 'cafe', 'café', 'latte', 'espresso', 'cappuccino'],
      'groceries': ['grocery', 'groceries', 'supermarket', 'whole foods', 'trader joes', 'food'],
      'dining': ['restaurant', 'dining', 'food', 'pizza', 'burger', 'sushi', 'takeout', 'takeout'],
      'transport': ['gas', 'fuel', 'uber', 'lyft', 'taxi', 'transport', 'parking', 'toll'],
      'shopping': ['amazon', 'shopping', 'store', 'mall', 'clothes', 'clothing'],
      'entertainment': ['netflix', 'spotify', 'movie', 'cinema', 'game', 'entertainment', 'subscription'],
      'utilities': ['electric', 'water', 'internet', 'phone', 'utility', 'bill'],
      'health': ['pharmacy', 'doctor', 'hospital', 'health', 'medical', 'gym', 'fitness'],
    };

    let matchedCategory: string | null = null;
    let matchedKeywords: string[] = [];

    for (const [category, keywords] of Object.entries(categoryKeywords)) {
      if (keywords.some(kw => input.includes(kw))) {
        matchedCategory = category;
        matchedKeywords = keywords;
        break;
      }
    }

    // Also check against actual category names
    if (!matchedCategory) {
      for (const cat of this.data.transactions) {
        // This would need category data - simplified approach
      }
    }

    if (matchedCategory) {
      const categoryExpenses = expenses.filter(t =>
        matchedKeywords.some(kw =>
          (t.description || '').toLowerCase().includes(kw) ||
          (t.merchantName || '').toLowerCase().includes(kw) ||
          (t.note || '').toLowerCase().includes(kw)
        )
      );

      const total = categoryExpenses.reduce((sum, t) => sum + Number(t.amount), 0);
      const count = categoryExpenses.length;
      const avg = count > 0 ? total / count : 0;
      const yearlyProjection = total * 12;

      return {
        message: `You've spent **${formatCurrency(total)}** on ${matchedCategory} this month ` +
          `across ${count} transaction${count !== 1 ? 's' : ''}. ` +
          (count > 0 ? `That's an average of ${formatCurrency(avg)} per visit. ` : '') +
          `At this rate, you'll spend approximately **${formatCurrency(yearlyProjection)}** on ${matchedCategory} this year!`,
        suggestions: [
          `Set a budget for ${matchedCategory}`,
          'Show my spending trends',
          'Give me tips to reduce spending',
        ],
        actions: [
          { label: 'View Transactions', route: '/transactions' },
          { label: 'Set Budget', route: '/budgets' },
        ],
      };
    }

    // General spending query
    const total = expenses.reduce((sum, t) => sum + Number(t.amount), 0);
    const daysInMonth = new Date(this.now.getFullYear(), this.now.getMonth() + 1, 0).getDate();
    const dayOfMonth = this.now.getDate();
    const dailyAvg = dayOfMonth > 0 ? total / dayOfMonth : 0;
    const projectedMonthEnd = dailyAvg * daysInMonth;

    return {
      message: `You've spent **${formatCurrency(total)}** this month so far ` +
        `(${dayOfMonth} days in). That's an average of **${formatCurrency(dailyAvg)}/day**. ` +
        `At this pace, you'll spend approximately **${formatCurrency(projectedMonthEnd)}** by month end.`,
      suggestions: [
        'How does this compare to last month?',
        'What\'s my biggest expense category?',
        'Give me spending tips',
      ],
    };
  }

  /**
   * Handle budget queries
   */
  private handleBudgetQuery(_input: string): AIResponse {
    const activeBudgets = this.data.budgets.filter(b => b.isActive);

    if (activeBudgets.length === 0) {
      return {
        message: `You don't have any active budgets yet. Setting up budgets helps you track spending and reach your financial goals!`,
        suggestions: ['Create my first budget', 'Show me how budgets work'],
        actions: [{ label: 'Create Budget', route: '/add-budget' }],
      };
    }

    const overBudget = activeBudgets.filter(b => Number(b.spent) > Number(b.amount));
    const nearLimit = activeBudgets.filter(b => {
      const pct = Number(b.amount) > 0 ? (Number(b.spent) / Number(b.amount)) * 100 : 0;
      return pct >= 75 && pct <= 100;
    });
    const onTrack = activeBudgets.filter(b => {
      const pct = Number(b.amount) > 0 ? (Number(b.spent) / Number(b.amount)) * 100 : 0;
      return pct < 75;
    });

    if (overBudget.length === 0 && nearLimit.length === 0) {
      return {
        message: `🎉 Great news! All ${activeBudgets.length} of your budgets are on track. ` +
          `Keep up the good work!`,
        suggestions: ['Show budget details', 'Set up more budgets'],
        actions: [{ label: 'View Budgets', route: '/budgets' }],
      };
    }

    let message = '';
    if (overBudget.length > 0) {
      message += `⚠️ You're **over budget** in ${overBudget.length} categor${overBudget.length > 1 ? 'ies' : 'y'}:\n`;
      overBudget.forEach(b => {
        const over = Number(b.spent) - Number(b.amount);
        message += `• ${b.name}: ${formatCurrency(over)} over\n`;
      });
    }

    if (nearLimit.length > 0) {
      message += `\n📊 You're **approaching limits** in ${nearLimit.length} categor${nearLimit.length > 1 ? 'ies' : 'y'}:\n`;
      nearLimit.forEach(b => {
        const pct = Math.round((Number(b.spent) / Number(b.amount)) * 100);
        message += `• ${b.name}: ${pct}% used\n`;
      });
    }

    const totalOverage = overBudget.reduce((sum, b) => sum + (Number(b.spent) - Number(b.amount)), 0);
    if (totalOverage > 0) {
      message += `\nTotal overage: **${formatCurrency(totalOverage)}**`;
    }

    return {
      message,
      suggestions: [
        'Adjust my budgets',
        'Show spending details',
        'Give me tips to stay on budget',
      ],
      actions: [{ label: 'Manage Budgets', route: '/budgets' }],
    };
  }

  /**
   * Handle goal queries
   */
  private handleGoalQuery(_input: string): AIResponse {
    const activeGoals = this.data.goals.filter(g => g.status === 'active');

    if (activeGoals.length === 0) {
      return {
        message: `You don't have any active goals yet. Setting financial goals helps you save for what matters most!`,
        suggestions: ['Create a savings goal', 'Set up an emergency fund'],
        actions: [{ label: 'Create Goal', route: '/add-goal' }],
      };
    }

    let message = `You have **${activeGoals.length} active goal${activeGoals.length > 1 ? 's' : ''}**:\n\n`;

    activeGoals.forEach(goal => {
      const progress = Number(goal.targetAmount) > 0
        ? Math.round((Number(goal.currentAmount) / Number(goal.targetAmount)) * 100)
        : 0;
      const remaining = Number(goal.targetAmount) - Number(goal.currentAmount);
      message += `${goal.icon || '🎯'} **${goal.name}**: ${progress}% complete ` +
        `(${formatCurrency(Number(goal.currentAmount))} / ${formatCurrency(Number(goal.targetAmount))})\n`;
      if (remaining > 0) {
        message += `   ${formatCurrency(remaining)} remaining`;
        if (goal.monthlyContribution && Number(goal.monthlyContribution) > 0) {
          const monthsLeft = Math.ceil(remaining / Number(goal.monthlyContribution));
          message += ` • ~${monthsLeft} months at current pace`;
        }
        message += '\n';
      } else {
        message += `   ✅ Goal reached!\n`;
      }
    });

    return {
      message,
      suggestions: [
        'Add money to a goal',
        'Create a new goal',
        'Show goal projections',
      ],
      actions: [{ label: 'View Goals', route: '/goals' }],
    };
  }

  /**
   * Handle comparison queries
   */
  private handleComparisonQuery(_input: string): AIResponse {
    const currentMonth = this.getCurrentMonthTransactions();
    const lastMonth = this.getLastMonthTransactions();

    const currentExpenses = currentMonth.filter(t => t.type === 'expense').reduce((s, t) => s + Number(t.amount), 0);
    const lastExpenses = lastMonth.filter(t => t.type === 'expense').reduce((s, t) => s + Number(t.amount), 0);
    const currentIncome = currentMonth.filter(t => t.type === 'income').reduce((s, t) => s + Number(t.amount), 0);
    const lastIncome = lastMonth.filter(t => t.type === 'income').reduce((s, t) => s + Number(t.amount), 0);

    const expenseChange = lastExpenses > 0 ? ((currentExpenses - lastExpenses) / lastExpenses) * 100 : 0;
    const incomeChange = lastIncome > 0 ? ((currentIncome - lastIncome) / lastIncome) * 100 : 0;

    const expenseDirection = expenseChange > 0 ? '↑' : expenseChange < 0 ? '↓' : '→';
    const incomeDirection = incomeChange > 0 ? '↑' : incomeChange < 0 ? '↓' : '→';

    let message = `📊 **Month-over-Month Comparison**\n\n`;
    message += `**Expenses**: ${formatCurrency(currentExpenses)} this month vs ${formatCurrency(lastExpenses)} last month ` +
      `(${expenseDirection} ${Math.abs(expenseChange).toFixed(1)}%)\n`;
    message += `**Income**: ${formatCurrency(currentIncome)} this month vs ${formatCurrency(lastIncome)} last month ` +
      `(${incomeDirection} ${Math.abs(incomeChange).toFixed(1)}%)\n`;

    if (expenseChange > 20) {
      message += `\n⚠️ Your spending increased by ${expenseChange.toFixed(1)}% compared to last month.`;
    } else if (expenseChange < -10) {
      message += `\n🎉 Great job! You reduced spending by ${Math.abs(expenseChange).toFixed(1)}% compared to last month.`;
    }

    return {
      message,
      suggestions: [
        'Show spending by category',
        'Give me tips to reduce spending',
        'Compare to 3 months ago',
      ],
    };
  }

  /**
   * Handle income queries
   */
  private handleIncomeQuery(_input: string): AIResponse {
    const currentMonth = this.getCurrentMonthTransactions();
    const incomeTransactions = currentMonth.filter(t => t.type === 'income');
    const totalIncome = incomeTransactions.reduce((s, t) => s + Number(t.amount), 0);

    if (incomeTransactions.length === 0) {
      return {
        message: `No income recorded this month yet. Add your income transactions to get a complete financial picture.`,
        suggestions: ['Add income transaction', 'Show last month\'s income'],
        actions: [{ label: 'Add Transaction', route: '/add' }],
      };
    }

    let message = `💰 **Income This Month**: ${formatCurrency(totalIncome)}\n\n`;
    message += `From ${incomeTransactions.length} source${incomeTransactions.length > 1 ? 's' : ''}:\n`;

    // Group by description/merchant
    const bySource: Record<string, number> = {};
    incomeTransactions.forEach(t => {
      const source = t.description || t.merchantName || 'Other';
      bySource[source] = (bySource[source] || 0) + Number(t.amount);
    });

    Object.entries(bySource)
      .sort(([, a], [, b]) => b - a)
      .forEach(([source, amount]) => {
        message += `• ${source}: ${formatCurrency(amount)}\n`;
      });

    return {
      message,
      suggestions: ['Add more income', 'Show expense breakdown', 'Calculate savings rate'],
    };
  }

  /**
   * Handle savings rate queries
   */
  private handleSavingsQuery(_input: string): AIResponse {
    const currentMonth = this.getCurrentMonthTransactions();
    const income = currentMonth.filter(t => t.type === 'income').reduce((s, t) => s + Number(t.amount), 0);
    const expenses = currentMonth.filter(t => t.type === 'expense').reduce((s, t) => s + Number(t.amount), 0);
    const savings = income - expenses;
    const rate = income > 0 ? (savings / income) * 100 : 0;

    let message = `💵 **Savings Rate**: ${rate.toFixed(1)}%\n\n`;
    message += `Income: ${formatCurrency(income)}\n`;
    message += `Expenses: ${formatCurrency(expenses)}\n`;
    message += `Saved: ${formatCurrency(savings)}\n\n`;

    if (rate >= 20) {
      message += `🎉 Excellent! You're saving more than 20% of your income.`;
    } else if (rate >= 10) {
      message += `👍 Good start! Try to increase your savings rate to 20% or more.`;
    } else {
      message += `⚠️ Your savings rate is below 10%. Consider reducing expenses to save more.`;
    }

    return {
      message,
      suggestions: ['Show expense breakdown', 'Give me saving tips', 'Set a savings goal'],
      actions: [{ label: 'Create Savings Goal', route: '/add-goal' }],
    };
  }

  /**
   * Handle net worth queries
   */
  private handleNetWorthQuery(_input: string): AIResponse {
    const totalBalance = this.data.accounts.reduce((sum, a) => sum + Number(a.balance), 0);
    const activeAccounts = this.data.accounts.filter(a => a.isActive);

    let message = `💎 **Net Worth**: ${formatCurrency(totalBalance)}\n\n`;
    message += `Across ${activeAccounts.length} account${activeAccounts.length > 1 ? 's' : ''}:\n`;

    activeAccounts.forEach(account => {
      message += `• ${account.name}: ${formatCurrency(Number(account.balance))}\n`;
    });

    return {
      message,
      suggestions: ['Add a new account', 'View account details', 'Track net worth over time'],
      actions: [{ label: 'Manage Accounts', route: '/accounts' }],
    };
  }

  /**
   * Generate financial tip based on data analysis
   */
  private generateTip(): AIResponse {
    const insights = this.analyzeFinancialHealth();

    if (insights.length === 0) {
      return {
        message: `💡 **Financial Tip**: Keep tracking your expenses regularly. Consistent tracking is the #1 predictor of financial success!`,
        suggestions: ['Analyze my spending', 'Set up budgets', 'Create savings goals'],
      };
    }

    const tip = insights[Math.floor(Math.random() * insights.length)];

    return {
      message: `💡 **Financial Insight**:\n\n${tip}`,
      suggestions: [
        'Give me another tip',
        'Show my financial health',
        'Help me improve',
      ],
    };
  }

  /**
   * Analyze financial health and return insights
   */
  private analyzeFinancialHealth(): string[] {
    const insights: string[] = [];
    const currentMonth = this.getCurrentMonthTransactions();

    const income = currentMonth.filter(t => t.type === 'income').reduce((s, t) => s + Number(t.amount), 0);
    const expenses = currentMonth.filter(t => t.type === 'expense').reduce((s, t) => s + Number(t.amount), 0);
    const savingsRate = income > 0 ? ((income - expenses) / income) * 100 : 0;

    // Savings rate insight
    if (income > 0 && savingsRate < 10) {
      insights.push(`Your savings rate is ${savingsRate.toFixed(1)}%. Financial experts recommend saving at least 20% of income. Try reducing discretionary spending.`);
    }

    // Budget insight
    const overBudget = this.data.budgets.filter(b => b.isActive && Number(b.spent) > Number(b.amount));
    if (overBudget.length > 0) {
      insights.push(`You're over budget in ${overBudget.length} categor${overBudget.length > 1 ? 'ies' : 'y'}. Review your spending and adjust budgets or reduce expenses.`);
    }

    // Emergency fund insight
    const totalBalance = this.data.accounts.filter(a => a.type === 'savings' || a.type === 'checking').reduce((s, a) => s + Number(a.balance), 0);
    const avgMonthlyExpenses = expenses || 1000;
    const monthsOfExpenses = totalBalance / avgMonthlyExpenses;
    if (monthsOfExpenses < 3) {
      insights.push(`Your emergency fund covers ${monthsOfExpenses.toFixed(1)} months of expenses. Aim for 3-6 months of expenses saved.`);
    }

    // Subscription insight
    const subscriptionExpenses = currentMonth.filter(t =>
      (t.description || '').toLowerCase().includes('subscription') ||
      (t.merchantName || '').toLowerCase().includes('subscription')
    );
    if (subscriptionExpenses.length > 3) {
      const totalSub = subscriptionExpenses.reduce((s, t) => s + Number(t.amount), 0);
      insights.push(`You have ${subscriptionExpenses.length} subscription charges totaling ${formatCurrency(totalSub)} this month. Review if you're using all of them.`);
    }

    // Coffee/dining insight
    const diningExpenses = currentMonth.filter(t =>
      (t.description || '').toLowerCase().includes('coffee') ||
      (t.merchantName || '').toLowerCase().includes('starbucks') ||
      (t.merchantName || '').toLowerCase().includes('cafe')
    );
    if (diningExpenses.length > 10) {
      const totalDining = diningExpenses.reduce((s, t) => s + Number(t.amount), 0);
      insights.push(`You've spent ${formatCurrency(totalDining)} on coffee/dining out across ${diningExpenses.length} visits. Making coffee at home could save you ~${formatCurrency(totalDining * 0.6)} per month.`);
    }

    return insights;
  }

  /**
   * Get transactions for current month
   */
  private getCurrentMonthTransactions(): Transaction[] {
    const start = new Date(this.now.getFullYear(), this.now.getMonth(), 1);
    const end = new Date(this.now.getFullYear(), this.now.getMonth() + 1, 0, 23, 59, 59);
    return this.data.transactions.filter(t => {
      const d = new Date(t.date);
      return d >= start && d <= end;
    });
  }

  /**
   * Get transactions for last month
   */
  private getLastMonthTransactions(): Transaction[] {
    const lastMonth = new Date(this.now);
    lastMonth.setMonth(lastMonth.getMonth() - 1);
    const start = new Date(lastMonth.getFullYear(), lastMonth.getMonth(), 1);
    const end = new Date(lastMonth.getFullYear(), lastMonth.getMonth() + 1, 0, 23, 59, 59);
    return this.data.transactions.filter(t => {
      const d = new Date(t.date);
      return d >= start && d <= end;
    });
  }

  /**
   * Calculate total expenses for current month
   */
  private getCurrentMonthExpenses(): number {
    return this.getCurrentMonthTransactions()
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + Number(t.amount), 0);
  }

  /**
   * Calculate total income for current month
   */
  private getCurrentMonthIncome(): number {
    return this.getCurrentMonthTransactions()
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + Number(t.amount), 0);
  }
}
