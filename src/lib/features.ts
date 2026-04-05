export const FEATURES = {
  ai_assistant: { name: "AI Assistant", premium: true },
  advanced_analytics: { name: "Advanced Analytics", premium: true },
  export_data: { name: "Export Data", premium: true },
  unlimited_budgets: { name: "Unlimited Budgets", premium: true },
  unlimited_goals: { name: "Unlimited Goals", premium: true },
  custom_categories: { name: "Custom Categories", premium: true },
  bill_reminders: { name: "Bill Reminders", premium: true },
  multi_currency: { name: "Multi-Currency", premium: true },
} as const;

export type FeatureKey = keyof typeof FEATURES;

export const FREE_LIMITS = {
  budgets: 3,
  goals: 2,
  accounts: 5,
} as const;

export function hasFeature(isPremium: boolean, feature: FeatureKey): boolean {
  if (isPremium) return true;
  return !FEATURES[feature].premium;
}

export function getRemainingLimit(isPremium: boolean, current: number, limitKey: keyof typeof FREE_LIMITS): number {
  if (isPremium) return Infinity;
  return Math.max(0, FREE_LIMITS[limitKey] - current);
}
