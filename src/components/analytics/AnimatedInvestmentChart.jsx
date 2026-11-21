import {
  CheckCircle2,
  FileText,
  Fuel,
  Info,
  TrendingUp,
  Wrench,
} from 'lucide-react'
import { useState } from 'react'

const CATEGORY_COLORS = {
  Fuel: 'text-lime-400 bg-lime-400/10 border-lime-400/20',
  Documents: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20',
  Maintenance: 'text-amber-400 bg-amber-400/10 border-amber-400/20',
  Repairs: 'text-rose-400 bg-rose-400/10 border-rose-400/20',
  'Periodic Service': 'text-cyan-400 bg-cyan-400/10 border-cyan-400/20',
}

export default function AnimatedInvestmentChart({
  data = [],
  viewMode = 'monthly',
  selectedYear = 2026,
  onSelectPeriod,
  selectedPeriodLabel,
}) {
  const [hoveredItem, setHoveredItem] = useState(null)

  // Find max value to calibrate 100% chart height
  const maxCost = Math.max(...data.map((d) => d.totalCost || 0), 1)

  // Reference grid Y-ticks: 4 steps
  const yTicks = [
    maxCost,
    Math.round(maxCost * 0.75),
    Math.round(maxCost * 0.5),
    Math.round(maxCost * 0.25),
    0,
  ]

  const formatCurrency = (val) => {
    if (val >= 100000) return `₹${(val / 100000).toFixed(1)}L`
    if (val >= 1000) return `₹${(val / 1000).toFixed(val >= 10000 ? 0 : 1)}k`
    return `₹${val}`
  }

  const activeHover = hoveredItem || data.find((d) => d.label === selectedPeriodLabel) || null

  return (
    <div className="relative rounded-3xl border border-white/8 bg-[#12161c] p-5 shadow-2xl sm:p-7">
      {/* Inline styles for bottom-to-top rise animation & silky hover transitions */}
      <style>{`
        @keyframes riseUpBar {
          0% {
            transform: scaleY(0);
            opacity: 0.1;
          }
          100% {
            transform: scaleY(1);
            opacity: 1;
          }
        }
        .animate-rise-up {
          transform-origin: bottom;
          animation: riseUpBar 0.85s cubic-bezier(0.16, 1, 0.3, 1) both;
        }
        .smooth-bar {
          transition: transform 0.25s cubic-bezier(0.2, 0.8, 0.2, 1),
                      filter 0.25s ease,
                      box-shadow 0.25s ease,
                      opacity 0.25s ease;
          will-change: transform, filter, box-shadow;
        }
        .smooth-tag {
          transition: transform 0.2s cubic-bezier(0.2, 0.8, 0.2, 1),
                      opacity 0.2s ease,
                      background-color 0.2s ease;
        }
      `}</style>

      {/* Chart Top Header & Quick Legend */}
      <div className="flex flex-col justify-between gap-4 border-b border-white/6 pb-5 sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-2.5 w-2.5 rounded-full bg-lime-400 shadow-[0_0_10px_#a3e635]" />
            <h3 className="text-base font-bold text-white sm:text-lg">
              {viewMode === 'monthly'
                ? `Monthly Expenditure & Investment (${selectedYear})`
                : 'Yearly Total Investment & Expenditure'}
            </h3>
          </div>
          <p className="mt-1 text-xs text-zinc-400">
            {viewMode === 'monthly'
              ? 'Complete monthly breakdown across all 12 calendar months. Real money spent per month.'
              : 'Cumulative money invested per year combining all 12 calendar months.'}
          </p>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-2 text-[11px]">
          <span className="inline-flex items-center gap-1.5 rounded-lg border border-lime-400/20 bg-lime-400/10 px-2.5 py-1 font-semibold text-lime-300">
            <span className="h-2 w-2 rounded-full bg-lime-400" /> Total Money Invested
          </span>
          <span className="text-zinc-500">• Absolute Spending</span>
        </div>
      </div>

      {/* Main Chart Body */}
      <div className="relative mt-6 pt-8">
        {/* Y-Axis Reference Lines Background */}
        <div className="pointer-events-none absolute inset-x-0 bottom-10 top-8 flex flex-col justify-between text-[10px] font-mono text-zinc-600">
          {yTicks.map((tick, i) => (
            <div key={i} className="flex items-center gap-2">
              <span className="w-12 shrink-0 text-right font-medium">
                {formatCurrency(tick)}
              </span>
              <div className="h-px w-full border-b border-dashed border-white/6" />
            </div>
          ))}
        </div>

        {/* Bars Container with key for clean re-triggering animation on mode/year changes */}
        <div
          key={`${viewMode}-${selectedYear}-${data.length}`}
          className="relative z-10 ml-14 h-72 pb-10"
        >
          <div className="grid h-full w-full grid-flow-col auto-cols-fr items-end gap-1.5 sm:gap-3 lg:gap-4">
            {data.map((item, index) => {
              const cost = item.totalCost || 0
              const percent = maxCost > 0 ? (cost / maxCost) * 100 : 0
              const isSelected = selectedPeriodLabel === item.label
              const isHovered = hoveredItem?.label === item.label
              const hasData = cost > 0

              return (
                <div
                  key={item.label}
                  onClick={() => onSelectPeriod && onSelectPeriod(item)}
                  onMouseEnter={() => setHoveredItem(item)}
                  onMouseLeave={() => setHoveredItem(null)}
                  className="group relative flex h-full cursor-pointer flex-col items-center justify-end px-1"
                >
                  {/* Top Value Tag */}
                  <div
                    className={`smooth-tag pointer-events-none absolute -top-8 z-20 whitespace-nowrap rounded-md px-2 py-0.5 font-mono text-[10px] font-bold ${
                      hasData
                        ? isHovered || isSelected
                          ? 'scale-110 bg-lime-400 text-zinc-950 shadow-[0_0_12px_rgba(163,230,53,0.5)]'
                          : 'bg-black/75 text-lime-400 opacity-90'
                        : 'opacity-0'
                    }`}
                  >
                    {formatCurrency(cost)}
                  </div>

                  {/* Full Height Clickable/Hoverable Track */}
                  <div className="relative flex h-full w-full max-w-[48px] items-end justify-center rounded-t-xl bg-white/[0.02] p-0.5 transition-colors duration-200 group-hover:bg-white/[0.06]">
                    {/* Animated Fill Bar */}
                    <div
                      style={{
                        height: `${hasData ? Math.max(percent, 7) : 0}%`,
                        animationDelay: `${index * 40}ms`,
                      }}
                      className={`animate-rise-up smooth-bar relative w-full rounded-t-lg bg-gradient-to-t from-lime-600 via-lime-500 to-lime-400 ${
                        hasData
                          ? isHovered || isSelected
                            ? 'brightness-125 -translate-y-1 shadow-[0_0_24px_rgba(163,230,53,0.6)] ring-1 ring-lime-300'
                            : 'brightness-100 shadow-[0_0_10px_rgba(163,230,53,0.2)]'
                          : 'bg-transparent'
                      }`}
                    >
                      {/* Top glowing cap */}
                      {hasData && (
                        <div className="absolute inset-x-0 top-0 h-1 rounded-t-lg bg-white/70" />
                      )}
                    </div>

                    {/* Zero-state baseline indicator */}
                    {!hasData && (
                      <div className="h-1 w-2.5 rounded-full bg-zinc-800 transition-colors duration-200 group-hover:bg-zinc-600" />
                    )}
                  </div>

                  {/* X-Axis Label */}
                  <div className="absolute -bottom-8 flex flex-col items-center">
                    <span
                      className={`font-mono text-xs transition-colors duration-200 ${
                        isSelected || isHovered
                          ? 'font-bold text-lime-400 scale-105'
                          : hasData
                            ? 'font-semibold text-zinc-300'
                            : 'text-zinc-500'
                      }`}
                    >
                      {item.label}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Active Inspector Banner - Stable Height with Smooth Transitions */}
      <div className="mt-8 min-h-[90px] rounded-2xl border border-white/6 bg-black/40 p-4 transition-all duration-300">
        {activeHover ? (
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center animate-fadeIn">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-lime-400/30 bg-lime-400/10 text-lime-400 shadow-[0_0_16px_rgba(163,230,53,0.2)]">
                <TrendingUp className="h-5 w-5" />
              </div>
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">
                  {activeHover.fullLabel || activeHover.label}
                </span>
                <div className="flex items-baseline gap-2">
                  <span className="font-mono text-xl font-black text-lime-400 sm:text-2xl">
                    ₹{Number(activeHover.totalCost || 0).toLocaleString('en-IN')}
                  </span>
                  <span className="text-xs text-zinc-400">total invested</span>
                </div>
              </div>
            </div>

            {/* Category Breakdown Chips */}
            <div className="flex flex-wrap items-center gap-2 text-xs">
              {Number(activeHover.fuelCost) > 0 && (
                <span className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-1 font-semibold ${CATEGORY_COLORS.Fuel}`}>
                  <Fuel className="h-3 w-3" />
                  Fuel: ₹{Number(activeHover.fuelCost).toLocaleString('en-IN')}
                </span>
              )}
              {Number(activeHover.documentsCost) > 0 && (
                <span className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-1 font-semibold ${CATEGORY_COLORS.Documents}`}>
                  <FileText className="h-3 w-3" />
                  Docs/Insurance: ₹{Number(activeHover.documentsCost).toLocaleString('en-IN')}
                </span>
              )}
              {Number(activeHover.maintenanceCost) > 0 && (
                <span className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-1 font-semibold ${CATEGORY_COLORS.Maintenance}`}>
                  <Wrench className="h-3 w-3" />
                  Maintenance: ₹{Number(activeHover.maintenanceCost).toLocaleString('en-IN')}
                </span>
              )}
              {Number(activeHover.serviceCost) > 0 && (
                <span className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-1 font-semibold ${CATEGORY_COLORS['Periodic Service']}`}>
                  <CheckCircle2 className="h-3 w-3" />
                  Service: ₹{Number(activeHover.serviceCost).toLocaleString('en-IN')}
                </span>
              )}
              {Number(activeHover.repairsCost) > 0 && (
                <span className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-1 font-semibold ${CATEGORY_COLORS.Repairs}`}>
                  Repairs: ₹{Number(activeHover.repairsCost).toLocaleString('en-IN')}
                </span>
              )}
              {Number(activeHover.totalCost) === 0 && (
                <span className="text-xs text-zinc-500">
                  No expenditure recorded during this period
                </span>
              )}
            </div>
          </div>
        ) : (
          <div className="flex min-h-[58px] items-center gap-2 text-xs text-zinc-500">
            <Info className="h-4 w-4 text-zinc-400" />
            Hover over or click any bar above to inspect that specific month/year investment breakdown.
          </div>
        )}
      </div>
    </div>
  )
}
