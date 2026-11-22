"use client";

import React, { useState, useRef, useEffect } from "react";
import { Layers, Check, ChevronDown, Search, FileText, X } from "lucide-react";
import { useDocuments } from "@/hooks/use-documents";

interface ScopePickerProps {
  selectedIds: string[];
  onChange: (ids: string[]) => void;
  disabled?: boolean;
}

function policyLabel(count: number): string {
  if (count === 0) return "All policies";
  return `${count} ${count === 1 ? "policy" : "policies"}`;
}

/** Files the user can ask about: only fully indexed documents. */
export function useIndexedDocuments() {
  const { data: documents, isLoading } = useDocuments();
  return { indexedDocs: documents?.filter((d) => d.status === "INDEXED") ?? [], isLoading };
}

export function ScopePicker({ selectedIds, onChange, disabled }: ScopePickerProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const { indexedDocs } = useIndexedDocuments();

  useEffect(() => {
    if (!open) return;
    searchRef.current?.focus();
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [open]);

  // Drop selections for files that were deleted or are no longer indexed.
  useEffect(() => {
    if (indexedDocs.length === 0 && selectedIds.length === 0) return;
    const valid = selectedIds.filter((id) => indexedDocs.some((d) => d.id === id));
    if (valid.length !== selectedIds.length) onChange(valid);
  }, [indexedDocs, selectedIds, onChange]);

  const toggleDoc = (id: string) => {
    onChange(selectedIds.includes(id) ? selectedIds.filter((item) => item !== id) : [...selectedIds, id]);
  };

  const query = search.trim().toLowerCase();
  const visibleDocs = query
    ? indexedDocs.filter((d) => d.fileName.toLowerCase().includes(query))
    : indexedDocs;
  const allSelected = indexedDocs.length > 0 && selectedIds.length === indexedDocs.length;
  const count = selectedIds.length;

  return (
    <div className="relative inline-block" ref={containerRef}>
      <button
        type="button"
        disabled={disabled || indexedDocs.length === 0}
        onClick={() => setOpen((prev) => !prev)}
        aria-expanded={open}
        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium disabled:opacity-40 transition-colors cursor-pointer select-none ${
          count > 0
            ? "bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-500/20"
            : "text-stone-600 dark:text-stone-300 hover:text-stone-900 dark:hover:text-stone-100 hover:bg-stone-100 dark:hover:bg-stone-800"
        }`}
        title={
          indexedDocs.length === 0
            ? "Upload and index a document first"
            : "Choose which files to search (none = all files)"
        }
      >
        <Layers className={`size-3.5 ${count > 0 ? "text-blue-500" : "text-stone-400"}`} />
        <span className="truncate max-w-[130px]">{policyLabel(count)}</span>
        <ChevronDown className="size-3 text-stone-400" />
      </button>

      {open && (
        <div className="absolute bottom-full left-0 mb-2 w-72 p-2 rounded-2xl border border-stone-200 dark:border-stone-800 bg-white/95 dark:bg-stone-900/95 backdrop-blur-md shadow-xl z-30 space-y-1">
          <div className="flex items-center justify-between px-2 py-1 text-xs text-stone-400">
            <span className="font-medium">Search in</span>
            <div className="flex items-center gap-2">
              {!allSelected && indexedDocs.length > 1 && (
                <button
                  type="button"
                  onClick={() => onChange(indexedDocs.map((d) => d.id))}
                  className="text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
                >
                  Select all
                </button>
              )}
              {count > 0 && (
                <button
                  type="button"
                  onClick={() => onChange([])}
                  className="text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          <p className="px-2 pb-1 text-[11px] leading-snug text-stone-400">
            {count === 0
              ? "Nothing ticked: every indexed file is searched automatically."
              : "Only the ticked files are searched."}
          </p>

          {indexedDocs.length > 5 && (
            <div className="relative px-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-3.5 text-stone-400" />
              <input
                ref={searchRef}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Find a file..."
                className="w-full rounded-xl border border-stone-200 dark:border-stone-800 bg-transparent pl-8 pr-2 py-1.5 text-xs text-stone-800 dark:text-stone-200 placeholder:text-stone-400 focus:outline-none focus:border-blue-500/70"
              />
            </div>
          )}

          <div className="max-h-56 overflow-y-auto space-y-0.5 py-1 border-t border-dashed border-stone-200 dark:border-stone-800">
            {visibleDocs.length === 0 && (
              <p className="px-2.5 py-3 text-xs text-stone-400 text-center">No file matches “{search}”.</p>
            )}
            {visibleDocs.map((doc) => {
              const isSelected = selectedIds.includes(doc.id);
              return (
                <button
                  key={doc.id}
                  type="button"
                  role="checkbox"
                  aria-checked={isSelected}
                  onClick={() => toggleDoc(doc.id)}
                  className={`w-full flex items-center gap-2 px-2.5 py-2 rounded-xl text-xs text-left transition-colors cursor-pointer ${
                    isSelected
                      ? "bg-blue-50 dark:bg-blue-500/10"
                      : "hover:bg-stone-100 dark:hover:bg-stone-800"
                  }`}
                  title={doc.fileName}
                >
                  <span
                    className={`size-4 rounded-md border flex items-center justify-center shrink-0 transition-colors ${
                      isSelected
                        ? "bg-blue-600 border-blue-600 text-white"
                        : "border-stone-300 dark:border-stone-700"
                    }`}
                  >
                    {isSelected && <Check className="size-2.5 stroke-[3]" />}
                  </span>
                  <FileText className="size-3.5 shrink-0 text-stone-400" />
                  <span className="truncate text-stone-800 dark:text-stone-200 font-medium">{doc.fileName}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

/** Chips for the picked files, shown above the input so the user always sees what is searched. */
export function SelectedFileChips({ selectedIds, onChange, disabled }: ScopePickerProps) {
  const { indexedDocs } = useIndexedDocuments();
  const selected = indexedDocs.filter((d) => selectedIds.includes(d.id));
  if (selected.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-1.5 px-2 pb-1.5">
      <span className="text-[11px] text-stone-400">Searching only:</span>
      {selected.map((doc) => (
        <span
          key={doc.id}
          className="inline-flex items-center gap-1 max-w-[200px] rounded-full bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-300 pl-2 pr-1 py-0.5 text-[11px] font-medium"
          title={doc.fileName}
        >
          <FileText className="size-3 shrink-0" />
          <span className="truncate">{doc.fileName}</span>
          <button
            type="button"
            disabled={disabled}
            onClick={() => onChange(selectedIds.filter((id) => id !== doc.id))}
            className="rounded-full p-0.5 hover:bg-blue-100 dark:hover:bg-blue-500/20 cursor-pointer disabled:opacity-40"
            aria-label={`Remove ${doc.fileName}`}
          >
            <X className="size-3" />
          </button>
        </span>
      ))}
    </div>
  );
}
