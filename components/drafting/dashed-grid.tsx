import React from "react";

interface DashedGridProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  withOuterBorder?: boolean;
}

export function DashedGrid({
  children,
  className = "",
  // withOuterBorder kept for backwards compatibility but rendered cleanly without clutter
  withOuterBorder = false,
  ...props
}: DashedGridProps) {
  return (
    <div
      className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-4 sm:gap-5 ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
