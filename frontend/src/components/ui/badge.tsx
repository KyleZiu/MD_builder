import * as React from "react";
import { cn } from "@/lib/utils";

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "secondary" | "outline" | "destructive" | "success" | "warning";
}

function Badge({ className, variant = "default", ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
        {
          "border-transparent bg-primary text-primary-foreground hover:bg-primary/80": variant === "default",
          "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80": variant === "secondary",
          "text-foreground": variant === "outline",
          "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80": variant === "destructive",
          "border-transparent bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300": variant === "success",
          "border-transparent bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300": variant === "warning",
        },
        className
      )}
      {...props}
    />
  );
}

export { Badge };
