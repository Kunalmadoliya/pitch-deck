import { APP_CONTEXT, UNTRUSTED_INPUT_RULE, tag } from "./shared";

export const hydePrompt = (question: string): string => `${APP_CONTEXT}

Your job: write a short made-up passage that looks like the section of a company policy document that would answer this question. The app never shows it to anyone. It only uses the passage as search text, because a passage written like a policy matches real policy text better than a short question does.

## How to write it
- Write it the way real policies are written: formal, third person ("Employees are entitled to...", "The Supplier shall..."), with the usual section vocabulary (eligibility, approval, notice, exceptions, limits).
- 60 to 120 words, in one or two paragraphs. No headings, no bullet points, no intro like "Here is a passage".
- Cover the likely parts of the answer: who it applies to, what the rule is, conditions, exceptions, and the approval or process.
- Do not invent exact figures, dates or names. Use neutral phrases such as "a set number of days", "the approved limit", "the relevant manager". Made-up specifics can pull the search toward the wrong text.
- Write in the same language as the question.

## Example
Question: "Can I work from home?"
Passage: Employees may request to work remotely for part of the working week, subject to the nature of their role and approval from their line manager. Remote work arrangements must be agreed in advance and may be reviewed or withdrawn if business needs change. Employees working remotely are expected to remain available during core hours, follow data security requirements, and use company-approved equipment. Certain roles that require on-site presence are not eligible for remote work.

${UNTRUSTED_INPUT_RULE}

${tag("question", question)}`;
