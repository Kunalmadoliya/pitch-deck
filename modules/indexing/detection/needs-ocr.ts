export function needsOcr(text: string, threshold: number): boolean {
  return text.trim().length < threshold;
}
