import {
  BarChart3,
  Compass,
  IndianRupee,
  Info,
  Sparkles,
  TrendingUp,
  Zap,
} from 'lucide-react'
import { useMemo, useState } from 'react'
import {
  Area,
  AreaChart,
  Bar,
  CartesianGrid,
  ComposedChart,
  Legend,
  Line,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

/**
 * Custom High-Legibility Tooltip for Mileage Efficiency
 */
function MileageTooltip({ active, payload }) {
  if (!active || !payload || !payload.length) return null
  const data = payload[0]?.payload
  if (!data) return null

  return (
    <div className="rounded-2xl border border-white/15 bg-[#0b0e12]/95 p-4 shadow-2xl backdrop-blur-md min-w-[240px]">
      <div className="flex items-center justify-between gap-3 border-b border-white/10 pb-2">
        <div>
          <span className="font-mono text-xs font-bold text-lime-400">
            {data.label}
          </span>
          <p className="text-[11px] text-zinc-400">
            {data.date} · {data.station}
          </p>
        </div>
        <span
          className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
            data.isTankToTank
              ? 'border border-lime-400/30 bg-lime-400/10 text-lime-300'
              : 'border border-amber-400/30 bg-amber-400/10 text-amber-300'
          }`}
        >
          {data.isTankToTank ? 'Tank-to-Tank' : data.fillType}
        </span>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2.5 text-xs">
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
            Fuel Added
          </span>
          <p className="font-mono text-sm font-black text-white">
            {data.liters} <span className="text-[10px] text-zinc-400">L</span>
          </p>
          <p className="text-[9px] text-zinc-500">
            ₹{data.pricePerLiter}/L · ₹{data.amountSpent}
          </p>
        </div>

        <div className="col-span-2 rounded-xl border border-lime-400/30 bg-lime-400/10 p-2.5 text-center">
          <span className="block text-[10px] font-black uppercase tracking-wider text-lime-400">
            Calculated Efficiency
          </span>
          <p className="font-mono text-xl font-black text-lime-300">
            {data.tripMileage > 0 ? `${data.tripMileage} km/L` : '—'}
          </p>
          <p className="mt-0.5 text-[10px] text-zinc-400">
            Running cost:{' '}
            <strong className="text-zinc-200">
              {data.costPerKm > 0 ? `₹${data.costPerKm}/km` : '—'}
            </strong>
          </p>
        </div>
      </div>
    </div>
  )
}

/**
 * Custom Tooltip for Cost & Liters
 */
function CostTooltip({ active, payload }) {
  if (!active || !payload || !payload.length) return null
  const data = payload[0]?.payload
  if (!data) return null

  return (
    <div className="rounded-2xl border border-white/15 bg-[#0b0e12]/95 p-4 shadow-2xl backdrop-blur-md min-w-[220px]">
      <div className="flex items-center justify-between gap-3 border-b border-white/10 pb-2">
        <div>
          <span className="font-mono text-xs font-bold text-emerald-400">
            {data.label}
          </span>
          <p className="text-[11px] text-zinc-400">
            {data.date} · {data.station}
          </p>
        </div>
        <span className="font-mono text-xs font-black text-white">
          ₹{data.amountSpent}
        </span>
      </div>

      <div className="mt-3 space-y-1.5 text-xs font-mono">
        <div className="flex justify-between text-zinc-400">
          <span>Fuel Volume:</span>
          <strong className="text-white">{data.liters} L</strong>
        </div>
        <div className="flex justify-between text-zinc-400">
          <span>Fuel Rate:</span>
          <strong className="text-zinc-200">₹{data.pricePerLiter} / L</strong>
        </div>
        <div className="flex justify-between text-zinc-400">
          <span>Odometer:</span>
          <strong className="text-zinc-200">{data.odometer} km</strong>
        </div>
      </div>
    </div>
  )
}

/**
 * Custom Tooltip for Distance
 */
function DistanceTooltip({ active, payload }) {
  if (!active || !payload || !payload.length) return null
  const data = payload[0]?.payload
  if (!data) return null

  return (
    <div className="rounded-2xl border border-white/15 bg-[#0b0e12]/95 p-4 shadow-2xl backdrop-blur-md min-w-[220px]">
      <div className="flex items-center justify-between gap-3 border-b border-white/10 pb-2">
        <span className="font-mono text-xs font-bold text-sky-400">
          {data.label}
        </span>
        <span className="text-xs text-zinc-400">{data.date}</span>
      </div>

      <div className="mt-3 space-y-1.5 text-xs font-mono">
        <div className="flex justify-between text-zinc-400">
          <span>Total Distance:</span>
          <strong className="text-sky-300">+{data.cumulativeDistance} km</strong>
        </div>
        <div className="flex justify-between text-zinc-400">
          <span>Trip Interval:</span>
          <strong className="text-white">+{data.tripDistance} km</strong>
        </div>
        <div className="flex justify-between text-zinc-400">
          <span>Odometer Reading:</span>
          <strong className="text-white">{data.odometer} km</strong>
        </div>
      </div>
    </div>
  )
}

export default function FuelAnalyticsGraph({ fuelRefills = [] }) {
  // Graph Mode: 'efficiency' (km/L) | 'cost' (₹ & L) | 'distance' (km) | 'table'
  const [activeMode, setActiveMode] = useState('efficiency')

  // Comprehensive Mathematical Engine
  const { tripRecords, chartData, metrics, sortedRefills } = useMemo(() => {
    const list = [...(fuelRefills || [])].sort((a, b) => {
      const dateA = String(a.refillDate || '')
      const dateB = String(b.refillDate || '')
      if (dateA !== dateB) return dateA.localeCompare(dateB)
      return (Number(a.odometerKm) || 0) - (Number(b.odometerKm) || 0)
    })

    if (list.length === 0) {
      return {
        sortedRefills: [],
        tripRecords: [],
        chartData: [],
        metrics: {
          avgMileage: 0,
          bestMileage: 0,
          latestMileage: 0,
          avgCostPerKm: 0,
          totalDistance: 0,
          totalLiters: 0,
          totalSpend: 0,
          tankToTankCount: 0,
        },
      }
    }

    const records = []
    let cumulativeDistance = 0
    let cumulativeLitersAfterBaseline = 0
    let cumulativeSpendAfterBaseline = 0
    let lastFullTankIdx = list[0].fuelFillType === 'Full Tank' ? 0 : -1

    for (let i = 0; i < list.length; i++) {
      const curr = list[i]
      const currOdo = Number(curr.odometerKm) || 0
      const liters = Number(curr.liters) || 0
      const spend = Number(curr.amountSpent) || 0
      const pricePerL =
        Number(curr.pricePerLiter) || (liters > 0 ? spend / liters : 0)
      const fillType = curr.fuelFillType || 'Full Tank'

      let tripDistance = 0
      let tripMileage = 0
      let costPerKm = 0
      let isTankToTank = false

      if (i > 0) {
        const prev = list[i - 1]
        const prevOdo = Number(prev.odometerKm) || 0
        tripDistance = Math.max(0, currOdo - prevOdo)
        cumulativeDistance += tripDistance
        cumulativeLitersAfterBaseline += liters
        cumulativeSpendAfterBaseline += spend

        // Tank-to-Tank calculation
        if (prev.fuelFillType === 'Full Tank' && fillType === 'Full Tank') {
          isTankToTank = true
          tripMileage = liters > 0 ? Number((tripDistance / liters).toFixed(2)) : 0
        } else if (fillType === 'Full Tank' && lastFullTankIdx >= 0) {
          // Span from last full tank across partial top-ups
          let spanLiters = 0
          for (let k = lastFullTankIdx + 1; k <= i; k++) {
            spanLiters += Number(list[k].liters) || 0
          }
          const spanDist = currOdo - Number(list[lastFullTankIdx].odometerKm || 0)
          if (spanLiters > 0 && spanDist > 0) {
            tripMileage = Number((spanDist / spanLiters).toFixed(2))
            isTankToTank = true
          }
        } else {
          // Partial fill: estimate trip ratio
          tripMileage =
            liters > 0 && tripDistance > 0
              ? Number((tripDistance / liters).toFixed(2))
              : 0
        }

        costPerKm =
          tripDistance > 0 && spend > 0
            ? Number((spend / tripDistance).toFixed(2))
            : 0

        if (fillType === 'Full Tank') {
          lastFullTankIdx = i
        }
      } else if (fillType === 'Full Tank') {
        lastFullTankIdx = 0
      }

      const dateLabel = curr.refillDate
        ? new Date(curr.refillDate + 'T00:00:00Z').toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            timeZone: 'UTC',
          })
        : `Refill #${i + 1}`

      records.push({
        id: curr.id,
        index: i + 1,
        refillNumber: i + 1,
        date: curr.refillDate || '—',
        dateLabel,
        station: curr.stationName || 'Station',
        location: curr.location || '',
        odometer: currOdo,
        prevOdometer: i > 0 ? Number(list[i - 1].odometerKm) || 0 : currOdo,
        tripDistance,
        cumulativeDistance,
        liters,
        amountSpent: spend,
        pricePerLiter: Number(pricePerL.toFixed(2)),
        tripMileage,
        costPerKm,
        isTankToTank,
        fillType,
        isBaseline: i === 0,
      })
    }

    // Chart data includes trips where distance progressed
    const chartPoints = records.slice(1).map((r) => ({
      ...r,
      label: `Trip #${r.refillNumber - 1}`,
      mileageDisplay: r.tripMileage > 0 ? r.tripMileage : null,
      spendDisplay: r.amountSpent,
      litersDisplay: r.liters,
      tripKmDisplay: r.tripDistance,
      costPerKmDisplay: r.costPerKm > 0 ? r.costPerKm : null,
    }))

    // Global Telemetry Metrics
    const tankToTankRecords = records.filter(
      (r) => r.isTankToTank && r.tripMileage > 0,
    )
    const validMileages = records
      .filter((r) => r.tripMileage > 0)
      .map((r) => r.tripMileage)

    const bestMileage =
      validMileages.length > 0 ? Math.max(...validMileages) : 0
    const latestRecordWithMileage = [...records]
      .reverse()
      .find((r) => r.tripMileage > 0)
    const latestMileage = latestRecordWithMileage
      ? latestRecordWithMileage.tripMileage
      : 0

    // Average Mileage: Prioritize true Tank-to-Tank total, fallback to cumulative distance / liters
    let avgMileage = 0
    if (tankToTankRecords.length > 0) {
      const sumDist = tankToTankRecords.reduce((sum, r) => sum + r.tripDistance, 0)
      const sumLiters = tankToTankRecords.reduce((sum, r) => sum + r.liters, 0)
      avgMileage =
        sumLiters > 0 ? Number((sumDist / sumLiters).toFixed(2)) : 0
    } else if (cumulativeDistance > 0 && cumulativeLitersAfterBaseline > 0) {
      avgMileage = Number(
        (cumulativeDistance / cumulativeLitersAfterBaseline).toFixed(2),
      )
    }

    const totalDistance = cumulativeDistance
    const totalSpend = list.reduce(
      (sum, r) => sum + (Number(r.amountSpent) || 0),
      0,
    )
    const totalLiters = list.reduce(
      (sum, r) => sum + (Number(r.liters) || 0),
      0,
    )

    // Accurate cost per km based on tracked intervals
    let avgCostPerKm = 0
    if (tankToTankRecords.length > 0) {
      const sumTankSpend = tankToTankRecords.reduce((s, r) => s + r.amountSpent, 0)
      const sumTankDist = tankToTankRecords.reduce((s, r) => s + r.tripDistance, 0)
      avgCostPerKm =
        sumTankDist > 0 ? Number((sumTankSpend / sumTankDist).toFixed(2)) : 0
    } else if (totalDistance > 0 && cumulativeSpendAfterBaseline > 0) {
      avgCostPerKm = Number((cumulativeSpendAfterBaseline / totalDistance).toFixed(2))
    }

    return {
      sortedRefills: list,
      tripRecords: records,
      chartData: chartPoints,
      metrics: {
        avgMileage,
        bestMileage,
        latestMileage,
        avgCostPerKm,
        totalDistance,
        totalLiters: Number(totalLiters.toFixed(2)),
        totalSpend: Number(totalSpend.toFixed(2)),
        tankToTankCount: tankToTankRecords.length,
      },
    }
  }, [fuelRefills])

  // Max scale calculation for clean Y-axis headroom
  const maxMileageVal = useMemo(() => {
    const vals = chartData.map((d) => d.tripMileage).filter(Boolean)
    if (vals.length === 0) return 30
    return Math.max(25, Math.ceil(Math.max(...vals) * 1.3))
  }, [chartData])

  return (
    <div className="space-y-6 rounded-3xl border border-white/10 bg-[#0c0f14] p-5 shadow-2xl sm:p-7">
      {/* 1. Header with Mode Switcher */}
      <div className="flex flex-col gap-4 border-b border-white/8 pb-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-lime-400 text-zinc-950 font-black shadow-[0_0_14px_rgba(163,230,53,0.35)]">
              <BarChart3 className="h-4 w-4 stroke-[2.5]" />
            </span>
            <div>
              <h3 className="text-lg font-black tracking-tight text-white sm:text-xl">
                Fuel Efficiency & Consumption Analytics
              </h3>
              <p className="text-xs text-zinc-400">
                Accurate tank-to-tank telemetry, trip fuel efficiency, and running cost per km
              </p>
            </div>
          </div>
        </div>

        {/* View Switcher Tabs (Unified Shape & Subtle Active Indicator) */}
        <div className="flex flex-wrap items-center gap-1.5 rounded-xl border border-white/10 bg-[#12161d] p-1.5">
          <button
            type="button"
            onClick={() => setActiveMode('efficiency')}
            className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold transition-all ${
              activeMode === 'efficiency'
                ? 'border border-white/20 bg-white/12 text-white shadow-sm'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Zap className="h-3.5 w-3.5 text-lime-400" />
            <span>Mileage (km/L)</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveMode('cost')}
            className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold transition-all ${
              activeMode === 'cost'
                ? 'border border-white/20 bg-white/12 text-white shadow-sm'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <IndianRupee className="h-3.5 w-3.5 text-emerald-400" />
            <span>Spend & Liters</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveMode('distance')}
            className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold transition-all ${
              activeMode === 'distance'
                ? 'border border-white/20 bg-white/12 text-white shadow-sm'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Compass className="h-3.5 w-3.5 text-sky-400" />
            <span>Distance (km)</span>
          </button>
        </div>
      </div>

      {/* 2. Key Telemetry Strip */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-4">
        {/* Card 1: Tank-to-Tank / Avg Mileage */}
        <div className="rounded-2xl border border-lime-400/30 bg-gradient-to-br from-lime-400/10 via-[#12161c] to-[#0c0f12] p-4 shadow-lg">
          <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-lime-400">
            <span>Average Mileage</span>
            <span className="rounded-full bg-lime-400/10 px-2 py-0.5 text-[9px] font-bold text-lime-300">
              {metrics.tankToTankCount > 0 ? 'Tank-to-Tank' : 'Estimated'}
            </span>
          </div>
          <p className="mt-2 font-mono text-2xl font-black text-white sm:text-3xl">
            {metrics.avgMileage > 0 ? metrics.avgMileage : '—'}
            <span className="text-xs font-semibold text-zinc-400 ml-1">km/L</span>
          </p>
          <p className="mt-1 text-[11px] text-zinc-400">
            Peak trip: <strong className="text-lime-300">{metrics.bestMileage > 0 ? `${metrics.bestMileage} km/L` : '—'}</strong>
          </p>
        </div>

        {/* Card 2: Running Cost per km */}
        <div className="rounded-2xl border border-white/8 bg-[#12161c] p-4 shadow-md">
          <span className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400">
            Running Cost
          </span>
          <p className="mt-2 font-mono text-2xl font-black text-emerald-400 sm:text-3xl">
            {metrics.avgCostPerKm > 0 ? `₹${metrics.avgCostPerKm}` : '—'}
            <span className="text-xs font-semibold text-zinc-400 ml-1">/km</span>
          </p>
          <p className="mt-1 text-[11px] text-zinc-400">Fuel expense per km driven</p>
        </div>

        {/* Card 3: Tracked Distance */}
        <div className="rounded-2xl border border-white/8 bg-[#12161c] p-4 shadow-md">
          <span className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400">
            Tracked Distance
          </span>
          <p className="mt-2 font-mono text-2xl font-black text-sky-400 sm:text-3xl">
            {metrics.totalDistance.toLocaleString('en-IN')}
            <span className="text-xs font-semibold text-zinc-400 ml-1">km</span>
          </p>
          <p className="mt-1 text-[11px] text-zinc-400">
            Across {chartData.length} recorded intervals
          </p>
        </div>

        {/* Card 4: Total Fuel & Spend */}
        <div className="rounded-2xl border border-white/8 bg-[#12161c] p-4 shadow-md">
          <span className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400">
            Total Fuel Pumped
          </span>
          <p className="mt-2 font-mono text-2xl font-black text-amber-300 sm:text-3xl">
            {metrics.totalLiters}{' '}
            <span className="text-xs font-semibold text-zinc-400">L</span>
          </p>
          <p className="mt-1 text-[11px] text-zinc-400">
            ₹{Math.round(metrics.totalSpend).toLocaleString('en-IN')} all-time spend
          </p>
        </div>
      </div>

      {/* Insufficient Data State */}
      {sortedRefills.length < 2 && (
        <div className="rounded-2xl border border-amber-400/30 bg-amber-400/10 p-5 text-amber-300">
          <div className="flex items-start gap-3">
            <Info className="h-5 w-5 shrink-0 text-amber-400" />
            <div>
              <h4 className="text-sm font-bold text-white">
                Requires At Least 2 Fuel Refills for Trip Mileage Analysis
              </h4>
              <p className="mt-1 text-xs text-amber-200/90 leading-relaxed">
                You have recorded {sortedRefills.length}{' '}
                {sortedRefills.length === 1 ? 'refill' : 'refills'}. Mileage is measured by
                dividing the odometer distance between refills by the fuel consumed.
                Log your next refill to unlock exact km/L efficiency charts.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 3. CHART VIEW 1: MILEAGE EFFICIENCY (km/L) */}
      {activeMode === 'efficiency' && chartData.length > 0 && (
        <div className="space-y-4 rounded-2xl border border-white/8 bg-[#090c10] p-5 shadow-inner">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/6 pb-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-lime-400 shadow-[0_0_8px_#a3e635]" />
                <h4 className="text-base font-extrabold text-white">
                  Trip-by-Trip Fuel Efficiency (km/L)
                </h4>
              </div>
              <p className="mt-0.5 text-xs text-zinc-400">
                Distance Traveled (km) ÷ Liters Filled (L) per refill milestone
              </p>
            </div>

            <div className="flex items-center gap-3 text-xs font-mono">
              <span className="flex items-center gap-1.5 rounded-full border border-lime-400/30 bg-lime-400/10 px-3 py-1 font-bold text-lime-300">
                <Sparkles className="h-3 w-3" />
                Latest: {metrics.latestMileage > 0 ? `${metrics.latestMileage} km/L` : '—'}
              </span>
              {metrics.avgMileage > 0 && (
                <span className="hidden sm:inline-block text-zinc-400">
                  Avg Benchmark: <strong className="text-zinc-200">{metrics.avgMileage} km/L</strong>
                </span>
              )}
            </div>
          </div>

          <div className="h-72 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={chartData}
                margin={{ top: 15, right: 15, left: -10, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="mileageLimeGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#a3e635" stopOpacity={0.45} />
                    <stop offset="95%" stopColor="#a3e635" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#22272e" vertical={false} />
                <XAxis
                  dataKey="dateLabel"
                  tick={{ fill: '#a1a1aa', fontSize: 11, fontWeight: 600 }}
                  axisLine={{ stroke: '#3f3f46' }}
                  tickLine={false}
                />
                <YAxis
                  domain={[0, maxMileageVal]}
                  tick={{ fill: '#a3e635', fontSize: 11, fontWeight: 700 }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(val) => `${val} km/L`}
                />
                <Tooltip content={<MileageTooltip />} />
                {metrics.avgMileage > 0 && (
                  <ReferenceLine
                    y={metrics.avgMileage}
                    stroke="#a3e635"
                    strokeDasharray="4 4"
                    strokeOpacity={0.6}
                    label={{
                      value: `Avg: ${metrics.avgMileage}`,
                      fill: '#a3e635',
                      fontSize: 10,
                      position: 'insideTopRight',
                    }}
                  />
                )}
                <Area
                  type="monotone"
                  dataKey="tripMileage"
                  name="Efficiency (km/L)"
                  stroke="#a3e635"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#mileageLimeGradient)"
                  dot={{ r: 5, fill: '#a3e635', stroke: '#090c10', strokeWidth: 2 }}
                  activeDot={{ r: 7, fill: '#ffffff', stroke: '#a3e635', strokeWidth: 3 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* 4. CHART VIEW 2: SPEND & LITERS */}
      {activeMode === 'cost' && chartData.length > 0 && (
        <div className="space-y-4 rounded-2xl border border-white/8 bg-[#090c10] p-5 shadow-inner">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/6 pb-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_8px_#10b981]" />
                <h4 className="text-base font-extrabold text-white">
                  Refill Expense (₹) & Volume (Liters)
                </h4>
              </div>
              <p className="mt-0.5 text-xs text-zinc-400">
                Direct expenditure and fuel liters pumped per transaction
              </p>
            </div>
            <div className="font-mono text-xs text-zinc-400">
              Total Spent: <strong className="text-emerald-300">₹{metrics.totalSpend}</strong>
            </div>
          </div>

          <div className="h-72 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart
                data={chartData}
                margin={{ top: 15, right: 15, left: 0, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#22272e" vertical={false} />
                <XAxis
                  dataKey="dateLabel"
                  tick={{ fill: '#a1a1aa', fontSize: 11, fontWeight: 600 }}
                  axisLine={{ stroke: '#3f3f46' }}
                  tickLine={false}
                />
                {/* Left Axis: Cost (₹) */}
                <YAxis
                  yAxisId="cost"
                  tick={{ fill: '#10b981', fontSize: 11, fontWeight: 700 }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(val) => `₹${val}`}
                />
                {/* Right Axis: Liters */}
                <YAxis
                  yAxisId="liters"
                  orientation="right"
                  tick={{ fill: '#38bdf8', fontSize: 11, fontWeight: 700 }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(val) => `${val} L`}
                />
                <Tooltip content={<CostTooltip />} />
                <Legend
                  wrapperStyle={{ paddingTop: 10, fontSize: 11 }}
                  formatter={(val) => <span className="text-zinc-300 font-semibold">{val}</span>}
                />
                <Bar
                  yAxisId="cost"
                  dataKey="amountSpent"
                  name="Amount Spent (₹)"
                  fill="#10b981"
                  radius={[6, 6, 0, 0]}
                  barSize={24}
                />
                <Line
                  yAxisId="liters"
                  type="monotone"
                  dataKey="liters"
                  name="Fuel Volume (L)"
                  stroke="#38bdf8"
                  strokeWidth={3}
                  dot={{ r: 5, fill: '#38bdf8', stroke: '#090c10', strokeWidth: 2 }}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* 5. CHART VIEW 3: DISTANCE & ODOMETER (km) */}
      {activeMode === 'distance' && chartData.length > 0 && (
        <div className="space-y-4 rounded-2xl border border-white/8 bg-[#090c10] p-5 shadow-inner">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/6 pb-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-sky-400 shadow-[0_0_8px_#38bdf8]" />
                <h4 className="text-base font-extrabold text-white">
                  Odometer Progression & Interval Distances
                </h4>
              </div>
              <p className="mt-0.5 text-xs text-zinc-400">
                Cumulative kilometers traveled from baseline fuel entry
              </p>
            </div>
            <div className="font-mono text-xs text-sky-300 font-bold">
              Total Tracked: +{metrics.totalDistance} km
            </div>
          </div>

          <div className="h-72 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={chartData}
                margin={{ top: 15, right: 15, left: -5, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="distanceSkyGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#38bdf8" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#22272e" vertical={false} />
                <XAxis
                  dataKey="dateLabel"
                  tick={{ fill: '#a1a1aa', fontSize: 11, fontWeight: 600 }}
                  axisLine={{ stroke: '#3f3f46' }}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fill: '#38bdf8', fontSize: 11, fontWeight: 700 }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(val) => `${val} km`}
                />
                <Tooltip content={<DistanceTooltip />} />
                <Area
                  type="monotone"
                  dataKey="cumulativeDistance"
                  name="Cumulative Distance (km)"
                  stroke="#38bdf8"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#distanceSkyGradient)"
                  dot={{ r: 5, fill: '#38bdf8', stroke: '#090c10', strokeWidth: 2 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* 6. High-Precision Trip Interval Ledger Table */}
      {tripRecords.length > 0 && (
        <div className="overflow-hidden rounded-2xl border border-white/8 bg-[#090c10]">
          <div className="flex items-center justify-between border-b border-white/6 px-4 py-3">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-lime-400" />
              <h5 className="text-xs font-black uppercase tracking-wider text-white">
                Trip-by-Trip Fuel Consumption Breakdown
              </h5>
            </div>
            <span className="text-[11px] text-zinc-400 font-mono">
              {tripRecords.length} records · {metrics.tankToTankCount} tank-to-tank verified
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-white/6 bg-white/3 font-semibold uppercase tracking-wider text-zinc-400">
                <tr>
                  <th className="py-2.5 px-4">Refill</th>
                  <th className="py-2.5 px-4">Date</th>
                  <th className="py-2.5 px-4">Station & Fill</th>
                  <th className="py-2.5 px-4">Odometer Interval</th>
                  <th className="py-2.5 px-4">Trip Distance</th>
                  <th className="py-2.5 px-4">Fuel Added</th>
                  <th className="py-2.5 px-4">Cost (₹)</th>
                  <th className="py-2.5 px-4 text-right">Mileage (km/L)</th>
                  <th className="py-2.5 px-4 text-right">Running Cost</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/4 font-mono text-zinc-300">
                {tripRecords.map((row) => {
                  const isBest =
                    row.tripMileage > 0 && row.tripMileage === metrics.bestMileage

                  return (
                    <tr
                      key={row.id}
                      className={`transition-colors hover:bg-white/3 ${
                        isBest ? 'bg-lime-400/5' : ''
                      }`}
                    >
                      <td className="py-3 px-4 font-bold text-white">
                        #{row.refillNumber}
                        {row.isBaseline && (
                          <span className="ml-1.5 rounded bg-zinc-800 px-1.5 py-0.5 text-[9px] font-sans font-bold text-zinc-400">
                            Baseline
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-zinc-400 font-sans">{row.date}</td>
                      <td className="py-3 px-4">
                        <div className="font-sans font-semibold text-white">
                          {row.station}
                        </div>
                        <span
                          className={`inline-block rounded px-1.5 py-0.2 text-[9px] font-bold uppercase tracking-wider ${
                            row.isTankToTank
                              ? 'border border-lime-400/30 bg-lime-400/10 text-lime-300'
                              : 'border border-amber-400/30 bg-amber-400/10 text-amber-300'
                          }`}
                        >
                          {row.isTankToTank ? 'Tank-to-Tank' : row.fillType}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-zinc-400">
                        {row.isBaseline ? (
                          <span>{row.odometer} km</span>
                        ) : (
                          <span>
                            {row.prevOdometer} → <strong className="text-white">{row.odometer}</strong> km
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 font-bold text-sky-400">
                        {row.isBaseline ? '—' : `+${row.tripDistance} km`}
                      </td>
                      <td className="py-3 px-4">{row.liters} L</td>
                      <td className="py-3 px-4 text-zinc-300">₹{row.amountSpent}</td>
                      <td className="py-3 px-4 text-right">
                        {row.isBaseline ? (
                          <span className="text-zinc-600">—</span>
                        ) : row.tripMileage > 0 ? (
                          <span
                            className={`inline-flex items-center gap-1 rounded-lg border px-2.5 py-1 font-bold ${
                              isBest
                                ? 'border-lime-400 bg-lime-400/20 text-lime-300 shadow-[0_0_10px_rgba(163,230,53,0.2)]'
                                : 'border-lime-400/30 bg-lime-400/10 text-lime-400'
                            }`}
                          >
                            {row.tripMileage} km/L
                            {isBest && <Sparkles className="h-3 w-3 text-lime-300" />}
                          </span>
                        ) : (
                          <span className="text-zinc-600">—</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right">
                        {row.isBaseline || row.costPerKm <= 0 ? (
                          <span className="text-zinc-600">—</span>
                        ) : (
                          <span className="text-zinc-300">
                            ₹{row.costPerKm}/km
                          </span>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
