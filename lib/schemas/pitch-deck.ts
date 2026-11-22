import {z} from "zod";

export const SlideSchema = z.object({
  title: z.string().min(1).max(100),
  content: z.string().min(1).max(1000),
  imagePrompt: z.string().optional(),
});

export const PitchDeckSchema = z.object({
  title: z.string().min(1).max(100),
  description: z.string().min(1).max(500),
  slides: z.array(SlideSchema).min(1).max(20),
});

export type Slide = z.infer<typeof SlideSchema>;
export type PitchDeck = z.infer<typeof PitchDeckSchema>;