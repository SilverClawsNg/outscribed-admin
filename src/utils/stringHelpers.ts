// src/core/utils/stringHelpers.ts

/**
 * 📊 FORMATS NUMBER COUNTS TO SOCIAL SHORTHAND (replaces custom C# GetCounts extension)
 * Accepts numbers or strings and outputs formatted strings like: 450, 4.2k, 120k, 1.5m, >1b
 */
export function formatCounts(input: string | number | null | undefined): string {
  if (input === null || input === undefined || input === '') return '0'

  // Convert to a number safely to perform proper math instead of character splitting
  const num = typeof input === 'string' ? parseInt(input, 10) : input
  if (isNaN(num) || num <= 0) return '0'

  if (num < 1000) {
    return num.toString()
  }
  
  if (num < 10000) {
    // 4 digits: 1234 -> 1.2k
    return (Math.floor(num / 100) / 10).toFixed(1).replace('.0', '') + 'k'
  }
  
  if (num < 100000) {
    // 5 digits: 12345 -> 12.3k
    return (Math.floor(num / 100) / 10).toFixed(1).replace('.0', '') + 'k'
  }
  
  if (num < 1000000) {
    // 6 digits: 123456 -> 123k
    return Math.floor(num / 1000).toString() + 'k'
  }
  
  if (num < 10000000) {
    // 7 digits: 1234567 -> 1.2m
    return (Math.floor(num / 100000) / 10).toFixed(1).replace('.0', '') + 'm'
  }
  
  if (num < 100000000) {
    // 8 digits: 12345678 -> 12.3m
    return (Math.floor(num / 100000) / 10).toFixed(1).replace('.0', '') + 'm'
  }
  
  if (num < 1000000000) {
    // 9 digits: 123456789 -> 123m
    return Math.floor(num / 1000000).toString() + 'm'
  }

  // Greater than 9 digits
  return '>1b'
}


/**
 * Formats a raw number down to the exact unit with commas (e.g., 43000241 -> "43,000,241").
 */
export function formatFullCounts(value: number | string | null | undefined): string {
  if (value === null || value === undefined || value === '') return '0';
  
  const num = typeof value === 'string' ? Number(value) : value;
  
  if (isNaN(num)) return '0';

  // Uses the browser's native locale formatting down to the exact unit
  return new Intl.NumberFormat('en-US', {
    maximumFractionDigits: 0
  }).format(num);
}

/**
 * ✂️ TRUNCATES TEXT WITH ELLIPSIS
 * (Fixed bug note: your C# snippet appended "..." even if the text was shorter than the requested limit.
 * This version properly applies it only when the text exceeds the boundary length constraint)
 */
export function truncateText(input: string | null | undefined, maxLength: number): string | null {
  if (!input) return null
  if (input.length <= maxLength) return input
  
  return input.substring(0, maxLength).trim() + '...'
}

export function formatAddendum(input: string | null | undefined): string[] | null {
  if (!input) return null

  return input
    .split(/\r?\n/)
    .map(line => line.trim())
    .filter(line => line.length > 0) // Replaces StringSplitOptions.RemoveEmptyEntries
}