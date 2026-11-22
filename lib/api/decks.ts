export type DeckStatus = "PENDING" | "GENERATING" | "COMPLETE" | "FAILED";

export interface DeckSummary {
  id: string;
  title: string | null;
  idea: string;
  status: DeckStatus;
  errorMessage: string | null;
  createdAt: string;
}

export interface DeckSlide {
  id: string;
  order: number;
  title: string;
  content: string;
  imagePrompt: string;
  imageUrl: string | null;
}

export interface DeckDetail extends DeckSummary {
  slides: DeckSlide[];
}

export const MIN_IDEA_CHARS = 20;
export const MAX_IDEA_CHARS = 4000;

export const deckKeys = {
  all: ["decks"] as const,
  list: () => [...deckKeys.all, "list"] as const,
  detail: (id: string) => [...deckKeys.all, "detail", id] as const,
};

export function isDeckBusy(status: DeckStatus): boolean {
  return status === "PENDING" || status === "GENERATING";
}

async function readError(response: Response, fallback: string): Promise<Error> {
  if (response.status === 401) return new Error("Your session has expired. Please sign in again.");
  const body = (await response.json().catch(() => null)) as { error?: string } | null;
  return new Error(body?.error ?? fallback);
}

export async function fetchDecks(): Promise<DeckSummary[]> {
  const response = await fetch("/api/decks", { credentials: "include" });
  if (!response.ok) throw await readError(response, "Failed to load decks.");
  const body = (await response.json()) as { decks: DeckSummary[] };
  return body.decks;
}

export async function fetchDeck(id: string): Promise<DeckDetail> {
  const response = await fetch(`/api/decks/${id}`, { credentials: "include" });
  if (!response.ok) {
    if (response.status === 404) throw new Error("Deck not found.");
    throw await readError(response, "Failed to load deck.");
  }
  const body = (await response.json()) as { deck: DeckDetail };
  return body.deck;
}

export async function createDeckApi(idea: string): Promise<{ deckId: string }> {
  const response = await fetch("/api/decks", {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ idea }),
  });
  if (!response.ok) throw await readError(response, "Could not start the deck.");
  return response.json();
}

export async function deleteDeckApi(id: string): Promise<void> {
  const response = await fetch(`/api/decks/${id}`, { method: "DELETE", credentials: "include" });
  if (!response.ok && response.status !== 404) throw await readError(response, "Could not delete the deck.");
}
