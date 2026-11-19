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

  const monthsLeft = Math.floor(daysLeft / 30)
  const yearsLeft = (daysLeft / 365).toFixed(1)

  return {
    status: 'Valid',
    badgeClass: 'bg-lime-400/15 text-lime-300 ring-lime-400/30',
    label:
      daysLeft > 365
        ? `${yearsLeft} years left`
        : `${monthsLeft} months left (${daysLeft}d)`,
    daysLeft,
    color: 'lime',
  }
}

export function getReminderStatus(reminder, currentOdo = 0) {
  if (reminder.status === 'Completed') {
    return {
      label: 'Completed',
      badgeClass: 'bg-lime-400/15 text-lime-300 ring-lime-400/30',
      color: 'lime',
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
    if (maxOdo !== null && odo >= minOdo && odo <= maxOdo) {
      isOdoDue = true
    } else if (maxOdo !== null && odo > maxOdo) {
      isOdoOverdue = true
    } else if (maxOdo === null && odo >= minOdo) {
      isOdoDue = true
    }
  }

  // Check date
  let isDateOverdue = false
  if (reminder.dueDate) {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const due = new Date((reminder.dueDateEnd || reminder.dueDate) + 'T00:00:00')
    if (due.getTime() < today.getTime()) {
      isDateOverdue = true
    }
  }

  if (isOdoOverdue || isDateOverdue) {
    return {
      label: 'Overdue',
      badgeClass: 'bg-rose-500/15 text-rose-300 ring-rose-500/30',
      color: 'rose',
    }
  }

  if (isOdoDue) {
    return {
      label: 'Due Now',
      badgeClass: 'bg-amber-400/15 text-amber-300 ring-amber-400/30',
      color: 'amber',
    }
  }

  return {
    label: 'Upcoming',
    badgeClass: 'bg-zinc-500/10 text-zinc-300 ring-zinc-500/20',
    color: 'zinc',
  }
}
