import React from "react";
import type { Metadata } from "next";
import { DeckViewer } from "@/components/decks/deck-viewer";

export const metadata: Metadata = {
  title: "Pitch Deck | PolicyExtract",
  description: "View and present your generated pitch deck.",
};
export const instant = false;

interface DeckDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function DeckDetailPage({ params }: DeckDetailPageProps) {
  const { id } = await params;
  return <DeckViewer key={id} deckId={id} />;
}
