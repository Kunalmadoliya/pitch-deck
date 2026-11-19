import { describe, expect, it } from "vitest";
import { mapWithConcurrency } from "../pipeline/map-with-concurrency";

describe("mapWithConcurrency", () => {
  it("keeps order and never runs more than the limit at once", async () => {
    let running = 0;
    let peak = 0;
    const result = await mapWithConcurrency([5, 1, 4, 2, 3], 2, async (value) => {
      running += 1;
      peak = Math.max(peak, running);
      await new Promise((resolve) => setTimeout(resolve, value * 2));
      running -= 1;
      return value * 10;
    });
    expect(result).toEqual([50, 10, 40, 20, 30]);
    expect(peak).toBe(2);
  });

  it("handles an empty list", async () => {
    expect(await mapWithConcurrency([], 3, async (value: number) => value)).toEqual([]);
  });
});
