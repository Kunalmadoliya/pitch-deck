import { indexingConfig } from "@/modules/indexing/config";

/**
 * Generates slide images with OpenAI's image model.
 *
 * Flow: prompt → OpenAI Images API → base64 → Buffer (returned to the caller, who uploads it).
 *
 * Like the Gemini generator this is based on:
 * - When an attempt fails for a temporary reason (429/5xx, timeout, network error, no image in the
 *   reply), it is retried once on the fallback model.
 * - Refusals (safety / moderation) are NOT retried, because the prompt itself has to change.
 * - The result says which kind of failure it was, so the caller can store a clear status.
 */

// Blank env values fall back to the defaults.
const IMAGE_MODEL = process.env.DECK_IMAGE_MODEL?.trim() || "gpt-image-2";
// Blank disables the retry on a second model.
const IMAGE_FALLBACK_MODEL = (process.env.DECK_IMAGE_FALLBACK_MODEL ?? "gpt-image-1.5").trim();
// "low" is the cheapest and fastest tier (about $0.005–0.006 per image on gpt-image-2, vs ~$0.05 at medium).
const IMAGE_QUALITY = process.env.DECK_IMAGE_QUALITY?.trim() || "low";
const REQUEST_TIMEOUT_MS = 120_000;

/** Landscape fits a 16:9 slide best. */
export const VALID_IMAGE_SIZES = ["1536x1024", "1024x1024", "1024x1536"] as const;
export type ImageSize = (typeof VALID_IMAGE_SIZES)[number];

const RETRYABLE_STATUS_CODES = new Set([408, 409, 429, 500, 502, 503, 504]);
const REFUSAL_CODES = new Set(["moderation_blocked", "content_policy_violation", "image_generation_user_error"]);

export type ImageFailureReason = "refused" | "transient" | "error";

export type ImageResult =
  | { ok: true; buffer: Buffer; mimeType: string; model: string }
  | { ok: false; reason: ImageFailureReason; message: string };

type Attempt =
  | { ok: true; buffer: Buffer; mimeType: string }
  | { ok: false; reason: ImageFailureReason; message: string };

export async function generateSlideImage(
  prompt: string,
  options: { size?: ImageSize; apiKey?: string } = {},
): Promise<ImageResult> {
  if (!prompt.trim()) return { ok: false, reason: "error", message: "Prompt cannot be blank" };
  const apiKey = options.apiKey ?? indexingConfig.OPENAI_API_KEY;
  if (!apiKey) return { ok: false, reason: "error", message: "OPENAI_API_KEY is not configured" };
  const size = options.size ?? "1536x1024";

  const models = [...new Set([IMAGE_MODEL, IMAGE_FALLBACK_MODEL].filter(Boolean))];
  let last: Attempt = { ok: false, reason: "error", message: "No image model configured" };

  for (const [attempt, model] of models.entries()) {
    const started = Date.now();
    last = await attemptGeneration({ prompt, model, size, apiKey });
    log(last.ok ? "info" : "warn", {
      model,
      attempt,
      latencyMs: Date.now() - started,
      outcome: last.ok ? "ok" : last.reason,
      ...(last.ok ? {} : { message: last.message }),
    });

    if (last.ok) return { ...last, model };
    // Only a temporary failure is worth trying again on the next model.
    if (last.reason !== "transient") break;
  }
  return last;
}

async function attemptGeneration(input: {
  prompt: string;
  model: string;
  size: ImageSize;
  apiKey: string;
}): Promise<Attempt> {
  let response: Response;
  try {
    response = await fetch("https://api.openai.com/v1/images/generations", {
      method: "POST",
      headers: { Authorization: `Bearer ${input.apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: input.model,
        prompt: input.prompt,
        size: input.size,
        quality: IMAGE_QUALITY,
        output_format: "png",
        n: 1,
      }),
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    });
  } catch (error) {
    // Timeouts and network errors.
    return { ok: false, reason: "transient", message: error instanceof Error ? error.message : "Network error" };
  }

  const body = (await response.json().catch(() => null)) as {
    data?: Array<{ b64_json?: string }>;
    error?: { message?: string; code?: string | null; type?: string };
  } | null;

  if (!response.ok) {
    const code = body?.error?.code ?? body?.error?.type ?? "";
    const message = `API error ${response.status}: ${body?.error?.message ?? "Unknown error"}`;
    if (REFUSAL_CODES.has(code)) return { ok: false, reason: "refused", message };
    // A retired or unavailable model: the fallback model may still work.
    if (response.status === 404 || code === "model_not_found" || /does not exist/i.test(message)) {
      return { ok: false, reason: "transient", message };
    }
    return { ok: false, reason: RETRYABLE_STATUS_CODES.has(response.status) ? "transient" : "error", message };
  }

  const b64 = body?.data?.[0]?.b64_json;
  if (!b64) return { ok: false, reason: "transient", message: "No image in the response" };

  return { ok: true, buffer: Buffer.from(b64, "base64"), mimeType: "image/png" };
}

function log(level: "info" | "warn", fields: Record<string, unknown>) {
  const line = JSON.stringify({ source: "deck-image", ...fields });
  if (level === "warn") console.warn(line);
  else console.info(line);
}
