"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ThemeToggle } from "@/components/theme-toggle";

interface MobileNavProps {
  user: {
    name?: string | null;
    email?: string | null;
  };
  navLinks: {
    label: string;
    href: string;
    active: boolean;
  }[];
  onSignOut: () => void;
  signingOut: boolean;
}

export function MobileNav({ user, navLinks, onSignOut, signingOut }: MobileNavProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <>
      <div className="lg:hidden border-b border-dotted border-stone-300 dark:border-stone-800 bg-[#fbfbfa]/90 dark:bg-[#0f0f10]/90 backdrop-blur-md sticky top-0 z-40 px-4 h-16 flex items-center justify-between">
        <Link href="/dashboard" className="flex items-center gap-2.5">
          <div className="size-7 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs">
            P
          </div>
          <span className="font-semibold text-base tracking-tight text-stone-900 dark:text-stone-100">
            PolicyExtract
          </span>
        </Link>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-full border border-dotted border-stone-300 dark:border-stone-700 text-stone-700 dark:text-stone-300"
            aria-label="Toggle navigation menu"
          >
            <svg className="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              {mobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="lg:hidden border-b border-dotted border-stone-300 dark:border-stone-800 bg-[#fbfbfa] dark:bg-[#0f0f10] p-4 space-y-3 animate-pop-in">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMobileMenuOpen(false)}
              className={`block px-4 py-2.5 rounded-full text-sm font-medium transition-all ${
                link.active
                  ? "bg-stone-200/60 dark:bg-stone-800 text-stone-950 dark:text-stone-50 font-semibold"
                  : "text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100"
              }`}
            >
              {link.label}
            </Link>
          ))}

          <div className="pt-3 border-t border-dotted border-stone-200 dark:border-stone-800 flex items-center justify-between">
            <span className="text-xs text-stone-500 truncate max-w-[180px]">{user.email}</span>
            <button
              type="button"
              onClick={onSignOut}
              disabled={signingOut}
              className="text-xs text-red-600 dark:text-red-400 font-medium px-3 py-1 rounded-full border border-dotted border-red-200 dark:border-red-900"
            >
              Sign out
            </button>
          </div>
        </div>
      )}
    </>
  );
}
