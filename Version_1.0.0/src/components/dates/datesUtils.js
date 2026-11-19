export const DEFAULT_DOC_DURATIONS = {
  insurance_comprehensive: 1, // 1 year Comprehensive (Own Damage)
  insurance_third_party: 5, // 5 years Third Party
  rc: 15, // 15 years Registration Certificate
  puc: 1, // 1 year Pollution Under Control
  warranty: 5, // 5 years Manufacturer Warranty
  other: 1, // 1 year default
}

export function calculateExpiryDate(issueDateStr, durationYears) {
  if (!issueDateStr) return ''
  const d = new Date(issueDateStr + 'T00:00:00')
  if (isNaN(d.getTime())) return ''
  const years = Number(durationYears) || 1
  d.setFullYear(d.getFullYear() + Math.floor(years))
  const remainingMonths = Math.round((years % 1) * 12)
  if (remainingMonths > 0) {
    d.setMonth(d.getMonth() + remainingMonths)
  }
  const yyyy = d.getFullYear()
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  return `${yyyy}-${mm}-${dd}`
}

export function getExpiryMeta(expiryDateStr) {
  if (!expiryDateStr) {
    return {
      status: 'Unknown',
      badgeClass: 'bg-zinc-500/10 text-zinc-400 ring-zinc-500/20',
      label: 'No Date Set',
      daysLeft: 0,
      color: 'zinc',
    }
  }

  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const exp = new Date(expiryDateStr + 'T00:00:00')
  const diffTime = exp.getTime() - today.getTime()
  const daysLeft = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

  if (daysLeft < 0) {
    return {
      status: 'Expired',
      badgeClass: 'bg-rose-500/15 text-rose-300 ring-rose-500/30',
      label: `Expired ${Math.abs(daysLeft)} days ago`,
      daysLeft,
      color: 'rose',
    }
  }

  if (daysLeft === 0) {
    return {
      status: 'Valid',
      badgeClass: 'bg-lime-400/15 text-lime-300 ring-lime-400/30',
      label: '0 days left (0 years)',
      daysLeft: 0,
      color: 'lime',
    }
  }

  if (daysLeft <= 30) {
    return {
      status: 'Expiring Soon',
      badgeClass: 'bg-amber-400/15 text-amber-300 ring-amber-400/30',
      label: `${daysLeft} day${daysLeft === 1 ? '' : 's'} left`,
      daysLeft,
      color: 'amber',
    }
  }

  if (daysLeft >= 365) {
    const rawYears = daysLeft / 365
    const roundedYears = Math.round(rawYears * 10) / 10
    const displayYears = Number.isInteger(roundedYears)
      ? String(roundedYears)
      : roundedYears.toFixed(1)
    return {
      status: 'Valid',
      badgeClass: 'bg-lime-400/15 text-lime-300 ring-lime-400/30',
      label: `${displayYears} ${Number(displayYears) === 1 ? 'year' : 'years'} left`,
      daysLeft,
      color: 'lime',
    }
  }

  const monthsLeft = Math.floor(daysLeft / 30)
  return {
    status: 'Valid',
    badgeClass: 'bg-lime-400/15 text-lime-300 ring-lime-400/30',
    label: `${monthsLeft} mo left (${daysLeft}d)`,
    daysLeft,
    color: 'lime',
  }
}

export function addDaysToDate(dateStr, days) {
  if (!dateStr || isNaN(Number(days))) return ''
  const d = new Date(dateStr + 'T00:00:00')
  if (isNaN(d.getTime())) return ''
  d.setDate(d.getDate() + Number(days))
  const yyyy = d.getFullYear()
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  return `${yyyy}-${mm}-${dd}`
}

export function getReminderStatus(reminder, currentOdo = 0) {
  if (reminder.status === 'Completed') {
    return {
      label: 'Completed',
      badgeClass: 'bg-lime-400/15 text-lime-300 ring-lime-400/30',
      color: 'lime',
      isDue: false,
      isOverdue: false,
      reasons: [],
    }
  }

  const odo = Number(currentOdo) || 0
  const minOdo = reminder.dueOdometerKm ? Number(reminder.dueOdometerKm) : null
  const maxOdo = reminder.dueOdometerMaxKm
    ? Number(reminder.dueOdometerMaxKm)
    : minOdo

  let isOdoDue = false
  let isOdoOverdue = false

  if (minOdo !== null) {
    if (odo >= minOdo) {
      isOdoDue = true
    }
    if (maxOdo !== null && odo > maxOdo) {
      isOdoOverdue = true
    }
  }

  // Duration / Date check
  let isDurationDue = false
  let isDurationOverdue = false
  let elapsedDays = null

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const fromDateStr = reminder.dueDateFrom || reminder.dueDate
  if (fromDateStr && reminder.durationDaysMin) {
    const from = new Date(fromDateStr + 'T00:00:00')
    if (!isNaN(from.getTime())) {
      elapsedDays = Math.floor(
        (today.getTime() - from.getTime()) / (1000 * 60 * 60 * 24),
      )
      if (elapsedDays >= Number(reminder.durationDaysMin)) {
        isDurationDue = true
      }
      if (
        reminder.durationDaysMax &&
        elapsedDays > Number(reminder.durationDaysMax)
      ) {
        isDurationOverdue = true
      }
    }
  } else if (reminder.dueDate) {
    const due = new Date(reminder.dueDate + 'T00:00:00')
    if (!isNaN(due.getTime()) && today.getTime() >= due.getTime()) {
      isDurationDue = true
    }
    if (reminder.dueDateEnd) {
      const dueEnd = new Date(reminder.dueDateEnd + 'T00:00:00')
      if (!isNaN(dueEnd.getTime()) && today.getTime() > dueEnd.getTime()) {
        isDurationOverdue = true
      }
    }
  }

  const isOverdue = isOdoOverdue || isDurationOverdue
  const isDue = isOdoDue || isDurationDue

  const reasons = []
  if (isOdoDue && minOdo !== null) {
    reasons.push(
      `Odometer reached min ${minOdo.toLocaleString('en-IN')} km (Current: ${odo.toLocaleString('en-IN')} km)`,
    )
  }
  if (isDurationDue) {
    if (reminder.durationDaysMin && elapsedDays !== null) {
      reasons.push(
        `Duration reached ${reminder.durationDaysMin} days (${elapsedDays} days passed)`,
      )
    } else {
      reasons.push('Due date window reached')
    }
  }

  if (isOverdue) {
    return {
      label: 'Overdue',
      badgeClass: 'bg-rose-500/15 text-rose-300 ring-rose-500/30',
      color: 'rose',
      isDue: true,
      isOverdue: true,
      reasons,
      elapsedDays,
    }
  }

  if (isDue) {
    return {
      label: 'Due Now',
      badgeClass: 'bg-amber-400/15 text-amber-300 ring-amber-400/30',
      color: 'amber',
      isDue: true,
      isOverdue: false,
      reasons,
      elapsedDays,
    }
  }

  return {
    label: 'Upcoming',
    badgeClass: 'bg-zinc-500/10 text-zinc-300 ring-zinc-500/20',
    color: 'zinc',
    isDue: false,
    isOverdue: false,
    reasons: [],
    elapsedDays,
  }
}
