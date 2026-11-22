import type { PitchDeckOutputSlide, VisualType } from "@/lib/schemas/pitch-deck";

/** How each visual type should look. Kept short: image models follow short, concrete direction best. */
const VISUAL_STYLE: Record<VisualType, string> = {
  diagram:
    "A clear explanatory diagram: labelled parts connected with simple arrows or lines, like a good textbook figure.",
  flowchart:
    "A left-to-right flowchart: 3 to 5 rounded boxes joined by arrows, showing the steps in order.",
  timeline:
    "A horizontal timeline with 3 to 5 evenly spaced milestones on one line.",
  chart:
    "A simple, clean chart (bar chart or nested circles) with large shapes and only the given labels.",
  infographic:
    "A tidy infographic: 3 to 4 icon blocks in a grid, each with one short label.",
  illustration:
    "A friendly flat vector illustration of the scene, simple shapes, no clutter.",
  product_mockup:
    "A modern device mockup (laptop or phone) showing a simplified app screen made of blocks and icons.",
  photo:
    "A realistic, well-lit editorial photograph of the scene, shallow depth of field.",
};

const HOUSE_STYLE =
  "Style: clean and modern, made for a 16:9 presentation slide. Palette: deep blue (#2563eb), white, " +
  "soft greys, one warm accent. Plenty of empty space. No logos, brand names, watermarks, signatures, " +
  "UI chrome or borders.";

const MAX_LABELS = 6;
const MAX_LABEL_WORDS = 4;

/** Keeps labels short and clean, because long or many labels are where image models misspell. */
function cleanLabels(labels: string[]): string[] {
  return labels
    .map((label) => label.replace(/["“”]/g, "").replace(/\s+/g, " ").trim())
    .filter(Boolean)
    .map((label) => label.split(" ").slice(0, MAX_LABEL_WORDS).join(" "))
    .slice(0, MAX_LABELS);
}

function textRule(labels: string[]): string {
  if (labels.length === 0) {
    return "Text: none. Do not draw any letters, words, numbers or fake writing anywhere.";
  }
  const quoted = labels.map((l) => `"${l}"`).join(", ");
  return (
    `Text: draw ONLY these labels, each spelled exactly as written, in a clean bold sans-serif font, ` +
    `large and easy to read: ${quoted}. Do not add any other words, letters or numbers, ` +
    `and do not draw blurry or made-up text.`
  );
}

/**
 * Turns the agent's visual plan for one slide into the final image-model prompt.
 * Flow: deck topic + slide title → visual type style → scene → exact text rule → house style.
 */
export function buildSlideImagePrompt(
  slide: PitchDeckOutputSlide,
  context: { deckTitle: string; isEducational: boolean },
): string {
  const labels = cleanLabels(slide.imageText);
  const purpose = context.isEducational
    ? "It should help a learner understand the idea at a glance."
    : "It should help an investor understand the point at a glance.";

  return [
    `Create a visual for a pitch deck slide titled "${slide.title.trim()}" (deck: "${context.deckTitle.trim()}").`,
    VISUAL_STYLE[slide.visualType] ?? VISUAL_STYLE.illustration,
    `Scene: ${slide.imagePrompt.trim()}`,
    purpose,
    textRule(labels),
    HOUSE_STYLE,
  ].join("\n");
}
