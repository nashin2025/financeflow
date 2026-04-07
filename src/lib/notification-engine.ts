/**
 * Smart Notification Engine
 * Generates notifications based on financial events.
 * Checks for budget alerts, goal milestones, anomalies, and spending trends.
 */

import prisma from '@/lib/prisma';

/**
 * Generate smart notifications for a user based on their financial data
 */
export async function generateSmartNotifications(userId: string): Promise<number> {
  let created = 0;

  // 1. Budget threshold alerts
  created += await checkBudgetAlerts(userId);

  // 2. Goal milestone notifications
  created += await checkGoalMilestones(userId);

  // 3. Anomaly detection
  created += await checkAnomalies(userId);

  // 4. Spending trend notifications
  created += await checkSpendingTrends(userId);

  return created;
}

/**
 * Check budgets for threshold breaches (75%, 90%, 100%, 110%)
 */
async function checkBudgetAlerts(userId: string): Promise<number> {
  const budgets = await prisma.budget.findMany({
    where: { userId, isActive: true },
  });

  let created = 0;
  const thresholds = [75, 90, 100, 110];

  for (const budget of budgets) {
    const amount = Number(budget.amount);
    const spent = Number(budget.spent);
    if (amount === 0) continue;

    const percentage = (spent / amount) * 100;

    for (const threshold of thresholds) {
      if (percentage >= threshold) {
        // Check if notification already exists for this budget+threshold
        const existing = await prisma.notification.findFirst({
          where: {
            userId,
            type: 'budget_alert',
            data: {
              path: ['$'],
              string_contains: `"budgetId":"${budget.id}"`,
            },
          },
        });

        if (!existing) {
          let message = '';
          if (threshold <= 100) {
            message = `You've reached ${threshold}% of your ${budget.name} budget (${formatCurrency(spent)} / ${formatCurrency(amount)}).`;
          } else {
            const over = spent - amount;
            message = `You're ${formatCurrency(over)} over your ${budget.name} budget!`;
          }

          await prisma.notification.create({
            data: {
              userId,
              type: 'budget_alert',
              title: threshold <= 100 ? `Budget Alert: ${budget.name}` : `Over Budget: ${budget.name}`,
              message,
              data: { budgetId: budget.id, threshold, percentage: Math.round(percentage) },
            },
          });
          created++;
        }
      }
    }
  }

  return created;
}

/**
 * Check goals for milestone achievements (25%, 50%, 75%, 100%)
 */
async function checkGoalMilestones(userId: string): Promise<number> {
  const goals = await prisma.goal.findMany({
    where: { userId, status: 'active' },
  });

  let created = 0;
  const milestones = [25, 50, 75, 100];

  for (const goal of goals) {
    const target = Number(goal.targetAmount);
    const current = Number(goal.currentAmount);
    if (target === 0) continue;

    const percentage = (current / target) * 100;

    for (const milestone of milestones) {
      if (percentage >= milestone && percentage < milestone + 5) {
        // Check if milestone already notified
        const existing = await prisma.notification.findFirst({
          where: {
            userId,
            type: 'goal_milestone',
            data: {
              path: ['$'],
              string_contains: `"goalId":"${goal.id}"`,
            },
          },
        });

        if (!existing) {
          const label = milestone === 100 ? 'completed' : `${milestone}% complete`;
          await prisma.notification.create({
            data: {
              userId,
              type: 'goal_milestone',
              title: milestone === 100 ? `🎉 Goal Completed!` : `Milestone: ${goal.name}`,
              message: `You've reached ${label} of your "${goal.name}" goal! ${formatCurrency(current)} / ${formatCurrency(target)}`,
              data: { goalId: goal.id, milestone, percentage: Math.round(percentage) },
            },
          });
          created++;
        }
      }
    }
  }

  return created;
}

/**
 * Detect anomalous transactions (> 2 std dev from mean)
 */
async function checkAnomalies(userId: string): Promise<number> {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const expenses = await prisma.transaction.findMany({
    where: {
      userId,
      type: 'expense',
      date: { gte: thirtyDaysAgo },
    },
  });

  if (expenses.length < 5) return 0; // Need minimum data points

  const amounts = expenses.map(e => Number(e.amount));
  const mean = amounts.reduce((s, a) => s + a, 0) / amounts.length;
  const variance = amounts.reduce((s, a) => s + Math.pow(a - mean, 2), 0) / amounts.length;
  const stdDev = Math.sqrt(variance);
  const threshold = mean + (2 * stdDev);

  let created = 0;

  // Check recent transactions (last 7 days) for anomalies
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const recentExpenses = expenses.filter(e => e.date >= sevenDaysAgo);

  for (const expense of recentExpenses) {
    const amount = Number(expense.amount);
    if (amount > threshold) {
      // Check if already notified
      const existing = await prisma.notification.findFirst({
        where: {
          userId,
          type: 'anomaly',
          data: {
            path: ['$'],
            string_contains: `"transactionId":"${expense.id}"`,
          },
        },
      });

      if (!existing) {
        await prisma.notification.create({
          data: {
            userId,
            type: 'anomaly',
            title: 'Unusual Transaction Detected',
            message: `A transaction of ${formatCurrency(amount)} at ${expense.merchantName || expense.description || 'unknown merchant'} is significantly higher than your average (${formatCurrency(mean)}).`,
            data: { transactionId: expense.id, amount, averageAmount: Math.round(mean), threshold: Math.round(threshold) },
          },
        });
        created++;
      }
    }
  }

  return created;
}

/**
 * Check for month-over-month spending increases > 20%
 */
async function checkSpendingTrends(userId: string): Promise<number> {
  const now = new Date();
  const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);

  const [currentMonthExpenses, lastMonthExpenses] = await Promise.all([
    prisma.transaction.aggregate({
      where: { userId, type: 'expense', date: { gte: currentMonthStart } },
      _sum: { amount: true },
    }),
    prisma.transaction.aggregate({
      where: { userId, type: 'expense', date: { gte: lastMonthStart, lte: lastMonthEnd } },
      _sum: { amount: true },
    }),
  ]);

  const currentTotal = Number(currentMonthExpenses._sum.amount || 0);
  const lastTotal = Number(lastMonthExpenses._sum.amount || 0);

  if (lastTotal === 0) return 0;

  const increase = ((currentTotal - lastTotal) / lastTotal) * 100;

  if (increase > 20) {
    // Check if already notified for this month
    const existing = await prisma.notification.findFirst({
      where: {
        userId,
        type: 'insight',
        createdAt: { gte: currentMonthStart },
        data: {
          path: ['$'],
          string_contains: '"spendingTrend"',
        },
      },
    });

    if (!existing) {
      await prisma.notification.create({
        data: {
          userId,
          type: 'insight',
          title: 'Spending Trend Alert',
          message: `Your spending is up ${increase.toFixed(1)}% compared to last month (${formatCurrency(currentTotal)} vs ${formatCurrency(lastTotal)}).`,
          data: { spendingTrend: true, increase: Math.round(increase), currentMonth: currentTotal, lastMonth: lastTotal },
        },
      });
      return 1;
    }
  }

  return 0;
}

/**
 * Format currency for notification messages
 */
function formatCurrency(amount: number): string {
  return `MVR ${amount.toFixed(2)}`;
}
