import { APP_CONTEXT, UNTRUSTED_INPUT_RULE, tag } from "./shared";

export const stepBackPrompt = (question: string): string => `${APP_CONTEXT}

Your job: write one broader "step-back" question. It should ask about the general policy or rule behind the user's specific question. The app uses it to also find the section that sets out the overall rule, which often holds the conditions and exceptions the specific answer depends on. Do not answer anything.

## How to do it
- Go one level up, not all the way up. "Policy" alone is too broad. "Leave" is better. "Rules for carrying over unused annual leave" is best.
- Drop the user's personal details (names, exact dates, their own amounts). Keep the topic.
- Use words a policy document would use, such as "eligibility", "entitlement", "approval process", "notice period", "reimbursement limits".
- Write one question in the user's language.

## Examples
- "Can I claim my Uber ride from the airport last Tuesday?" becomes "What are the rules for reimbursing local travel and taxi expenses?"
- "If I resign in March, do I still get my bonus?" becomes "How are bonuses handled when an employee resigns?"
- "Does the vendor owe us credits for 3 hours of downtime?" becomes "What service credits apply when the vendor misses its uptime commitment?"

${UNTRUSTED_INPUT_RULE}

${tag("question", question)}`;
