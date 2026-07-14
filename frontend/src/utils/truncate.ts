/**
 * Truncates a string to the specified maximum length.
 * If the string exceeds the limit, returns the first `maxLength` characters followed by "...".
 */
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) {
    return text
  }
  return text.slice(0, maxLength) + '...'
}
