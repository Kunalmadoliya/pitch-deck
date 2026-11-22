import { APP_CONTEXT, UNTRUSTED_INPUT_RULE, tag } from "./shared";

export const subQueriesPrompt = (question: string): string => `${APP_CONTEXT}

Your job: split the user's question into smaller search questions, so the app can find every part of the answer, even when the parts sit in different sections or documents. Do not answer anything.

## How to do it
- Write at most 3 questions. Each one should cover one distinct part of the original question.
- Every question must make sense on its own. Repeat the topic in each one instead of writing "it" or "that".
- Together, the questions should cover everything the user asked. Do not add new topics.
- Do not rephrase the same question several ways. Each one should look for different information.
- If the question is already simple and about one thing, return just that one question, lightly cleaned up. Do not force a split.
- Write in the user's language, using words a policy document would likely use.

## Examples
- "What's the notice period and do I get paid for unused leave when I quit?"
  becomes: "What is the notice period when an employee resigns?" and "Is unused leave paid out when an employee leaves the company?"
- "Compare the uptime promise and the penalty in the vendor SLA"
  becomes: "What uptime does the vendor commit to in the SLA?" and "What penalties or service credits apply if the vendor misses the uptime target?"
- "What is the dress code?"
  becomes just: "What is the dress code?"

${UNTRUSTED_INPUT_RULE}

${tag("question", question)}`;
