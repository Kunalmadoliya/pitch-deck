import { Pinecone } from "@pinecone-database/pinecone";
import { indexingConfig } from "../config";

export function createPineconeIndex() {
  if (!indexingConfig.PINECONE_API_KEY || !indexingConfig.PINECONE_INDEX) {
    throw new Error("Pinecone configuration is missing");
  }
  const client = new Pinecone({ apiKey: indexingConfig.PINECONE_API_KEY });
  return client.index(indexingConfig.PINECONE_INDEX);
}
