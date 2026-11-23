import {
  Activity,
  ArrowDownUp,
  BatteryCharging,
  ChevronDown,
  ChevronUp,
  CircleDot,
  Cog,
  Disc,
  Droplet,
  Droplets,
  Link,
  Link2,
  Settings,
  Sparkles,
  Thermometer,
  Wind,
  Zap,
} from 'lucide-react'
import { useMemo, useState } from 'react'
import { useAnimatedNumber } from '../../hooks/useAnimatedNumber'

const ITEM_ICONS = {
  engine_oil: Droplets,
  chain_lube: Link2,
  air_filter: Wind,
  front_tyre: CircleDot,
  rear_tyre: CircleDot,
  battery: BatteryCharging,
  brake_front: Disc,
  brake_rear: Disc,
  clutch_plate: Cog,
  spark_plug: Zap,
  coolant: Thermometer,
  chain_replacement: Link,
  sprocket_replacement: Settings,
  brake_fluid_front: Droplet,
  brake_fluid_rear: Droplet,
  fork_oil_front: ArrowDownUp,
  rear_suspension: Activity,
  washing: Sparkles,
}

function getHealthMeta(percent, remainingKm) {
  if (remainingKm <= 0) {
    return {
      barColor: 'bg-rose-500 shadow-[0_0_12px_rgba(244,63,94,0.6)]',
      badgeClass: 'bg-rose-500/15 text-rose-300 ring-rose-500/30',
      statusText: 'Overdue',
    }
  }
  if (percent >= 80) {
    return {
      barColor: 'bg-amber-400 shadow-[0_0_12px_rgba(251,191,36,0.5)]',
      badgeClass: 'bg-amber-400/15 text-amber-300 ring-amber-400/30',
      statusText: 'Due Soon',
    }
  }
  return {
    barColor: 'bg-lime-400 shadow-[0_0_12px_rgba(163,230,53,0.5)]',
    badgeClass: 'bg-lime-400/15 text-lime-300 ring-lime-400/30',
    statusText: 'Good',
  }
}

