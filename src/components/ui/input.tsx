import * as React from "react";
import { cn } from "@/lib/utils";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
  iconRight?: React.ReactNode;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, label, error, icon, iconRight, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-foreground-secondary mb-2">
            {label}
          </label>
        )}
        <div className="relative">
          {icon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground-tertiary">
              {icon}
            </div>
          )}
          <input
            type={type}
            className={cn(
              "flex h-12 w-full rounded-xl bg-white/5 border border-white/10 px-4 py-2 text-sm text-foreground placeholder:text-foreground-tertiary focus:outline-none focus:border-primary-start focus:ring-2 focus:ring-primary-start/20 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200",
              icon && "pl-10",
              iconRight && "pr-10",
              error && "border-error focus:border-error focus:ring-error/20",
              className
            )}
            ref={ref}
            {...props}
          />
          {iconRight && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-foreground-tertiary">
              {iconRight}
            </div>
          )}
        </div>
        {error && (
          <p className="mt-1.5 text-sm text-error">{error}</p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";

export { Input };
export type { InputProps as InputComponentProps };