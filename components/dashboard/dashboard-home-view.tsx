"use client";

import React from "react";
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
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-stone-900 dark:text-stone-100 leading-tight">
          Welcome back, {firstName}.
        </h1>
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
          description="Autonomous investor slide builder that transforms product memos, financials, and market data into presentation-ready storyboards."
          badge="Coming soon"
          disabled
        />
      </section>

      {/* Recent Documents Plain List */}
      <section aria-label="Recent Policies">
        <RecentDocumentsList />
      </section>
    </div>
  );
}
