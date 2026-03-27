import * as React from "react";
import { cn } from "@/lib/utils";

interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value: number;
  max?: number;
  showLabel?: boolean;
  size?: "sm" | "md" | "lg";
  variant?: "default" | "success" | "warning" | "danger";
}

const Progress = React.forwardRef<HTMLDivElement, ProgressProps>(
  ({ className, value, max = 100, showLabel = false, size = "md", variant = "default", ...props }, ref) => {
    const percentage = Math.min(Math.max((value / max) * 100, 0), 100);
    
    const sizes = {
      sm: "h-1.5",
      md: "h-2.5",
      lg: "h-4",
    };

    const variants = {
      default: "bg-primary-start",
      success: "bg-success",
      warning: "bg-warning",
      danger: "bg-error",
    };

    return (
      <div className={cn("w-full", className)} {...props}>
        <div className={cn("w-full bg-white/10 rounded-full overflow-hidden", sizes[size])}>
          <div
            className={cn("h-full rounded-full transition-all duration-500 ease-out", variants[variant])}
            style={{ width: `${percentage}%` }}
          />
        </div>
        {showLabel && (
          <div className="mt-1 text-xs text-foreground-tertiary text-right">
            {percentage.toFixed(0)}%
          </div>
        )}
      </div>
    );
  }
);

Progress.displayName = "Progress";

interface ProgressRingProps {
  value: number;
  max?: number;
  size?: number;
  strokeWidth?: number;
  children?: React.ReactNode;
  className?: string;
}

function ProgressRing({ value, max = 100, size = 80, strokeWidth = 8, children, className }: ProgressRingProps) {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <div className={cn("relative inline-flex items-center justify-center", className)}>
      <svg width={size} height={size} className="transform -rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="transparent"
          className="text-white/10"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="url(#gradient)"
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-all duration-500 ease-out"
        />
        <defs>
          <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#6366F1" />
            <stop offset="50%" stopColor="#8B5CF6" />
            <stop offset="100%" stopColor="#A855F7" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        {children}
      </div>
    </div>
  );
}

export { Progress, ProgressRing };
export type { ProgressProps };