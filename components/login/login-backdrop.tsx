"use client";

import React from "react";
import { motion } from "motion/react";

export function LoginBackdrop() {
  return (
    <div
      aria-hidden="true"
      className="absolute inset-0 pointer-events-none overflow-hidden select-none"
    >
      <motion.svg
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="w-full h-full opacity-35 dark:opacity-20 stroke-stone-300 dark:stroke-stone-700"
      >
        <line x1="0%" y1="25%" x2="100%" y2="25%" strokeDasharray="4 8" strokeWidth="1" />
        <line x1="0%" y1="75%" x2="100%" y2="75%" strokeDasharray="4 8" strokeWidth="1" />
        <line x1="20%" y1="0%" x2="20%" y2="100%" strokeDasharray="4 8" strokeWidth="1" />
        <line x1="80%" y1="0%" x2="80%" y2="100%" strokeDasharray="4 8" strokeWidth="1" />
      </motion.svg>

      {/* Subtle Corner / Intersection '+' Marks */}
      <span className="absolute top-1/4 left-[20%] -translate-x-1/2 -translate-y-1/2 text-xs font-mono text-stone-400 dark:text-stone-600 opacity-60">
        +
      </span>
      <span className="absolute top-1/4 left-[80%] -translate-x-1/2 -translate-y-1/2 text-xs font-mono text-stone-400 dark:text-stone-600 opacity-60">
        +
      </span>
      <span className="absolute top-3/4 left-[20%] -translate-x-1/2 -translate-y-1/2 text-xs font-mono text-stone-400 dark:text-stone-600 opacity-60">
        +
      </span>
      <span className="absolute top-3/4 left-[80%] -translate-x-1/2 -translate-y-1/2 text-xs font-mono text-stone-400 dark:text-stone-600 opacity-60">
        +
      </span>
    </div>
  );
}
