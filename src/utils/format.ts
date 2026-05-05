/**
 * @module format
 * @description Formatting helpers for display strings, dates, and numbers.
 */

/**
 * Formats a ticket number with zero-padding.
 * @param {number} num - The raw ticket number
 * @param {number} [pad=4] - Minimum digits
 * @returns {string} Zero-padded ticket string, e.g. "0042"
 */
export function formatTicketNumber(num: number, pad = 4) {
  return String(num).padStart(pad, '0')
}

/**
 * Formats a wait time in minutes to a human-readable string.
 * @param {number} minutes - Wait time in minutes
 * @returns {string} Formatted string, e.g. "12 min" or "1 hr 5 min"
 */
export function formatWaitTime(minutes: number) {
  if (minutes < 1) return 'Less than a minute'
  if (minutes < 60) return `${minutes} min`
  const hrs = Math.floor(minutes / 60)
  const mins = minutes % 60
  return mins > 0 ? `${hrs} hr ${mins} min` : `${hrs} hr`
}
