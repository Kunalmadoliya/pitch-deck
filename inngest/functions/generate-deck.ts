import { NonRetriableError } from "inngest";
import { DeckStatus } from "@/lib/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { GuardrailError } from "@/modules/pitch-deck/guardrail";
import { generatePitchDeck } from "@/modules/pitch-deck/pitch-deck-agent";
import { inngest } from "../client";

const MAX_ERROR_LENGTH = 500;

function errorText(error: unknown): string {
  const raw =
    error instanceof GuardrailError
      ? error.reason
      : error instanceof Error
        ? error.message
        : "Deck generation failed";
  return raw.slice(0, MAX_ERROR_LENGTH);
}

/**
 * Event: "deck/generate-deck" with data { deckId, userId }.
 * Steps: mark GENERATING → run the agent → save slides → mark COMPLETE.
 * Any final failure marks the deck FAILED with a readable message.
 */
export const generateDeck = inngest.createFunction(
  {
    id: "generate-deck",
    name: "Generate pitch deck",
    retries: 2,
    concurrency: 2,
    idempotency: "event.data.deckId",
    triggers: [{ event: "deck/generate-deck" }],
    onFailure: async ({ event, error, step }) => {
      const { deckId } = event.data.event.data as { deckId: string };
      await step.run("mark-failed", () =>
        prisma.deck.updateMany({
          where: { id: deckId },
          data: { status: DeckStatus.FAILED, errorMessage: errorText(error) },
        }),
      );
    },
  },
  async ({ event, step }) => {
    const { deckId, userId } = event.data as { deckId: string; userId: string };

    const deck = await step.run("load-deck", () =>
      prisma.deck.findFirst({ where: { id: deckId, userId }, select: { id: true, idea: true } }),
    );
    if (!deck) throw new NonRetriableError(`Deck ${deckId} not found`);

    await step.run("mark-generating", () =>
      prisma.deck.update({
        where: { id: deckId },
        data: { status: DeckStatus.GENERATING, errorMessage: null },
      }),
    );

    const generated = await step.run("generate-slides", async () => {
      try {
        return await generatePitchDeck(deck.idea);
      } catch (error) {
        // A guardrail "no" will not change on retry, so stop right away.
        if (error instanceof GuardrailError) throw new NonRetriableError(error.reason);
        throw error;
      }
    });

    await step.run("save-slides", () =>
      prisma.$transaction([
        prisma.slide.deleteMany({ where: { deckId } }),
        prisma.slide.createMany({
          data: generated.slides.map((slide, index) => ({
            deckId,
            order: index,
            title: slide.title,
            content: slide.content,
            imagePrompt: slide.imagePrompt,
          })),
        }),
        prisma.deck.update({
          where: { id: deckId },
          data: { title: generated.title, status: DeckStatus.COMPLETE },
        }),
      ]),
    );

    return { deckId, slides: generated.slides.length };
  },
);
