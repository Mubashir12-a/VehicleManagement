import {
  History,
  Plus,
  RefreshCw,
  ShieldAlert,
  Wrench,
} from 'lucide-react'
import { useState } from 'react'
import PageHeader from '../components/common/PageHeader'
import AddRepairModal from '../components/maintenance/AddRepairModal'
import ComponentHealthGrid from '../components/maintenance/ComponentHealthGrid'
import ItemServiceHistoryModal from '../components/maintenance/ItemServiceHistoryModal'
import LogServiceModal from '../components/maintenance/LogServiceModal'
import MaintenanceHeaderStats from '../components/maintenance/MaintenanceHeaderStats'
import OtherRepairsSection from '../components/maintenance/OtherRepairsSection'
import UnifiedServiceTimeline from '../components/maintenance/UnifiedServiceTimeline'
import { useFleetData } from '../hooks/useFleetData'

export default function MaintenancePage() {
  const {
    primaryVehicle,
    maintenanceItems = [],
    componentServiceLogs = [],
    vehicleRepairs = [],
    serviceReminders = [],
    loading,
    refresh,
    addComponentServiceLog,
    deleteComponentServiceLog,
    addVehicleRepair,
    deleteVehicleRepair,
  } = useFleetData()

  // Tab State: 'components' | 'repairs' | 'timeline'
  const [activeTab, setActiveTab] = useState('components')

  // Modals state
  const [logModalItem, setLogModalItem] = useState(null)
  const [historyModalItem, setHistoryModalItem] = useState(null)
  const [isAddRepairOpen, setIsAddRepairOpen] = useState(false)

  const handleOpenLogModal = (item) => {
    setLogModalItem(item)
  }

  const handleOpenHistoryModal = (item) => {
    setHistoryModalItem(item)
  }

  const handleSaveServiceLog = async (item, logInput) => {
    await addComponentServiceLog(item, logInput)
  }

  const handleDeleteServiceLog = async (logId, itemKey) => {
    await deleteComponentServiceLog(logId, itemKey)
  }

  const handleSaveRepair = async (repairInput) => {
    await addVehicleRepair(repairInput)
  }

  const handleDeleteRepair = async (repairId) => {
    await deleteVehicleRepair(repairId)
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Maintenance & Component Health"
        description="Single-vehicle tracking: 18 wear components, periodic intervals, service logs, and custom repairs."
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

            <button
              type="button"
              onClick={() => setIsAddRepairOpen(true)}
              className="inline-flex items-center gap-1.5 rounded-xl bg-amber-400 px-3.5 py-2 text-xs font-bold text-zinc-950 transition-colors hover:bg-amber-300"
            >
              <Plus className="h-3.5 w-3.5" /> Log Repair
            </button>
          </div>
        }
      />

      {/* 1. Header Hero & 4 Core Stat Cards focused on single vehicle */}
      <MaintenanceHeaderStats
        vehicle={primaryVehicle}
        items={maintenanceItems}
        serviceLogs={componentServiceLogs}
        repairs={vehicleRepairs}
        serviceReminders={serviceReminders}
      />

      {/* 2. Navigation Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-white/8 pb-2">
        <button
          type="button"
          onClick={() => setActiveTab('components')}
          className={`inline-flex items-center gap-2 rounded-2xl px-4 py-2.5 text-xs font-black transition-all ${
            activeTab === 'components'
              ? 'bg-lime-400 text-zinc-950 shadow-[0_0_16px_rgba(163,230,53,0.25)]'
              : 'border border-white/8 bg-[#0d1014] text-zinc-400 hover:border-white/15 hover:text-white'
          }`}
        >
          <Wrench className="h-3.5 w-3.5" />
          Component Health ({maintenanceItems.length})
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('repairs')}
          className={`inline-flex items-center gap-2 rounded-2xl px-4 py-2.5 text-xs font-black transition-all ${
            activeTab === 'repairs'
              ? 'bg-amber-400 text-zinc-950 shadow-[0_0_16px_rgba(251,191,36,0.25)]'
              : 'border border-white/8 bg-[#0d1014] text-zinc-400 hover:border-white/15 hover:text-white'
          }`}
        >
          <ShieldAlert className="h-3.5 w-3.5" />
          Other Repairs & Replacements ({vehicleRepairs.length})
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('timeline')}
          className={`inline-flex items-center gap-2 rounded-2xl px-4 py-2.5 text-xs font-black transition-all ${
            activeTab === 'timeline'
              ? 'bg-indigo-400 text-zinc-950 shadow-[0_0_16px_rgba(129,140,248,0.25)]'
              : 'border border-white/8 bg-[#0d1014] text-zinc-400 hover:border-white/15 hover:text-white'
          }`}
        >
          <History className="h-3.5 w-3.5" />
          Complete Service Logbook ({componentServiceLogs.length + vehicleRepairs.length + serviceReminders.filter((r) => r.status === 'Completed').length})
        </button>
      </div>

      {/* 3. Tab Contents */}
      {activeTab === 'components' && (
        <ComponentHealthGrid
          items={maintenanceItems}
          currentOdo={primaryVehicle?.mileage || 0}
          serviceLogs={componentServiceLogs}
          onOpenLogModal={handleOpenLogModal}
          onOpenHistoryModal={handleOpenHistoryModal}
        />
      )}

      {activeTab === 'repairs' && (
        <OtherRepairsSection
          repairs={vehicleRepairs}
          onOpenAddModal={() => setIsAddRepairOpen(true)}
          onDeleteRepair={handleDeleteRepair}
        />
      )}

      {activeTab === 'timeline' && (
        <UnifiedServiceTimeline
          items={maintenanceItems}
          serviceLogs={componentServiceLogs}
          repairs={vehicleRepairs}
          serviceReminders={serviceReminders}
        />
      )}

      {/* 4. Modals */}
      <LogServiceModal
        isOpen={Boolean(logModalItem)}
        onClose={() => setLogModalItem(null)}
        item={logModalItem}
        vehicle={primaryVehicle}
        onSubmit={handleSaveServiceLog}
      />

      <ItemServiceHistoryModal
        isOpen={Boolean(historyModalItem)}
        onClose={() => setHistoryModalItem(null)}
        item={historyModalItem}
        logs={componentServiceLogs}
        onDeleteLog={handleDeleteServiceLog}
        onOpenLogModal={handleOpenLogModal}
      />

      <AddRepairModal
        isOpen={isAddRepairOpen}
        onClose={() => setIsAddRepairOpen(false)}
        vehicle={primaryVehicle}
        onSubmit={handleSaveRepair}
      />
    </div>
  )
}
