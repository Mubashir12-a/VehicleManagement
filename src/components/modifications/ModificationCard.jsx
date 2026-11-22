import {
  Calendar,
  Check,
  CheckCircle2,
  Gauge,
  Pencil,
  Sparkles,
  Tag,
  Trash2,
  User,
  Wrench,
} from 'lucide-react'
import { formatDisplayDate } from '../../utils/dateFormatter'

const CATEGORY_STYLES = {
  'Riding Gear & Apparel': 'border-purple-500/30 bg-purple-500/10 text-purple-400',
  'Riding Gear': 'border-purple-500/30 bg-purple-500/10 text-purple-400',
  'Vehicle Care & Covers': 'border-teal-500/30 bg-teal-500/10 text-teal-400',
  'Care & Covers': 'border-teal-500/30 bg-teal-500/10 text-teal-400',
  'Gear & Essentials': 'border-purple-500/30 bg-purple-500/10 text-purple-400',
  Protection: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400',
  'Electronics & Gadgets': 'border-cyan-500/30 bg-cyan-500/10 text-cyan-400',
  Electronics: 'border-cyan-500/30 bg-cyan-500/10 text-cyan-400',
  'Performance & Handling': 'border-amber-500/30 bg-amber-500/10 text-amber-400',
  Performance: 'border-amber-500/30 bg-amber-500/10 text-amber-400',
  'Luggage & Touring': 'border-blue-500/30 bg-blue-500/10 text-blue-400',
  Touring: 'border-blue-500/30 bg-blue-500/10 text-blue-400',
  'Aesthetics & Styling': 'border-fuchsia-500/30 bg-fuchsia-500/10 text-fuchsia-400',
  Aesthetics: 'border-fuchsia-500/30 bg-fuchsia-500/10 text-fuchsia-400',
  'Comfort & Ergonomics': 'border-indigo-500/30 bg-indigo-500/10 text-indigo-400',
  Comfort: 'border-indigo-500/30 bg-indigo-500/10 text-indigo-400',
  Exhaust: 'border-orange-500/30 bg-orange-500/10 text-orange-400',
  Accessory: 'border-lime-500/30 bg-lime-500/10 text-lime-400',
}

function formatDate(dateStr) {
  return formatDisplayDate(dateStr)
}

function isGearOrCareCategory(cat) {
  if (!cat) return false
  const lower = cat.toLowerCase()
  return (
    lower.includes('gear') ||
    lower.includes('apparel') ||
    lower.includes('cover') ||
    lower.includes('wear') ||
    lower.includes('care')
  )
}

