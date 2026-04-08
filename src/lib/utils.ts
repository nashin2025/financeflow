import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number, currency: string = "MVR"): string {
  const currencyMap: Record<string, string> = {
    MVR: "MVR",
    USD: "USD",
    EUR: "EUR",
    GBP: "GBP",
    INR: "INR",
    SGD: "SGD",
  };
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currencyMap[currency] || "MVR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatCompactCurrency(amount: number): string {
  const symbol = "Rf";
  if (amount >= 1000000) {
    return `${symbol}${(amount / 1000000).toFixed(1)}M`;
  }
  if (amount >= 1000) {
    return `${symbol}${(amount / 1000).toFixed(1)}K`;
  }
  return `${symbol}${amount.toFixed(2)}`;
}

export function formatPercentage(value: number): string {
  return `${Math.abs(value).toFixed(1)}%`;
}

export function formatDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

export function formatDateLong(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

export function formatTime(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

export function getRelativeTimeString(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays}d ago`;
  return formatDate(d);
}

export function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function truncate(str: string, length: number): string {
  if (str.length <= length) return str;
  return str.slice(0, Math.max(0, length - 3)) + "...";
}

export function generateId(): string {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

export const categoryColors: Record<string, string> = {
  housing: "#6366F1",
  groceries: "#10B981",
  dining: "#F59E0B",
  transportation: "#3B82F6",
  gas: "#EF4444",
  healthcare: "#EC4899",
  entertainment: "#8B5CF6",
  clothing: "#14B8A6",
  subscriptions: "#F97316",
  education: "#06B6D4",
  travel: "#A855F7",
  utilities: "#FBBF24",
  pets: "#84CC16",
  gifts: "#FB923C",
  fitness: "#22D3EE",
  shopping: "#E879F9",
  business: "#64748B",
  maintenance: "#78716C",
  insurance: "#F43F5E",
  debt: "#DC2626",
  investments: "#059669",
  other: "#9CA3AF",
  salary: "#10B981",
  freelance: "#14B8A6",
  rental: "#8B5CF6",
  gifts_received: "#F59E0B",
  side_hustle: "#22D3EE",
  dividends: "#059669",
  refunds: "#6B7280",
  other_income: "#9CA3AF",
};

export const categoryIcons: Record<string, string> = {
  housing: "🏠",
  groceries: "🛒",
  dining: "🍕",
  transportation: "🚗",
  gas: "⛽",
  healthcare: "💊",
  entertainment: "🎬",
  clothing: "👔",
  subscriptions: "📱",
  education: "🎓",
  travel: "✈️",
  utilities: "💡",
  pets: "🐕",
  gifts: "🎁",
  fitness: "🏋️",
  shopping: "📦",
  business: "💼",
  maintenance: "🔧",
  insurance: "🏥",
  debt: "💳",
  investments: "📊",
  other: "🤷",
  salary: "💼",
  freelance: "🖥️",
  rental: "🏠",
  gifts_received: "🎁",
  side_hustle: "💵",
  dividends: "📈",
  refunds: "🔄",
  other_income: "🤷",
};