"use client";

import * as React from "react";
import { Sidebar } from "@/components/layout/sidebar";
import { BottomNav } from "@/components/layout/bottom-nav";
import { Header } from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress, ProgressRing } from "@/components/ui/progress";
import { DropdownMenu } from "@/components/ui/dropdown-menu";
import { formatCurrency, cn } from "@/lib/utils";
import { useAppStore } from "@/stores/app-store";
import { FREE_LIMITS } from "@/lib/features";
import { GoalCelebration, checkGoalMilestone } from "@/components/goal-celebration";
import { GoalDetailsModal } from "@/components/goal-details-modal";
import { EditGoalModal } from "@/components/edit-goal-modal";
import { DeleteGoalModal } from "@/components/delete-goal-modal";
import { Goal } from "@/types";
import { AddMoneyToGoalModal } from "@/components/add-money-to-goal-modal";
import Link from "next/link";
import { 
  Plus, 
  ArrowRight, 
  Target,
  TrendingUp,
  Calendar,
  DollarSign,
  MoreHorizontal,
  CheckCircle,
  Pause,
  Play,
  Crown
} from "lucide-react";

export default function GoalsPage() {
  const { goals, isPremium } = useAppStore();
  const [showUpgradeMsg, setShowUpgradeMsg] = React.useState(false);
  const [celebration, setCelebration] = React.useState<{ goalName: string; milestone: number } | null>(null);
  const [selectedGoal, setSelectedGoal] = React.useState<Goal | null>(null);
  const [goalToEdit, setGoalToEdit] = React.useState<Goal | null>(null);
  const [goalToDelete, setGoalToDelete] = React.useState<Goal | null>(null);
  const [showDetailsModal, setShowDetailsModal] = React.useState(false);

  // Check for goal milestones
  React.useEffect(() => {
    goals.forEach(goal => {
      const milestone = checkGoalMilestone(goal.id, goal.currentAmount, goal.targetAmount);
      if (milestone) {
        setCelebration({ goalName: goal.name, milestone });
      }
    });
  }, [goals]);

  const handleCreateGoal = () => {
    if (!isPremium && goals.length >= FREE_LIMITS.goals) {
      setShowUpgradeMsg(true);
      return;
    }
    window.location.href = "/add-goal";
  };
  
  if (goals.length === 0) {
    return (
      <div className="min-h-screen">
        <div className="hidden lg:block">
          <Sidebar />
        </div>
        <div className="lg:pl-[240px]">
          <Header title="Goals" showSearch={false} showNotifications={false} />
          <main className="p-4 lg:p-6 pb-20 lg:pb-6 flex items-center justify-center min-h-[calc(100vh-80px)]">
            <Card variant="glass" className="max-w-md w-full text-center p-8">
              <div className="w-20 h-20 rounded-full bg-white/10 flex items-center justify-center mx-auto mb-6">
                <Target className="h-10 w-10 text-foreground-secondary" />
              </div>
              <h1 className="text-2xl font-bold text-foreground mb-2">No Goals Yet</h1>
              <p className="text-foreground-secondary mb-6">Set financial goals to track your progress and stay motivated.</p>
              <Button className="w-full" onClick={handleCreateGoal}>
                <Plus className="h-4 w-4 mr-2" />
                Create Your First Goal
              </Button>
            </Card>
        </main>
      </div>

      <div className="lg:hidden">
        <BottomNav />
      </div>

      {/* Goal Celebration */}
      {celebration && (
        <GoalCelebration
          goalName={celebration.goalName}
          milestone={celebration.milestone}
          isOpen={!!celebration}
          onClose={() => setCelebration(null)}
        />
      )}

      {/* Upgrade Modal */}
      {showUpgradeMsg && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-black/50"
            onClick={() => setShowUpgradeMsg(false)}
          />
          <div className="relative w-full max-w-md glass-elevated rounded-2xl p-6 animate-fadeIn">
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-primary-start/20 flex items-center justify-center mx-auto mb-4">
                <Crown className="h-8 w-8 text-primary-start" />
              </div>
              <h2 className="text-xl font-semibold text-foreground mb-2">Goal Limit Reached</h2>
              <p className="text-foreground-secondary mb-4">
                Free accounts can create up to {FREE_LIMITS.goals} goals. Upgrade to Premium for unlimited goals.
              </p>
              <p className="text-sm text-foreground-tertiary mb-6">
                Contact your administrator to request a premium upgrade.
              </p>
              <Button onClick={() => setShowUpgradeMsg(false)} className="w-full">
                Got it
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Add Money to Goal Modal */}
      <AddMoneyToGoalModal
        goal={selectedGoal}
        isOpen={!!selectedGoal && !showDetailsModal}
        onClose={() => setSelectedGoal(null)}
      />

      {/* Edit Goal Modal */}
      {goalToEdit && (
        <EditGoalModal
          goal={goalToEdit}
          isOpen={!!goalToEdit}
          onClose={() => setGoalToEdit(null)}
        />
      )}

      {/* Delete Goal Modal */}
      {goalToDelete && (
        <DeleteGoalModal
          goal={goalToDelete}
          isOpen={!!goalToDelete}
          onClose={() => setGoalToDelete(null)}
        />
      )}
    </div>
  );
}
  const activeGoals = goals.filter(g => g.status === "active");
  const completedGoals = goals.filter(g => g.status === "completed");
  
  const totalTarget = activeGoals.reduce((sum, g) => sum + g.targetAmount, 0);
  const totalCurrent = activeGoals.reduce((sum, g) => sum + g.currentAmount, 0);
  const overallProgress = (totalCurrent / totalTarget) * 100;

  const getGoalTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      savings: "Savings",
      debt_payoff: "Debt Payoff",
      emergency_fund: "Emergency Fund",
      purchase: "Purchase",
      investment: "Investment",
      custom: "Custom",
    };
    return labels[type] || type;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed": return "text-success";
      case "paused": return "text-warning";
      default: return "text-foreground-secondary";
    }
  };

  const getDaysRemaining = (targetDate: string) => {
    const target = new Date(targetDate);
    const today = new Date();
    const diff = Math.ceil((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return diff > 0 ? diff : 0;
  };

  const getProjectedDate = (goal: typeof goals[0]) => {
    const remaining = goal.targetAmount - goal.currentAmount;
    if (remaining <= 0) return "Complete";
    if (goal.monthlyContribution <= 0) return "N/A";
    const months = remaining / goal.monthlyContribution;
    const projected = new Date();
    projected.setMonth(projected.getMonth() + Math.ceil(months));
    return projected.toLocaleDateString("en-US", { month: "short", year: "numeric" });
  };

  return (
    <div className="min-h-screen">
      <div className="hidden lg:block">
        <Sidebar />
      </div>

      <div className="lg:pl-[240px]">
        <Header title="Goals" showSearch showNotifications />
        
        <main className="p-4 lg:p-6 pb-20 lg:pb-6 space-y-6">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold text-foreground">
                Financial Goals
              </h1>
              <p className="text-foreground-secondary mt-1">
                Track your progress toward your dreams
              </p>
            </div>
            <Button onClick={handleCreateGoal}>
              <Plus className="h-4 w-4 mr-2" />
              New Goal
            </Button>
          </div>

          {/* Overall Summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card variant="glass" className="col-span-1 md:col-span-2">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-sm text-foreground-secondary">Total Progress</p>
                    <p className="text-2xl font-bold font-mono text-foreground mt-1">
                      {formatCurrency(totalCurrent)} / {formatCurrency(totalTarget)}
                    </p>
                  </div>
                  <ProgressRing value={overallProgress} size={70} strokeWidth={6}>
                    <span className="text-lg font-bold text-foreground">{overallProgress.toFixed(0)}%</span>
                  </ProgressRing>
                </div>
                
                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <Target className="h-4 w-4 text-foreground-secondary" />
                    <span className="text-foreground-secondary">{activeGoals.length} active goals</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-success" />
                    <span className="text-foreground-secondary">{completedGoals.length} completed</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card variant="glass">
              <CardContent className="p-6">
                <p className="text-sm text-foreground-secondary mb-2">Monthly Contribution</p>
                <p className="text-2xl font-bold font-mono text-foreground">
                  {formatCurrency(activeGoals.reduce((sum, g) => sum + g.monthlyContribution, 0))}
                </p>
                <p className="text-sm text-foreground-tertiary mt-2">
                  Across all active goals
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Active Goals */}
          <Card variant="glass">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg font-semibold">Active Goals</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {activeGoals.map((goal) => {
                const percentage = (goal.currentAmount / goal.targetAmount) * 100;
                const daysRemaining = getDaysRemaining(goal.targetDate);
                const projectedDate = getProjectedDate(goal);
                const isNearComplete = percentage >= 75;
                
                return (
                  <div key={goal.id} className="p-5 rounded-xl bg-white/5 hover:bg-white/10 transition-colors">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-4">
                        <div 
                          className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl"
                          style={{ backgroundColor: `${goal.color}20` }}
                        >
                          {goal.icon}
                        </div>
                        <div>
                          <h4 className="font-semibold text-foreground text-lg">{goal.name}</h4>
                          <p className="text-sm text-foreground-secondary">
                            {getGoalTypeLabel(goal.type)} • {daysRemaining} days remaining
                          </p>
                        </div>
                      </div>
                      <DropdownMenu
                        trigger={
                          <button className="p-2 rounded-lg hover:bg-white/10 transition-colors">
                            <MoreHorizontal className="h-4 w-4 text-foreground-secondary" />
                          </button>
                        }
                         items={[
                           { label: "Edit", onClick: () => setGoalToEdit(goal) },
                           { label: "Delete", onClick: () => setGoalToDelete(goal), variant: "destructive" as const },
                         ]}
                      />
                    </div>
                    
                    <div className="flex items-end justify-between mb-3">
                      <div>
                        <p className="text-2xl font-bold font-mono text-foreground">
                          {formatCurrency(goal.currentAmount)}
                        </p>
                        <p className="text-sm text-foreground-tertiary">
                          of {formatCurrency(goal.targetAmount)}
                        </p>
                      </div>
                      <div className="text-right">
                        <ProgressRing value={percentage} size={50} strokeWidth={4}>
                          <span className="text-xs font-bold text-foreground">{percentage.toFixed(0)}%</span>
                        </ProgressRing>
                      </div>
                    </div>
                    
                    <Progress 
                      value={goal.currentAmount} 
                      max={goal.targetAmount}
                      variant={isNearComplete ? "success" : "default"}
                      className="h-2 mb-4"
                    />
                    
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2 text-foreground-secondary">
                        <DollarSign className="h-4 w-4" />
                        <span>{formatCurrency(goal.monthlyContribution)}/month</span>
                      </div>
                      <div className="flex items-center gap-2 text-foreground-secondary">
                        <Calendar className="h-4 w-4" />
                        <span>Target: {new Date(goal.targetDate).toLocaleDateString("en-US", { month: "short", year: "numeric" })}</span>
                      </div>
                    </div>
                    
                    {isNearComplete && (
                      <div className="mt-4 p-3 rounded-lg bg-success/10 border border-success/20 flex items-center gap-2">
                        <TrendingUp className="h-4 w-4 text-success" />
                        <span className="text-sm text-success">Almost there! Keep up the great work!</span>
                      </div>
                    )}
                    
                     <div className="mt-3 flex gap-2">
                       <Button variant="secondary" size="sm" className="flex-1" onClick={() => setSelectedGoal(goal)}>
                         Add Money
                       </Button>
                        <Button variant="ghost" size="sm" onClick={() => {
                          setSelectedGoal(goal);
                          setShowDetailsModal(true);
                        }}>
                          View Details
                        </Button>
                     </div>
                  </div>
                );
              })}

              {/* Add Goal Button */}
              <button 
                className="w-full p-5 rounded-xl border-2 border-dashed border-white/10 hover:border-primary-start/50 hover:bg-primary-start/5 transition-all flex items-center justify-center gap-2 text-foreground-secondary hover:text-primary-start"
                onClick={handleCreateGoal}
              >
                <Plus className="h-5 w-5" />
                <span className="font-medium">Create New Goal</span>
              </button>
            </CardContent>
          </Card>

          {/* Completed Goals */}
          {completedGoals.length > 0 && (
            <Card variant="glass">
              <CardHeader>
                <CardTitle className="text-lg font-semibold flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-success" />
                  Completed Goals
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {completedGoals.map((goal) => (
                    <div key={goal.id} className="flex items-center justify-between p-4 rounded-xl bg-white/5">
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-10 h-10 rounded-xl flex items-center justify-center text-lg"
                          style={{ backgroundColor: `${goal.color}20` }}
                        >
                          {goal.icon}
                        </div>
                        <div>
                          <h4 className="font-medium text-foreground">{goal.name}</h4>
                          <p className="text-sm text-foreground-tertiary">
                            Completed {goal.completedAt ? new Date(goal.completedAt).toLocaleDateString() : "recently"}
                          </p>
                        </div>
                      </div>
                      <CheckCircle className="h-5 w-5 text-success" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Milestones */}
          <Card variant="glass">
            <CardHeader>
              <CardTitle className="text-lg font-semibold">Upcoming Milestones</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {activeGoals.slice(0, 3).map((goal) => {
                  const milestones = [25, 50, 75, 100];
                  const nextMilestone = milestones.find(m => (goal.currentAmount / goal.targetAmount) * 100 < m);
                  const milestoneAmount = (nextMilestone! / 100) * goal.targetAmount;
                  const remaining = milestoneAmount - goal.currentAmount;
                  
                  return (
                    <div key={goal.id} className="flex items-center justify-between p-3 rounded-lg bg-white/5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary-start/20 flex items-center justify-center text-sm font-bold text-primary-start">
                          {nextMilestone}%
                        </div>
                        <div>
                          <p className="text-sm font-medium text-foreground">{goal.name}</p>
                          <p className="text-xs text-foreground-tertiary">
                            {formatCurrency(remaining)} to reach {nextMilestone}%
                          </p>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm" onClick={() => alert("Contribute to goal - coming soon")}>
                        Contribute
                      </Button>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </main>
      </div>

      <div className="lg:hidden">
        <BottomNav />
      </div>

      {/* Goal Celebration */}
      {celebration && (
        <GoalCelebration
          goalName={celebration.goalName}
          milestone={celebration.milestone}
          isOpen={!!celebration}
          onClose={() => setCelebration(null)}
        />
      )}

      {/* Upgrade Modal */}
      {showUpgradeMsg && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-black/50"
            onClick={() => setShowUpgradeMsg(false)}
          />
          <div className="relative w-full max-w-md glass-elevated rounded-2xl p-6 animate-fadeIn">
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-primary-start/20 flex items-center justify-center mx-auto mb-4">
                <Crown className="h-8 w-8 text-primary-start" />
              </div>
              <h2 className="text-xl font-semibold text-foreground mb-2">Goal Limit Reached</h2>
              <p className="text-foreground-secondary mb-4">
                Free accounts can create up to {FREE_LIMITS.goals} goals. Upgrade to Premium for unlimited goals.
              </p>
              <p className="text-sm text-foreground-tertiary mb-6">
                Contact your administrator to request a premium upgrade.
              </p>
              <Button onClick={() => setShowUpgradeMsg(false)} className="w-full">
                Got it
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}