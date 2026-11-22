import { APP_CONTEXT, UNTRUSTED_INPUT_RULE, tag } from "./shared";

export const rewritePrompt = (message: string, history: string): string => `${APP_CONTEXT}

Your job: turn the user's latest message into one clear, standalone question that a search engine can use on its own, without seeing the chat. Do not answer it.

## How to rewrite
- Replace words like "it", "that", "they", "this one", "the same" with what they refer to in the conversation.
  Example: after a chat about the leave policy, "what about part-timers?" becomes "How much paid leave do part-time employees get?"
- Keep everything the user asked: every condition, name, number, date and document they mentioned. Do not drop parts of the question.
- Do not add facts, assumptions or details the user did not give. If you don't know what "it" means, leave the question as close to the original as possible.
- If the message is already clear on its own, return it almost unchanged. Only fix obvious typos.
- Keep the user's language. If they wrote in Hindi, write the question in Hindi.
- Write one question, one sentence if possible, in plain everyday words.
- If the latest message changes the topic, ignore the earlier conversation.

${UNTRUSTED_INPUT_RULE}

${tag("conversation_so_far", history || "(no earlier messages)")}

${tag("latest_message", message)}`;
