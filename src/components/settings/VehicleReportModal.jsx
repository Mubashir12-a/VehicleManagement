import {
  Download,
  FileText,
  Fuel,
  Gauge,
  ShieldCheck,
  Sparkles,
  Wrench,
  X,
} from 'lucide-react'
import { useMemo, useState } from 'react'
import { computeLatestFuelMileage } from '../../services/fleetService'
import { downloadVehiclePdf } from '../../utils/vehiclePdfGenerator'

function parseDate(dateStr) {
  if (!dateStr) return null
  const str = String(dateStr).trim()
  const d = new Date(str.includes('T') ? str : `${str}T00:00:00`)
  return isNaN(d.getTime()) ? null : d
}

function formatDate(dateStr) {
  if (!dateStr) return '—'
  const d = parseDate(dateStr)
  if (!d) return String(dateStr)
  return d.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

function getDateRangeBounds(rangeKey, customStart, customEnd) {
  const now = new Date()
  let start = new Date(0)
  let end = new Date(now.getTime() + 86400000)

  if (rangeKey === '1m') {
    start = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
  } else if (rangeKey === '3m') {
    start = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000)
  } else if (rangeKey === '6m') {
    start = new Date(now.getTime() - 180 * 24 * 60 * 60 * 1000)
  } else if (rangeKey === '1y') {
    start = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000)
  } else if (rangeKey === 'custom') {
    start = customStart ? new Date(`${customStart}T00:00:00`) : new Date(0)
    end = customEnd ? new Date(`${customEnd}T23:59:59`) : new Date()
  } else if (rangeKey === 'all') {
    start = new Date(0)
    end = new Date(now.getTime() + 86400000)
  }

  return { start, end }
}

