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
import { PremiumLock } from "@/components/premium-lock";
import { FinanceAI } from "@/lib/ai-engine";
import { calculateHealthScore, getHealthLabel } from "@/lib/health-score";
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
  suggestions?: string[];
  timestamp: Date;
}

export default function AIPage() {
  const router = useRouter();
  const { transactions, categories, budgets, goals, accounts, isPremium } = useAppStore();
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

  const aiEngine = React.useMemo(() => {
    return new FinanceAI({
      transactions,
      budgets,
      goals,
      accounts,
    });
  }, [transactions, budgets, goals, accounts]);

  const healthScore = React.useMemo(() => {
    return calculateHealthScore({ transactions, budgets, goals, accounts });
  }, [transactions, budgets, goals, accounts]);

  const healthLabel = getHealthLabel(healthScore.overall);

  const handleSend = async () => {
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

    try {
      const response = await aiEngine.query(input);

      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: response.message,
        suggestions: response.suggestions,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch {
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "Sorry, I encountered an error processing your request. Please try again.",
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setInput(suggestion);
    setTimeout(() => {
      const inputEl = document.querySelector('input[placeholder="Ask about your finances..."]') as HTMLInputElement;
      inputEl?.focus();
    }, 0);
  };

  React.useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

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
      description: `You've spent ${formatCurrency(budgets.find(b => b.name.toLowerCase().includes("grocer"))?.spent || 0)} on groceries - under budget!`,
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
    "Am I over budget?",
    "How's my savings goal?",
    "Compare this month to last month",
    "Give me financial advice",
  ];

  return (
    <div className="min-h-screen">
      <div className="hidden lg:block">
        <Sidebar />
      </div>

      <div className="lg:pl-[240px]">
        <Header title="AI Assistant" showSearch={false} showNotifications />

        <main className="p-4 lg:p-6 pb-20 lg:pb-6 space-y-6">
          <PremiumLock feature="AI-powered financial insights and chat assistant">
            {transactions.length > 0 && (
              <Card variant="glass" className="bg-gradient-to-r from-primary/10 to-purple-500/10 border-primary/20">
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row md:items-center gap-6">
                    <div className="flex-shrink-0">
                      <ProgressRing value={healthScore.overall} size={100} strokeWidth={8}>
                        <div className="text-center">
                          <span className="text-2xl font-bold text-white">{healthScore.overall}</span>
                          <span className="text-xs text-white/60">/100</span>
                        </div>
                      </ProgressRing>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-3">
                        <Sparkles className="h-5 w-5 text-primary" />
                        <h2 className="text-xl font-semibold text-white">Financial Health Score</h2>
                      </div>
                      <p className="text-white/60 mb-4">
                        Your overall financial health is <span className={cn("font-medium", healthLabel.color)}>{healthLabel.label}</span>. {healthScore.overall >= 60 ? 'Keep making smart decisions!' : 'Start building better habits today.'}
                      </p>
                      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                        {Object.entries(healthScore.breakdown).map(([key, component]) => (
                          <div key={key} className="text-center">
                            <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden mb-1">
                              <div
                                className={cn(
                                  "h-full rounded-full",
                                  component.score >= 70 ? "bg-success" : component.score >= 50 ? "bg-warning" : "bg-error"
                                )}
                                style={{ width: `${component.score}%` }}
                              />
                            </div>
                            <span className="text-xs text-white/40">{component.label}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {healthScore.insights.length > 0 && (
              <Card variant="glass">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold flex items-center gap-2">
                    <Lightbulb className="h-5 w-5 text-warning" />
                    Insights
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {healthScore.insights.map((insight, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-white/60">
                        <span className="text-primary mt-0.5">•</span>
                        {insight}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            <div className="grid lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-4">
                <Card variant="glass" className="h-[500px] flex flex-col">
                  <CardHeader className="flex-shrink-0">
                    <CardTitle className="text-lg font-semibold flex items-center gap-2">
                      <MessageCircle className="h-5 w-5 text-primary" />
                      Ask about your finances
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="flex-1 overflow-y-auto space-y-4 pb-4">
                    {messages.map((message) => (
                      <div key={message.id}>
                        <div
                          className={cn(
                            "flex",
                            message.role === "user" ? "justify-end" : "justify-start"
                          )}
                        >
                          <div className={cn(
                            "max-w-[80%] p-4 rounded-2xl",
                            message.role === "user"
                              ? "bg-gradient-to-r from-primary to-purple-500 text-white"
                              : "bg-white/10 text-white"
                          )}>
                            <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                          </div>
                        </div>
                        {message.suggestions && message.suggestions.length > 0 && message.role === "assistant" && (
                          <div className="flex flex-wrap gap-2 mt-2 ml-2">
                            {message.suggestions.map((suggestion, i) => (
                              <button
                                key={i}
                                onClick={() => handleSuggestionClick(suggestion)}
                                className="px-3 py-1 rounded-full bg-white/5 text-xs text-white/60 hover:bg-white/10 hover:text-white transition-colors border border-white/10"
                              >
                                {suggestion}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                    {isTyping && (
                      <div className="flex justify-start">
                        <div className="bg-white/10 p-4 rounded-2xl">
                          <div className="flex gap-1">
                            <span className="w-2 h-2 bg-white/40 rounded-full animate-bounce" />
                            <span className="w-2 h-2 bg-white/40 rounded-full animate-bounce" style={{ animationDelay: "0.1s" }} />
                            <span className="w-2 h-2 bg-white/40 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }} />
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
                        className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white placeholder:text-white/40 focus:outline-none focus:border-primary"
                      />
                      <Button onClick={handleSend} disabled={!input.trim() || isTyping}>
                        <Send className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </Card>

                <div className="flex flex-wrap gap-2">
                  {quickQuestions.map((question) => (
                    <button
                      key={question}
                      onClick={() => {
                        setInput(question);
                        setTimeout(() => {
                          const inputEl = document.querySelector('input[placeholder="Ask about your finances..."]') as HTMLInputElement;
                          inputEl?.focus();
                        }, 0);
                      }}
                      className="px-4 py-2 rounded-xl bg-white/5 text-sm text-white/60 hover:bg-white/10 hover:text-white transition-colors"
                    >
                      {question}
                    </button>
                  ))}
                </div>
              </div>

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
                          insight.type === "tip" && "bg-primary/10 border border-primary/20"
                        )}
                      >
                        <div className="flex items-start gap-3">
                          <insight.icon className={cn(
                            "h-5 w-5 mt-0.5",
                            insight.type === "warning" && "text-warning",
                            insight.type === "success" && "text-success",
                            insight.type === "tip" && "text-primary"
                          )} />
                          <div className="flex-1">
                            <h4 className="font-medium text-white text-sm">{insight.title}</h4>
                            <p className="text-xs text-white/60 mt-1">{insight.description}</p>
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
                      const progress = goal.targetAmount > 0 ? (goal.currentAmount / goal.targetAmount) * 100 : 0;
                      return (
                        <div key={goal.id} className="p-3 rounded-lg bg-white/5">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <span className="text-lg">{goal.icon}</span>
                              <span className="font-medium text-white text-sm">{goal.name}</span>
                            </div>
                            <span className="text-xs text-white/60">{progress.toFixed(0)}%</span>
                          </div>
                          <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                            <div
                              className={cn(
                                "h-full rounded-full",
                                progress >= 75 ? "bg-success" : progress >= 50 ? "bg-warning" : "bg-primary"
                              )}
                              style={{ width: `${progress}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                    <button onClick={() => router.push("/goals")} className="w-full p-3 rounded-lg text-sm text-primary hover:bg-white/5 transition-colors flex items-center justify-center gap-1">
                      View all goals <ChevronRight className="h-4 w-4" />
                    </button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </PremiumLock>
        </main>
      </div>

      <div className="lg:hidden">
        <BottomNav />
      </div>
    </div>
  );
}
