import {z} from "zod";

// ---------------------------------------------------------------------------
// What we SAVE: strict limits that match the database.
// ---------------------------------------------------------------------------

export const SlideSchema = z.object({
  title: z.string().min(1).max(100),
  content: z.string().min(1).max(1000),
  // Required: the Slide table stores imagePrompt as a non-null column.
  imagePrompt: z.string().min(1).max(4000),
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

/** Kinds of visuals a slide can ask for. Diagrams and flowcharts suit teaching and "how it works" slides. */
export const VISUAL_TYPES = [
  "diagram",
  "flowchart",
  "timeline",
  "chart",
  "infographic",
  "illustration",
  "product_mockup",
  "photo",
] as const;
export type VisualType = (typeof VISUAL_TYPES)[number];

export const PitchDeckOutputSchema = z.object({
  title: z.string(),
  description: z.string(),
  // True when the idea is about teaching, learning, training or a course.
  isEducational: z.boolean(),
  slides: z.array(
    z.object({
      title: z.string(),
      content: z.string(),
      visualType: z.enum(VISUAL_TYPES),
      // What to draw: subject, layout, and how the parts connect.
      imagePrompt: z.string(),
      // Exact short labels to print in the image (empty = no text at all).
      imageText: z.array(z.string()),
    }),
  ),
});

export type PitchDeckOutput = z.infer<typeof PitchDeckOutputSchema>;

const clip = (value: string, max: number) => value.trim().slice(0, max);

export type PitchDeckOutputSlide = PitchDeckOutput["slides"][number];

/**
 * Trims the AI's deck to the saved limits, then validates it (throws if still invalid).
 * `buildImagePrompt` turns each slide's visual plan into the final prompt for the image model.
 */
export function toPitchDeck(
  output: PitchDeckOutput,
  buildImagePrompt: (slide: PitchDeckOutputSlide, index: number) => string,
): PitchDeck {
  return PitchDeckSchema.parse({
    title: clip(output.title, 100),
    description: clip(output.description, 500),
    slides: output.slides
      .map((slide, index) => ({
        title: clip(slide.title, 100),
        content: clip(slide.content, 1000),
        imagePrompt: clip(buildImagePrompt(slide, index), 4000) || slide.title.trim(),
      }))
      .filter((slide) => slide.title && slide.content)
      .slice(0, 20),
  });
}
