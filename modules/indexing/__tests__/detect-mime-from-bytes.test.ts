import { describe, expect, it } from "vitest";
import { detectMimeFromBytes } from "../detection/detect-mime-from-bytes";

describe("detectMimeFromBytes", () => {
  it("detects the supported magic bytes", () => {
    expect(detectMimeFromBytes(Buffer.from("%PDF-1.7"))).toBe("application/pdf");
    expect(detectMimeFromBytes(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))).toBe("image/png");
    expect(detectMimeFromBytes(Buffer.from([0xff, 0xd8, 0xff, 0xe0]))).toBe("image/jpeg");
    expect(detectMimeFromBytes(Buffer.from("RIFF1234WEBPdata"))).toBe("image/webp");
  });

  it("returns null for unknown content", () => {
    expect(detectMimeFromBytes(Buffer.from("not a document"))).toBeNull();
  });
});
