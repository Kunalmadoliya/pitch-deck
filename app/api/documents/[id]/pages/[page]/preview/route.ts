import { auth } from "@/auth/auth";
import { prisma } from "@/lib/prisma";
import { createStorage } from "@/modules/indexing/storage/create-storage";
import { getPagePreview } from "@/modules/indexing/preview/render-page-preview";

type RouteContext = { params: Promise<{ id: string; page: string }> };

/** GET /api/documents/:id/pages/:page/preview -> a JPEG of that page, for the citation hover preview. */
export async function GET(request: Request, context: RouteContext): Promise<Response> {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { id, page } = await context.params;
  const pageNumber = Number(page);
  if (!Number.isInteger(pageNumber) || pageNumber < 1) {
    return Response.json({ error: "Invalid page number" }, { status: 400 });
  }

  // Only the owner can see their pages.
  const document = await prisma.document.findFirst({
    where: { id, userId: session.user.id },
    select: { id: true, storageFileId: true, mimeType: true, pageCount: true },
  });
  if (!document) return Response.json({ error: "Not found" }, { status: 404 });
  const lastPage = document.mimeType === "application/pdf" ? document.pageCount : 1;
  if (lastPage && pageNumber > lastPage) {
    return Response.json({ error: "Page does not exist" }, { status: 404 });
  }

  try {
    const image = await getPagePreview(createStorage(), document, pageNumber);
    return new Response(new Uint8Array(image), {
      headers: {
        "Content-Type": "image/jpeg",
        // Private: only this browser keeps it. A page never changes, so an hour is safe.
        "Cache-Control": "private, max-age=3600",
      },
    });
  } catch (error) {
    console.error("[page-preview] render failed", {
      errorName: error instanceof Error ? error.name : "UNKNOWN",
    });
    return Response.json({ error: "Unable to render page preview" }, { status: 502 });
  }
}
