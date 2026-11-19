"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { errorMessage, type MessageItem, type Citation, type QueryStage, type ConversationWithMessages } from "@/lib/api/chat-types";
import { conversationKeys } from "@/lib/api/chat";
import { streamChatApi } from "@/lib/api/chat-stream-fetcher";

interface UseChatStreamOptions {
  conversationId?: string;
  initialMessages?: MessageItem[];
  isInitialLoading?: boolean;
  /** Called once a brand-new chat has finished its first answer and has a real ID. */
  onNewConversation?: (newId: string) => void;
}

const EMPTY_MESSAGES: MessageItem[] = [];

export function useChatStream({
  conversationId,
  initialMessages = EMPTY_MESSAGES,
  isInitialLoading = false,
  onNewConversation,
}: UseChatStreamOptions = {}) {
  const queryClient = useQueryClient();
  const [messages, setMessages] = useState<MessageItem[]>(initialMessages);
  const [streamingContent, setStreamingContent] = useState("");
  const [currentStage, setCurrentStage] = useState<QueryStage | null>(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<{ code: string; message: string } | null>(null);
  // The chat this screen is really talking to. Starts empty for a new chat and is filled
  // in by the server's "final" event, so the 2nd message goes to the SAME chat.
  const activeConversationRef = useRef(conversationId);
  const hydratedConversationRef = useRef<string | null>(null);
  const messagesRef = useRef(messages);
  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  useEffect(() => {
    if (isStreaming || isInitialLoading) return;
    const key = conversationId ?? "__new";
    if (hydratedConversationRef.current !== key) {
      hydratedConversationRef.current = key;
      activeConversationRef.current = conversationId;
      setMessages(initialMessages);
      setStreamingContent("");
      setCurrentStage(null);
      setError(null);
    }
  }, [conversationId, initialMessages, isInitialLoading, isStreaming]);

  const abortRef = useRef<AbortController | null>(null);
  const bufferRef = useRef("");
  const rafRef = useRef<number | null>(null);
  const lastPromptRef = useRef<{ message: string; docIds?: string[] } | null>(null);

  const flush = useCallback(() => {
    if (bufferRef.current) {
      setStreamingContent((prev) => prev + bufferRef.current);
      bufferRef.current = "";
    }
  }, []);

  const stop = useCallback(() => {
    abortRef.current?.abort();
    abortRef.current = null;
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    flush();
    setIsStreaming(false);
    setCurrentStage(null);
  }, [flush]);

  const sendMessage = useCallback(
    async (prompt: string, documentIds?: string[]) => {
      const trimmed = prompt.trim();
      if (!trimmed || isStreaming) return;
      lastPromptRef.current = { message: trimmed, docIds: documentIds };
      setError(null);
      setStreamingContent("");
      setCurrentStage("guarding");
      setIsStreaming(true);

      const startedAsNewChat = !activeConversationRef.current;
      const previousMessages = messagesRef.current;
      const userMsg: MessageItem = {
        id: `u-${Date.now()}`,
        conversationId: activeConversationRef.current ?? "",
        role: "USER",
        content: trimmed,
        createdAt: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, userMsg]);

      const controller = new AbortController();
      abortRef.current = controller;
      bufferRef.current = "";
      let activeConvId = activeConversationRef.current;
      let finalMsgId = "";
      let finalCitations: Citation[] = [];
      let text = "";

      try {
        await streamChatApi(
          { conversationId: activeConvId, message: trimmed, documentIds, signal: controller.signal },
          {
            onStatus: (e) => {
              console.info("[chat] status", e.stage);
              setCurrentStage(e.stage);
            },
            onToken: (e) => {
              console.info("[chat] token", e.text.length);
              bufferRef.current += e.text;
              text += e.text;
              if (!rafRef.current) {
                rafRef.current = requestAnimationFrame(() => {
                  flush();
                  rafRef.current = null;
                });
              }
            },
            onReplace: (e) => { text = e.text; bufferRef.current = ""; setStreamingContent(e.text); },
            onFinal: (e) => {
              console.info("[chat] final", {
                conversationId: Boolean(e.conversationId),
                messageId: Boolean(e.messageId),
                citationCount: e.citations.length,
                verdict: e.verdict,
              });
              activeConvId = e.conversationId;
              finalMsgId = e.messageId;
              finalCitations = e.citations;
              activeConversationRef.current = e.conversationId;
              queryClient.invalidateQueries({ queryKey: conversationKeys.lists() });
            },
            onError: (e) => {
              console.error("[chat] error", e.code);
              setError({ code: e.code, message: e.message || errorMessage(e.code) });
            },
            onDone: () => {
              console.info("[chat] done");
              flush();
            },
          },
        );
        flush();
        const assistantMsg: MessageItem | null = text.trim()
          ? { id: finalMsgId || `a-${Date.now()}`, conversationId: activeConvId ?? "", role: "ASSISTANT", content: text, citations: finalCitations, createdAt: new Date().toISOString() }
          : null;
        if (assistantMsg) setMessages((prev) => [...prev, assistantMsg]);

        if (activeConvId) {
          // Keep the cached copy of this chat up to date, so coming back to it
          // (or moving to its own URL) shows the latest messages without a reload.
          const now = new Date().toISOString();
          const allMessages = [...previousMessages, userMsg, ...(assistantMsg ? [assistantMsg] : [])];
          const id = activeConvId;
          queryClient.setQueryData<ConversationWithMessages>(conversationKeys.detail(id), (old) => ({
            id,
            title: old?.title ?? trimmed.slice(0, 60),
            createdAt: old?.createdAt ?? now,
            updatedAt: now,
            messages: allMessages,
          }));
          if (startedAsNewChat) onNewConversation?.(id);
        }
      } catch (err: unknown) {
        if (!controller.signal.aborted) {
          console.error("[chat] request failed", err instanceof Error ? err.name : "UNKNOWN");
          setError({ code: "error", message: err instanceof Error ? err.message : errorMessage("generation_failed") });
        }
      } finally {
        setIsStreaming(false);
        setCurrentStage(null);
        setStreamingContent("");
        abortRef.current = null;
      }
    },
    [isStreaming, onNewConversation, queryClient, flush],
  );

  const regenerate = useCallback(() => {
    if (messages.length === 0 || isStreaming) return;
    const lastUser = [...messages].reverse().find((m) => m.role === "USER");
    if (!lastUser) return;
    setMessages((prev) => {
      const idx = prev.findLastIndex((m) => m.role === "ASSISTANT");
      return idx >= 0 ? prev.slice(0, idx) : prev;
    });
    sendMessage(lastUser.content, lastPromptRef.current?.docIds);
  }, [messages, isStreaming, sendMessage]);

  return {
    messages,
    streamingContent,
    currentStage,
    isStreaming,
    error,
    sendMessage,
    stop,
    regenerate,
    retry: () => lastPromptRef.current && sendMessage(lastPromptRef.current.message, lastPromptRef.current.docIds),
  };
}
