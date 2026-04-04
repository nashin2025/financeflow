"use client";

import * as React from "react";
import { Sidebar } from "@/components/layout/sidebar";
import { BottomNav } from "@/components/layout/bottom-nav";
import { Header } from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ProgressRing } from "@/components/ui/progress";
import { useAppStore } from "@/stores/app-store";
import { formatCurrency, cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { 
  Send, 
  Sparkles, 
  TrendingDown, 
  TrendingUp,
  Lightbulb,
  Target,
  AlertTriangle,
  MessageCircle,
  Zap,
  ChevronRight
} from "lucide-react";

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

export default function AIPage() {
  const router = useRouter();
  const { transactions, categories, budgets, goals, accounts } = useAppStore();
  const [messages, setMessages] = React.useState<ChatMessage[]>([
    {
      id: "1",
      role: "assistant",
      content: "Hi! I'm your AI financial assistant. Ask me about your spending, budgets, goals, or any financial question. How can I help you today?",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = React.useState("");
  const [isTyping, setIsTyping] = React.useState(false);
  const messagesEndRef = React.useRef<HTMLDivElement>(null);

  const now = new Date();
  const currentMonthNum = now.getMonth();
  const currentYear = now.getFullYear();

  const currentMonthTransactions = transactions.filter(t => {
    const d = new Date(t.date);
    return d.getMonth() === currentMonthNum && d.getFullYear() === currentYear;
  });

  const currentMonthIncome = currentMonthTransactions.filter(t => t.type === "income").reduce((s, t) => s + t.amount, 0);
  const currentMonthExpenses = currentMonthTransactions.filter(t => t.type === "expense").reduce((s, t) => s + t.amount, 0);
  const totalBalance = accounts.reduce((sum, a) => sum + a.balance, 0);
  const hasTransactions = transactions.length > 0;

  const savings = currentMonthIncome > 0 ? Math.min(((currentMonthIncome - currentMonthExpenses) / currentMonthIncome) * 100, 100) : 0;
  const budgetScoreCalc = budgets.length > 0
    ? Math.min(budgets.reduce((s, b) => s + Math.max(0, 100 - (b.spent / b.amount) * 100), 0) / budgets.length, 100)
    : 0;
  const creditAccounts = accounts.filter(a => a.type === "credit_card" || a.type === "loan" || a.type === "mortgage");
  const debtScoreCalc = creditAccounts.length > 0
    ? Math.max(0, 100 - (creditAccounts.reduce((s, a) => s + Number(a.balance), 0) / (totalBalance || 1)) * 100)
    : 0;
  const emergencyScoreCalc = totalBalance > 0 ? Math.min((totalBalance / (currentMonthExpenses || 1)) * (100 / 3), 100) : 0;
  const consistencyScoreCalc = hasTransactions ? Math.min((transactions.length / 20) * 100, 100) : 0;

  const healthScore = Math.round((savings + budgetScoreCalc + debtScoreCalc + emergencyScoreCalc + consistencyScoreCalc) / 5);
  const savingsScore = Math.round(savings);
  const budgetScore = Math.round(budgetScoreCalc);
  const debtScore = Math.round(debtScoreCalc);
  const emergencyScore = Math.round(emergencyScoreCalc);
  const consistencyScore = Math.round(consistencyScoreCalc);

  const totalExpenses = transactions
    .filter(t => t.type === "expense")
    .reduce((sum, t) => sum + t.amount, 0);

  const totalIncome = transactions
    .filter(t => t.type === "income")
    .reduce((sum, t) => sum + t.amount, 0);

  const spendingByCategory = React.useMemo(() => {
    const grouped: Record<string, number> = {};
    transactions.filter(t => t.type === "expense").forEach(t => {
      grouped[t.categoryId] = (grouped[t.categoryId] || 0) + t.amount;
    });
    return Object.entries(grouped)
      .map(([categoryId, amount]) => {
        const category = categories.find(c => c.id === categoryId);
        return { name: category?.name || "Other", amount };
      })
      .sort((a, b) => b.amount - a.amount);
  }, [transactions, categories]);

  const coffeeExpenses = transactions
    .filter(t => t.merchantName.toLowerCase().includes("starbucks") || t.tags.includes("coffee"))
    .reduce((sum, t) => sum + t.amount, 0);

  const biggestCategory = spendingByCategory[0];

  const getAIResponse = (question: string): string => {
    const q = question.toLowerCase();

    if (q.includes("coffee") || q.includes("starbucks")) {
      const count = transactions.filter(t => 
        t.merchantName.toLowerCase().includes("starbucks") || t.tags.includes("coffee")
      ).length;
      return `You've spent ${formatCurrency(coffeeExpenses)} on coffee across ${count} transactions this month. That's about ${formatCurrency(coffeeExpenses / Math.max(count, 1))} per visit. Consider reducing this to save more!`;
    }

    if (q.includes("spending") || q.includes("spend")) {
      return `Your total spending this month is ${formatCurrency(totalExpenses)}. Your biggest expense is ${biggestCategory?.name || "N/A"} at ${formatCurrency(biggestCategory?.amount || 0)}. Income: ${formatCurrency(totalIncome)}. You're ${totalIncome > totalExpenses ? "saving" : "spending more than you earn"} this month.`;
    }

    if (q.includes("income")) {
      return `Your total income this month is ${formatCurrency(totalIncome)}. This comes from ${transactions.filter(t => t.type === "income").length} income sources. Your main income is likely your salary.`;
    }

    if (q.includes("budget") || q.includes("budgets")) {
      const overBudget = budgets.filter(b => b.spent > b.amount);
      const underBudget = budgets.filter(b => b.spent <= b.amount);
      return `You have ${budgets.length} budgets. ${underBudget.length} are on track, ${overBudget.length > 0 ? `${overBudget.length} are over budget` : "none are over budget"}. ${overBudget.length > 0 ? `Over budget: ${overBudget.map(b => b.name).join(", ")}` : ""}`;
    }

    if (q.includes("goal") || q.includes("goals")) {
      const activeGoals = goals.filter(g => g.status === "active");
      const progress = activeGoals.map(g => `${g.name}: ${Math.round((g.currentAmount / g.targetAmount) * 100)}%`).join(" | ");
      return `You have ${activeGoals.length} active goals. ${progress || "No active goals"}. ${activeGoals[0] ? `${activeGoals[0].name} needs ${formatCurrency(activeGoals[0].targetAmount - activeGoals[0].currentAmount)} more to reach target.` : ""}`;
    }

    if (q.includes("savings") || q.includes("save")) {
      const savings = totalIncome - totalExpenses;
      const savingsRate = ((savings / totalIncome) * 100).toFixed(1);
      return `Your savings this month: ${formatCurrency(savings)} (${savingsRate}% of income). ${savings > 0 ? "Great job saving!" : "Consider reducing expenses to save more."}`;
    }

    if (q.includes("expense") || q.includes("expensive") || q.includes("biggest") || q.includes("top")) {
      return `Your top expenses this month: ${spendingByCategory.slice(0, 3).map((c, i) => `${i + 1}. ${c.name}: ${formatCurrency(c.amount)}`).join(", ")}. Housing is typically your largest expense.`;
    }

    if (q.includes("net worth") || q.includes("balance")) {
      const netWorth = accounts.reduce((sum, a) => sum + a.balance, 0);
      return `Your total net worth is ${formatCurrency(netWorth)}. This includes all accounts: Checking, Savings, and Credit Cards.`;
    }

    if (q.includes("compare") || q.includes("vs") || q.includes("versus") || q.includes("last month") || q.includes("previous")) {
      return `Comparing this month to last: Spending is ${totalExpenses > 3000 ? "higher" : "lower"} than average. Your biggest change is in ${spendingByCategory[0]?.name || "expenses"}. Keep tracking to see trends!`;
    }

    if (q.includes("track") || q.includes("on track")) {
      return `You're on track with ${budgets.filter(b => b.spent <= b.amount).length} of ${budgets.length} budgets. Goals are ${goals.filter(g => g.status === "active" && (g.currentAmount / g.targetAmount) > 0.5).length} of ${goals.filter(g => g.status === "active").length} progressing well.`;
    }

    if (q.includes("hello") || q.includes("hi") || q.includes("hey") || q.includes("good morning") || q.includes("good afternoon")) {
      return "Hello! I'm here to help you with your finances. Ask me anything about spending, budgets, goals, or savings!";
    }

    if (q.includes("thank")) {
      return "You're welcome! Happy to help with your financial questions. Let me know if you need anything else!";
    }

    if (q.includes("help") || q.includes("what can you do")) {
      return "I can help you with: spending analysis, budget tracking, goal progress, savings calculations, expense breakdown, income summary, and financial insights. Just ask!";
    }

    return `I understand you're asking about "${question}". Based on your data: Total spending ${formatCurrency(totalExpenses)}, Income ${formatCurrency(totalIncome)}, ${budgets.length} active budgets, ${goals.filter(g => g.status === "active").length} goals in progress. Ask me more specific questions for detailed insights!`;
  };

  const handleSend = () => {
    if (!input.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: "user",
      content: input,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsTyping(true);

    setTimeout(() => {
      const response = getAIResponse(input);
      
      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: response,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, assistantMessage]);
      setIsTyping(false);
    }, 1500);
  };

  React.useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const insights = [
    {
      type: "warning",
      title: "Dining spending increased",
      description: "Your dining out expenses are 23% higher than last month.",
      icon: TrendingUp,
    },
    {
      type: "success",
      title: "Groceries under budget",
      description: `You've spent ${formatCurrency(spendingByCategory.find(c => c.name === "Groceries")?.amount || 0)} on groceries - under budget!`,
      icon: TrendingDown,
    },
    {
      type: "tip",
      title: "Subscription reminder",
      description: `You have ${budgets.filter(b => b.name.toLowerCase().includes("subscription")).length} subscription budgets totaling Rf 45/month.`,
      icon: Lightbulb,
    },
  ];

  const quickQuestions = [
    "How much did I spend on coffee?",
    "What's my biggest expense?",
    "Am I on track with budgets?",
    "How much have I saved?",
  ];

  return (
    <div className="min-h-screen">
      <div className="hidden lg:block">
        <Sidebar />
      </div>

      <div className="lg:pl-[240px]">
        <Header title="AI Assistant" showSearch={false} showNotifications />
        
        <main className="p-4 lg:p-6 pb-20 lg:pb-6 space-y-6">
          {/* Financial Health Score */}
          {hasTransactions && (
          <Card variant="glass" className="bg-gradient-to-r from-primary-start/10 to-primary-end/10 border-primary-start/20">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row md:items-center gap-6">
                <div className="flex-shrink-0">
                  <ProgressRing value={healthScore} size={100} strokeWidth={8}>
                    <div className="text-center">
                      <span className="text-2xl font-bold text-foreground">{healthScore}</span>
                      <span className="text-xs text-foreground-tertiary">/100</span>
                    </div>
                  </ProgressRing>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-3">
                    <Sparkles className="h-5 w-5 text-primary-start" />
                    <h2 className="text-xl font-semibold text-foreground">Financial Health Score</h2>
                  </div>
                  <p className="text-foreground-secondary mb-4">
                    Your overall financial health is <span className={healthScore >= 60 ? 'text-success font-medium' : 'text-warning font-medium'}>{healthScore >= 80 ? 'Excellent' : healthScore >= 60 ? 'Good' : healthScore >= 40 ? 'Fair' : healthScore >= 20 ? 'Needs Improvement' : 'Just Starting'}</span>. {healthScore >= 60 ? 'Keep making smart decisions!' : 'Start building better habits today.'}
                  </p>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    {[
                      { label: "Savings", score: savingsScore },
                      { label: "Budget", score: budgetScore },
                      { label: "Debt", score: debtScore },
                      { label: "Emergency", score: emergencyScore },
                      { label: "Consistency", score: consistencyScore },
                    ].map((item) => (
                      <div key={item.label} className="text-center">
                        <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden mb-1">
                          <div 
                            className={cn(
                              "h-full rounded-full",
                              item.score >= 70 ? "bg-success" : item.score >= 50 ? "bg-warning" : "bg-error"
                            )}
                            style={{ width: `${item.score}%` }}
                          />
                        </div>
                        <span className="text-xs text-foreground-tertiary">{item.label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          )}

          <div className="grid lg:grid-cols-3 gap-6">
            {/* Chat Interface */}
            <div className="lg:col-span-2 space-y-4">
              <Card variant="glass" className="h-[500px] flex flex-col">
                <CardHeader className="flex-shrink-0">
                  <CardTitle className="text-lg font-semibold flex items-center gap-2">
                    <MessageCircle className="h-5 w-5 text-primary-start" />
                    Ask about your finances
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex-1 overflow-y-auto space-y-4 pb-4">
                  {messages.map((message) => (
                    <div 
                      key={message.id}
                      className={cn(
                        "flex",
                        message.role === "user" ? "justify-end" : "justify-start"
                      )}
                    >
                      <div className={cn(
                        "max-w-[80%] p-4 rounded-2xl",
                        message.role === "user" 
                          ? "gradient-primary text-white" 
                          : "bg-white/10 text-foreground"
                      )}>
                        <p className="text-sm">{message.content}</p>
                      </div>
                    </div>
                  ))}
                  {isTyping && (
                    <div className="flex justify-start">
                      <div className="bg-white/10 p-4 rounded-2xl">
                        <div className="flex gap-1">
                          <span className="w-2 h-2 bg-foreground-tertiary rounded-full animate-bounce" />
                          <span className="w-2 h-2 bg-foreground-tertiary rounded-full animate-bounce" style={{ animationDelay: "0.1s" }} />
                          <span className="w-2 h-2 bg-foreground-tertiary rounded-full animate-bounce" style={{ animationDelay: "0.2s" }} />
                        </div>
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </CardContent>
                <div className="flex-shrink-0 p-4 border-t border-white/5">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleSend()}
                      placeholder="Ask about your finances..."
                      className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-foreground placeholder:text-foreground-tertiary focus:outline-none focus:border-primary-start"
                    />
                    <Button onClick={handleSend} disabled={!input.trim() || isTyping}>
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </Card>

              {/* Quick Questions */}
              <div className="flex flex-wrap gap-2">
                {quickQuestions.map((question) => (
                  <button
                    key={question}
                    onClick={() => {
                      setInput(question);
                    }}
                    className="px-4 py-2 rounded-xl bg-white/5 text-sm text-foreground-secondary hover:bg-white/10 transition-colors"
                  >
                    {question}
                  </button>
                ))}
              </div>
            </div>

            {/* Insights Panel */}
            <div className="space-y-4">
              <Card variant="glass">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold flex items-center gap-2">
                    <Zap className="h-5 w-5 text-warning" />
                    AI Insights
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {insights.map((insight, i) => (
                    <div 
                      key={i}
                      className={cn(
                        "p-4 rounded-xl",
                        insight.type === "warning" && "bg-warning/10 border border-warning/20",
                        insight.type === "success" && "bg-success/10 border border-success/20",
                        insight.type === "tip" && "bg-info/10 border border-info/20"
                      )}
                    >
                      <div className="flex items-start gap-3">
                        <insight.icon className={cn(
                          "h-5 w-5 mt-0.5",
                          insight.type === "warning" && "text-warning",
                          insight.type === "success" && "text-success",
                          insight.type === "tip" && "text-info"
                        )} />
                        <div className="flex-1">
                          <h4 className="font-medium text-foreground text-sm">{insight.title}</h4>
                          <p className="text-xs text-foreground-secondary mt-1">{insight.description}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card variant="glass">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold flex items-center gap-2">
                    <Target className="h-5 w-5 text-success" />
                    Goal Status
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {goals.filter(g => g.status === "active").slice(0, 3).map((goal) => {
                    const progress = (goal.currentAmount / goal.targetAmount) * 100;
                    return (
                      <div key={goal.id} className="p-3 rounded-lg bg-white/5">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <span className="text-lg">{goal.icon}</span>
                            <span className="font-medium text-foreground text-sm">{goal.name}</span>
                          </div>
                          <span className="text-xs text-foreground-secondary">{progress.toFixed(0)}%</span>
                        </div>
                        <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                          <div 
                            className={cn(
                              "h-full rounded-full",
                              progress >= 75 ? "bg-success" : progress >= 50 ? "bg-warning" : "bg-primary-start"
                            )}
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                  <button onClick={() => router.push("/goals")} className="w-full p-3 rounded-lg text-sm text-primary-start hover:bg-white/5 transition-colors flex items-center justify-center gap-1">
                    View all goals <ChevronRight className="h-4 w-4" />
                  </button>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>

      <div className="lg:hidden">
        <BottomNav />
      </div>
    </div>
  );
}