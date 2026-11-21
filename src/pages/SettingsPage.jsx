import {
  BookOpen,
  Check,
  CheckCircle2,
  Download,
  ExternalLink,
  Fuel,
  Gauge,
  HardDrive,
  IndianRupee,
  Mail,
  MessageSquare,
  RefreshCw,
  ShieldCheck,
  Sparkles,
} from 'lucide-react'
import { useState } from 'react'
import PageHeader from '../components/common/PageHeader'
import VehicleReportModal from '../components/settings/VehicleReportModal'
import { useFleetData } from '../hooks/useFleetData'

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
    primaryVehicle,
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

  const [downloadSuccess, setDownloadSuccess] = useState(false)
  const [cacheCleared, setCacheCleared] = useState(false)
  const [isReportModalOpen, setIsReportModalOpen] = useState(false)

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

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Comprehensive Vehicle PDF Report Card */}
        <section className="rounded-2xl border border-lime-400/30 bg-linear-to-br from-[#12171e] via-[#0d1014] to-[#0c0f12] p-6 shadow-xl lg:col-span-2">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-lime-400/20 text-lime-400 shadow-[0_0_16px_rgba(163,230,53,0.25)]">
                <Download className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-base font-black text-white">
                  Vehicle PDF Report
                </h3>
                <p className="mt-0.5 text-xs text-zinc-400">
                  Export your vehicle service records, fuel logs, and specs as a PDF.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => setIsReportModalOpen(true)}
                className="inline-flex items-center gap-2 rounded-xl bg-lime-400 px-4 py-2.5 text-xs font-black text-zinc-950 shadow-[0_0_16px_rgba(163,230,53,0.25)] transition-all hover:bg-lime-300 hover:scale-[1.02]"
              >
                <Download className="h-4 w-4" />
                Download PDF Report
              </button>
            </div>
          </div>
        </section>

        {/* Telemetry & Display Units */}
        <section className="rounded-2xl border border-white/10 bg-[#0d1014] p-6 shadow-xl">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-lime-400/15 text-lime-400">
              <Gauge className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                Display & Telemetry Units
              </h3>
              <p className="text-xs text-zinc-400">
                Measurement standards and currency formatting
              </p>
            </div>
          </div>

          <div className="mt-5 space-y-3.5 border-t border-white/8 pt-4 text-xs">
            <div className="flex items-center justify-between rounded-xl bg-white/4 px-4 py-2.5">
              <span className="flex items-center gap-2 font-medium text-zinc-300">
                <IndianRupee className="h-3.5 w-3.5 text-lime-400" />
                Currency
              </span>
              <span className="font-mono font-bold text-white">₹ INR (Indian Rupee)</span>
            </div>

            <div className="flex items-center justify-between rounded-xl bg-white/4 px-4 py-2.5">
              <span className="flex items-center gap-2 font-medium text-zinc-300">
                <Gauge className="h-3.5 w-3.5 text-lime-400" />
                Distance & Odometer
              </span>
              <span className="font-mono font-bold text-white">Kilometers (km)</span>
            </div>

            <div className="flex items-center justify-between rounded-xl bg-white/4 px-4 py-2.5">
              <span className="flex items-center gap-2 font-medium text-zinc-300">
                <Fuel className="h-3.5 w-3.5 text-lime-400" />
                Fuel Volume
              </span>
              <span className="font-mono font-bold text-white">Liters (L)</span>
            </div>

            <div className="flex items-center justify-between rounded-xl bg-white/4 px-4 py-2.5">
              <span className="flex items-center gap-2 font-medium text-zinc-300">
                <Sparkles className="h-3.5 w-3.5 text-lime-400" />
                Fuel Mileage Efficiency
              </span>
              <span className="font-mono font-bold text-white">km/L (Tank-to-Tank & Trip)</span>
            </div>

            <div className="flex items-center justify-between rounded-xl bg-white/4 px-4 py-2.5">
              <span className="flex items-center gap-2 font-medium text-zinc-300">
                <Check className="h-3.5 w-3.5 text-lime-400" />
                Speed Gauge
              </span>
              <span className="font-mono font-bold text-white">km/h</span>
            </div>
          </div>
        </section>

        {/* Data Management & Backup */}
        <section className="rounded-2xl border border-white/10 bg-[#0d1014] p-6 shadow-xl">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-lime-400/15 text-lime-400">
              <HardDrive className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                Data Management & Backup
              </h3>
              <p className="text-xs text-zinc-400">
                Export garage history and manage application state
              </p>
            </div>
          </div>

          <div className="mt-5 space-y-4 border-t border-white/8 pt-4">
            <div className="rounded-xl border border-white/8 bg-[#12161c] p-4">
              <h4 className="text-xs font-bold text-white">
                Export Garage Backup
              </h4>
              <p className="mt-1 text-xs text-zinc-400">
                Download a complete JSON snapshot of your vehicle profile, maintenance logs, fuel refills, and modifications.
              </p>
              <div className="mt-3 flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleExportBackup}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-lime-400 px-3.5 py-2 text-xs font-bold text-zinc-950 transition-colors hover:bg-lime-300"
                >
                  <Download className="h-3.5 w-3.5" />
                  Download Backup (JSON)
                </button>
                {downloadSuccess && (
                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-lime-400">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    Backup exported!
                  </span>
                )}
              </div>
            </div>

            <div className="rounded-xl border border-white/8 bg-[#12161c] p-4">
              <h4 className="text-xs font-bold text-white">
                Sync & Refresh Garage State
              </h4>
              <p className="mt-1 text-xs text-zinc-400">
                Re-sync telemetry and clear temporary application caches.
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
                  Refresh & Clear Cache
                </button>
                {cacheCleared && (
                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-lime-400">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    Cache cleared & refreshed!
                  </span>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* System & Garage Profile Overview */}
        <section className="rounded-2xl border border-white/10 bg-[#0d1014] p-6 shadow-xl lg:col-span-2">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-lime-400/15 text-lime-400">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                Vehicle Profile & System Overview
              </h3>
              <p className="text-xs text-zinc-400">
                Active telemetry profile and system diagnostics
              </p>
            </div>
          </div>

          <div className="mt-5 grid grid-cols-2 gap-4 border-t border-white/8 pt-4 sm:grid-cols-4 text-xs">
            <div className="rounded-xl bg-white/4 p-3.5">
              <span className="block text-[11px] font-semibold uppercase tracking-wider text-zinc-500">
                Active Vehicle
              </span>
              <p className="mt-1 text-sm font-bold text-white">
                {primaryVehicle?.model || 'Vehicle'}
              </p>
              <p className="text-[11px] text-zinc-400">
                {primaryVehicle?.brand || ''}
              </p>
            </div>

            <div className="rounded-xl bg-white/4 p-3.5">
              <span className="block text-[11px] font-semibold uppercase tracking-wider text-zinc-500">
                Registration Plate
              </span>
              <p className="mt-1 font-mono text-sm font-bold text-lime-300">
                {primaryVehicle?.plate || '—'}
              </p>
              <p className="text-[11px] text-zinc-400">
                {primaryVehicle?.category || 'Two Wheeler'}
              </p>
            </div>

            <div className="rounded-xl bg-white/4 p-3.5">
              <span className="block text-[11px] font-semibold uppercase tracking-wider text-zinc-500">
                Engine & Fuel
              </span>
              <p className="mt-1 text-sm font-bold text-white">
                {Number(primaryVehicle?.engineCc || 0).toLocaleString()} CC
              </p>
              <p className="text-[11px] text-zinc-400">
                {primaryVehicle?.fuelType || 'Petrol (E10)'}
              </p>
            </div>

            <div className="rounded-xl bg-white/4 p-3.5">
              <span className="block text-[11px] font-semibold uppercase tracking-wider text-zinc-500">
                Telemetry Version
              </span>
              <p className="mt-1 font-mono text-sm font-bold text-lime-400">
                v1.2.0
              </p>
              <p className="text-[11px] text-zinc-400">
                Production Release
              </p>
            </div>
          </div>
        </section>

        {/* The Chronicle · The Story Behind MKD */}
        <section className="relative overflow-hidden rounded-2xl border border-white/10 bg-[#0d1014] p-6 shadow-xl lg:col-span-2">
          <div className="pointer-events-none absolute top-0 right-0 -mt-10 -mr-10 h-44 w-44 rounded-full bg-lime-400/5 blur-3xl" />

          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-lime-400/15 text-lime-400">
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
            <blockquote className="rounded-2xl border-l-2 border-lime-400 bg-white/3 p-4 text-sm leading-relaxed text-zinc-200 italic sm:p-5">
              &ldquo;After evaluating numerous vehicle management platforms, I found that existing solutions fell short—either offering limited functionality and stability issues in free tiers, or locking essential tools behind costly paywalls. Rather than compromising, I decided to build a custom solution that consolidates the strongest features from each platform into a single, seamless application.&rdquo;
            </blockquote>

            <div className="mt-6 flex flex-col justify-between gap-4 border-t border-white/6 pt-5 sm:flex-row sm:items-center">
              <div>
                <p className="text-xs font-bold text-white">Created & Maintained by Mubashir</p>
                <p className="text-[11px] text-zinc-400">Personal vehicle telemetry, maintenance & expense tracker</p>
              </div>

              {/* Creator & Contact Links */}
              <div className="flex flex-wrap items-center gap-2">
                <a
                  href="https://www.instagram.com/0___.mubashir.__0?hvrq=eGdrOGQ1NmgxbTdl"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold text-zinc-200 transition-colors hover:border-pink-500/40 hover:bg-pink-500/10 hover:text-pink-300"
                  title="Instagram Profile"
                >
                  <InstagramIcon className="h-3.5 w-3.5 text-pink-400" />
                  <span>@0___.mubashir.__0</span>
                </a>

                <a
                  href="mailto:ma2625645@gmail.com"
                  className="inline-flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold text-zinc-200 transition-colors hover:border-lime-400/40 hover:bg-lime-400/10 hover:text-lime-300"
                  title="Send Email"
                >
                  <Mail className="h-3.5 w-3.5 text-lime-400" />
                  <span>ma2625645@gmail.com</span>
                </a>

                <a
                  href="https://wa.me/917889825292"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold text-zinc-200 transition-colors hover:border-emerald-400/40 hover:bg-emerald-400/10 hover:text-emerald-300"
                  title="Chat on WhatsApp"
                >
                  <WhatsAppIcon className="h-3.5 w-3.5 text-emerald-400" />
                  <span>+91 7889825292</span>
                </a>

                <a
                  href="https://demo-portfolio.example.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold text-zinc-300 transition-colors hover:border-lime-400/40 hover:bg-lime-400/10 hover:text-lime-300"
                  title="Portfolio (Demo link)"
                >
                  <ExternalLink className="h-3.5 w-3.5 text-lime-400" />
                  <span>Portfolio: Demo link</span>
                </a>

                <a
                  href="https://demo-suggestions.example.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold text-zinc-300 transition-colors hover:border-lime-400/40 hover:bg-lime-400/10 hover:text-lime-300"
                  title="Suggestions (Demo link)"
                >
                  <MessageSquare className="h-3.5 w-3.5 text-lime-400" />
                  <span>Suggestions: Demo link</span>
                </a>
              </div>
            </div>
          </div>
        </section>
      </div>

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
    </div>
  )
}