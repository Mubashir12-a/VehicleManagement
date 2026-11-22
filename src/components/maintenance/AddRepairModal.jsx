import { Check, Clock, IndianRupee, ShieldAlert, X } from 'lucide-react'
import { useState } from 'react'

function getTodayString() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

const REPAIR_CATEGORIES = [
  'General Repair',
  'Part Replacement',
  'Mod & Upgrade',
  'Accidental / Body',
  'Electrical / Wiring',
  'Puncture & Wheel',
  'Periodic Inspection',
]

function AddRepairDialogContent({
  onClose,
  vehicle,
  onSubmit,
}) {
  const currentVehicleOdo = Number(vehicle?.mileage) || 0

  const [repairTitle, setRepairTitle] = useState('')
  const [category, setCategory] = useState('General Repair')
  const [odometerKm, setOdometerKm] = useState(currentVehicleOdo)
  const [cost, setCost] = useState('')
  const [repairDate, setRepairDate] = useState(getTodayString())
  const [garageName, setGarageName] = useState('')
  const [notes, setNotes] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)

    if (!repairTitle.trim()) {
      setError('Please provide a repair / job title.')
      return
    }

    const odoNum = Math.max(0, Number(odometerKm) || 0)
    const costNum = Math.max(0, Number(cost) || 0)

    setIsSubmitting(true)
    try {
      await onSubmit({
        repairTitle: repairTitle.trim(),
        category,
        odometerKm: odoNum,
        cost: costNum,
        repairDate,
        garageName: garageName.trim(),
        notes: notes.trim(),
      })
      onClose()
    } catch (err) {
      setError(err?.message || 'Failed to save repair log.')
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
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-amber-400/15 text-amber-400 ring-1 ring-amber-400/30">
              <ShieldAlert className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-lg font-black tracking-tight text-white">
                Log Other Repair / Replacement
              </h3>
              <p className="text-xs text-zinc-400">
                Track ad-hoc mechanical jobs, accidental repairs, or custom upgrades
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
          {/* Repair Title */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400">
              Repair / Job Description *
            </label>
            <input
              type="text"
              required
              value={repairTitle}
              onChange={(e) => setRepairTitle(e.target.value)}
              placeholder="Enter repair title"
              className="mt-1.5 w-full rounded-xl border border-white/10 bg-[#12161c] px-3.5 py-2.5 text-sm text-white focus:border-amber-400 focus:outline-none focus:ring-1 focus:ring-amber-400"
            />
          </div>

          {/* Category & Odometer */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="mt-1.5 w-full rounded-xl border border-white/10 bg-[#12161c] px-3.5 py-2.5 text-sm text-white focus:border-amber-400 focus:outline-none focus:ring-1 focus:ring-amber-400"
              >
                {REPAIR_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400">
                Odometer (km) *
              </label>
              <div className="relative mt-1.5">
                <input
                  type="number"
                  min={0}
                  required
                  value={odometerKm}
                  onChange={(e) => setOdometerKm(e.target.value)}
                  placeholder="0"
                  className="w-full rounded-xl border border-white/10 bg-[#12161c] px-3.5 py-2.5 font-mono text-sm text-white focus:border-amber-400 focus:outline-none focus:ring-1 focus:ring-amber-400"
                />
                <span className="absolute right-3.5 top-1/2 -translate-y-1/2 font-mono text-xs text-zinc-500">
                  km
                </span>
              </div>
            </div>
          </div>

          {/* Cost & Date */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400">
                Total Cost (₹) *
              </label>
              <div className="relative mt-1.5">
                <IndianRupee className="absolute left-3.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-zinc-500" />
                <input
                  type="number"
                  min={0}
                  step="0.01"
                  required
                  value={cost}
                  onChange={(e) => setCost(e.target.value)}
                  placeholder="0.00"
                  className="w-full rounded-xl border border-white/10 bg-[#12161c] pl-9 pr-3.5 py-2.5 font-mono text-sm text-white focus:border-amber-400 focus:outline-none focus:ring-1 focus:ring-amber-400"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400">
                Repair Date *
              </label>
              <input
                type="date"
                required
                value={repairDate}
                onChange={(e) => setRepairDate(e.target.value)}
                className="mt-1.5 w-full rounded-xl border border-white/10 bg-[#12161c] px-3.5 py-2.5 font-mono text-sm text-white focus:border-amber-400 focus:outline-none focus:ring-1 focus:ring-amber-400"
              />
            </div>
          </div>

          {/* Workshop / Garage */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400">
              Workshop / Garage Name (Optional)
            </label>
            <input
              type="text"
              value={garageName}
              onChange={(e) => setGarageName(e.target.value)}
              placeholder="Enter workshop / garage name"
              className="mt-1.5 w-full rounded-xl border border-white/10 bg-[#12161c] px-3.5 py-2.5 text-sm text-white focus:border-amber-400 focus:outline-none focus:ring-1 focus:ring-amber-400"
            />
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400">
              Notes & Invoices (Optional)
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Enter notes / invoices"
              className="mt-1.5 w-full rounded-xl border border-white/10 bg-[#12161c] px-3.5 py-2.5 text-sm text-white focus:border-amber-400 focus:outline-none focus:ring-1 focus:ring-amber-400"
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
              className="inline-flex items-center gap-1.5 rounded-xl bg-amber-400 px-5 py-2.5 text-xs font-black text-zinc-950 transition-colors hover:bg-amber-300 disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Clock className="h-3.5 w-3.5 animate-spin" /> Saving...
                </>
              ) : (
                <>
                  <Check className="h-3.5 w-3.5" /> Save Repair Log
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function AddRepairModal({
  isOpen,
  onClose,
  vehicle,
  onSubmit,
}) {
  if (!isOpen) return null

  return (
    <AddRepairDialogContent
      onClose={onClose}
      vehicle={vehicle}
      onSubmit={onSubmit}
    />
  )
}
