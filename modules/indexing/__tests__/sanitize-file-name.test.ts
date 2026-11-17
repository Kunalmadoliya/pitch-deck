import { describe, expect, it } from "vitest";
import { sanitizeFileName } from "../upload/validate-upload";

describe("sanitizeFileName", () => {
  it("removes separators, controls, and leading dots", () => {
    expect(sanitizeFileName("../\u0000..policy.pdf")).toBe("policy.pdf");
  });

  it("limits names and falls back when empty", () => {
    expect(sanitizeFileName("a".repeat(250))).toHaveLength(200);
    expect(sanitizeFileName("...")).toBe("document");
  });
});
