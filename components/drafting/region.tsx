import React from "react";
import { PopIn } from "./pop-in";

interface RegionProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  colSpan?: string;
  delay?: number;
  showIntersectionMarks?: boolean;
  borderRight?: boolean;
  borderBottom?: boolean;
  borderLeft?: boolean;
  borderTop?: boolean;
  accent?: boolean;
}

export function Region({
  children,
  className = "",
  colSpan = "col-span-12",
  delay = 0,
  accent = false,
  ...props
}: RegionProps) {
  return (
    <div
      className={`relative rounded-3xl border border-dotted transition-all duration-300 p-7 sm:p-8 lg:p-9 flex flex-col justify-between ${
        accent
          ? "border-blue-400/60 dark:border-blue-800/80 bg-blue-50/40 dark:bg-blue-950/20"
          : "border-stone-300/80 dark:border-stone-800/90 bg-white/60 dark:bg-stone-900/30 hover:border-stone-400/80 dark:hover:border-stone-700/80"
      } backdrop-blur-xs ${colSpan} ${className}`}
      {...props}
    >
      <PopIn delay={delay} className="h-full flex flex-col justify-between">
        {children}
      </PopIn>
    </div>
  );
}
