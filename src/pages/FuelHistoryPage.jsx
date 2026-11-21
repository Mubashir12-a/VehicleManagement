import {
  AlertTriangle,
  BarChart3,
  Calendar,
  Check,
  Edit3,
  Fuel,
  Layers,
  MapPin,
  Plus,
  RotateCcw,
  Search,
  Sparkles,
  Trash2,
  TrendingUp,
  X,
} from 'lucide-react'
import { useMemo, useState } from 'react'
import PageHeader from '../components/common/PageHeader'
import FuelAnalyticsGraph from '../components/fuel/FuelAnalyticsGraph'
import FuelEntrySidebarCard from '../components/fuel/FuelEntrySidebarCard'
import { useFleetData } from '../hooks/useFleetData'

export default function FuelHistoryPage() {
  const {
    fuelRefills,
    primaryVehicle,
    monthlyFuelSummary,
    addFuelRefill,
    editFuelRefill,
    deleteFuelRefill,
  } = useFleetData()

  // View option: 'both' (Graphs & Ledger) | 'analytics' (Graphs only) | 'ledger' (Ledger only)
  const [activeView, setActiveView] = useState('both')

  // Selected entry for editing in the Fuel Card Sidebar
  const [editingRefill, setEditingRefill] = useState(null)

  // Delete confirmation
  const [deletingRefill, setDeletingRefill] = useState(null)
  const [isDeleting, setIsDeleting] = useState(false)

  // Filters
  const [selectedMonth, setSelectedMonth] = useState('ALL')
  const [selectedFillType, setSelectedFillType] = useState('ALL')
  const [searchQuery, setSearchQuery] = useState('')

  // Toast / notification
  const [notification, setNotification] = useState('')

  const showNotification = (msg) => {
    setNotification(msg)
    setTimeout(() => setNotification(''), 4000)
  }

  // Filtered refills list (pure fuel records)
  const filteredRefills = useMemo(() => {
    return (fuelRefills || []).filter((r) => {
      if (!r) return false
      if (selectedMonth !== 'ALL') {
        const ym = String(r.refillDate || '').slice(0, 7)
        if (ym !== selectedMonth) return false
      }

      if (selectedFillType !== 'ALL') {
        if (r.fuelFillType !== selectedFillType) return false
      }

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase()
        const matchesStation = String(r.stationName || '').toLowerCase().includes(q)
        const matchesLocation = String(r.location || '').toLowerCase().includes(q)
        const matchesNotes = String(r.notes || '').toLowerCase().includes(q)
        if (!matchesStation && !matchesLocation && !matchesNotes) return false
      }

      return true
    })
  }, [fuelRefills, selectedMonth, selectedFillType, searchQuery])

  // Pure fuel-only statistics with accurate tank-to-tank and efficiency mathematics
  const stats = useMemo(() => {
    const list = [...(fuelRefills || [])].sort((a, b) => {
      const dateA = String(a.refillDate || '')
      const dateB = String(b.refillDate || '')
      if (dateA !== dateB) return dateA.localeCompare(dateB)
      return (Number(a.odometerKm) || 0) - (Number(b.odometerKm) || 0)
    })

    const totalSpend = list.reduce(
      (sum, r) => sum + (Number(r.amountSpent) || 0),
      0,
    )
    const totalLiters = list.reduce(
      (sum, r) => sum + (Number(r.liters) || 0),
      0,
    )
    const avgPrice =
      totalLiters > 0 ? Number((totalSpend / totalLiters).toFixed(2)) : 0

    // Tank-to-Tank & Interval efficiency
    let tankToTankDist = 0
    let tankToTankLiters = 0
    let tankToTankSpend = 0
    let allTripDist = 0
    let allTripLiters = 0
    let allTripSpend = 0
    let bestMileage = 0

    for (let i = 1; i < list.length; i++) {
      const prev = list[i - 1]
      const curr = list[i]
      const dist = Math.max(
        0,
        (Number(curr.odometerKm) || 0) - (Number(prev.odometerKm) || 0),
      )
      const ltrs = Number(curr.liters) || 0
      const spnd = Number(curr.amountSpent) || 0

      if (dist > 0 && ltrs > 0) {
        allTripDist += dist
        allTripLiters += ltrs
        allTripSpend += spnd
        const tripM = Number((dist / ltrs).toFixed(2))
        if (tripM > bestMileage) bestMileage = tripM

        if (prev.fuelFillType === 'Full Tank' && curr.fuelFillType === 'Full Tank') {
          tankToTankDist += dist
          tankToTankLiters += ltrs
          tankToTankSpend += spnd
        }
      }
    }

    const avgMileage =
      tankToTankLiters > 0 && tankToTankDist > 0
        ? Number((tankToTankDist / tankToTankLiters).toFixed(2))
        : allTripLiters > 0 && allTripDist > 0
          ? Number((allTripDist / allTripLiters).toFixed(2))
          : 0

    const costPerKm =
      tankToTankDist > 0 && tankToTankSpend > 0
        ? Number((tankToTankSpend / tankToTankDist).toFixed(2))
        : allTripDist > 0 && allTripSpend > 0
          ? Number((allTripSpend / allTripDist).toFixed(2))
          : 0

    return {
      totalSpend: Number(totalSpend.toFixed(2)),
      totalLiters: Number(totalLiters.toFixed(2)),
      avgPrice,
      avgMileage,
      bestMileage,
      costPerKm,
      isTankToTank: tankToTankDist > 0,
      totalEntries: list.length,
      trackedDistance: allTripDist,
    }
  }, [fuelRefills])

  // Handlers for Sidebar Fuel Card
  const handleSidebarSubmit = async (formData) => {
    if (editingRefill) {
      await editFuelRefill(editingRefill.id, formData)
      showNotification('Fuel refill entry updated successfully.')
      setEditingRefill(null)
    } else {
      await addFuelRefill(formData)
      showNotification('New fuel refill logged & odometer updated!')
    }
  }

  // Handle Edit click on an entry card
  const handleSelectForEdit = (refill) => {
    setEditingRefill(refill)
    // Scroll smoothly to top on small screens
    if (window.innerWidth < 1024) {
      window.scrollTo({ top: 380, behavior: 'smooth' })
    }
  }

  // Handle Delete Confirmation
  const handleConfirmDelete = async () => {
    if (!deletingRefill) return
    setIsDeleting(true)
    try {
      await deleteFuelRefill(deletingRefill.id)
      if (editingRefill?.id === deletingRefill.id) {
        setEditingRefill(null)
      }
      showNotification('Fuel refill entry deleted.')
      setDeletingRefill(null)
    } catch (err) {
      showNotification(err?.message || 'Failed to delete fuel refill.')
    } finally {
      setIsDeleting(false)
    }
  }

  const availableMonths = monthlyFuelSummary?.sortedMonths || []
  const currentMonthData = monthlyFuelSummary?.currentMonth
  const lastMonthData = monthlyFuelSummary?.lastMonth

  return (
    <div className="space-y-6">
      {/* Page Header: Pure Fuel Focus */}
      <PageHeader
        title="Fuel Ledger & Refill History"
        description="Complete fuel transactions, pump rates, station logs, and monthly expense breakdown."
        actions={
          <button
            type="button"
            onClick={() => {
              setEditingRefill(null)
              window.scrollTo({ top: 0, behavior: 'smooth' })
            }}
            className="inline-flex items-center gap-1.5 rounded-xl bg-lime-400 px-4 py-2 text-xs font-extrabold text-zinc-950 shadow-[0_0_18px_rgba(163,230,53,0.3)] transition-colors hover:bg-lime-300"
          >
            <Plus className="h-4 w-4 stroke-[2.5]" />
            New Fuel Entry
          </button>
        }
      />

      {notification && (
        <div className="flex items-center justify-between rounded-2xl border border-lime-400/30 bg-lime-400/10 p-3.5 text-xs font-semibold text-lime-300 shadow-[0_0_20px_rgba(163,230,53,0.12)]">
          <div className="flex items-center gap-2">
            <Check className="h-4 w-4 stroke-[2.5]" />
            <span>{notification}</span>
          </div>
          <button
            type="button"
            onClick={() => setNotification('')}
            className="text-lime-300/80 hover:text-lime-100"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* 4-Stat Strip: PURE FUEL DATA ONLY */}
      <div className="grid grid-cols-2 gap-3.5 sm:gap-4 lg:grid-cols-4">
        {/* Card 1: Total Spend */}
        <div className="rounded-2xl border border-white/8 bg-[#0d1014] p-4 shadow-md">
          <span className="block text-[10px] font-bold uppercase tracking-wider text-zinc-500">
            Total Fuel Spend
          </span>
          <span className="mt-1 block font-mono text-2xl font-black text-white sm:text-3xl">
            ₹{stats.totalSpend.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </span>
          <span className="mt-1 block text-[11px] text-zinc-400">
            All-time across {stats.totalEntries} refill trips
          </span>
        </div>

        {/* Card 2: Fuel Efficiency / Mileage */}
        <div className="rounded-2xl border border-lime-400/25 bg-lime-400/5 p-4 shadow-md">
          <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-wider text-lime-400">
            <span>Fuel Mileage</span>
            <span className="rounded bg-lime-400/10 px-1.5 py-0.5 text-[9px] font-bold text-lime-300">
              {stats.isTankToTank ? 'Tank-to-Tank' : 'Estimated'}
            </span>
          </div>
          <span className="mt-1 block font-mono text-2xl font-black text-lime-300 sm:text-3xl">
            {stats.avgMileage > 0 ? stats.avgMileage : '—'}{' '}
            <span className="text-sm font-semibold text-zinc-400">km/L</span>
          </span>
          <span className="mt-1 block text-[11px] text-zinc-400">
            Peak: <strong className="text-lime-300">{stats.bestMileage > 0 ? `${stats.bestMileage} km/L` : '—'}</strong>
          </span>
        </div>

        {/* Card 3: Running Cost per km */}
        <div className="rounded-2xl border border-white/8 bg-[#0d1014] p-4 shadow-md">
          <span className="block text-[10px] font-bold uppercase tracking-wider text-zinc-500">
            Avg Running Cost
          </span>
          <span className="mt-1 block font-mono text-2xl font-black text-emerald-400 sm:text-3xl">
            {stats.costPerKm > 0 ? `₹${stats.costPerKm}` : '—'}{' '}
            <span className="text-base font-bold text-zinc-500">/km</span>
          </span>
          <span className="mt-1 block text-[11px] text-zinc-400">
            Fuel cost per km driven
          </span>
        </div>

        {/* Card 4: Total Liters & Avg Price */}
        <div className="rounded-2xl border border-white/8 bg-[#0d1014] p-4 shadow-md">
          <span className="block text-[10px] font-bold uppercase tracking-wider text-zinc-500">
            Fuel Pumped & Rate
          </span>
          <span className="mt-1 block font-mono text-2xl font-black text-white sm:text-3xl">
            {stats.totalLiters}{' '}
            <span className="text-base font-bold text-zinc-400">L</span>
          </span>
          <span className="mt-1 block text-[11px] text-zinc-400">
            ₹{stats.avgPrice}/L avg pump price
          </span>
        </div>
      </div>

      {/* View Options: Analytics Graphs vs Ledger Entries */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/8 bg-[#0d1014] p-3 shadow-lg">
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveView('both')}
            className={`inline-flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-bold transition-all ${
              activeView === 'both'
                ? 'bg-lime-400 text-zinc-950 shadow-[0_0_14px_rgba(163,230,53,0.3)]'
                : 'border border-white/8 bg-white/5 text-zinc-400 hover:text-white'
            }`}
          >
            <Layers className="h-3.5 w-3.5" />
            Combined View
          </button>
          <button
            type="button"
            onClick={() => setActiveView('analytics')}
            className={`inline-flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-bold transition-all ${
              activeView === 'analytics'
                ? 'bg-lime-400 text-zinc-950 shadow-[0_0_14px_rgba(163,230,53,0.3)]'
                : 'border border-white/8 bg-white/5 text-zinc-400 hover:text-white'
            }`}
          >
            <BarChart3 className="h-3.5 w-3.5" />
            Consumption Analytics & Graphs
          </button>
          <button
            type="button"
            onClick={() => setActiveView('ledger')}
            className={`inline-flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-bold transition-all ${
              activeView === 'ledger'
                ? 'bg-lime-400 text-zinc-950 shadow-[0_0_14px_rgba(163,230,53,0.3)]'
                : 'border border-white/8 bg-white/5 text-zinc-400 hover:text-white'
            }`}
          >
            <Fuel className="h-3.5 w-3.5" />
            Refill Ledger & Cards
          </button>
        </div>

        <span className="text-xs font-semibold text-zinc-500">
          Showing {fuelRefills.length} total fuel transactions
        </span>
      </div>

      {/* ANALYTICS GRAPHS COMPONENT (Rendered when activeView is 'analytics' or 'both') */}
      {(activeView === 'analytics' || activeView === 'both') && (
        <FuelAnalyticsGraph
          fuelRefills={fuelRefills}
          vehicle={primaryVehicle}
        />
      )}

      {/* Main 2-Column Workspace: Left Column = Fuel Card Sidebar, Right Column = Fuel History Ledger */}
      {(activeView === 'ledger' || activeView === 'both') && (
        <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-12">
          {/* LEFT COLUMN: FUEL CARD SIDEBAR (lg:col-span-5) */}
          <div className="space-y-5 lg:sticky lg:top-20 lg:col-span-5">
          {/* 1. Interactive Fuel Card (Add / Edit entry with 3-way calculator) */}
          <FuelEntrySidebarCard
            vehicle={primaryVehicle}
            editingRefill={editingRefill}
            onCancelEdit={() => setEditingRefill(null)}
            onSubmit={handleSidebarSubmit}
          />

          {/* 2. Fuel Monthly Comparison Card in Sidebar */}
          {currentMonthData && (
            <div className="rounded-3xl border border-white/8 bg-[#0d1014] p-4 shadow-xl">
              <div className="flex items-center justify-between border-b border-white/6 pb-2.5">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-lime-400" />
                  <h4 className="text-xs font-extrabold uppercase tracking-wider text-white">
                    Monthly Fuel Benchmark
                  </h4>
                </div>
                <span className="rounded bg-lime-400/10 px-2 py-0.5 text-[10px] font-bold text-lime-300">
                  {currentMonthData.label}
                </span>
              </div>

              <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                <div className="rounded-xl border border-lime-400/20 bg-lime-400/5 p-2.5">
                  <span className="block text-[10px] font-bold uppercase tracking-wider text-lime-400">
                    Current ({currentMonthData?.label ? currentMonthData.label.split(' ')[0] : 'This'})
                  </span>
                  <span className="mt-1 block font-mono text-base font-black text-white">
                    ₹{Number(currentMonthData?.totalSpent || 0).toFixed(0)}
                  </span>
                  <span className="block text-[10px] text-zinc-400">
                    {Number(currentMonthData?.totalLiters || 0).toFixed(1)} L · {currentMonthData?.refillCount || 0} refills
                  </span>
                </div>

                <div className="rounded-xl border border-white/6 bg-[#12161c] p-2.5">
                  <span className="block text-[10px] font-bold uppercase tracking-wider text-zinc-500">
                    Previous ({lastMonthData?.label ? lastMonthData.label.split(' ')[0] : 'Last'})
                  </span>
                  <span className="mt-1 block font-mono text-base font-black text-zinc-300">
                    ₹{Number(lastMonthData?.totalSpent || 0).toFixed(0)}
                  </span>
                  <span className="block text-[10px] text-zinc-500">
                    {Number(lastMonthData?.totalLiters || 0).toFixed(1)} L · {lastMonthData?.refillCount || 0} refills
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: FUEL LEDGER LIST (lg:col-span-7) */}
        <div className="space-y-4 lg:col-span-7">
          {/* Filter & Search Toolbar */}
          <div className="flex flex-col gap-2.5 rounded-2xl border border-white/8 bg-[#0d1014] p-3.5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap items-center gap-2">
              {/* Month Dropdown */}
              <div className="relative">
                <select
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  className="appearance-none rounded-xl border border-white/10 bg-[#12161c] py-2 pl-3 pr-7 text-xs font-semibold text-zinc-200 focus:border-lime-400 focus:outline-none"
                >
                  <option value="ALL">All Months ({fuelRefills.length})</option>
                  {availableMonths.map((m) => (
                    <option key={m.key} value={m.key}>
                      {m.label} ({m.refillCount} refills)
                    </option>
                  ))}
                </select>
                <Calendar className="pointer-events-none absolute right-2 top-2.5 h-3.5 w-3.5 text-zinc-500" />
              </div>

              {/* Fill Type Filter Pills */}
              <div className="flex items-center gap-1 rounded-xl border border-white/8 bg-[#12161c] p-1">
                <button
                  type="button"
                  onClick={() => setSelectedFillType('ALL')}
                  className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition-colors ${
                    selectedFillType === 'ALL'
                      ? 'bg-white/15 text-white font-bold'
                      : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  All
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedFillType('Full Tank')}
                  className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition-colors ${
                    selectedFillType === 'Full Tank'
                      ? 'bg-lime-400 text-zinc-950 font-bold'
                      : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  Full Tank
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedFillType('Partial / Reserve')}
                  className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition-colors ${
                    selectedFillType === 'Partial / Reserve'
                      ? 'bg-amber-400 text-zinc-950 font-bold'
                      : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  Partial
                </button>
              </div>
            </div>

            {/* Search Input */}
            <div className="relative w-full sm:w-56">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search station / location..."
                className="w-full rounded-xl border border-white/10 bg-[#12161c] py-2 pl-8 pr-3 text-xs text-white placeholder-zinc-500 focus:border-lime-400 focus:outline-none"
              />
              <Search className="pointer-events-none absolute left-2.5 top-2.5 h-3.5 w-3.5 text-zinc-500" />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2 top-2 text-zinc-500 hover:text-zinc-300"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* List of Fuel Entries (Every Entry Clearly Editable) */}
          <div className="space-y-3">
            {filteredRefills.length === 0 ? (
              <div className="rounded-3xl border border-white/8 bg-[#0d1014] p-10 text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-white/5 text-zinc-500">
                  <Fuel className="h-6 w-6" />
                </div>
                <h4 className="mt-3 text-sm font-bold text-zinc-200">
                  No matching fuel entries
                </h4>
                <p className="mt-1 text-xs text-zinc-500">
                  Try adjusting the month or fill type filter.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedMonth('ALL')
                    setSelectedFillType('ALL')
                    setSearchQuery('')
                  }}
                  className="mt-3 inline-flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold text-zinc-300 hover:bg-white/10"
                >
                  <RotateCcw className="h-3 w-3" />
                  Reset Filters
                </button>
              </div>
            ) : (
              filteredRefills.map((refill) => {
                const isCurrentlyEditing = editingRefill?.id === refill.id

                return (
                  <div
                    key={refill.id}
                    onClick={() => handleSelectForEdit(refill)}
                    className={`group relative cursor-pointer overflow-hidden rounded-2xl border p-4 transition-all duration-200 ${
                      isCurrentlyEditing
                        ? 'border-lime-400 bg-lime-400/8 ring-2 ring-lime-400/40 shadow-[0_0_20px_rgba(163,230,53,0.15)]'
                        : 'border-white/8 bg-[#0d1014] hover:border-lime-400/40 hover:bg-white/2'
                    }`}
                  >
                    {/* Active Editing Indicator Bar */}
                    {isCurrentlyEditing && (
                      <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-1 bg-lime-400 shadow-[0_0_8px_#a3e635]" />
                    )}

                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      {/* Left: Station & Refill Specs */}
                      <div className="flex items-start gap-3">
                        <div
                          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border ${
                            isCurrentlyEditing
                              ? 'border-lime-400 bg-lime-400 text-zinc-950 font-bold'
                              : 'border-lime-400/30 bg-lime-400/10 text-lime-400'
                          }`}
                        >
                          <Fuel className="h-5 w-5" />
                        </div>

                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <h4 className="text-sm font-bold text-white">
                              {refill.stationName || 'Fuel Station'}
                            </h4>

                            <span
                              className={`rounded-md px-2 py-0.5 text-[9px] font-extrabold uppercase tracking-wider ${
                                refill.fuelFillType === 'Full Tank'
                                  ? 'border border-lime-400/40 bg-lime-400/15 text-lime-300'
                                  : 'border border-amber-400/40 bg-amber-400/15 text-amber-300'
                              }`}
                            >
                              {refill.fuelFillType || 'Full Tank'}
                            </span>

                            {isCurrentlyEditing && (
                              <span className="flex items-center gap-1 rounded bg-lime-400 px-1.5 py-0.2 text-[9px] font-black uppercase text-zinc-950">
                                <Sparkles className="h-2.5 w-2.5" />
                                Editing in Sidebar
                              </span>
                            )}
                          </div>

                          <div className="mt-1 flex flex-wrap items-center gap-2.5 text-xs text-zinc-400">
                            <span className="flex items-center gap-1 font-mono text-[11px]">
                              <Calendar className="h-3 w-3 text-zinc-500" />
                              {refill.refillDate}
                            </span>

                            {refill.location && (
                              <span className="flex items-center gap-1">
                                <MapPin className="h-3 w-3 text-zinc-500" />
                                {refill.location}
                              </span>
                            )}

                            <span className="rounded bg-white/5 px-1.5 py-0.5 font-mono text-[10px] font-semibold text-zinc-300">
                              Odo: {refill.odometerKm.toLocaleString('en-IN')} km
                            </span>
                          </div>

                          {refill.notes && (
                            <p className="mt-1 text-xs italic text-zinc-500">
                              "{refill.notes}"
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Right: Quantity, Price, Total Amount, Actions */}
                      <div className="flex items-center justify-between gap-4 border-t border-white/6 pt-2 sm:border-t-0 sm:pt-0 sm:justify-end">
                        <div className="text-left sm:text-right">
                          <div className="font-mono text-lg font-black text-white sm:text-xl">
                            ₹{Number(refill.amountSpent).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                          </div>
                          <div className="font-mono text-[11px] text-zinc-400">
                            <strong className="text-zinc-200">{refill.liters} L</strong> @{' '}
                            <span>₹{refill.pricePerLiter}/L</span>
                          </div>
                        </div>

                        {/* EDIT & DELETE ACTION BUTTONS (Every Entry Is Editable) */}
                        <div
                          className="flex items-center gap-1.5 pl-2 sm:border-l sm:border-white/8"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <button
                            type="button"
                            onClick={() => handleSelectForEdit(refill)}
                            className={`inline-flex items-center gap-1 rounded-xl px-2.5 py-1.5 text-xs font-bold transition-all ${
                              isCurrentlyEditing
                                ? 'bg-lime-400 text-zinc-950 shadow-[0_0_12px_rgba(163,230,53,0.3)]'
                                : 'border border-white/10 bg-white/5 text-zinc-300 hover:border-lime-400/40 hover:bg-lime-400/10 hover:text-lime-300'
                            }`}
                            title="Edit this entry in the sidebar"
                          >
                            <Edit3 className="h-3.5 w-3.5" />
                            <span>Edit</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => setDeletingRefill(refill)}
                            className="rounded-xl border border-white/10 bg-white/5 p-1.5 text-zinc-400 hover:border-rose-500/40 hover:bg-rose-500/10 hover:text-rose-400 transition-colors"
                            title="Delete this entry"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>
      </div>
      )}

      {/* Delete Confirmation Dialog */}
      {deletingRefill && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200"
          role="dialog"
          aria-modal="true"
        >
          <div className="w-full max-w-md rounded-3xl border border-rose-500/30 bg-[#0d1014] p-6 shadow-2xl text-zinc-100">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-rose-500/15 text-rose-400">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-base font-bold text-white">Delete Fuel Entry?</h4>
                <p className="text-xs text-zinc-400">
                  This will remove the entry and recalibrate the vehicle odometer.
                </p>
              </div>
            </div>

            <div className="mt-4 rounded-xl border border-white/8 bg-[#12161c] p-3 text-xs text-zinc-300">
              <p>
                <strong className="text-white">
                  {deletingRefill.stationName || 'Fuel Refill'}
                </strong>{' '}
                on {deletingRefill.refillDate}
              </p>
              <p className="mt-1 font-mono text-zinc-400">
                {deletingRefill.liters} L · ₹{deletingRefill.amountSpent} · Odo:{' '}
                {deletingRefill.odometerKm} km
              </p>
            </div>

            <div className="mt-5 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setDeletingRefill(null)}
                disabled={isDeleting}
                className="rounded-xl border border-white/10 px-4 py-2 text-xs font-semibold text-zinc-300 hover:bg-white/5"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={isDeleting}
                className="inline-flex items-center gap-1.5 rounded-xl bg-rose-500 px-4 py-2 text-xs font-bold text-white hover:bg-rose-600 disabled:opacity-50"
              >
                <Trash2 className="h-3.5 w-3.5" />
                {isDeleting ? 'Deleting...' : 'Confirm Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
