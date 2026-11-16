import React from "react";

export function PolicyViewerSketch() {
  return (
    <div className="w-full space-y-5 font-sans text-xs">
      {/* Top Header with Pill Badges */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-stone-500 dark:text-stone-400">
        <div className="flex items-center gap-2.5">
          <span className="size-2 rounded-full bg-blue-600 dark:bg-blue-400 animate-pulse" />
          <span className="font-semibold text-stone-900 dark:text-stone-100 text-sm">
            acme_infosec_handbook_v4.pdf
          </span>
          <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-stone-100 dark:bg-stone-800 font-mono">
            Rev 2026.04
          </span>
        </div>

        <div className="flex items-center gap-3 text-[11px] font-mono">
          <span className="text-blue-600 dark:text-blue-400 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/60 font-medium">
            18 Clauses Verified
          </span>
          <span className="text-stone-400">
            Grounding Score: 99.8%
          </span>
        </div>
      </div>

      {/* Symmetrical Two-Column View with Soft Rounded Surfaces, NO Harsh Dividing Lines */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Left Column: Raw Document Source Excerpt */}
        <div className="p-6 rounded-2xl bg-stone-100/60 dark:bg-stone-900/40 space-y-4">
          <div className="flex items-center justify-between text-stone-400 text-[11px]">
            <span className="uppercase tracking-wider font-mono text-[10px] px-2.5 py-1 rounded-full bg-white dark:bg-stone-800 text-stone-600 dark:text-stone-300 font-medium shadow-xs">
              Raw Source • Page 14 §3.2
            </span>
            <span className="font-mono text-[10px] text-green-600 dark:text-green-400 font-medium">OCR 100%</span>
          </div>

          <div className="space-y-3 font-sans leading-relaxed text-stone-600 dark:text-stone-300 text-xs sm:text-sm">
            <div className="text-stone-400 dark:text-stone-500 font-mono text-[11px]">
              Line 042 | Section 3.2 — Workstation Hardware Security Standards
            </div>

            {/* Target Highlight */}
            <div className="p-4 rounded-xl bg-blue-50/70 dark:bg-blue-950/40 border border-blue-200/60 dark:border-blue-800/60 relative">
              <span className="text-[10px] font-mono uppercase tracking-wider text-blue-600 dark:text-blue-400 font-bold px-2 py-0.5 rounded-full bg-white dark:bg-stone-900 inline-block mb-2 shadow-xs">
                [Extracted Target Clause]
              </span>
              <p className="text-stone-900 dark:text-stone-100 font-medium">
                &ldquo;All portable computing workstations provisioned to permanent personnel and third-party contractors must enforce hardware-level full disk encryption (AES-256) and an automatic screen lockout after a maximum of five (5) minutes of user inactivity.&rdquo;
              </p>
            </div>

            <div className="text-stone-400 dark:text-stone-500 font-mono text-[11px]">
              Line 044 | Unencrypted hardware triggers immediate network quarantine.
            </div>
          </div>

          <div className="pt-2 flex items-center justify-between text-[11px] text-stone-400">
            <span>Character span: 2,410 - 2,680</span>
            <span className="text-blue-600 dark:text-blue-400 font-medium">Source Anchored →</span>
          </div>
        </div>

        {/* Right Column: Structured Extracted Policy */}
        <div className="p-6 rounded-2xl bg-white dark:bg-stone-900 shadow-sm shadow-stone-200/50 dark:shadow-none space-y-4">
          <div className="flex items-center justify-between text-stone-400 text-[11px]">
            <span className="uppercase tracking-wider font-mono text-[10px] text-blue-600 dark:text-blue-400 font-bold px-2.5 py-1 rounded-full bg-blue-50 dark:bg-blue-950/60">
              Policy Rule #SEC-08
            </span>
            <span className="text-[10px] font-mono text-stone-600 dark:text-stone-300 px-2.5 py-1 rounded-full bg-stone-100 dark:bg-stone-800">
              Obligation: Mandatory
            </span>
          </div>

          <div className="space-y-3">
            <h4 className="text-lg sm:text-xl text-stone-900 dark:text-stone-100 font-bold leading-snug tracking-tight">
              Workstation Cryptographic Storage & Inactivity Lockout
            </h4>

            <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-300 leading-relaxed">
              Mandates full-disk AES-256 hardware encryption on all provisioned workstations and establishes an automated screen lock threshold of 300 seconds.
            </p>

            {/* Symmetrical Attribute Breakdown with Soft Rounded Pills */}
            <div className="grid grid-cols-2 gap-3 pt-2 text-xs">
              <div className="p-3.5 rounded-xl bg-stone-50 dark:bg-stone-800/60">
                <span className="text-[10px] uppercase text-stone-400 block font-mono">Scope</span>
                <span className="font-semibold text-stone-800 dark:text-stone-200 mt-0.5 block">
                  Staff & Contractors
                </span>
              </div>
              <div className="p-3.5 rounded-xl bg-stone-50 dark:bg-stone-800/60">
                <span className="text-[10px] uppercase text-stone-400 block font-mono">Timeout Trigger</span>
                <span className="font-semibold text-stone-800 dark:text-stone-200 mt-0.5 block">
                  300s Inactivity
                </span>
              </div>
            </div>
          </div>

          <div className="pt-2 flex items-center justify-between text-[11px] text-stone-400 font-mono">
            <span>Citation: Page 14, §3.2</span>
            <span className="text-stone-500">Category: IT Security</span>
          </div>
        </div>
      </div>
    </div>
  );
}
