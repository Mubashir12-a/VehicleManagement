import { ArrowRight, Bell, RefreshCw } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import PageHeader from '../components/common/PageHeader'
import { getReminderStatus, sortServiceReminders } from '../components/dates/datesUtils'
import FuelAndMileageChart from '../components/dashboard/FuelAndMileageChart'
import MaintenanceHealthCard from '../components/dashboard/MaintenanceHealthCard'
import MonthlyFuelCard from '../components/dashboard/MonthlyFuelCard'
import OdometerClusterCard from '../components/dashboard/OdometerClusterCard'
import VehicleHeroCard from '../components/dashboard/VehicleHeroCard'
import FuelRefillModal from '../components/fuel/FuelRefillModal'
import { useFleetData } from '../hooks/useFleetData'

export default function DashboardPage() {
  const {
    primaryVehicle,
    monthlyTrends,
    summary,
    latestRefill,
    fuelRefills = [],
    maintenanceItems,
    componentServiceLogs = [],
    serviceReminders = [],
    vehicleRepairs = [],
    monthlyFuelSummary,
    loading,
    error,
    refresh,
    updatePrimaryVehicle,
    addFuelRefill,
    updateMaintenanceItem,
  } = useFleetData()

  const [isFuelModalOpen, setIsFuelModalOpen] = useState(false)
  const [activeMobileWidget, setActiveMobileWidget] = useState('cockpit')

  const currentOdo = Number(primaryVehicle?.mileage) || 0
  const dueServiceReminders = useMemo(() => {
    return (serviceReminders || [])
      .filter((r) => r.status !== 'Completed')
      .map((r) => ({
        ...r,
        meta: getReminderStatus(r, currentOdo),
      }))
      .filter((r) => r.meta.isDue)
      .sort(sortServiceReminders)
  }, [serviceReminders, currentOdo])

  const dueMaintenanceCount = useMemo(() => {
    const odoNum = currentOdo
    return (maintenanceItems || []).filter((item) => {
      const itemLastOdo = Number(item.lastServiceOdo) || 0
      const effectiveLastOdo = itemLastOdo > odoNum ? 0 : itemLastOdo
      const rawPassedKm = Math.max(0, odoNum - effectiveLastOdo)
      const interval = Math.max(1, Number(item.intervalKm) || 1000)
      return interval - rawPassedKm <= 0
    }).length
  }, [maintenanceItems, currentOdo])

  return (
    <div className="space-y-6">
      <PageHeader
        title="Garage Telemetry"
        description="Live dashboard with instrument cluster, fuel refills, and component wear tracking."
        actions={
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={refresh}
              disabled={loading}
              className="inline-flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-semibold text-zinc-200 transition-colors hover:bg-white/10 disabled:opacity-50"
            >
              <RefreshCw
                className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`}
              />
              Refresh
            </button>
          </div>
        }
      />

      {error && (
        <div className="rounded-2xl border border-rose-500/30 bg-rose-500/10 p-4 text-xs text-rose-300">
          {error}
        </div>
      )}

      {/* Service Milestone Due Reminder Alert Banner */}
      {dueServiceReminders.length > 0 && (
        <div className="flex flex-col gap-3 rounded-2xl border border-amber-400/40 bg-linear-to-r from-amber-500/15 via-[#1a1409] to-[#12161c] p-4 text-xs text-amber-200 shadow-[0_0_24px_rgba(251,191,36,0.12)] sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-400/20 text-amber-300 ring-1 ring-amber-400/40">
              <Bell className="h-5 w-5 animate-bounce" />
            </div>
            <div>
              <p className="text-sm font-bold text-white">
                Service Reminder Alert: {dueServiceReminders.length} service
                {dueServiceReminders.length > 1 ? 's' : ''} reached milestone
              </p>
              <p className="mt-0.5 text-zinc-300">
                {dueServiceReminders
                  .map(
                    (r) =>
                      `${r.title} (${r.meta.label}): ${
                        r.meta.reasons.join(', ') || 'threshold reached'
                      }`,
                  )
                  .join(' • ')}
              </p>
            </div>
          </div>
          <Link
            to="/important-dates?tab=reminders"
            className="inline-flex shrink-0 items-center gap-1.5 rounded-xl bg-lime-400 px-3.5 py-2 font-bold text-zinc-950 transition-colors hover:bg-lime-300"
          >
            <span>View Reminders</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      )}

      {/* 1. Main Dashboard Card: Matching reference layout (NS400z / Brand / Halo / 2x2 Telemetry) */}
      <VehicleHeroCard
        vehicle={primaryVehicle}
        summary={summary}
        maintenanceItems={maintenanceItems}
        serviceLogs={componentServiceLogs}
        serviceReminders={serviceReminders}
        vehicleRepairs={vehicleRepairs}
        fuelRefills={fuelRefills}
        onSave={updatePrimaryVehicle}
      />

      {/* Mobile Widget Selector Pills: Streamlines long card stacks into focused widgets on mobile */}
      <div className="flex lg:hidden items-center gap-1.5 overflow-x-auto rounded-2xl border border-white/10 bg-[#0c1015] p-1.5 text-xs font-bold [scrollbar-width:none]">
        <button
          type="button"
          onClick={() => setActiveMobileWidget('cockpit')}
          className={`flex-1 min-w-[85px] py-2 px-2.5 text-center rounded-xl transition-all ${
            activeMobileWidget === 'cockpit'
              ? 'bg-lime-400 text-zinc-950 shadow-md shadow-lime-400/20'
              : 'text-zinc-400 hover:text-white hover:bg-white/5'
          }`}
        >
          Cockpit
        </button>
        <button
          type="button"
          onClick={() => setActiveMobileWidget('fuel')}
          className={`flex-1 min-w-[95px] py-2 px-2.5 text-center rounded-xl transition-all ${
            activeMobileWidget === 'fuel'
              ? 'bg-lime-400 text-zinc-950 shadow-md shadow-lime-400/20'
              : 'text-zinc-400 hover:text-white hover:bg-white/5'
          }`}
        >
          Fuel & Spend
        </button>
        <button
          type="button"
          onClick={() => setActiveMobileWidget('health')}
          className={`flex-1 min-w-[90px] py-2 px-2.5 text-center rounded-xl transition-all ${
            activeMobileWidget === 'health'
              ? 'bg-lime-400 text-zinc-950 shadow-md shadow-lime-400/20'
              : 'text-zinc-400 hover:text-white hover:bg-white/5'
          }`}
        >
          Health {dueMaintenanceCount > 0 ? `(${dueMaintenanceCount}!)` : ''}
        </button>
        <button
          type="button"
          onClick={() => setActiveMobileWidget('all')}
          className={`py-2 px-3 text-center rounded-xl transition-all ${
            activeMobileWidget === 'all'
              ? 'bg-lime-400 text-zinc-950 shadow-md shadow-lime-400/20'
              : 'text-zinc-400 hover:text-white hover:bg-white/5'
          }`}
        >
          All
        </button>
      </div>

      {/* 2. Interactive Odometer Cluster Card with Needle Sweep on Hover & Fuel Refill Sync */}
      <div className={activeMobileWidget === 'cockpit' || activeMobileWidget === 'all' ? 'block' : 'hidden lg:block'}>
        <OdometerClusterCard
          vehicle={primaryVehicle}
          latestRefill={latestRefill}
          fuelRefills={fuelRefills}
          onLogFuelRefill={addFuelRefill}
          onOpenFuelModal={() => setIsFuelModalOpen(true)}
        />
      </div>

      {/* 3. Monthly Fuel Summary: Current Month vs Last Month Update Comparison */}
      <div className={activeMobileWidget === 'fuel' || activeMobileWidget === 'all' ? 'block' : 'hidden lg:block'}>
        <MonthlyFuelCard
          monthlyFuelSummary={monthlyFuelSummary}
          onOpenAddModal={() => setIsFuelModalOpen(true)}
        />
      </div>

      {/* 4. Important Maintenance Health: wear items compared to Odo with remaining km bars */}
      <div className={activeMobileWidget === 'health' || activeMobileWidget === 'all' ? 'block' : 'hidden lg:block'}>
        <MaintenanceHealthCard
          items={maintenanceItems}
          currentOdo={primaryVehicle.mileage}
          onUpdateItem={updateMaintenanceItem}
        />
      </div>

      {/* 5. Monthly Distance & Fuel Trend */}
      <div className={activeMobileWidget === 'fuel' || activeMobileWidget === 'all' ? 'block' : 'hidden lg:block'}>
        <FuelAndMileageChart
          fuelRefills={fuelRefills}
          vehicle={primaryVehicle}
          fallbackData={monthlyTrends}
        />
      </div>

      {/* Quick Add Fuel Refill Modal */}
      <FuelRefillModal
        isOpen={isFuelModalOpen}
        onClose={() => setIsFuelModalOpen(false)}
        onSubmit={async (data) => {
          await addFuelRefill(data)
        }}
        vehicle={primaryVehicle}
      />
    </div>
  )
}
