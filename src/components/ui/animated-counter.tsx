"use client";

import * as React from "react";
import { formatCurrency } from "@/lib/utils";

interface AnimatedCounterProps {
  value: number;
  duration?: number;
  currency?: string;
  className?: string;
}

export function AnimatedCounter({ value, duration = 1000, currency = "MVR", className = "" }: AnimatedCounterProps) {
  const [displayValue, setDisplayValue] = React.useState(0);
  const frameRef = React.useRef<number>(0);
  const startTimeRef = React.useRef<number>(0);
  const startValueRef = React.useRef(0);

  React.useEffect(() => {
    startValueRef.current = displayValue;
    startTimeRef.current = performance.now();

    function animate(currentTime: number) {
      const elapsed = currentTime - startTimeRef.current;
      const progress = Math.min(elapsed / duration, 1);

      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = startValueRef.current + (value - startValueRef.current) * eased;

      setDisplayValue(current);

      if (progress < 1) {
        frameRef.current = requestAnimationFrame(animate);
      }
    }

    frameRef.current = requestAnimationFrame(animate);

    return () => {
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
      }
    };
  }, [value, duration]);

  return (
    <span className={className}>
      {formatCurrency(displayValue, currency)}
    </span>
  );
}
