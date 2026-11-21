import {
  Check,
  CircleDollarSign,
  Pencil,
  Sparkles,
  Tag,
  X,
} from 'lucide-react'
import { useState } from 'react'

const MOD_CATEGORIES = [
  'Riding Gear & Apparel',
  'Vehicle Care & Covers',
  'Protection',
  'Electronics & Gadgets',
  'Performance & Handling',
  'Luggage & Touring',
  'Aesthetics & Styling',
  'Comfort & Ergonomics',
  'Exhaust',
  'Accessory',
]

const CATEGORY_LABELS = {
  'Riding Gear & Apparel': 'Riding Gear & Apparel (Helmet, Jacket, Boots, Gloves, Masks)',
  'Vehicle Care & Covers': 'Vehicle Care & Covers (Bike Cover, Lock, Paddock, Care Kit)',
  Protection: 'Protection (Crash Guards, Sliders, Radiator Grill)',
  'Electronics & Gadgets': 'Electronics & Gadgets (Phone Mount, Chargers, Fog Lights)',
  'Performance & Handling': 'Performance & Handling (ECU, Air Filter, Suspension)',
  'Luggage & Touring': 'Luggage & Touring (Saddlebags, Top Box, Tank Bag)',
  'Aesthetics & Styling': 'Aesthetics & Styling (Decals, Wrap, Tail Tidy)',
  'Comfort & Ergonomics': 'Comfort & Ergonomics (Seat, Handlebar Risers, Windshield)',
  Exhaust: 'Exhaust (Slip-On, Full System, Db Killer)',
  Accessory: 'Accessory (General / Other)',
}

const MOD_INSTALLER_OPTIONS = [
  'Self',
  'Authorized Workshop',
  'Independent Garage',
  'Dealer',
]

const GEAR_SOURCE_OPTIONS = [
  'Retail Store / Showroom',
  'Online / E-Commerce',
  'Authorized Dealer',
  'Gift / Other',
  'Self',
]

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

