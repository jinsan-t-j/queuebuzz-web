/**
 * @module validators
 * @description Input validation helpers for forms and user data.
 */

/**
 * Validates an email address format.
 * @param {string} email - The email string to validate
 * @returns {boolean} True if the email format is valid
 */
export function isValidEmail(email: string) {
  if (typeof email !== 'string') return false
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
}

/**
 * Validates that a string is non-empty after trimming.
 * @param {string} value - The string to check
 * @returns {boolean} True if the string has content
 */
export function isRequired(value: string) {
  if (typeof value !== 'string') return false
  return value.trim().length > 0
}

/**
 * Validates a join code format (alphanumeric, 6 characters).
 * @param {string} code - The join code to validate
 * @returns {boolean} True if the code matches the expected format
 */
export function isValidJoinCode(code: string) {
  if (typeof code !== 'string') return false
  return /^[A-Z0-9]{6}$/.test(code.trim().toUpperCase())
}
