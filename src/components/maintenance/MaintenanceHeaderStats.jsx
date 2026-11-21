import {
  AlertTriangle,
  CheckCircle2,
  Gauge,
  History,
  IndianRupee,
  Wrench,
} from 'lucide-react'
import StatCard from '../common/StatCard'

export default function MaintenanceHeaderStats({
  vehicle,
  items = [],
  serviceLogs = [],
  repairs = [],
}) {
  const currentOdo = Number(vehicle?.mileage) || 0

  // Calculate totals
  const totalServiceSpent = serviceLogs.reduce(
    (acc, curr) => acc + (Number(curr.cost) || 0),
    0,
  )
  const totalRepairsSpent = repairs.reduce(
    (acc, curr) => acc + (Number(curr.cost) || 0),
    0,
  )
  const totalSpend = totalServiceSpent + totalRepairsSpent

  // Component statuses
  let overdueCount = 0
  let dueSoonCount = 0
  let goodCount = 0

  items.forEach((item) => {
    const odoNum = currentOdo
    const itemLastOdo = Number(item.lastServiceOdo) || 0
    const effectiveLastOdo = itemLastOdo > odoNum ? 0 : itemLastOdo
    const rawPassedKm = Math.max(0, odoNum - effectiveLastOdo)
    const interval = Math.max(1, Number(item.intervalKm) || 1000)
    const remainingKm = interval - rawPassedKm
    const percent = Math.round((rawPassedKm / interval) * 100)

    if (remainingKm <= 0) overdueCount++
    else if (percent >= 80) dueSoonCount++
    else goodCount++
  })

  return (
    <div className="space-y-4">
      {/* Vehicle Hero Strip */}
      <div className="flex flex-col gap-4 rounded-3xl border border-white/10 bg-[#0d1014] p-5 shadow-2xl sm:flex-row sm:items-center sm:justify-between sm:p-6">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-lime-400/10 text-lime-400 ring-1 ring-lime-400/25">
            <Wrench className="h-7 w-7" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-xl font-black tracking-tight text-white">
                {vehicle?.brand} {vehicle?.model || vehicle?.name}
              </h2>
              <span className="rounded-full bg-lime-400/15 px-2.5 py-0.5 text-xs font-bold text-lime-300 ring-1 ring-inset ring-lime-400/30">
                {vehicle?.category || 'Two Wheeler'}
              </span>
              <span className="rounded-full bg-white/5 px-2.5 py-0.5 font-mono text-xs font-semibold text-zinc-400">
                {vehicle?.plate}
              </span>
            </div>
            <p className="mt-1 text-xs text-zinc-400">
              Single-vehicle preventive maintenance logbook & replacement schedule.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="rounded-2xl border border-white/8 bg-[#12161c] px-4 py-2.5 text-right">
            <span className="flex items-center justify-end gap-1 text-[10px] font-bold uppercase tracking-wider text-zinc-500">
              <Gauge className="h-3 w-3 text-lime-400" /> Current Odometer
            </span>
            <span className="font-mono text-lg font-black text-white">
              {currentOdo.toLocaleString('en-IN')}{' '}
              <span className="text-xs font-normal text-zinc-500">km</span>
            </span>
          </div>
        </div>
      </div>

      {/* 4 Quick Stat Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Maintenance Spend"
          value={`₹${totalSpend.toLocaleString('en-IN')}`}
          subtitle={`₹${totalServiceSpent.toLocaleString('en-IN')} services + ₹${totalRepairsSpent.toLocaleString('en-IN')} repairs`}
          icon={IndianRupee}
          accent="amber"
        />

        <StatCard
          title="Healthy Components"
          value={`${goodCount} / ${items.length}`}
          subtitle="Wear within optimal limits"
          icon={CheckCircle2}
          accent="lime"
        />

        <StatCard
          title="Attention Required"
          value={`${overdueCount + dueSoonCount}`}
          subtitle={`${overdueCount} overdue, ${dueSoonCount} due soon`}
          icon={AlertTriangle}
          accent={overdueCount > 0 ? 'rose' : dueSoonCount > 0 ? 'amber' : 'indigo'}
        />

        <StatCard
          title="Service History Logs"
          value={`${serviceLogs.length + repairs.length}`}
          subtitle={`${serviceLogs.length} services • ${repairs.length} repairs`}
          icon={History}
          accent="indigo"
        />
      </div>
    </div>
  )
}
