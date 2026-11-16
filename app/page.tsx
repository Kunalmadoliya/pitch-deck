import React from "react";
import Link from "next/link";
import {
  DashedGrid,
  Region,
  DashedButton,
  PipelineFlow,
  PolicyViewerSketch,
} from "@/components/drafting";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#fbfbfa] dark:bg-[#0f0f10] font-sans selection:bg-blue-600/20 selection:text-blue-900 dark:selection:text-blue-100 transition-colors">
      <SiteHeader />

      <main className="relative flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-10 sm:py-16 space-y-10 sm:space-y-12">
        {/* SECTION 1: Symmetrical Hero Block (3 + 6 + 3 cols = 12 cols, Family.co Style) */}
        <section aria-label="Hero Introduction">
          <DashedGrid>
            {/* Left Flank: Precision Benchmarks */}
            <Region
              colSpan="col-span-12 lg:col-span-3 hidden lg:flex"
              delay={100}
            >
              <div className="space-y-6">
                <div className="flex items-center gap-2 text-stone-400 font-mono text-[10px] tracking-wider uppercase">
                  <span className="size-2 rounded-full bg-blue-600 dark:bg-blue-400" />
                  <span>Pipeline Telemetry</span>
                </div>

                <div className="space-y-6">
                  <div>
                    <div className="text-3xl sm:text-4xl text-stone-900 dark:text-stone-100 font-bold tracking-tight">
                      99.4%
                    </div>
                    <p className="text-xs text-stone-500 dark:text-stone-400 mt-1.5 leading-relaxed">
                      Clause extraction accuracy benchmark on multi-page enterprise agreements.
                    </p>
                  </div>

                  <div>
                    <div className="text-2xl sm:text-3xl text-stone-900 dark:text-stone-100 font-bold tracking-tight">
                      &lt; 1.2s
                    </div>
                    <p className="text-xs text-stone-500 dark:text-stone-400 mt-1.5 leading-relaxed">
                      Hybrid BM25 + dense vector retrieval across 10,000+ clauses.
                    </p>
                  </div>
                </div>
              </div>

              <div className="pt-4 text-[11px] font-mono text-blue-600 dark:text-blue-400 font-medium">
                Grounded RAG Protocol Active
              </div>
            </Region>

            {/* Center: The Main Value Proposition & Primary Pill CTA */}
            <Region
              colSpan="col-span-12 lg:col-span-6"
              delay={0}
              className="p-8 sm:p-12 text-center sm:text-left"
            >
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 font-mono text-[11px] mb-6 shadow-xs">
                  <span className="size-1.5 rounded-full bg-blue-600 dark:bg-blue-400 animate-pulse" />
                  <span>Company Policy Intelligence Engine</span>
                </div>

                <h1 className="text-3xl sm:text-4xl lg:text-5xl text-stone-900 dark:text-stone-100 font-bold tracking-tight leading-[1.15]">
                  Turn raw documents into clear, searchable policies.
                </h1>

                <p className="mt-4 text-sm sm:text-base text-stone-600 dark:text-stone-300 leading-relaxed max-w-xl">
                  Upload employee handbooks, vendor SLAs, and compliance manuals.
                  Our grounded RAG pipeline extracts structured obligations, operational rules,
                  and exact citations in seconds.
                </p>
              </div>

              <div className="mt-8 flex flex-col sm:flex-row items-center gap-4">
                <Link href="/login">
                  <DashedButton size="lg" variant="primary">
                    Get started
                    <span className="ml-1" aria-hidden="true">→</span>
                  </DashedButton>
                </Link>

                <span className="text-xs text-stone-500 dark:text-stone-400 font-mono">
                  Sign in with Google or GitHub • No credit card
                </span>
              </div>
            </Region>

            {/* Right Flank: Security & Governance */}
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
                      Every ingested document and vector embedding is strictly isolated per account.
                    </p>
                  </div>

                  <div>
                    <h3 className="text-base text-stone-900 dark:text-stone-100 font-semibold tracking-tight">
                      Zero Retention
                    </h3>
                    <p className="text-xs text-stone-500 dark:text-stone-400 mt-1.5 leading-relaxed">
                      Proprietary files are processed in-memory and never used to train public LLMs.
                    </p>
                  </div>
                </div>
              </div>

              <div className="pt-4 text-[11px] font-mono text-stone-400">
                SOC-2 Ready Architecture
              </div>
            </Region>
          </DashedGrid>
        </section>

        {/* SECTION 2: The Advanced RAG Pipeline (Hero Interactive Visualizer) */}
        <section aria-label="RAG Architecture Flow">
          <DashedGrid>
            <Region colSpan="col-span-12" delay={200} className="p-7 sm:p-10">
              <PipelineFlow />
            </Region>
          </DashedGrid>
        </section>

        {/* SECTION 3: How It Works Flow (4 Mirrored Steps: 3 + 3 + 3 + 3 cols = 12 cols) */}
        <section aria-label="How it works">
          <div className="flex items-center justify-between mb-4 px-1">
            <div className="flex items-center gap-2 text-stone-500 text-xs font-mono">
              <span className="size-1.5 rounded-full bg-blue-600 dark:bg-blue-400" />
              <span className="uppercase tracking-wider">The Extraction Workflow</span>
            </div>
            <span className="font-mono text-xs text-stone-400">4 Connected Steps</span>
          </div>

          <DashedGrid>
            {/* Step 1 */}
            <Region
              colSpan="col-span-12 sm:col-span-6 lg:col-span-3"
              delay={50}
              className="group hover:-translate-y-1 hover:shadow-sm"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-2xl text-blue-600 dark:text-blue-400 font-bold font-mono">
                    01
                  </span>
                  <span className="font-mono text-[10px] px-2.5 py-0.5 rounded-full bg-stone-100 dark:bg-stone-800 text-stone-500">
                    Step 1
                  </span>
                </div>
                <h3 className="text-base text-stone-900 dark:text-stone-100 font-semibold tracking-tight">
                  Sign in
                </h3>
                <p className="mt-2 text-xs text-stone-600 dark:text-stone-400 leading-relaxed">
                  Authenticate securely using Google or GitHub corporate identity through Better Auth SSO.
                </p>
              </div>
              <div className="mt-6 font-mono text-[10px] text-stone-400 flex items-center justify-between">
                <span>OAuth 2.0 PKCE</span>
                <span className="text-blue-600 dark:text-blue-400 font-bold">→</span>
              </div>
            </Region>

            {/* Step 2 */}
            <Region
              colSpan="col-span-12 sm:col-span-6 lg:col-span-3"
              delay={100}
              className="group hover:-translate-y-1 hover:shadow-sm"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-2xl text-blue-600 dark:text-blue-400 font-bold font-mono">
                    02
                  </span>
                  <span className="font-mono text-[10px] px-2.5 py-0.5 rounded-full bg-stone-100 dark:bg-stone-800 text-stone-500">
                    Step 2
                  </span>
                </div>
                <h3 className="text-base text-stone-900 dark:text-stone-100 font-semibold tracking-tight">
                  Upload documents
                </h3>
                <p className="mt-2 text-xs text-stone-600 dark:text-stone-400 leading-relaxed">
                  Drop PDF employee handbooks, vendor contracts, IT security protocols, or SLAs.
                </p>
              </div>
              <div className="mt-6 font-mono text-[10px] text-stone-400 flex items-center justify-between">
                <span>Lossless Ingestion</span>
                <span className="text-blue-600 dark:text-blue-400 font-bold">→</span>
              </div>
            </Region>

            {/* Step 3 */}
            <Region
              colSpan="col-span-12 sm:col-span-6 lg:col-span-3"
              delay={150}
              className="group hover:-translate-y-1 hover:shadow-sm"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-2xl text-blue-600 dark:text-blue-400 font-bold font-mono">
                    03
                  </span>
                  <span className="font-mono text-[10px] px-2.5 py-0.5 rounded-full bg-stone-100 dark:bg-stone-800 text-stone-500">
                    Step 3
                  </span>
                </div>
                <h3 className="text-base text-stone-900 dark:text-stone-100 font-semibold tracking-tight">
                  AI extracts policies
                </h3>
                <p className="mt-2 text-xs text-stone-600 dark:text-stone-400 leading-relaxed">
                  Our neural parser identifies discrete obligations, exceptions, scope, and compliance severity.
                </p>
              </div>
              <div className="mt-6 font-mono text-[10px] text-stone-400 flex items-center justify-between">
                <span>Grounded RAG</span>
                <span className="text-blue-600 dark:text-blue-400 font-bold">→</span>
              </div>
            </Region>

            {/* Step 4 */}
            <Region
              colSpan="col-span-12 sm:col-span-6 lg:col-span-3"
              delay={200}
              className="group hover:-translate-y-1 hover:shadow-sm"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-2xl text-blue-600 dark:text-blue-400 font-bold font-mono">
                    04
                  </span>
                  <span className="font-mono text-[10px] px-2.5 py-0.5 rounded-full bg-stone-100 dark:bg-stone-800 text-stone-500">
                    Step 4
                  </span>
                </div>
                <h3 className="text-base text-stone-900 dark:text-stone-100 font-semibold tracking-tight">
                  Browse & search
                </h3>
                <p className="mt-2 text-xs text-stone-600 dark:text-stone-400 leading-relaxed">
                  Perform natural language queries backed by verifiable page and line citations.
                </p>
              </div>
              <div className="mt-6 font-mono text-[10px] text-stone-400 flex items-center justify-between">
                <span>Source Grounding</span>
                <span className="text-blue-600 dark:text-blue-400 font-bold">✓</span>
              </div>
            </Region>
          </DashedGrid>
        </section>

        {/* SECTION 4: What It Looks Like (Rounded Inspection Preview) */}
        <section aria-label="Product Inspection Mock">
          <DashedGrid>
            <Region colSpan="col-span-12" delay={100} className="p-7 sm:p-10">
              <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-6">
                <div>
                  <span className="font-mono text-[11px] uppercase tracking-wider text-blue-600 dark:text-blue-400 font-semibold px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/40 inline-block mb-2">
                    Live Interface Preview
                  </span>
                  <h2 className="text-2xl sm:text-3xl text-stone-900 dark:text-stone-100 font-semibold tracking-tight">
                    Side-by-side policy verification in plain view.
                  </h2>
                </div>
                <p className="text-xs text-stone-500 dark:text-stone-400 max-w-sm sm:text-right leading-relaxed">
                  Compare the extracted rule directly against the original paragraph without leaving context.
                </p>
              </div>

              <PolicyViewerSketch />
            </Region>
          </DashedGrid>
        </section>

        {/* SECTION 5: What It Does (4 Core Features, 6 + 6 cols in 2 rows) */}
        <section aria-label="Capabilities">
          <div className="flex items-center justify-between mb-4 px-1">
            <div className="flex items-center gap-2 text-stone-500 text-xs font-mono">
              <span className="size-1.5 rounded-full bg-blue-600 dark:bg-blue-400" />
              <span className="uppercase tracking-wider">Technical Specifications</span>
            </div>
            <span className="font-mono text-xs text-stone-400">Core Capabilities</span>
          </div>

          <DashedGrid>
            {/* Feature 1 */}
            <Region
              colSpan="col-span-12 md:col-span-6"
              delay={50}
              className="p-7 sm:p-8"
            >
              <div className="space-y-3">
                <div className="text-blue-600 dark:text-blue-400 font-bold font-mono text-sm">01.</div>
                <h3 className="text-lg sm:text-xl text-stone-900 dark:text-stone-100 font-semibold tracking-tight">
                  Automated Policy Extraction
                </h3>
                <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-400 leading-relaxed">
                  Digests dense legal prose and HR regulations into discrete, actionable policy nodes.
                  Extracts compliance mandates, exception criteria, and penalty thresholds automatically.
                </p>
                <div className="pt-2 flex items-center gap-2 font-mono text-[11px] text-stone-400">
                  <span className="px-2.5 py-0.5 rounded-full bg-stone-100 dark:bg-stone-800">
                    Structure Parser
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full bg-stone-100 dark:bg-stone-800">
                    JSON Schema Validated
                  </span>
                </div>
              </div>
            </Region>

            {/* Feature 2 */}
            <Region
              colSpan="col-span-12 md:col-span-6"
              delay={100}
              className="p-7 sm:p-8"
            >
              <div className="space-y-3">
                <div className="text-blue-600 dark:text-blue-400 font-bold font-mono text-sm">02.</div>
                <h3 className="text-lg sm:text-xl text-stone-900 dark:text-stone-100 font-semibold tracking-tight">
                  Searchable Policies
                </h3>
                <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-400 leading-relaxed">
                  Execute natural-language semantic queries across your organization&apos;s full library.
                  Retrieve answers on bereavement leave, travel stipends, or IP assignment in milliseconds.
                </p>
                <div className="pt-2 flex items-center gap-2 font-mono text-[11px] text-stone-400">
                  <span className="px-2.5 py-0.5 rounded-full bg-stone-100 dark:bg-stone-800">
                    Dense Semantic RAG
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full bg-stone-100 dark:bg-stone-800">
                    Sub-second retrieval
                  </span>
                </div>
              </div>
            </Region>

            {/* Feature 3 */}
            <Region
              colSpan="col-span-12 md:col-span-6"
              delay={150}
              className="p-7 sm:p-8"
            >
              <div className="space-y-3">
                <div className="text-blue-600 dark:text-blue-400 font-bold font-mono text-sm">03.</div>
                <h3 className="text-lg sm:text-xl text-stone-900 dark:text-stone-100 font-semibold tracking-tight">
                  Source Traceability
                </h3>
                <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-400 leading-relaxed">
                  Eliminate hallucination risks. Every policy assertion contains an exact bi-directional
                  anchor to the specific document page, paragraph, and line index for audit-ready compliance.
                </p>
                <div className="pt-2 flex items-center gap-2 font-mono text-[11px] text-stone-400">
                  <span className="px-2.5 py-0.5 rounded-full bg-stone-100 dark:bg-stone-800">
                    Exact Line & Page Citations
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full bg-stone-100 dark:bg-stone-800">
                    Audit Verification
                  </span>
                </div>
              </div>
            </Region>

            {/* Feature 4 */}
            <Region
              colSpan="col-span-12 md:col-span-6"
              delay={200}
              className="p-7 sm:p-8"
            >
              <div className="space-y-3">
                <div className="text-blue-600 dark:text-blue-400 font-bold font-mono text-sm">04.</div>
                <h3 className="text-lg sm:text-xl text-stone-900 dark:text-stone-100 font-semibold tracking-tight">
                  Secure Access
                </h3>
                <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-400 leading-relaxed">
                  Cryptographic namespace isolation per company tenant. All embeddings, original files,
                  and generated policy graphs are governed by strict identity authorization.
                </p>
                <div className="pt-2 flex items-center gap-2 font-mono text-[11px] text-stone-400">
                  <span className="px-2.5 py-0.5 rounded-full bg-stone-100 dark:bg-stone-800">
                    AES-256 Storage
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full bg-stone-100 dark:bg-stone-800">
                    Tenant Sealed
                  </span>
                </div>
              </div>
            </Region>
          </DashedGrid>
        </section>

        {/* SECTION 6: Trust & Final Call to Action (6 + 6 cols = 12 cols, Symmetrical) */}
        <section aria-label="Security and call to action">
          <DashedGrid>
            {/* Trust Region */}
            <Region
              colSpan="col-span-12 lg:col-span-6"
              delay={50}
              className="p-8 sm:p-10 flex flex-col justify-between"
            >
              <div>
                <span className="font-mono text-[11px] uppercase tracking-wider text-blue-600 dark:text-blue-400 font-semibold px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/40 inline-block mb-3">
                  Enterprise Security
                </span>
                <h3 className="text-2xl sm:text-3xl text-stone-900 dark:text-stone-100 font-semibold tracking-tight">
                  Corporate authentication with zero data leakage.
                </h3>
                <p className="mt-3 text-xs sm:text-sm text-stone-600 dark:text-stone-400 leading-relaxed">
                  Sign in through Google Workspace or GitHub Enterprise SSO. Your confidential
                  documents remain strictly isolated to your verified identity.
                </p>

                <div className="mt-6 grid grid-cols-2 gap-3 text-xs font-mono text-stone-600 dark:text-stone-400">
                  <div className="flex items-center gap-2">
                    <span className="text-blue-600 dark:text-blue-400 font-bold">✓</span>
                    <span>Google & GitHub SSO</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-blue-600 dark:text-blue-400 font-bold">✓</span>
                    <span>Tenant Partitioned</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-blue-600 dark:text-blue-400 font-bold">✓</span>
                    <span>No Public AI Training</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-blue-600 dark:text-blue-400 font-bold">✓</span>
                    <span>AES-256 Storage</span>
                  </div>
                </div>
              </div>

              <div className="pt-6 font-mono text-[10px] text-stone-400">
                Better Auth SSO Protocol • Session Sealed
              </div>
            </Region>

            {/* Final CTA Region */}
            <Region
              colSpan="col-span-12 lg:col-span-6"
              delay={100}
              accent
              className="p-8 sm:p-10 flex flex-col justify-between"
            >
              <div>
                <span className="font-mono text-[11px] uppercase tracking-wider text-blue-600 dark:text-blue-400 font-semibold px-3 py-1 rounded-full bg-blue-100/60 dark:bg-blue-900/40 inline-block mb-3">
                  Deploy Knowledge Base
                </span>
                <h3 className="text-2xl sm:text-3xl text-stone-900 dark:text-stone-100 font-semibold tracking-tight">
                  Ready to index your first company policy?
                </h3>
                <p className="mt-3 text-xs sm:text-sm text-stone-600 dark:text-stone-400 leading-relaxed">
                  Authenticate now with your corporate account and see how quickly your raw manuals
                  become structured, queryable knowledge.
                </p>
              </div>

              <div className="mt-8 flex flex-col sm:flex-row items-center gap-4">
                <Link href="/login">
                  <DashedButton size="lg" variant="primary">
                    Get started
                    <span className="ml-1" aria-hidden="true">→</span>
                  </DashedButton>
                </Link>
                <span className="text-xs text-stone-500 dark:text-stone-400 font-mono">
                  Instant access • No setup required
                </span>
              </div>
            </Region>
          </DashedGrid>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
