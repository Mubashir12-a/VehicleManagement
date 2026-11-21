import {
  Calendar,
  Check,
  CreditCard,
  Fuel,
  Gauge,
  Heart,
  Pencil,
  Wrench,
  X,
  Zap,
} from 'lucide-react'
import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAnimatedNumber } from '../../hooks/useAnimatedNumber'
import { computeLatestFuelMileage } from '../../services/fleetService'
import {
  TWO_WHEELER_SUBTYPES,
  VEHICLE_CATEGORIES,
  resolveVehicleVisual,
} from '../../utils/vehicleIllustration'
import VehicleCrayonIllustration from '../illustrations/VehicleCrayonIllustration'

export default function VehicleHeroCard({
  vehicle,
  summary,
  maintenanceItems = [],
  serviceLogs = [],
  serviceReminders = [],
  vehicleRepairs = [],
  fuelRefills = [],
  onSave,
}) {
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState(() => ({
    ...vehicle,
    purchaseDate: vehicle.purchaseDate || '',
    exShowroomPrice: vehicle.exShowroomPrice ?? 0,
    fuelType: vehicle.fuelType || 'Petrol (E10)',
    topSpeed: vehicle.topSpeed ?? vehicle.speed ?? 0,
    speed: vehicle.topSpeed ?? vehicle.speed ?? 0,
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

  // Dynamic component health calculation (e.g. 18/18, 17/18 if 1 is due)
  const currentOdo = Number(vehicle?.mileage) || 0
  const items = maintenanceItems.length > 0 ? maintenanceItems : []
  const totalItems = items.length || 18

  // Completed services calculation (periodic services marked as done + component logs + repairs)
  const completedReminders = (serviceReminders || []).filter(
    (r) => r.status === 'Completed',
  )
  const totalServicesDone =
    completedReminders.length +
    (serviceLogs || []).length +
    (vehicleRepairs || []).length

  let dueCount = 0
  items.forEach((item) => {
    const odoNum = currentOdo
    const itemLastOdo = Number(item.lastServiceOdo) || 0
    const effectiveLastOdo = itemLastOdo > odoNum ? 0 : itemLastOdo
    const rawPassedKm = Math.max(0, odoNum - effectiveLastOdo)
    const interval = Math.max(1, Number(item.intervalKm) || 1000)
    const remainingKm = interval - rawPassedKm
    if (remainingKm <= 0) {
      dueCount += 1
    }
  })

  const healthyCount = Math.max(0, totalItems - dueCount)
  const latestMileage = useMemo(
    () => computeLatestFuelMileage(fuelRefills),
    [fuelRefills],
  )

  const startEditing = () => {
    setFormData({
      ...vehicle,
      purchaseDate: vehicle.purchaseDate || '',
      exShowroomPrice: vehicle.exShowroomPrice ?? 0,
      fuelType: vehicle.fuelType || 'Petrol (E10)',
      topSpeed: vehicle.topSpeed ?? vehicle.speed ?? 0,
      speed: vehicle.topSpeed ?? vehicle.speed ?? 0,
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
        setFeedback('Vehicle profile updated successfully.')
      }
    } catch (err) {
      setFeedback(err.message || 'Could not save vehicle changes.')
    } finally {
      setSaving(false)
    }
  }

  const totalSpend = Number(summary?.totalSpendTillNow || 0)
  const animatedMileage = useAnimatedNumber(vehicle.mileage, 850, 0)
  const animatedSpend = useAnimatedNumber(totalSpend, 850, 0)
  const targetSpeed = Number(vehicle?.topSpeed ?? vehicle?.speed ?? 0)
  const animatedSpeed = useAnimatedNumber(targetSpeed, 850, 0)

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
                    <span className="h-2 w-2 rounded-full bg-lime-400 shadow-[0_0_8px_#a3e635]" />
                    {vehicle.fuelType || 'Petrol (E10)'} · {Number(vehicle.engineCc).toLocaleString()} CC
                  </span>

                  <span className="rounded-full border border-lime-400/20 bg-lime-400/10 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-lime-300">
                    {vehicle.category}
                    {vehicle.category === 'Two Wheeler'
                      ? ` · ${vehicle.subType}`
                      : ''}
                  </span>

                  <span className="rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-zinc-300">
                    {animatedSpeed} KM/H
                  </span>

                  {latestMileage > 0 && (
                    <Link
                      to="/fuel-history"
                      className="inline-flex items-center gap-1.5 rounded-full border border-lime-400/30 bg-lime-400/10 px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-lime-300 shadow-[0_0_12px_rgba(163,230,53,0.15)] transition-colors hover:bg-lime-400/20"
                      title="Latest computed fuel mileage"
                    >
                      <Zap className="h-3 w-3 text-lime-400" />
                      Mileage: {latestMileage} KM/L
                    </Link>
                  )}

                  {vehicle.purchaseDate && (
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-lime-400/25 bg-lime-400/10 px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-lime-300 shadow-[0_0_12px_rgba(163,230,53,0.12)]">
                      <Calendar className="h-3 w-3 text-lime-400" />
                      Purchased: {vehicle.purchaseDate}
                    </span>
                  )}

                  {Number(vehicle.exShowroomPrice) > 0 && (
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-zinc-300">
                      Ex-Showroom: ₹{Number(vehicle.exShowroomPrice).toLocaleString('en-IN')}
                    </span>
                  )}
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

                {/* Total Spend Till Now (Every single rupee spent everywhere, excluding ex-showroom) */}
                <div>
                  <CreditCard className="h-5 w-5 text-lime-400" />
                  <p className="mt-2.5 text-2xl font-extrabold tracking-tight text-white tabular-nums">
                    ₹{Math.round(animatedSpend).toLocaleString('en-IN')}
                  </p>
                  <p className="mt-0.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-zinc-500">
                    Total Spend
                  </p>
                  {Number(vehicle?.exShowroomPrice) > 0 && (
                    <span className="mt-0.5 block text-[10px] font-medium text-zinc-500">
                      Excl. Ex-Showroom (₹{Number(vehicle.exShowroomPrice).toLocaleString('en-IN')})
                    </span>
                  )}
                </div>

                {/* Latest Fuel Mileage */}
                <Link
                  to="/fuel-history"
                  className="group/mileage block cursor-pointer transition hover:opacity-90"
                  title="View Fuel History & Mileage Analytics"
                >
                  <Zap className="h-5 w-5 text-lime-400 transition-transform group-hover/mileage:scale-110" />
                  <p className="mt-2.5 text-2xl font-extrabold tracking-tight text-white tabular-nums">
                    {latestMileage > 0 ? latestMileage : '—'}{' '}
                    {latestMileage > 0 && (
                      <span className="text-base font-medium text-zinc-400">km/L</span>
                    )}
                  </p>
                  <p className="mt-0.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-zinc-500 transition-colors group-hover/mileage:text-lime-400">
                    Fuel Mileage
                  </p>
                </Link>

                {/* Health Option (reflects healthy / total, e.g. 18/18, 17/18) */}
                <div>
                  <Heart
                    className={`h-5 w-5 ${
                      dueCount > 0 ? 'text-amber-400' : 'text-lime-400'
                    }`}
                  />
                  <p className="mt-2.5 text-2xl font-extrabold tracking-tight text-white tabular-nums">
                    <span
                      className={
                        dueCount > 0 ? 'text-amber-300' : 'text-lime-400'
                      }
                    >
                      {healthyCount}
                    </span>
                    <span className="font-mono text-base font-normal text-zinc-500">
                      /{totalItems}
                    </span>
                  </p>
                  <p className="mt-0.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-zinc-500">
                    Health · {dueCount > 0 ? `${dueCount} Due` : 'All Good'}
                  </p>
                </div>

                {/* Services Done */}
                <Link
                  to="/important-dates?tab=history"
                  className="group/svc block transition hover:opacity-90 cursor-pointer"
                  title="View Completed Services History"
                >
                  <Wrench className="h-5 w-5 text-lime-400 group-hover/svc:scale-110 transition-transform" />
                  <p className="mt-2.5 text-2xl font-extrabold tracking-tight text-white tabular-nums">
                    {totalServicesDone}{' '}
                    <span className="text-base font-medium text-zinc-400">
                      {totalServicesDone === 1 ? 'log' : 'logs'}
                    </span>
                  </p>
                  <p className="mt-0.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-zinc-500 group-hover/svc:text-lime-400 transition-colors">
                    Services Done
                  </p>
                </Link>

                {/* Fuel Level */}
                <div>
                  <Fuel className="h-5 w-5 text-lime-400" />
                  <p className="mt-2.5 text-2xl font-extrabold tracking-tight text-white tabular-nums">
                    {Number(vehicle.fuelLevel || 0)}%
                  </p>
                  <p className="mt-0.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-zinc-500">
                    Fuel Level
                  </p>
                </div>

                {/* Registration Plate & Purchase Date */}
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="inline-block rounded border border-lime-400/30 bg-lime-400/10 px-1.5 py-0.5 font-mono text-[10px] font-bold text-lime-300">
                      REG
                    </span>
                    {vehicle.purchaseDate && (
                      <span className="text-[10px] font-medium text-zinc-400">
                        • {vehicle.purchaseDate}
                      </span>
                    )}
                  </div>
                  <p className="mt-2 font-mono text-base font-bold tracking-tight text-zinc-200">
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
                    min={0}
                    max={8000}
                    value={
                      formData.engineCc === 0 || !formData.engineCc
                        ? ''
                        : formData.engineCc
                    }
                    onChange={(e) => {
                      const val =
                        e.target.value === '' ? '' : Number(e.target.value)
                      setFormData({
                        ...formData,
                        engineCc: val,
                      })
                    }}
                    placeholder="0"
                    className="mt-1 w-full rounded-lg border border-white/10 bg-[#151a20] px-3 py-2 text-sm text-white placeholder-zinc-500 focus:border-lime-400 focus:outline-none"
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
                    value={
                      formData.topSpeed === 0 || !formData.topSpeed
                        ? ''
                        : formData.topSpeed
                    }
                    onChange={(e) => {
                      const val =
                        e.target.value === '' ? '' : Number(e.target.value)
                      setFormData({
                        ...formData,
                        topSpeed: val,
                        speed: val,
                      })
                    }}
                    placeholder="0"
                    className="mt-1 w-full rounded-lg border border-lime-400/30 bg-[#151a20] px-3 py-2 text-sm font-bold text-lime-300 placeholder-zinc-500 focus:border-lime-400 focus:outline-none"
                  />
                </div>
              </div>

              {/* Row 3: Plate, Purchase Date & Fuel Type (3 columns with generous width to prevent overflow) */}
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
                    Registration Plate *
                  </label>
                  <input
                    required
                    value={formData.plate}
                    onChange={(e) =>
                      setFormData({ ...formData, plate: e.target.value })
                    }
                    placeholder="e.g. JK-01-BG-1152"
                    className="mt-1 w-full rounded-lg border border-white/10 bg-[#151a20] px-3 py-2 font-mono text-sm uppercase text-white focus:border-lime-400 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
                    Purchase Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.purchaseDate || ''}
                    onChange={(e) =>
                      setFormData({ ...formData, purchaseDate: e.target.value })
                    }
                    className="mt-1 w-full rounded-lg border border-white/10 bg-[#151a20] px-3 py-2 font-mono text-sm text-white focus:border-lime-400 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
                    Fuel Type *
                  </label>
                  <select
                    value={formData.fuelType || 'Petrol (E10)'}
                    onChange={(e) =>
                      setFormData({ ...formData, fuelType: e.target.value })
                    }
                    className="mt-1 w-full rounded-lg border border-white/10 bg-[#151a20] px-3 py-2 text-sm text-white focus:border-lime-400 focus:outline-none"
                  >
                    <optgroup label="Petrol / Gasoline">
                      <option value="Petrol (E0)">Petrol (E0 - Pure Petrol)</option>
                      <option value="Petrol (E10)">Petrol (E10)</option>
                      <option value="Petrol (E20)">Petrol (E20)</option>
                      <option value="Petrol (E30)">Petrol (E30)</option>
                      <option value="Petrol (E85)">Petrol (E85 - Flex Fuel)</option>
                      <option value="Petrol (90 Octane)">Petrol (90 Octane)</option>
                      <option value="Petrol (95 Octane)">Petrol (95 Octane Premium)</option>
                      <option value="Petrol (100 Octane)">Petrol (100 Octane Race)</option>
                    </optgroup>
                    <optgroup label="Diesel">
                      <option value="Diesel (Standard)">Diesel (Standard)</option>
                      <option value="Diesel (B7)">Diesel (B7)</option>
                      <option value="Diesel (B10)">Diesel (B10)</option>
                      <option value="Diesel (B20)">Diesel (B20)</option>
                      <option value="Diesel (Premium)">Diesel (Premium / High Cetane)</option>
                    </optgroup>
                    <optgroup label="Electric / Battery">
                      <option value="Electricity">Electricity</option>
                    </optgroup>
                  </select>
                </div>
              </div>

              {/* Row 4: Ex-Showroom Price, Odometer & Fuel Level (3 columns) */}
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
                    Ex-Showroom Price (₹)
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={
                      formData.exShowroomPrice === 0 || !formData.exShowroomPrice
                        ? ''
                        : formData.exShowroomPrice
                    }
                    onChange={(e) => {
                      const val =
                        e.target.value === '' ? '' : Number(e.target.value)
                      setFormData({ ...formData, exShowroomPrice: val })
                    }}
                    placeholder="e.g. 185000"
                    className="mt-1 w-full rounded-lg border border-lime-400/30 bg-[#151a20] px-3 py-2 font-mono text-sm font-bold text-lime-300 placeholder-zinc-500 focus:border-lime-400 focus:outline-none"
                  />
                  <p className="mt-0.5 text-[9px] text-zinc-500">
                    Only this price excluded from total spend
                  </p>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
                    Odometer (km)
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={
                      formData.mileage === 0 || !formData.mileage
                        ? ''
                        : formData.mileage
                    }
                    onChange={(e) => {
                      const val =
                        e.target.value === '' ? '' : Number(e.target.value)
                      setFormData({ ...formData, mileage: val })
                    }}
                    placeholder="0"
                    className="mt-1 w-full rounded-lg border border-white/10 bg-[#151a20] px-3 py-2 font-mono text-sm text-white placeholder-zinc-500 focus:border-lime-400 focus:outline-none"
                  />
                  <p className="mt-0.5 text-[9px] text-zinc-500">
                    Auto-syncs with fuel refills
                  </p>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
                    Fuel Level (%)
                  </label>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={
                      formData.fuelLevel === 0 || !formData.fuelLevel
                        ? ''
                        : formData.fuelLevel
                    }
                    onChange={(e) => {
                      const val =
                        e.target.value === '' ? '' : Number(e.target.value)
                      setFormData({ ...formData, fuelLevel: val })
                    }}
                    placeholder="0"
                    className="mt-1 w-full rounded-lg border border-white/10 bg-[#151a20] px-3 py-2 text-sm text-white placeholder-zinc-500 focus:border-lime-400 focus:outline-none"
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
            className="aspect-[16/10] w-full max-w-lg min-h-[220px] max-h-[340px]"
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
