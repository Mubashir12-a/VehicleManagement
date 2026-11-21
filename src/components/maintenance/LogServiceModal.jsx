import { Check, Clock, IndianRupee, Sparkles, Wrench, X } from 'lucide-react'
import { useState } from 'react'

function getTodayString() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function LogServiceDialogContent({
  onClose,
  item,
  vehicle,
  onSubmit,
}) {
  const currentVehicleOdo = Number(vehicle?.mileage) || 0
  const itemLastOdo = Number(item.lastServiceOdo) || 0
  const interval = Number(item.intervalKm) || 1000

  const defaultSuggestedOdo =
    currentVehicleOdo > itemLastOdo
      ? currentVehicleOdo
      : itemLastOdo + interval

  const [odometerKm, setOdometerKm] = useState(defaultSuggestedOdo)
  const [serviceDate, setServiceDate] = useState(getTodayString())
  const [cost, setCost] = useState('')
  const [notes, setNotes] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState(null)

  const enteredOdoNum = Math.max(0, Number(odometerKm) || 0)
  const nextTargetOdo = enteredOdoNum + interval

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)

    if (enteredOdoNum < 0) {
      setError('Odometer cannot be negative.')
      return
    }

    setIsSubmitting(true)
    try {
      await onSubmit(item, {
        odometerKm: enteredOdoNum,
        serviceDate,
        cost: Number(cost) || 0,
        notes: notes.trim(),
      })
      onClose()
    } catch (err) {
      setError(err?.message || 'Failed to save service log.')
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
              <Wrench className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-lg font-black tracking-tight text-white">
                Log Service: {item.label}
              </h3>
              <p className="text-xs text-zinc-400">
                Record component replacement or routine maintenance
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

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          {/* Target Interval Dynamic Preview */}
          <div className="rounded-2xl border border-lime-400/20 bg-lime-400/5 p-3.5">
            <div className="flex items-center justify-between text-xs">
              <span className="flex items-center gap-1.5 font-semibold text-lime-400">
                <Sparkles className="h-3.5 w-3.5" /> Next Interval Calculation
              </span>
              <span className="font-mono text-[11px] text-zinc-400">
                Period: Every {interval.toLocaleString('en-IN')} km
              </span>
            </div>
            <p className="mt-1.5 text-xs text-zinc-300">
              Once logged at{' '}
              <strong className="font-mono text-lime-300">
                {enteredOdoNum.toLocaleString('en-IN')} km
              </strong>
              , the next target service will automatically update to{' '}
              <strong className="font-mono text-white underline decoration-lime-400 decoration-2">
                {nextTargetOdo.toLocaleString('en-IN')} km
              </strong>
              .
            </p>
          </div>

          {/* Odometer Input */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400">
              Odometer Reading When Serviced (km) *
            </label>
            <div className="relative mt-1.5">
              <input
                type="number"
                min={0}
                required
                value={odometerKm}
                onChange={(e) => setOdometerKm(e.target.value)}
                placeholder="e.g. 3000"
                className="w-full rounded-xl border border-white/10 bg-[#12161c] px-3.5 py-2.5 font-mono text-sm text-white focus:border-lime-400 focus:outline-none focus:ring-1 focus:ring-lime-400"
              />
              <span className="absolute right-3.5 top-1/2 -translate-y-1/2 font-mono text-xs text-zinc-500">
                km
              </span>
            </div>
            <p className="mt-1 text-[11px] text-zinc-500">
              Vehicle current odometer is {currentVehicleOdo.toLocaleString('en-IN')} km.
            </p>
          </div>

          {/* Service Date & Cost */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400">
                Service Date *
              </label>
              <div className="relative mt-1.5">
                <input
                  type="date"
                  required
                  value={serviceDate}
                  onChange={(e) => setServiceDate(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-[#12161c] px-3.5 py-2.5 font-mono text-sm text-white focus:border-lime-400 focus:outline-none focus:ring-1 focus:ring-lime-400"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400">
                Cost (₹) (Optional)
              </label>
              <div className="relative mt-1.5">
                <IndianRupee className="absolute left-3.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-zinc-500" />
                <input
                  type="number"
                  min={0}
                  step="0.01"
                  value={cost}
                  onChange={(e) => setCost(e.target.value)}
                  placeholder="0.00"
                  className="w-full rounded-xl border border-white/10 bg-[#12161c] pl-9 pr-3.5 py-2.5 font-mono text-sm text-white focus:border-lime-400 focus:outline-none focus:ring-1 focus:ring-lime-400"
                />
              </div>
            </div>
          </div>

          {/* Notes / Parts Details */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400">
              Parts / Workshop / Notes (Optional)
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Motul 7100 10W-50 + Genuine Oil Filter changed"
              className="mt-1.5 w-full rounded-xl border border-white/10 bg-[#12161c] px-3.5 py-2.5 text-sm text-white focus:border-lime-400 focus:outline-none focus:ring-1 focus:ring-lime-400"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="rounded-xl border border-white/10 px-4 py-2.5 text-xs font-bold text-zinc-300 transition-colors hover:bg-white/5"
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
                  <Check className="h-3.5 w-3.5" /> Save Service Log
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function LogServiceModal({
  isOpen,
  onClose,
  item,
  vehicle,
  onSubmit,
}) {
  if (!isOpen || !item) return null

  return (
    <LogServiceDialogContent
      onClose={onClose}
      item={item}
      vehicle={vehicle}
      onSubmit={onSubmit}
    />
  )
}
