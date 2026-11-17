"use client";

import React, { useState, useRef } from "react";
import { useUploadDocument } from "@/hooks/use-upload-document";
import { MAX_UPLOAD_MB } from "@/lib/api/documents";

export function Dropzone() {
  const {
    uploadFiles,
    cancel,
    phase,
    progress,
    error,
    currentFileName,
    isUploading,
    clearError,
  } = useUploadDocument();

  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleFiles = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    uploadFiles(Array.from(files));
  };

  const onDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    handleFiles(e.dataTransfer.files);
  };

  const getPhaseText = () => {
    const labels: Record<string, string> = {
      validating: "Validating format...",
      authorizing: "Authorizing secure storage...",
      uploading: `Uploading (${progress}%)...`,
      registering: "Registering document...",
      done: "Upload complete!",
    };
    return labels[phase] || "Uploading...";
  };

  return (
    <div className="space-y-3">
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragOver(true);
        }}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={onDrop}
        onClick={() => !isUploading && fileInputRef.current?.click()}
        onKeyDown={(e) => {
          if ((e.key === "Enter" || e.key === " ") && !isUploading) {
            e.preventDefault();
            fileInputRef.current?.click();
          }
        }}
        role="button"
        tabIndex={0}
        aria-label="Upload documents dropzone"
        className={`relative p-8 sm:p-10 rounded-3xl border-2 border-dotted transition-all duration-200 text-center select-none ${
          isDragOver
            ? "border-blue-600 bg-blue-50/60 dark:bg-blue-950/30 scale-[1.005]"
            : "border-stone-300 dark:border-stone-700 bg-stone-50/40 dark:bg-stone-900/20 hover:border-stone-400 dark:hover:border-stone-600 hover:bg-stone-50/80 dark:hover:bg-stone-900/40"
        } ${isUploading ? "cursor-default" : "cursor-pointer"}`}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept=".pdf,application/pdf,.png,image/png,.jpeg,.jpg,image/jpeg,.webp,image/webp"
          className="sr-only"
          onChange={(e) => {
            handleFiles(e.target.files);
            e.target.value = "";
          }}
          disabled={isUploading}
        />

        {isUploading ? (
          <div className="space-y-4 max-w-md mx-auto" aria-live="polite">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-stone-800 dark:text-stone-200 truncate font-semibold">
                {currentFileName}
              </span>
              <span className="text-blue-600 dark:text-blue-400">{getPhaseText()}</span>
            </div>

            {/* Smooth Progress Bar */}
            <div className="h-1.5 w-full bg-stone-200 dark:bg-stone-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-600 dark:bg-blue-400 transition-all duration-300 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                cancel();
              }}
              className="text-xs text-stone-500 hover:text-red-600 dark:hover:text-red-400 font-mono underline"
            >
              Cancel upload
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            <div className="size-10 rounded-full bg-stone-100 dark:bg-stone-800 text-blue-600 dark:text-blue-400 flex items-center justify-center mx-auto mb-3 shadow-xs">
              <svg className="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1M12 12V4m0 0l-3.5 3.5M12 4l3.5 3.5" />
              </svg>
            </div>
            <p className="text-sm font-semibold text-stone-900 dark:text-stone-100">
              Drop policy documents here, or <span className="text-blue-600 dark:text-blue-400 underline">browse</span>
            </p>
            <p className="text-xs text-stone-500 dark:text-stone-400 font-mono">
              PDF, PNG, JPEG, WEBP · Up to {MAX_UPLOAD_MB} MB · Multi-file supported
            </p>
          </div>
        )}
      </div>

      {/* Friendly Error Notice */}
      {error && (
        <div
          role="alert"
          className="p-4 rounded-2xl border border-dotted border-red-300 dark:border-red-900 bg-red-50/50 dark:bg-red-950/20 text-red-700 dark:text-red-300 text-xs flex items-center justify-between gap-3 animate-pop-in"
        >
          <div className="flex items-center gap-2">
            <span className="size-1.5 rounded-full bg-red-500 shrink-0" />
            <span>{error}</span>
          </div>
          <button
            type="button"
            onClick={clearError}
            className="text-[11px] font-mono underline hover:text-red-900 dark:hover:text-red-100 shrink-0"
          >
            Dismiss
          </button>
        </div>
      )}
    </div>
  );
}
