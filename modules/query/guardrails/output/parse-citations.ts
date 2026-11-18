export function parseCitations(answer: string): number[] {
  return [...new Set([...answer.matchAll(/\[(\d+)\]/g)].map((match) => Number(match[1])))];
}
