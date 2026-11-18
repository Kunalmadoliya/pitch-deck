import { describe, it, expect, vi } from "vitest";
import { parseSSEBlock, parseSSEStream } from "../sse";

describe("parseSSEBlock", () => {
  it("parses valid status event", () => {
    const onStatus = vi.fn();
    parseSSEBlock('event: status\ndata: {"stage":"optimizing"}\n', { onStatus });
    expect(onStatus).toHaveBeenCalledWith({ stage: "optimizing" });
  });

  it("parses valid token event", () => {
    const onToken = vi.fn();
    parseSSEBlock('event: token\ndata: {"text":"Hello world"}\n', { onToken });
    expect(onToken).toHaveBeenCalledWith({ text: "Hello world" });
  });

  it("parses valid replace event", () => {
    const onReplace = vi.fn();
    parseSSEBlock('event: replace\ndata: {"text":"Verified alternative"}\n', {
      onReplace,
    });
    expect(onReplace).toHaveBeenCalledWith({ text: "Verified alternative" });
  });

  it("parses valid final event with citations", () => {
    const onFinal = vi.fn();
    const finalData = {
      conversationId: "conv-1",
      messageId: "msg-1",
      citations: [
        {
          n: 1,
          documentId: "doc-1",
          fileName: "policy.pdf",
          pageNumber: 3,
          chunkIndex: 0,
        },
      ],
      verdict: "passed" as const,
    };
    parseSSEBlock(`event: final\ndata: ${JSON.stringify(finalData)}\n`, {
      onFinal,
    });
    expect(onFinal).toHaveBeenCalledWith(finalData);
  });

  it("parses error event", () => {
    const onError = vi.fn();
    parseSSEBlock(
      'event: error\ndata: {"code":"rate_limited","message":"Too fast"}\n',
      { onError },
    );
    expect(onError).toHaveBeenCalledWith({
      code: "rate_limited",
      message: "Too fast",
    });
  });

  it("parses done event", () => {
    const onDone = vi.fn();
    parseSSEBlock("event: done\ndata: {}\n", { onDone });
    expect(onDone).toHaveBeenCalled();
  });

  it("safely ignores unknown events", () => {
    const onStatus = vi.fn();
    parseSSEBlock('event: unknown_type\ndata: {"foo":"bar"}\n', { onStatus });
    expect(onStatus).not.toHaveBeenCalled();
  });

  it("safely ignores invalid JSON in data", () => {
    const onToken = vi.fn();
    parseSSEBlock("event: token\ndata: {unquoted_broken_json\n", { onToken });
    expect(onToken).not.toHaveBeenCalled();
  });
});

describe("parseSSEStream", () => {
  function createStream(chunks: string[]): ReadableStream<Uint8Array> {
    const encoder = new TextEncoder();
    let index = 0;
    return new ReadableStream({
      pull(controller) {
        if (index < chunks.length) {
          controller.enqueue(encoder.encode(chunks[index++]));
        } else {
          controller.close();
        }
      },
    });
  }

  it("handles partial chunks split across boundaries", async () => {
    const tokens: string[] = [];
    const chunks = [
      "event: to",
      'ken\ndata: {"te',
      'xt":"Hello "}\n\nevent: tok',
      'en\ndata: {"text":"world"}\n\n',
    ];

    await parseSSEStream(createStream(chunks), {
      onToken: (e) => tokens.push(e.text),
    });

    expect(tokens).toEqual(["Hello ", "world"]);
  });

  it("handles multiple events in a single chunk", async () => {
    const tokens: string[] = [];
    const done = vi.fn();
    const singleChunk =
      'event: token\ndata: {"text":"one"}\n\nevent: token\ndata: {"text":"two"}\n\nevent: done\ndata: {}\n\n';

    await parseSSEStream(createStream([singleChunk]), {
      onToken: (e) => tokens.push(e.text),
      onDone: done,
    });

    expect(tokens).toEqual(["one", "two"]);
    expect(done).toHaveBeenCalled();
  });
});
