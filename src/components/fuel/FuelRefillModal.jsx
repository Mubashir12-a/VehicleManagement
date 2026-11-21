import { Calculator, Check, Fuel, MapPin, X } from 'lucide-react'
import { useState } from 'react'

function getTodayString() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

const STATION_PRESETS = [
  'IndianOil',
  'Bharat Petroleum',
  'HP Auto Care',
  'Shell',
  'Nayara Energy',
  'Jio-bp',
]

function getInitialFormData(vehicle, refillToEdit) {
  if (refillToEdit) {
    return {
      odometerKm: refillToEdit.odometerKm,
      liters: String(refillToEdit.liters),
      pricePerLiter: String(refillToEdit.pricePerLiter),
      amountSpent: String(refillToEdit.amountSpent),
      fuelFillType: refillToEdit.fuelFillType || 'Full Tank',
      fuelLevelAfter: refillToEdit.fuelLevelAfter ?? 100,
      refillDate: refillToEdit.refillDate || getTodayString(),
      stationName: refillToEdit.stationName || 'IndianOil',
      location: refillToEdit.location || '',
      notes: refillToEdit.notes || '',
    }
  }

  const defaultLiters = vehicle?.category === 'Four Wheeler' ? '30.00' : '8.00'
  const defaultPrice = '105.00'
  const defaultAmount = (Number(defaultLiters) * Number(defaultPrice)).toFixed(2)

  return {
    odometerKm: vehicle?.mileage || '',
    liters: defaultLiters,
    pricePerLiter: defaultPrice,
    amountSpent: defaultAmount,
    fuelFillType: 'Full Tank',
    fuelLevelAfter: 100,
    refillDate: getTodayString(),
    stationName: 'IndianOil',
    location: '',
    notes: '',
  }
}

