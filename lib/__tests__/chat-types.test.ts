import { describe, it, expect } from "vitest";
import { stageLabel, errorMessage, MAX_QUERY_CHARS } from "../api/chat-types";

describe("chat-types", () => {
  it("defines MAX_QUERY_CHARS as 4000", () => {
    expect(MAX_QUERY_CHARS).toBe(4000);
  });

  it("returns human-friendly labels for query stages", () => {
    expect(stageLabel("guarding")).toBe("Checking your question");
    expect(stageLabel("optimizing")).toBe("Understanding your question");
    expect(stageLabel("retrieving")).toBe("Searching your documents");
    expect(stageLabel("reranking")).toBe("Picking the best passages");
    expect(stageLabel("generating")).toBe("Writing the answer");
    expect(stageLabel("verifying")).toBe("Verifying against your documents");
    expect(stageLabel("unknown" as any)).toBe("Processing...");
  });

  it("returns human-friendly messages for error codes", () => {
    expect(errorMessage("blocked_by_guardrail")).toBe("I can't help with that request.");
    expect(errorMessage("retrieval_failed")).toBe("I couldn't find relevant information in your documents.");
    expect(errorMessage("generation_failed")).toBe("Unable to generate an answer right now. Please try again.");
    expect(errorMessage("rate_limited")).toBe("You're asking too fast. Try again in a minute.");
    expect(errorMessage("unauthorized")).toBe("Your session has expired. Please sign in again.");
    expect(errorMessage("unknown_code")).toBe("Unable to complete request right now. Please try again.");
  });
});
