import { Bell, Check, Clock, X } from 'lucide-react'
import { useMemo, useState } from 'react'

function getUsedServiceNumbers(reminders = []) {
  const used = new Set()
  for (const r of reminders) {
    if (!r?.title) continue
    const match = String(r.title).match(/\d+/)
    if (match) {
      used.add(parseInt(match[0], 10))
    }
  }
  return used
}

function AddReminderDialogContent({
  existingReminders = [],
  onClose,
  onSubmit,
}) {
  const [serviceNumber, setServiceNumber] = useState('')
  const [serviceType, setServiceType] = useState('Free Service')
  const [dueOdometerKm, setDueOdometerKm] = useState('')
  const [dueOdometerMaxKm, setDueOdometerMaxKm] = useState('')
  const [dueDate, setDueDate] = useState('')
  const [dueDateEnd, setDueDateEnd] = useState('')
  const [notes, setNotes] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState(null)

  // Compute used service numbers from existing reminders
  const usedNumbers = useMemo(
    () => getUsedServiceNumbers(existingReminders),
    [existingReminders],
  )
  const totalEntriesCount = (existingReminders || []).length

  // Quick templates up to 5:
  // After 5 entries OR as each one is entered, that quick template option vanishes.
  // After 5 entries, no quick template options are shown at all.
  const availableTemplates = useMemo(() => {
    if (totalEntriesCount >= 5) return []
    return [1, 2, 3, 4, 5].filter((n) => !usedNumbers.has(n))
  }, [totalEntriesCount, usedNumbers])

  const handleSelectTemplate = (num) => {
    setServiceNumber(String(num))
    if (num <= 3) {
      setServiceType('Free Service')
    } else {
      setServiceType('Paid Periodic')
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)

    const num = parseInt(serviceNumber, 10)
    if (!serviceNumber || isNaN(num) || num <= 0) {
      setError('Please enter a valid numerical service number (e.g. 1, 2, 3...).')
      return
    }

    if (usedNumbers.has(num)) {
      setError(`Service ${num} already exists in your reminders. Please enter a different service number.`)
      return
    }

    setIsSubmitting(true)
    try {
      await onSubmit({
        title: `Service ${num}`,
        serviceType,
        dueOdometerKm: dueOdometerKm ? Number(dueOdometerKm) : null,
        dueOdometerMaxKm: dueOdometerMaxKm ? Number(dueOdometerMaxKm) : null,
        dueDate: dueDate || null,
        dueDateEnd: dueDateEnd || null,
        notes: notes.trim(),
      })
      onClose()
    } catch (err) {
      setError(err?.message || 'Failed to save reminder.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-lg overflow-hidden rounded-3xl border border-white/10 bg-[#0d1014] p-6 shadow-2xl sm:p-7">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-white/8 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-lime-400/15 text-lime-400 ring-1 ring-lime-400/30">
              <Bell className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-lg font-black tracking-tight text-white">
                Add Service Reminder
              </h3>
              <p className="text-xs text-zinc-400">
                Configure service schedule and target odometer alerts
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
          <div className="mt-4 rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-xs text-rose-300">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          {/* Service Number (Numerical Only) with Quick Templates up to 5 */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400">
                Service Number * <span className="text-[10px] font-normal lowercase text-zinc-500">(numerical only)</span>
              </label>
              {serviceNumber && (
                <span className="font-mono text-xs font-bold text-lime-400">
                  Service #{serviceNumber}
                </span>
              )}
            </div>

            {/* Quick Templates Up To 5: Vanishes after 5 entries or as each is entered */}
            {availableTemplates.length > 0 && (
              <div className="rounded-xl border border-white/6 bg-white/[0.02] p-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-bold text-zinc-400">
                    Quick Templates (1 to 5):
                  </span>
                  <span className="text-[10px] text-zinc-500">
                    {availableTemplates.length} available
                  </span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {availableTemplates.map((num) => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => handleSelectTemplate(num)}
                      className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-all ${
                        serviceNumber === String(num)
                          ? 'bg-lime-400 text-zinc-950 shadow-[0_0_12px_rgba(163,230,53,0.3)] ring-1 ring-lime-400'
                          : 'border border-white/10 bg-white/5 text-zinc-300 hover:border-lime-400/40 hover:bg-lime-400/10 hover:text-lime-300'
                      }`}
                    >
                      Service {num}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Manual Numerical Input */}
            <div>
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                required
                value={serviceNumber}
                onChange={(e) => {
                  // strictly numerical: just numbers, nothing else!
                  const cleanVal = e.target.value.replace(/\D/g, '')
                  setServiceNumber(cleanVal)
                }}
                placeholder={
                  availableTemplates.length > 0
                    ? 'Select a template above or enter number (e.g. 1)'
                    : 'Enter service number (e.g. 6) - numerical only'
                }
                className="w-full rounded-xl border border-white/10 bg-[#12161c] px-3.5 py-2.5 font-mono text-sm font-bold text-white placeholder:font-sans placeholder:font-normal placeholder:text-zinc-600 focus:border-lime-400 focus:outline-none focus:ring-1 focus:ring-lime-400"
              />
            </div>
          </div>

          {/* Service Type */}
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
              <option value="Paid Periodic">Paid Periodic Service</option>
              <option value="General Inspection">General Inspection</option>
              <option value="Safety Checkup">Safety Checkup</option>
            </select>
          </div>

          {/* Odometer Range */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400">
                Target Odometer Min (km)
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
                Target Odometer Max (km)
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

          {/* Due Date Window */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400">
                Due Date (From)
              </label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="mt-1.5 w-full rounded-xl border border-white/10 bg-[#12161c] px-3.5 py-2.5 font-mono text-sm text-white focus:border-lime-400 focus:outline-none focus:ring-1 focus:ring-lime-400"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400">
                Due Date (To)
              </label>
              <input
                type="date"
                value={dueDateEnd}
                onChange={(e) => setDueDateEnd(e.target.value)}
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
              placeholder="e.g. Check tappet clearance, chain tightening, oil voucher"
              className="mt-1.5 w-full rounded-xl border border-white/10 bg-[#12161c] px-3.5 py-2.5 text-sm text-white focus:border-lime-400 focus:outline-none focus:ring-1 focus:ring-lime-400"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/6">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="rounded-xl border border-white/10 px-4 py-2.5 text-xs font-bold text-zinc-300 hover:bg-white/5"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-1.5 rounded-xl bg-lime-400 px-5 py-2.5 text-xs font-black text-zinc-950 transition-colors hover:bg-lime-300 disabled:opacity-50"
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