export default function ModificationCard({
  mod,
  onEdit,
  onDelete,
  onMarkInstalled,
}) {
  const categoryClass =
    CATEGORY_STYLES[mod.category] ||
    'border-lime-500/30 bg-lime-500/10 text-lime-400'
  const isWishlist = mod.status === 'Wishlist'
  const isInstalled = mod.status === 'Installed'
  const isRemoved = mod.status === 'Removed'
  const isGearOrCare = isGearOrCareCategory(mod.category)

  return (
    <div className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-white/8 bg-[#12161c]/80 p-5 backdrop-blur-md transition-all duration-200 hover:border-lime-400/40 hover:bg-[#141a22] hover:shadow-[0_4px_24px_rgba(0,0,0,0.35)]">
      {/* Top badges & Title */}
      <div>
        <div className="flex items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-1.5">
            <span
              className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-semibold ${categoryClass}`}
            >
              <Tag className="h-3 w-3" />
              {mod.category}
            </span>

            {isInstalled && (
              <span className="inline-flex items-center gap-1 rounded-full border border-lime-400/30 bg-lime-400/10 px-2 py-0.5 text-[11px] font-semibold text-lime-400">
                <Check className="h-3 w-3" /> {isGearOrCare ? 'Owned' : 'Installed'}
              </span>
            )}
            {isWishlist && (
              <span className="inline-flex items-center gap-1 rounded-full border border-sky-400/30 bg-sky-400/10 px-2 py-0.5 text-[11px] font-semibold text-sky-300">
                <Sparkles className="h-3 w-3" /> Wishlist
              </span>
            )}
            {isRemoved && (
              <span className="inline-flex items-center gap-1 rounded-full border border-zinc-600/40 bg-zinc-800/60 px-2 py-0.5 text-[11px] font-semibold text-zinc-400">
                {isGearOrCare ? 'Retired' : 'Removed'}
              </span>
            )}
          </div>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => onEdit(mod)}
              className="rounded-lg p-1.5 text-zinc-400 transition hover:bg-white/10 hover:text-white"
              title="Edit Accessory"
              aria-label="Edit Accessory"
            >
              <Pencil className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => onDelete(mod.id)}
              className="rounded-lg p-1.5 text-zinc-400 transition hover:bg-rose-500/20 hover:text-rose-400"
              title="Delete Accessory"
              aria-label="Delete Accessory"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Title & Brand */}
        <div className="mt-3">
          <h3 className="text-base font-bold text-white group-hover:text-lime-300 transition-colors">
            {mod.title}
          </h3>
          {mod.brand && (
            <p className="mt-0.5 text-xs font-medium text-zinc-400">
              Brand: <span className="text-zinc-200">{mod.brand}</span>
            </p>
          )}
        </div>

        {/* Price / Spend */}
        <div className="mt-4 flex items-baseline gap-2">
          <span className="text-2xl font-black tracking-tight text-white">
            ₹{Number(mod.cost || 0).toLocaleString('en-IN')}
          </span>
          <span className="text-xs text-zinc-400">
            {isWishlist ? 'estimated cost' : 'spent'}
          </span>
        </div>

        {/* Specs & Install details */}
        <div className="mt-4 grid grid-cols-2 gap-2 border-t border-white/6 pt-3 text-xs">
          {!isWishlist && mod.installedDate && (
            <div className="flex items-center gap-1.5 text-zinc-400">
              <Calendar className="h-3.5 w-3.5 text-zinc-400 shrink-0" />
              <span>{isGearOrCare ? 'Bought: ' : ''}{formatDate(mod.installedDate)}</span>
            </div>
          )}

          {!isWishlist && mod.odometerKm !== null && mod.odometerKm !== undefined && (
            <div className="flex items-center gap-1.5 text-zinc-400">
              <Gauge className="h-3.5 w-3.5 text-zinc-400 shrink-0" />
              <span>{Number(mod.odometerKm).toLocaleString('en-IN')} km</span>
            </div>
          )}

          {!isWishlist && mod.installedBy && (
            <div className="flex items-center gap-1.5 text-zinc-400 col-span-2">
              {mod.installedBy.toLowerCase().includes('self') ? (
                <User className="h-3.5 w-3.5 text-zinc-400 shrink-0" />
              ) : (
                <Wrench className="h-3.5 w-3.5 text-zinc-400 shrink-0" />
              )}
              <span>{isGearOrCare ? 'Source: ' : 'Fitted by: '}<span className="text-zinc-300">{mod.installedBy}</span></span>
            </div>
          )}
        </div>

        {/* Notes */}
        {mod.notes && (
          <p className="mt-3 line-clamp-2 rounded-lg bg-black/25 px-2.5 py-1.5 text-xs text-zinc-400">
            {mod.notes}
          </p>
        )}
      </div>

      {/* Wishlist Quick Action */}
      {isWishlist && (
        <div className="mt-4 border-t border-white/6 pt-3">
          <button
            type="button"
            onClick={() => onMarkInstalled(mod)}
            className="flex w-full items-center justify-center gap-1.5 rounded-xl border border-lime-400/30 bg-lime-400/10 px-3 py-2 text-xs font-semibold text-lime-300 transition hover:bg-lime-400 hover:text-black"
          >
            <CheckCircle2 className="h-3.5 w-3.5" />
            {isGearOrCare ? 'Mark as Owned' : 'Mark as Installed'}
          </button>
        </div>
      )}
    </div>
  )
}
