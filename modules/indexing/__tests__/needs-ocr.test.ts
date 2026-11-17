import { describe, expect, it } from "vitest";
import { needsOcr } from "../detection/needs-ocr";

describe("needsOcr", () => {
  it("uses the threshold against trimmed text", () => {
    expect(needsOcr("  short  ", 10)).toBe(true);
    expect(needsOcr("1234567890", 10)).toBe(false);
  });
});
