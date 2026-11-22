import { describe, expect, it } from "vitest";
import { isSmallTalk } from "../routing/detect-small-talk";

describe("isSmallTalk", () => {
  it.each(["hi", "Hello!", "hey there", "Good morning", "thanks!!", "Thank you so much", "ok", "bye 👋", "how are you?", "Who are you?", "what can you do", "namaste"])(
    "treats %j as small talk",
    (message) => expect(isSmallTalk(message)).toBe(true),
  );

  it.each([
    "hi, what is the notice period?",
    "What is the leave policy?",
    "thanks, and what about part-time staff?",
    "how many sick days do I get",
    "can I work from home on Fridays",
    "",
  ])("sends %j to the normal pipeline", (message) => expect(isSmallTalk(message)).toBe(false));
});
