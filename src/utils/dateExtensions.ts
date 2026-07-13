/**
 * Normalizes input safely into a native JavaScript Date object.
 * Handles ISO strings, timestamps, or pre-instantiated Date objects.
 */
function ensureDate(input: string | Date | number): Date {
  return input instanceof Date ? input : new Date(input)
}

// ============================================================================
// 🌐 ADMIN UTILITIES (Strict UTC Only - No Relative Formats)
// ============================================================================

/**
 *  Short Date: "June 22, 2026" (Strict UTC)
 */
export function toShortDate(dateIn: string | Date): string {
  const date = ensureDate(dateIn)
  return date.toLocaleDateString('en-US', {
    month: 'long',
    day: '2-digit',
    year: 'numeric',
    timeZone: 'UTC' // 🎯 Locked
  })
}

/**
 *  Long Date: "11:50 pm, June 22, 2026" (Strict UTC)
 */
export function toLongDate(dateIn: string | Date): string {
  const date = ensureDate(dateIn)
  const timeStr = date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
    timeZone: 'UTC' // 🎯 Locked
  }).toLowerCase()

  const dateStr = toShortDate(date)
  return `${timeStr}, ${dateStr}`
}
