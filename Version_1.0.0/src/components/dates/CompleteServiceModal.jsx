import {
  Calendar,
  CheckCircle2,
  Gauge,
  IndianRupee,
  MapPin,
  Receipt,
  Wrench,
  X,
} from 'lucide-react'
import { useState } from 'react'

function CompleteServiceDialogContent({
  reminder,
  currentMileage = 0,
  onClose,
  onSubmit,
}) {
  const [completedDate, setCompletedDate] = useState(() => {
    const today = new Date()
    return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`
  })
  const [completedOdometerKm, setCompletedOdometerKm] = useState(
    () => String(reminder.dueOdometerKm || currentMileage || ''),
  )
  const [amountPaid, setAmountPaid] = useState('')
  const [serviceCenter, setServiceCenter] = useState('')
  const [invoiceNo, setInvoiceNo] = useState('')
  const [notes, setNotes] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)

    if (!completedDate) {
      setError('Completion date is required.')
      return
    }

    if (amountPaid === '' || Number(amountPaid) < 0) {
      setError('Please enter a valid amount paid (enter 0 if free).')
      return
    }

    setIsSubmitting(true)
    try {
      await onSubmit(reminder.id, {
        completedDate,
        completedOdometerKm: completedOdometerKm ? Number(completedOdometerKm) : null,
        amountPaid: Number(amountPaid) || 0,
        serviceCenter: serviceCenter.trim(),
        invoiceNo: invoiceNo.trim(),
        notes: notes.trim(),
      })
      onClose()
    } catch (err) {
      setError(err?.message || 'Failed to complete service reminder.')
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
        <div className="flex items-center justify-between border-b border-white/6 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-lime-400/10 text-lime-400 ring-1 ring-lime-400/20">
              <CheckCircle2 className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                Complete Service
              </h3>
              <p className="text-xs text-zinc-400">
                Record service invoice, odometer, and final bill amount
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl p-2 text-zinc-400 hover:bg-white/5 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Reminder Target Info Banner */}
        <div className="mt-4 rounded-2xl border border-lime-400/20 bg-lime-400/5 p-3.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-lime-400">
              {reminder.serviceType || 'Service Reminder'}
            </span>
            <span className="font-mono text-xs text-zinc-400">
              Target:{' '}
              {reminder.dueOdometerKm
                ? `${Number(reminder.dueOdometerKm).toLocaleString('en-IN')} km`
                : 'Flexible'}
            </span>
          </div>
          <p className="mt-1 text-sm font-bold text-white">{reminder.title}</p>
        </div>

        {/* Error Notice */}
        {error && (
          <div className="mt-4 rounded-xl border border-rose-500/20 bg-rose-500/10 p-3 text-xs text-rose-300">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          {/* Amount Paid & Date */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-zinc-300">
                <IndianRupee className="h-3.5 w-3.5 text-lime-400" /> Amount Paid (₹) *
              </label>
              <input
                type="number"
                min="0"
                step="any"
                required
                value={amountPaid}
                onChange={(e) => setAmountPaid(e.target.value)}
                placeholder="e.g. 1850 (0 if free)"
                className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm font-mono font-bold text-lime-400 placeholder:text-zinc-600 focus:border-lime-400 focus:outline-none focus:ring-1 focus:ring-lime-400"
              />
            </div>

            <div>
              <label className="mb-1.5 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-zinc-300">
                <Calendar className="h-3.5 w-3.5 text-lime-400" /> Service Date *
              </label>
              <input
                type="date"
                required
                value={completedDate}
                onChange={(e) => setCompletedDate(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-zinc-600 focus:border-lime-400 focus:outline-none focus:ring-1 focus:ring-lime-400"
              />
            </div>
          </div>

          {/* Odometer & Invoice No */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-zinc-300">
                <Gauge className="h-3.5 w-3.5 text-lime-400" /> Completed at Odo (km)
              </label>
              <input
                type="number"
                min="0"
                value={completedOdometerKm}
                onChange={(e) => setCompletedOdometerKm(e.target.value)}
                placeholder={currentMileage ? String(currentMileage) : 'e.g. 500'}
                className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm font-mono text-white placeholder:text-zinc-600 focus:border-lime-400 focus:outline-none focus:ring-1 focus:ring-lime-400"
              />
            </div>

            <div>
              <label className="mb-1.5 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-zinc-300">
                <Receipt className="h-3.5 w-3.5 text-lime-400" /> Invoice / Job Card #
              </label>
              <input
                type="text"
                value={invoiceNo}
                onChange={(e) => setInvoiceNo(e.target.value)}
                placeholder="e.g. INV-2026-8942"
                className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-zinc-600 focus:border-lime-400 focus:outline-none focus:ring-1 focus:ring-lime-400"
              />
            </div>
          </div>

          {/* Service Center */}
          <div>
            <label className="mb-1.5 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-zinc-300">
              <MapPin className="h-3.5 w-3.5 text-lime-400" /> Workshop / Service Center
            </label>
            <input
              type="text"
              value={serviceCenter}
              onChange={(e) => setServiceCenter(e.target.value)}
              placeholder="e.g. KTM Authorized Service, Indiranagar"
              className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-zinc-600 focus:border-lime-400 focus:outline-none focus:ring-1 focus:ring-lime-400"
            />
          </div>

          {/* Notes */}
          <div>
            <label className="mb-1.5 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-zinc-300">
              <Wrench className="h-3.5 w-3.5 text-lime-400" /> Work Done & Replaced Parts Notes
            </label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Engine oil + oil filter replaced. Chain cleaned, lubed, and adjusted. Coolant topped up."
              className="w-full resize-none rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-zinc-600 focus:border-lime-400 focus:outline-none focus:ring-1 focus:ring-lime-400"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/6">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-xs font-bold text-zinc-300 transition-colors hover:bg-white/10 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 rounded-xl bg-lime-400 px-5 py-2 text-xs font-bold text-zinc-950 shadow-[0_0_20px_rgba(163,230,53,0.3)] transition-all hover:bg-lime-300 disabled:opacity-50"
            >
              <CheckCircle2 className="h-4 w-4" />
              {isSubmitting ? 'Saving...' : 'Confirm Service Done'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function CompleteServiceModal({
  isOpen,
  reminder,
  currentMileage = 0,
  onClose,
  onSubmit,
}) {
  if (!isOpen || !reminder) return null

  return (
    <CompleteServiceDialogContent
      reminder={reminder}
      currentMileage={currentMileage}
      onClose={onClose}
      onSubmit={onSubmit}
    />
  )
}
