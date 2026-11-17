import { describe, expect, it } from "vitest";
import { splitPageBatches } from "../pipeline/split-page-batches";

describe("splitPageBatches", () => {
  it("creates bounded, one-based page batches", () => {
    expect(splitPageBatches(7, 3)).toEqual([[1, 2, 3], [4, 5, 6], [7]]);
  });
});
