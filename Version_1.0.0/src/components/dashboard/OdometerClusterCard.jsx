import { Check, Fuel, Plus, RotateCw, Sparkles } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAnimatedNumber } from '../../hooks/useAnimatedNumber'

function getTodayString() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function formatOdometerDigits(mileage) {
  return String(Math.max(0, Math.round(Number(mileage) || 0)))
    .padStart(6, '0')
    .slice(-6)
    .split('')
}

/**
 * Returns dynamic color & glow based on current speed value:
 * 0 - 60 km/h: Green
 * 60 - 120 km/h: Orange
 * 120+ km/h: Red
 */
function getSpeedColor(speed) {
  const s = Number(speed) || 0
  if (s < 60) {
    return {
      text: 'text-lime-400',
      dropGlow: 'drop-shadow-[0_0_14px_rgba(163,230,53,0.7)]',
      border: 'border-lime-400/30 bg-lime-400/10 text-lime-300',
      badge: '0-60 · ECO',
      hex: '#a3e635',
    }
  }
  if (s <= 120) {
    return {
      text: 'text-amber-400',
      dropGlow: 'drop-shadow-[0_0_16px_rgba(251,191,36,0.75)]',
      border: 'border-amber-400/30 bg-amber-400/10 text-amber-300',
      badge: '60-120 · POWER',
      hex: '#f59e0b',
    }
  }
  return {
    text: 'text-rose-500',
    dropGlow: 'drop-shadow-[0_0_18px_rgba(244,63,94,0.85)]',
    border: 'border-rose-500/30 bg-rose-500/10 text-rose-300',
    badge: '120+ · REDLINE',
    hex: '#f43f5e',
  }
}

function getGearForSpeed(speed, isCar) {
  const s = Number(speed) || 0
  if (s <= 0) return 'N'
  if (s <= 25) return '1'
  if (s <= 50) return '2'
  if (s <= 75) return '3'
  if (s <= 100) return '4'
  if (s <= 125) return '5'
  return isCar ? '5' : '6'
}

/**
 * Mechanical/TFT rolling tumbler digit column.
 * Slides vertically (0-9) with smooth cubic-bezier easing and staggered delays.
 */
function RollingDigitTumbler({ digit, index }) {
  const digitNum = Number(digit) || 0
  const digitsArray = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]

  return (
    <div className="relative h-10 w-full overflow-hidden rounded-xl border border-white/12 bg-linear-to-b from-[#161c22] via-[#0b0e12] to-[#040608] shadow-[inset_0_2px_6px_rgba(0,0,0,0.9)]">
      {/* Top and bottom drum bevel shadows */}
      <div className="pointer-events-none absolute inset-x-0 top-0 z-10 h-2 bg-linear-to-b from-black/80 to-transparent" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-2 bg-linear-to-t from-black/80 to-transparent" />

      {/* Center highlight glass slit */}
      <div className="pointer-events-none absolute inset-x-0 top-1/2 z-10 h-6 -translate-y-1/2 bg-white/4 ring-1 ring-white/10" />

      {/* Tumbler ribbon */}
      <div
        className="flex flex-col items-center will-change-transform"
        style={{
          transform: `translateY(-${digitNum * 10}%)`,
          transition: 'transform 0.85s cubic-bezier(0.16, 1, 0.3, 1)',
          transitionDelay: `${(5 - index) * 60}ms`,
        }}
      >
        {digitsArray.map((num) => (
          <span
            key={num}
            className="flex h-10 w-full items-center justify-center font-mono text-xl font-black tracking-tight text-white select-none sm:text-2xl"
          >
            {num}
          </span>
        ))}
      </div>
    </div>
  )
}

