"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Plus, Trash2, MessageSquare, Check, X } from "lucide-react";
import { formatDistanceToNowStrict } from "date-fns";
import { useConversations } from "@/hooks/use-conversations";
import { useDeleteConversation } from "@/hooks/use-delete-conversation";

interface ConversationListProps {
  currentId?: string;
  onSelect?: () => void;
}

export function ConversationList({ currentId, onSelect }: ConversationListProps) {
  const { data: conversations = [], isLoading } = useConversations();
  const deleteMutation = useDeleteConversation();
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    deleteMutation.mutate(id);
    setConfirmDeleteId(null);
  };

  return (
    <div className="w-full h-full flex flex-col space-y-4">
      {/* New Chat Pill */}
      <Link
        href="/dashboard/rag/chat"
        onClick={onSelect}
        className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-full bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium shadow-xs transition-all active:scale-[0.98]"
      >
        <Plus className="size-3.5" />
        <span>New chat</span>
      </Link>

      {/* Conversation rows */}
      <div className="flex-1 overflow-y-auto space-y-1 pr-1 font-sans">
        {isLoading && (
          <div className="space-y-2 py-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-10 rounded-2xl bg-stone-100 dark:bg-stone-800/40 animate-pulse" />
            ))}
          </div>
        )}

        {!isLoading && conversations.length === 0 && (
          <div className="text-center py-8 text-xs text-stone-400">
            No chats yet
          </div>
        )}

        {conversations.map((conv) => {
          const isActive = conv.id === currentId;
          const isConfirming = confirmDeleteId === conv.id;

          return (
            <div
              key={conv.id}
              className={`group relative flex items-center justify-between rounded-2xl px-3 py-2 text-xs transition-colors ${
                isActive
                  ? "bg-stone-100 dark:bg-stone-800 font-medium text-stone-900 dark:text-stone-100"
                  : "text-stone-600 dark:text-stone-400 hover:bg-stone-50 dark:hover:bg-stone-850 hover:text-stone-900 dark:hover:text-stone-100"
              }`}
            >
              <Link
                href={`/dashboard/rag/chat/${conv.id}`}
                onClick={onSelect}
                className="flex items-center gap-2.5 min-w-0 flex-1 py-0.5"
              >
                <MessageSquare className="size-3.5 shrink-0 opacity-50" />
                <div className="truncate">
                  <p className="truncate leading-tight">{conv.title}</p>
                  <p className="text-[10px] text-stone-400 font-mono mt-0.5">
                    {formatDistanceToNowStrict(new Date(conv.updatedAt))} ago
                  </p>
                </div>
              </Link>

              {isConfirming ? (
                <div className="flex items-center gap-1 shrink-0 ml-1">
                  <button
                    type="button"
                    onClick={(e) => handleDelete(e, conv.id)}
                    className="p-1 rounded-md text-red-600 hover:bg-red-50 dark:hover:bg-red-950/60"
                    title="Confirm delete"
                  >
                    <Check className="size-3 stroke-[2.5]" />
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setConfirmDeleteId(null);
                    }}
                    className="p-1 rounded-md text-stone-400 hover:text-stone-700"
                    title="Cancel"
                  >
                    <X className="size-3" />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setConfirmDeleteId(conv.id);
                  }}
                  className="shrink-0 p-1 rounded-md text-stone-400 hover:text-red-600 dark:hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                  title="Delete chat"
                >
                  <Trash2 className="size-3.5" />
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
