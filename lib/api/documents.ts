import {
  ImageKitAbortError,
  ImageKitInvalidRequestError,
  ImageKitServerError,
  ImageKitUploadNetworkError,
} from "@imagekit/next";
import type {
  DocumentItem,
  UploadAuthResponse,
  UploadDocumentPayload,
} from "./document-types";

export * from "./document-types";

export async function fetchUploadAuth(): Promise<UploadAuthResponse> {
  const response = await fetch("/api/upload-auth", { credentials: "include" });
  if (!response.ok) {
    if (response.status === 401) {
      throw new Error("Your session has expired. Please sign in again.");
    }
    throw new Error("Unable to obtain upload authorization. Please try again.");
  }
  return response.json();
}

export async function fetchDocuments(): Promise<DocumentItem[]> {
  const response = await fetch("/api/documents", { credentials: "include" });
  if (!response.ok) {
    if (response.status === 401) {
      throw new Error("Your session has expired. Please sign in again.");
    }
    throw new Error("Failed to load documents.");
  }
  return response.json();
}

export async function fetchDocument(id: string): Promise<DocumentItem> {
  const response = await fetch(`/api/documents/${id}`, { credentials: "include" });
  if (!response.ok) {
    if (response.status === 404) {
      throw new Error("Document not found.");
    }
    if (response.status === 401) {
      throw new Error("Your session has expired. Please sign in again.");
    }
    throw new Error("Failed to load document status.");
  }
  return response.json();
}

export async function registerDocument(
  payload: UploadDocumentPayload,
): Promise<{ documentId: string }> {
  const response = await fetch("/api/documents", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error("Your session has expired. Please sign in again.");
    }
    if (response.status === 403) {
      throw new Error("Uploaded file ownership or path validation failed.");
    }
    if (response.status === 409) {
      throw new Error("This file has already been registered.");
    }
    if (response.status === 413) {
      throw new Error("File exceeds the maximum allowed size of 50 MB.");
    }
    const data = await response.json().catch(() => ({}));
    throw new Error(data.error || "Failed to register uploaded document.");
  }

  return response.json();
}

export async function deleteDocumentApi(id: string): Promise<void> {
  const response = await fetch(`/api/documents/${id}`, {
    method: "DELETE",
    credentials: "include",
  });

  if (!response.ok) {
    if (response.status === 502) {
      throw new Error("Cleanup failed on remote storage or vector index. Please try again.");
    }
    if (response.status === 401) {
      throw new Error("Your session has expired. Please sign in again.");
    }
    if (response.status === 404) {
      return; // already gone
    }
    const data = await response.json().catch(() => ({}));
    throw new Error(data.error || "Failed to delete document.");
  }
}

export function mapUploadError(err: unknown): string {
  if (err instanceof ImageKitAbortError) {
    return "Upload was cancelled.";
  }
  if (err instanceof ImageKitInvalidRequestError) {
    return "Upload request was rejected by storage provider. Please check file properties.";
  }
  if (err instanceof ImageKitUploadNetworkError) {
    return "Network connection interrupted while uploading. Please check your internet connection.";
  }
  if (err instanceof ImageKitServerError) {
    return "Storage provider server error. Please try uploading again in a few moments.";
  }
  if (err instanceof Error) {
    return err.message;
  }
  return "An unexpected error occurred during upload.";
}
