/**
 * Centralized Timestamp Formatting Utility for Ledger of Coins
 * Ensures consistent fantasy typography and production precision across cards, feeds, and PDFs.
 */

/**
 * Formats full date: e.g., "26 June 2026"
 */
export function formatExpenseDate(isoString: string | Date | null | undefined): string {
  if (!isoString) return 'Unknown Date'
  try {
    const date = typeof isoString === 'string' ? new Date(isoString) : isoString
    if (isNaN(date.getTime())) return 'Unknown Date'
    return date.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    })
  } catch {
    return 'Unknown Date'
  }
}

/**
 * Formats short date for PDF columns: e.g., "26 Jun"
 */
export function formatShortDate(isoString: string | Date | null | undefined): string {
  if (!isoString) return '—'
  try {
    const date = typeof isoString === 'string' ? new Date(isoString) : isoString
    if (isNaN(date.getTime())) return '—'
    return date.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short'
    })
  } catch {
    return '—'
  }
}

/**
 * Formats time in 12-hour AM/PM: e.g., "8:43 PM"
 */
export function formatExpenseTime(isoString: string | Date | null | undefined): string {
  if (!isoString) return 'Unknown Time'
  try {
    const date = typeof isoString === 'string' ? new Date(isoString) : isoString
    if (isNaN(date.getTime())) return 'Unknown Time'
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    })
  } catch {
    return 'Unknown Time'
  }
}

/**
 * Formats combined timestamp for activity feeds: e.g., "26 June 2026 • 8:43 PM"
 */
export function formatFullTimestamp(isoString: string | Date | null | undefined): string {
  if (!isoString) return 'Unknown Date'
  const dateStr = formatExpenseDate(isoString)
  const timeStr = formatExpenseTime(isoString)
  return `${dateStr} • ${timeStr}`
}
