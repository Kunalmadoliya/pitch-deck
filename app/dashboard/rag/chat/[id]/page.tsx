import React from "react";
import type { Metadata } from "next";
import { ChatView } from "@/components/chat/chat-view";

export const metadata: Metadata = {
  title: "Policy Chat | PolicyExtract",
  description: "Chat with enterprise policy documents and handbooks with clause-level citations.",
};
export const instant = false;

interface ChatDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function ChatDetailPage({ params }: ChatDetailPageProps) {
  const { id } = await params;
  return <ChatView conversationId={id} />;
}
