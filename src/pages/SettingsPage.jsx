import {
  AlertTriangle,
  BookOpen,
  Car,
  Check,
  CheckCircle2,
  Download,
  Edit3,
  ExternalLink,
  Fuel,
  Gauge,
  HardDrive,
  IndianRupee,
  LogIn,
  LogOut,
  Mail,
  MessageSquare,
  Plus,
  RefreshCw,
  Shield,
  ShieldCheck,
  Sparkles,
  Trash2,
  User,
  UserPlus,
  Zap,
} from 'lucide-react'
import { useState } from 'react'
import PageHeader from '../components/common/PageHeader'
import AddVehicleModal from '../components/settings/AddVehicleModal'
import ManageAccountModal from '../components/settings/ManageAccountModal'
import ResetDataModal from '../components/settings/ResetDataModal'
import VehicleReportModal from '../components/settings/VehicleReportModal'
import { useAuth } from '../context/AuthContextCore'
import { useFleetData } from '../hooks/useFleetData'
import { resolveVehicleVisual } from '../utils/vehicleIllustration'

function InstagramIcon({ className = 'h-4 w-4' }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  )
}

function WhatsAppIcon({ className = 'h-4 w-4' }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
    </svg>
  )
}

export default function SettingsPage() {
  const {
    vehicles = [],
    primaryVehicle,
    switchActiveVehicle,
    deleteVehicle,
    resetAllData,
    fuelRefills = [],
    maintenanceItems = [],
    serviceReminders = [],
    componentServiceLogs = [],
    vehicleRepairs = [],
    vehicleDocuments = [],
    vehicleModifications = [],
    refresh,
    loading,
  } = useFleetData()

  const {
    user,
    profile,
    openAuthModal,
    openProfileModal,
    signOut,
  } = useAuth()

  const [downloadSuccess, setDownloadSuccess] = useState(false)
  const [cacheCleared, setCacheCleared] = useState(false)
  const [isReportModalOpen, setIsReportModalOpen] = useState(false)
  const [isAddVehicleModalOpen, setIsAddVehicleModalOpen] = useState(false)
  const [isResetModalOpen, setIsResetModalOpen] = useState(false)
  const [isManageAccountOpen, setIsManageAccountOpen] = useState(false)
  const [switchFeedback, setSwitchFeedback] = useState('')
  const [resetFeedback, setResetFeedback] = useState('')

  const handleSwitchVehicle = async (vehicleId) => {
    try {
      await switchActiveVehicle(vehicleId)
      const target = vehicles.find((v) => v.id === vehicleId)
      setSwitchFeedback(
        `Cockpit switched to ${target?.name || 'selected vehicle'}!`,
      )
      setTimeout(() => setSwitchFeedback(''), 3500)
    } catch (err) {
      console.error('Failed to switch vehicle:', err)
    }
  }

  const handleDeleteVehicle = async (vehicle) => {
    if (vehicles.length <= 1) {
      alert('You must keep at least one vehicle in your garage.')
      return
    }
    const confirmed = window.confirm(
      `Are you sure you want to delete "${vehicle.name}" (${vehicle.plate})? All records for this vehicle will be removed.`,
    )
    if (!confirmed) return
    try {
      await deleteVehicle(vehicle.id)
      setSwitchFeedback(`Vehicle "${vehicle.name}" deleted.`)
      setTimeout(() => setSwitchFeedback(''), 3500)
    } catch (err) {
      console.error('Failed to delete vehicle:', err)
      alert(err.message || 'Failed to delete vehicle.')
    }
  }

  const handleExportBackup = () => {
    try {
      const backupData = {
        app: 'MKD Vehicle Management',
        version: '1.2.0',
        exportedAt: new Date().toISOString(),
        primaryVehicle,
        fuelRefills,
        maintenanceItems,
        serviceReminders,
        componentServiceLogs,
        vehicleRepairs,
        vehicleDocuments,
        vehicleModifications,
      }

      const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(
        JSON.stringify(backupData, null, 2),
      )}`
      const downloadAnchor = document.createElement('a')
      const today = new Date().toISOString().slice(0, 10)
      downloadAnchor.setAttribute('href', jsonString)
      downloadAnchor.setAttribute(
        'download',
        `garage-backup-${primaryVehicle?.plate || 'vehicle'}-${today}.json`,
      )
      document.body.appendChild(downloadAnchor)
      downloadAnchor.click()
      downloadAnchor.remove()

      setDownloadSuccess(true)
      setTimeout(() => setDownloadSuccess(false), 4000)
    } catch (err) {
      console.error('Failed to export garage backup:', err)
    }
  }

  const handleClearCache = async () => {
    try {
      localStorage.removeItem('activeVehicleTab')
      localStorage.removeItem('fuelChartRange')
      await refresh()
      setCacheCleared(true)
      setTimeout(() => setCacheCleared(false), 4000)
    } catch (err) {
      console.error('Failed to clear cache:', err)
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Garage Settings"
        description="Application preferences, telemetry units, and garage data management."
      />

      {resetFeedback && (
        <div className="flex items-center gap-2.5 rounded-2xl border border-rose-500/40 bg-rose-500/10 p-4 text-xs font-semibold text-rose-300 animate-in fade-in">
          <AlertTriangle className="h-4 w-4 shrink-0 text-rose-400" />
          <span>{resetFeedback}</span>
        </div>
      )}

      {/* 1. Driver Profile & Cloud Account Card */}
      <section className="rounded-2xl border border-white/10 bg-[#0d1014] p-5 sm:p-6 shadow-xl">
        {user ? (
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <div className="relative flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border-2 border-lime-400 bg-lime-400/15 text-lg font-black text-lime-300 shadow-lg shadow-lime-400/20">
                {profile?.full_name
                  ? (profile.full_name.split(' ').length > 1
                      ? (profile.full_name.split(' ')[0][0] + profile.full_name.split(' ')[1][0]).toUpperCase()
                      : profile.full_name.slice(0, 2).toUpperCase())
                  : (user.email?.slice(0, 2).toUpperCase() || 'US')}
                <span className="absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full border-2 border-[#0d1014] bg-lime-400" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-black text-white">
                    {profile?.full_name || user.email?.split('@')[0]}
                  </h3>
                  <span className="rounded-full bg-lime-400/10 px-2 py-0.5 text-[10px] font-bold text-lime-400 border border-lime-400/30">
                    Cloud Account
                  </span>
                </div>
                <p className="mt-0.5 text-xs text-zinc-400 flex items-center gap-1.5">
                  <Mail className="h-3 w-3 text-zinc-500" />
                  <span>{user.email}</span>
                  {profile?.phone && (
                    <>
                      <span className="text-zinc-600">•</span>
                      <span>{profile.phone}</span>
                    </>
                  )}
                </p>
                {profile?.bio && (
                  <p className="mt-1 text-xs text-zinc-400 italic">
                    "{profile.bio}"
                  </p>
                )}
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => setIsManageAccountOpen(true)}
                className="inline-flex items-center gap-2 rounded-xl border border-lime-400/40 bg-lime-400/10 px-3.5 sm:px-4 py-2.5 text-xs font-bold text-lime-300 transition-all hover:bg-lime-400 hover:text-zinc-950 shadow-sm"
              >
                <Shield className="h-4 w-4" />
                <span>Manage Account</span>
              </button>
              <button
                type="button"
                onClick={openProfileModal}
                className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3.5 sm:px-4 py-2.5 text-xs font-bold text-zinc-300 transition-all hover:bg-white/10 hover:text-white"
              >
                <Edit3 className="h-4 w-4" />
                <span>Edit Profile</span>
              </button>
              <button
                type="button"
                onClick={signOut}
                className="inline-flex items-center gap-1.5 rounded-xl border border-rose-500/30 bg-rose-500/10 px-3 sm:px-3.5 py-2.5 text-xs font-bold text-rose-300 transition-all hover:bg-rose-500/20"
              >
                <LogOut className="h-4 w-4" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-lime-400/15 text-lime-400 border border-lime-400/30">
                <User className="h-6 w-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-black text-white">
                    Driver Profile & Cloud Sync
                  </h3>
                  <span className="rounded-full bg-zinc-800 px-2 py-0.5 text-[10px] font-bold text-zinc-400 border border-white/6">
                    Guest Mode
                  </span>
                </div>
                <p className="mt-0.5 text-xs text-zinc-400">
                  Sign in or create an account to sync your vehicle telemetry and service reminders securely across devices.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 sm:flex sm:items-center sm:gap-2.5">
              <button
                type="button"
                onClick={() => openAuthModal('signin')}
                className="inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-xl border border-lime-400/40 bg-lime-400/10 px-3.5 sm:px-4 py-2.5 text-xs font-bold text-lime-300 transition-all hover:bg-lime-400 hover:text-zinc-950"
              >
                <LogIn className="h-4 w-4 shrink-0" />
                <span>Sign In</span>
              </button>
              <button
                type="button"
                onClick={() => openAuthModal('signup')}
                className="inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-xl bg-lime-400 px-3.5 sm:px-4 py-2.5 text-xs font-black text-zinc-950 transition-all hover:bg-lime-300 shadow-md shadow-lime-400/20"
              >
                <UserPlus className="h-4 w-4 shrink-0" />
                <span>Create Account</span>
              </button>
            </div>
          </div>
        )}
      </section>

      {/* 2. Garage Fleet & Vehicle Profiles Section */}
      <section className="rounded-2xl border border-white/10 bg-[#0d1014] p-5 sm:p-6 shadow-xl space-y-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-white/6 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-lime-400/15 text-lime-400 border border-lime-400/30 shadow-lg shadow-lime-400/20">
              <Car className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-black text-white">
                  Garage Fleet & Vehicle Profiles
                </h3>
                <span className="rounded-full bg-lime-400/10 px-2.5 py-0.5 text-[10px] font-bold text-lime-300 border border-lime-400/30">
                  {vehicles.length} {vehicles.length === 1 ? 'Profile' : 'Profiles'}
                </span>
              </div>
              <p className="mt-0.5 text-xs text-zinc-400">
                Switch the active telemetry cockpit or register another vehicle to your garage.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setIsAddVehicleModalOpen(true)}
              className="inline-flex items-center gap-2 rounded-xl bg-lime-400 px-4 py-2.5 text-xs font-bold text-zinc-950 transition hover:bg-lime-300 shadow-md shadow-lime-400/20 active:scale-[0.99]"
            >
              <Plus className="h-4 w-4" />
              <span>Add Vehicle Profile</span>
            </button>
          </div>
        </div>

        {switchFeedback && (
          <div className="flex items-center gap-2 rounded-xl border border-lime-400/30 bg-lime-400/10 p-3 text-xs text-lime-300 animate-in fade-in">
            <CheckCircle2 className="h-4 w-4 shrink-0 text-lime-400" />
            <span>{switchFeedback}</span>
          </div>
        )}

        {/* Vehicles Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {vehicles.map((v) => {
            const isActive = v.id === primaryVehicle?.id
            const visual = resolveVehicleVisual(v)

            return (
              <div
                key={v.id}
                className={`relative flex flex-col justify-between rounded-2xl border p-4.5 transition-all ${
                  isActive
                    ? 'border-lime-400/50 bg-lime-400/5 shadow-lg shadow-lime-400/10 ring-1 ring-lime-400/30'
                    : 'border-white/8 bg-[#12161c] hover:border-white/15'
                }`}
              >
                <div>
                  {/* Top row: thumbnail + title + status pill */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-black/40 overflow-hidden p-1">
                        {visual?.imageSrc ? (
                          <img
                            src={visual.imageSrc}
                            alt={v.name}
                            className="h-full w-full object-contain"
                            onError={(e) => {
                              e.target.style.display = 'none'
                            }}
                          />
                        ) : (
                          <Car className="h-5 w-5 text-lime-400" />
                        )}
                      </div>

                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-black text-white">
                            {v.name}
                          </h4>
                        </div>
                        <p className="text-xs text-zinc-400">
                          {v.brand !== 'None' ? v.brand : ''} {v.model !== 'None' ? v.model : ''}
                          {v.brand === 'None' && v.model === 'None' ? 'Unspecified Model' : ''}
                        </p>
                      </div>
                    </div>

                    {/* Active status pill */}
                    {isActive ? (
                      <span className="inline-flex items-center gap-1.5 rounded-full border border-lime-400/40 bg-lime-400/15 px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-lime-300">
                        <span className="h-1.5 w-1.5 rounded-full bg-lime-400 animate-pulse" />
                        Active Cockpit
                      </span>
                    ) : (
                      <span className="rounded-full border border-white/6 bg-white/4 px-2.5 py-1 text-[10px] font-bold text-zinc-400">
                        Profile
                      </span>
                    )}
                  </div>

                  {/* Metadata & Specs Grid */}
                  <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                    <div className="rounded-xl border border-white/6 bg-black/30 p-2">
                      <span className="block text-[9px] uppercase tracking-wider text-zinc-500">
                        Plate
                      </span>
                      <span className="font-mono font-bold text-zinc-200 text-[11px] truncate block">
                        {v.plate}
                      </span>
                    </div>

                    <div className="rounded-xl border border-white/6 bg-black/30 p-2">
                      <span className="block text-[9px] uppercase tracking-wider text-zinc-500">
                        Class
                      </span>
                      <span className="font-bold text-zinc-200 text-[11px] truncate block">
                        {v.subType || v.category}
                      </span>
                    </div>

                    <div className="rounded-xl border border-white/6 bg-black/30 p-2">
                      <span className="block text-[9px] uppercase tracking-wider text-zinc-500">
                        Engine
                      </span>
                      <span className="font-mono font-bold text-zinc-200 text-[11px] truncate block">
                        {v.engineCc} CC
                      </span>
                    </div>

                    <div className="rounded-xl border border-white/6 bg-black/30 p-2">
                      <span className="block text-[9px] uppercase tracking-wider text-zinc-500">
                        Odometer
                      </span>
                      <span className="font-mono font-bold text-lime-400 text-[11px] truncate block">
                        {Number(v.mileage || 0).toLocaleString('en-IN')} km
                      </span>
                    </div>
                  </div>
                </div>

                {/* Bottom Action Bar */}
                <div className="mt-4 pt-3 border-t border-white/6 flex items-center justify-between">
                  <div>
                    {isActive ? (
                      <span className="inline-flex items-center gap-1.5 text-xs font-bold text-lime-400">
                        <CheckCircle2 className="h-4 w-4" />
                        <span>Currently Selected</span>
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleSwitchVehicle(v.id)}
                        className="inline-flex items-center gap-1.5 rounded-xl bg-lime-400 px-3.5 py-1.5 text-xs font-bold text-zinc-950 transition hover:bg-lime-300 shadow-md shadow-lime-400/20 active:scale-[0.98]"
                      >
                        <Zap className="h-3.5 w-3.5" />
                        <span>Switch to this Vehicle</span>
                      </button>
                    )}
                  </div>

                  {vehicles.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleDeleteVehicle(v)}
                      className="rounded-xl p-1.5 text-zinc-500 hover:bg-rose-500/10 hover:text-rose-400 transition"
                      title="Delete vehicle profile"
                      aria-label={`Delete ${v.name}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </section>

      {/* 3. Balanced 2-Column Settings Hub (Data Export & Reports vs Units & Diagnostics) */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Left Column: Data Reports & Export Backups */}
        <section className="flex flex-col justify-between rounded-2xl border border-white/10 bg-[#0d1014] p-5 sm:p-6 shadow-xl space-y-5">
          <div>
            <div className="flex items-center gap-3 border-b border-white/6 pb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-lime-400/15 text-lime-400 border border-lime-400/30">
                <HardDrive className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">
                  Data Exports & Reports
                </h3>
                <p className="text-xs text-zinc-400">
                  Export PDF documentation and JSON snapshot backups
                </p>
              </div>
            </div>

            <div className="mt-5 space-y-4">
              {/* Comprehensive PDF Report Block */}
              <div className="rounded-xl border border-lime-400/25 bg-linear-to-br from-lime-400/10 via-[#12161c] to-[#0c0f12] p-4 shadow-sm">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-xs font-bold text-white">
                        Official Vehicle PDF Inspection Report
                      </h4>
                      <span className="rounded-full bg-lime-400/20 px-2 py-0.5 text-[9px] font-bold text-lime-300">
                        Printable
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-zinc-400">
                      Export full vehicle service history, fuel records, expenses, and specifications formatted as a professional PDF.
                    </p>
                  </div>
                </div>
                <div className="mt-3.5">
                  <button
                    type="button"
                    onClick={() => setIsReportModalOpen(true)}
                    className="inline-flex items-center gap-2 rounded-xl bg-lime-400 px-4 py-2 text-xs font-bold text-zinc-950 transition hover:bg-lime-300 shadow-md shadow-lime-400/20 active:scale-[0.98]"
                  >
                    <Download className="h-3.5 w-3.5" />
                    <span>Download PDF Report</span>
                  </button>
                </div>
              </div>

              {/* JSON Backup Block */}
              <div className="rounded-xl border border-white/8 bg-[#12161c] p-4">
                <h4 className="text-xs font-bold text-white">
                  Export Garage Backup (JSON Snapshot)
                </h4>
                <p className="mt-1 text-xs text-zinc-400">
                  Download an offline JSON copy of all vehicles, telemetry records, and reminders.
                </p>
                <div className="mt-3 flex items-center gap-3">
                  <button
                    type="button"
                    onClick={handleExportBackup}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-3.5 py-2 text-xs font-semibold text-zinc-200 transition-colors hover:bg-white/10 hover:border-lime-400/40"
                  >
                    <Download className="h-3.5 w-3.5" />
                    <span>Download JSON Backup</span>
                  </button>
                  {downloadSuccess && (
                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-lime-400">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      Exported!
                    </span>
                  )}
                </div>
              </div>

              {/* Cache & Sync Block */}
              <div className="rounded-xl border border-white/8 bg-[#12161c] p-4">
                <h4 className="text-xs font-bold text-white">
                  Telemetry Sync & Cache
                </h4>
                <p className="mt-1 text-xs text-zinc-400">
                  Re-fetch garage telemetry and refresh client cache.
                </p>
                <div className="mt-3 flex items-center gap-3">
                  <button
                    type="button"
                    onClick={handleClearCache}
                    disabled={loading}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-3.5 py-2 text-xs font-semibold text-zinc-200 transition-colors hover:bg-white/10 disabled:opacity-50"
                  >
                    <RefreshCw
                      className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`}
                    />
                    <span>Sync & Clear Cache</span>
                  </button>
                  {cacheCleared && (
                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-lime-400">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      Refreshed!
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Right Column: Measurement Units & System Diagnostics */}
        <section className="flex flex-col justify-between rounded-2xl border border-white/10 bg-[#0d1014] p-5 sm:p-6 shadow-xl space-y-5">
          <div>
            <div className="flex items-center gap-3 border-b border-white/6 pb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-lime-400/15 text-lime-400 border border-lime-400/30">
                <Gauge className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">
                  Display Units & Diagnostics
                </h3>
                <p className="text-xs text-zinc-400">
                  Telemetry standards and active profile specs
                </p>
              </div>
            </div>

            {/* Units List */}
            <div className="mt-5 space-y-2.5 text-xs">
              <div className="flex items-center justify-between rounded-xl bg-white/3 border border-white/6 px-3.5 py-2">
                <span className="flex items-center gap-2 font-medium text-zinc-300">
                  <IndianRupee className="h-3.5 w-3.5 text-lime-400" />
                  Currency
                </span>
                <span className="font-mono font-bold text-white">₹ INR</span>
              </div>

              <div className="flex items-center justify-between rounded-xl bg-white/3 border border-white/6 px-3.5 py-2">
                <span className="flex items-center gap-2 font-medium text-zinc-300">
                  <Gauge className="h-3.5 w-3.5 text-lime-400" />
                  Distance & Odometer
                </span>
                <span className="font-mono font-bold text-white">Kilometers (km)</span>
              </div>

              <div className="flex items-center justify-between rounded-xl bg-white/3 border border-white/6 px-3.5 py-2">
                <span className="flex items-center gap-2 font-medium text-zinc-300">
                  <Fuel className="h-3.5 w-3.5 text-lime-400" />
                  Fuel Volume
                </span>
                <span className="font-mono font-bold text-white">Liters (L)</span>
              </div>

              <div className="flex items-center justify-between rounded-xl bg-white/3 border border-white/6 px-3.5 py-2">
                <span className="flex items-center gap-2 font-medium text-zinc-300">
                  <Sparkles className="h-3.5 w-3.5 text-lime-400" />
                  Fuel Mileage Efficiency
                </span>
                <span className="font-mono font-bold text-white">km/L</span>
              </div>

              <div className="flex items-center justify-between rounded-xl bg-white/3 border border-white/6 px-3.5 py-2">
                <span className="flex items-center gap-2 font-medium text-zinc-300">
                  <Check className="h-3.5 w-3.5 text-lime-400" />
                  Speedometer Standard
                </span>
                <span className="font-mono font-bold text-white">km/h</span>
              </div>
            </div>

            {/* Integrated Diagnostics & Active Profile Overview */}
            <div className="mt-4 pt-4 border-t border-white/6">
              <div className="flex items-center gap-2 mb-3">
                <ShieldCheck className="h-4 w-4 text-lime-400" />
                <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-300">
                  Active Cockpit Diagnostics
                </h4>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="rounded-xl border border-white/6 bg-black/40 p-2.5">
                  <span className="block text-[10px] uppercase tracking-wider text-zinc-500">
                    Active Vehicle
                  </span>
                  <p className="font-bold text-white truncate mt-0.5">
                    {primaryVehicle?.name || 'Vehicle'}
                  </p>
                  <p className="text-[10px] text-zinc-400 truncate">
                    {primaryVehicle?.brand !== 'None' ? primaryVehicle?.brand : ''} {primaryVehicle?.model !== 'None' ? primaryVehicle?.model : ''}
                  </p>
                </div>

                <div className="rounded-xl border border-white/6 bg-black/40 p-2.5">
                  <span className="block text-[10px] uppercase tracking-wider text-zinc-500">
                    Registration Plate
                  </span>
                  <p className="font-mono font-bold text-lime-300 truncate mt-0.5">
                    {primaryVehicle?.plate || 'None'}
                  </p>
                  <p className="text-[10px] text-zinc-400">
                    {primaryVehicle?.category || 'Two Wheeler'}
                  </p>
                </div>

                <div className="rounded-xl border border-white/6 bg-black/40 p-2.5">
                  <span className="block text-[10px] uppercase tracking-wider text-zinc-500">
                    Engine & Fuel
                  </span>
                  <p className="font-bold text-white truncate mt-0.5">
                    {Number(primaryVehicle?.engineCc || 0).toLocaleString()} CC
                  </p>
                  <p className="text-[10px] text-zinc-400 truncate">
                    {primaryVehicle?.fuelType || 'Petrol'}
                  </p>
                </div>

                <div className="rounded-xl border border-white/6 bg-black/40 p-2.5">
                  <span className="block text-[10px] uppercase tracking-wider text-zinc-500">
                    Telemetry Version
                  </span>
                  <p className="font-mono font-bold text-lime-400 truncate mt-0.5">
                    v1.2.0
                  </p>
                  <p className="text-[10px] text-zinc-400">
                    Production Release
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* 4. The Chronicle · The Story Behind MKD Software */}
      <section className="relative overflow-hidden rounded-2xl border border-white/10 bg-[#0d1014] p-5 sm:p-6 shadow-xl">
        <div className="pointer-events-none absolute top-0 right-0 -mt-10 -mr-10 h-44 w-44 rounded-full bg-lime-400/5 blur-3xl" />

        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-lime-400/15 text-lime-400 border border-lime-400/30">
            <BookOpen className="h-5 w-5" />
          </div>
          <div>
            <h3 className="flex items-center gap-2 text-base font-bold text-white">
              The Chronicle
              <span className="text-xs font-semibold text-lime-400">· Story Behind This Software</span>
            </h3>
            <p className="text-xs text-zinc-400">
              Why MKD Vehicle Management was conceived and created
            </p>
          </div>
        </div>

        <div className="mt-5 border-t border-white/8 pt-5">
          <blockquote className="rounded-2xl border-l-2 border-lime-400 bg-white/3 p-4 text-xs sm:text-sm leading-relaxed text-zinc-200 italic sm:p-5">
            &ldquo;After evaluating numerous vehicle management platforms, I found that existing solutions fell short—either offering limited functionality and stability issues in free tiers, or locking essential tools behind costly paywalls. Rather than compromising, I decided to build a custom solution that consolidates the strongest features from each platform into a single, seamless application.&rdquo;
          </blockquote>

          <div className="mt-6 flex flex-col justify-between gap-4 border-t border-white/6 pt-5">
            <div>
              <p className="text-xs font-bold text-white">Created & Maintained by Mubashir</p>
              <p className="text-[11px] text-zinc-400">Personal vehicle telemetry, maintenance & expense tracker</p>
            </div>

            {/* Structured Developer & Contact Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-2.5">
              <a
                href="https://www.instagram.com/0___.mubashir.__0?hvrq=eGdrOGQ1NmgxbTdl"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2.5 rounded-xl border border-white/8 bg-white/3 p-2.5 text-xs font-medium text-zinc-200 transition-all hover:border-pink-500/40 hover:bg-pink-500/10 hover:text-pink-300"
                title="Instagram Profile"
              >
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-pink-500/15 text-pink-400">
                  <InstagramIcon className="h-4 w-4" />
                </div>
                <div className="min-w-0">
                  <span className="block text-[10px] text-zinc-500 uppercase tracking-wider">Instagram</span>
                  <span className="truncate block font-bold text-zinc-200">@0___.mubashir.__0</span>
                </div>
              </a>

              <a
                href="mailto:ma2625645@gmail.com"
                className="flex items-center gap-2.5 rounded-xl border border-white/8 bg-white/3 p-2.5 text-xs font-medium text-zinc-200 transition-all hover:border-lime-400/40 hover:bg-lime-400/10 hover:text-lime-300"
                title="Send Email"
              >
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-lime-400/15 text-lime-400">
                  <Mail className="h-4 w-4" />
                </div>
                <div className="min-w-0">
                  <span className="block text-[10px] text-zinc-500 uppercase tracking-wider">Email</span>
                  <span className="truncate block font-bold text-zinc-200">ma2625645@gmail.com</span>
                </div>
              </a>

              <a
                href="https://wa.me/917889825292"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2.5 rounded-xl border border-white/8 bg-white/3 p-2.5 text-xs font-medium text-zinc-200 transition-all hover:border-emerald-400/40 hover:bg-emerald-400/10 hover:text-emerald-300"
                title="Chat on WhatsApp"
              >
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-emerald-400/15 text-emerald-400">
                  <WhatsAppIcon className="h-4 w-4" />
                </div>
                <div className="min-w-0">
                  <span className="block text-[10px] text-zinc-500 uppercase tracking-wider">WhatsApp</span>
                  <span className="truncate block font-bold text-zinc-200">+91 7889825292</span>
                </div>
              </a>

              <a
                href="https://demo-portfolio.example.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2.5 rounded-xl border border-white/8 bg-white/3 p-2.5 text-xs font-medium text-zinc-200 transition-all hover:border-lime-400/40 hover:bg-lime-400/10 hover:text-lime-300"
                title="Portfolio"
              >
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-lime-400/15 text-lime-400">
                  <ExternalLink className="h-4 w-4" />
                </div>
                <div className="min-w-0">
                  <span className="block text-[10px] text-zinc-500 uppercase tracking-wider">Portfolio</span>
                  <span className="truncate block font-bold text-zinc-200">Demo Link</span>
                </div>
              </a>

              <a
                href="https://demo-suggestions.example.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2.5 rounded-xl border border-white/8 bg-white/3 p-2.5 text-xs font-medium text-zinc-200 transition-all hover:border-lime-400/40 hover:bg-lime-400/10 hover:text-lime-300"
                title="Suggestions"
              >
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-lime-400/15 text-lime-400">
                  <MessageSquare className="h-4 w-4" />
                </div>
                <div className="min-w-0">
                  <span className="block text-[10px] text-zinc-500 uppercase tracking-wider">Feedback</span>
                  <span className="truncate block font-bold text-zinc-200">Suggestions</span>
                </div>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Danger Zone: Permanent Profile Reset & Delete All Data (Placed at very bottom) */}
      <section className="rounded-2xl border border-rose-500/30 bg-[#12080a] p-5 sm:p-6 shadow-xl space-y-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3.5">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-rose-500/15 text-rose-400 border border-rose-500/40 shadow-lg shadow-rose-500/10">
              <AlertTriangle className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-black text-white">
                  Danger Zone · Reset Profile & Delete All Data
                </h3>
                <span className="rounded-full bg-rose-500/20 px-2 py-0.5 text-[10px] font-bold text-rose-300 border border-rose-500/40">
                  Permanent & Irreversible
                </span>
              </div>
              <p className="mt-0.5 text-xs text-zinc-400">
                Permanently delete all vehicle profiles, telemetry, fuel records, service history, and uploaded documents, resetting your garage to a pristine initial state.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsResetModalOpen(true)}
            className="inline-flex items-center gap-2 rounded-xl border border-rose-500/40 bg-rose-500/15 px-4 py-2.5 text-xs font-bold text-rose-300 transition-all hover:bg-rose-600 hover:text-white shadow-md shadow-rose-900/30 self-start sm:self-auto shrink-0"
          >
            <Trash2 className="h-4 w-4" />
            <span>Reset & Delete All Data</span>
          </button>
        </div>
      </section>

      {/* Comprehensive PDF Report Modal */}
      <VehicleReportModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        primaryVehicle={primaryVehicle}
        fuelRefills={fuelRefills}
        maintenanceItems={maintenanceItems}
        serviceReminders={serviceReminders}
        componentServiceLogs={componentServiceLogs}
        vehicleRepairs={vehicleRepairs}
        vehicleDocuments={vehicleDocuments}
        vehicleModifications={vehicleModifications}
      />

      {/* Add New Vehicle Profile Modal */}
      <AddVehicleModal
        isOpen={isAddVehicleModalOpen}
        onClose={() => setIsAddVehicleModalOpen(false)}
        onVehicleAdded={(newVehicle) => {
          setSwitchFeedback(
            `New vehicle profile "${newVehicle.name}" registered and activated!`,
          )
          setTimeout(() => setSwitchFeedback(''), 3500)
        }}
      />

      {/* Manage Account & Change Password Modal */}
      <ManageAccountModal
        isOpen={isManageAccountOpen}
        onClose={() => setIsManageAccountOpen(false)}
      />

      {/* Permanently Reset & Delete All Data Modal */}
      <ResetDataModal
        isOpen={isResetModalOpen}
        onClose={() => setIsResetModalOpen(false)}
        onResetComplete={async () => {
          await resetAllData()
          setResetFeedback(
            'All garage data has been permanently deleted. Your profile has been reset to a clean default state.',
          )
          setTimeout(() => setResetFeedback(''), 6000)
        }}
      />
    </div>
  )
}