export default function VehicleReportModal({
  isOpen,
  onClose,
  primaryVehicle,
  fuelRefills = [],
  maintenanceItems = [],
  serviceReminders = [],
  componentServiceLogs = [],
  vehicleRepairs = [],
  vehicleDocuments = [],
  vehicleModifications = [],
}) {
  const [rangeKey, setRangeKey] = useState('3m') // Default 3 months
  const [customStart, setCustomStart] = useState('')
  const [customEnd, setCustomEnd] = useState('')

  const [reportMetadata] = useState(() => {
    const now = new Date()
    return {
      generatedDate: now.toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      }),
      reportId: `MKD-${now.getTime().toString().slice(-8)}`,
      isoTimestamp: now.toISOString(),
    }
  })

  const { start: filterStart, end: filterEnd } = useMemo(
    () => getDateRangeBounds(rangeKey, customStart, customEnd),
    [rangeKey, customStart, customEnd],
  )

  const filterStartMs = filterStart.getTime()
  const filterEndMs = filterEnd.getTime()

  // Filtered Datasets based on selected range
  const filteredRefills = useMemo(() => {
    return (fuelRefills || []).filter((r) => {
      const d = parseDate(r.refillDate)
      if (!d) return false
      const t = d.getTime()
      return t >= filterStartMs && t <= filterEndMs
    })
  }, [fuelRefills, filterStartMs, filterEndMs])

  const filteredCompletedServices = useMemo(() => {
    return (serviceReminders || []).filter((s) => {
      if (s.status !== 'Completed') return false
      const d = parseDate(s.completedDate)
      if (!d) return false
      const t = d.getTime()
      return t >= filterStartMs && t <= filterEndMs
    })
  }, [serviceReminders, filterStartMs, filterEndMs])

  const filteredServiceLogs = useMemo(() => {
    return (componentServiceLogs || []).filter((l) => {
      const d = parseDate(l.serviceDate)
      if (!d) return false
      const t = d.getTime()
      return t >= filterStartMs && t <= filterEndMs
    })
  }, [componentServiceLogs, filterStartMs, filterEndMs])

  const filteredRepairs = useMemo(() => {
    return (vehicleRepairs || []).filter((r) => {
      const d = parseDate(r.repairDate)
      if (!d) return false
      const t = d.getTime()
      return t >= filterStartMs && t <= filterEndMs
    })
  }, [vehicleRepairs, filterStartMs, filterEndMs])

  const filteredModifications = useMemo(() => {
    return (vehicleModifications || []).filter((m) => {
      const d = parseDate(m.installedDate)
      if (!d) return false
      const t = d.getTime()
      return t >= filterStartMs && t <= filterEndMs
    })
  }, [vehicleModifications, filterStartMs, filterEndMs])

  // Calculated Metrics
  const periodFuelSpend = useMemo(() => {
    return filteredRefills.reduce(
      (sum, r) => sum + (Number(r.amountSpent) || 0),
      0,
    )
  }, [filteredRefills])

  const periodFuelLiters = useMemo(() => {
    return filteredRefills.reduce(
      (sum, r) => sum + (Number(r.liters) || 0),
      0,
    )
  }, [filteredRefills])

  const avgPricePerLiter = useMemo(() => {
    if (periodFuelLiters <= 0) return 0
    return Number((periodFuelSpend / periodFuelLiters).toFixed(2))
  }, [periodFuelSpend, periodFuelLiters])

  const periodServicesSpend = useMemo(() => {
    const sCost = filteredCompletedServices.reduce(
      (sum, s) => sum + (Number(s.amountPaid) || 0),
      0,
    )
    const logCost = filteredServiceLogs.reduce(
      (sum, l) => sum + (Number(l.cost) || 0),
      0,
    )
    return sCost + logCost
  }, [filteredCompletedServices, filteredServiceLogs])

  const periodRepairsSpend = useMemo(() => {
    return filteredRepairs.reduce(
      (sum, r) => sum + (Number(r.cost) || 0),
      0,
    )
  }, [filteredRepairs])

  const periodModsSpend = useMemo(() => {
    return filteredModifications.reduce(
      (sum, m) => sum + (Number(m.cost) || 0),
      0,
    )
  }, [filteredModifications])

  const grandTotalPeriodSpend =
    periodFuelSpend + periodServicesSpend + periodRepairsSpend + periodModsSpend

  const latestMileage = useMemo(() => {
    return computeLatestFuelMileage(
      filteredRefills.length >= 2 ? filteredRefills : fuelRefills,
    )
  }, [filteredRefills, fuelRefills])

  // Component Health summary
  const currentOdo = Number(primaryVehicle?.mileage) || 0
  const totalItems = maintenanceItems.length || 18
  let dueItemsCount = 0
  maintenanceItems.forEach((item) => {
    const lastOdo = Number(item.lastServiceOdo) || 0
    const interval = Number(item.intervalKm) || 1000
    const passed = Math.max(0, currentOdo - lastOdo)
    if (interval - passed <= 0) dueItemsCount++
  })
  const healthyCount = Math.max(0, totalItems - dueItemsCount)

  // Report Period Label
  const periodLabel = useMemo(() => {
    if (rangeKey === '1m') return 'Last 1 Month'
    if (rangeKey === '3m') return 'Last 3 Months (Default)'
    if (rangeKey === '6m') return 'Last 6 Months'
    if (rangeKey === '1y') return 'Last 1 Year'
    if (rangeKey === 'all') return 'Complete Vehicle History (All Time)'
    if (rangeKey === 'custom') {
      return `Custom Range: ${formatDate(customStart)} – ${formatDate(customEnd || reportMetadata.isoTimestamp)}`
    }
    return 'Last 3 Months'
  }, [rangeKey, customStart, customEnd, reportMetadata.isoTimestamp])

  const handleDownloadPdf = () => {
    downloadVehiclePdf({
      primaryVehicle,
      periodLabel,
      dateRangeText: `${formatDate(filterStart)} – ${formatDate(filterEnd)}`,
      kpiData: {
        totalSpend: grandTotalPeriodSpend,
        latestMileage,
        totalLiters: periodFuelLiters,
        avgRate: avgPricePerLiter,
        healthyCount,
        totalItems,
      },
      filteredRefills,
      filteredCompletedServices,
      filteredServiceLogs,
      filteredRepairs,
      filteredModifications,
      vehicleDocuments,
      reportId: reportMetadata.reportId,
      generatedDate: reportMetadata.generatedDate,
    })
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-3 backdrop-blur-md sm:p-6 overflow-y-auto">
      <div className="relative flex max-h-[95vh] w-full max-w-5xl flex-col rounded-3xl border border-white/15 bg-[#0b0e12] shadow-[0_25px_70px_rgba(0,0,0,0.85)]">
        {/* Top Floating Control Bar */}
        <div className="sticky top-0 z-30 flex flex-wrap items-center justify-between gap-3 border-b border-white/10 bg-[#0c0f14]/95 px-5 py-4 backdrop-blur-md rounded-t-3xl">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-lime-400/15 text-lime-400">
              <FileText className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">
                Vehicle Report
              </h3>
              <p className="text-[11px] text-zinc-400">
                Download vehicle summary PDF
              </p>
            </div>
          </div>

          {/* Time Range Selector */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold text-zinc-400">Range:</span>
            <div className="inline-flex rounded-xl border border-white/10 bg-white/5 p-1 text-xs">
              {[
                { id: '1m', label: '1 Month' },
                { id: '3m', label: '3 Months (Default)' },
                { id: '6m', label: '6 Months' },
                { id: '1y', label: '1 Year' },
                { id: 'all', label: 'All Time' },
                { id: 'custom', label: 'Custom' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setRangeKey(tab.id)}
                  className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition-all ${
                    rangeKey === tab.id
                      ? 'bg-lime-400 text-zinc-950 font-bold shadow-md'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {rangeKey === 'custom' && (
              <div className="flex items-center gap-1.5 text-xs text-zinc-300">
                <input
                  type="date"
                  value={customStart}
                  onChange={(e) => setCustomStart(e.target.value)}
                  className="rounded-lg border border-white/10 bg-[#12161c] px-2 py-1 text-xs text-white"
                />
                <span>→</span>
                <input
                  type="date"
                  value={customEnd}
                  onChange={(e) => setCustomEnd(e.target.value)}
                  className="rounded-lg border border-white/10 bg-[#12161c] px-2 py-1 text-xs text-white"
                />
              </div>
            )}

            <button
              type="button"
              onClick={handleDownloadPdf}
              className="inline-flex items-center gap-1.5 rounded-xl bg-lime-400 px-4 py-2 text-xs font-black text-zinc-950 shadow-[0_0_16px_rgba(163,230,53,0.3)] transition-all hover:bg-lime-300 hover:scale-105"
            >
              <Download className="h-4 w-4" />
              <span>Download PDF</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-white/10 p-2 text-zinc-400 hover:bg-white/10 hover:text-white"
              title="Close modal"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Scrollable Printable Report Preview */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-8">
          <div
            id="mkd-report-printable-area"
            className="mx-auto max-w-4xl space-y-6 rounded-2xl border border-white/10 bg-[#0d1015] p-6 text-zinc-100 sm:p-8 shadow-2xl"
          >
            {/* 1. Header Banner & Identity */}
            <div className="relative overflow-hidden rounded-2xl border border-lime-400/30 bg-linear-to-br from-[#13181f] via-[#0b0e12] to-[#12171e] p-6 shadow-xl">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <div className="inline-flex items-center gap-2 rounded-full border border-lime-400/30 bg-lime-400/10 px-3 py-1 font-mono text-[10px] font-bold uppercase tracking-widest text-lime-400 shadow-[0_0_12px_rgba(163,230,53,0.2)]">
                    <Sparkles className="h-3 w-3" />
                    MKD Vehicle Management · Vehicle Report
                  </div>
                  <h1 className="mt-3 text-3xl font-black tracking-tight text-white uppercase sm:text-4xl">
                    {primaryVehicle?.model || 'Vehicle Name'}
                  </h1>
                  <p className="mt-1 text-sm font-extrabold uppercase tracking-widest text-zinc-400">
                    {primaryVehicle?.brand} · {primaryVehicle?.category}
                    {primaryVehicle?.subType ? ` (${primaryVehicle.subType})` : ''}
                  </p>
                </div>

                <div className="text-left sm:text-right">
                  <span className="inline-block rounded-xl border border-white/15 bg-white/5 px-3.5 py-1.5 font-mono text-base font-black tracking-wider text-lime-300">
                    {primaryVehicle?.plate || 'MH 12 AB 1234'}
                  </span>
                  <p className="mt-2 text-[11px] font-medium text-zinc-400">
                    Generated: {reportMetadata.generatedDate}
                  </p>
                  <p className="text-[10px] font-mono text-zinc-500">
                    Report ID: {reportMetadata.reportId}
                  </p>
                </div>
              </div>

              {/* Range Active Badge */}
              <div className="mt-5 flex items-center justify-between border-t border-white/10 pt-3 text-xs">
                <span className="text-zinc-400">
                  History Range:{' '}
                  <strong className="text-lime-300 font-bold">{periodLabel}</strong>
                </span>
                <span className="font-mono text-[11px] text-zinc-400">
                  {formatDate(filterStart)} → {formatDate(filterEnd)}
                </span>
              </div>
            </div>

            {/* 2. Executive KPI Summary Tiles */}
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 avoid-break">
              <div className="rounded-xl border border-white/10 bg-[#12161c] p-3.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                  Total Spend In Range
                </span>
                <p className="mt-1 font-mono text-xl font-black text-lime-400">
                  ₹{Math.round(grandTotalPeriodSpend).toLocaleString('en-IN')}
                </p>
                <span className="mt-0.5 block text-[10px] text-zinc-500">
                  Fuel ₹{Math.round(periodFuelSpend)} · Services ₹{Math.round(periodServicesSpend)}
                </span>
              </div>

              <div className="rounded-xl border border-white/10 bg-[#12161c] p-3.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                  Latest Fuel Mileage
                </span>
                <p className="mt-1 font-mono text-xl font-black text-white">
                  {latestMileage > 0 ? `${latestMileage} km/L` : '—'}
                </p>
                <span className="mt-0.5 block text-[10px] text-zinc-500">
                  Tank-to-Tank computed
                </span>
              </div>

              <div className="rounded-xl border border-white/10 bg-[#12161c] p-3.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                  Fuel Consumption
                </span>
                <p className="mt-1 font-mono text-xl font-black text-white">
                  {periodFuelLiters.toFixed(1)}{' '}
                  <span className="text-sm font-normal text-zinc-400">L</span>
                </p>
                <span className="mt-0.5 block text-[10px] text-zinc-500">
                  Avg ₹{avgPricePerLiter}/L
                </span>
              </div>

              <div className="rounded-xl border border-white/10 bg-[#12161c] p-3.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                  Component Health
                </span>
                <p className="mt-1 font-mono text-xl font-black text-lime-300">
                  {healthyCount}
                  <span className="text-sm text-zinc-400">/{totalItems}</span>
                </p>
                <span className="mt-0.5 block text-[10px] text-zinc-500">
                  {dueItemsCount > 0 ? `${dueItemsCount} Items Due` : '100% Optimal'}
                </span>
              </div>
            </div>

            {/* 3. Vehicle Specifications Grid */}
            <div className="rounded-2xl border border-white/10 bg-[#12161c] p-5 avoid-break">
              <h2 className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-lime-400 border-b border-white/8 pb-2">
                <Gauge className="h-4 w-4" />
                Vehicle Specifications & Identity
              </h2>
              <div className="mt-4 grid grid-cols-2 gap-y-3 gap-x-6 text-xs sm:grid-cols-4 font-mono">
                <div>
                  <span className="block text-[10px] text-zinc-500 uppercase">Make / Model</span>
                  <span className="font-bold text-white">{primaryVehicle?.brand} {primaryVehicle?.model}</span>
                </div>
                <div>
                  <span className="block text-[10px] text-zinc-500 uppercase">Registration Plate</span>
                  <span className="font-bold text-lime-300">{primaryVehicle?.plate}</span>
                </div>
                <div>
                  <span className="block text-[10px] text-zinc-500 uppercase">Engine & Fuel</span>
                  <span className="font-bold text-white">{primaryVehicle?.engineCc} CC · {primaryVehicle?.fuelType}</span>
                </div>
                <div>
                  <span className="block text-[10px] text-zinc-500 uppercase">Current Odometer</span>
                  <span className="font-bold text-white">{Number(primaryVehicle?.mileage || 0).toLocaleString('en-IN')} km</span>
                </div>
                <div>
                  <span className="block text-[10px] text-zinc-500 uppercase">Purchase Date</span>
                  <span className="text-zinc-200">{formatDate(primaryVehicle?.purchaseDate)}</span>
                </div>
                <div>
                  <span className="block text-[10px] text-zinc-500 uppercase">Ex-Showroom Price</span>
                  <span className="text-zinc-200">
                    {Number(primaryVehicle?.exShowroomPrice) > 0
                      ? `₹${Number(primaryVehicle?.exShowroomPrice).toLocaleString('en-IN')}`
                      : '—'}
                  </span>
                </div>
                <div>
                  <span className="block text-[10px] text-zinc-500 uppercase">Ownership / Driver</span>
                  <span className="text-zinc-200">{primaryVehicle?.driver || 'Owner'}</span>
                </div>
                <div>
                  <span className="block text-[10px] text-zinc-500 uppercase">Vehicle Status</span>
                  <span className="text-lime-400 font-bold">{primaryVehicle?.status || 'Active'}</span>
                </div>
              </div>
            </div>

            {/* 4. Fuel Refills & Efficiency Ledger */}
            <div className="rounded-2xl border border-white/10 bg-[#12161c] p-5 avoid-break">
              <div className="flex items-center justify-between border-b border-white/8 pb-2">
                <h2 className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-lime-400">
                  <Fuel className="h-4 w-4" />
                  Fuel Refills & Mileage History ({filteredRefills.length} logs in range)
                </h2>
                <span className="font-mono text-xs font-bold text-zinc-300">
                  Total: ₹{Math.round(periodFuelSpend).toLocaleString('en-IN')} ({periodFuelLiters.toFixed(1)} L)
                </span>
              </div>

              {filteredRefills.length > 0 ? (
                <div className="mt-3 overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr>
                        <th>Date</th>
                        <th>Station & City</th>
                        <th>Odometer</th>
                        <th>Liters</th>
                        <th>Rate (₹/L)</th>
                        <th>Fill Type</th>
                        <th className="text-right">Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredRefills.map((refill, i) => (
                        <tr key={refill.id || i}>
                          <td className="font-mono">{formatDate(refill.refillDate)}</td>
                          <td>
                            <span className="font-bold text-white">{refill.stationName || 'Fuel Station'}</span>
                            {refill.location && <span className="text-zinc-400 text-[10px] block">{refill.location}</span>}
                          </td>
                          <td className="font-mono">{Number(refill.odometerKm || 0).toLocaleString('en-IN')} km</td>
                          <td className="font-mono font-bold text-zinc-200">{Number(refill.liters || 0).toFixed(2)} L</td>
                          <td className="font-mono">₹{Number(refill.pricePerLiter || 0).toFixed(2)}</td>
                          <td>
                            <span
                              className={`rounded px-1.5 py-0.5 text-[9px] font-bold ${
                                refill.fuelFillType === 'Full Tank'
                                  ? 'border border-lime-400/30 bg-lime-400/10 text-lime-300'
                                  : 'border border-amber-400/30 bg-amber-400/10 text-amber-300'
                              }`}
                            >
                              {refill.fuelFillType || 'Partial'}
                            </span>
                          </td>
                          <td className="text-right font-mono font-bold text-lime-400">
                            ₹{Number(refill.amountSpent || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="mt-3 text-xs text-zinc-500 italic">No fuel refills logged in this period.</p>
              )}
            </div>

            {/* 5. Completed Periodic Services & Maintenance Logs */}
            <div className="rounded-2xl border border-white/10 bg-[#12161c] p-5 avoid-break">
              <div className="flex items-center justify-between border-b border-white/8 pb-2">
                <h2 className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-lime-400">
                  <Wrench className="h-4 w-4" />
                  Periodic Services & Component History ({filteredCompletedServices.length + filteredServiceLogs.length} logs)
                </h2>
                <span className="font-mono text-xs font-bold text-zinc-300">
                  Total: ₹{Math.round(periodServicesSpend).toLocaleString('en-IN')}
                </span>
              </div>

              {filteredCompletedServices.length > 0 || filteredServiceLogs.length > 0 ? (
                <div className="mt-3 overflow-x-auto space-y-4">
                  {filteredCompletedServices.length > 0 && (
                    <div>
                      <p className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 mb-2">Periodic Services Done</p>
                      <table className="w-full text-left">
                        <thead>
                          <tr>
                            <th>Service Title</th>
                            <th>Completed Date</th>
                            <th>Odometer</th>
                            <th>Service Center</th>
                            <th>Invoice #</th>
                            <th className="text-right">Amount Paid</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredCompletedServices.map((s, i) => (
                            <tr key={s.id || i}>
                              <td className="font-bold text-white">{s.title}</td>
                              <td className="font-mono">{formatDate(s.completedDate)}</td>
                              <td className="font-mono">{s.completedOdometerKm ? `${s.completedOdometerKm.toLocaleString('en-IN')} km` : '—'}</td>
                              <td>{s.serviceCenter || 'Authorized Center'}</td>
                              <td className="font-mono text-[10px]">{s.invoiceNo || '—'}</td>
                              <td className="text-right font-mono font-bold text-lime-400">
                                ₹{Number(s.amountPaid || 0).toLocaleString('en-IN')}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}

                  {filteredServiceLogs.length > 0 && (
                    <div>
                      <p className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 mb-2">Component Maintenance Logs</p>
                      <table className="w-full text-left">
                        <thead>
                          <tr>
                            <th>Date</th>
                            <th>Component</th>
                            <th>Odometer</th>
                            <th>Service Center</th>
                            <th>Notes</th>
                            <th className="text-right">Cost</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredServiceLogs.map((log, i) => (
                            <tr key={log.id || i}>
                              <td className="font-mono">{formatDate(log.serviceDate)}</td>
                              <td className="font-bold text-white">{log.componentName}</td>
                              <td className="font-mono">{log.odometerKm ? `${log.odometerKm.toLocaleString('en-IN')} km` : '—'}</td>
                              <td>{log.serviceCenter || 'Self / Workshop'}</td>
                              <td className="text-zinc-400 text-[10px]">{log.notes || 'Routine check & service'}</td>
                              <td className="text-right font-mono font-bold text-lime-400">
                                ₹{Number(log.cost || 0).toLocaleString('en-IN')}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              ) : (
                <p className="mt-3 text-xs text-zinc-500 italic">No service logs in this period.</p>
              )}
            </div>

            {/* 6. Repairs & Workshop Jobs */}
            {filteredRepairs.length > 0 && (
              <div className="rounded-2xl border border-white/10 bg-[#12161c] p-5 avoid-break">
                <div className="flex items-center justify-between border-b border-white/8 pb-2">
                  <h2 className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-lime-400">
                    <ShieldCheck className="h-4 w-4" />
                    Additional Repairs & Workshop Jobs ({filteredRepairs.length})
                  </h2>
                  <span className="font-mono text-xs font-bold text-zinc-300">
                    Total: ₹{Math.round(periodRepairsSpend).toLocaleString('en-IN')}
                  </span>
                </div>
                <div className="mt-3 overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr>
                        <th>Date</th>
                        <th>Repair Title</th>
                        <th>Odometer</th>
                        <th>Workshop</th>
                        <th>Notes</th>
                        <th className="text-right">Cost</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredRepairs.map((rep, i) => (
                        <tr key={rep.id || i}>
                          <td className="font-mono">{formatDate(rep.repairDate)}</td>
                          <td className="font-bold text-white">{rep.title}</td>
                          <td className="font-mono">{rep.odometerKm ? `${rep.odometerKm.toLocaleString('en-IN')} km` : '—'}</td>
                          <td>{rep.workshopName || 'Workshop'}</td>
                          <td className="text-zinc-400 text-[10px]">{rep.notes || '—'}</td>
                          <td className="text-right font-mono font-bold text-lime-400">
                            ₹{Number(rep.cost || 0).toLocaleString('en-IN')}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* 7. Accessories, Modifications & Riding Gear */}
            {filteredModifications.length > 0 && (
              <div className="rounded-2xl border border-white/10 bg-[#12161c] p-5 avoid-break">
                <div className="flex items-center justify-between border-b border-white/8 pb-2">
                  <h2 className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-lime-400">
                    <Sparkles className="h-4 w-4" />
                    Accessories, Gear & Modifications ({filteredModifications.length})
                  </h2>
                  <span className="font-mono text-xs font-bold text-zinc-300">
                    Total: ₹{Math.round(periodModsSpend).toLocaleString('en-IN')}
                  </span>
                </div>
                <div className="mt-3 overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr>
                        <th>Title / Equipment</th>
                        <th>Category</th>
                        <th>Brand</th>
                        <th>Installed Date</th>
                        <th>Installed By</th>
                        <th className="text-right">Cost</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredModifications.map((mod, i) => (
                        <tr key={mod.id || i}>
                          <td className="font-bold text-white">{mod.title}</td>
                          <td>
                            <span className="rounded bg-white/5 border border-white/10 px-1.5 py-0.5 text-[9px] font-semibold text-zinc-300">
                              {mod.category}
                            </span>
                          </td>
                          <td className="text-zinc-300">{mod.brand || '—'}</td>
                          <td className="font-mono">{formatDate(mod.installedDate)}</td>
                          <td className="text-zinc-400">{mod.installedBy || 'Self'}</td>
                          <td className="text-right font-mono font-bold text-lime-400">
                            ₹{Number(mod.cost || 0).toLocaleString('en-IN')}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* 8. Vehicle Documentation Status */}
            <div className="rounded-2xl border border-white/10 bg-[#12161c] p-5 avoid-break">
              <h2 className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-lime-400 border-b border-white/8 pb-2">
                <FileText className="h-4 w-4" />
                Vehicle Documents & Legal Compliance
              </h2>
              <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 text-xs">
                {(vehicleDocuments || []).map((doc, idx) => {
                  const docTitle = doc.title || doc.name || 'Vehicle Document'
                  const docNum = doc.docNumber || doc.policyNumber || 'Active'
                  return (
                    <div
                      key={doc.id || idx}
                      className="rounded-xl border border-white/8 bg-[#0b0e12] p-3.5 space-y-1"
                    >
                      <h4 className="text-xs font-bold text-white leading-tight">
                        {docTitle}
                      </h4>
                      <p className="font-mono text-[11px] font-semibold text-lime-300">
                        {docNum}
                      </p>
                      <p className="text-[10px] text-zinc-400">
                        Expires: {formatDate(doc.expiryDate)}
                        {doc.issuer ? ` · ${doc.issuer}` : ''}
                      </p>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* 9. Report Footer */}
            <div className="flex flex-col sm:flex-row items-center justify-between border-t border-white/10 pt-4 text-[10px] text-zinc-500 avoid-break font-mono">
              <p>MKD Garage Vehicle Report</p>
              <p>Vehicle: {primaryVehicle?.plate} · Timestamp: {reportMetadata.isoTimestamp}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
