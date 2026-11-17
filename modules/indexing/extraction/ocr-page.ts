import { OcrError } from "../errors";
import { withOcrWorker } from "./ocr-worker";

export async function ocrPage(image: Buffer): Promise<{ text: string; confidence: number }> {
  try {
    return await withOcrWorker(async (worker) => {
      const result = await worker.recognize(image);
      return {
        text: result.data.text.trim(),
        confidence: result.data.confidence,
      };
    });
  } catch (error) {
    throw new OcrError("OCR processing failed", { cause: error });
  }
}
