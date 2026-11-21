import {
  AlertCircle,
  Bell,
  Check,
  Clock,
  X,
} from 'lucide-react'
import { useState } from 'react'
import { addDaysToDate } from './datesUtils'

function EditReminderDialogContent({
  reminder,
  vehicle,
  onClose,
  onSubmit,
}) {
  const vehiclePurchaseDate = vehicle?.purchaseDate || ''

  const [title, setTitle] = useState(reminder?.title || '')
  const [serviceType, setServiceType] = useState(
    reminder?.serviceType || 'Free Service',
  )

  // Detect whether reminder was following purchase date
  const isInitiallyFollowingPurchase =
    Boolean(vehiclePurchaseDate) &&
    (!reminder?.dueDateFrom || reminder?.dueDateFrom === vehiclePurchaseDate)

  const [followPurchaseDate, setFollowPurchaseDate] = useState(
    isInitiallyFollowingPurchase,
  )
  const [customStartDate, setCustomStartDate] = useState(
    reminder?.dueDateFrom || '',
  )

  const [durationDaysMin, setDurationDaysMin] = useState(
    reminder?.durationDaysMin !== null && reminder?.durationDaysMin !== undefined
      ? String(reminder.durationDaysMin)
      : '',
  )
  const [durationDaysMax, setDurationDaysMax] = useState(
    reminder?.durationDaysMax !== null && reminder?.durationDaysMax !== undefined
      ? String(reminder.durationDaysMax)
      : '',
  )
  const [dueOdometerKm, setDueOdometerKm] = useState(
    reminder?.dueOdometerKm !== null && reminder?.dueOdometerKm !== undefined
      ? String(reminder.dueOdometerKm)
      : '',
  )
  const [dueOdometerMaxKm, setDueOdometerMaxKm] = useState(
    reminder?.dueOdometerMaxKm !== null && reminder?.dueOdometerMaxKm !== undefined
      ? String(reminder.dueOdometerMaxKm)
      : '',
  )
  const [notes, setNotes] = useState(reminder?.notes || '')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState(null)

  const effectiveStartDate = followPurchaseDate
    ? vehiclePurchaseDate
    : customStartDate

  // Live calculated target dates
  const calculatedTargetDateMin = addDaysToDate(
    effectiveStartDate,
    durationDaysMin,
  )
  const calculatedTargetDateMax = addDaysToDate(
    effectiveStartDate,
    durationDaysMax || durationDaysMin,
  )

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)

    if (!title.trim()) {
      setError('Service title is required.')
      return
    }

    if (durationDaysMin && followPurchaseDate && !vehiclePurchaseDate) {
      setError(
        'No purchase date found in vehicle profile. Please set vehicle purchase date in Dashboard or turn off the toggle to use a custom start date.',
      )
      return
    }

    if (durationDaysMin && !followPurchaseDate && !customStartDate) {
      setError(
        'Please select a start date when not following vehicle purchase date.',
      )
      return
    }

    if (effectiveStartDate && (!durationDaysMin || Number(durationDaysMin) <= 0)) {
      setError('Please specify minimum duration in days.')
      return
    }

    if (!durationDaysMin && !dueOdometerKm) {
      setError(
        'Please provide at least a Target Duration (Days) or Target Odometer (km).',
      )
      return
    }

    setIsSubmitting(true)
    try {
      await onSubmit(reminder.id, {
        title: title.trim(),
        serviceType,
        dueDateFrom: effectiveStartDate || null,
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
      setError(err?.message || 'Failed to update service reminder.')
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
                Edit Service Reminder
              </h3>
              <p className="text-xs text-zinc-400">
                Update service milestone intervals
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
          {/* Service Name & Type */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400">
                Service Title *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Service 2"
                className="mt-1.5 w-full rounded-xl border border-white/10 bg-[#12161c] px-3.5 py-2.5 font-mono text-sm font-bold text-white focus:border-lime-400 focus:outline-none focus:ring-1 focus:ring-lime-400"
              />
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

          {/* Toggle: Follow Purchase Date Duration */}
          <div className="flex items-center justify-between rounded-2xl border border-white/8 bg-[#12161c] p-3.5">
            <div>
              <span className="text-xs font-bold text-white">
                Follow Purchase Date Duration
              </span>
              <p className="text-[11px] text-zinc-400">
                {followPurchaseDate
                  ? vehiclePurchaseDate
                    ? `Using profile purchase date (${vehiclePurchaseDate})`
                    : 'No purchase date found in vehicle profile'
                  : 'Use custom start date'}
              </p>
            </div>
            <label className="relative inline-flex cursor-pointer items-center">
              <input
                type="checkbox"
                checked={followPurchaseDate}
                onChange={(e) => setFollowPurchaseDate(e.target.checked)}
                className="peer sr-only"
              />
              <div className="peer h-6 w-11 rounded-full bg-white/10 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:bg-zinc-400 after:transition-all after:content-[''] peer-checked:bg-lime-400 peer-checked:after:translate-x-full peer-checked:after:bg-zinc-950 peer-focus:outline-none" />
            </label>
          </div>

          {/* Custom Start Date (shown only if toggle is OFF) */}
          {!followPurchaseDate && (
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400">
                Start Date
              </label>
              <input
                type="date"
                value={customStartDate}
                onChange={(e) => setCustomStartDate(e.target.value)}
                className="mt-1.5 w-full rounded-xl border border-white/10 bg-[#12161c] px-3.5 py-2.5 font-mono text-sm text-white focus:border-lime-400 focus:outline-none focus:ring-1 focus:ring-lime-400"
              />
            </div>
          )}

          {/* Duration Window */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400">
                Duration Min (Days)
              </label>
              <input
                type="number"
                min={1}
                value={durationDaysMin}
                onChange={(e) => setDurationDaysMin(e.target.value)}
                placeholder="e.g. 30"
                className="mt-1.5 w-full rounded-xl border border-white/10 bg-[#12161c] px-3.5 py-2.5 font-mono text-sm text-white focus:border-lime-400 focus:outline-none focus:ring-1 focus:ring-lime-400"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400">
                Duration Max (Days)
              </label>
              <input
                type="number"
                min={1}
                value={durationDaysMax}
                onChange={(e) => setDurationDaysMax(e.target.value)}
                placeholder="e.g. 45"
                className="mt-1.5 w-full rounded-xl border border-white/10 bg-[#12161c] px-3.5 py-2.5 font-mono text-sm text-white focus:border-lime-400 focus:outline-none focus:ring-1 focus:ring-lime-400"
              />
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

          {/* Odometer Window */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400">
                Odometer Min (km)
              </label>
              <input
                type="number"
                min={0}
                value={dueOdometerKm}
                onChange={(e) => setDueOdometerKm(e.target.value)}
                placeholder="e.g. 500"
                className="mt-1.5 w-full rounded-xl border border-white/10 bg-[#12161c] px-3.5 py-2.5 font-mono text-sm text-white focus:border-lime-400 focus:outline-none focus:ring-1 focus:ring-lime-400"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400">
                Odometer Max (km)
              </label>
              <input
                type="number"
                min={0}
                value={dueOdometerMaxKm}
                onChange={(e) => setDueOdometerMaxKm(e.target.value)}
                placeholder="e.g. 750"
                className="mt-1.5 w-full rounded-xl border border-white/10 bg-[#12161c] px-3.5 py-2.5 font-mono text-sm text-white focus:border-lime-400 focus:outline-none focus:ring-1 focus:ring-lime-400"
              />
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
              placeholder="e.g. Engine oil replacement, chain lubrication"
              className="mt-1.5 w-full rounded-xl border border-white/10 bg-[#12161c] px-3.5 py-2.5 text-sm text-white focus:border-lime-400 focus:outline-none focus:ring-1 focus:ring-lime-400"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 border-t border-white/8 pt-4">
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
                  <Check className="h-3.5 w-3.5" /> Save Changes
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function EditReminderModal({
  isOpen,
  reminder,
  vehicle,
  onClose,
  onSubmit,
}) {
  if (!isOpen || !reminder) return null

  return (
    <EditReminderDialogContent
      reminder={reminder}
      vehicle={vehicle}
      onClose={onClose}
      onSubmit={onSubmit}
    />
  )
}
