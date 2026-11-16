"use client";

import React, { useEffect, useRef, useState } from "react";

interface DrawLineProps {
  orientation?: "horizontal" | "vertical";
  className?: string;
  showCrosshairs?: boolean;
}

export function DrawLine({
  orientation = "horizontal",
  className = "",
}: DrawLineProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [drawn, setDrawn] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setDrawn(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setDrawn(true);
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.05 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  if (orientation === "horizontal") {
    return (
      <div ref={ref} className={`relative w-full flex items-center ${className}`}>
        <svg
          className="w-full h-[2px] overflow-visible"
          xmlns="http://www.w3.org/2000/svg"
        >
          <line
            x1="0"
            y1="1"
            x2="100%"
            y2="1"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeDasharray="1 5"
            className="text-stone-300 dark:text-stone-800 transition-all duration-1000"
            style={{
              strokeDashoffset: drawn ? "0" : "60",
            }}
          />
        </svg>
      </div>
    );
  }

  return (
    <div ref={ref} className={`relative h-full flex flex-col items-center ${className}`}>
      <svg
        className="h-full w-[2px] overflow-visible"
        xmlns="http://www.w3.org/2000/svg"
      >
        <line
          x1="1"
          y1="0"
          x2="1"
          y2="100%"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeDasharray="1 5"
          className="text-stone-300 dark:text-stone-800 transition-all duration-1000"
          style={{
            strokeDashoffset: drawn ? "0" : "60",
          }}
        />
      </svg>
    </div>
  );
}
