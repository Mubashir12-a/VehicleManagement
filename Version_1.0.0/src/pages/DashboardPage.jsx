import { Database, RefreshCw } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import PageHeader from '../components/common/PageHeader'
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
    maintenanceItems,
    monthlyFuelSummary,
    loading,
    source,
    needsSchema,
    needsSchemaUpgrade,
    error,
    refresh,
    updatePrimaryVehicle,
    addFuelRefill,
    updateMaintenanceItem,
  } = useFleetData()

  const [isFuelModalOpen, setIsFuelModalOpen] = useState(false)

  return (
    <div className="space-y-6">
      <PageHeader
        title="Garage Telemetry"
        description="Live dashboard with instrument cluster, fuel refills, and component wear tracking."
        actions={
          <div className="flex items-center gap-2.5">
            <span
              className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${
                source === 'supabase'
                  ? 'border border-lime-400/30 bg-lime-400/10 text-lime-300 shadow-[0_0_12px_rgba(163,230,53,0.18)]'
                  : 'border border-amber-400/30 bg-amber-400/10 text-amber-300'
              }`}
            >
              <Database className="h-3.5 w-3.5 text-lime-400" />
              {source === 'supabase' ? 'Live Supabase' : 'Local Fallback'}
            </span>
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

      {(needsSchema || needsSchemaUpgrade) && (
        <div className="flex flex-col gap-2 rounded-2xl border border-amber-400/30 bg-amber-400/10 p-4 text-xs text-amber-200 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="font-bold">Supabase schema notice</p>
            <p className="mt-0.5 text-amber-300/80">
              Run <code className="font-mono font-semibold">supabase/schema.sql</code> to
              synchronize all tables with Supabase.
            </p>
          </div>
          <Link
            to="/settings"
            className="shrink-0 font-bold text-amber-300 underline hover:text-amber-100"
          >
            Check Status →
          </Link>
        </div>
      )}

      {!needsSchema && !needsSchemaUpgrade && error && (
        <div className="rounded-2xl border border-rose-500/30 bg-rose-500/10 p-4 text-xs text-rose-300">
          {error}
        </div>
      )}

      {/* 1. Main Dashboard Card: Matching reference layout (NS400z / Brand / Halo / 2x2 Telemetry) */}
      <VehicleHeroCard
        vehicle={primaryVehicle}
        summary={summary}
        onSave={updatePrimaryVehicle}
      />

      {/* 2. Interactive Odometer Cluster Card with Needle Sweep on Hover & Fuel Refill Sync */}
      <OdometerClusterCard
        vehicle={primaryVehicle}
        latestRefill={latestRefill}
        onLogFuelRefill={addFuelRefill}
        onOpenFuelModal={() => setIsFuelModalOpen(true)}
      />

      {/* 3. Monthly Fuel Summary: Current Month vs Last Month Update Comparison */}
      <MonthlyFuelCard
        monthlyFuelSummary={monthlyFuelSummary}
        onOpenAddModal={() => setIsFuelModalOpen(true)}
      />

      {/* 4. Important Maintenance Health: 9 wear items compared to Odo with remaining km bars */}
      <MaintenanceHealthCard
        items={maintenanceItems}
        currentOdo={primaryVehicle.mileage}
        onUpdateItem={updateMaintenanceItem}
      />

      {/* 5. Monthly Distance & Fuel Trend */}
      <FuelAndMileageChart data={monthlyTrends} />

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
