"use client";

import * as React from "react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";
import { Calendar, Target, DollarSign } from "lucide-react";
import type { Goal } from "@/types";

interface GoalDetailsModalProps {
  goal: Goal | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit?: (goal: Goal) => void;
  onDelete?: (goal: Goal) => void;
}

export function GoalDetailsModal({ goal, isOpen, onClose, onEdit, onDelete }: GoalDetailsModalProps) {
  const contributions = React.useMemo(() => {
    // This would ideally come from transaction data linked to this goal
    // For now, we'll show a placeholder
    return [
      { date: "2024-01-15", amount: 500, description: "Monthly contribution" },
      { date: "2024-02-15", amount: 500, description: "Monthly contribution" },
      { date: "2024-03-15", amount: 500, description: "Monthly contribution" },
    ];
  }, []);

  if (!goal) return null;

  const progress = (goal.currentAmount / goal.targetAmount) * 100;
  const remaining = goal.targetAmount - goal.currentAmount;
  const daysRemaining = Math.max(0, Math.ceil((new Date(goal.targetDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)));
  const monthsRemaining = Math.max(0, Math.ceil(daysRemaining / 30));
  const monthlyNeeded = monthsRemaining > 0 ? remaining / monthsRemaining : 0;

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <div className="space-y-6">
        {/* Header */}
        <div className="text-center">
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-4"
            style={{ backgroundColor: `${goal.color}20` }}
          >
            {goal.icon}
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-2">{goal.name}</h2>
          <p className="text-foreground-secondary capitalize">{goal.type.replace('_', ' ')} Goal</p>
        </div>

        {/* Progress Overview */}
        <div className="grid md:grid-cols-2 gap-4">
          <div className="bg-white/5 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Target className="h-4 w-4 text-foreground-secondary" />
              <span className="text-sm font-medium text-foreground">Progress</span>
            </div>
            <div className="text-2xl font-bold font-mono text-foreground mb-1">
              {progress.toFixed(1)}%
            </div>
            <div className="w-full h-2 bg-white/10 rounded-full">
              <div
                className="h-full bg-primary-start rounded-full transition-all"
                style={{ width: `${Math.min(progress, 100)}%` }}
              />
            </div>
          </div>

          <div className="bg-white/5 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="h-4 w-4 text-foreground-secondary" />
              <span className="text-sm font-medium text-foreground">Time Remaining</span>
            </div>
            <div className="text-2xl font-bold font-mono text-foreground mb-1">
              {daysRemaining} days
            </div>
            <p className="text-xs text-foreground-tertiary">
              {monthsRemaining} months remaining
            </p>
          </div>
        </div>

        {/* Financial Details */}
        <div className="grid md:grid-cols-3 gap-4">
          <div className="bg-white/5 rounded-lg p-4 text-center">
            <div className="text-sm text-foreground-secondary mb-1">Current Amount</div>
            <div className="text-xl font-bold font-mono text-foreground">
              {formatCurrency(goal.currentAmount)}
            </div>
          </div>
          <div className="bg-white/5 rounded-lg p-4 text-center">
            <div className="text-sm text-foreground-secondary mb-1">Target Amount</div>
            <div className="text-xl font-bold font-mono text-foreground">
              {formatCurrency(goal.targetAmount)}
            </div>
          </div>
          <div className="bg-white/5 rounded-lg p-4 text-center">
            <div className="text-sm text-foreground-secondary mb-1">Remaining</div>
            <div className="text-xl font-bold font-mono text-foreground">
              {formatCurrency(remaining)}
            </div>
          </div>
        </div>

        {/* Monthly Contribution Analysis */}
        <div className="bg-white/5 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-3">
            <DollarSign className="h-4 w-4 text-foreground-secondary" />
            <span className="text-sm font-medium text-foreground">Monthly Contribution</span>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <div className="text-sm text-foreground-secondary mb-1">Current Monthly</div>
              <div className="text-lg font-bold font-mono text-foreground">
                {formatCurrency(goal.monthlyContribution)}
              </div>
            </div>
            <div>
              <div className="text-sm text-foreground-secondary mb-1">Needed Monthly</div>
              <div className="text-lg font-bold font-mono text-foreground">
                {formatCurrency(monthlyNeeded)}
              </div>
            </div>
          </div>
          {goal.monthlyContribution < monthlyNeeded && (
            <div className="mt-3 p-3 rounded-lg bg-warning/10 border border-warning/20">
              <p className="text-sm text-warning">
                You may need to increase your monthly contribution to reach your goal on time.
              </p>
            </div>
          )}
        </div>

        {/* Recent Contributions */}
        <div className="bg-white/5 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-foreground mb-3">Recent Contributions</h3>
          {contributions.length > 0 ? (
            <div className="space-y-2">
              {contributions.map((contribution, index) => (
                <div key={index} className="flex items-center justify-between py-2 border-b border-white/10 last:border-b-0">
                  <div>
                    <div className="text-sm font-medium text-foreground">{contribution.description}</div>
                    <div className="text-xs text-foreground-tertiary">
                      {new Date(contribution.date).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="text-sm font-mono font-medium text-foreground">
                    +{formatCurrency(contribution.amount)}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-foreground-secondary text-sm">No contributions yet</p>
          )}
        </div>

        {/* Goal Timeline */}
        <div className="bg-white/5 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-foreground mb-3">Goal Timeline</h3>
          <div className="flex items-center justify-between text-sm">
            <div>
              <div className="text-foreground-secondary">Started</div>
              <div className="text-foreground font-medium">
                {new Date(goal.createdAt).toLocaleDateString()}
              </div>
            </div>
            <div className="text-center">
              <div className="text-foreground-secondary">Target Date</div>
              <div className="text-foreground font-medium">
                {new Date(goal.targetDate).toLocaleDateString()}
              </div>
            </div>
            <div className="text-right">
              <div className="text-foreground-secondary">Days Left</div>
              <div className="text-foreground font-medium">{daysRemaining}</div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 pt-4 border-t border-white/10">
          {onDelete && (
            <Button variant="danger" size="sm" onClick={() => onDelete(goal)}>
              Delete
            </Button>
          )}
          {onEdit && (
            <Button variant="secondary" size="sm" onClick={() => onEdit(goal)}>
              Edit
            </Button>
          )}
          <Button onClick={onClose} className="flex-1">
            Close
          </Button>
        </div>
      </div>
    </Modal>
  );
}