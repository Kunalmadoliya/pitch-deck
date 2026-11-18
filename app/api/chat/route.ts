import { z } from "zod";
import { auth } from "@/auth/auth";
import { prisma } from "@/lib/prisma";
import { checkRateLimit } from "@/modules/query/rate-limit";
import { saveAssistantMessage, saveUserMessage } from "@/modules/query/history/save-messages";
import { runOutputGuard } from "@/modules/query/guardrails/output/run-output-guard";
import { runQueryPipeline } from "@/modules/query/pipeline/run-query-pipeline";
import { GuardrailBlockedError } from "@/modules/query/errors";
import { QueryError } from "@/modules/query/errors";

export const maxDuration = 60;
const bodySchema = z.object({ conversationId: z.string().optional(), message: z.string(), documentIds: z.array(z.string()).optional() });
const encoder = new TextEncoder();
function event(type: string, data: unknown): Uint8Array { return encoder.encode(`event: ${type}\ndata: ${JSON.stringify(data)}\n\n`); }

export async function POST(request: Request): Promise<Response> {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });
  if (!checkRateLimit(session.user.id)) return Response.json({ error: "Rate limit exceeded" }, { status: 429 });
  let input: z.output<typeof bodySchema>;
  try { input = bodySchema.parse(await request.json()); } catch { return Response.json({ error: "Invalid chat request" }, { status: 400 }); }
  let conversationId = input.conversationId;
  if (conversationId) {
    const owned = await prisma.conversation.findFirst({ where: { id: conversationId, userId: session.user.id }, select: { id: true } });
    if (!owned) return Response.json({ error: "Conversation not found" }, { status: 404 });
  } else {
    conversationId = (await prisma.conversation.create({ data: { userId: session.user.id, title: input.message.slice(0, 60) }, select: { id: true } })).id;
  }
  await saveUserMessage(conversationId, input.message);
  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      try {
        let completed: { answer: string; chunks: Parameters<typeof runOutputGuard>[1]; context: string } | undefined;
        for await (const item of runQueryPipeline({ userId: session.user.id, conversationId, message: input.message, documentIds: input.documentIds, signal: request.signal })) {
          if (item.type === "status") controller.enqueue(event("status", { stage: item.stage }));
          if (item.type === "token") controller.enqueue(event("token", { text: item.text }));
          if (item.type === "complete") completed = item;
        }
        if (!completed) throw new Error("Pipeline did not complete");
        const checked = await runOutputGuard(completed.answer, completed.chunks, completed.context);
        const answer = checked.valid ? completed.answer : "I couldn't verify this answer against your documents.";
        if (!checked.valid) controller.enqueue(event("replace", { text: answer }));
        const messageId = await saveAssistantMessage(conversationId, answer, checked.valid ? checked.citations : []);
        controller.enqueue(event("final", { conversationId, messageId, citations: checked.valid ? checked.citations : [], verdict: checked.valid ? "passed" : "replaced" }));
        controller.enqueue(event("done", {})); controller.close();
      } catch (error) {
        const code = error instanceof GuardrailBlockedError
          ? "blocked_by_guardrail"
          : error instanceof QueryError && error.code === "RETRIEVAL_FAILED"
            ? "retrieval_failed"
            : "generation_failed";
        controller.enqueue(event("error", { code, message: code === "blocked_by_guardrail" ? "I can't help with that request." : "Unable to answer right now." }));
        controller.enqueue(event("done", {})); controller.close();
      }
    },
  });
  return new Response(stream, { headers: { "Content-Type": "text/event-stream", "Cache-Control": "no-cache", Connection: "keep-alive" } });
}
