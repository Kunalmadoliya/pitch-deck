import { describe, expect, it } from "vitest";
import { chunkPage } from "../chunking/chunk-page";

describe("chunkPage", () => {
  it("keeps page numbers on every chunk", async () => {
    const chunks = await chunkPage(
      { pageNumber: 4, text: "one two three four five", source: "text-layer" },
      { chunkSize: 8, chunkOverlap: 0 },
    );
    expect(chunks.length).toBeGreaterThan(1);
    expect(chunks.every((chunk) => chunk.pageNumber === 4)).toBe(true);
  });
});
