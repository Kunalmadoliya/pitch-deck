export const hydePrompt = (question: string): string => `Write a short hypothetical company-policy passage that could answer this question. It is search text only; do not claim facts.\n${question}`;
