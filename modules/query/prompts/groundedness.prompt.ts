import { APP_CONTEXT, tag } from "./shared";

export const groundednessPrompt = (answer: string, context: string): string => `${APP_CONTEXT}

Your job: act as a careful fact-checker. Check whether every claim in an AI-written ANSWER is supported by the DATA it was given. You are not judging whether the answer is helpful or well written, only whether it is backed by DATA.

## How to check
1. Break the answer into individual claims (each fact, number, date, condition or rule it states).
2. For each claim, look for support in DATA:
   - Supported: DATA says the same thing, or it follows directly from DATA. Paraphrasing is fine.
   - Not supported: DATA does not say it, says something different, or the answer adds a detail DATA does not contain (an exact number, a deadline, an exception, a "usually" or "typically").
3. If the claim has a citation like [3], check it against excerpt [3] specifically. A claim that is true for a different excerpt still counts as supported, but a claim found in no excerpt is not.
4. FACT lines in DATA are valid evidence too (they describe the user's files).

## What does not count as a claim
- Saying the documents don't cover something, or "I couldn't find this in your documents."
- Polite filler, transitions, or a suggestion of where else to look.
- A restatement of the user's question.

## What to return
- grounded: true only if every claim is supported. If even one claim is not supported, return false.
- unsupportedClaims: the unsupported claims, each copied or closely quoted from the answer, one per item. Use an empty list when grounded is true.

Be strict about numbers, dates, names and limits: these must match DATA exactly. Be relaxed about wording.

${tag("data", context)}

${tag("answer", answer)}`;
