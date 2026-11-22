import { auth } from "@/auth/auth";
import { prisma } from "@/lib/prisma";

/** One deck with its slides in order (used to poll status and show the result). */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
): Promise<Response> {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const deck = await prisma.deck.findFirst({
    where: { id, userId: session.user.id },
    select: {
      id: true,
      title: true,
      idea: true,
      status: true,
      errorMessage: true,
      createdAt: true,
      slides: {
        orderBy: { order: "asc" },
        select: { id: true, order: true, title: true, content: true, imagePrompt: true, imageUrl: true },
      },
    },
  });
  if (!deck) return Response.json({ error: "Not found" }, { status: 404 });
  return Response.json({ deck });
}

/** Delete one of the user's decks (slides are removed by the cascade). */
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
): Promise<Response> {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const { count } = await prisma.deck.deleteMany({ where: { id, userId: session.user.id } });
  if (count === 0) return Response.json({ error: "Not found" }, { status: 404 });
  return new Response(null, { status: 204 });
}
