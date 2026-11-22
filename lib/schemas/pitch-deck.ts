import {z} from "zod";

// ---------------------------------------------------------------------------
// What we SAVE: strict limits that match the database.
// ---------------------------------------------------------------------------

export const SlideSchema = z.object({
  title: z.string().min(1).max(100),
  content: z.string().min(1).max(1000),
  // Required: the Slide table stores imagePrompt as a non-null column.
  imagePrompt: z.string().min(1).max(1000),
});

export const PitchDeckSchema = z.object({
  title: z.string().min(1).max(100),
  description: z.string().min(1).max(500),
  slides: z.array(SlideSchema).min(1).max(20),
});

export type Slide = z.infer<typeof SlideSchema>;
export type PitchDeck = z.infer<typeof PitchDeckSchema>;

// ---------------------------------------------------------------------------
// What we ask the AI for: same shape, no length limits.
// OpenAI strict structured output rejects some keywords (like minLength /
// maxLength) and needs every key required, so keep this schema plain and
// apply the limits afterwards with toPitchDeck().
// ---------------------------------------------------------------------------

export const PitchDeckOutputSchema = z.object({
  title: z.string(),
  description: z.string(),
  slides: z.array(
    z.object({
      title: z.string(),
      content: z.string(),
      imagePrompt: z.string(),
    }),
  ),
});

export type PitchDeckOutput = z.infer<typeof PitchDeckOutputSchema>;

const clip = (value: string, max: number) => value.trim().slice(0, max);

/** Trims the AI's deck to the saved limits, then validates it (throws if still invalid). */
export function toPitchDeck(output: PitchDeckOutput): PitchDeck {
  return PitchDeckSchema.parse({
    title: clip(output.title, 100),
    description: clip(output.description, 500),
    slides: output.slides
      .map((slide) => ({
        title: clip(slide.title, 100),
        content: clip(slide.content, 1000),
        imagePrompt: clip(slide.imagePrompt, 1000) || slide.title.trim(),
      }))
      .filter((slide) => slide.title && slide.content)
      .slice(0, 20),
  });
}
