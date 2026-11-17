import React from "react";
import type { Metadata } from "next";
import { RagPageView } from "@/components/rag/rag-page-view";

export const metadata: Metadata = {
  title: "Document RAG | PolicyExtract",
  description: "Upload and manage company policies, compliance handbooks, and contracts.",
};

export default function RagPage() {
  return <RagPageView />;
}
