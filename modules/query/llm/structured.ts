import type { z } from "zod";
import { fastModel } from "./models";

export async function callStructured<T extends z.ZodType>(
  schema: T, prompt: string, model = fastModel(),
): Promise<z.output<T>> {
  const runnable = model.withStructuredOutput(schema);
  try { return await runnable.invoke(prompt) as z.output<T>; }
  catch { return await runnable.invoke(`${prompt}\nReturn only valid structured output.`) as z.output<T>; }
}
