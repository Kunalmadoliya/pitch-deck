import { NonRetriableError } from "inngest";
import { DeckStatus, SlideImageStatus } from "@/lib/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { GuardrailError } from "@/modules/pitch-deck/guardrail";
import { generateSlideImage } from "@/modules/pitch-deck/image-generator";
import { uploadSlideImage } from "@/modules/pitch-deck/image-storage";
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
 *
 * Steps (all in the background):
 *   load-deck → mark-generating → generate-slides (GPT) → save-slides (deck still GENERATING)
 *   → image-<slideId> for every slide, all at once:
 *        prompt → OpenAI image model → base64 → Buffer → ImageKit upload → URL saved on the Slide
 *   → mark-complete (deck COMPLETE: only now does the user get the slides)
 *
 * Each image step returns only the URL, never the image bytes (Inngest step output has a size limit).
 * An image failure only marks that slide (FAILED / REFUSED); the deck is still delivered at the end.
 */
export const generateDeck = inngest.createFunction(
  {
    id: "generate-deck",
    name: "Generate pitch deck",
    retries: 2,
    // Inngest concurrency counts running STEPS, not runs. 2 made images draw two at a time;
    // 16 lets every slide image of two decks per user run at once.
    concurrency: { limit: 16, key: "event.data.userId" },
    idempotency: "event.data.deckId",
    triggers: [{ event: "deck/generate-deck" }],
    onFailure: async ({ event, error, step }) => {
      const { deckId } = event.data.event.data as { deckId: string };
      await step.run("stop-pending-images", () =>
        prisma.slide.updateMany({
          where: { deckId, imageStatus: SlideImageStatus.PENDING },
          data: { imageStatus: SlideImageStatus.FAILED, imageError: "Image generation was interrupted." },
        }),
      );
      await step.run("mark-failed", async () => {
        // If the slides were already written, still deliver them (some pictures may be missing).
        // Only a deck with no slides at all is FAILED.
        const slideCount = await prisma.slide.count({ where: { deckId } });
        await prisma.deck.updateMany({
          where: { id: deckId, status: { not: DeckStatus.COMPLETE } },
          data:
            slideCount > 0
              ? { status: DeckStatus.COMPLETE, errorMessage: null }
              : { status: DeckStatus.FAILED, errorMessage: errorText(error) },
        });
      });
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

    const slides = await step.run("save-slides", async () => {
      const [, saved] = await prisma.$transaction([
        prisma.slide.deleteMany({ where: { deckId } }),
        prisma.slide.createManyAndReturn({
          data: generated.slides.map((slide, index) => ({
            deckId,
            order: index,
            title: slide.title,
            content: slide.content,
            imagePrompt: slide.imagePrompt,
            imageStatus: SlideImageStatus.PENDING,
          })),
          select: { id: true, imagePrompt: true },
        }),
        prisma.deck.update({
          where: { id: deckId },
          // Title is shown while waiting; status stays GENERATING until every image is done.
          data: { title: generated.title },
        }),
      ]);
      return saved;
    });

    // One step per slide so a slow or failed image never redoes the others.
    const images = await Promise.all(
      slides.map((slide) =>
        step.run(`image-${slide.id}`, async () => {
          const result = await generateSlideImage(slide.imagePrompt);

          if (!result.ok) {
            await prisma.slide.updateMany({
              where: { id: slide.id },
              data: {
                imageStatus: result.reason === "refused" ? SlideImageStatus.REFUSED : SlideImageStatus.FAILED,
                imageError: result.message.slice(0, MAX_ERROR_LENGTH),
              },
            });
            return { slideId: slide.id, ok: false as const, reason: result.reason };
          }

          let uploaded: { url: string; fileId: string };
          try {
            uploaded = await uploadSlideImage({ buffer: result.buffer, mimeType: result.mimeType, userId, deckId, slideId: slide.id });
          } catch (error) {
            await prisma.slide.updateMany({
              where: { id: slide.id },
              data: { imageStatus: SlideImageStatus.FAILED, imageError: errorText(error) },
            });
            return { slideId: slide.id, ok: false as const, reason: "error" as const };
          }

          await prisma.slide.updateMany({
            where: { id: slide.id },
            data: {
              imageUrl: uploaded.url,
              imageFileId: uploaded.fileId,
              imageStatus: SlideImageStatus.COMPLETE,
              imageError: null,
            },
          });
          return { slideId: slide.id, ok: true as const, url: uploaded.url };
        }),
      ),
    );

    // Every image has finished (or failed). Only now hand the deck to the user.
    await step.run("mark-complete", () =>
      prisma.deck.updateMany({
        where: { id: deckId },
        data: { status: DeckStatus.COMPLETE },
      }),
    );

    return {
      deckId,
      slides: slides.length,
      images: images.filter((i) => i.ok).length,
    };
  },
);
