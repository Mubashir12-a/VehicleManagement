import { CalendarClock, IndianRupee, Wrench } from 'lucide-react'
import PageHeader from '../components/common/PageHeader'
import StatCard from '../components/common/StatCard'
import StatusBadge from '../components/common/StatusBadge'
import MaintenanceHealthCard from '../components/dashboard/MaintenanceHealthCard'
import { useFleetData } from '../hooks/useFleetData'

export default function MaintenancePage() {
  const {
    primaryVehicle,
    maintenance,
    maintenanceItems,
    source,
    updateMaintenanceItem,
  } = useFleetData()

  const totalEstimatedCost = (maintenance || []).reduce(
    (sum, item) => sum + (Number(item?.estimatedCost) || 0),
    0,
  )
  const highPriorityCount = (maintenance || []).filter(
    (item) => item?.priority === 'High',
  ).length

  return (
    <div className="space-y-6">
      <PageHeader
        title="Maintenance"
        description="Track wear component limits, preventive servicing, and upcoming inspections."
      />

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard
          title="Open Work Orders"
          value={maintenance.length}
          subtitle="Active & upcoming jobs"
          icon={Wrench}
          accent="indigo"
        />
        <StatCard
          title="High Priority Alerts"
          value={highPriorityCount}
          subtitle="Require immediate attention"
          icon={CalendarClock}
          accent="rose"
        />
        <StatCard
          title="Estimated Cost"
          value={`₹${totalEstimatedCost.toLocaleString('en-IN')}`}
          subtitle="Projected service spend"
          icon={IndianRupee}
          accent="amber"
        />
      </section>

      <MaintenanceHealthCard
        items={maintenanceItems}
        currentOdo={primaryVehicle.mileage}
        onUpdateItem={updateMaintenanceItem}
      />

      <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#0d1014]">
        <div className="border-b border-white/8 px-5 py-4">
          <h3 className="text-base font-bold text-white">Service Schedule</h3>
          <p className="mt-0.5 text-xs text-zinc-400">
            {source === 'supabase'
              ? 'Live maintenance queue loaded from Supabase'
              : 'Sample maintenance queue'}
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-white/8 text-left text-sm">
            <thead className="bg-white/3 text-xs font-semibold uppercase tracking-wider text-zinc-400">
              <tr>
                <th className="px-5 py-3">Work Order</th>
                <th className="px-5 py-3">Vehicle</th>
                <th className="px-5 py-3">Service Type</th>
                <th className="px-5 py-3">Priority</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3">Due Date</th>
                <th className="px-5 py-3 text-right">Est. Cost</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/6 text-zinc-300">
              {maintenance.map((item) => (
                <tr key={item.id} className="hover:bg-white/3">
                  <td className="whitespace-nowrap px-5 py-3.5 font-mono text-xs font-bold text-lime-300">
                    {item.id}
                  </td>
                  <td className="whitespace-nowrap px-5 py-3.5">
                    <div className="font-semibold text-white">
                      {item.vehicleName}
                    </div>
                    <div className="text-xs text-zinc-500">{item.vehicleId}</div>
                  </td>
                  <td className="whitespace-nowrap px-5 py-3.5">
                    {item.serviceType}
                  </td>
                  <td className="whitespace-nowrap px-5 py-3.5">
                    <StatusBadge status={item.priority} />
                  </td>
                  <td className="whitespace-nowrap px-5 py-3.5">
                    <StatusBadge status={item.status} />
                  </td>
                  <td className="whitespace-nowrap px-5 py-3.5 text-zinc-400">
                    {item.dueDate}
                  </td>
                  <td className="whitespace-nowrap px-5 py-3.5 text-right font-bold text-white">
                    ₹{item.estimatedCost.toLocaleString('en-IN')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
