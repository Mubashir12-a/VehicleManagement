/**
 * Formats any date string (YYYY-MM-DD or ISO) into DD-MM-YYYY format.
 * Returns 'DD-MM-YYYY' or fallback if null/empty/invalid.
 */
export function formatDisplayDate(dateInput, fallback = 'DD-MM-YYYY') {
  if (
    !dateInput ||
    dateInput === '—' ||
    dateInput === 'None' ||
    dateInput === 'null' ||
    dateInput === 'undefined'
  ) {
    return fallback
  }

  // If already in DD-MM-YYYY format
  if (typeof dateInput === 'string' && /^\d{2}-\d{2}-\d{4}$/.test(dateInput)) {
    return dateInput
  }

  // Handle YYYY-MM-DD
  if (typeof dateInput === 'string') {
    const raw = dateInput.split('T')[0]
    const parts = raw.split('-')
    if (parts.length === 3 && parts[0].length === 4) {
      const [year, month, day] = parts
      return `${day.padStart(2, '0')}-${month.padStart(2, '0')}-${year}`
    }
  }

  const d = new Date(dateInput)
  if (isNaN(d.getTime())) return fallback

  const day = String(d.getDate()).padStart(2, '0')
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const year = d.getFullYear()
  return `${day}-${month}-${year}`
}

/**
 * Returns today's date formatted as DD-MM-YYYY
 */
export function getTodayDMY() {
  const d = new Date()
  const day = String(d.getDate()).padStart(2, '0')
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const year = d.getFullYear()
  return `${day}-${month}-${year}`
}
