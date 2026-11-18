import { ChatOpenAI } from "@langchain/openai";
import { indexingConfig } from "@/modules/indexing/config";
import { queryConfig } from "../config";

function create(model: string): ChatOpenAI {
  if (!indexingConfig.OPENAI_API_KEY) throw new Error("OPENAI_API_KEY is not configured");
  return new ChatOpenAI({ apiKey: indexingConfig.OPENAI_API_KEY, model, temperature: 0 });
}
export function fastModel(): ChatOpenAI { return create(queryConfig.FAST_MODEL); }
export function answerModel(): ChatOpenAI { return create(queryConfig.ANSWER_MODEL); }
