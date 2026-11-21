import {
  Activity,
  ArrowDownUp,
  BatteryCharging,
  CircleDot,
  Cog,
  Disc,
  Droplet,
  Droplets,
  Filter,
  History,
  Link,
  Link2,
  Plus,
  Search,
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

const CATEGORY_MAP = {
  engine_oil: 'Fluids & Engine',
  coolant: 'Fluids & Engine',
  air_filter: 'Fluids & Engine',
  spark_plug: 'Fluids & Engine',
  brake_fluid_front: 'Fluids & Engine',
  brake_fluid_rear: 'Fluids & Engine',
  chain_lube: 'Drivetrain',
  clutch_plate: 'Drivetrain',
  chain_replacement: 'Drivetrain',
  sprocket_replacement: 'Drivetrain',
  front_tyre: 'Tyres & Brakes',
  rear_tyre: 'Tyres & Brakes',
  brake_front: 'Tyres & Brakes',
  brake_rear: 'Tyres & Brakes',
  fork_oil_front: 'Suspension',
  rear_suspension: 'Suspension',
  battery: 'Electrical & Body',
  washing: 'Cleaning',
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

function ComponentCard({
  item,
  currentOdo,
  logCount,
  onOpenLogModal,
  onOpenHistoryModal,
}) {
  const Icon = ITEM_ICONS[item.itemKey] || Droplets
  const odoNum = Math.max(0, Number(currentOdo) || 0)
  const itemLastOdo = Number(item.lastServiceOdo) || 0
  const effectiveLastOdo = itemLastOdo > odoNum ? 0 : itemLastOdo
  const interval = Math.max(1, Number(item.intervalKm) || 1000)

  // Wear progress calculation
  const rawPassedKm = Math.max(0, odoNum - effectiveLastOdo)
  const nextTargetOdo = effectiveLastOdo + interval
  const rawRemainingKm = nextTargetOdo - odoNum
  const percentPassed = Math.min(
    100,
    Math.max(0, Math.round((rawPassedKm / interval) * 100)),
  )
  const meta = getHealthMeta(percentPassed, rawRemainingKm)

  const animatedPassed = useAnimatedNumber(rawPassedKm, 750)
  const animatedRemaining = useAnimatedNumber(Math.abs(rawRemainingKm), 750)

  const categoryName = CATEGORY_MAP[item.itemKey] || 'Wear Component'

  return (
    <div className="flex flex-col justify-between rounded-2xl border border-white/8 bg-[#12161c] p-4.5 transition-all duration-300 hover:border-lime-400/30 hover:shadow-[0_0_24px_rgba(163,230,53,0.06)]">
      <div>
        {/* Header */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-lime-400/10 text-lime-400 ring-1 ring-lime-400/20">
              <Icon className="h-4.5 w-4.5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h4 className="text-sm font-bold text-zinc-100">{item.label}</h4>
              </div>
              <p className="text-[10px] uppercase tracking-wider text-zinc-500">
                {categoryName} • Every {interval.toLocaleString('en-IN')} km
              </p>
            </div>
          </div>

          <span
            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ring-1 ring-inset ${meta.badgeClass}`}
          >
            {meta.statusText}
          </span>
        </div>

        {/* Progress Bar */}
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
                : `Overdue ${animatedRemaining.toLocaleString('en-IN')} km`}
            </span>
          </div>
        </div>

        {/* Cycle Meta Box */}
        <div className="mt-3 grid grid-cols-2 gap-2 rounded-xl border border-white/6 bg-black/30 p-2.5 text-[11px]">
          <div>
            <span className="text-[10px] uppercase tracking-wider text-zinc-500">
              Last Done At
            </span>
            <div className="font-mono font-bold text-zinc-300">
              {effectiveLastOdo.toLocaleString('en-IN')} km
            </div>
          </div>
          <div>
            <span className="text-[10px] uppercase tracking-wider text-zinc-500">
              Next Due Target
            </span>
            <div className="font-mono font-bold text-lime-400">
              {nextTargetOdo.toLocaleString('en-IN')} km
            </div>
          </div>
        </div>
      </div>

      {/* Action Footer */}
      <div className="mt-4 flex items-center justify-between border-t border-white/6 pt-3">
        <button
          type="button"
          onClick={() => onOpenHistoryModal(item)}
          className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-2.5 py-1 text-xs font-semibold text-zinc-300 transition-colors hover:border-white/20 hover:bg-white/10"
        >
          <History className="h-3 w-3 text-zinc-400" />
          History
          <span className="ml-0.5 rounded-full bg-white/10 px-1.5 py-0.2 text-[10px] font-mono font-bold text-lime-300">
            {logCount}
          </span>
        </button>

        <button
          type="button"
          onClick={() => onOpenLogModal(item)}
          className="inline-flex items-center gap-1.5 rounded-lg bg-lime-400 px-3 py-1 text-xs font-bold text-zinc-950 transition-colors hover:bg-lime-300"
        >
          <Plus className="h-3 w-3" /> Log Service
        </button>
      </div>
    </div>
  )
}

export default function ComponentHealthGrid({
  items = [],
  currentOdo = 0,
  serviceLogs = [],
  onOpenLogModal,
  onOpenHistoryModal,
}) {
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [searchTerm, setSearchTerm] = useState('')

  const categoryList = useMemo(() => {
    return [
      'All',
      'Fluids & Engine',
      'Drivetrain',
      'Tyres & Brakes',
      'Suspension',
      'Electrical & Body',
      'Cleaning',
    ]
  }, [])

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const cat = CATEGORY_MAP[item.itemKey] || 'Other'
      const matchCat = selectedCategory === 'All' || cat === selectedCategory
      const matchSearch =
        searchTerm === '' ||
        item.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cat.toLowerCase().includes(searchTerm.toLowerCase())
      return matchCat && matchSearch
    })
  }, [items, selectedCategory, searchTerm])

  const countsByCategory = useMemo(() => {
    const counts = { All: items.length }
    items.forEach((item) => {
      const cat = CATEGORY_MAP[item.itemKey] || 'Other'
      counts[cat] = (counts[cat] || 0) + 1
    })
    return counts
  }, [items])

  return (
    <section className="rounded-3xl border border-white/10 bg-[#0d1014] p-5 shadow-2xl sm:p-7">
      {/* Header */}
      <div className="flex flex-col gap-3 border-b border-white/8 pb-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-lg font-black tracking-tight text-white">
            Component Maintenance Health (18 Items)
          </h3>
          <p className="mt-0.5 text-xs text-zinc-400">
            Wear limits, periodic replacement intervals, and service logging based on current odometer (
            <span className="font-mono font-bold text-lime-300">
              {Number(currentOdo).toLocaleString('en-IN')} km
            </span>
            ).
          </p>
        </div>

        <div className="flex items-center gap-3 text-[11px] font-semibold text-zinc-400">
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-lime-400 shadow-[0_0_6px_#a3e635]" /> Good
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-amber-400 shadow-[0_0_6px_#fbbf24]" /> Due Soon (≥80%)
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-rose-500 shadow-[0_0_6px_#f43f5e]" /> Overdue
          </span>
        </div>
      </div>

      {/* Filter Tabs & Search */}
      <div className="mt-5 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        {/* Category Pills */}
        <div className="flex flex-wrap items-center gap-1.5">
          <Filter className="mr-1 h-3.5 w-3.5 text-zinc-500" />
          {categoryList.map((cat) => {
            const count = countsByCategory[cat] ?? 0
            if (cat !== 'All' && count === 0) return null
            const isSelected = selectedCategory === cat
            return (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`rounded-xl px-3 py-1.5 text-xs font-bold transition-all ${
                  isSelected
                    ? 'bg-lime-400 text-zinc-950 shadow-[0_0_12px_rgba(163,230,53,0.3)]'
                    : 'border border-white/8 bg-[#12161c] text-zinc-400 hover:border-white/15 hover:text-zinc-200'
                }`}
              >
                {cat}
                <span
                  className={`ml-1.5 rounded-full px-1.5 py-0.2 text-[10px] font-mono ${
                    isSelected ? 'bg-black/20 text-black' : 'bg-white/5 text-zinc-500'
                  }`}
                >
                  {count}
                </span>
              </button>
            )
          })}
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-zinc-500" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search component..."
            className="w-full rounded-xl border border-white/10 bg-[#12161c] pl-9 pr-3.5 py-1.5 text-xs text-white placeholder-zinc-500 focus:border-lime-400 focus:outline-none"
          />
        </div>
      </div>

      {/* Component Grid */}
      <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {filteredItems.map((item) => {
          const logCount = (serviceLogs || []).filter(
            (l) => l.itemKey === item.itemKey,
          ).length

          return (
            <ComponentCard
              key={item.itemKey}
              item={item}
              currentOdo={currentOdo}
              logCount={logCount}
              onOpenLogModal={onOpenLogModal}
              onOpenHistoryModal={onOpenHistoryModal}
            />
          )
        })}
      </div>
    </section>
  )
}
