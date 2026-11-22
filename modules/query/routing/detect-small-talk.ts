/**
 * Instant (no AI call) check for obvious small talk: greetings, thanks, goodbyes, "who are you".
 * Only short messages qualify, so "hi, what is the leave policy?" still goes to document search.
 * Anything less obvious is left to the AI router, which also has a "chat" route.
 */
const SMALL_TALK = [
  /^(hi+|hello+|hey+|hiya|yo|sup|namaste|hola|greetings|good (morning|afternoon|evening|day))( there| team| bot| assistant)?$/,
  /^(thanks?|thank you|thank u|thx|ty|many thanks|thanks a lot|thank you so much|great thanks|ok thanks|okay thanks)$/,
  /^(ok|okay|k|cool|nice|great|awesome|perfect|got it|understood|alright|sure|fine|good)$/,
  /^(bye|goodbye|see you|see ya|later|good night|take care|cya)$/,
  /^(how are you|how are you doing|how's it going|whats up|what's up|wassup)$/,
  /^(who are you|what are you|what is this|what can you do|what do you do|how does this work|help|how can you help( me)?)$/,
];

const MAX_WORDS = 6;

export function isSmallTalk(message: string): boolean {
  const normalized = message
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s']/gu, " ") // drop punctuation and emoji
    .replace(/\s+/g, " ")
    .trim();
  if (!normalized || normalized.split(" ").length > MAX_WORDS) return false;
  return SMALL_TALK.some((pattern) => pattern.test(normalized));
}
