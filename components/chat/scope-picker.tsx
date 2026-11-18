"use client";

import React, { useState, useRef, useEffect } from "react";
import { Layers, Check, ChevronDown } from "lucide-react";
import { useDocuments } from "@/hooks/use-documents";

interface ScopePickerProps {
  selectedIds: string[];
  onChange: (ids: string[]) => void;
  disabled?: boolean;
}

export function ScopePicker({ selectedIds, onChange, disabled }: ScopePickerProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const { data: documents } = useDocuments();

  const indexedDocs = documents?.filter((d) => d.status === "INDEXED") ?? [];

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [open]);

  const toggleDoc = (id: string) => {
    if (selectedIds.includes(id)) {
      onChange(selectedIds.filter((item) => item !== id));
    } else {
      onChange([...selectedIds, id]);
    }
  };

  const count = selectedIds.length;
  const label = count === 0 ? "All policies" : `${count} policy${count > 1 ? "ies" : ""}`;

  return (
    <div className="relative inline-block" ref={containerRef}>
      <button
        type="button"
        disabled={disabled || indexedDocs.length === 0}
        onClick={() => setOpen((prev) => !prev)}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium text-stone-600 dark:text-stone-300 hover:text-stone-900 dark:hover:text-stone-100 hover:bg-stone-100 dark:hover:bg-stone-800 disabled:opacity-40 transition-colors cursor-pointer select-none"
        title="Filter search to specific policies"
      >
        <Layers className="size-3.5 text-stone-400" />
        <span className="truncate max-w-[130px]">{label}</span>
        <ChevronDown className="size-3 text-stone-400" />
      </button>

      {open && (
        <div className="absolute bottom-full left-0 mb-2 w-64 p-2 rounded-2xl border border-stone-200 dark:border-stone-800 bg-white/95 dark:bg-stone-900/95 backdrop-blur-md shadow-xl z-30 space-y-1">
          <div className="flex items-center justify-between px-2 py-1 text-xs text-stone-400 border-b border-dashed border-stone-200 dark:border-stone-800 pb-1.5">
            <span className="font-medium">Filter documents</span>
            {selectedIds.length > 0 && (
              <button
                type="button"
                onClick={() => onChange([])}
                className="text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
              >
                Reset to all
              </button>
            )}
          </div>

          <div className="max-h-48 overflow-y-auto space-y-0.5 py-1">
            {indexedDocs.map((doc) => {
              const isSelected = selectedIds.includes(doc.id);
              return (
                <button
                  key={doc.id}
                  type="button"
                  onClick={() => toggleDoc(doc.id)}
                  className="w-full flex items-center justify-between gap-2 px-2.5 py-2 rounded-xl text-xs text-left hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors cursor-pointer"
                >
                  <span className="truncate text-stone-800 dark:text-stone-200 font-medium">
                    {doc.fileName}
                  </span>
                  <span
                    className={`size-4 rounded-md border flex items-center justify-center shrink-0 transition-colors ${
                      isSelected
                        ? "bg-blue-600 border-blue-600 text-white"
                        : "border-stone-300 dark:border-stone-700"
                    }`}
                  >
                    {isSelected && <Check className="size-2.5 stroke-[3]" />}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
