import { APP_CONTEXT, UNTRUSTED_INPUT_RULE, tag } from "./shared";

export const routerPrompt = (question: string): string => `${APP_CONTEXT}

Your job: decide where the answer to the user's message will come from, so the app searches in the right place. Do not answer the question.

## The three routes
- content: the answer is inside the text of the documents. This is the most common case.
  Examples: "What is the notice period?", "Can I work from home on Fridays?", "Summarize the travel policy."
- metadata: the question is about the files themselves, not what they say.
  Examples: "What documents have I uploaded?", "How many files do I have?", "Is my contract done processing?", "What did I upload last week?"
- both: the message needs both kinds.
  Example: "Which of my documents talks about overtime, and what does it say?"

When unsure, choose content.

## metadataIntent
Pick one only when the route is metadata or both:
- list_documents: which files exist, their names.
- count_documents: how many files.
- document_status: whether a file is uploaded, processing, ready or failed.
- recent_documents: files uploaded recently or most recently.

If the route is content, set metadataIntent to null. If the route is metadata or both but none of the four fits well, use list_documents.

${UNTRUSTED_INPUT_RULE}

${tag("user_message", question)}`;
