import React from "react";
import Link from "next/link";
import { DashedGrid, Region } from "@/components/drafting";
import { LoginForm } from "./login-form";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";

export default function LoginPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#fbfbfa] dark:bg-[#0f0f10] font-sans selection:bg-blue-600/20 selection:text-blue-900 dark:selection:text-blue-100 transition-colors">
      <SiteHeader />

      <main className="relative flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-12 sm:py-20 flex flex-col justify-center">
        {/* Navigation Breadcrumb */}
        <div className="mb-6 flex items-center gap-2 text-xs font-mono text-stone-500">
          <Link
            href="/"
            className="hover:text-blue-600 dark:hover:text-blue-400 px-3 py-1 rounded-full bg-stone-100/70 dark:bg-stone-800/70 transition-colors"
          >
            ← Overview
          </Link>
          <span className="text-stone-300 dark:text-stone-700 select-none">•</span>
          <span className="text-stone-400">Identity Authentication</span>
        </div>

        {/* Symmetrical Bento Module (3 + 6 + 3 cols = 12 cols, Family.co Style) */}
        <section aria-label="Sign-in module">
          <DashedGrid>
            {/* Left Flank: What You Get */}
            <Region
              colSpan="col-span-12 lg:col-span-3 hidden lg:flex"
              delay={100}
            >
              <div className="space-y-6">
                <div className="flex items-center gap-2 text-stone-400 font-mono text-[10px] tracking-wider uppercase">
                  <span className="size-2 rounded-full bg-blue-600 dark:bg-blue-400" />
                  <span>Platform Scope</span>
                </div>

                <div className="space-y-6">
                  <div>
                    <h3 className="text-base text-stone-900 dark:text-stone-100 font-semibold tracking-tight">
                      Automated Extraction
                    </h3>
                    <p className="text-xs text-stone-500 dark:text-stone-400 mt-1.5 leading-relaxed">
                      Upload raw PDF handbooks and extract structured obligation schemas with 99.4% precision.
                    </p>
                  </div>

                  <div>
                    <h3 className="text-base text-stone-900 dark:text-stone-100 font-semibold tracking-tight">
                      Citation Anchoring
                    </h3>
                    <p className="text-xs text-stone-500 dark:text-stone-400 mt-1.5 leading-relaxed">
                      Every policy rule is linked directly back to its source document page, section, and line.
                    </p>
                  </div>
                </div>
              </div>

              <div className="pt-6 text-[11px] font-mono text-blue-600 dark:text-blue-400 font-medium">
                Ready for RAG Querying
              </div>
            </Region>

            {/* Center: The Main Sign-In Region (Clean Family.co Style) */}
            <Region
              colSpan="col-span-12 lg:col-span-6"
              delay={0}
              className="p-8 sm:p-12"
            >
              <div>
                <div className="mb-8 text-center sm:text-left">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 font-mono text-[11px] mb-3">
                    <span className="size-1.5 rounded-full bg-blue-600 dark:bg-blue-400 animate-pulse" />
                    <span>SSO Verification</span>
                  </div>

                  <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-stone-900 dark:text-stone-100">
                    Sign in to PolicyExtract
                  </h1>

                  <p className="mt-2 text-xs sm:text-sm text-stone-600 dark:text-stone-400 leading-relaxed">
                    Authenticate using your corporate Google or GitHub account to view extracted policies and access the RAG pipeline.
                  </p>
                </div>

                {/* Interactive Client Form */}
                <LoginForm />
              </div>

              <div className="mt-8 flex items-center justify-between text-[11px] font-mono text-stone-400">
                <span>PKCE Enhanced</span>
                <span>Session Partitioned</span>
              </div>
            </Region>

            {/* Right Flank: How Data is Protected */}
            <Region
              colSpan="col-span-12 lg:col-span-3 hidden lg:flex"
              delay={150}
            >
              <div className="space-y-6">
                <div className="flex items-center gap-2 text-stone-400 font-mono text-[10px] tracking-wider uppercase">
                  <span className="size-2 rounded-full bg-green-500" />
                  <span>Data Protection</span>
                </div>

                <div className="space-y-6">
                  <div>
                    <h3 className="text-base text-stone-900 dark:text-stone-100 font-semibold tracking-tight">
                      Tenant Isolation
                    </h3>
                    <p className="text-xs text-stone-500 dark:text-stone-400 mt-1.5 leading-relaxed">
                      All uploaded handbooks and vector embeddings are cryptographically sealed to your tenant.
                    </p>
                  </div>

                  <div>
                    <h3 className="text-base text-stone-900 dark:text-stone-100 font-semibold tracking-tight">
                      Zero Retention
                    </h3>
                    <p className="text-xs text-stone-500 dark:text-stone-400 mt-1.5 leading-relaxed">
                      Company files are processed in-memory and never used to train public foundation models.
                    </p>
                  </div>
                </div>
              </div>

              <div className="pt-6 text-[11px] font-mono text-stone-400">
                AES-256 Storage
              </div>
            </Region>
          </DashedGrid>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
