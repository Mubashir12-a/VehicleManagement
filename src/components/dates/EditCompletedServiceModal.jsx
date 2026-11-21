import {
  Calendar,
  Check,
  CheckCircle2,
  Clock,
  Gauge,
  IndianRupee,
  Info,
  MapPin,
  Pencil,
  Receipt,
  RotateCcw,
  Wrench,
  X,
} from 'lucide-react'
import { useState } from 'react'

function EditCompletedServiceDialogContent({
  reminder,
  onClose,
  onSubmit,
}) {
  const [title, setTitle] = useState(reminder?.title || '')
  const [serviceType, setServiceType] = useState(
    reminder?.serviceType || 'Free Service',
  )
  const [completedDate, setCompletedDate] = useState(
    reminder?.completedDate || '',
  )
  const [completedOdometerKm, setCompletedOdometerKm] = useState(
    reminder?.completedOdometerKm !== null && reminder?.completedOdometerKm !== undefined
      ? String(reminder.completedOdometerKm)
      : '',
  )
  const [amountPaid, setAmountPaid] = useState(
    reminder?.amountPaid !== null && reminder?.amountPaid !== undefined
      ? String(reminder.amountPaid)
      : '0',
  )
  const [serviceCenter, setServiceCenter] = useState(
    reminder?.serviceCenter || '',
  )
  const [invoiceNo, setInvoiceNo] = useState(reminder?.invoiceNo || '')
  const [notes, setNotes] = useState(reminder?.notes || '')

  // Target fields
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
  const [dueDateFrom, setDueDateFrom] = useState(reminder?.dueDateFrom || '')
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

  const [showTargetDetails, setShowTargetDetails] = useState(false)
  const [reopenAsActive, setReopenAsActive] = useState(false)

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)

    if (!title.trim()) {
      setError('Service title is required.')
      return
    }

    if (!reopenAsActive) {
      if (!completedDate) {
        setError('Completion date is required.')
        return
      }

      if (amountPaid === '' || Number(amountPaid) < 0) {
        setError('Please enter a valid amount paid (enter 0 if free).')
        return
      }
    }

    setIsSubmitting(true)
    try {
      if (reopenAsActive) {
        await onSubmit(reminder.id, {
          title: title.trim(),
          serviceType,
          status: 'Pending',
          completedDate: null,
          completedOdometerKm: null,
          amountPaid: 0,
          serviceCenter: serviceCenter.trim(),
          invoiceNo: invoiceNo.trim(),
          notes: notes.trim(),
          dueOdometerKm: dueOdometerKm ? Number(dueOdometerKm) : null,
          dueOdometerMaxKm: dueOdometerMaxKm ? Number(dueOdometerMaxKm) : null,
          dueDateFrom: dueDateFrom || null,
          durationDaysMin: durationDaysMin ? Number(durationDaysMin) : null,
          durationDaysMax: durationDaysMax ? Number(durationDaysMax) : null,
        })
      } else {
        await onSubmit(reminder.id, {
          title: title.trim(),
          serviceType,
          status: 'Completed',
          completedDate,
          completedOdometerKm: completedOdometerKm
            ? Number(completedOdometerKm)
            : null,
          amountPaid: Number(amountPaid) || 0,
          serviceCenter: serviceCenter.trim(),
          invoiceNo: invoiceNo.trim(),
          notes: notes.trim(),
          dueOdometerKm: dueOdometerKm ? Number(dueOdometerKm) : null,
          dueOdometerMaxKm: dueOdometerMaxKm ? Number(dueOdometerMaxKm) : null,
          dueDateFrom: dueDateFrom || null,
          durationDaysMin: durationDaysMin ? Number(durationDaysMin) : null,
          durationDaysMax: durationDaysMax ? Number(durationDaysMax) : null,
        })
      }
      onClose()
    } catch (err) {
      setError(err?.message || 'Failed to update service record.')
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
              <Pencil className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-xl font-black tracking-tight text-white">
                Edit Completed Service Record
              </h3>
              <p className="text-xs text-zinc-400">
                Update billing, service date, odometer reading, and workshop invoice details
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

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          {/* Service Title & Service Type */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-zinc-300">
                <Wrench className="h-3.5 w-3.5 text-lime-400" /> Service Name *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Service 1"
                className="w-full rounded-xl border border-white/10 bg-[#12161c] px-3.5 py-2.5 text-sm font-bold text-white focus:border-lime-400 focus:outline-none focus:ring-1 focus:ring-lime-400"
              />
            </div>

            <div>
              <label className="mb-1.5 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-zinc-300">
                <CheckCircle2 className="h-3.5 w-3.5 text-lime-400" /> Service Type
              </label>
              <select
                value={serviceType}
                onChange={(e) => setServiceType(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-[#12161c] px-3.5 py-2.5 text-sm text-white focus:border-lime-400 focus:outline-none focus:ring-1 focus:ring-lime-400"
              >
                <option value="Free Service">Free Service</option>
                <option value="Paid Service">Paid Service</option>
              </select>
            </div>
          </div>

          {!reopenAsActive && (
            <>
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
                    className="w-full rounded-xl border border-white/10 bg-[#12161c] px-3.5 py-2.5 font-mono text-sm font-bold text-lime-400 placeholder:text-zinc-600 focus:border-lime-400 focus:outline-none focus:ring-1 focus:ring-lime-400"
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
                    className="w-full rounded-xl border border-white/10 bg-[#12161c] px-3.5 py-2.5 font-mono text-sm text-white placeholder:text-zinc-600 focus:border-lime-400 focus:outline-none focus:ring-1 focus:ring-lime-400"
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
                    placeholder="e.g. 750"
                    className="w-full rounded-xl border border-white/10 bg-[#12161c] px-3.5 py-2.5 font-mono text-sm text-white placeholder:text-zinc-600 focus:border-lime-400 focus:outline-none focus:ring-1 focus:ring-lime-400"
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
                    className="w-full rounded-xl border border-white/10 bg-[#12161c] px-3.5 py-2.5 text-sm text-white placeholder:text-zinc-600 focus:border-lime-400 focus:outline-none focus:ring-1 focus:ring-lime-400"
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
                  placeholder="e.g. Authorized Service Center, MG Road"
                  className="w-full rounded-xl border border-white/10 bg-[#12161c] px-3.5 py-2.5 text-sm text-white placeholder:text-zinc-600 focus:border-lime-400 focus:outline-none focus:ring-1 focus:ring-lime-400"
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
                  placeholder="e.g. Engine oil replaced, chain cleaned and lubed, brake checked"
                  className="w-full resize-none rounded-xl border border-white/10 bg-[#12161c] px-3.5 py-2.5 text-sm text-white placeholder:text-zinc-600 focus:border-lime-400 focus:outline-none focus:ring-1 focus:ring-lime-400"
                />
              </div>
            </>
          )}

          {/* Collapsible / Optional Target Milestones */}
          <div className="rounded-2xl border border-white/8 bg-[#12161c] p-3.5">
            <button
              type="button"
              onClick={() => setShowTargetDetails(!showTargetDetails)}
              className="flex w-full items-center justify-between text-xs font-bold text-zinc-300 hover:text-white"
            >
              <span className="flex items-center gap-2">
                <Info className="h-3.5 w-3.5 text-lime-400" />
                Original Target Milestones (Odo & Days)
              </span>
              <span className="font-mono text-[11px] text-lime-400">
                {showTargetDetails ? 'Hide' : 'Show / Edit'}
              </span>
            </button>

            {showTargetDetails && (
              <div className="mt-3.5 space-y-3 border-t border-white/6 pt-3 text-xs">
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div>
                    <label className="block text-[11px] font-semibold text-zinc-400">
                      Target Odo Min (km)
                    </label>
                    <input
                      type="number"
                      value={dueOdometerKm}
                      onChange={(e) => setDueOdometerKm(e.target.value)}
                      placeholder="e.g. 500"
                      className="mt-1 w-full rounded-xl border border-white/10 bg-[#0d1014] px-3 py-1.5 font-mono text-sm text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-zinc-400">
                      Target Odo Max (km)
                    </label>
                    <input
                      type="number"
                      value={dueOdometerMaxKm}
                      onChange={(e) => setDueOdometerMaxKm(e.target.value)}
                      placeholder="e.g. 750"
                      className="mt-1 w-full rounded-xl border border-white/10 bg-[#0d1014] px-3 py-1.5 font-mono text-sm text-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-zinc-400">
                      Start Date
                    </label>
                    <input
                      type="date"
                      value={dueDateFrom}
                      onChange={(e) => setDueDateFrom(e.target.value)}
                      className="mt-1 w-full rounded-xl border border-white/10 bg-[#0d1014] px-3 py-1.5 font-mono text-sm text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-zinc-400">
                      Duration Min (Days)
                    </label>
                    <input
                      type="number"
                      value={durationDaysMin}
                      onChange={(e) => setDurationDaysMin(e.target.value)}
                      placeholder="e.g. 30"
                      className="mt-1 w-full rounded-xl border border-white/10 bg-[#0d1014] px-3 py-1.5 font-mono text-sm text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-zinc-400">
                      Duration Max (Days)
                    </label>
                    <input
                      type="number"
                      value={durationDaysMax}
                      onChange={(e) => setDurationDaysMax(e.target.value)}
                      placeholder="e.g. 45"
                      className="mt-1 w-full rounded-xl border border-white/10 bg-[#0d1014] px-3 py-1.5 font-mono text-sm text-white"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Reopen as Active Option */}
          <div className="flex items-center justify-between rounded-xl border border-amber-400/20 bg-amber-400/5 p-3">
            <div className="flex items-center gap-2">
              <RotateCcw className="h-4 w-4 text-amber-400 shrink-0" />
              <div>
                <p className="text-xs font-bold text-amber-300">
                  Move back to Scheduled Reminders?
                </p>
                <p className="text-[11px] text-zinc-400">
                  Re-opens this service as pending if it was marked as done by mistake
                </p>
              </div>
            </div>
            <label className="relative inline-flex cursor-pointer items-center">
              <input
                type="checkbox"
                checked={reopenAsActive}
                onChange={(e) => setReopenAsActive(e.target.checked)}
                className="peer sr-only"
              />
              <div className="peer h-6 w-11 rounded-full bg-white/10 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:bg-zinc-400 after:transition-all after:content-[''] peer-checked:bg-amber-400 peer-checked:after:translate-x-full peer-checked:after:bg-zinc-950 peer-focus:outline-none" />
            </label>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between border-t border-white/8 pt-4">
            <p className="text-[11px] text-zinc-500">
              Total spend and service history table will update immediately.
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
                    <Check className="h-3.5 w-3.5" /> Save Changes
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

export default function EditCompletedServiceModal({
  isOpen,
  reminder,
  onClose,
  onSubmit,
}) {
  if (!isOpen || !reminder) return null

  return (
    <EditCompletedServiceDialogContent
      reminder={reminder}
      onClose={onClose}
      onSubmit={onSubmit}
    />
  )
}