export default function EditModificationModal({
  isOpen,
  onClose,
  onSubmit,
  mod,
}) {
  const [title, setTitle] = useState(mod?.title || '')
  const [category, setCategory] = useState(mod?.category || 'Riding Gear & Apparel')
  const [brand, setBrand] = useState(mod?.brand || '')
  const [cost, setCost] = useState(
    mod?.cost !== undefined && mod?.cost !== null ? String(mod.cost) : '',
  )
  const [status, setStatus] = useState(mod?.status || 'Installed')
  const [installedDate, setInstalledDate] = useState(mod?.installedDate || '')
  const [odometerKm, setOdometerKm] = useState(
    mod?.odometerKm !== undefined && mod?.odometerKm !== null
      ? String(mod.odometerKm)
      : '',
  )
  const [installedBy, setInstalledBy] = useState(
    mod?.installedBy ||
      (isGearOrCareCategory(mod?.category)
        ? 'Retail Store / Showroom'
        : 'Self'),
  )
  const [notes, setNotes] = useState(mod?.notes || '')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  if (!isOpen || !mod) return null

  const isGearOrCare = isGearOrCareCategory(category)
  const installerOptions = isGearOrCare
    ? GEAR_SOURCE_OPTIONS
    : MOD_INSTALLER_OPTIONS

  const handleCategoryChange = (e) => {
    const nextCat = e.target.value
    setCategory(nextCat)
    if (isGearOrCareCategory(nextCat)) {
      if (['Authorized Workshop', 'Independent Garage'].includes(installedBy)) {
        setInstalledBy('Retail Store / Showroom')
      }
    } else {
      if (['Retail Store / Showroom', 'Online / E-Commerce'].includes(installedBy)) {
        setInstalledBy('Self')
      }
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!title.trim()) {
      setErrorMessage('Please enter an item name or accessory title.')
      return
    }

    try {
      setIsSubmitting(true)
      setErrorMessage('')
      await onSubmit(mod.id, {
        title: title.trim(),
        category,
        brand: brand.trim(),
        cost: cost !== '' ? Number(cost) : 0,
        status,
        installedDate: status !== 'Wishlist' ? installedDate : '',
        odometerKm:
          status !== 'Wishlist' && odometerKm !== ''
            ? Number(odometerKm)
            : null,
        installedBy: status !== 'Wishlist' ? installedBy : '',
        notes: notes.trim(),
      })
      onClose()
    } catch (err) {
      setErrorMessage(err?.message || 'Failed to update accessory.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/75 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-lg max-h-[92vh] overflow-y-auto rounded-3xl border border-white/10 bg-[#0e1318] p-6 text-zinc-100 shadow-[0_16px_50px_rgba(0,0,0,0.85)]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/8 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-lime-400/30 bg-lime-400/10 text-lime-400 shadow-[0_0_15px_rgba(163,230,53,0.2)]">
              <Pencil className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Edit Accessory or Gear</h2>
              <p className="text-xs text-zinc-400">Update item details, cost, or status</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-zinc-400 hover:bg-white/5 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {errorMessage && (
          <div className="mt-4 rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-xs text-rose-300">
            {errorMessage}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          {/* Status Selector */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">
              Status
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                {
                  id: 'Installed',
                  label: isGearOrCare ? 'Owned' : 'Installed',
                  icon: Check,
                },
                { id: 'Wishlist', label: 'Wishlist', icon: Sparkles },
                {
                  id: 'Removed',
                  label: isGearOrCare ? 'Retired' : 'Removed',
                  icon: X,
                },
              ].map((s) => {
                const Icon = s.icon
                const active = status === s.id
                return (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => setStatus(s.id)}
                    className={`flex items-center justify-center gap-1.5 rounded-xl border py-2 text-xs font-semibold transition ${
                      active
                        ? 'border-lime-400 bg-lime-400/15 text-lime-400 shadow-[0_0_12px_rgba(163,230,53,0.2)]'
                        : 'border-white/8 bg-[#141a22] text-zinc-400 hover:text-white'
                    }`}
                  >
                    <Icon className="h-3.5 w-3.5" />
                    {s.label}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1">
              {isGearOrCare ? 'Item / Gear Name *' : 'Part / Accessory Name *'}
            </label>
            <input
              type="text"
              required
              placeholder={
                isGearOrCare
                  ? 'e.g. Full-Face Helmet, Riding Jacket, Boots, Bike Cover'
                  : 'e.g. Engine Crash Guard, Radiator Grill, Fog Lights'
              }
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-[#141a22] px-3.5 py-2.5 text-sm text-white placeholder-zinc-500 focus:border-lime-400 focus:outline-hidden"
            />
          </div>

          {/* Category & Brand */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1">
                Category
              </label>
              <div className="relative">
                <select
                  value={category}
                  onChange={handleCategoryChange}
                  className="w-full appearance-none rounded-xl border border-white/10 bg-[#141a22] px-3.5 py-2.5 text-xs text-white focus:border-lime-400 focus:outline-hidden pr-8 truncate"
                >
                  {MOD_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat} className="bg-[#141a22] text-white">
                      {CATEGORY_LABELS[cat] || cat}
                    </option>
                  ))}
                </select>
                <Tag className="pointer-events-none absolute right-3 top-3 h-4 w-4 text-zinc-400" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1">
                Brand / Manufacturer
              </label>
              <input
                type="text"
                placeholder={
                  isGearOrCare
                    ? 'e.g. Axor, MT, Rynox, Raida, Polco'
                    : 'e.g. Zana, MotoTrend, Bobo'
                }
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-[#141a22] px-3.5 py-2.5 text-sm text-white placeholder-zinc-500 focus:border-lime-400 focus:outline-hidden"
              />
            </div>
          </div>

          {/* Cost */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1">
              {status === 'Wishlist' ? 'Estimated Price (₹)' : 'Amount Spent (₹)'}
            </label>
            <div className="relative">
              <input
                type="number"
                min="0"
                step="any"
                placeholder="0"
                value={cost}
                onChange={(e) => setCost(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-[#141a22] pl-9 pr-3.5 py-2.5 text-sm text-white placeholder-zinc-500 focus:border-lime-400 focus:outline-hidden"
              />
              <CircleDollarSign className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-zinc-400" />
            </div>
          </div>

          {/* Conditional Install / Purchase Details (if not Wishlist) */}
          {status !== 'Wishlist' && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1">
                  {isGearOrCare ? 'Purchase Date' : 'Install Date'}
                </label>
                <input
                  type="date"
                  value={installedDate}
                  onChange={(e) => setInstalledDate(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-[#141a22] px-3 py-2 text-xs text-white focus:border-lime-400 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1">
                  {isGearOrCare ? 'Odometer (km, opt)' : 'Odometer (km)'}
                </label>
                <input
                  type="number"
                  min="0"
                  placeholder={isGearOrCare ? 'Optional' : '0'}
                  value={odometerKm}
                  onChange={(e) => setOdometerKm(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-[#141a22] px-3 py-2 text-xs text-white placeholder-zinc-500 focus:border-lime-400 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1">
                  {isGearOrCare ? 'Purchased From' : 'Installed By'}
                </label>
                <select
                  value={installedBy}
                  onChange={(e) => setInstalledBy(e.target.value)}
                  className="w-full appearance-none rounded-xl border border-white/10 bg-[#141a22] px-3 py-2 text-xs text-white focus:border-lime-400 focus:outline-hidden"
                >
                  {installerOptions.map((opt) => (
                    <option key={opt} value={opt} className="bg-[#141a22] text-white">
                      {opt}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* Notes */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1">
              Notes & Specifications
            </label>
            <textarea
              rows={2}
              placeholder={
                isGearOrCare
                  ? 'e.g. Size, ECE/DOT rating, material, warranty, or store link'
                  : 'e.g. Material specs, warranty info, torque values, or purchase link'
              }
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-[#141a22] px-3.5 py-2 text-xs text-white placeholder-zinc-500 focus:border-lime-400 focus:outline-hidden"
            />
          </div>

          {/* Buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/8">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="rounded-xl border border-white/10 px-4 py-2 text-xs font-semibold text-zinc-300 hover:bg-white/5"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-1.5 rounded-xl bg-lime-400 px-5 py-2 text-xs font-bold text-zinc-950 shadow-[0_0_18px_rgba(163,230,53,0.3)] transition hover:bg-lime-300 disabled:opacity-50"
            >
              <Check className="h-4 w-4" />
              {isSubmitting ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
