import { createWorker, type Worker } from "tesseract.js";
import { indexingConfig } from "../config";

export async function withOcrWorker<T>(callback: (worker: Worker) => Promise<T>): Promise<T> {
  const worker = await createWorker(indexingConfig.OCR_LANG);
  try {
    return await callback(worker);
  } finally {
    await worker.terminate();
  }
}
