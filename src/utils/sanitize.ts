/**
 * @module sanitize
 * @description XSS sanitisation helpers. Call sanitizeText() before
 * rendering any string that originated from user input or external sources.
 */
import DOMPurify from 'dompurify'

/**
 * Strips all HTML and script content from a user string.
 * @param {string} input - Raw string from user input or external data
 * @returns {string} Safe plain text
 */
export function sanitizeText(input: string) {
  if (typeof input !== 'string') return ''
  return DOMPurify.sanitize(input, { ALLOWED_TAGS: [] })
}