function MaintenanceItemCard({ item, currentOdo }) {
  const Icon = ITEM_ICONS[item.itemKey] || Droplets
  const odoNum = Math.max(0, Number(currentOdo) || 0)
  const itemLastOdo = Number(item.lastServiceOdo) || 0
  const effectiveLastOdo = itemLastOdo > odoNum ? 0 : itemLastOdo
  const rawPassedKm = Math.max(0, odoNum - effectiveLastOdo)
  const interval = Math.max(1, Number(item.intervalKm) || 1000)
  const rawRemainingKm = interval - rawPassedKm
  const percentPassed = Math.min(
    100,
    Math.max(0, Math.round((rawPassedKm / interval) * 100)),
  )
  const meta = getHealthMeta(percentPassed, rawRemainingKm)

  // 60fps smoothly animated counting numbers for passed and remaining km
  const animatedPassed = useAnimatedNumber(rawPassedKm, 750)
  const animatedRemaining = useAnimatedNumber(rawRemainingKm, 750)

  return (
    <div className="flex flex-col justify-between rounded-2xl border border-white/8 bg-[#12161c] p-4.5 transition-all duration-300 hover:border-lime-400/30 hover:shadow-[0_0_24px_rgba(163,230,53,0.06)]">
      <div>
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-lime-400/10 text-lime-400 ring-1 ring-lime-400/20">
              <Icon className="h-4 w-4" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-zinc-100">
                {item.label}
              </h4>
              <p className="text-[11px] text-zinc-500">
                Limit: {interval.toLocaleString('en-IN')} km
              </p>
            </div>
          </div>

          <span
            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ring-1 ring-inset ${meta.badgeClass}`}
          >
            {meta.statusText}
          </span>
        </div>

        {/* Animated Progress Bar (Smooth Width Transition & Glow) */}
        <div className="mt-4">
          <div className="relative h-2.5 w-full overflow-hidden rounded-full bg-black/60 p-0.5 ring-1 ring-white/10">
            <div
              className={`h-full rounded-full will-change-[width] ${meta.barColor}`}
              style={{
                width: `${percentPassed}%`,
                transition: 'width 1s cubic-bezier(0.16, 1, 0.3, 1)',
              }}
            />
          </div>

          <div className="mt-2.5 flex items-center justify-between text-xs">
            <span className="text-zinc-400">
              <strong className="font-mono font-bold text-zinc-100">
                {animatedPassed.toLocaleString('en-IN')} km
              </strong>{' '}
              passed ({percentPassed}%)
            </span>
            <span
              className={`font-mono font-bold ${
                rawRemainingKm <= 0
                  ? 'text-rose-400'
                  : percentPassed >= 80
                    ? 'text-amber-300'
                    : 'text-lime-300'
              }`}
            >
              {rawRemainingKm > 0
                ? `${animatedRemaining.toLocaleString('en-IN')} km left`
                : `Overdue ${Math.abs(animatedRemaining).toLocaleString('en-IN')} km`}
            </span>
          </div>
        </div>
      </div>

      <div className="mt-3.5 flex items-center justify-between border-t border-white/6 pt-2.5 text-[11px] text-zinc-500">
        <span>
          Last at:{' '}
          <strong className="font-mono text-zinc-300">
            {effectiveLastOdo.toLocaleString('en-IN')} km
          </strong>
        </span>
        <span className="font-mono text-[10px] font-medium uppercase tracking-wider text-lime-400/80">
          Monitored
        </span>
      </div>
    </div>
  )
}

export default function MaintenanceHealthCard({ items = [], currentOdo = 0 }) {
  const [showAllMobile, setShowAllMobile] = useState(false)

  // Prioritize Overdue and Due Soon items first
  const sortedItems = useMemo(() => {
    return [...items].sort((a, b) => {
      const odoNum = Number(currentOdo) || 0
      const aPassed = Math.max(0, odoNum - (Number(a.lastServiceOdo) || 0))
      const aRem = (Number(a.intervalKm) || 1000) - aPassed
      const bPassed = Math.max(0, odoNum - (Number(b.lastServiceOdo) || 0))
      const bRem = (Number(b.intervalKm) || 1000) - bPassed
      return aRem - bRem
    })
  }, [items, currentOdo])

  return (
    <section className="rounded-3xl border border-white/10 bg-[#0d1014] p-4 shadow-2xl sm:p-7">
      <div className="flex flex-col gap-2 border-b border-white/8 pb-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-base sm:text-lg font-extrabold tracking-tight text-white">
            Important Maintenance Health
          </h3>
          <p className="mt-0.5 text-xs text-zinc-400">
            Wear progress compared against current odometer (
            <span className="font-mono font-bold text-lime-300">
              {Number(currentOdo).toLocaleString('en-IN')} km
            </span>
            ) across all {items.length} key components.
          </p>
        </div>

        <div className="flex items-center gap-3 text-[11px] font-semibold text-zinc-400">
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-lime-400 shadow-[0_0_6px_#a3e635]" /> Good
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-amber-400 shadow-[0_0_6px_#fbbf24]" /> Due Soon
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-rose-500 shadow-[0_0_6px_#f43f5e]" /> Overdue
          </span>
        </div>
      </div>

      <div className="mt-4 sm:mt-5 grid grid-cols-1 gap-3 sm:gap-4 md:grid-cols-2 xl:grid-cols-3">
        {sortedItems.map((item, idx) => {
          // On mobile, hide items past the first 3 unless showAllMobile is true
          const isHiddenOnMobile = !showAllMobile && idx >= 3
          return (
            <div
              key={item.itemKey}
              className={isHiddenOnMobile ? 'hidden md:block' : 'block'}
            >
              <MaintenanceItemCard
                item={item}
                currentOdo={currentOdo}
              />
            </div>
          )
        })}
      </div>

      {sortedItems.length > 3 && (
        <div className="mt-4 pt-3 border-t border-white/6 text-center md:hidden">
          <button
            type="button"
            onClick={() => setShowAllMobile(!showAllMobile)}
            className="inline-flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-xs font-bold text-lime-400 transition hover:bg-white/10"
          >
            {showAllMobile ? (
              <>
                <ChevronUp className="h-3.5 w-3.5" />
                <span>Show Top Priority Only</span>
              </>
            ) : (
              <>
                <ChevronDown className="h-3.5 w-3.5" />
                <span>View All ({sortedItems.length}) Components</span>
              </>
            )}
          </button>
        </div>
      )}
    </section>
  )
}
