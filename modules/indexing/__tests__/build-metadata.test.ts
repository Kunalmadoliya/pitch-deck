import { describe, expect, it } from "vitest";
import { buildMetadata } from "../vector-store/build-metadata";

describe("buildMetadata", () => {
  it("includes citation fields and text", () => {
    expect(
      buildMetadata(
        { pageNumber: 2, chunkIndex: 1, text: "policy", source: "ocr", ocrConfidence: 97 },
        { id: "doc-1", userId: "user-1", fileName: "policy.pdf" },
      ),
    ).toEqual({
      documentId: "doc-1",
      userId: "user-1",
      fileName: "policy.pdf",
      pageNumber: 2,
      chunkIndex: 1,
      source: "ocr",
      ocrConfidence: 97,
      text: "policy",
    });
  });
});
