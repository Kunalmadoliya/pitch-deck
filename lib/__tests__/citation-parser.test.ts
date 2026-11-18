import { describe, it, expect } from "vitest";
import { parseCitationSegments, stripCitations } from "../citation-parser";
import type { Citation } from "../api/chat-types";

describe("parseCitationSegments", () => {
  const sampleCitations: Citation[] = [
    {
      n: 1,
      documentId: "doc-1",
      fileName: "Leave Policy.pdf",
      pageNumber: 4,
      chunkIndex: 2,
    },
    {
      n: 2,
      documentId: "doc-2",
      fileName: "Handbook.pdf",
      pageNumber: 12,
      chunkIndex: 5,
    },
  ];

  it("handles valid matching citation markers", () => {
    const text = "According to our policy [1], employees get 20 days off [2].";
    const segments = parseCitationSegments(text, sampleCitations);

    expect(segments).toEqual([
      { type: "text", value: "According to our policy " },
      { type: "citation", n: 1, citation: sampleCitations[0] },
      { type: "text", value: ", employees get 20 days off " },
      { type: "citation", n: 2, citation: sampleCitations[1] },
      { type: "text", value: "." },
    ]);
  });

  it("handles missing citation markers as plain text", () => {
    const text = "Notice period is 30 days [99].";
    const segments = parseCitationSegments(text, sampleCitations);

    expect(segments).toEqual([
      { type: "text", value: "Notice period is 30 days " },
      { type: "text", value: "[99]" },
      { type: "text", value: "." },
    ]);
  });

  it("handles repeated citation markers correctly", () => {
    const text = "First rule [1] and second mention [1].";
    const segments = parseCitationSegments(text, sampleCitations);

    expect(segments).toEqual([
      { type: "text", value: "First rule " },
      { type: "citation", n: 1, citation: sampleCitations[0] },
      { type: "text", value: " and second mention " },
      { type: "citation", n: 1, citation: sampleCitations[0] },
      { type: "text", value: "." },
    ]);
  });

  it("handles empty or citation-free text", () => {
    expect(parseCitationSegments("")).toEqual([]);
    expect(parseCitationSegments("No citations here")).toEqual([
      { type: "text", value: "No citations here" },
    ]);
  });
});

describe("stripCitations", () => {
  it("removes citation brackets for clean copying", () => {
    const text = "Sick leave requires medical certificate [1] within 48 hours [2].";
    expect(stripCitations(text)).toBe(
      "Sick leave requires medical certificate within 48 hours.",
    );
  });
});
