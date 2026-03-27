"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { ChevronDown, Check } from "lucide-react";

interface DropdownOption {
  value: string;
  label: string;
  icon?: React.ReactNode;
}

interface DropdownProps {
  label?: string;
  error?: string;
  options: DropdownOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export function Dropdown({
  label,
  error,
  options,
  value,
  onChange,
  placeholder = "Select...",
  className
}: DropdownProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const dropdownRef = React.useRef<HTMLDivElement>(null);

  const selectedOption = options.find(opt => opt.value === value);

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className={cn("w-full", className)} ref={dropdownRef}>
      {label && (
        <label className="block text-sm font-medium text-foreground-secondary mb-2">
          {label}
        </label>
      )}
      <div className="relative">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className={cn(
            "flex h-12 w-full items-center justify-between rounded-xl bg-white/5 border border-white/10 px-4 py-2 text-sm text-left transition-all duration-200",
            "focus:outline-none focus:border-primary-start focus:ring-2 focus:ring-primary-start/20",
            error && "border-error focus:border-error focus:ring-error/20",
            isOpen && "border-primary-start ring-2 ring-primary-start/20"
          )}
        >
          <span className={selectedOption ? "text-foreground" : "text-foreground-tertiary"}>
            {selectedOption ? (
              <span className="flex items-center gap-2">
                {selectedOption.icon}
                {selectedOption.label}
              </span>
            ) : (
              placeholder
            )}
          </span>
          <ChevronDown className={cn(
            "h-4 w-4 text-foreground-tertiary transition-transform duration-200",
            isOpen && "rotate-180"
          )} />
        </button>

        {isOpen && (
          <div className="absolute z-50 w-full mt-2 py-2 rounded-xl bg-background-elevated border border-white/10 shadow-lg shadow-black/20 overflow-hidden animate-fadeIn">
            <div className="max-h-60 overflow-y-auto">
              {options.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => {
                    onChange(option.value);
                    setIsOpen(false);
                  }}
                  className={cn(
                    "flex items-center justify-between w-full px-4 py-3 text-sm text-left transition-colors",
                    option.value === value
                      ? "bg-primary-start/10 text-primary-start"
                      : "text-foreground hover:bg-white/5"
                  )}
                >
                  <span className="flex items-center gap-2">
                    {option.icon}
                    {option.label}
                  </span>
                  {option.value === value && (
                    <Check className="h-4 w-4 text-primary-start" />
                  )}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
      {error && (
        <p className="mt-1.5 text-sm text-error">{error}</p>
      )}
    </div>
  );
}

export type { DropdownProps, DropdownOption };