import { z } from "zod";
import { auth } from "@/auth/auth";
import { prisma } from "@/lib/prisma";
import { inngest } from "@/inngest";
import { DeckStatus } from "@/lib/generated/prisma/client";

const CreateDeckSchema = z.object({
  idea: z.string().trim().min(20, "Project idea must be at least 20 characters.").max(4000),
});

/** Create a deck from a project idea and queue its generation. */
export async function POST(request: Request): Promise<Response> {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const parsed = CreateDeckSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return Response.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid project idea" },
      { status: 400 },
    );
  }

  const deck = await prisma.deck.create({
    data: { idea: parsed.data.idea, userId: session.user.id, status: DeckStatus.PENDING },
    select: { id: true, status: true },
  });
  await inngest.send({ name: "deck/generate-deck", data: { deckId: deck.id, userId: session.user.id } });
  return Response.json({ deckId: deck.id, status: deck.status }, { status: 202 });
}

/** List the user's decks, newest first. */
export async function GET(request: Request): Promise<Response> {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const decks = await prisma.deck.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    select: { id: true, title: true, idea: true, status: true, errorMessage: true, createdAt: true },
  });
  return Response.json({ decks });
}
