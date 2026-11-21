import {
  Calendar,
  Clock,
  History,
  ShieldAlert,
  Wrench,
} from 'lucide-react'
import { useMemo, useState } from 'react'

export default function UnifiedServiceTimeline({
  items = [],
  serviceLogs = [],
  repairs = [],
}) {
  const [filterType, setFilterType] = useState('All')

  // Map item keys to labels
  const labelMap = useMemo(() => {
    const map = {}
    items.forEach((item) => {
      map[item.itemKey] = item.label
    })
    return map
  }, [items])

  // Combine and sort all events descending by date then odometer
  const timelineEvents = useMemo(() => {
    const list = []

    serviceLogs.forEach((log) => {
      list.push({
        id: log.id,
        type: 'component_service',
        title: labelMap[log.itemKey] || log.itemKey,
        date: log.serviceDate,
        odometerKm: log.odometerKm,
        cost: Number(log.cost) || 0,
        notes: log.notes,
        badge: 'Routine Service',
      })
    })

    repairs.forEach((r) => {
      list.push({
        id: r.id,
        type: 'repair',
        title: r.repairTitle,
        date: r.repairDate,
        odometerKm: r.odometerKm,
        cost: Number(r.cost) || 0,
        notes: r.notes || (r.garageName ? `At: ${r.garageName}` : ''),
        badge: r.category || 'Repair',
      })
    })

    return list.sort((a, b) => {
      const dateA = new Date(a.date).getTime()
      const dateB = new Date(b.date).getTime()
      if (dateB !== dateA) return dateB - dateA
      return b.odometerKm - a.odometerKm
    })
  }, [serviceLogs, repairs, labelMap])

  const filteredEvents = useMemo(() => {
    if (filterType === 'Services') {
      return timelineEvents.filter((e) => e.type === 'component_service')
    }
    if (filterType === 'Repairs') {
      return timelineEvents.filter((e) => e.type === 'repair')
    }
    return timelineEvents
  }, [timelineEvents, filterType])

  return (
    <section className="rounded-3xl border border-white/10 bg-[#0d1014] p-5 shadow-2xl sm:p-7">
      <div className="flex flex-col gap-3 border-b border-white/8 pb-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-lime-400/15 text-lime-400">
              <History className="h-4 w-4" />
            </div>
            <h3 className="text-lg font-black tracking-tight text-white">
              Complete Vehicle Service Logbook
            </h3>
          </div>
          <p className="mt-1 text-xs text-zinc-400">
            Chronological history of every component replacement, routine oil change, and ad-hoc repair.
          </p>
        </div>

        <div className="flex items-center gap-1.5 rounded-xl border border-white/8 bg-[#12161c] p-1 text-xs">
          {['All', 'Services', 'Repairs'].map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => setFilterType(type)}
              className={`rounded-lg px-3 py-1 font-bold transition-all ${
                filterType === type
                  ? 'bg-lime-400 text-zinc-950 shadow-sm'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-5">
        {filteredEvents.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-white/10 p-10 text-center">
            <Clock className="h-8 w-8 text-zinc-600" />
            <h4 className="mt-3 text-sm font-bold text-zinc-200">
              No History Logs Recorded Yet
            </h4>
            <p className="mt-1 text-xs text-zinc-500">
              As you log services and repairs, your complete timeline will build up here.
            </p>
          </div>
        ) : (
          <div className="relative pl-6 before:absolute before:bottom-3 before:left-2.5 before:top-3 before:w-0.5 before:bg-white/10">
            <div className="space-y-4">
              {filteredEvents.map((event) => (
                <div key={event.id} className="relative flex items-start gap-4">
                  {/* Timeline Dot */}
                  <div
                    className={`absolute -left-6 mt-1 flex h-5 w-5 items-center justify-center rounded-full ring-4 ring-[#0d1014] ${
                      event.type === 'component_service'
                        ? 'bg-lime-400 text-zinc-950'
                        : 'bg-amber-400 text-zinc-950'
                    }`}
                  >
                    {event.type === 'component_service' ? (
                      <Wrench className="h-2.5 w-2.5" />
                    ) : (
                      <ShieldAlert className="h-2.5 w-2.5" />
                    )}
                  </div>

                  {/* Card */}
                  <div className="flex-1 rounded-2xl border border-white/8 bg-[#12161c] p-4 transition-colors hover:border-white/15">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-white">{event.title}</h4>
                          <span
                            className={`rounded-full px-2 py-0.2 text-[10px] font-bold uppercase tracking-wider ${
                              event.type === 'component_service'
                                ? 'bg-lime-400/10 text-lime-300 ring-1 ring-lime-400/25'
                                : 'bg-amber-400/10 text-amber-300 ring-1 ring-amber-400/25'
                            }`}
                          >
                            {event.badge}
                          </span>
                        </div>
                        {event.notes && (
                          <p className="text-xs text-zinc-400">{event.notes}</p>
                        )}
                      </div>

                      <div className="flex items-center gap-3 sm:text-right">
                        <div>
                          <div className="font-mono text-sm font-bold text-lime-300">
                            {event.odometerKm.toLocaleString('en-IN')} km
                          </div>
                          <div className="flex items-center gap-1 font-mono text-[11px] text-zinc-500">
                            <Calendar className="h-3 w-3" />
                            {event.date}
                          </div>
                        </div>

                        {event.cost > 0 && (
                          <div className="rounded-xl border border-white/8 bg-black/40 px-2.5 py-1 text-right">
                            <span className="block text-[9px] uppercase tracking-wider text-zinc-500">
                              Cost
                            </span>
                            <span className="font-mono text-xs font-bold text-white">
                              ₹{event.cost.toLocaleString('en-IN')}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
