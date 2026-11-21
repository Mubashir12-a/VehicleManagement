import { AlertCircle, Bell, Calendar, Check, Clock, Gauge, X } from 'lucide-react'
import { useMemo, useState } from 'react'
import { addDaysToDate } from './datesUtils'

function getExistingServiceNumbers(reminders = []) {
  const nums = []
  for (const r of reminders) {
    if (!r?.title) continue
    const match = String(r.title).match(/\d+/)
    if (match) {
      nums.push(parseInt(match[0], 10))
    }
  }
  return nums.sort((a, b) => a - b)
}

function AddReminderDialogContent({
  existingReminders = [],
  onClose,
  onSubmit,
}) {
  const existingNums = useMemo(
    () => getExistingServiceNumbers(existingReminders),
    [existingReminders],
  )

  // Strict sequential rule: 1, 2, 3, 4, 5, 6...
  const nextRequiredNumber = useMemo(() => {
    if (existingNums.length === 0) return 1
    return Math.max(...existingNums) + 1
  }, [existingNums])

  const [serviceNumber, setServiceNumber] = useState(String(nextRequiredNumber))
  const [serviceType, setServiceType] = useState('Free Service')

  // Due Date From (Start Date) - No initial date pre-filled
  const [dueDateFrom, setDueDateFrom] = useState('')

  // Duration Min & Max (Days) - No default values, just 0 - 0
  const [durationDaysMin, setDurationDaysMin] = useState('')
  const [durationDaysMax, setDurationDaysMax] = useState('')

  // Odometer Min & Max (km) - No default values, just 0 - 0
  const [dueOdometerKm, setDueOdometerKm] = useState('')
  const [dueOdometerMaxKm, setDueOdometerMaxKm] = useState('')

  const [notes, setNotes] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState(null)

  // Live calculated target dates
  const calculatedTargetDateMin = addDaysToDate(dueDateFrom, durationDaysMin)
  const calculatedTargetDateMax = addDaysToDate(
    dueDateFrom,
    durationDaysMax || durationDaysMin,
  )

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)

    const num = parseInt(serviceNumber, 10)
    if (!serviceNumber || isNaN(num) || num <= 0) {
      setError('Please enter a valid numerical service number.')
      return
    }

    // Strict sequential validation: services must strictly follow consecutive numbers
    if (num !== nextRequiredNumber) {
      setError(
        `Services must follow sequential numbers (1, 2, 3...). Next required is Service ${nextRequiredNumber}.`,
      )
      return
    }

    if (durationDaysMin && !dueDateFrom) {
      setError('Please select a Due Date (From) when specifying duration days.')
      return
    }

    if (dueDateFrom && (!durationDaysMin || Number(durationDaysMin) <= 0)) {
      setError('Please specify minimum duration in days.')
      return
    }

    if (!durationDaysMin && !dueOdometerKm) {
      setError('Please provide at least a Target Duration (Days) or Target Odometer (km).')
      return
    }

    setIsSubmitting(true)
    try {
      await onSubmit({
        title: `Service ${num}`,
        serviceType,
        dueDateFrom: dueDateFrom || null,
        durationDaysMin: durationDaysMin ? Number(durationDaysMin) : null,
        durationDaysMax: durationDaysMax
          ? Number(durationDaysMax)
          : durationDaysMin
            ? Number(durationDaysMin)
            : null,
        dueDate: calculatedTargetDateMin || null,
        dueDateEnd: calculatedTargetDateMax || calculatedTargetDateMin || null,
        dueOdometerKm: dueOdometerKm ? Number(dueOdometerKm) : null,
        dueOdometerMaxKm: dueOdometerMaxKm ? Number(dueOdometerMaxKm) : null,
        notes: notes.trim(),
      })
      onClose()
    } catch (err) {
      setError(err?.message || 'Failed to save service reminder.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div className="relative max-h-[96vh] w-full max-w-2xl overflow-y-auto rounded-3xl border border-white/10 bg-[#0d1014] p-6 shadow-2xl sm:p-7 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-white/8 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-lime-400/15 text-lime-400 ring-1 ring-lime-400/30">
              <Bell className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-xl font-black tracking-tight text-white">
                Add Service Reminder
              </h3>
              <p className="text-xs text-zinc-400">
                Schedule service intervals and get notified when duration or odometer milestones are reached
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-white/10 p-2 text-zinc-400 transition-colors hover:bg-white/5 hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {error && (
          <div className="mt-4 flex items-center gap-2 rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-xs text-rose-300">
            <AlertCircle className="h-4 w-4 shrink-0 text-rose-400" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-5 space-y-5">
          {/* Service Number & Type */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400">
                Service Number *
              </label>
              <div className="mt-1.5 flex items-center gap-2">
                <input
                  type="text"
                  inputMode="numeric"
                  required
                  value={serviceNumber}
                  onChange={(e) => {
                    const cleanVal = e.target.value.replace(/\D/g, '')
                    setServiceNumber(cleanVal)
                  }}
                  className="w-full rounded-xl border border-white/10 bg-[#12161c] px-3.5 py-2.5 font-mono text-sm font-bold text-white focus:border-lime-400 focus:outline-none focus:ring-1 focus:ring-lime-400"
                />
                <span className="shrink-0 rounded-xl border border-lime-400/25 bg-lime-400/10 px-3 py-2.5 text-xs font-black text-lime-400">
                  Service #{serviceNumber || nextRequiredNumber}
                </span>
              </div>
              <p className="mt-1 text-[11px] text-zinc-500">
                Next scheduled service: <strong>Service {nextRequiredNumber}</strong>
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400">
                Service Type
              </label>
              <select
                value={serviceType}
                onChange={(e) => setServiceType(e.target.value)}
                className="mt-1.5 w-full rounded-xl border border-white/10 bg-[#12161c] px-3.5 py-2.5 text-sm text-white focus:border-lime-400 focus:outline-none focus:ring-1 focus:ring-lime-400"
              >
                <option value="Free Service">Free Service</option>
                <option value="Paid Service">Paid Service</option>
              </select>
            </div>
          </div>

          {/* Duration Window (Due Date From & Duration Min/Max Days: 0 - 0) */}
          <div className="rounded-2xl border border-white/8 bg-[#12161c] p-4 space-y-3.5">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-lime-400">
              <Calendar className="h-4 w-4" />
              Duration Window
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
                  Due Date (From)
                </label>
                <input
                  type="date"
                  value={dueDateFrom}
                  onChange={(e) => setDueDateFrom(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-white/10 bg-[#0d1014] px-3.5 py-2 font-mono text-sm text-white focus:border-lime-400 focus:outline-none focus:ring-1 focus:ring-lime-400"
                />
                <span className="mt-0.5 block text-[10px] text-zinc-500">
                  dd-mm-yyyy
                </span>
              </div>

              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
                  Duration Min (Days)
                </label>
                <input
                  type="number"
                  min={1}
                  value={durationDaysMin}
                  onChange={(e) => setDurationDaysMin(e.target.value)}
                  placeholder="0"
                  className="mt-1 w-full rounded-xl border border-white/10 bg-[#0d1014] px-3.5 py-2 font-mono text-sm text-white focus:border-lime-400 focus:outline-none focus:ring-1 focus:ring-lime-400"
                />
                <span className="mt-0.5 block text-[10px] text-zinc-500">
                  Min milestone (0)
                </span>
              </div>

              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
                  Duration Max (Days)
                </label>
                <input
                  type="number"
                  min={1}
                  value={durationDaysMax}
                  onChange={(e) => setDurationDaysMax(e.target.value)}
                  placeholder="0"
                  className="mt-1 w-full rounded-xl border border-white/10 bg-[#0d1014] px-3.5 py-2 font-mono text-sm text-white focus:border-lime-400 focus:outline-none focus:ring-1 focus:ring-lime-400"
                />
                <span className="mt-0.5 block text-[10px] text-zinc-500">
                  Max overdue threshold (0)
                </span>
              </div>
            </div>

            {calculatedTargetDateMin && (
              <div className="flex items-center justify-between rounded-xl border border-lime-400/20 bg-lime-400/5 px-3.5 py-2 text-xs">
                <span className="text-zinc-400">Calculated Service Window:</span>
                <span className="font-mono font-bold text-lime-300">
                  {calculatedTargetDateMin}
                  {calculatedTargetDateMax && calculatedTargetDateMax !== calculatedTargetDateMin
                    ? ` to ${calculatedTargetDateMax}`
                    : ''}
                </span>
              </div>
            )}
          </div>

          {/* Odometer Window (Min & Max km: 0 - 0) */}
          <div className="rounded-2xl border border-white/8 bg-[#12161c] p-4 space-y-3.5">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-lime-400">
              <Gauge className="h-4 w-4" />
              Odometer Window (km)
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
                  Odometer Min (km)
                </label>
                <input
                  type="number"
                  min={0}
                  value={dueOdometerKm}
                  onChange={(e) => setDueOdometerKm(e.target.value)}
                  placeholder="0"
                  className="mt-1 w-full rounded-xl border border-white/10 bg-[#0d1014] px-3.5 py-2 font-mono text-sm text-white focus:border-lime-400 focus:outline-none focus:ring-1 focus:ring-lime-400"
                />
                <span className="mt-0.5 block text-[10px] text-zinc-500">
                  Min milestone (0)
                </span>
              </div>

              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
                  Odometer Max (km)
                </label>
                <input
                  type="number"
                  min={0}
                  value={dueOdometerMaxKm}
                  onChange={(e) => setDueOdometerMaxKm(e.target.value)}
                  placeholder="0"
                  className="mt-1 w-full rounded-xl border border-white/10 bg-[#0d1014] px-3.5 py-2 font-mono text-sm text-white focus:border-lime-400 focus:outline-none focus:ring-1 focus:ring-lime-400"
                />
                <span className="mt-0.5 block text-[10px] text-zinc-500">
                  Max overdue threshold (0)
                </span>
              </div>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400">
              Notes / Workshop Instructions (Optional)
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Engine oil replacement, chain lubrication, brake adjustment"
              className="mt-1.5 w-full rounded-xl border border-white/10 bg-[#12161c] px-3.5 py-2.5 text-sm text-white focus:border-lime-400 focus:outline-none focus:ring-1 focus:ring-lime-400"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between border-t border-white/8 pt-4">
            <p className="text-[11px] text-zinc-500">
              Notification bell alerts immediately when either Min Duration or Min Odo is reached.
            </p>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="rounded-xl border border-white/10 px-4 py-2 text-xs font-bold text-zinc-300 hover:bg-white/5"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex items-center gap-1.5 rounded-xl bg-lime-400 px-5 py-2 text-xs font-black text-zinc-950 shadow-[0_0_16px_rgba(163,230,53,0.25)] transition-colors hover:bg-lime-300 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <Clock className="h-3.5 w-3.5 animate-spin" /> Saving...
                  </>
                ) : (
                  <>
                    <Check className="h-3.5 w-3.5" /> Save Reminder
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function AddReminderModal({
  isOpen,
  existingReminders = [],
  onClose,
  onSubmit,
}) {
  if (!isOpen) return null

  return (
    <AddReminderDialogContent
      existingReminders={existingReminders}
      onClose={onClose}
      onSubmit={onSubmit}
    />
  )
}
