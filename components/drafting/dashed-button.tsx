"use client";

import React from "react";

interface DashedButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
}

export function DashedButton({
  children,
  variant = "primary",
  size = "md",
  loading = false,
  className = "",
  disabled,
  ...props
}: DashedButtonProps) {
  const baseClasses =
    "inline-flex items-center justify-center font-sans font-medium transition-all duration-200 select-none cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 active:scale-[0.97] disabled:opacity-50 disabled:pointer-events-none rounded-full";

  const sizeClasses = {
    sm: "text-xs px-4 py-1.5 gap-1.5",
    md: "text-sm px-5 py-2.5 gap-2",
    lg: "text-sm sm:text-base px-7 py-3 gap-2.5",
  }[size];

  const variantClasses = {
    primary:
      "bg-blue-600 dark:bg-blue-600 text-white hover:bg-blue-700 dark:hover:bg-blue-500 shadow-sm hover:shadow-blue-500/20 hover:shadow-md",
    outline:
      "border border-dotted border-stone-300 dark:border-stone-700 hover:border-blue-600 dark:hover:border-blue-400 text-stone-800 dark:text-stone-200 hover:text-blue-600 dark:hover:text-blue-400 bg-white/40 dark:bg-stone-900/40 backdrop-blur-xs",
    ghost:
      "text-stone-700 dark:text-stone-300 hover:text-blue-600 dark:hover:text-blue-400 bg-transparent hover:bg-stone-100/50 dark:hover:bg-stone-800/40",
  }[variant];

  return (
    <button
      className={`${baseClasses} ${sizeClasses} ${variantClasses} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <svg
          className="animate-spin -ml-0.5 size-4"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="3"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      )}
      {children}
    </button>
  );
}
