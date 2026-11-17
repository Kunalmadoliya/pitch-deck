import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { indexingConfig } from "../config";
import type { Chunk, PageText } from "../types";

export async function chunkPage(
  page: PageText,
  options: { chunkSize?: number; chunkOverlap?: number } = {},
): Promise<Chunk[]> {
  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: options.chunkSize ?? indexingConfig.CHUNK_SIZE,
    chunkOverlap: options.chunkOverlap ?? indexingConfig.CHUNK_OVERLAP,
  });
  const documents = await splitter.createDocuments([page.text]);
  return documents.map((document, chunkIndex) => ({
    pageNumber: page.pageNumber,
    chunkIndex,
    text: document.pageContent,
    source: page.source,
    ocrConfidence: page.ocrConfidence,
  }));
}
