import React from "react";
import type { Metadata } from "next";
import { DecksPageView } from "@/components/decks/decks-page-view";

export const metadata: Metadata = {
  title: "AI Pitch Deck | PolicyExtract",
  description: "Turn a project idea into an investor-ready pitch deck.",
};

export default function DecksPage() {
  return <DecksPageView />;
}
