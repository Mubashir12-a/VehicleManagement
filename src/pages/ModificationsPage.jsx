import {
  Check,
  CircleDollarSign,
  Layers,
  Plus,
  RefreshCw,
  Search,
  SlidersHorizontal,
  Sparkles,
  X,
} from 'lucide-react'
import { useMemo, useState } from 'react'
import PageHeader from '../components/common/PageHeader'
import AddModificationModal from '../components/modifications/AddModificationModal'
import EditModificationModal from '../components/modifications/EditModificationModal'
import ModificationCard from '../components/modifications/ModificationCard'
import { useAnimatedNumber } from '../hooks/useAnimatedNumber'
import { useFleetData } from '../hooks/useFleetData'

const CATEGORY_FILTERS = [
  'ALL',
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

export default function ModificationsPage() {
  const {
    primaryVehicle,
    vehicleModifications = [],
    addVehicleModification,
    updateVehicleModification,
    deleteVehicleModification,
    refresh,
    loading,
  } = useFleetData()

  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('ALL')
  const [statusTab, setStatusTab] = useState('ALL') // 'ALL' | 'Installed' | 'Wishlist' | 'Removed'
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [editingMod, setEditingMod] = useState(null)

  // Metrics
  const installedMods = useMemo(
    () => vehicleModifications.filter((m) => m.status === 'Installed'),
    [vehicleModifications],
  )

  const wishlistMods = useMemo(
    () => vehicleModifications.filter((m) => m.status === 'Wishlist'),
    [vehicleModifications],
  )

  const removedMods = useMemo(
    () => vehicleModifications.filter((m) => m.status === 'Removed'),
    [vehicleModifications],
  )

  const totalSpent = useMemo(
    () =>
      installedMods.reduce((sum, item) => sum + (Number(item.cost) || 0), 0),
    [installedMods],
  )

  const wishlistTotal = useMemo(
    () =>
      wishlistMods.reduce((sum, item) => sum + (Number(item.cost) || 0), 0),
    [wishlistMods],
  )

  const uniqueCategoriesCount = useMemo(() => {
    const set = new Set(installedMods.map((m) => m.category).filter(Boolean))
    return set.size
  }, [installedMods])

  // Animated KPI numbers
  const animTotalSpent = useAnimatedNumber(totalSpent, 850, 0)
  const animWishlistTotal = useAnimatedNumber(wishlistTotal, 850, 0)

  // Filtered List
  const filteredMods = useMemo(() => {
    return vehicleModifications.filter((m) => {
      // 1. Status Filter
      if (statusTab !== 'ALL' && m.status !== statusTab) {
        return false
      }

      // 2. Category Filter
      if (selectedCategory !== 'ALL' && m.category !== selectedCategory) {
        return false
      }

      // 3. Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim()
        const matchTitle = m.title?.toLowerCase().includes(q)
        const matchBrand = m.brand?.toLowerCase().includes(q)
        const matchNotes = m.notes?.toLowerCase().includes(q)
        const matchCategory = m.category?.toLowerCase().includes(q)
        if (!matchTitle && !matchBrand && !matchNotes && !matchCategory) {
          return false
        }
      }

      return true
    })
  }, [vehicleModifications, statusTab, selectedCategory, searchQuery])

  // Handlers
  const handleAddSubmit = async (data) => {
    await addVehicleModification(data)
  }

  const handleEditSubmit = async (id, data) => {
    await updateVehicleModification(id, data)
  }

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this accessory?')) {
      await deleteVehicleModification(id)
    }
  }

  const handleMarkInstalled = async (mod) => {
    await updateVehicleModification(mod.id, {
      status: 'Installed',
      installedDate: new Date().toISOString().slice(0, 10),
      odometerKm: primaryVehicle?.mileage || null,
    })
  }

  return (
    <div className="space-y-6">
      {/* 1. Header */}
      <PageHeader
        title="Accessories & Modifications"
        description="Track riding gear, helmets, bike covers, installed parts, crash guards, electronics, and wishlist items."
        actions={
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={refresh}
              className="inline-flex items-center gap-1.5 rounded-xl border border-white/10 bg-[#12161c] px-3 py-2 text-xs font-semibold text-zinc-300 transition hover:bg-white/5 hover:text-white"
              title="Refresh Data"
            >
              <RefreshCw
                className={`h-3.5 w-3.5 ${loading ? 'animate-spin text-lime-400' : ''}`}
              />
              <span className="hidden sm:inline">Sync</span>
            </button>

            <button
              type="button"
              onClick={() => setIsAddModalOpen(true)}
              className="inline-flex items-center gap-1.5 rounded-xl bg-lime-400 px-4 py-2 text-xs font-bold text-zinc-950 shadow-[0_0_20px_rgba(163,230,53,0.3)] transition hover:bg-lime-300"
            >
              <Plus className="h-4 w-4" />
              <span>Add Accessory</span>
            </button>
          </div>
        }
      />

      {/* 2. Stat Cards */}
      <div className="grid grid-cols-2 gap-3.5 sm:grid-cols-4 sm:gap-4">
        {/* Card 1: Total Spent */}
        <div className="relative overflow-hidden rounded-2xl border border-lime-400/25 bg-gradient-to-br from-lime-400/10 via-[#12161c] to-[#0c0f12] p-4 sm:p-5 shadow-lg">
          <div className="flex items-center justify-between text-xs font-medium text-zinc-400">
            <span>Total Spent on Mods</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl border border-lime-400/30 bg-lime-400/10 text-lime-400">
              <CircleDollarSign className="h-4 w-4" />
            </div>
          </div>
          <p className="mt-2 text-2xl font-black tracking-tight text-white sm:text-3xl">
            ₹{animTotalSpent.toLocaleString('en-IN')}
          </p>
          <p className="mt-1 text-[11px] text-lime-400">
            Across {installedMods.length} installed parts
          </p>
        </div>

        {/* Card 2: Active Installed */}
        <div className="relative overflow-hidden rounded-2xl border border-white/8 bg-[#12161c]/80 p-4 sm:p-5 backdrop-blur-md">
          <div className="flex items-center justify-between text-xs font-medium text-zinc-400">
            <span>Installed Parts</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl border border-emerald-400/30 bg-emerald-400/10 text-emerald-400">
              <Check className="h-4 w-4" />
            </div>
          </div>
          <p className="mt-2 text-2xl font-black tracking-tight text-white sm:text-3xl">
            {installedMods.length}
          </p>
          <p className="mt-1 text-[11px] text-zinc-400">Active on vehicle</p>
        </div>

        {/* Card 3: Categories */}
        <div className="relative overflow-hidden rounded-2xl border border-white/8 bg-[#12161c]/80 p-4 sm:p-5 backdrop-blur-md">
          <div className="flex items-center justify-between text-xs font-medium text-zinc-400">
            <span>Categories</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl border border-cyan-400/30 bg-cyan-400/10 text-cyan-400">
              <Layers className="h-4 w-4" />
            </div>
          </div>
          <p className="mt-2 text-2xl font-black tracking-tight text-white sm:text-3xl">
            {uniqueCategoriesCount}
          </p>
          <p className="mt-1 text-[11px] text-zinc-400">Distinct mod areas</p>
        </div>

        {/* Card 4: Wishlist */}
        <div className="relative overflow-hidden rounded-2xl border border-sky-400/25 bg-gradient-to-br from-sky-400/10 via-[#12161c] to-[#0c0f12] p-4 sm:p-5 shadow-lg">
          <div className="flex items-center justify-between text-xs font-medium text-zinc-400">
            <span>Wishlist Items</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl border border-sky-400/30 bg-sky-400/10 text-sky-400">
              <Sparkles className="h-4 w-4" />
            </div>
          </div>
          <p className="mt-2 text-2xl font-black tracking-tight text-white sm:text-3xl">
            {wishlistMods.length}
          </p>
          <p className="mt-1 text-[11px] text-sky-300">
            Est. ₹{animWishlistTotal.toLocaleString('en-IN')} planned
          </p>
        </div>
      </div>

      {/* 3. Filters & Search Bar */}
      <div className="rounded-2xl border border-white/8 bg-[#12161c]/80 p-4 backdrop-blur-md space-y-3.5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          {/* Status Tabs */}
          <div className="flex flex-wrap gap-1.5 rounded-xl border border-white/8 bg-black/30 p-1">
            {[
              { id: 'ALL', label: `All (${vehicleModifications.length})` },
              { id: 'Installed', label: `Installed / Owned (${installedMods.length})` },
              { id: 'Wishlist', label: `Wishlist (${wishlistMods.length})` },
              { id: 'Removed', label: `Removed (${removedMods.length})` },
            ].map((tab) => {
              const active = statusTab === tab.id
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setStatusTab(tab.id)}
                  className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                    active
                      ? 'bg-lime-400 text-zinc-950 shadow-[0_0_12px_rgba(163,230,53,0.25)]'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  {tab.label}
                </button>
              )
            })}
          </div>

          {/* Search Box */}
          <div className="relative min-w-[240px]">
            <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-zinc-500" />
            <input
              type="text"
              placeholder="Search parts, brand, notes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-[#141a22] pl-9 pr-8 py-2 text-xs text-white placeholder-zinc-500 focus:border-lime-400 focus:outline-hidden"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-2.5 text-zinc-500 hover:text-zinc-300"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex flex-wrap items-center gap-1.5 border-t border-white/6 pt-3 overflow-x-auto pb-1">
          <span className="text-xs font-medium text-zinc-500 mr-1 flex items-center gap-1">
            <SlidersHorizontal className="h-3 w-3" /> Category:
          </span>
          {CATEGORY_FILTERS.map((cat) => {
            const active = selectedCategory === cat
            return (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`rounded-full border px-3 py-1 text-xs font-medium transition ${
                  active
                    ? 'border-lime-400/40 bg-lime-400/15 text-lime-300 shadow-[0_0_10px_rgba(163,230,53,0.15)]'
                    : 'border-white/8 bg-[#141a22] text-zinc-400 hover:border-white/20 hover:text-white'
                }`}
              >
                {cat}
              </button>
            )
          })}
        </div>
      </div>

      {/* 4. Accessories Grid */}
      {filteredMods.length > 0 ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredMods.map((mod) => (
            <ModificationCard
              key={mod.id}
              mod={mod}
              onEdit={(m) => setEditingMod(m)}
              onDelete={handleDelete}
              onMarkInstalled={handleMarkInstalled}
            />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-3xl border border-white/8 bg-[#12161c]/50 p-12 text-center backdrop-blur-md">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-zinc-400 mb-4">
            <Sparkles className="h-7 w-7 text-lime-400/70" />
          </div>
          <h3 className="text-base font-bold text-white">No accessories found</h3>
          <p className="mt-1 text-xs text-zinc-400 max-w-sm">
            {searchQuery || selectedCategory !== 'ALL' || statusTab !== 'ALL'
              ? 'No accessories match your current filters. Try resetting search or category.'
              : 'Keep track of riding gear, bike covers, protective guards, electronics, performance parts, and wishlist upgrades.'}
          </p>
          <button
            type="button"
            onClick={() => {
              if (searchQuery || selectedCategory !== 'ALL' || statusTab !== 'ALL') {
                setSearchQuery('')
                setSelectedCategory('ALL')
                setStatusTab('ALL')
              } else {
                setIsAddModalOpen(true)
              }
            }}
            className="mt-5 inline-flex items-center gap-1.5 rounded-xl bg-lime-400 px-4 py-2 text-xs font-bold text-zinc-950 shadow-[0_0_16px_rgba(163,230,53,0.25)] hover:bg-lime-300 transition"
          >
            <Plus className="h-4 w-4" />
            <span>
              {searchQuery || selectedCategory !== 'ALL' || statusTab !== 'ALL'
                ? 'Clear Filters'
                : 'Add First Accessory'}
            </span>
          </button>
        </div>
      )}

      {/* 5. Modals */}
      <AddModificationModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={handleAddSubmit}
        currentMileage={primaryVehicle?.mileage || 0}
      />

      <EditModificationModal
        key={editingMod?.id || 'edit-mod-modal'}
        isOpen={Boolean(editingMod)}
        onClose={() => setEditingMod(null)}
        onSubmit={handleEditSubmit}
        mod={editingMod}
      />
    </div>
  )
}
