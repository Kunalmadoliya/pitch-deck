export const subQueriesPrompt = (question: string): string => `Create 2 or 3 independent smaller policy questions covering this question. Return fewer if simple.\n${question}`;
