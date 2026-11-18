import { auth } from "@/auth/auth";
import { prisma } from "@/lib/prisma";
type Context = { params: Promise<{ id: string }> };
export async function GET(request: Request, context: Context): Promise<Response> {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await context.params;
  const conversation = await prisma.conversation.findFirst({ where: { id, userId: session.user.id }, include: { messages: { orderBy: { createdAt: "asc" } } } });
  return conversation ? Response.json(conversation) : Response.json({ error: "Not found" }, { status: 404 });
}
export async function DELETE(request: Request, context: Context): Promise<Response> {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await context.params;
  const result = await prisma.conversation.deleteMany({ where: { id, userId: session.user.id } });
  return result.count ? new Response(null, { status: 204 }) : Response.json({ error: "Not found" }, { status: 404 });
}
