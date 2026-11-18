import {
  BatteryCharging,
  Check,
  CircleDot,
  Disc,
  Droplets,
  Link2,
  Pencil,
  RotateCcw,
  Thermometer,
  Wind,
  X,
} from 'lucide-react'
import { useState } from 'react'
import { useAnimatedNumber } from '../../hooks/useAnimatedNumber'

const ITEM_ICONS = {
  engine_oil: Droplets,
  coolant: Thermometer,
  chain_lube: Link2,
  air_filter: Wind,
  front_tyre: CircleDot,
  rear_tyre: CircleDot,
  battery: BatteryCharging,
  brake_front: Disc,
  brake_rear: Disc,
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

function MaintenanceItemCard({
  item,
  currentOdo,
  isEditing,
  isBusy,
  editValues,
  setEditValues,
  onStartEdit,
  onCancelEdit,
  onSaveEdit,
  onResetAtCurrentOdo,
}) {
  const Icon = ITEM_ICONS[item.itemKey] || Droplets
  const rawPassedKm = Math.max(0, Number(currentOdo) - Number(item.lastServiceOdo))
  const rawRemainingKm = Number(item.intervalKm) - rawPassedKm
  const percentPassed = Math.min(
    100,
    Math.max(0, Math.round((rawPassedKm / Number(item.intervalKm)) * 100)),
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
                Limit: {Number(item.intervalKm).toLocaleString('en-IN')} km
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

      {isEditing ? (
        <div className="mt-3.5 space-y-2 border-t border-white/8 pt-3">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-[10px] font-semibold uppercase tracking-wider text-zinc-500">
                Limit (km)
              </label>
              <input
                type="number"
                min={100}
                value={editValues.intervalKm}
                onChange={(e) =>
                  setEditValues({
                    ...editValues,
                    intervalKm: e.target.value,
                  })
                }
                className="mt-0.5 w-full rounded-lg border border-white/10 bg-[#0b0e11] px-2 py-1 text-xs text-white focus:border-lime-400 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-[10px] font-semibold uppercase tracking-wider text-zinc-500">
                Last Done Odo
              </label>
              <input
                type="number"
                min={0}
                value={editValues.lastServiceOdo}
                onChange={(e) =>
                  setEditValues({
                    ...editValues,
                    lastServiceOdo: e.target.value,
                  })
                }
                className="mt-0.5 w-full rounded-lg border border-white/10 bg-[#0b0e11] px-2 py-1 text-xs text-white focus:border-lime-400 focus:outline-none"
              />
            </div>
          </div>
          <div className="flex justify-end gap-1.5 pt-1">
            <button
              type="button"
              onClick={onCancelEdit}
              className="inline-flex items-center gap-1 rounded-lg border border-white/15 px-2.5 py-1 text-[11px] font-semibold text-zinc-300 hover:bg-white/5"
            >
              <X className="h-3 w-3" /> Cancel
            </button>
            <button
              type="button"
              disabled={isBusy}
              onClick={() => onSaveEdit(item)}
              className="inline-flex items-center gap-1 rounded-lg bg-lime-400 px-3 py-1 text-[11px] font-bold text-zinc-950 hover:bg-lime-300 disabled:opacity-50"
            >
              <Check className="h-3 w-3" /> Save
            </button>
          </div>
        </div>
      ) : (
        <div className="mt-3.5 flex items-center justify-between border-t border-white/6 pt-2.5 text-[11px] text-zinc-500">
          <span>Last at {Number(item.lastServiceOdo).toLocaleString('en-IN')} km</span>
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => onStartEdit(item)}
              className="inline-flex items-center gap-1 font-semibold text-zinc-400 hover:text-lime-300"
            >
              <Pencil className="h-3 w-3" />
              Edit
            </button>
            <button
              type="button"
              disabled={isBusy}
              onClick={() => onResetAtCurrentOdo(item)}
              title="Mark serviced at current odometer"
              className="inline-flex items-center gap-1 font-semibold text-zinc-400 hover:text-lime-400 disabled:opacity-50"
            >
              <RotateCcw className="h-3 w-3" />
              Reset
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default function MaintenanceHealthCard({
  items,
  currentOdo,
  onUpdateItem,
}) {
  const [editingKey, setEditingKey] = useState(null)
  const [editValues, setEditValues] = useState({
    intervalKm: 3000,
    lastServiceOdo: 0,
  })
  const [busyKey, setBusyKey] = useState(null)

  const startEdit = (item) => {
    setEditingKey(item.itemKey)
    setEditValues({
      intervalKm: item.intervalKm,
      lastServiceOdo: item.lastServiceOdo,
    })
  }

  const saveEdit = async (item) => {
    setBusyKey(item.itemKey)
    try {
      await onUpdateItem(item, {
        intervalKm: Number(editValues.intervalKm),
        lastServiceOdo: Number(editValues.lastServiceOdo),
      })
      setEditingKey(null)
    } finally {
      setBusyKey(null)
    }
  }

  const resetAtCurrentOdo = async (item) => {
    setBusyKey(item.itemKey)
    try {
      await onUpdateItem(item, {
        lastServiceOdo: currentOdo,
      })
    } finally {
      setBusyKey(null)
    }
  }

  return (
    <section className="rounded-3xl border border-white/10 bg-[#0d1014] p-5 shadow-2xl sm:p-7">
      <div className="flex flex-col gap-2 border-b border-white/8 pb-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-lg font-extrabold tracking-tight text-white">
            Important Maintenance Health
          </h3>
          <p className="mt-0.5 text-xs text-zinc-400">
            Wear progress compared against current odometer (
            <span className="font-mono font-bold text-lime-300">
              {Number(currentOdo).toLocaleString('en-IN')} km
            </span>
            ) across all 9 key components.
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

      <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {items.map((item) => (
          <MaintenanceItemCard
            key={item.itemKey}
            item={item}
            currentOdo={currentOdo}
            isEditing={editingKey === item.itemKey}
            isBusy={busyKey === item.itemKey}
            editValues={editValues}
            setEditValues={setEditValues}
            onStartEdit={startEdit}
            onCancelEdit={() => setEditingKey(null)}
            onSaveEdit={saveEdit}
            onResetAtCurrentOdo={resetAtCurrentOdo}
          />
        ))}
      </div>
    </section>
  )
}
