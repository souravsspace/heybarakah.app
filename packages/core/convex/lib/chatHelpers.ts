export const TITLE_MAX_LENGTH = 48;

export function deriveTitle(text: string): string {
  const trimmed = text.trim().replace(/\s+/g, " ");
  if (trimmed.length <= TITLE_MAX_LENGTH) {
    return trimmed || "New conversation";
  }
  return `${trimmed.slice(0, TITLE_MAX_LENGTH - 1)}…`;
}
