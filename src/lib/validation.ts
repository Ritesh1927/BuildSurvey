// Shared validation primitives used by both client-side forms and API
// route handlers, so the same rule can never drift between the two.

export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
export const PHONE_REGEX = /^\+?[\d\s-]{10,15}$/
export const GST_REGEX = /^\d{2}[A-Z]{5}\d{4}[A-Z]{1}\d{1}Z[A-Z\d]{1}$/
export const PAN_REGEX = /^[A-Z]{5}\d{4}[A-Z]{1}$/
export const PIN_REGEX = /^\d{6}$/
export const URL_REGEX = /^https?:\/\/.+\..+/

export function isValidEmail(value: string): boolean {
  return EMAIL_REGEX.test(value)
}

export function isValidPhone(value: string): boolean {
  return PHONE_REGEX.test(value)
}

export function isValidGST(value: string): boolean {
  return GST_REGEX.test(value)
}

export function isValidPAN(value: string): boolean {
  return PAN_REGEX.test(value)
}

export function isValidPIN(value: string): boolean {
  return PIN_REGEX.test(value)
}

export function isValidUrl(value: string): boolean {
  return URL_REGEX.test(value)
}

export function isPositiveNumber(value: unknown): boolean {
  const n = typeof value === 'number' ? value : parseFloat(String(value))
  return !Number.isNaN(n) && n > 0
}

export function isNonNegativeNumber(value: unknown): boolean {
  const n = typeof value === 'number' ? value : parseFloat(String(value))
  return !Number.isNaN(n) && n >= 0
}

export function isValidLatitude(value: unknown): boolean {
  const n = typeof value === 'number' ? value : parseFloat(String(value))
  return !Number.isNaN(n) && n >= -90 && n <= 90
}

export function isValidLongitude(value: unknown): boolean {
  const n = typeof value === 'number' ? value : parseFloat(String(value))
  return !Number.isNaN(n) && n >= -180 && n <= 180
}

// Date-only comparison (ignores time-of-day) against today, in the same
// spirit as the pre-existing survey-scheduling check.
export function isPastDate(dateStr: string): boolean {
  const today = new Date(new Date().toISOString().slice(0, 10))
  const d = new Date(dateStr)
  return !Number.isNaN(d.getTime()) && d < today
}

export function isEndDateBeforeStart(startDate: string, endDate: string): boolean {
  const start = new Date(startDate)
  const end = new Date(endDate)
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return false
  return end < start
}
