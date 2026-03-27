import * as React from "react";
import { cn } from "@/lib/utils";

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "success" | "warning" | "error" | "info" | "outline";
}

const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant = "default", ...props }, ref) => {
    const variants = {
      default: "bg-white/10 text-foreground-secondary",
      success: "bg-success/20 text-success",
      warning: "bg-warning/20 text-warning",
      error: "bg-error/20 text-error",
      info: "bg-info/20 text-info",
      outline: "border border-white/20 text-foreground-secondary",
    };

    return (
      <span
        ref={ref}
        className={cn(
          "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
          variants[variant],
          className
        )}
        {...props}
      />
    );
  }
);

Badge.displayName = "Badge";

export { Badge };
export type { BadgeProps };