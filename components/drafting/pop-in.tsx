"use client";

import React, { useEffect, useRef, useState } from "react";

interface PopInProps {
  children: React.ReactNode;
  className?: string;
  delay?: number; // milliseconds
}

export function PopIn({ children, className = "", delay = 0 }: PopInProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // Check if user prefers reduced motion
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setIsVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.1, rootMargin: "0px 0px -40px 0px" }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      style={{
        animationDelay: `${delay}ms`,
      }}
      className={`${className} ${
        isVisible ? "animate-pop-in" : "opacity-0"
      } transition-transform`}
    >
      {children}
    </div>
  );
}
