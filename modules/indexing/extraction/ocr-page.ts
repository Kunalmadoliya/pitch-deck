import { OcrError } from "../errors";
import { recognizeImage } from "./ocr-pool";

export async function ocrPage(image: Buffer): Promise<{ text: string; confidence: number }> {
  try {
    return await recognizeImage(image);
  } catch (error) {
    throw new OcrError("OCR processing failed", { cause: error });
  }
}
