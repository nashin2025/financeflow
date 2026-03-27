import * as React from "react";
import { cn } from "@/lib/utils";
import { ChevronDown } from "lucide-react";

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: { value: string; label: string }[];
}

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, error, options, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-foreground-secondary mb-2">
            {label}
          </label>
        )}
        <div className="relative">
          <select
            ref={ref}
            className={cn(
              "flex h-12 w-full appearance-none rounded-xl bg-white/5 border border-white/10 px-4 py-2 pr-10 text-sm text-foreground focus:outline-none focus:border-primary-start focus:ring-2 focus:ring-primary-start/20 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200",
              error && "border-error focus:border-error focus:ring-error/20",
              className
            )}
            {...props}
          >
            {options.map((option) => (
              <option key={option.value} value={option.value} className="bg-background-secondary">
                {option.label}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-foreground-tertiary pointer-events-none" />
        </div>
        {error && (
          <p className="mt-1.5 text-sm text-error">{error}</p>
        )}
      </div>
    );
  }
);

Select.displayName = "Select";

export { Select };
export type { SelectProps };