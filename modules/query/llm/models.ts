import {ChatOpenAI, tools} from "@langchain/openai";
import {indexingConfig} from "@/modules/indexing/config";
import {queryConfig} from "../config";

function create(model: string): ChatOpenAI {
  if (!indexingConfig.OPENAI_API_KEY)
    throw new Error("OPENAI_API_KEY is not configured");
  return new ChatOpenAI({
    apiKey: indexingConfig.OPENAI_API_KEY,
    model,
    temperature: 0,
  });
}

export async function generateImage(prompt: string): Promise<string> {
  if (!indexingConfig.OPENAI_API_KEY)
    throw new Error("OPENAI_API_KEY is not configured");

  const model = new ChatOpenAI({
    apiKey: indexingConfig.OPENAI_API_KEY,
    model: "gpt-4o-mini",
    useResponsesApi: true,
  }).bindTools([tools.imageGeneration({size: "1024x1024"})]);

  const res = await model.invoke(prompt);

  // the image comes back as base64 inside the tool output.
  // additional_kwargs is loosely typed, so we tell TS what tool_outputs holds.
  const outputs = (res.additional_kwargs.tool_outputs ?? []) as Array<{
    type: string;
    result?: string;
  }>;
  const img = outputs.find((o) => o.type === "image_generation_call");
  if (!img?.result) throw new Error("No image returned");
  return img.result; // base64 PNG -> use as `data:image/png;base64,${...}`
}

export function fastModel(): ChatOpenAI {
  return create(queryConfig.FAST_MODEL);
}
export function answerModel(): ChatOpenAI {
  return create(queryConfig.ANSWER_MODEL);
}
