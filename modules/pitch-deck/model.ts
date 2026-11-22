import { ChatOpenAI } from "@langchain/openai";
import { indexingConfig } from "@/modules/indexing/config";

const PITCH_DECK_MODEL = "gpt-4.1-mini";

/** Chat model for the pitch-deck agents, using the app's OpenAI key. */
export function pitchDeckModel(temperature = 0.7): ChatOpenAI {
  if (!indexingConfig.OPENAI_API_KEY) throw new Error("OPENAI_API_KEY is not configured");
  return new ChatOpenAI({
    apiKey: indexingConfig.OPENAI_API_KEY,
    model: PITCH_DECK_MODEL,
    temperature,
  });
}
