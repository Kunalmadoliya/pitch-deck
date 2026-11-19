"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowDown, Menu, X, ShieldCheck } from "lucide-react";
import { useConversation } from "@/hooks/use-conversation";
import { useChatStream } from "@/hooks/use-chat-stream";
import { useAutoScroll } from "@/hooks/use-auto-scroll";
import { MessageUser } from "./message-user";
import { MessageAssistant } from "./message-assistant";
import { Composer } from "./composer";
import { EmptyState } from "./empty-state";
import { ConversationList } from "./conversation-list";

interface ChatViewProps {
  conversationId?: string;
}

export function ChatView({ conversationId }: ChatViewProps) {
  const router = useRouter();
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const { data: conversationData, isLoading: isLoadingInitial } = useConversation(conversationId);

  const {
    messages,
    streamingContent,
    currentStage,
    isStreaming,
    error,
    sendMessage,
    stop,
    retry,
    regenerate,
  } = useChatStream({
    conversationId,
    initialMessages: conversationData?.messages,
    isInitialLoading: isLoadingInitial,
    // A real navigation (not just changing the address bar) so the page knows which chat it is on.
    // The chat is already in the query cache, so the new page shows instantly with no loading flash.
    onNewConversation: (id) => router.replace(`/dashboard/rag/chat/${id}`, { scroll: false }),
  });

  const { containerRef, showJumpToLatest, scrollToBottom, handleScroll } = useAutoScroll(isStreaming, streamingContent);

  const hasMessages = messages.length > 0 || isStreaming;

  return (
    <div className="relative flex h-screen min-h-[560px] overflow-hidden bg-[#fbfbfa] dark:bg-[#0f0f10]">
      {/* Desktop Conversation Sidebar */}
      <aside className="hidden md:flex w-60 shrink-0 flex-col border-r border-stone-200/90 dark:border-stone-800/90 px-4 py-5">
        <div className="mb-5 px-1">
          <p className="text-[11px] font-medium text-stone-400">Policy workspace</p>
        </div>
        <ConversationList currentId={conversationId} />
      </aside>

      {/* Mobile Drawer */}
      {mobileDrawerOpen && (
        <div className="fixed inset-0 z-50 md:hidden bg-stone-900/40 backdrop-blur-xs flex">
          <div className="w-72 bg-white dark:bg-stone-900 p-5 h-full flex flex-col shadow-2xl">
            <div className="flex justify-between items-center mb-4">
              <span className="text-xs font-semibold text-stone-500">Chats</span>
              <button
                type="button"
                onClick={() => setMobileDrawerOpen(false)}
                className="p-1 rounded-md text-stone-400 hover:text-stone-700 dark:hover:text-stone-200"
              >
                <X className="size-4" />
              </button>
            </div>
            <ConversationList currentId={conversationId} onSelect={() => setMobileDrawerOpen(false)} />
          </div>
          <div className="flex-1" onClick={() => setMobileDrawerOpen(false)} />
        </div>
      )}

      {/* Chat Thread Container */}
      <div className="flex-1 flex flex-col min-w-0 h-full relative">
        {/* Top Header */}
        <div className="h-16 px-4 sm:px-6 flex items-center justify-between border-b border-stone-200/90 dark:border-stone-800/90 text-xs shrink-0">
          <div className="flex items-center gap-2.5 text-stone-500">
            <button
              type="button"
              onClick={() => setMobileDrawerOpen(true)}
              className="md:hidden p-1 rounded-md text-stone-500 hover:text-stone-800 dark:hover:text-stone-200"
              aria-label="Open conversation drawer"
            >
              <Menu className="size-4" />
            </button>
            <Link href="/dashboard/rag" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors font-medium">
              ← Policies
            </Link>
            <span className="text-stone-300 dark:text-stone-700 select-none">•</span>
            <span className="text-stone-800 dark:text-stone-200 font-medium truncate max-w-[200px] sm:max-w-xs">
              {conversationData?.title || "New chat"}
            </span>
          </div>

          <div className="hidden sm:flex items-center gap-1.5 text-stone-400 text-[11px]">
            <ShieldCheck className="size-3 text-blue-600 dark:text-blue-400" />
            <span>Grounded search</span>
          </div>
        </div>

        {/* Scrollable Message Thread */}
        <div
          ref={containerRef}
          onScroll={handleScroll}
          className="flex-1 overflow-y-auto py-6 px-4 sm:px-8"
        >
          {isLoadingInitial && !hasMessages ? (
            <div className="space-y-4 py-8 max-w-xl mx-auto">
              <div className="h-4 w-1/3 bg-stone-100 dark:bg-stone-800/40 rounded-full animate-pulse" />
              <div className="h-4 w-2/3 bg-stone-100 dark:bg-stone-800/40 rounded-full animate-pulse" />
            </div>
          ) : !hasMessages ? (
            <EmptyState onSelectPrompt={(p) => sendMessage(p)} />
          ) : (
            <div className="max-w-3xl mx-auto w-full space-y-7">
              {messages.map((msg, index) => {
                const isLast = index === messages.length - 1;
                if (msg.role === "USER") {
                  return <MessageUser key={msg.id} content={msg.content} />;
                }
                const isMsgStreaming = isStreaming && isLast;
                return (
                  <MessageAssistant
                    key={msg.id}
                    content={isMsgStreaming ? streamingContent || msg.content : msg.content}
                    citations={msg.citations ?? undefined}
                    isStreaming={isMsgStreaming}
                    currentStage={isMsgStreaming ? currentStage : null}
                    errorCode={isLast ? error?.code : null}
                    onRetry={isLast && error ? retry : undefined}
                    isLatest={isLast}
                    onRegenerate={!isStreaming ? regenerate : undefined}
                  />
                );
              })}
              {isStreaming && (
                <MessageAssistant
                  key="streaming-assistant"
                  content={streamingContent}
                  isStreaming
                  currentStage={currentStage}
                  isLatest
                  citations={[]}
                />
              )}
              {!isStreaming && error && messages[messages.length - 1]?.role === "USER" && (
                <MessageAssistant
                  key="chat-error"
                  content=""
                  errorCode={error.code}
                  onRetry={retry}
                  isLatest
                  citations={[]}
                />
              )}
            </div>
          )}
        </div>

        {/* Jump to latest button */}
        {showJumpToLatest && (
          <button
            type="button"
            onClick={() => scrollToBottom()}
            className="absolute bottom-28 left-1/2 -translate-x-1/2 z-20 inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-stone-900/90 dark:bg-stone-100/90 text-stone-100 dark:text-stone-900 text-xs shadow-md hover:scale-105 transition-all select-none cursor-pointer"
          >
            <ArrowDown className="size-3" />
            <span>Latest</span>
          </button>
        )}

        {/* Anchored Composer Area */}
        <div className="px-4 sm:px-8 pb-5 pt-3 shrink-0 bg-[#fbfbfa] dark:bg-[#0f0f10]">
          <div className="max-w-3xl mx-auto">
            <Composer onSend={sendMessage} onStop={stop} isStreaming={isStreaming} />
          </div>
        </div>
      </div>
    </div>
  );
}
