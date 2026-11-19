import {
  Calendar,
  FileText,
  Filter,
  MapPin,
  Plus,
  Search,
  ShieldAlert,
  Trash2,
  Wrench,
} from 'lucide-react'
import { useMemo, useState } from 'react'

export default function OtherRepairsSection({
  repairs = [],
  onOpenAddModal,
  onDeleteRepair,
}) {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [deletingId, setDeletingId] = useState(null)

  const categories = useMemo(() => {
    const set = new Set()
    repairs.forEach((r) => {
      if (r.category) set.add(r.category)
    })
    return ['All', ...Array.from(set)]
  }, [repairs])

  const filteredRepairs = useMemo(() => {
    return repairs.filter((r) => {
      const matchSearch =
        searchTerm === '' ||
        r.repairTitle?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.notes?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.garageName?.toLowerCase().includes(searchTerm.toLowerCase())

      const matchCategory =
        selectedCategory === 'All' || r.category === selectedCategory

      return matchSearch && matchCategory
    })
  }, [repairs, searchTerm, selectedCategory])

  const totalSpent = useMemo(() => {
    return repairs.reduce((acc, curr) => acc + (Number(curr.cost) || 0), 0)
  }, [repairs])

  const handleDelete = async (repairId) => {
    if (!window.confirm('Delete this repair log?')) return
    setDeletingId(repairId)
    try {
      await onDeleteRepair(repairId)
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <section className="rounded-3xl border border-white/10 bg-[#0d1014] p-5 shadow-2xl sm:p-7">
      {/* Header */}
      <div className="flex flex-col gap-4 border-b border-white/8 pb-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-400/15 text-amber-400">
              <ShieldAlert className="h-4 w-4" />
            </div>
            <h3 className="text-lg font-black tracking-tight text-white">
              Other Repairs & Custom Replacements
            </h3>
          </div>
          <p className="mt-1 text-xs text-zinc-400">
            Ad-hoc mechanical fixes, part upgrades, bodywork, or accident repairs logged with odometer and cost.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="rounded-2xl border border-white/8 bg-[#12161c] px-3.5 py-1.5 text-right">
            <span className="block text-[10px] font-bold uppercase tracking-wider text-zinc-500">
              Total Repair Spend
            </span>
            <span className="font-mono text-sm font-black text-amber-300">
              ₹{totalSpent.toLocaleString('en-IN')}
            </span>
          </div>

          <button
            type="button"
            onClick={onOpenAddModal}
            className="inline-flex items-center gap-1.5 rounded-xl bg-amber-400 px-4 py-2.5 text-xs font-bold text-zinc-950 transition-colors hover:bg-amber-300"
          >
            <Plus className="h-3.5 w-3.5" /> Log Repair / Replacement
          </button>
        </div>
      </div>

      {/* Controls: Search & Category */}
      <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-zinc-500" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search repairs, garage, or notes..."
            className="w-full rounded-xl border border-white/10 bg-[#12161c] pl-9 pr-3.5 py-2 text-xs text-white placeholder-zinc-500 focus:border-amber-400 focus:outline-none"
          />
        </div>

        {categories.length > 2 && (
          <div className="flex flex-wrap items-center gap-1.5 text-xs">
            <Filter className="h-3.5 w-3.5 text-zinc-500" />
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition-colors ${
                  selectedCategory === cat
                    ? 'bg-amber-400/20 text-amber-300 ring-1 ring-amber-400/40'
                    : 'bg-white/5 text-zinc-400 hover:text-zinc-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* List */}
      <div className="mt-5">
        {filteredRepairs.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-white/10 p-10 text-center">
            <Wrench className="h-8 w-8 text-zinc-600" />
            <h4 className="mt-3 text-sm font-bold text-zinc-200">
              No Ad-hoc Repairs Logged Yet
            </h4>
            <p className="mt-1 max-w-md text-xs text-zinc-500">
              Whenever you replace mirrors, cables, bearings, brake levers, or do custom mods, record them here with cost and odometer.
            </p>
            <button
              type="button"
              onClick={onOpenAddModal}
              className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-amber-400 px-4 py-2 text-xs font-bold text-zinc-950 transition-colors hover:bg-amber-300"
            >
              <Plus className="h-3.5 w-3.5" /> Log First Repair
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-white/8 text-left text-xs">
              <thead className="bg-white/3 font-semibold uppercase tracking-wider text-zinc-400">
                <tr>
                  <th className="px-4 py-3">Repair / Job Title</th>
                  <th className="px-4 py-3">Category</th>
                  <th className="px-4 py-3">At Odometer</th>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Garage / Workshop</th>
                  <th className="px-4 py-3 text-right">Cost</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/6 text-zinc-300">
                {filteredRepairs.map((r) => (
                  <tr key={r.id} className="hover:bg-white/3">
                    <td className="px-4 py-3.5">
                      <div className="font-bold text-white">{r.repairTitle}</div>
                      {r.notes && (
                        <div className="mt-0.5 flex items-center gap-1 text-[11px] text-zinc-500">
                          <FileText className="h-3 w-3 shrink-0" />
                          <span>{r.notes}</span>
                        </div>
                      )}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3.5">
                      <span className="rounded-full bg-amber-400/10 px-2.5 py-0.5 text-[10px] font-bold text-amber-300 ring-1 ring-inset ring-amber-400/30">
                        {r.category || 'Repair'}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3.5 font-mono font-bold text-lime-300">
                      {Number(r.odometerKm).toLocaleString('en-IN')} km
                    </td>
                    <td className="whitespace-nowrap px-4 py-3.5 font-mono text-zinc-400">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3 text-zinc-500" />
                        {r.repairDate}
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3.5 text-zinc-400">
                      {r.garageName ? (
                        <div className="flex items-center gap-1">
                          <MapPin className="h-3 w-3 text-zinc-500" />
                          <span>{r.garageName}</span>
                        </div>
                      ) : (
                        '—'
                      )}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3.5 text-right font-mono font-bold text-white">
                      ₹{Number(r.cost).toLocaleString('en-IN')}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3.5 text-right">
                      <button
                        type="button"
                        disabled={deletingId === r.id}
                        onClick={() => handleDelete(r.id)}
                        title="Delete repair log"
                        className="rounded-lg p-1.5 text-zinc-500 transition-colors hover:bg-rose-500/10 hover:text-rose-400 disabled:opacity-50"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  )
}
