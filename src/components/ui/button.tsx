import * as React from "react";
import { cn } from "@/lib/utils";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "lg" | "icon";
  isLoading?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", isLoading, children, disabled, ...props }, ref) => {
    const baseStyles = "inline-flex items-center justify-center font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-background disabled:opacity-50 disabled:cursor-not-allowed";
    
    const variants = {
      primary: "gradient-primary text-white hover:scale-[1.02] active:scale-[0.98] focus:ring-primary-500",
      secondary: "glass text-foreground-secondary border border-white/10 hover:bg-white/10 focus:ring-white/20",
      ghost: "text-foreground-secondary hover:text-foreground hover:bg-white/5 focus:ring-white/10",
      danger: "bg-error text-white hover:bg-red-600 focus:ring-red-500",
    };

    const sizes = {
      sm: "h-8 px-3 text-sm rounded-lg",
      md: "h-12 px-6 text-base rounded-xl",
      lg: "h-14 px-8 text-lg rounded-xl",
      icon: "h-10 w-10 rounded-full",
    };

    return (
      <button
        ref={ref}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading ? (
          <svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
        ) : null}
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";

export { Button };
export type { ButtonProps };