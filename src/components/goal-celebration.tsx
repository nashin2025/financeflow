"use client";

import * as React from "react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import confetti from "canvas-confetti";

interface GoalCelebrationProps {
  goalName: string;
  milestone: number;
  isOpen: boolean;
  onClose: () => void;
}

export function GoalCelebration({ goalName, milestone, isOpen, onClose }: GoalCelebrationProps) {
  React.useEffect(() => {
    if (isOpen) {
      confetti({
        particleCount: 150,
        spread: 80,
        origin: { y: 0.6 },
        colors: ["#6366F1", "#8B5CF6", "#10B981", "#F59E0B"],
      });

      // Second burst
      setTimeout(() => {
        confetti({
          particleCount: 80,
          spread: 60,
          origin: { y: 0.7 },
          angle: 60,
        });
        confetti({
          particleCount: 80,
          spread: 60,
          origin: { y: 0.7 },
          angle: 120,
        });
      }, 300);
    }
  }, [isOpen]);

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="md">
      <div className="text-center py-4">
        <div className="text-6xl mb-4">🎉</div>
        <h2 className="text-2xl font-bold text-foreground mb-2">
          {milestone === 100 ? "Goal Completed!" : "Milestone Reached!"}
        </h2>
        <p className="text-foreground-secondary mb-6">
          You&apos;ve hit <strong>{milestone}%</strong> of your <strong>{goalName}</strong> goal!
        </p>
        {milestone === 100 && (
          <p className="text-success font-medium mb-4">
            Congratulations on achieving your financial goal! 🏆
          </p>
        )}
        <Button onClick={onClose} className="w-full">
          {milestone === 100 ? "Celebrate! 🎊" : "Awesome! 💪"}
        </Button>
      </div>
    </Modal>
  );
}

/**
 * Check if a goal has reached a milestone and trigger celebration
 * Returns the milestone number if triggered, null otherwise
 */
export function checkGoalMilestone(goalId: string, currentAmount: number, targetAmount: number): number | null {
  if (targetAmount === 0) return null;

  const percentage = (currentAmount / targetAmount) * 100;
  const milestones = [25, 50, 75, 100];

  for (const m of milestones) {
    if (percentage >= m && percentage < m + 5) {
      const key = `milestone-${goalId}-${m}`;
      if (typeof window !== "undefined" && !localStorage.getItem(key)) {
        localStorage.setItem(key, "true");
        return m;
      }
    }
  }

  return null;
}
