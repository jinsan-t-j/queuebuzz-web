import * as yup from 'yup'

/**
 * Reusable Yup schema rule for phone number validation.
 * Allows digits, spaces, plus signs, hyphens, and parentheses.
 * Validates that the number of digits is between 8 and 15.
 */
export const phoneValidationSchema = yup
  .string()
  .nullable()
  .optional()
  .test('phone-validation', 'Must be a valid mobile number (8 to 15 digits)', (val) => {
    if (!val) return true
    const isValidChars = /^[0-9+\-\s()]*$/.test(val)
    if (!isValidChars) return false
    const digits = val.replace(/\D/g, '')
    return digits.length >= 8 && digits.length <= 15
  })

/**
 * Normalizes a phone number to digits only.
 * Returns undefined if the string is empty.
 */
export function normalizePhone(val?: string | null): string | undefined {
  const trimmed = val?.trim()
  if (!trimmed) return undefined
  return trimmed.replace(/\D/g, '')
}
