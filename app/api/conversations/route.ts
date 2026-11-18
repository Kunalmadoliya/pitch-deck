import { auth } from "@/auth/auth";
import { prisma } from "@/lib/prisma";
export async function GET(request: Request): Promise<Response> {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });
  return Response.json(await prisma.conversation.findMany({
    where: { userId: session.user.id }, orderBy: { updatedAt: "desc" },
    select: { id: true, title: true, createdAt: true, updatedAt: true },
  }));
}
