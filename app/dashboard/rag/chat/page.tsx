import React from "react";
import type { Metadata } from "next";
import { ChatView } from "@/components/chat/chat-view";

export const metadata: Metadata = {
  title: "Ask Your Policies | PolicyExtract",
  description: "Chat with enterprise policy documents and handbooks with clause-level citations.",
};

export default function ChatPage() {
  return <ChatView />;
}
