"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { errorMessage, type MessageItem, type Citation, type QueryStage } from "@/lib/api/chat-types";
import { conversationKeys } from "@/lib/api/chat";
import { streamChatApi } from "@/lib/api/chat-stream-fetcher";

interface UseChatStreamOptions {
  conversationId?: string;
  initialMessages?: MessageItem[];
  onNewConversation?: (newId: string) => void;
}

const EMPTY_MESSAGES: MessageItem[] = [];

export function useChatStream({
  conversationId,
  initialMessages = EMPTY_MESSAGES,
  onNewConversation,
}: UseChatStreamOptions = {}) {
  const queryClient = useQueryClient();
  const [messages, setMessages] = useState<MessageItem[]>(initialMessages);
  const [streamingContent, setStreamingContent] = useState("");
  const [currentStage, setCurrentStage] = useState<QueryStage | null>(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<{ code: string; message: string } | null>(null);

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      setMessages(initialMessages);
      setStreamingContent("");
      setCurrentStage(null);
      setIsStreaming(false);
      setError(null);
    });
    return () => cancelAnimationFrame(frame);
  }, [initialMessages]);

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

      const userMsg: MessageItem = {
        id: `u-${Date.now()}`,
        conversationId: conversationId ?? "",
        role: "USER",
        content: trimmed,
        createdAt: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, userMsg]);

      const controller = new AbortController();
      abortRef.current = controller;
      bufferRef.current = "";
      let activeConvId = conversationId;
      let finalMsgId = "";
      let finalCitations: Citation[] = [];
      let text = "";

      try {
        await streamChatApi(
          { conversationId: activeConvId, message: trimmed, documentIds, signal: controller.signal },
          {
            onStatus: (e) => setCurrentStage(e.stage),
            onToken: (e) => {
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
              activeConvId = e.conversationId;
              finalMsgId = e.messageId;
              finalCitations = e.citations;
              if (!conversationId && e.conversationId && onNewConversation) onNewConversation(e.conversationId);
              queryClient.invalidateQueries({ queryKey: conversationKeys.lists() });
            },
            onError: (e) => setError({ code: e.code, message: e.message || errorMessage(e.code) }),
            onDone: () => flush(),
          },
        );
        flush();
        if (text.trim()) {
          setMessages((prev) => [
            ...prev,
            { id: finalMsgId || `a-${Date.now()}`, conversationId: activeConvId ?? "", role: "ASSISTANT", content: text, citations: finalCitations, createdAt: new Date().toISOString() },
          ]);
        }
      } catch (err: unknown) {
        if (!controller.signal.aborted) {
          setError({ code: "error", message: err instanceof Error ? err.message : errorMessage("generation_failed") });
        }
      } finally {
        setIsStreaming(false);
        setCurrentStage(null);
        setStreamingContent("");
        abortRef.current = null;
      }
    },
    [conversationId, isStreaming, onNewConversation, queryClient, flush],
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
