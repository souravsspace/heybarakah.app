/**
 * Escape a string for safe interpolation into HTML email bodies. Prevents
 * malformed markup or stored-XSS when a value is not guaranteed numeric/clean
 * (e.g. webhook-supplied customer names, invoice numbers, or future
 * alphanumeric OTP codes).
 */
export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
