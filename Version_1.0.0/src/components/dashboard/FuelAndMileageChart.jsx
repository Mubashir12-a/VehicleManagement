import { Calendar, Layers } from 'lucide-react'
import { useMemo, useState } from 'react'
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import RotaryYearDial from '../common/RotaryYearDial'

const MONTH_NAMES = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
]

const FULL_MONTH_NAMES = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
]

function parseYearFromDate(dateStr) {
  if (!dateStr) return null
  const str = String(dateStr).trim()
  const matchIso = str.match(/^(\d{4})/)
  if (matchIso) {
    const y = parseInt(matchIso[1], 10)
    if (!isNaN(y) && y >= 1990 && y <= 2100) return y
  }
  const matchDmy = str.match(/(\d{4})$/)
  if (matchDmy) {
    const y = parseInt(matchDmy[1], 10)
    if (!isNaN(y) && y >= 1990 && y <= 2100) return y
  }
  const d = new Date(str)
  if (!isNaN(d.getTime())) {
    return d.getFullYear()
  }
  return null
}

function CustomTooltip({ active, payload }) {
  if (active && payload && payload.length) {
    const item = payload[0].payload
    return (
      <div className="rounded-2xl border border-white/10 bg-[#12161c] p-3.5 shadow-2xl backdrop-blur-md">
        <p className="font-bold text-white text-xs">{item.fullLabel || item.label}</p>
        <div className="mt-1.5 flex items-baseline gap-1.5">
          <span className="font-mono text-xl font-black text-lime-400">
            {Number(item.distance || 0).toLocaleString('en-IN')}
          </span>
          <span className="text-xs font-semibold text-zinc-400">km traveled</span>
        </div>
        {item.refillCount > 0 ? (
          <p className="mt-1 text-[11px] font-medium text-zinc-400">
            Recorded across {item.refillCount} refuel{item.refillCount > 1 ? 's' : ''}
          </p>
        ) : (
          <p className="mt-1 text-[11px] text-zinc-500">
            No refills logged in this period
          </p>
        )}
      </div>
    )
  }
  return null
}

function calculateDistanceTrends(
  fuelRefills = [],
  vehicle,
  viewMode,
  selectedYearOverride,
  fallbackData,
) {
  // 1. Sort refills chronologically ascending (oldest to newest)
  const sorted = [...(fuelRefills || [])].sort((a, b) => {
    const tA = new Date(a.refillDate).getTime() || 0
    const tB = new Date(b.refillDate).getTime() || 0
    if (tA !== tB) return tA - tB
    return (Number(a.odometerKm) || 0) - (Number(b.odometerKm) || 0)
  })

  // 2. Compute delta distance between consecutive refuel events
  let previousOdo = 0
  const deltas = []
  sorted.forEach((refill, index) => {
    const curOdo = Number(refill.odometerKm) || 0
    let delta = 0
    if (index === 0) {
      delta = curOdo
    } else {
      delta = Math.max(0, curOdo - previousOdo)
    }
    previousOdo = Math.max(previousOdo, curOdo)
    deltas.push({
      dateStr: refill.refillDate,
      delta,
      refill,
    })
  })

  // 3. Dynamically detect vehicle purchase year through current year
  const now = new Date()
  const curYear = now.getFullYear()
  const parsedPurchaseYear = parseYearFromDate(vehicle?.purchaseDate)
  const earliestRefillYear =
    sorted.length > 0 ? parseYearFromDate(sorted[0].refillDate) : null

  const startYear = Math.min(
    parsedPurchaseYear || curYear,
    earliestRefillYear || curYear,
    curYear,
  )

  const yList = []
  for (let y = startYear; y <= curYear; y++) {
    yList.push(y)
  }

  const effectiveYear =
    selectedYearOverride && yList.includes(selectedYearOverride)
      ? selectedYearOverride
      : curYear

  // 4. Build chart data based on active view mode
  let result = []
  let totalRefills = 0

  if (viewMode === 'monthly') {
    // Exactly 12 months for the selected year
    const monthDistances = Array(12).fill(0)
    const monthRefillCounts = Array(12).fill(0)

    deltas.forEach(({ dateStr, delta }) => {
      const d = new Date(dateStr + 'T00:00:00')
      if (!isNaN(d.getTime()) && d.getFullYear() === effectiveYear) {
        const m = d.getMonth()
        monthDistances[m] += delta
        monthRefillCounts[m] += 1
        totalRefills += 1
      }
    })

    result = MONTH_NAMES.map((name, idx) => ({
      label: name,
      fullLabel: `${FULL_MONTH_NAMES[idx]} ${effectiveYear}`,
      distance: monthDistances[idx],
      refillCount: monthRefillCounts[idx],
    }))
  } else {
    // Yearly View: Each year from startYear to curYear
    result = yList.map((y) => {
      let yTotal = 0
      let yCount = 0
      deltas.forEach(({ dateStr, delta }) => {
        const d = new Date(dateStr + 'T00:00:00')
        if (!isNaN(d.getTime()) && d.getFullYear() === y) {
          yTotal += delta
          yCount += 1
          totalRefills += 1
        }
      })
      return {
        label: String(y),
        fullLabel: `Year ${y}`,
        distance: yTotal,
        refillCount: yCount,
      }
    })
  }

  // Fallback if no refills exist
  if (deltas.length === 0 && fallbackData && fallbackData.length > 0) {
    result = fallbackData.map((item) => ({
      label: item.month,
      fullLabel: item.month,
      distance: Number(item.mileage) || 0,
      refillCount: 0,
    }))
  }

  const totalDist = result.reduce((sum, item) => sum + item.distance, 0)
  let peak = { label: '—', distance: 0, fullLabel: '—' }
  result.forEach((item) => {
    if (item.distance > peak.distance) {
      peak = item
    }
  })

  return {
    yearsList: yList, // Ascending for rotation dial [startYear -> currentYear]
    currentYear: curYear,
    startYear,
    activeYear: effectiveYear,
    chartData: result,
    totalDistance: totalDist,
    totalRefillCount: totalRefills,
    peakItem: peak,
  }
}