function FuelRefillDialogContent({
  onClose,
  onSubmit,
  vehicle,
  refillToEdit,
}) {
  const isEditing = Boolean(refillToEdit)
  const [formData, setFormData] = useState(() =>
    getInitialFormData(vehicle, refillToEdit),
  )
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  // 3-way reactive calculator handlers
  const handleLitersChange = (e) => {
    const val = e.target.value
    const litersNum = parseFloat(val)
    const priceNum = parseFloat(formData.pricePerLiter)
    const amountNum = parseFloat(formData.amountSpent)

    let nextAmount = formData.amountSpent
    let nextPrice = formData.pricePerLiter

    if (!isNaN(litersNum) && litersNum > 0) {
      if (!isNaN(priceNum) && priceNum > 0) {
        nextAmount = (litersNum * priceNum).toFixed(2)
      } else if (!isNaN(amountNum) && amountNum > 0) {
        nextPrice = (amountNum / litersNum).toFixed(2)
      }
    }

    setFormData((prev) => ({
      ...prev,
      liters: val,
      amountSpent: nextAmount,
      pricePerLiter: nextPrice,
    }))
  }

  const handlePriceChange = (e) => {
    const val = e.target.value
    const priceNum = parseFloat(val)
    const litersNum = parseFloat(formData.liters)
    const amountNum = parseFloat(formData.amountSpent)

    let nextAmount = formData.amountSpent
    let nextLiters = formData.liters

    if (!isNaN(priceNum) && priceNum > 0) {
      if (!isNaN(litersNum) && litersNum > 0) {
        nextAmount = (litersNum * priceNum).toFixed(2)
      } else if (!isNaN(amountNum) && amountNum > 0) {
        nextLiters = (amountNum / priceNum).toFixed(2)
      }
    }

    setFormData((prev) => ({
      ...prev,
      pricePerLiter: val,
      amountSpent: nextAmount,
      liters: nextLiters,
    }))
  }

  const handleAmountChange = (e) => {
    const val = e.target.value
    const amountNum = parseFloat(val)
    const priceNum = parseFloat(formData.pricePerLiter)
    const litersNum = parseFloat(formData.liters)

    let nextLiters = formData.liters
    let nextPrice = formData.pricePerLiter

    if (!isNaN(amountNum) && amountNum > 0) {
      if (!isNaN(priceNum) && priceNum > 0) {
        nextLiters = (amountNum / priceNum).toFixed(2)
      } else if (!isNaN(litersNum) && litersNum > 0) {
        nextPrice = (amountNum / litersNum).toFixed(2)
      }
    }

    setFormData((prev) => ({
      ...prev,
      amountSpent: val,
      liters: nextLiters,
      pricePerLiter: nextPrice,
    }))
  }

  const handleFillTypeChange = (type) => {
    setFormData((prev) => ({
      ...prev,
      fuelFillType: type,
      fuelLevelAfter:
        type === 'Full Tank' ? 100 : Math.min(prev.fuelLevelAfter, 75),
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    const odoNum = Number(formData.odometerKm)
    const litersNum = Number(formData.liters)
    const priceNum = Number(formData.pricePerLiter)
    const amountNum = Number(formData.amountSpent)

    if (isNaN(odoNum) || odoNum < 0) {
      setError('Please enter a valid non-negative odometer reading.')
      return
    }
    if (isNaN(litersNum) || litersNum <= 0) {
      setError('Please enter a valid liters quantity greater than 0.')
      return
    }
    if (isNaN(priceNum) || priceNum <= 0) {
      setError('Please enter a valid price per liter.')
      return
    }
    if (isNaN(amountNum) || amountNum <= 0) {
      setError('Please enter a valid total amount filled.')
      return
    }

    setSaving(true)
    try {
      await onSubmit({
        ...formData,
        odometerKm: odoNum,
        liters: litersNum,
        pricePerLiter: priceNum,
        amountSpent: amountNum,
        fuelLevelAfter:
          Number(formData.fuelLevelAfter) ||
          (formData.fuelFillType === 'Full Tank' ? 100 : 75),
      })
      onClose()
    } catch (err) {
      setError(err?.message || 'Failed to save fuel refill.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div
      className="relative w-full max-w-xl max-h-[92vh] overflow-y-auto rounded-3xl border border-white/12 bg-[#0d1014] p-5 shadow-[0_20px_60px_rgba(0,0,0,0.9)] sm:p-7 text-zinc-100"
      onClick={(e) => e.stopPropagation()}
    >
      {/* Modal Header */}
      <div className="flex items-start justify-between border-b border-white/8 pb-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-lime-400 text-zinc-950 shadow-[0_0_20px_rgba(163,230,53,0.35)]">
            <Fuel className="h-5 w-5 stroke-[2.4]" />
          </div>
          <div>
            <h3 className="text-base font-extrabold uppercase tracking-wider text-white sm:text-lg">
              {isEditing ? 'Edit Fuel Refill' : 'Log New Fuel Refill'}
            </h3>
            <p className="text-xs text-zinc-400">
              {isEditing
                ? `Updating record for ${vehicle?.name || 'Vehicle'} · ID: ${String(refillToEdit?.id || '').slice(0, 8)}`
                : `3-way auto calculation · Syncs odometer (${vehicle?.mileage || 0} km)`}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onClose}
          disabled={saving}
          className="rounded-xl p-1.5 text-zinc-400 hover:bg-white/5 hover:text-white transition-colors"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {error && (
        <div className="mt-4 rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-xs text-rose-300">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="mt-5 space-y-4">
        {/* 1. ODOMETER & DATE */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-300">
              Odometer Reading (KM) *
            </label>
            <div className="relative mt-1.5">
              <input
                type="number"
                required
                min="0"
                step="1"
                value={formData.odometerKm === 0 || !formData.odometerKm ? '' : formData.odometerKm}
                onChange={(e) =>
                  setFormData({ ...formData, odometerKm: e.target.value })
                }
                placeholder="0"
                className="w-full rounded-xl border border-white/10 bg-[#12161c] px-3.5 py-2.5 font-mono text-sm text-white placeholder-zinc-500 focus:border-lime-400 focus:outline-none focus:ring-1 focus:ring-lime-400"
              />
              <span className="absolute right-3 top-2.5 font-mono text-xs font-bold text-zinc-500">
                KM
              </span>
            </div>
            <p className="mt-1 text-[11px] text-zinc-500">
              Current vehicle odo:{' '}
              <strong className="text-zinc-300">
                {vehicle?.mileage || 0} km
              </strong>
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-300">
              Refill Date *
            </label>
            <input
              type="date"
              required
              value={formData.refillDate}
              onChange={(e) =>
                setFormData({ ...formData, refillDate: e.target.value })
              }
              className="mt-1.5 w-full rounded-xl border border-white/10 bg-[#12161c] px-3.5 py-2.5 text-sm text-white focus:border-lime-400 focus:outline-none focus:ring-1 focus:ring-lime-400"
            />
            <p className="mt-1 text-[11px] text-zinc-500">
              Date of fuel purchase
            </p>
          </div>
        </div>

        {/* 2. 3-WAY REACTIVE AUTO CALCULATOR STRIP */}
        <div className="rounded-2xl border border-lime-400/20 bg-lime-400/5 p-4">
          <div className="flex items-center justify-between text-xs font-bold text-lime-400">
            <span className="flex items-center gap-1.5 uppercase tracking-wider">
              <Calculator className="h-3.5 w-3.5" />
              3-Way Reactive Calculator
            </span>
            <span className="text-[11px] font-mono text-zinc-400">
              Amount = Liters × Price/L
            </span>
          </div>

          <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-3">
            {/* Liters */}
            <div>
              <label className="block text-[11px] font-semibold text-zinc-300">
                Fuel Quantity (Liters) *
              </label>
              <div className="relative mt-1">
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  required
                  value={formData.liters}
                  onChange={handleLitersChange}
                  className="w-full rounded-xl border border-white/10 bg-[#12161c] px-3 py-2 font-mono text-sm text-white focus:border-lime-400 focus:outline-none"
                  placeholder="10.00"
                />
                <span className="absolute right-3 top-2 font-mono text-xs font-bold text-zinc-500">
                  L
                </span>
              </div>
            </div>

            {/* Price per Liter */}
            <div>
              <label className="block text-[11px] font-semibold text-zinc-300">
                Price per Liter (₹) *
              </label>
              <div className="relative mt-1">
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  required
                  value={formData.pricePerLiter}
                  onChange={handlePriceChange}
                  className="w-full rounded-xl border border-white/10 bg-[#12161c] px-3 py-2 font-mono text-sm text-white focus:border-lime-400 focus:outline-none"
                  placeholder="105.00"
                />
                <span className="absolute right-3 top-2 font-mono text-xs font-bold text-zinc-500">
                  ₹/L
                </span>
              </div>
            </div>

            {/* Total Amount Filled */}
            <div>
              <label className="block text-[11px] font-semibold text-zinc-300">
                Total Filled Amount (₹) *
              </label>
              <div className="relative mt-1">
                <input
                  type="number"
                  step="0.01"
                  min="1"
                  required
                  value={formData.amountSpent}
                  onChange={handleAmountChange}
                  className="w-full rounded-xl border border-lime-400/40 bg-[#12161c] px-3 py-2 font-mono text-sm font-bold text-lime-300 focus:border-lime-400 focus:outline-none"
                  placeholder="1050.00"
                />
                <span className="absolute right-3 top-2 font-mono text-xs font-bold text-lime-400">
                  ₹
                </span>
              </div>
            </div>
          </div>

          <p className="mt-2 text-[10px] text-zinc-400">
            💡 Type in any two fields (e.g. amount ₹1000 and price ₹105), the 3rd
            field calculates automatically.
          </p>
        </div>

        {/* 3. FUEL FILL TYPE: FULL TANK VS PARTIAL / RESERVE */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-300">
            Fuel Fill Type *
          </label>
          <div className="mt-2 grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => handleFillTypeChange('Full Tank')}
              className={`flex flex-col items-start rounded-xl border p-3 text-left transition-all ${
                formData.fuelFillType === 'Full Tank'
                  ? 'border-lime-400 bg-lime-400/10 text-white shadow-[0_0_14px_rgba(163,230,53,0.15)]'
                  : 'border-white/10 bg-[#12161c] text-zinc-400 hover:border-white/20 hover:text-zinc-200'
              }`}
            >
              <div className="flex items-center gap-2">
                <span
                  className={`h-2.5 w-2.5 rounded-full ${
                    formData.fuelFillType === 'Full Tank'
                      ? 'bg-lime-400 shadow-[0_0_6px_#a3e635]'
                      : 'bg-zinc-600'
                  }`}
                />
                <span className="text-xs font-bold text-white">Full Tank</span>
              </div>
              <span className="mt-1 text-[11px] text-zinc-400">
                Tank filled to auto-cut off (100%)
              </span>
            </button>

            <button
              type="button"
              onClick={() => handleFillTypeChange('Partial / Reserve')}
              className={`flex flex-col items-start rounded-xl border p-3 text-left transition-all ${
                formData.fuelFillType === 'Partial / Reserve'
                  ? 'border-amber-400 bg-amber-400/10 text-white shadow-[0_0_14px_rgba(251,191,36,0.15)]'
                  : 'border-white/10 bg-[#12161c] text-zinc-400 hover:border-white/20 hover:text-zinc-200'
              }`}
            >
              <div className="flex items-center gap-2">
                <span
                  className={`h-2.5 w-2.5 rounded-full ${
                    formData.fuelFillType === 'Partial / Reserve'
                      ? 'bg-amber-400 shadow-[0_0_6px_#fbbf24]'
                      : 'bg-zinc-600'
                  }`}
                />
                <span className="text-xs font-bold text-white">
                  Partial / Reserve
                </span>
              </div>
              <span className="mt-1 text-[11px] text-zinc-400">
                Any amount filled, but not full tank
              </span>
            </button>
          </div>
        </div>

        {/* 4. STATION NAME & QUICK PRESETS */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-300">
            Fuel Station Name
          </label>
          <input
            type="text"
            value={formData.stationName}
            onChange={(e) =>
              setFormData({ ...formData, stationName: e.target.value })
            }
            placeholder="e.g. IndianOil, HP Auto Care, Bharat Petroleum"
            className="mt-1.5 w-full rounded-xl border border-white/10 bg-[#12161c] px-3.5 py-2 text-sm text-white focus:border-lime-400 focus:outline-none"
          />
          {/* Quick chips */}
          <div className="mt-2 flex flex-wrap gap-1.5">
            {STATION_PRESETS.map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() =>
                  setFormData((prev) => ({ ...prev, stationName: preset }))
                }
                className={`rounded-lg px-2 py-0.5 text-[11px] font-medium transition-colors ${
                  formData.stationName === preset
                    ? 'border border-lime-400/40 bg-lime-400/15 text-lime-300 font-bold'
                    : 'border border-white/8 bg-white/4 text-zinc-400 hover:bg-white/8 hover:text-zinc-200'
                }`}
              >
                {preset}
              </button>
            ))}
          </div>
        </div>

        {/* 5. LOCATION OF FUEL FILLED */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-300">
            Location of Refill
          </label>
          <div className="relative mt-1.5">
            <input
              type="text"
              value={formData.location}
              onChange={(e) =>
                setFormData({ ...formData, location: e.target.value })
              }
              placeholder="e.g. Senapati Bapat Rd, Baner, Highway NH4"
              className="w-full rounded-xl border border-white/10 bg-[#12161c] px-3.5 py-2 pl-9 text-sm text-white focus:border-lime-400 focus:outline-none"
            />
            <MapPin className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-zinc-500" />
          </div>
        </div>

        {/* 6. NOTES (OPTIONAL) */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-300">
            Notes / Remarks (Optional)
          </label>
          <input
            type="text"
            value={formData.notes}
            onChange={(e) =>
              setFormData({ ...formData, notes: e.target.value })
            }
            placeholder="e.g. Premium fuel, highway trip fill, tire pressure checked"
            className="mt-1.5 w-full rounded-xl border border-white/10 bg-[#12161c] px-3.5 py-2 text-sm text-white focus:border-lime-400 focus:outline-none"
          />
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/8">
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="rounded-xl border border-white/10 px-4 py-2 text-xs font-semibold text-zinc-300 hover:bg-white/5 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-1.5 rounded-xl bg-lime-400 px-5 py-2 text-xs font-extrabold text-zinc-950 shadow-[0_0_16px_rgba(163,230,53,0.3)] hover:bg-lime-300 transition-colors disabled:opacity-50"
          >
            <Check className="h-4 w-4 stroke-[2.5]" />
            {saving
              ? 'Saving...'
              : isEditing
                ? 'Update Fuel Entry'
                : 'Add Fuel Entry'}
          </button>
        </div>
      </form>
    </div>
  )
}

export default function FuelRefillModal({
  isOpen,
  onClose,
  onSubmit,
  vehicle,
  refillToEdit = null,
}) {
  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <FuelRefillDialogContent
        key={`${refillToEdit?.id || 'new'}-${isOpen}`}
        onClose={onClose}
        onSubmit={onSubmit}
        vehicle={vehicle}
        refillToEdit={refillToEdit}
      />
    </div>
  )
}
