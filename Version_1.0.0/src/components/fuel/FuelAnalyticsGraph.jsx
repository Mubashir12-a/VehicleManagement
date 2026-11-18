import {
  BarChart3,
  Compass,
  Info,
  Sparkles,
} from 'lucide-react'
import { useMemo, useState } from 'react'
import {
  Area,
  Bar,
  CartesianGrid,
  ComposedChart,
  Legend,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

/**
 * Custom Dark Carbon Tooltip for Top-Up to Top-Up Graph
 */
function TopUpTooltip({ active, payload }) {
  if (!active || !payload || !payload.length) return null
  const data = payload[0]?.payload
  if (!data) return null

  return (
    <div className="rounded-2xl border border-white/15 bg-[#0b0e12]/95 p-4 shadow-2xl backdrop-blur-md">
      <div className="flex items-center justify-between gap-4 border-b border-white/10 pb-2">
        <div>
          <span className="font-mono text-xs font-bold text-lime-400">
            {data.label}
          </span>
          <p className="text-[11px] text-zinc-400">
            {data.date} · {data.station}
          </p>
        </div>
        <span className="rounded-full border border-lime-400/30 bg-lime-400/10 px-2 py-0.5 text-[10px] font-bold text-lime-300">
          {data.fillType}
        </span>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-3 text-xs">
        <div>
          <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500">
            Trip Distance
          </span>
          <p className="font-mono text-sm font-black text-white">
            +{data.tripDistance} <span className="text-[10px] text-zinc-400">km</span>
          </p>
          <p className="text-[9px] text-zinc-500">
            {data.prevOdometer} → {data.odometer} km
          </p>
        </div>

        <div>
          <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500">
            Fuel Filled
          </span>
          <p className="font-mono text-sm font-black text-white">
            {data.liters} <span className="text-[10px] text-zinc-400">L</span>
          </p>
          <p className="text-[9px] text-zinc-500">
            ₹{data.pricePerLiter}/L · ₹{data.amountSpent}
          </p>
        </div>

        <div className="col-span-2 rounded-xl border border-lime-400/30 bg-lime-400/10 p-2 text-center">
          <span className="block text-[10px] font-black uppercase tracking-wider text-lime-400">
            Top-Up Mileage (Efficiency)
          </span>
          <p className="font-mono text-xl font-black text-lime-300">
            {data.mileage > 0 ? `${data.mileage} km/L` : '—'}
          </p>
          <p className="mt-0.5 text-[10px] text-zinc-400">
            Running cost: <strong className="text-zinc-200">₹{data.costPerKm}/km</strong>
          </p>
        </div>
      </div>
    </div>
  )
}

/**
 * Custom Dark Carbon Tooltip for Cumulative Total Graph
 */
function CumulativeTooltip({ active, payload }) {
  if (!active || !payload || !payload.length) return null
  const data = payload[0]?.payload
  if (!data) return null

  return (
    <div className="rounded-2xl border border-white/15 bg-[#0b0e12]/95 p-4 shadow-2xl backdrop-blur-md">
      <div className="flex items-center justify-between gap-4 border-b border-white/10 pb-2">
        <div>
          <span className="font-mono text-xs font-bold text-sky-400">
            {data.label}
          </span>
          <p className="text-[11px] text-zinc-400">
            {data.date} · {data.station}
          </p>
        </div>
        <span className="rounded-full border border-sky-400/30 bg-sky-400/10 px-2 py-0.5 text-[10px] font-bold text-sky-300">
          Odo {data.odometer} km
        </span>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-3 text-xs">
        <div>
          <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500">
            Total Distance Covered
          </span>
          <p className="font-mono text-sm font-black text-white">
            {data.totalDistance} <span className="text-[10px] text-zinc-400">km</span>
          </p>
          <p className="text-[9px] text-zinc-500">From baseline 1st fuel</p>
        </div>

        <div>
          <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500">
            Total Liters Consumed
          </span>
          <p className="font-mono text-sm font-black text-white">
            {data.totalLiters} <span className="text-[10px] text-zinc-400">L</span>
          </p>
          <p className="text-[9px] text-zinc-500">Total ₹{data.totalSpend}</p>
        </div>

        <div className="col-span-2 rounded-xl border border-sky-400/30 bg-sky-400/10 p-2 text-center">
          <span className="block text-[10px] font-black uppercase tracking-wider text-sky-400">
            Cumulative Average Mileage
          </span>
          <p className="font-mono text-xl font-black text-sky-300">
            {data.cumulativeMileage > 0 ? `${data.cumulativeMileage} km/L` : '—'}
          </p>
          <p className="mt-0.5 text-[10px] text-zinc-400">
            Overall efficiency from 1st refill to this date
          </p>
        </div>
      </div>
    </div>
  )
}

export default function FuelAnalyticsGraph({ fuelRefills = [] }) {
  const [activeTab, setActiveTab] = useState('topup') // 'topup' | 'cumulative' | 'both'

  // Chronologically sorted refills (oldest to newest)
  const sortedRefills = useMemo(() => {
    return [...fuelRefills].sort((a, b) => {
      const dateA = String(a.refillDate || '')
      const dateB = String(b.refillDate || '')
      if (dateA !== dateB) return dateA.localeCompare(dateB)
      return (Number(a.odometerKm) || 0) - (Number(b.odometerKm) || 0)
    })
  }, [fuelRefills])

  // 1. TOP-UP TO TOP-UP DATASET (Fill-to-fill consumption & mileage between consecutive refills)
  const topUpData = useMemo(() => {
    if (sortedRefills.length < 2) return []

    const results = []
    for (let i = 1; i < sortedRefills.length; i++) {
      const prev = sortedRefills[i - 1]
      const curr = sortedRefills[i]

      const prevOdo = Number(prev.odometerKm) || 0
      const currOdo = Number(curr.odometerKm) || 0
      const tripDistance = Math.max(0, currOdo - prevOdo)
      const liters = Number(curr.liters) || 0
      const amountSpent = Number(curr.amountSpent) || 0
      const pricePerLiter = Number(curr.pricePerLiter) || 0

      const mileage =
        liters > 0 && tripDistance > 0
          ? Number((tripDistance / liters).toFixed(2))
          : 0

      const costPerKm =
        tripDistance > 0 && amountSpent > 0
          ? Number((amountSpent / tripDistance).toFixed(2))
          : 0

      const dateLabel = curr.refillDate
        ? new Date(curr.refillDate + 'T00:00:00Z').toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            timeZone: 'UTC',
          })
        : `Refill #${i}`

      results.push({
        id: curr.id,
        index: i,
        label: `Top-Up #${i}`,
        date: curr.refillDate || '—',
        dateLabel,
        station: curr.stationName || 'Station',
        odometer: currOdo,
        prevOdometer: prevOdo,
        tripDistance,
        liters,
        amountSpent,
        pricePerLiter,
        mileage,
        costPerKm,
        fillType: curr.fuelFillType || 'Full Tank',
      })
    }
    return results
  }, [sortedRefills])

  // 2. CUMULATIVE TOTAL DATASET (From first fuel to each subsequent refill)
  const cumulativeData = useMemo(() => {
    if (sortedRefills.length === 0) return []
    const first = sortedRefills[0]
    const baselineOdo = Number(first.odometerKm) || 0

    let runningLiters = 0
    let runningSpend = 0
    const list = []

    for (let idx = 0; idx < sortedRefills.length; idx++) {
      const curr = sortedRefills[idx]
      const currOdo = Number(curr.odometerKm) || 0
      const totalDistance = Math.max(0, currOdo - baselineOdo)
      const liters = Number(curr.liters) || 0
      const amount = Number(curr.amountSpent) || 0

      runningLiters += liters
      runningSpend += amount

      const cumulativeMileage =
        runningLiters > 0 && totalDistance > 0
          ? Number((totalDistance / runningLiters).toFixed(2))
          : 0

      const dateLabel = curr.refillDate
        ? new Date(curr.refillDate + 'T00:00:00Z').toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            timeZone: 'UTC',
          })
        : `Refill #${idx + 1}`

      list.push({
        id: curr.id,
        index: idx + 1,
        label: idx === 0 ? '1st Fuel (Baseline)' : `Refill #${idx + 1}`,
        date: curr.refillDate || '—',
        dateLabel,
        station: curr.stationName || 'Station',
        odometer: currOdo,
        totalDistance,
        liters,
        totalLiters: Number(runningLiters.toFixed(2)),
        totalSpend: Number(runningSpend.toFixed(2)),
        cumulativeMileage,
        pricePerLiter: Number(curr.pricePerLiter) || 0,
        fillType: curr.fuelFillType || 'Full Tank',
      })
    }

    return list
  }, [sortedRefills])

  // Summary Metrics
  const metrics = useMemo(() => {
    if (topUpData.length === 0) {
      return {
        latestMileage: 0,
        bestMileage: 0,
        avgTopUpMileage: 0,
        overallCumulativeMileage: 0,
        totalDistance: 0,
        totalLiters: sortedRefills.reduce(
          (sum, r) => sum + (Number(r.liters) || 0),
          0,
        ),
        totalSpend: sortedRefills.reduce(
          (sum, r) => sum + (Number(r.amountSpent) || 0),
          0,
        ),
      }
    }

    const validMileages = topUpData
      .map((d) => d.mileage)
      .filter((m) => m > 0)

    const latestMileage = topUpData[topUpData.length - 1]?.mileage || 0
    const bestMileage =
      validMileages.length > 0 ? Math.max(...validMileages) : 0
    const avgTopUpMileage =
      validMileages.length > 0
        ? Number(
            (
              validMileages.reduce((a, b) => a + b, 0) / validMileages.length
            ).toFixed(2),
          )
        : 0

    const lastCum = cumulativeData[cumulativeData.length - 1]
    const overallCumulativeMileage = lastCum?.cumulativeMileage || 0
    const totalDistance = lastCum?.totalDistance || 0
    const totalLiters = lastCum?.totalLiters || 0
    const totalSpend = lastCum?.totalSpend || 0

    return {
      latestMileage,
      bestMileage,
      avgTopUpMileage,
      overallCumulativeMileage,
      totalDistance,
      totalLiters,
      totalSpend,
    }
  }, [topUpData, cumulativeData, sortedRefills])

  return (
    <div className="space-y-6 rounded-3xl border border-white/10 bg-[#0c0f14] p-5 shadow-2xl sm:p-7">
      {/* Header with Switcher Tabs */}
      <div className="flex flex-col gap-4 border-b border-white/8 pb-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-xl bg-lime-400 text-zinc-950 font-black shadow-[0_0_14px_rgba(163,230,53,0.35)]">
              <BarChart3 className="h-4 w-4 stroke-[2.5]" />
            </span>
            <h3 className="text-lg font-black tracking-tight text-white sm:text-xl">
              Fuel Consumption & Mileage Analytics
            </h3>
          </div>
          <p className="mt-1 text-xs text-zinc-400">
            Top-up to top-up consumption vs. cumulative all-time distance performance
          </p>
        </div>

        {/* View Switcher Pills */}
        <div className="flex items-center gap-1.5 rounded-2xl border border-white/10 bg-[#12161d] p-1.5">
          <button
            type="button"
            onClick={() => setActiveTab('topup')}
            className={`rounded-xl px-3 py-1.5 text-xs font-bold transition-all ${
              activeTab === 'topup'
                ? 'bg-lime-400 text-zinc-950 shadow-[0_0_14px_rgba(163,230,53,0.3)]'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            ⛽ Top-Up to Top-Up
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('cumulative')}
            className={`rounded-xl px-3 py-1.5 text-xs font-bold transition-all ${
              activeTab === 'cumulative'
                ? 'bg-sky-400 text-zinc-950 shadow-[0_0_14px_rgba(56,189,248,0.3)]'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            📈 Cumulative Total
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('both')}
            className={`rounded-xl px-3 py-1.5 text-xs font-bold transition-all ${
              activeTab === 'both'
                ? 'bg-white/15 text-white'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            📊 Both
          </button>
        </div>
      </div>

      {/* Key Metric Strip */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        <div className="rounded-2xl border border-lime-400/25 bg-lime-400/5 p-3.5 shadow-sm">
          <span className="block text-[10px] font-black uppercase tracking-wider text-lime-400">
            Latest Top-Up
          </span>
          <p className="mt-1 font-mono text-xl font-black text-lime-300">
            {metrics.latestMileage > 0 ? `${metrics.latestMileage}` : '—'}
            <span className="text-xs font-semibold text-zinc-400 ml-1">km/L</span>
          </p>
          <span className="text-[10px] text-zinc-400">Most recent refill</span>
        </div>

        <div className="rounded-2xl border border-white/8 bg-[#12161c] p-3.5 shadow-sm">
          <span className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400">
            Best Top-Up
          </span>
          <p className="mt-1 font-mono text-xl font-black text-emerald-400">
            {metrics.bestMileage > 0 ? `${metrics.bestMileage}` : '—'}
            <span className="text-xs font-semibold text-zinc-400 ml-1">km/L</span>
          </p>
          <span className="text-[10px] text-zinc-400">Peak trip mileage</span>
        </div>

        <div className="rounded-2xl border border-sky-400/25 bg-sky-400/5 p-3.5 shadow-sm">
          <span className="block text-[10px] font-black uppercase tracking-wider text-sky-400">
            All-Time Avg
          </span>
          <p className="mt-1 font-mono text-xl font-black text-sky-300">
            {metrics.overallCumulativeMileage > 0
              ? `${metrics.overallCumulativeMileage}`
              : '—'}
            <span className="text-xs font-semibold text-zinc-400 ml-1">km/L</span>
          </p>
          <span className="text-[10px] text-zinc-400">Cumulative mileage</span>
        </div>

        <div className="rounded-2xl border border-white/8 bg-[#12161c] p-3.5 shadow-sm">
          <span className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400">
            Tracked Distance
          </span>
          <p className="mt-1 font-mono text-xl font-black text-white">
            {metrics.totalDistance}
            <span className="text-xs font-semibold text-zinc-400 ml-1">km</span>
          </p>
          <span className="text-[10px] text-zinc-400">From 1st fuel entry</span>
        </div>

        <div className="rounded-2xl border border-white/8 bg-[#12161c] p-3.5 shadow-sm">
          <span className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400">
            Total Fuel
          </span>
          <p className="mt-1 font-mono text-xl font-black text-white">
            {Number(metrics.totalLiters.toFixed(2))}
            <span className="text-xs font-semibold text-zinc-400 ml-1">L</span>
          </p>
          <span className="text-[10px] text-zinc-400">Total liters pumped</span>
        </div>

        <div className="rounded-2xl border border-white/8 bg-[#12161c] p-3.5 shadow-sm">
          <span className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400">
            Total Spend
          </span>
          <p className="mt-1 font-mono text-xl font-black text-amber-300">
            ₹{Math.round(metrics.totalSpend).toLocaleString('en-IN')}
          </p>
          <span className="text-[10px] text-zinc-400">Cumulative fuel cost</span>
        </div>
      </div>

      {/* Insufficient Data State */}
      {sortedRefills.length < 2 && (
        <div className="rounded-2xl border border-amber-400/30 bg-amber-400/10 p-5 text-amber-300">
          <div className="flex items-start gap-3">
            <Info className="h-5 w-5 shrink-0 text-amber-400" />
            <div>
              <h4 className="text-sm font-bold text-white">
                Requires At Least 2 Fuel Refills for Top-Up Analysis
              </h4>
              <p className="mt-1 text-xs text-amber-200/90 leading-relaxed">
                You currently have {sortedRefills.length} recorded refill. To calculate top-up
                to top-up fuel consumption and average mileage (km/L), the system measures the distance
                traveled between your consecutive odometer readings divided by the fuel filled.
              </p>
              {sortedRefills.length === 1 && (
                <div className="mt-3 inline-flex items-center gap-2 rounded-xl border border-white/10 bg-black/40 px-3 py-1.5 font-mono text-xs text-zinc-300">
                  <span className="text-lime-400">Baseline #1:</span>
                  <span>{sortedRefills[0].odometerKm} km Odometer</span>
                  <span>· {sortedRefills[0].liters} Liters</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* GRAPH 1: TOP-UP TO TOP-UP FUEL CONSUMPTION & AVERAGE MILEAGE */}
      {(activeTab === 'topup' || activeTab === 'both') && topUpData.length > 0 && (
        <div className="space-y-4 rounded-2xl border border-white/8 bg-[#090c10] p-5 shadow-inner">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/6 pb-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-lime-400 shadow-[0_0_8px_#a3e635]" />
                <h4 className="text-base font-extrabold text-white">
                  Top-Up to Top-Up Fuel Efficiency (km/L)
                </h4>
              </div>
              <p className="mt-0.5 text-xs text-zinc-400">
                Calculated per refill trip: <strong className="text-lime-300">Δ Distance (km) ÷ Liters Filled (L)</strong>
              </p>
            </div>

            <div className="flex items-center gap-2 text-xs">
              <span className="flex items-center gap-1.5 rounded-full border border-lime-400/30 bg-lime-400/10 px-3 py-1 font-mono font-bold text-lime-300">
                <Sparkles className="h-3 w-3" />
                Latest: {metrics.latestMileage} km/L
              </span>
            </div>
          </div>

          <div className="h-72 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart
                data={topUpData}
                margin={{ top: 10, right: 15, left: -10, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="topUpLimeGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#a3e635" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#a3e635" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                <XAxis
                  dataKey="dateLabel"
                  tick={{ fill: '#a1a1aa', fontSize: 11, fontWeight: 600 }}
                  axisLine={{ stroke: '#3f3f46' }}
                  tickLine={false}
                />
                {/* Left Axis: Mileage in km/L */}
                <YAxis
                  yAxisId="left"
                  tick={{ fill: '#a3e635', fontSize: 11, fontWeight: 700 }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(val) => `${val} km/L`}
                />
                {/* Right Axis: Liters Filled */}
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  tick={{ fill: '#71717a', fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(val) => `${val} L`}
                />
                <Tooltip content={<TopUpTooltip />} />
                <Legend
                  wrapperStyle={{ paddingTop: 10, fontSize: 11 }}
                  formatter={(value) => (
                    <span className="text-zinc-300 font-semibold">{value}</span>
                  )}
                />
                <Bar
                  yAxisId="right"
                  dataKey="liters"
                  name="Fuel Filled (L)"
                  fill="#27272a"
                  radius={[6, 6, 0, 0]}
                  barSize={20}
                />
                <Area
                  yAxisId="left"
                  type="monotone"
                  dataKey="mileage"
                  name="Top-Up Mileage (km/L)"
                  stroke="#a3e635"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#topUpLimeGrad)"
                  dot={{ r: 5, fill: '#a3e635', stroke: '#090c10', strokeWidth: 2 }}
                  activeDot={{ r: 7, fill: '#ffffff', stroke: '#a3e635', strokeWidth: 3 }}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* GRAPH 2: CUMULATIVE TOTAL FROM FIRST FUEL TO LAST REFILL */}
      {(activeTab === 'cumulative' || activeTab === 'both') && cumulativeData.length > 0 && (
        <div className="space-y-4 rounded-2xl border border-white/8 bg-[#090c10] p-5 shadow-inner">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/6 pb-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-sky-400 shadow-[0_0_8px_#38bdf8]" />
                <h4 className="text-base font-extrabold text-white">
                  Cumulative Total: First Fuel to Last Refill
                </h4>
              </div>
              <p className="mt-0.5 text-xs text-zinc-400">
                Overall distance covered & total fuel consumption accumulation over time
              </p>
            </div>

            <div className="flex items-center gap-2 text-xs">
              <span className="flex items-center gap-1.5 rounded-full border border-sky-400/30 bg-sky-400/10 px-3 py-1 font-mono font-bold text-sky-300">
                <Compass className="h-3 w-3" />
                Total Distance: {metrics.totalDistance} km
              </span>
            </div>
          </div>

          <div className="h-72 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart
                data={cumulativeData}
                margin={{ top: 10, right: 15, left: -10, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="cumSkyGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#38bdf8" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                <XAxis
                  dataKey="dateLabel"
                  tick={{ fill: '#a1a1aa', fontSize: 11, fontWeight: 600 }}
                  axisLine={{ stroke: '#3f3f46' }}
                  tickLine={false}
                />
                {/* Left Axis: Cumulative Distance (km) */}
                <YAxis
                  yAxisId="left"
                  tick={{ fill: '#38bdf8', fontSize: 11, fontWeight: 700 }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(val) => `${val} km`}
                />
                {/* Right Axis: Cumulative Mileage (km/L) */}
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  tick={{ fill: '#fb923c', fontSize: 11, fontWeight: 700 }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(val) => `${val} km/L`}
                />
                <Tooltip content={<CumulativeTooltip />} />
                <Legend
                  wrapperStyle={{ paddingTop: 10, fontSize: 11 }}
                  formatter={(value) => (
                    <span className="text-zinc-300 font-semibold">{value}</span>
                  )}
                />
                <Area
                  yAxisId="left"
                  type="monotone"
                  dataKey="totalDistance"
                  name="Cumulative Distance (km)"
                  stroke="#38bdf8"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#cumSkyGrad)"
                  dot={{ r: 4, fill: '#38bdf8', stroke: '#090c10', strokeWidth: 2 }}
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="cumulativeMileage"
                  name="All-Time Avg Mileage (km/L)"
                  stroke="#fb923c"
                  strokeWidth={3}
                  dot={{ r: 5, fill: '#fb923c', stroke: '#090c10', strokeWidth: 2 }}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Tabular Breakdown for verification */}
      {topUpData.length > 0 && (
        <div className="overflow-hidden rounded-2xl border border-white/8 bg-[#090c10]">
          <div className="border-b border-white/6 px-4 py-3">
            <h5 className="text-xs font-black uppercase tracking-wider text-zinc-300">
              Top-Up Trip Ledger Breakdown
            </h5>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-white/6 bg-white/3 font-semibold uppercase tracking-wider text-zinc-400">
                <tr>
                  <th className="py-2.5 px-4">Top-Up</th>
                  <th className="py-2.5 px-4">Date</th>
                  <th className="py-2.5 px-4">Odometer Interval</th>
                  <th className="py-2.5 px-4">Distance (km)</th>
                  <th className="py-2.5 px-4">Fuel Filled</th>
                  <th className="py-2.5 px-4">Cost</th>
                  <th className="py-2.5 px-4 text-right">Mileage (km/L)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/4 font-mono text-zinc-300">
                {topUpData.map((row) => (
                  <tr key={row.id} className="hover:bg-white/3 transition-colors">
                    <td className="py-3 px-4 font-bold text-white">{row.label}</td>
                    <td className="py-3 px-4 text-zinc-400 font-sans">{row.date}</td>
                    <td className="py-3 px-4 text-zinc-400">
                      {row.prevOdometer} → <strong className="text-white">{row.odometer}</strong> km
                    </td>
                    <td className="py-3 px-4 font-bold text-sky-400">+{row.tripDistance} km</td>
                    <td className="py-3 px-4">{row.liters} L</td>
                    <td className="py-3 px-4 text-zinc-400">₹{row.amountSpent}</td>
                    <td className="py-3 px-4 text-right">
                      <span className="inline-block rounded-lg border border-lime-400/30 bg-lime-400/10 px-2.5 py-1 font-bold text-lime-300">
                        {row.mileage > 0 ? `${row.mileage} km/L` : '—'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