export default function FuelAndMileageChart({
  fuelRefills = [],
  vehicle,
  fallbackData,
}) {
  // View mode: 'monthly' | 'yearly'
  const [viewMode, setViewMode] = useState('monthly')
  const [selectedYearOverride, setSelectedYearOverride] = useState(null)

  const {
    yearsList,
    startYear,
    currentYear,
    activeYear,
    chartData,
    totalDistance,
    peakItem,
  } = useMemo(
    () =>
      calculateDistanceTrends(
        fuelRefills,
        vehicle,
        viewMode,
        selectedYearOverride,
        fallbackData,
      ),
    [fuelRefills, vehicle, viewMode, selectedYearOverride, fallbackData],
  )

  return (
    <div className="flex flex-col space-y-4 rounded-3xl border border-white/10 bg-[#0d1014] p-5 shadow-2xl sm:p-6">
      {/* Top Header: Title & Info on Left, Controls & Interactive Rotary Dial on Right */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-white/6 pb-4">
        <div>
          <div className="flex flex-wrap items-center gap-2.5">
            <h3 className="text-lg font-bold tracking-tight text-white sm:text-xl">
              {viewMode === 'monthly'
                ? `Monthly Distance Trend (${activeYear})`
                : 'Yearly Distance Trend'}
            </h3>
            <span className="rounded-full border border-lime-400/25 bg-lime-400/10 px-2.5 py-0.5 font-mono text-[11px] font-bold text-lime-300 shadow-[0_0_10px_rgba(163,230,53,0.15)]">
              {totalDistance.toLocaleString('en-IN')} km
            </span>
          </div>
          <p className="mt-1 text-xs text-zinc-400">
            {viewMode === 'monthly'
              ? `Distance traveled in ${activeYear} across 12 months based on refuel logs.`
              : `Total distance traveled per year from vehicle purchase (${startYear}) to latest (${currentYear}).`}
            {peakItem.distance > 0 && ` • Peak: ${peakItem.label} (${peakItem.distance} km)`}
          </p>
        </div>

        {/* Header Right: Compact Mode Switcher + Interactive Rotary Year Dial */}
        <div className="flex flex-wrap items-center gap-3">
          {/* View Mode Switcher */}
          <div className="flex items-center rounded-2xl border border-white/10 bg-white/5 p-1 text-xs font-semibold">
            <button
              type="button"
              onClick={() => setViewMode('monthly')}
              className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 transition-all ${
                viewMode === 'monthly'
                  ? 'bg-lime-400 text-zinc-950 font-bold shadow-[0_0_12px_rgba(163,230,53,0.25)]'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Calendar className="h-3.5 w-3.5" />
              Monthly (12 Mo)
            </button>
            <button
              type="button"
              onClick={() => setViewMode('yearly')}
              className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 transition-all ${
                viewMode === 'yearly'
                  ? 'bg-lime-400 text-zinc-950 font-bold shadow-[0_0_12px_rgba(163,230,53,0.25)]'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Layers className="h-3.5 w-3.5" />
              Yearly
            </button>
          </div>

          {/* Rotary Dial & Year Control (Active when in Monthly Mode) */}
          {viewMode === 'monthly' && (
            <RotaryYearDial
              yearsList={yearsList}
              activeYear={activeYear}
              onSelectYear={setSelectedYearOverride}
            />
          )}
        </div>
      </div>

      {/* Chart Canvas with Smooth Wavy Spline */}
      <div className="h-72 w-full pt-1">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={chartData}
            margin={{ top: 12, right: 12, left: -4, bottom: 0 }}
          >
            <defs>
              <linearGradient id="wavyMileageGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#a3e635" stopOpacity={0.38} />
                <stop offset="60%" stopColor="#a3e635" stopOpacity={0.1} />
                <stop offset="100%" stopColor="#a3e635" stopOpacity={0} />
              </linearGradient>
            </defs>

            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#27272a"
              vertical={false}
            />

            <XAxis
              dataKey="label"
              tick={{ fill: '#71717a', fontSize: 11, fontWeight: 600 }}
              axisLine={false}
              tickLine={false}
            />

            <YAxis
              tick={{ fill: '#71717a', fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(value) =>
                value >= 1000 ? `${(value / 1000).toFixed(1)}k` : `${value}`
              }
            />

            <Tooltip content={<CustomTooltip />} />

            {/* Wavy Spline Area */}
            <Area
              type="monotone"
              dataKey="distance"
              stroke="#a3e635"
              strokeWidth={3}
              fill="url(#wavyMileageGradient)"
              dot={{
                r: 3.5,
                fill: '#a3e635',
                stroke: '#0d1014',
                strokeWidth: 2,
              }}
              activeDot={{
                r: 6.5,
                fill: '#a3e635',
                stroke: '#ffffff',
                strokeWidth: 2,
              }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
