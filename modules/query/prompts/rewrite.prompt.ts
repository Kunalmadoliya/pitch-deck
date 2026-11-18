export const rewritePrompt = (message: string, history: string): string =>
  `Rewrite this into one standalone policy question. Do not answer it or add facts.\nHistory:\n${history}\nQuestion:\n${message}`;
