"use client";

import { useState, useRef, useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { upload } from "@imagekit/next";
import { useSession } from "@/hooks/use-auth";
import {
  documentKeys,
  fetchUploadAuth,
  registerDocument,
  mapUploadError,
  validateUploadFile,
  type UploadPhase,
} from "@/lib/api/documents";

export type { UploadPhase };

export function useUploadDocument() {
  const queryClient = useQueryClient();
  const sessionResult = useSession();
  const [phase, setPhase] = useState<UploadPhase>("idle");
  const [progress, setProgress] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);
  const [currentFileName, setCurrentFileName] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const abortControllerRef = useRef<AbortController | null>(null);

  const cancel = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setIsUploading(false);
    setPhase("idle");
    setError("Upload cancelled by user.");
  }, []);

  const uploadFiles = useCallback(
    async (files: File[]) => {
      if (!files || files.length === 0) return;

      const userId = sessionResult?.data?.user?.id;
      if (!userId) {
        setError("You must be signed in to upload documents.");
        return;
      }

      // 1. Validate all files before uploading
      setPhase("validating");
      setError(null);

      for (const file of files) {
        const validationError = validateUploadFile(file);
        if (validationError) {
          setError(validationError);
          setPhase("idle");
          return;
        }
      }

      setIsUploading(true);

      try {
        for (let i = 0; i < files.length; i++) {
          const file = files[i];
          setCurrentFileName(file.name);
          setProgress(0);

          const controller = new AbortController();
          abortControllerRef.current = controller;

          // 2. Authorize upload
          setPhase("authorizing");
          const authData = await fetchUploadAuth();

          if (controller.signal.aborted) {
            throw new Error("Upload cancelled");
          }

          // 3. Upload directly to ImageKit
          setPhase("uploading");
          const uploadResponse = await upload({
            file,
            fileName: file.name,
            publicKey: authData.publicKey,
            token: authData.token,
            expire: authData.expire,
            signature: authData.signature,
            folder: `/policy-docs/${userId}`,
            isPrivateFile: true,
            useUniqueFileName: true,
            onProgress: (e: ProgressEvent) => {
              if (e.lengthComputable) {
                setProgress(Math.min(99, Math.round((e.loaded / e.total) * 100)));
              }
            },
            abortSignal: controller.signal,
          });

          if (!uploadResponse.fileId || !uploadResponse.filePath) {
            throw new Error("Storage provider returned invalid upload receipt.");
          }

          // 4. Register document with backend API
          setPhase("registering");
          setProgress(100);

          await registerDocument({
            fileId: uploadResponse.fileId,
            filePath: uploadResponse.filePath,
            fileName: file.name,
            mimeType: file.type,
            sizeBytes: file.size,
          });

          await queryClient.invalidateQueries({ queryKey: documentKeys.all });
        }

        setPhase("done");
        setProgress(100);
        setTimeout(() => {
          setPhase("idle");
          setCurrentFileName(null);
          setProgress(0);
        }, 1500);
      } catch (err: unknown) {
        setError(mapUploadError(err));
        setPhase("idle");
      } finally {
        setIsUploading(false);
        abortControllerRef.current = null;
      }
    },
    [sessionResult?.data?.user?.id, queryClient],
  );

  return {
    uploadFiles,
    cancel,
    phase,
    progress,
    error,
    currentFileName,
    isUploading,
    clearError: () => setError(null),
  };
}
