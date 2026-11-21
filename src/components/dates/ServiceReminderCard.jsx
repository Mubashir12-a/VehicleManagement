import {
  Bell,
  Calendar,
  Check,
  CheckCircle2,
  Clock,
  Gauge,
  MapPin,
  Pencil,
  Trash2,
  Wrench,
} from 'lucide-react'
import { getReminderStatus } from './datesUtils'

export default function ServiceReminderCard({
  reminder,
  currentOdo = 0,
  onOpenCompleteModal,
  onEdit,
  onDelete,
}) {
  const statusMeta = getReminderStatus(reminder, currentOdo)
  const isCompleted = reminder.status === 'Completed'

  // Odo window text
  const minOdo = reminder.dueOdometerKm ? Number(reminder.dueOdometerKm) : null
  const maxOdo = reminder.dueOdometerMaxKm
    ? Number(reminder.dueOdometerMaxKm)
    : minOdo

  let odoText = 'No Odo Set'
  if (minOdo && maxOdo && minOdo !== maxOdo) {
    odoText = `${minOdo.toLocaleString('en-IN')} - ${maxOdo.toLocaleString('en-IN')} km`
  } else if (minOdo) {
    odoText = `${minOdo.toLocaleString('en-IN')} km`
  }

  // Duration window text
  const minDays = reminder.durationDaysMin ? Number(reminder.durationDaysMin) : null
  const maxDays = reminder.durationDaysMax
    ? Number(reminder.durationDaysMax)
    : minDays

  let durationText = null
  if (minDays && maxDays && minDays !== maxDays) {
    durationText = `${minDays} - ${maxDays} days`
  } else if (minDays) {
    durationText = `${minDays} days`
  }

  // Distance calculation
  let distanceMessage = null
  if (!isCompleted && minOdo !== null) {
    const diff = minOdo - currentOdo
    if (diff > 0) {
      distanceMessage = `${diff.toLocaleString('en-IN')} km left until target`
    } else if (maxOdo && currentOdo <= maxOdo) {
      distanceMessage = `Within target window (current: ${currentOdo.toLocaleString('en-IN')} km)`
    } else {
      distanceMessage = `Exceeded target by ${Math.abs(currentOdo - (maxOdo || minOdo)).toLocaleString('en-IN')} km`
    }
  }

  // Duration calculation
  let durationMessage = null
  if (!isCompleted && statusMeta.elapsedDays !== null && minDays !== null) {
    const passed = statusMeta.elapsedDays
    const daysLeft = minDays - passed
    if (daysLeft > 0) {
      durationMessage = `${daysLeft} days left (${passed}d passed)`
    } else {
      const daysOver = passed - minDays
      durationMessage = `Duration reached (${passed}d passed, +${daysOver}d)`
    }
  }

  return (
    <div
      className={`flex h-full flex-col justify-between rounded-2xl border p-5 transition-all duration-300 ${
        isCompleted
          ? 'border-white/6 bg-[#0f1216] opacity-90'
          : statusMeta.color === 'rose'
            ? 'border-rose-500/40 bg-[#12161c] shadow-[0_0_24px_rgba(244,63,94,0.08)]'
            : statusMeta.color === 'amber'
              ? 'border-amber-400/40 bg-[#12161c] shadow-[0_0_24px_rgba(251,191,36,0.08)]'
              : 'border-white/8 bg-[#12161c] hover:border-lime-400/20'
      }`}
    >
      <div>
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div
              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl ring-1 ${
                isCompleted
                  ? 'bg-lime-400/10 text-lime-400 ring-lime-400/20'
                  : statusMeta.isDue
                    ? 'bg-amber-400/15 text-amber-300 ring-amber-400/30'
                    : 'bg-white/5 text-zinc-300 ring-white/10'
              }`}
            >
              {isCompleted ? (
                <CheckCircle2 className="h-5 w-5" />
              ) : (
                <Wrench className="h-5 w-5" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-sm font-bold text-white">{reminder.title}</h4>
              </div>
              <p className="text-[11px] font-semibold text-lime-400">
                {reminder.serviceType}
              </p>
            </div>
          </div>

          <span
            className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ring-1 ring-inset ${statusMeta.badgeClass}`}
          >
            {statusMeta.label}
          </span>
        </div>

        {/* Targets Grid */}
        {!isCompleted ? (
          <div className="mt-4 space-y-2.5">
            <div className="grid grid-cols-2 gap-2 rounded-xl border border-white/6 bg-black/40 p-3 text-xs">
              <div>
                <span className="flex items-center gap-1 text-[10px] uppercase tracking-wider text-zinc-500">
                  <Gauge className="h-3 w-3 text-lime-400" /> Target Odo
                </span>
                <span className="mt-1 block font-mono font-bold text-white">
                  {odoText}
                </span>
              </div>

              <div>
                <span className="flex items-center gap-1 text-[10px] uppercase tracking-wider text-zinc-500">
                  <Clock className="h-3 w-3 text-lime-400" /> Duration Window
                </span>
                <span className="mt-1 block font-mono text-[11px] font-bold text-zinc-300">
                  {durationText || 'Flexible'}
                </span>
                {reminder.dueDateFrom && (
                  <span className="text-[10px] text-zinc-500">
                    from {reminder.dueDateFrom}
                  </span>
                )}
              </div>
            </div>

            {/* Target Date Range */}
            {(reminder.dueDate || reminder.dueDateEnd) && (
              <div className="flex items-center justify-between rounded-xl border border-white/6 bg-white/2 px-3 py-1.5 text-xs">
                <span className="flex items-center gap-1 text-[10px] uppercase tracking-wider text-zinc-500">
                  <Calendar className="h-3 w-3 text-lime-400" /> Target Date:
                </span>
                <span className="font-mono text-[11px] font-bold text-zinc-200">
                  {reminder.dueDate || 'Flexible'}
                  {reminder.dueDateEnd && reminder.dueDateEnd !== reminder.dueDate
                    ? ` to ${reminder.dueDateEnd}`
                    : ''}
                </span>
              </div>
            )}

            {/* Due Trigger Reasons Notification Box */}
            {statusMeta.reasons && statusMeta.reasons.length > 0 && (
              <div
                className={`rounded-xl border p-2.5 text-xs ${
                  statusMeta.isOverdue
                    ? 'border-rose-500/30 bg-rose-500/10 text-rose-300'
                    : 'border-amber-400/30 bg-amber-400/10 text-amber-200'
                }`}
              >
                <div className="flex items-center gap-1.5 font-bold">
                  <Bell className="h-3.5 w-3.5" />
                  <span>
                    {statusMeta.isOverdue
                      ? 'Overdue Trigger:'
                      : 'Service Milestone Reached:'}
                  </span>
                </div>
                <ul className="mt-1 space-y-0.5 pl-4 list-disc text-[11px]">
                  {statusMeta.reasons.map((reason, idx) => (
                    <li key={idx}>{reason}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Distance / Duration status text */}
            {!statusMeta.isDue && (
              <div className="space-y-1 text-[11px] text-zinc-400 font-medium">
                {distanceMessage && <p>• {distanceMessage}</p>}
                {durationMessage && <p>• {durationMessage}</p>}
              </div>
            )}

            {reminder.notes && (
              <p className="text-[11px] text-zinc-500 line-clamp-2">
                {reminder.notes}
              </p>
            )}
          </div>
        ) : (
          /* Completed Info Summary */
          <div className="mt-4 space-y-2 rounded-xl border border-lime-400/15 bg-lime-400/5 p-3 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-zinc-400">Completed At:</span>
              <span className="font-mono font-bold text-lime-300">
                {Number(reminder.completedOdometerKm || 0).toLocaleString('en-IN')} km
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-zinc-400">Service Date:</span>
              <span className="font-mono text-white">
                {reminder.completedDate || '—'}
              </span>
            </div>

            <div className="flex items-center justify-between border-t border-white/6 pt-1.5">
              <span className="text-zinc-400">Amount Paid:</span>
              <span className="font-mono font-black text-white">
                ₹{Number(reminder.amountPaid || 0).toLocaleString('en-IN')}
              </span>
            </div>

            {reminder.serviceCenter && (
              <div className="flex items-center gap-1 text-[11px] text-zinc-400">
                <MapPin className="h-3 w-3 text-zinc-500" />
                <span>{reminder.serviceCenter}</span>
              </div>
            )}

            {reminder.notes && (
              <p className="text-[11px] text-zinc-300 pt-1">
                {reminder.notes}
              </p>
            )}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="mt-4 flex items-center justify-between border-t border-white/6 pt-3">
        {!isCompleted ? (
          <button
            type="button"
            onClick={() => onOpenCompleteModal(reminder)}
            className="inline-flex items-center gap-1.5 rounded-xl bg-lime-400 px-3.5 py-1.5 text-xs font-bold text-zinc-950 transition-colors hover:bg-lime-300"
          >
            <Check className="h-3.5 w-3.5" /> Mark as Done
          </button>
        ) : (
          <span className="inline-flex items-center gap-1 font-mono text-xs font-bold text-lime-400">
            <CheckCircle2 className="h-3.5 w-3.5" /> Service Logged
          </span>
        )}

        <div className="flex items-center gap-1">
          {onEdit && (
            <button
              type="button"
              onClick={() => onEdit(reminder)}
              className="rounded-lg p-1.5 text-zinc-400 transition-colors hover:bg-white/10 hover:text-white"
              title="Edit service details"
            >
              <Pencil className="h-3.5 w-3.5" />
            </button>
          )}
          <button
            type="button"
            onClick={() => onDelete(reminder.id)}
            className="rounded-lg p-1.5 text-zinc-500 transition-colors hover:bg-rose-500/10 hover:text-rose-400"
            title="Delete reminder"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  )
}
