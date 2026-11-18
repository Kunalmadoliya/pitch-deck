import type { Citation } from "./api/chat-types";

export type TextSegment =
  | { type: "text"; value: string }
  | { type: "citation"; n: number; citation?: Citation };

export function parseCitationSegments(
  text: string,
  citations?: Citation[] | null,
): TextSegment[] {
  if (!text) return [];

  const citationMap = new Map<number, Citation>();
  if (citations) {
    for (const c of citations) {
      citationMap.set(c.n, c);
    }
  }

  const regex = /\[(\d+)\]/g;
  const segments: TextSegment[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(text)) !== null) {
    const matchStart = match.index;
    const matchEnd = regex.lastIndex;
    const n = parseInt(match[1], 10);

    if (matchStart > lastIndex) {
      segments.push({
        type: "text",
        value: text.slice(lastIndex, matchStart),
      });
    }

    const citation = citationMap.get(n);
    if (citation) {
      segments.push({
        type: "citation",
        n,
        citation,
      });
    } else {
      // If no matching citation exists, keep it as plain text
      segments.push({
        type: "text",
        value: match[0],
      });
    }

    lastIndex = matchEnd;
  }

  if (lastIndex < text.length) {
    segments.push({
      type: "text",
      value: text.slice(lastIndex),
    });
  }

  return segments;
}

export function stripCitations(text: string): string {
  return text
    .replace(/\s*\[\d+\]/g, "")
    .replace(/\s{2,}/g, " ")
    .trim();
}
