import {
  Check,
  CreditCard,
  Fuel,
  Gauge,
  Heart,
  Lock,
  Pencil,
  Wrench,
  X,
} from 'lucide-react'
import { useState } from 'react'
import { useAnimatedNumber } from '../../hooks/useAnimatedNumber'
import {
  TWO_WHEELER_SUBTYPES,
  VEHICLE_CATEGORIES,
  resolveVehicleVisual,
} from '../../utils/vehicleIllustration'
import VehicleCrayonIllustration from '../illustrations/VehicleCrayonIllustration'

const STATUS_OPTIONS = ['Active', 'Maintenance', 'Idle', 'Out of Service']

export default function VehicleHeroCard({ vehicle, summary, onSave }) {
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState(() => ({
    ...vehicle,
    topSpeed: vehicle.topSpeed ?? vehicle.speed ?? 150,
    speed: vehicle.topSpeed ?? vehicle.speed ?? 150,
  }))
  const [saving, setSaving] = useState(false)
  const [feedback, setFeedback] = useState('')

  const activeData = isEditing ? formData : vehicle
  const visual = resolveVehicleVisual({
    category: activeData.category,
    subType: activeData.subType,
    engineCc: activeData.engineCc,
    model: activeData.model,
  })

  const startEditing = () => {
    setFormData({
      ...vehicle,
      topSpeed: vehicle.topSpeed ?? vehicle.speed ?? 150,
      speed: vehicle.topSpeed ?? vehicle.speed ?? 150,
    })
    setFeedback('')
    setIsEditing(true)
  }

  const handleCategoryChange = (nextCategory) => {
    setFormData((prev) => ({
      ...prev,
      category: nextCategory,
      subType: nextCategory === 'Four Wheeler' ? 'Car' : 'Scooter',
      engineCc:
        nextCategory === 'Four Wheeler'
          ? prev.engineCc < 600
            ? 998
            : prev.engineCc
          : prev.engineCc > 600
            ? 110
            : prev.engineCc,
    }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setSaving(true)
    setFeedback('')
    try {
      const result = await onSave(formData)
      setIsEditing(false)
      if (result?.warning) {
        setFeedback(result.warning)
      } else if (result?.savedToSupabase) {
        setFeedback('Vehicle updated in Supabase.')
      }
    } catch (err) {
      setFeedback(err.message || 'Could not save vehicle changes.')
    } finally {
      setSaving(false)
    }
  }

  const totalSpend = Number(summary?.totalSpendTillNow || 0)
  const animatedMileage = useAnimatedNumber(vehicle.mileage, 750)
  const animatedSpend = useAnimatedNumber(totalSpend, 850)

  return (
    <section className="relative overflow-hidden rounded-3xl border border-white/10 bg-[#0c0f12] shadow-[0_24px_60px_rgba(0,0,0,0.65)]">
      {/* Subtle diagonal tech accent lines & dot mesh (matching reference) */}
      <div className="carbon-dots pointer-events-none absolute inset-y-0 left-0 w-1/2 opacity-40" />
      <svg
        viewBox="0 0 900 420"
        preserveAspectRatio="none"
        className="pointer-events-none absolute inset-0 h-full w-full"
        aria-hidden="true"
      >
        <line
          x1="280"
          y1="420"
          x2="650"
          y2="0"
          stroke="#a3e635"
          strokeOpacity="0.14"
          strokeWidth="1"
        />
        <line
          x1="0"
          y1="250"
          x2="420"
          y2="420"
          stroke="#ffffff"
          strokeOpacity="0.06"
          strokeWidth="1"
        />
      </svg>

      {/* Top Accent Bars */}
      <div className="pointer-events-none absolute top-4 left-1/2 hidden -translate-x-1/2 items-center gap-1.5 sm:flex">
        <span className="h-1.5 w-3 -skew-x-24 bg-lime-400/35" />
        <span className="h-1.5 w-3 -skew-x-24 bg-lime-400/25" />
        <span className="h-1.5 w-3 -skew-x-24 bg-lime-400/15" />
      </div>

      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12">
        {/* Left: Bold Model, Brand, Status Pill & Reference 2x2 + Mileage Telemetry Grid */}
        <div className="flex flex-col justify-between p-6 sm:p-8 lg:col-span-6">
          {!isEditing ? (
            <>
              <div>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h2 className="text-4xl font-black tracking-tight text-white sm:text-5xl">
                      {vehicle.model}
                    </h2>
                    <p className="mt-2 text-sm font-bold uppercase tracking-[0.14em] text-zinc-400">
                      {vehicle.brand}
                    </p>
                    <p className="mt-0.5 text-sm font-semibold uppercase tracking-[0.12em] text-zinc-500">
                      • {vehicle.name}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={startEditing}
                    className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/5 px-3.5 py-1.5 text-xs font-semibold text-zinc-200 transition-colors hover:border-lime-400/50 hover:bg-lime-400/10 hover:text-lime-300"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                    Edit
                  </button>
                </div>

                {/* Status Pill (matches reference pill aesthetic) */}
                <div className="mt-5 flex flex-wrap items-center gap-2.5">
                  <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3.5 py-1.5 text-xs font-semibold uppercase tracking-wider text-zinc-300">
                    <span
                      className={`h-2 w-2 rounded-full ${
                        vehicle.status === 'Active'
                          ? 'bg-lime-400 shadow-[0_0_8px_#a3e635]'
                          : vehicle.status === 'Maintenance'
                            ? 'bg-amber-400'
                            : 'bg-zinc-400'
                      }`}
                    />
                    {vehicle.status} · {Number(vehicle.engineCc).toLocaleString()} CC
                  </span>

                  <span className="rounded-full border border-lime-400/20 bg-lime-400/10 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-lime-300">
                    {vehicle.category}
                    {vehicle.category === 'Two Wheeler'
                      ? ` · ${vehicle.subType}`
                      : ''}
                  </span>

                  <span className="rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-zinc-300">
                    {vehicle.topSpeed ?? vehicle.speed ?? 150} KM/H
                  </span>
                </div>
              </div>

              {/* Reference Metrics Block: Odometer, Total Spend, Health (later), Services (later), Mileage (later) */}
              <div className="mt-8 grid grid-cols-2 gap-x-8 gap-y-6 sm:grid-cols-3">
                {/* Odometer */}
                <div>
                  <Gauge className="h-5 w-5 text-lime-400" />
                  <p className="mt-2.5 text-2xl font-extrabold tracking-tight text-white tabular-nums">
                    {animatedMileage.toLocaleString('en-IN')}{' '}
                    <span className="text-base font-medium text-zinc-400">km</span>
                  </p>
                  <p className="mt-0.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-zinc-500">
                    Odometer
                  </p>
                </div>

                {/* Total Spend Till Now */}
                <div>
                  <CreditCard className="h-5 w-5 text-lime-400" />
                  <p className="mt-2.5 text-2xl font-extrabold tracking-tight text-white tabular-nums">
                    ₹{Math.round(animatedSpend).toLocaleString('en-IN')}
                  </p>
                  <p className="mt-0.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-zinc-500">
                    Total Spend
                  </p>
                </div>

                {/* Health (Reserved for later) */}
                <div>
                  <Heart className="h-5 w-5 text-lime-400" />
                  <p className="mt-2.5 text-2xl font-extrabold tracking-tight text-zinc-300">
                    —
                  </p>
                  <p className="mt-0.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-zinc-500">
                    Health · Later
                  </p>
                </div>

                {/* Services Done (Reserved for later) */}
                <div>
                  <Wrench className="h-5 w-5 text-lime-400" />
                  <p className="mt-2.5 text-2xl font-extrabold tracking-tight text-zinc-300">
                    —
                  </p>
                  <p className="mt-0.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-zinc-500">
                    Services · Later
                  </p>
                </div>

                {/* Mileage (Reserved for later) */}
                <div>
                  <Fuel className="h-5 w-5 text-lime-400" />
                  <p className="mt-2.5 text-2xl font-extrabold tracking-tight text-zinc-300">
                    —
                  </p>
                  <p className="mt-0.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-zinc-500">
                    Mileage · Later
                  </p>
                </div>

                {/* Registration Plate */}
                <div>
                  <span className="inline-block rounded border border-lime-400/30 bg-lime-400/10 px-1.5 py-0.5 font-mono text-[10px] font-bold text-lime-300">
                    REG
                  </span>
                  <p className="mt-2.5 font-mono text-base font-bold tracking-tight text-zinc-200">
                    {vehicle.plate}
                  </p>
                  <p className="mt-0.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-zinc-500">
                    Plate No.
                  </p>
                </div>
              </div>

              {feedback && (
                <p className="mt-4 rounded-xl border border-lime-400/20 bg-lime-400/10 px-3.5 py-2 text-xs font-medium text-lime-300">
                  {feedback}
                </p>
              )}
            </>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-white">
                    Edit Vehicle Profile
                  </h3>
                  <p className="text-xs text-zinc-400">
                    Change category, style, or CC to see the built-in visual update live.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="rounded-lg p-1.5 text-zinc-400 hover:bg-white/10 hover:text-white"
                  aria-label="Cancel editing"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
                    Model *
                  </label>
                  <input
                    required
                    value={formData.model}
                    onChange={(e) =>
                      setFormData({ ...formData, model: e.target.value })
                    }
                    placeholder="NS400z"
                    className="mt-1 w-full rounded-lg border border-white/10 bg-[#151a20] px-3 py-2 text-sm text-white placeholder:text-zinc-500 focus:border-lime-400 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
                    Brand *
                  </label>
                  <input
                    required
                    value={formData.brand}
                    onChange={(e) =>
                      setFormData({ ...formData, brand: e.target.value })
                    }
                    placeholder="Bajaj Auto"
                    className="mt-1 w-full rounded-lg border border-white/10 bg-[#151a20] px-3 py-2 text-sm text-white placeholder:text-zinc-500 focus:border-lime-400 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
                    Name / Series *
                  </label>
                  <input
                    required
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    placeholder="Pulsar"
                    className="mt-1 w-full rounded-lg border border-white/10 bg-[#151a20] px-3 py-2 text-sm text-white placeholder:text-zinc-500 focus:border-lime-400 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-4">
                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
                    Category
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => handleCategoryChange(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-white/10 bg-[#151a20] px-3 py-2 text-sm text-white focus:border-lime-400 focus:outline-none"
                  >
                    {VEHICLE_CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                {formData.category === 'Two Wheeler' ? (
                  <div>
                    <label className="block text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
                      Style
                    </label>
                    <select
                      value={formData.subType}
                      onChange={(e) =>
                        setFormData({ ...formData, subType: e.target.value })
                      }
                      className="mt-1 w-full rounded-lg border border-white/10 bg-[#151a20] px-3 py-2 text-sm text-white focus:border-lime-400 focus:outline-none"
                    >
                      {TWO_WHEELER_SUBTYPES.map((st) => (
                        <option key={st} value={st}>
                          {st}
                        </option>
                      ))}
                    </select>
                  </div>
                ) : (
                  <div>
                    <label className="block text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
                      Auto Visual
                    </label>
                    <div className="mt-1 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm font-semibold text-lime-300">
                      {visual.label}
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
                    Engine (cc) *
                  </label>
                  <input
                    type="number"
                    min={50}
                    max={8000}
                    required
                    value={formData.engineCc}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        engineCc: Number(e.target.value) || 0,
                      })
                    }
                    className="mt-1 w-full rounded-lg border border-white/10 bg-[#151a20] px-3 py-2 text-sm text-white focus:border-lime-400 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
                    Speed (km/h) *
                  </label>
                  <input
                    type="number"
                    min={0}
                    max={500}
                    required
                    value={formData.topSpeed ?? formData.speed ?? 150}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        topSpeed: Number(e.target.value) || 0,
                        speed: Number(e.target.value) || 0,
                      })
                    }
                    placeholder="150"
                    className="mt-1 w-full rounded-lg border border-lime-400/30 bg-[#151a20] px-3 py-2 text-sm font-bold text-lime-300 focus:border-lime-400 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
                    Plate
                  </label>
                  <input
                    value={formData.plate}
                    onChange={(e) =>
                      setFormData({ ...formData, plate: e.target.value })
                    }
                    className="mt-1 w-full rounded-lg border border-white/10 bg-[#151a20] px-3 py-2 text-sm text-white focus:border-lime-400 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
                    Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) =>
                      setFormData({ ...formData, status: e.target.value })
                    }
                    className="mt-1 w-full rounded-lg border border-white/10 bg-[#151a20] px-3 py-2 text-sm text-white focus:border-lime-400 focus:outline-none"
                  >
                    {STATUS_OPTIONS.map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <div className="flex items-center justify-between">
                    <label className="block text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
                      Odometer
                    </label>
                    <span className="flex items-center gap-1 text-[10px] font-bold text-lime-400">
                      <Lock className="h-2.5 w-2.5" />
                      Auto
                    </span>
                  </div>
                  <div className="mt-1 flex items-center justify-between rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm font-mono font-bold text-zinc-200">
                    <span>{Number(vehicle.mileage || 0).toLocaleString('en-IN')}</span>
                    <span className="text-[10px] text-zinc-500 font-sans">KM</span>
                  </div>
                  <p className="mt-0.5 text-[9px] text-zinc-500">
                    Auto-synced with fuel refills
                  </p>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
                    Fuel (%)
                  </label>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={formData.fuelLevel}
                    onChange={(e) =>
                      setFormData({ ...formData, fuelLevel: e.target.value })
                    }
                    className="mt-1 w-full rounded-lg border border-white/10 bg-[#151a20] px-3 py-2 text-sm text-white focus:border-lime-400 focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="rounded-lg border border-white/15 px-4 py-2 text-xs font-semibold text-zinc-300 hover:bg-white/5"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-lime-400 px-4 py-2 text-xs font-bold text-zinc-950 hover:bg-lime-300 disabled:opacity-50"
                >
                  <Check className="h-3.5 w-3.5" />
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Right: Concentric Lime Halo + Transparent 3D Illustration */}
        <div className="relative flex flex-col items-center justify-center p-4 sm:p-6 lg:col-span-6">
          <VehicleCrayonIllustration
            model={activeData.model}
            category={activeData.category}
            subType={activeData.subType}
            engineCc={activeData.engineCc}
            framed={false}
            className="aspect-16/10 w-full max-w-lg"
          />

          <div className="mt-2 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wider text-zinc-500">
            <span className="text-lime-400">{visual.label}</span>
            <span>·</span>
            <span>{visual.rule}</span>
          </div>
        </div>
      </div>
    </section>
  )
}
