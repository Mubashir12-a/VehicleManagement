import { Calculator, Check, Fuel, MapPin, Plus, RotateCcw } from 'lucide-react'
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

function getInitialState(vehicle, editingRefill) {
  if (editingRefill) {
    return {
      odometerKm: editingRefill.odometerKm,
      liters: String(editingRefill.liters),
      pricePerLiter: String(editingRefill.pricePerLiter),
      amountSpent: String(editingRefill.amountSpent),
      fuelFillType: editingRefill.fuelFillType || 'Full Tank',
      fuelLevelAfter: editingRefill.fuelLevelAfter ?? 100,
      refillDate: editingRefill.refillDate || getTodayString(),
      stationName: editingRefill.stationName || 'IndianOil',
      location: editingRefill.location || '',
      notes: editingRefill.notes || '',
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

function FuelEntrySidebarForm({
  vehicle,
  editingRefill,
  onCancelEdit,
  onSubmit,
}) {
  const isEditing = Boolean(editingRefill)
  const [formData, setFormData] = useState(() =>
    getInitialState(vehicle, editingRefill),
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
      setError('Please enter a valid odometer reading.')
      return
    }
    if (isNaN(litersNum) || litersNum <= 0) {
      setError('Please enter a valid liters quantity (> 0).')
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
      if (!isEditing) {
        setFormData(getInitialState(vehicle, null))
      }
    } catch (err) {
      setError(err?.message || 'Failed to save fuel refill.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div
      className={`rounded-3xl border p-5 shadow-2xl transition-all ${
        isEditing
          ? 'border-amber-400/40 bg-[#101317] ring-1 ring-amber-400/30'
          : 'border-lime-400/30 bg-[#0d1014] shadow-[0_0_24px_rgba(163,230,53,0.06)]'
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/8 pb-3.5">
        <div className="flex items-center gap-2.5">
          <div
            className={`flex h-9 w-9 items-center justify-center rounded-xl text-zinc-950 font-bold ${
              isEditing ? 'bg-amber-400' : 'bg-lime-400'
            }`}
          >
            <Fuel className="h-5 w-5 stroke-[2.4]" />
          </div>
          <div>
            <h3 className="text-sm font-extrabold uppercase tracking-wider text-white">
              {isEditing ? 'Edit Fuel Entry' : 'Log Fuel Refill'}
            </h3>
            <p className="text-[11px] text-zinc-400">
              {isEditing
                ? `ID: ${String(editingRefill?.id || '').slice(0, 8)} · ${editingRefill?.refillDate || ''}`
                : '3-way auto calculation · Synced with Odo'}
            </p>
          </div>
        </div>

        {isEditing && (
          <button
            type="button"
            onClick={onCancelEdit}
            className="inline-flex items-center gap-1 rounded-lg border border-white/10 bg-white/5 px-2.5 py-1 text-[11px] font-semibold text-zinc-300 hover:bg-white/10"
          >
            <RotateCcw className="h-3 w-3" />
            <span>New</span>
          </button>
        )}
      </div>

      {error && (
        <div className="mt-3 rounded-xl border border-rose-500/30 bg-rose-500/10 p-2.5 text-xs text-rose-300">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="mt-4 space-y-3.5">
        {/* Odometer & Date */}
        <div className="grid grid-cols-2 gap-2.5">
          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
              Odometer (KM) *
            </label>
            <div className="relative mt-1">
              <input
                type="number"
                required
                min="0"
                step="1"
                value={formData.odometerKm === 0 || !formData.odometerKm ? '' : formData.odometerKm}
                placeholder="0"
                onChange={(e) =>
                  setFormData({ ...formData, odometerKm: e.target.value })
                }
                className="w-full rounded-xl border border-white/10 bg-[#12161c] px-3 py-2 font-mono text-xs text-white placeholder-zinc-500 focus:border-lime-400 focus:outline-none"
              />
              <span className="pointer-events-none absolute right-2.5 top-2 font-mono text-[10px] font-bold text-zinc-500">
                KM
              </span>
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
              Refill Date *
            </label>
            <input
              type="date"
              required
              value={formData.refillDate}
              onChange={(e) =>
                setFormData({ ...formData, refillDate: e.target.value })
              }
              className="mt-1 w-full rounded-xl border border-white/10 bg-[#12161c] px-2.5 py-2 text-xs text-white focus:border-lime-400 focus:outline-none"
            />
          </div>
        </div>

        {/* 3-Way Reactive Calculator */}
        <div className="rounded-2xl border border-lime-400/20 bg-lime-400/5 p-3">
          <div className="flex items-center justify-between text-[11px] font-bold text-lime-400">
            <span className="flex items-center gap-1 uppercase tracking-wider">
              <Calculator className="h-3 w-3" />
              Reactive Calculator
            </span>
            <span className="text-[10px] font-mono text-zinc-400">
              Liters × ₹/L = ₹ Amount
            </span>
          </div>

          <div className="mt-2.5 grid grid-cols-3 gap-2">
            <div>
              <label className="block text-[10px] font-semibold text-zinc-300">
                Liters *
              </label>
              <input
                type="number"
                step="0.01"
                min="0.01"
                required
                value={formData.liters}
                onChange={handleLitersChange}
                placeholder="10.00"
                className="mt-1 w-full rounded-lg border border-white/10 bg-[#12161c] px-2.5 py-1.5 font-mono text-xs text-white focus:border-lime-400 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[10px] font-semibold text-zinc-300">
                ₹ / Liter *
              </label>
              <input
                type="number"
                step="0.01"
                min="0.01"
                required
                value={formData.pricePerLiter}
                onChange={handlePriceChange}
                placeholder="105.00"
                className="mt-1 w-full rounded-lg border border-white/10 bg-[#12161c] px-2.5 py-1.5 font-mono text-xs text-white focus:border-lime-400 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[10px] font-semibold text-zinc-300">
                Amount (₹) *
              </label>
              <input
                type="number"
                step="0.01"
                min="1"
                required
                value={formData.amountSpent}
                onChange={handleAmountChange}
                placeholder="1050.00"
                className="mt-1 w-full rounded-lg border border-lime-400/40 bg-[#12161c] px-2.5 py-1.5 font-mono text-xs font-bold text-lime-300 focus:border-lime-400 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Fill Type: Full Tank vs Partial / Reserve */}
        <div>
          <label className="block text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
            Fill Type *
          </label>
          <div className="mt-1.5 grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleFillTypeChange('Full Tank')}
              className={`rounded-xl border p-2 text-left transition-all ${
                formData.fuelFillType === 'Full Tank'
                  ? 'border-lime-400 bg-lime-400/10 text-white'
                  : 'border-white/10 bg-[#12161c] text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <div className="flex items-center gap-1.5">
                <span
                  className={`h-2 w-2 rounded-full ${
                    formData.fuelFillType === 'Full Tank'
                      ? 'bg-lime-400'
                      : 'bg-zinc-600'
                  }`}
                />
                <span className="text-xs font-bold text-white">Full Tank</span>
              </div>
              <span className="block text-[10px] text-zinc-400 mt-0.5">
                Filled 100%
              </span>
            </button>

            <button
              type="button"
              onClick={() => handleFillTypeChange('Partial / Reserve')}
              className={`rounded-xl border p-2 text-left transition-all ${
                formData.fuelFillType === 'Partial / Reserve'
                  ? 'border-amber-400 bg-amber-400/10 text-white'
                  : 'border-white/10 bg-[#12161c] text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <div className="flex items-center gap-1.5">
                <span
                  className={`h-2 w-2 rounded-full ${
                    formData.fuelFillType === 'Partial / Reserve'
                      ? 'bg-amber-400'
                      : 'bg-zinc-600'
                  }`}
                />
                <span className="text-xs font-bold text-white">Partial</span>
              </div>
              <span className="block text-[10px] text-zinc-400 mt-0.5">
                Not full tank
              </span>
            </button>
          </div>
        </div>

        {/* Station Name + Presets */}
        <div>
          <label className="block text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
            Station Name
          </label>
          <input
            type="text"
            value={formData.stationName}
            onChange={(e) =>
              setFormData({ ...formData, stationName: e.target.value })
            }
            placeholder="e.g. IndianOil, Bharat Petroleum"
            className="mt-1 w-full rounded-xl border border-white/10 bg-[#12161c] px-3 py-1.5 text-xs text-white focus:border-lime-400 focus:outline-none"
          />
          <div className="mt-1.5 flex flex-wrap gap-1">
            {STATION_PRESETS.map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() =>
                  setFormData((prev) => ({ ...prev, stationName: preset }))
                }
                className={`rounded-md px-2 py-0.5 text-[10px] font-medium transition-colors ${
                  formData.stationName === preset
                    ? 'border border-lime-400/40 bg-lime-400/15 text-lime-300 font-bold'
                    : 'border border-white/8 bg-white/4 text-zinc-400 hover:bg-white/8'
                }`}
              >
                {preset}
              </button>
            ))}
          </div>
        </div>

        {/* Location */}
        <div>
          <label className="block text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
            Location
          </label>
          <div className="relative mt-1">
            <input
              type="text"
              value={formData.location}
              onChange={(e) =>
                setFormData({ ...formData, location: e.target.value })
              }
              placeholder="e.g. Senapati Bapat Rd, Baner"
              className="w-full rounded-xl border border-white/10 bg-[#12161c] px-3 py-1.5 pl-8 text-xs text-white focus:border-lime-400 focus:outline-none"
            />
            <MapPin className="pointer-events-none absolute left-2.5 top-2 h-3.5 w-3.5 text-zinc-500" />
          </div>
        </div>

        {/* Notes */}
        <div>
          <label className="block text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
            Notes (Optional)
          </label>
          <input
            type="text"
            value={formData.notes}
            onChange={(e) =>
              setFormData({ ...formData, notes: e.target.value })
            }
            placeholder="e.g. Premium fuel, highway refill"
            className="mt-1 w-full rounded-xl border border-white/10 bg-[#12161c] px-3 py-1.5 text-xs text-white focus:border-lime-400 focus:outline-none"
          />
        </div>

        {/* Action Button */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={saving}
            className={`w-full inline-flex items-center justify-center gap-1.5 rounded-xl py-2.5 text-xs font-extrabold text-zinc-950 transition-colors disabled:opacity-50 ${
              isEditing
                ? 'bg-amber-400 hover:bg-amber-300 shadow-[0_0_16px_rgba(251,191,36,0.3)]'
                : 'bg-lime-400 hover:bg-lime-300 shadow-[0_0_16px_rgba(163,230,53,0.3)]'
            }`}
          >
            {isEditing ? (
              <>
                <Check className="h-4 w-4 stroke-[2.5]" />
                {saving ? 'Updating...' : 'Update Fuel Entry'}
              </>
            ) : (
              <>
                <Plus className="h-4 w-4 stroke-[2.5]" />
                {saving ? 'Saving...' : 'Add Fuel Entry'}
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}

export default function FuelEntrySidebarCard({
  vehicle,
  editingRefill = null,
  onCancelEdit,
  onSubmit,
}) {
  return (
    <FuelEntrySidebarForm
      key={`${editingRefill?.id || 'new'}-${vehicle?.id || 'vh'}`}
      vehicle={vehicle}
      editingRefill={editingRefill}
      onCancelEdit={onCancelEdit}
      onSubmit={onSubmit}
    />
  )
}
