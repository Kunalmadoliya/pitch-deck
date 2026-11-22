import { auth } from "@/auth/auth";
import { prisma } from "@/lib/prisma";
import { deleteSlideImages } from "@/modules/pitch-deck/image-storage";

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
        select: {
          id: true,
          order: true,
          title: true,
          content: true,
          imagePrompt: true,
          imageUrl: true,
          imageStatus: true,
        },
      },
    },
  });
  if (!deck) return Response.json({ error: "Not found" }, { status: 404 });

  // Slides are only handed out once EVERYTHING (text + every image) is finished.
  // Until then the client gets progress numbers to show, but no slides.
  const { slides, ...rest } = deck;
  const progress = {
    slidesWritten: slides.length,
    imagesDone: slides.filter((s) => s.imageStatus !== "PENDING").length,
  };
  return Response.json({
    deck: { ...rest, slides: deck.status === "COMPLETE" ? slides : [], progress },
  });
}

/** Delete one of the user's decks (slides are removed by the cascade). */
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
): Promise<Response> {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const images = await prisma.slide.findMany({
    where: { deckId: id, deck: { userId: session.user.id }, imageFileId: { not: null } },
    select: { imageFileId: true },
  });
  const { count } = await prisma.deck.deleteMany({ where: { id, userId: session.user.id } });
  if (count === 0) return Response.json({ error: "Not found" }, { status: 404 });
  // Best effort: a failed cleanup only leaves an orphan image, it should not fail the delete.
  await deleteSlideImages(images.flatMap((s) => (s.imageFileId ? [s.imageFileId] : []))).catch(() => undefined);
  return new Response(null, { status: 204 });
}