export default function OdometerClusterCard({
  vehicle,
  latestRefill,
  onLogFuelRefill,
  onOpenFuelModal,
}) {
  const [isHovered, setIsHovered] = useState(false)
  const [showRefillForm, setShowRefillForm] = useState(false)
  const [saving, setSaving] = useState(false)
  const [feedback, setFeedback] = useState('')

  const [formData, setFormData] = useState(() => ({
    odometerKm: vehicle.mileage + 120,
    liters: 4,
    amountSpent: 420,
    fuelLevelAfter: 100,
    refillDate: '',
    notes: '',
  }))

  const digits = formatOdometerDigits(vehicle.mileage)
  const fuelLevel = Math.min(100, Math.max(0, Number(vehicle.fuelLevel) || 78))
  const isCar = vehicle.category === 'Four Wheeler'

  // User-configured static speed from vehicle profile (defaults to 150 km/h)
  const configuredSpeed = Math.max(
    0,
    Math.round(Number(vehicle?.topSpeed ?? vehicle?.speed ?? 150)),
  )

  const [sweepKey, setSweepKey] = useState(0)
  const [speedTarget, setSpeedTarget] = useState(0)

  // Start increasing speed animation on mount or when speed is updated in profile card
  useEffect(() => {
    let active = true
    const t = setTimeout(() => {
      if (active) setSpeedTarget(configuredSpeed)
    }, 60)
    return () => {
      active = false
      clearTimeout(t)
    }
  }, [configuredSpeed, sweepKey])

  const maxRpm = isCar ? 8000 : 12000
  const cruisingRpm =
    configuredSpeed > 0
      ? Math.min(
          maxRpm - 2000,
          Math.max(2800, Math.round((configuredSpeed / 200) * (maxRpm - 3000))),
        )
      : 1400

  // Tachometer revs up dynamically with increasing speed animation on hover
  const targetRpm = isHovered
    ? Math.min(maxRpm, cruisingRpm + 3200)
    : speedTarget > 0
      ? cruisingRpm
      : 1400
  const animatedRpm = useAnimatedNumber(targetRpm, 900, 1400)
  const rpmPercent = Math.min(100, Math.max(0, (animatedRpm / maxRpm) * 100))

  // Increasing speed animation towards configured speed (0 -> configuredSpeed) and stays static
  const activeSpeedTarget = isHovered
    ? Math.max(configuredSpeed, isCar ? 180 : 160)
    : speedTarget
  const animatedSpeed = useAnimatedNumber(activeSpeedTarget, 1100, 0)
  const speedColor = getSpeedColor(animatedSpeed)
  const currentGear = getGearForSpeed(animatedSpeed, isCar)

  const openForm = () => {
    setFormData({
      odometerKm: Number(vehicle.mileage) + 100,
      liters: isCar ? 25 : 4,
      amountSpent: isCar ? 2500 : 420,
      fuelLevelAfter: 100,
      refillDate: getTodayString(),
      notes: '',
    })
    setFeedback('')
    setShowRefillForm(true)
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setSaving(true)
    setFeedback('')
    try {
      await onLogFuelRefill(formData)
      setShowRefillForm(false)
      setFeedback('Fuel refill logged & odometer synced to Supabase.')
    } catch (err) {
      setFeedback(err.message || 'Could not log fuel refill.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <section className="rounded-3xl border border-white/10 bg-[#0d1014] p-5 shadow-2xl sm:p-7">
      {/* Header with Title and Action Button */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-lime-400 shadow-[0_0_8px_#a3e635]" />
            <h3 className="text-base font-extrabold uppercase tracking-wider text-white">
              {isCar ? 'Digital Cockpit Console' : 'Sports Instrument Cluster'}
            </h3>
          </div>
          <p className="mt-1 text-xs text-zinc-400">
            TFT-style telemetry · Numbers count up & bars cascade on hover · Synced with fuel refills
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              setSpeedTarget(0)
              setIsHovered((prev) => !prev)
              setSweepKey((k) => k + 1)
            }}
            className="inline-flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-semibold text-zinc-300 transition-colors hover:border-lime-400/40 hover:bg-lime-400/10 hover:text-lime-300"
          >
            <RotateCw className={`h-3.5 w-3.5 ${isHovered ? 'text-lime-400 animate-spin' : ''}`} />
            {isHovered ? 'Active Sweep' : 'Ignition Test'}
          </button>

          <button
            type="button"
            onClick={
              onOpenFuelModal
                ? onOpenFuelModal
                : () => (showRefillForm ? setShowRefillForm(false) : openForm())
            }
            className="inline-flex items-center gap-1.5 rounded-xl bg-lime-400 px-3.5 py-2 text-xs font-bold text-zinc-950 shadow-[0_0_16px_rgba(163,230,53,0.22)] transition-colors hover:bg-lime-300"
          >
            <Plus className="h-3.5 w-3.5" />
            Log Fuel Refill
          </button>
        </div>
      </div>

      {/* Modern High-End TFT Cockpit Cluster (NS400z Style) */}
      <div
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className="group relative mt-5 overflow-hidden rounded-2xl border border-white/12 bg-linear-to-b from-[#11161d] via-[#090c0f] to-[#040608] p-4 shadow-[inset_0_2px_12px_rgba(0,0,0,0.8)] transition-all duration-300 hover:border-lime-400/40 hover:shadow-[0_0_36px_rgba(163,230,53,0.14)] sm:p-6"
      >
        {/* Subtle glass reflection & carbon grid */}
        <div className="carbon-dots pointer-events-none absolute inset-0 opacity-20" />
        <div className="pointer-events-none absolute inset-x-0 top-0 h-28 bg-linear-to-b from-white/4 to-transparent" />

        {/* 1. TOP TELLTALE STATUS BAR */}
        <div className="pointer-events-none relative z-10 flex items-center justify-between border-b border-white/8 pb-3">
          <div className="flex items-center gap-3">
            <span
              className={`flex h-6 w-7 items-center justify-center rounded-md border text-xs font-bold transition-all duration-300 ${
                isHovered
                  ? 'border-emerald-400/50 bg-emerald-400/20 text-emerald-300 shadow-[0_0_10px_rgba(52,211,153,0.4)]'
                  : 'border-white/10 bg-white/5 text-zinc-600'
              }`}
            >
              ◀
            </span>

            <span
              className={`flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-black tracking-wider transition-all duration-300 ${
                currentGear === 'N'
                  ? 'border-lime-400/40 bg-lime-400/15 text-lime-300 shadow-[0_0_10px_rgba(163,230,53,0.35)]'
                  : 'border-white/10 bg-white/5 text-zinc-500'
              }`}
            >
              <span
                className={`h-1.5 w-1.5 rounded-full ${
                  currentGear === 'N' ? 'bg-lime-400 animate-pulse' : 'bg-zinc-600'
                }`}
              />
              N
            </span>

            <span
              className={`rounded-md border px-2 py-0.5 text-[10px] font-bold uppercase transition-all duration-300 ${
                isHovered
                  ? 'border-sky-400/50 bg-sky-400/20 text-sky-300 shadow-[0_0_10px_rgba(56,189,248,0.4)]'
                  : 'border-white/10 bg-white/5 text-zinc-600'
              }`}
            >
              HI BEAM
            </span>
          </div>

          <div className="flex items-center gap-3">
            <span
              className={`rounded-md border px-2 py-0.5 text-[10px] font-bold uppercase transition-all duration-300 ${
                isHovered
                  ? 'border-amber-400/50 bg-amber-400/20 text-amber-300 shadow-[0_0_10px_rgba(251,191,36,0.35)]'
                  : 'border-white/10 bg-white/5 text-zinc-600'
              }`}
            >
              ABS
            </span>

            <span className="font-mono text-xs font-bold text-zinc-400">
              {vehicle.engineCc} CC
            </span>

            <span
              className={`flex h-6 w-7 items-center justify-center rounded-md border text-xs font-bold transition-all duration-300 ${
                isHovered
                  ? 'border-emerald-400/50 bg-emerald-400/20 text-emerald-300 shadow-[0_0_10px_rgba(52,211,153,0.4)]'
                  : 'border-white/10 bg-white/5 text-zinc-600'
              }`}
            >
              ▶
            </span>
          </div>
        </div>

        {/* 2. SWEEPING TACHOMETER (RPM x 1000) REV BAR WITH CASCADING BARS ANIMATION */}
        <div className="pointer-events-none relative z-10 mt-4">
          <div className="flex items-center justify-between text-[11px] font-extrabold uppercase tracking-wider">
            <span className="text-zinc-500">
              RPM <strong className="text-zinc-400">x1000</strong>
            </span>
            <span className="font-mono text-xs font-black text-lime-300">
              {animatedRpm.toLocaleString()} <span className="text-[10px] text-zinc-500">RPM</span>
            </span>
          </div>

          {/* Staggered Cascading Segmented LED Rev-Band */}
          <div className="mt-1.5 flex h-3.5 w-full items-center gap-1 overflow-hidden rounded-lg bg-black/60 p-1 ring-1 ring-white/10">
            {Array.from({ length: 24 }).map((_, idx) => {
              const segmentPercent = (idx / 23) * 100
              const isActive = segmentPercent <= rpmPercent
              const isRedline = idx >= 18
              const isWarning = idx >= 14 && idx < 18

              const activeColor = isRedline
                ? 'bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.7)]'
                : isWarning
                  ? 'bg-amber-400 shadow-[0_0_10px_rgba(251,191,36,0.6)]'
                  : 'bg-lime-400 shadow-[0_0_10px_rgba(163,230,53,0.6)]'

              return (
                <div
                  key={idx}
                  className={`h-full flex-1 -skew-x-12 rounded-xs transition-all duration-200 ${
                    isActive ? activeColor : 'bg-white/6 opacity-40'
                  }`}
                  style={{
                    transitionDelay: isActive ? `${idx * 14}ms` : `${(23 - idx) * 10}ms`,
                  }}
                />
              )
            })}
          </div>

          {/* Rev Numbers scale */}
          <div className="mt-1 flex justify-between px-1 font-mono text-[9px] font-bold text-zinc-500">
            <span>0</span>
            <span>2</span>
            <span>4</span>
            <span>6</span>
            <span>8</span>
            <span className="text-amber-400">10</span>
            <span className="text-rose-400">12</span>
          </div>
        </div>

        {/* 3. CENTER TELEMETRY & ROLLING ODOMETER TUMBLER */}
        <div className="pointer-events-none relative z-10 mt-5 grid grid-cols-1 items-center gap-6 lg:grid-cols-12">
          {/* Left: Speedometer with Increasing Animation & 0-60 Green, 60-120 Orange, 120+ Red */}
          <div className="flex items-baseline gap-2.5 lg:col-span-5">
            <span
              className={`font-mono text-5xl font-black italic tracking-tighter tabular-nums transition-colors duration-150 sm:text-6xl ${speedColor.text} ${speedColor.dropGlow}`}
            >
              {animatedSpeed}
            </span>
            <div className="leading-tight">
              <span
                className={`block font-sans text-xs font-black uppercase tracking-wider transition-colors duration-150 ${speedColor.text}`}
              >
                KM / H
              </span>
              <span className="block text-[10px] font-semibold text-zinc-500">
                SPEED
              </span>
            </div>

            {/* Gear Indicator Box */}
            <div className="ml-auto rounded-xl border border-white/10 bg-black/60 px-3 py-1.5 text-center shadow-inner">
              <span className="block text-[9px] font-bold uppercase tracking-widest text-zinc-500">
                GEAR
              </span>
              <span
                className={`block font-mono text-lg font-black transition-colors duration-150 ${
                  currentGear === 'N' ? 'text-lime-400' : speedColor.text
                }`}
              >
                {currentGear}
              </span>
            </div>
          </div>

          {/* Right: Rolling Odometer Tumbler (All 6 Digits Slide Vertically) */}
          <div className="rounded-2xl border border-white/10 bg-[#07090c] p-4 shadow-inner lg:col-span-7">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-lime-400">
                <Sparkles className="h-3 w-3" />
                ODOMETER (TOTAL DISTANCE)
              </span>
              <span className="rounded bg-white/5 px-1.5 py-0.5 font-mono text-[10px] font-bold text-zinc-400">
                KM
              </span>
            </div>

            {/* Tumbler Columns */}
            <div className="mt-2.5 flex items-center justify-between gap-1.5 sm:gap-2">
              {digits.map((digit, index) => (
                <RollingDigitTumbler
                  key={index}
                  digit={digit}
                  index={index}
                />
              ))}
            </div>

            <div className="mt-2.5 flex items-center justify-between text-[11px] text-zinc-400">
              <span className="font-mono">
                TRIP A: <strong className="text-zinc-200">48.2 km</strong>
              </span>
              <span className="font-mono">
                RANGE: <strong className="text-lime-300">~240 km</strong>
              </span>
            </div>
          </div>
        </div>

        {/* 4. BOTTOM PRECISION GAUGES: TEMPERATURE & FUEL LEVEL WITH SMOOTH FILL BARS */}
        <div className="pointer-events-none relative z-10 mt-5 grid grid-cols-1 gap-4 border-t border-white/8 pt-4 sm:grid-cols-2">
          {/* Coolant / Engine Temperature Gauge */}
          <div>
            <div className="flex items-center justify-between text-[11px]">
              <span className="font-semibold text-zinc-400">Engine Temp</span>
              <span className="font-mono font-bold text-zinc-300">
                {isHovered ? 'PEAK · 92°C' : 'OPTIMAL · 88°C'}
              </span>
            </div>
            <div className="mt-1.5 flex h-2 w-full gap-1 overflow-hidden rounded-full bg-black/50 p-0.5 ring-1 ring-white/10">
              <div
                className="h-full rounded-full bg-lime-400 shadow-[0_0_8px_#a3e635] transition-all duration-700 ease-out"
                style={{ width: isHovered ? '62%' : '45%' }}
              />
              <div
                className="h-full rounded-full bg-lime-400/30 transition-all duration-700 ease-out"
                style={{ width: isHovered ? '20%' : '15%' }}
              />
            </div>
            <div className="mt-0.5 flex justify-between text-[9px] font-bold text-zinc-600">
              <span>C</span>
              <span>NORMAL</span>
              <span>H</span>
            </div>
          </div>

          {/* Fuel Level Gauge with Cascading Bars Animation */}
          <div>
            <div className="flex items-center justify-between text-[11px]">
              <span className="font-semibold text-zinc-400">Fuel Level</span>
              <span className="font-mono font-bold text-lime-300">{fuelLevel}%</span>
            </div>
            <div className="mt-1.5 flex h-2 w-full gap-1 overflow-hidden rounded-full bg-black/50 p-0.5 ring-1 ring-white/10">
              {Array.from({ length: 10 }).map((_, idx) => {
                const isFilled = (idx + 1) * 10 <= fuelLevel
                const isLow = idx < 2
                return (
                  <div
                    key={idx}
                    className={`h-full flex-1 rounded-xs transition-all duration-300 ${
                      isFilled
                        ? isLow
                          ? 'bg-rose-500 shadow-[0_0_6px_#f43f5e]'
                          : 'bg-lime-400 shadow-[0_0_6px_#a3e635]'
                        : 'bg-white/5'
                    }`}
                    style={{
                      transitionDelay: `${idx * 28}ms`,
                    }}
                  />
                )
              })}
            </div>
            <div className="mt-0.5 flex justify-between text-[9px] font-bold text-zinc-600">
              <span className="text-rose-400">E</span>
              <span>HALF</span>
              <span className="text-lime-400">F</span>
            </div>
          </div>
        </div>
      </div>

      {/* Latest Fuel Refill Readout Strip */}
      <div className="mt-4 flex flex-col gap-2 rounded-2xl border border-white/8 bg-[#12161c] px-4 py-3 text-xs sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-lime-400/15 text-lime-400">
            <Fuel className="h-4 w-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <p className="font-bold text-zinc-100">
                {latestRefill?.stationName || 'Latest Fuel Refill'}
              </p>
              {latestRefill?.fuelFillType && (
                <span
                  className={`rounded px-1.5 py-0.2 text-[9px] font-extrabold uppercase tracking-wider ${
                    latestRefill.fuelFillType === 'Full Tank'
                      ? 'border border-lime-400/30 bg-lime-400/10 text-lime-300'
                      : 'border border-amber-400/30 bg-amber-400/10 text-amber-300'
                  }`}
                >
                  {latestRefill.fuelFillType}
                </span>
              )}
            </div>
            {latestRefill ? (
              <p className="text-zinc-400">
                {latestRefill.refillDate}
                {latestRefill.location ? ` · ${latestRefill.location}` : ''} ·{' '}
                <span className="font-semibold text-zinc-200">
                  {latestRefill.odometerKm.toLocaleString('en-IN')} km
                </span>{' '}
                · {latestRefill.liters} L @ ₹{latestRefill.pricePerLiter}/L
              </p>
            ) : (
              <p className="text-zinc-500">No fuel refills logged yet</p>
            )}
          </div>
        </div>

        {latestRefill ? (
          <div className="flex items-center gap-3">
            <span className="rounded-lg border border-lime-400/25 bg-lime-400/10 px-2.5 py-1 font-bold text-lime-300 font-mono">
              ₹{Number(latestRefill.amountSpent).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </span>
            <Link
              to="/fuel-history"
              className="text-xs font-semibold text-zinc-400 hover:text-lime-300 transition-colors"
            >
              Logs →
            </Link>
          </div>
        ) : null}
      </div>

      {feedback && (
        <p className="mt-3 rounded-xl border border-lime-400/25 bg-lime-400/10 px-3 py-2 text-xs font-medium text-lime-300">
          {feedback}
        </p>
      )}

      {/* Inline Log Fuel Refill Form */}
      {showRefillForm && (
        <form
          onSubmit={handleSubmit}
          className="mt-4 space-y-3 rounded-2xl border border-lime-400/25 bg-[#12161b] p-4"
        >
          <p className="text-xs font-bold text-lime-300">
            Log Fuel Refill (automatically updates odometer & maintenance health bars)
          </p>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
            <div>
              <label className="block text-[11px] font-medium text-zinc-400">
                Odometer (km) *
              </label>
              <input
                type="number"
                required
                min={vehicle.mileage}
                value={formData.odometerKm}
                onChange={(e) =>
                  setFormData({ ...formData, odometerKm: e.target.value })
                }
                className="mt-1 w-full rounded-xl border border-white/10 bg-[#0b0e11] px-2.5 py-1.5 text-sm text-white focus:border-lime-400 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[11px] font-medium text-zinc-400">
                Fuel (Liters) *
              </label>
              <input
                type="number"
                step="0.1"
                min="0.1"
                required
                value={formData.liters}
                onChange={(e) =>
                  setFormData({ ...formData, liters: e.target.value })
                }
                className="mt-1 w-full rounded-xl border border-white/10 bg-[#0b0e11] px-2.5 py-1.5 text-sm text-white focus:border-lime-400 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[11px] font-medium text-zinc-400">
                Amount (₹) *
              </label>
              <input
                type="number"
                step="1"
                min="0"
                required
                value={formData.amountSpent}
                onChange={(e) =>
                  setFormData({ ...formData, amountSpent: e.target.value })
                }
                className="mt-1 w-full rounded-xl border border-white/10 bg-[#0b0e11] px-2.5 py-1.5 text-sm text-white focus:border-lime-400 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[11px] font-medium text-zinc-400">
                Fuel After (%)
              </label>
              <input
                type="number"
                min="0"
                max="100"
                value={formData.fuelLevelAfter}
                onChange={(e) =>
                  setFormData({ ...formData, fuelLevelAfter: e.target.value })
                }
                className="mt-1 w-full rounded-xl border border-white/10 bg-[#0b0e11] px-2.5 py-1.5 text-sm text-white focus:border-lime-400 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[11px] font-medium text-zinc-400">
                Date
              </label>
              <input
                type="date"
                value={formData.refillDate}
                onChange={(e) =>
                  setFormData({ ...formData, refillDate: e.target.value })
                }
                className="mt-1 w-full rounded-xl border border-white/10 bg-[#0b0e11] px-2.5 py-1.5 text-sm text-white focus:border-lime-400 focus:outline-none"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setShowRefillForm(false)}
              className="rounded-xl border border-white/15 px-3.5 py-1.5 text-xs font-semibold text-zinc-300 hover:bg-white/5"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-1 rounded-xl bg-lime-400 px-3.5 py-1.5 text-xs font-bold text-zinc-950 hover:bg-lime-300 disabled:opacity-50"
            >
              <Check className="h-3.5 w-3.5" />
              {saving ? 'Syncing...' : 'Save Refill & Update Odo'}
            </button>
          </div>
        </form>
      )}
    </section>
  )
}
