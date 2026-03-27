import * as React from "react";
import { cn } from "@/lib/utils";

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "circular" | "text";
}

function Skeleton({ className, variant = "default", ...props }: SkeletonProps) {
  const variants = {
    default: "rounded-lg",
    circular: "rounded-full",
    text: "rounded h-4",
  };

  return (
    <div
      className={cn("skeleton", variants[variant], className)}
      {...props}
    />
  );
}

function SkeletonCard({ className }: { className?: string }) {
  return (
    <div className={cn("glass rounded-2xl p-6 space-y-4", className)}>
      <div className="flex items-center space-x-4">
        <Skeleton variant="circular" className="h-12 w-12" />
        <div className="space-y-2 flex-1">
          <Skeleton variant="text" className="w-1/3" />
          <Skeleton variant="text" className="w-1/2" />
        </div>
      </div>
      <Skeleton className="h-8 w-1/4" />
      <Skeleton className="h-4 w-full" />
    </div>
  );
}

function SkeletonTransaction({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center space-x-4 py-4", className)}>
      <Skeleton variant="circular" className="h-10 w-10" />
      <div className="space-y-2 flex-1">
        <Skeleton variant="text" className="w-1/3" />
        <Skeleton variant="text" className="w-1/4" />
      </div>
      <Skeleton variant="text" className="w-20" />
    </div>
  );
}

export { Skeleton, SkeletonCard, SkeletonTransaction };
export type { SkeletonProps };