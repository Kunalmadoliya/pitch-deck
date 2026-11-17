import { describe, expect, it } from "vitest";
import { isInsideUserFolder, validateUpload } from "../upload/validate-upload";

const validUpload = {
  fileId: "file-1",
  filePath: "/policy-docs/user-1/policy.pdf",
  fileName: "policy.pdf",
  mimeType: "application/pdf",
  sizeBytes: 1024,
};

describe("validateUpload", () => {
  it("accepts a valid registration body", () => {
    expect(validateUpload(validUpload)).toEqual(validUpload);
  });

  it("rejects unsupported MIME types and oversized files", () => {
    expect(() => validateUpload({ ...validUpload, mimeType: "text/plain" })).toThrow();
    expect(() => validateUpload({ ...validUpload, sizeBytes: 100 * 1024 * 1024 })).toThrow();
  });

  it("rejects paths outside the authenticated user's folder", () => {
    expect(isInsideUserFolder(validUpload.filePath, "user-2")).toBe(false);
    expect(isInsideUserFolder("/policy-docs/user-1/../user-2/file.pdf", "user-1")).toBe(false);
    expect(isInsideUserFolder("/policy-docs/user-1/%2e%2e/user-2/file.pdf", "user-1")).toBe(false);
  });
});
