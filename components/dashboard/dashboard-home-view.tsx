"use client";

import React from "react";
import Link from "next/link";
import { useDocuments } from "@/hooks/use-documents";
import { ProductTile } from "@/components/dashboard/product-tile";
import { RecentDocumentsList } from "@/components/dashboard/recent-documents-list";

interface DashboardHomeViewProps {
  userName?: string | null;
}

export function DashboardHomeView({ userName }: DashboardHomeViewProps) {
  const { data: documents } = useDocuments();

  const firstName = userName ? userName.split(" ")[0] : "there";

  const total = documents?.length ?? 0;
  const indexed = documents?.filter((d) => d.status === "INDEXED").length ?? 0;
  const processing = documents?.filter((d) => d.status === "PROCESSING" || d.status === "UPLOADED").length ?? 0;

  const statsText =
    total > 0
      ? `${total} documents · ${indexed} indexed · ${processing} processing`
      : "No documents indexed yet";

  const tileStats =
    total > 0
      ? `${indexed} indexed · ${processing} processing`
      : "Ready for first upload";

  return (
    <div className="space-y-10 sm:space-y-12">
      {/* Friendly Large Headline & Inline Stats */}
      <section aria-label="Dashboard Overview" className="space-y-2">
        <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-stone-900 dark:text-stone-100 leading-tight">
            Welcome back, {firstName}.
          </h1>
          <Link
            href="/dashboard/rag/chat"
            className="text-xs font-medium text-blue-600 dark:text-blue-400 hover:underline inline-flex items-center gap-1 shrink-0"
          >
            Ask your policies <span aria-hidden="true">→</span>
          </Link>
        </div>
        <p className="text-xs sm:text-sm font-mono text-stone-500 dark:text-stone-400">
          {statsText}
        </p>
      </section>

      {/* Exactly TWO Product Tiles (Family.co style) */}
      <section aria-label="Corporate Suite Products" className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
        <ProductTile
          title="Document RAG"
          description="Ingest company policies, employee handbooks, and SLAs into an isolated semantic knowledge graph with clause-level citations."
          stats={tileStats}
          badge="Active Core"
          href="/dashboard/rag"
          ctaText="Open RAG workspace"
        />

        <ProductTile
          title="AI Pitch Deck"
          description="Describe a project idea and get a 7-slide investor deck: problem, solution, market, product, business model and the ask."
          badge="New"
          href="/dashboard/decks"
          ctaText="Open pitch decks"
        />
      </section>

      {/* Recent Documents Plain List */}
      <section aria-label="Recent Policies">
        <RecentDocumentsList />
      </section>
    </div>
  );
}
