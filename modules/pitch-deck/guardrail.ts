import { createAgent, createMiddleware, HumanMessage } from "langchain";
import { z } from "zod";
import { pitchDeckModel } from "./model";

/** Thrown when a guardrail blocks a request, so callers can show `reason` to the user. */
export class GuardrailError extends Error {
  constructor(
    public readonly guardrail: string,
    public readonly reason: string,
  ) {
    super(`[${guardrail}] ${reason}`);
    this.name = "GuardrailError";
  }
}

/** Turn a message's content (string or content blocks) into plain text. */
function contentToText(content: unknown): string {
  if (typeof content === "string") return content;
  if (Array.isArray(content)) {
    return content
      .map((block) =>
        typeof block === "string"
          ? block
          : block && typeof block === "object" && "text" in block
            ? String((block as { text: unknown }).text)
            : "",
      )
      .join(" ");
  }
  return "";
}

// ---------------------------------------------------------------------------
// INPUT GUARDRAIL — runs BEFORE the agent, checks the user's project idea
// ---------------------------------------------------------------------------

const MIN_IDEA_LENGTH = 20;

/**
 * Rejects ideas that are too short to generate a meaningful pitch deck.
 * This is a simple rule-based guardrail — no extra AI call needed.
 */
export const validProjectIdeaGuardrail = createMiddleware({
  name: "valid_project_idea",
  beforeAgent: (state) => {
    const lastUserMessage = [...state.messages]
      .reverse()
      .find((m) => HumanMessage.isInstance(m));
    const text = contentToText(lastUserMessage?.content).trim();

    if (text.length < MIN_IDEA_LENGTH) {
      throw new GuardrailError(
        "valid_project_idea",
        `Project idea must be at least ${MIN_IDEA_LENGTH} characters.`,
      );
    }
    return undefined;
  },
});

// ---------------------------------------------------------------------------
// OUTPUT GUARDRAIL — runs AFTER the agent, checks the generated deck
// ---------------------------------------------------------------------------

/** What the quality-checker agent returns (structured output). */
const QualityCheckSchema = z.object({
  isValid: z.boolean(),
  // OpenAI strict mode needs every key required, so "no reason" is null, not missing.
  reason: z.string().nullable(),
});

const QUALITY_CHECK_PROMPT = `You are a quality checker. You receive one generated startup pitch deck as JSON.
The deck can be about ANY business, product or industry (for example a marketplace, a SaaS tool,
a restaurant app, an education product, hardware, services). The topic itself is never a reason to reject.

Only check the deck's quality and safety. Return isValid: false ONLY if at least one of these is clearly true:
- Profanity, hate speech, sexual content, or violent content
- Placeholder text such as "TBD", "lorem ipsum", "[insert here]", "coming soon", "XYZ Company"
- A slide whose title or content is empty, or is meaningless filler that says nothing about the idea
- The JSON is not a pitch deck at all (for example a poem, a recipe, or a refusal message)

Ignore the extra planning fields (isEducational, visualType, imagePrompt, imageText); they are instructions for drawing pictures.
When in doubt, return isValid: true.

If invalid, give a short, plain reason the user can act on. If valid, set reason to null.`;

let qualityChecker: ReturnType<typeof buildQualityChecker> | undefined;

function buildQualityChecker() {
  return createAgent({
    name: "PitchDeckQualityChecker",
    model: pitchDeckModel(0),
    systemPrompt: QUALITY_CHECK_PROMPT,
    responseFormat: QualityCheckSchema,
  });
}

/** Lazily created so importing this file never crashes when the API key is missing. */
function getQualityChecker() {
  qualityChecker ??= buildQualityChecker();
  return qualityChecker;
}

export const pitchDeckQualityGuardrail = createMiddleware({
  name: "pitch_deck_quality",
  afterAgent: async (state) => {
    // Prefer the structured deck; fall back to the last message's text.
    const structured = (state as { structuredResponse?: unknown }).structuredResponse;
    const deckJson =
      structured !== undefined
        ? JSON.stringify(structured, null, 2)
        : contentToText(state.messages.at(-1)?.content);

    const result = await getQualityChecker().invoke({
      messages: [new HumanMessage(deckJson)],
    });
    const check = QualityCheckSchema.parse(result.structuredResponse);

    if (!check.isValid) {
      throw new GuardrailError(
        "pitch_deck_quality",
        check.reason ?? "Deck failed quality checks.",
      );
    }
    return undefined;
  },
});
