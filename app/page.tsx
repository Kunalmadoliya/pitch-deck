import React from "react";
import { LandingHeader } from "@/components/landing/header";
import { LandingHero } from "@/components/landing/hero";
import { DemoWindow } from "@/components/landing/demo-window";
import { LandingStatement } from "@/components/landing/statement";
import { FinalCtaAndFooter } from "@/components/landing/final-cta";

interface HomePageProps {
  searchParams?: Promise<{ scene?: string; theme?: string }>;
}

export const instant = false;

export default async function HomePage({ searchParams }: HomePageProps) {
  const resolved = await searchParams;
  const initialScene = resolved?.scene === "ask" ? "ask" : "upload";

  return (
    <div className="min-h-screen flex flex-col bg-[#fbfbfa] dark:bg-[#0f0f10] text-stone-900 dark:text-stone-100 font-sans selection:bg-blue-600/20 selection:text-blue-900 dark:selection:text-blue-100 transition-colors overflow-x-hidden">
      {/* Block 1: Header */}
      <LandingHeader />

      <main className="flex-1 w-full flex flex-col items-center">
        {/* Block 2: Hero */}
        <LandingHero />

        {/* Block 3: The Live Product Demo Window (The ONLY card-like surface) */}
        <DemoWindow initialScene={initialScene} />

        {/* Block 4: Statement Row */}
        <LandingStatement />

        {/* Block 5: Final CTA & Minimal Footer */}
        <FinalCtaAndFooter />
      </main>
    </div>
  );
}
