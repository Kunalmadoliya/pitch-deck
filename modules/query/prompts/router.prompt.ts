import { APP_CONTEXT, UNTRUSTED_INPUT_RULE, tag } from "./shared";
import type { HistoryMessage } from "../types";

/** Last few turns, so short follow-ups ("and for part-time staff?") are routed as the topic they continue. */
function recentTurns(history: HistoryMessage[]): string {
  const last = history.slice(-4);
  if (last.length === 0) return "";
  const text = last.map((m) => `${m.role === "USER" ? "User" : "Assistant"}: ${m.content.slice(0, 300)}`).join("\n");
  return `\n\n${tag("recent_conversation", text)}`;
}

export const routerPrompt = (question: string, history: HistoryMessage[] = []): string => `${APP_CONTEXT}

Your job: decide where the answer to the user's message will come from, so the app searches in the right place. Do not answer the question.

## The four routes
- content: the answer is inside the text of the documents. This is the most common case.
  Examples: "What is the notice period?", "Can I work from home on Fridays?", "Summarize the travel policy."
- metadata: the question is about the files themselves, not what they say.
  Examples: "What documents have I uploaded?", "How many files do I have?", "Is my contract done processing?", "What did I upload last week?"
- both: the message needs both kinds.
  Example: "Which of my documents talks about overtime, and what does it say?"
- chat: the message needs no document search at all.
  - Greetings, thanks, goodbyes, small talk: "hi", "thanks a lot!", "how are you?", "good morning"
  - Questions about you or the app: "who are you?", "what can you do?", "how do I upload a file?"
  - General questions with no link to the user's company or documents: "what is 15% of 2400?", "what does GDPR stand for?", "explain what an SLA is"

## How to choose
- If the message could be answered by the user's documents (any rule, policy, benefit, contract term, deadline,
  amount, process, or "what does my company say about..."), choose content, even when it is phrased casually.
- A short follow-up to an earlier document question ("and for interns?", "what about weekends?") continues
  that topic: choose content, not chat.
- Choose chat only when searching the documents would clearly not help.
- When unsure between chat and content, choose content.

## metadataIntent
Pick one only when the route is metadata or both:
- list_documents: which files exist, their names.
- count_documents: how many files.
- document_status: whether a file is uploaded, processing, ready or failed.
- recent_documents: files uploaded recently or most recently.

If the route is content or chat, set metadataIntent to null. If the route is metadata or both but none of the four fits well, use list_documents.

${UNTRUSTED_INPUT_RULE}${recentTurns(history)}

${tag("user_message", question)}`;
