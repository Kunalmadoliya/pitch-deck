import React from "react";
import Link from "next/link";

interface ProductTileProps {
  title: string;
  description: string;
  stats?: string;
  badge?: string;
  href?: string;
  ctaText?: string;
  disabled?: boolean;
}

export function ProductTile({
  title,
  description,
  stats,
  badge,
  href,
  ctaText = "Open workspace",
  disabled = false,
}: ProductTileProps) {
  const content = (
    <div
      className={`relative h-full flex flex-col justify-between p-7 sm:p-8 rounded-3xl border border-dotted transition-all duration-200 ${
        disabled
          ? "border-stone-300/60 dark:border-stone-800/80 bg-stone-100/30 dark:bg-stone-900/20 opacity-70 cursor-not-allowed"
          : "border-stone-300 dark:border-stone-800 bg-white/80 dark:bg-stone-900/50 hover:border-blue-500/70 dark:hover:border-blue-400/60 hover:-translate-y-0.5 shadow-xs"
      }`}
    >
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-xs font-mono uppercase tracking-wider text-stone-400 dark:text-stone-500">
            Suite Product
          </span>
          {badge && (
            <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-stone-100 dark:bg-stone-800 text-stone-500 dark:text-stone-400">
              {badge}
            </span>
          )}
        </div>

        <div>
          <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-stone-900 dark:text-stone-100">
            {title}
          </h3>
          <p className="mt-2 text-xs sm:text-sm text-stone-600 dark:text-stone-400 leading-relaxed">
            {description}
          </p>
        </div>
      </div>

      <div className="pt-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {stats ? (
          <span className="text-xs font-mono text-blue-600 dark:text-blue-400 font-medium">
            {stats}
          </span>
        ) : (
          <span className="text-xs font-mono text-stone-400">Roadmap Phase 2</span>
        )}

        {disabled ? (
          <span className="inline-flex items-center justify-center text-xs font-medium text-stone-400 px-5 py-2 rounded-full border border-dotted border-stone-200 dark:border-stone-800 select-none">
            In development
          </span>
        ) : (
          <span className="inline-flex items-center justify-center text-xs font-medium text-stone-900 dark:text-stone-100 group-hover:text-blue-600 px-5 py-2 rounded-full bg-stone-100 dark:bg-stone-800 hover:bg-blue-600 hover:text-white dark:hover:bg-blue-500 transition-colors">
            {ctaText} <span className="ml-1" aria-hidden="true">→</span>
          </span>
        )}
      </div>
    </div>
  );

  if (disabled || !href) {
    return <div className="group">{content}</div>;
  }

  return (
    <Link href={href} className="group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 rounded-3xl block h-full">
      {content}
    </Link>
  );
}
