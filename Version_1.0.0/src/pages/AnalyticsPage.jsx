import {
  Calendar,
  CheckCircle2,
  Database,
  FileText,
  Fuel,
  Layers,
  RefreshCw,
  Wrench,
} from 'lucide-react'
import { useMemo, useState } from 'react'
import AnimatedInvestmentChart from '../components/analytics/AnimatedInvestmentChart'
import PageHeader from '../components/common/PageHeader'
import { useFleetData } from '../hooks/useFleetData'

const CURRENT_YEAR = new Date().getFullYear()

const MONTH_NAMES = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
]

const FULL_MONTH_NAMES = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
]

function parseExpenseDate(dateStr) {
  if (!dateStr) return null
  const str = String(dateStr).trim()
  const match = str.match(/^(\d{4})-(\d{2})-(\d{2})/)
  if (match) {
    const year = parseInt(match[1], 10)
    const month = parseInt(match[2], 10) - 1 // 0-indexed month
    const day = parseInt(match[3], 10)
    return {
      year,
      month,
      day,
      isoDate: `${match[1]}-${match[2]}-${match[3]}`,
    }
  }
  const d = new Date(str)
  if (!isNaN(d.getTime())) {
    const year = d.getFullYear()
    const month = d.getMonth()
    const day = d.getDate()
    const isoDate = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    return { year, month, day, isoDate }
  }
  return null
}

export default function AnalyticsPage() {
  const {
    fuelRefills = [],
    componentServiceLogs = [],
    vehicleRepairs = [],
    serviceReminders = [],
    vehicleDocuments = [],
    source,
    loading,
    refresh,
  } = useFleetData()

  // View Mode: 'monthly' | 'yearly'
  const [viewMode, setViewMode] = useState('monthly')
  const [selectedYear, setSelectedYear] = useState(CURRENT_YEAR)
  const [selectedPeriodLabel, setSelectedPeriodLabel] = useState(null)

  // 1. Gather all individual expense transactions with exact date and category
  const allExpenses = useMemo(() => {
    const list = []

    // Fuel refills (handles amountSpent, totalCost, or liters * pricePerLiter)
    for (const refill of fuelRefills) {
      const cost = Number(
        refill.amountSpent ??
          refill.totalCost ??
          Number(refill.liters || 0) * Number(refill.pricePerLiter || 0),
      )
      const parsed = parseExpenseDate(refill.refillDate)
      if (cost > 0 && parsed) {
        list.push({
          id: `fuel-${refill.id}`,
          category: 'Fuel',
          title: `Fuel Refill (${refill.liters ? `${refill.liters} L` : 'Refill'})`,
          amount: cost,
          date: parsed.isoDate,
          year: parsed.year,
          month: parsed.month,
          notes: refill.stationName || refill.station || refill.fuelBrand || 'Fuel Refill',
        })
      }
    }

    // Component Service Logs
    for (const log of componentServiceLogs) {
      const cost = Number(log.cost ?? log.amount ?? 0)
      const parsed = parseExpenseDate(log.serviceDate)
      if (cost > 0 && parsed) {
        list.push({
          id: `log-${log.id}`,
          category: 'Maintenance',
          title: `${log.itemKey || 'Component'} Service`,
          amount: cost,
          date: parsed.isoDate,
          year: parsed.year,
          month: parsed.month,
          notes: log.notes || 'Component maintenance / replacement',
        })
      }
    }

    // Vehicle Repairs
    for (const repair of vehicleRepairs) {
      const cost = Number(repair.cost ?? repair.amount ?? 0)
      const parsed = parseExpenseDate(repair.repairDate)
      if (cost > 0 && parsed) {
        list.push({
          id: `repair-${repair.id}`,
          category: 'Repairs',
          title: repair.title || 'Vehicle Repair',
          amount: cost,
          date: parsed.isoDate,
          year: parsed.year,
          month: parsed.month,
          notes: repair.notes || repair.workshop || 'Repair / part replacement',
        })
      }
    }

    // Completed Service Reminders
    for (const reminder of serviceReminders) {
      if (reminder.status === 'Completed') {
        const cost = Number(reminder.amountPaid ?? reminder.amount_paid ?? 0)
        const parsed = parseExpenseDate(reminder.completedDate || reminder.dueDate)
        if (cost > 0 && parsed) {
          list.push({
            id: `reminder-${reminder.id}`,
            category: 'Periodic Service',
            title: reminder.title || 'Periodic Service',
            amount: cost,
            date: parsed.isoDate,
            year: parsed.year,
            month: parsed.month,
            notes: reminder.serviceCenter || reminder.notes || 'Completed periodic inspection',
          })
        }
      }
    }

    // Vehicle Documents (Insurance, RC, PUC, Warranty fees)
    for (const doc of vehicleDocuments) {
      const cost = Number(doc.amountPaid ?? doc.amount_paid ?? 0)
      const parsed = parseExpenseDate(doc.issueDate || doc.expiryDate || doc.createdAt)
      if (cost > 0 && parsed) {
        list.push({
          id: `doc-${doc.id}`,
          category: 'Documents',
          title: `${doc.title || 'Document'} (${doc.docNumber || 'Fee'})`,
          amount: cost,
          date: parsed.isoDate,
          year: parsed.year,
          month: parsed.month,
          notes: doc.issuer || doc.notes || 'Document renewal / policy payment',
        })
      }
    }

    return list.sort((a, b) => (a.date > b.date ? -1 : 1))
  }, [
    fuelRefills,
    componentServiceLogs,
    vehicleRepairs,
    serviceReminders,
    vehicleDocuments,
  ])

  // 2. Discover all available years in data
  const availableYears = useMemo(() => {
    const yearsSet = new Set([CURRENT_YEAR])
    for (const item of allExpenses) {
      if (!isNaN(item.year)) yearsSet.add(item.year)
    }
    return Array.from(yearsSet).sort((a, b) => b - a)
  }, [allExpenses])

  // 3. Compile Monthly Data for the selected year (12 months: Jan -> Dec)
  const monthlyData = useMemo(() => {
    return MONTH_NAMES.map((name, monthIndex) => {
      const monthExpenses = allExpenses.filter(
        (item) => item.year === selectedYear && item.month === monthIndex,
      )

      let fuelCost = 0
      let maintenanceCost = 0
      let repairsCost = 0
      let serviceCost = 0
      let documentsCost = 0

      for (const exp of monthExpenses) {
        if (exp.category === 'Fuel') fuelCost += exp.amount
        else if (exp.category === 'Maintenance') maintenanceCost += exp.amount
        else if (exp.category === 'Repairs') repairsCost += exp.amount
        else if (exp.category === 'Periodic Service') serviceCost += exp.amount
        else if (exp.category === 'Documents') documentsCost += exp.amount
      }

      const totalCost =
        fuelCost + maintenanceCost + repairsCost + serviceCost + documentsCost

      return {
        label: name,
        fullLabel: `${FULL_MONTH_NAMES[monthIndex]} ${selectedYear}`,
        monthIndex,
        year: selectedYear,
        fuelCost,
        maintenanceCost,
        repairsCost,
        serviceCost,
        documentsCost,
        totalCost,
        items: monthExpenses,
      }
    })
  }, [allExpenses, selectedYear])

  // 4. Compile Yearly Data (combining all 12 months for each year)
  const yearlyData = useMemo(() => {
    const sortedYears = availableYears.slice().sort((a, b) => a - b)
    return sortedYears.map((yr) => {
      const yearExpenses = allExpenses.filter((item) => item.year === yr)

      let fuelCost = 0
      let maintenanceCost = 0
      let repairsCost = 0
      let serviceCost = 0
      let documentsCost = 0

      for (const exp of yearExpenses) {
        if (exp.category === 'Fuel') fuelCost += exp.amount
        else if (exp.category === 'Maintenance') maintenanceCost += exp.amount
        else if (exp.category === 'Repairs') repairsCost += exp.amount
        else if (exp.category === 'Periodic Service') serviceCost += exp.amount
        else if (exp.category === 'Documents') documentsCost += exp.amount
      }

      const totalCost =
        fuelCost + maintenanceCost + repairsCost + serviceCost + documentsCost

      return {
        label: String(yr),
        fullLabel: `Year ${yr}`,
        year: yr,
        fuelCost,
        maintenanceCost,
        repairsCost,
        serviceCost,
        documentsCost,
        totalCost,
        items: yearExpenses,
      }
    })
  }, [allExpenses, availableYears])

  // Active chart data based on selected view mode
  const currentChartData = viewMode === 'monthly' ? monthlyData : yearlyData

  // Summary Metrics
  const totalInvestedInView = currentChartData.reduce(
    (sum, d) => sum + (d.totalCost || 0),
    0,
  )

  const highestBar = currentChartData.reduce(
    (max, d) => ((d.totalCost || 0) > (max.totalCost || 0) ? d : max),
    currentChartData[0] || { label: '—', totalCost: 0 },
  )

  const activePeriodsCount = currentChartData.filter((d) => (d.totalCost || 0) > 0).length
  const averageSpend =
    activePeriodsCount > 0 ? Math.round(totalInvestedInView / activePeriodsCount) : 0

  // Category totals for the active view
  const categoryTotals = useMemo(() => {
    let fuel = 0
    let docs = 0
    let maint = 0
    let repairs = 0
    let services = 0

    for (const d of currentChartData) {
      fuel += d.fuelCost || 0
      docs += d.documentsCost || 0
      maint += d.maintenanceCost || 0
      repairs += d.repairsCost || 0
      services += d.serviceCost || 0
    }

    return { fuel, docs, maint, repairs, services }
  }, [currentChartData])

  // Selected period transactions
  const activePeriodDetails = useMemo(() => {
    if (!selectedPeriodLabel) return null
    return currentChartData.find((d) => d.label === selectedPeriodLabel) || null
  }, [currentChartData, selectedPeriodLabel])

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        title="Vehicle Investment & Cost Analytics"
        description="Comprehensive financial expenditure tracking. Monitor total real money invested per month or combined by year without averaging."
        actions={
          <div className="flex flex-wrap items-center gap-2.5">
            <span
              className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${
                source === 'supabase'
                  ? 'border border-lime-400/30 bg-lime-400/10 text-lime-300 shadow-[0_0_12px_rgba(163,230,53,0.18)]'
                  : 'border border-amber-400/30 bg-amber-400/10 text-amber-300'
              }`}
            >
              <Database className="h-3.5 w-3.5" />
              {source === 'supabase' ? 'Supabase Connected' : 'Local Storage Mode'}
            </span>

            <button
              type="button"
              onClick={refresh}
              disabled={loading}
              className="inline-flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold text-zinc-300 transition-colors hover:bg-white/10 hover:text-white disabled:opacity-50"
              title="Refresh financial data"
            >
              <RefreshCw
                className={`h-3.5 w-3.5 ${loading ? 'animate-spin text-lime-400' : ''}`}
              />
              <span className="hidden sm:inline">Refresh</span>
            </button>
          </div>
        }
      />

      {/* Control Bar: Monthly / Yearly View Mode & Year Selector */}
      <div className="flex flex-col justify-between gap-4 rounded-3xl border border-white/8 bg-[#12161c] p-4 sm:flex-row sm:items-center sm:p-5">
        {/* Toggle between Monthly and Yearly */}
        <div className="flex items-center gap-1.5 rounded-2xl border border-white/10 bg-black/40 p-1.5">
          <button
            type="button"
            onClick={() => {
              setViewMode('monthly')
              setSelectedPeriodLabel(null)
            }}
            className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all ${
              viewMode === 'monthly'
                ? 'bg-lime-400 text-zinc-950 shadow-[0_0_16px_rgba(163,230,53,0.3)]'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Calendar className="h-4 w-4" />
            Monthly View (12 Months)
          </button>

          <button
            type="button"
            onClick={() => {
              setViewMode('yearly')
              setSelectedPeriodLabel(null)
            }}
            className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all ${
              viewMode === 'yearly'
                ? 'bg-lime-400 text-zinc-950 shadow-[0_0_16px_rgba(163,230,53,0.3)]'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Layers className="h-4 w-4" />
            Yearly View (Combined)
          </button>
        </div>

        {/* Year Selector (Visible in Monthly Mode) */}
        {viewMode === 'monthly' && (
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">
              Select Year:
            </span>
            <div className="flex items-center gap-1.5">
              {availableYears.map((yr) => (
                <button
                  key={yr}
                  type="button"
                  onClick={() => {
                    setSelectedYear(yr)
                    setSelectedPeriodLabel(null)
                  }}
                  className={`rounded-xl px-3 py-1.5 font-mono text-xs font-bold transition-all ${
                    selectedYear === yr
                      ? 'border border-lime-400/40 bg-lime-400/15 text-lime-300 ring-1 ring-lime-400/40 shadow-[0_0_12px_rgba(163,230,53,0.2)]'
                      : 'border border-white/8 bg-white/5 text-zinc-400 hover:border-white/20 hover:text-white'
                  }`}
                >
                  {yr}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Summary KPI Stat Cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:gap-4">
        {/* Total Money Invested */}
        <div className="rounded-2xl border border-white/8 bg-[#12161c] p-4">
          <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">
            {viewMode === 'monthly' ? `Total Invested (${selectedYear})` : 'All-Time Invested'}
          </span>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="font-mono text-2xl font-black text-lime-400 sm:text-3xl">
              ₹{totalInvestedInView.toLocaleString('en-IN')}
            </span>
          </div>
          <p className="mt-1 text-[11px] text-zinc-500">
            Exact total across all categories
          </p>
        </div>

        {/* Peak Spending Period */}
        <div className="rounded-2xl border border-white/8 bg-[#12161c] p-4">
          <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">
            Peak Spending
          </span>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="font-mono text-2xl font-black text-white sm:text-3xl">
              ₹{Number(highestBar.totalCost || 0).toLocaleString('en-IN')}
            </span>
          </div>
          <p className="mt-1 text-[11px] font-semibold text-lime-400">
            {highestBar.fullLabel || highestBar.label}
          </p>
        </div>

        {/* Fuel Investment */}
        <div className="rounded-2xl border border-white/8 bg-[#12161c] p-4">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">
              Fuel Spend
            </span>
            <Fuel className="h-4 w-4 text-lime-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="font-mono text-2xl font-black text-white sm:text-3xl">
              ₹{categoryTotals.fuel.toLocaleString('en-IN')}
            </span>
          </div>
          <p className="mt-1 text-[11px] text-zinc-500">
            {totalInvestedInView > 0
              ? `${Math.round((categoryTotals.fuel / totalInvestedInView) * 100)}% of total`
              : '0%'}
          </p>
        </div>

        {/* Average Active Spend */}
        <div className="rounded-2xl border border-white/8 bg-[#12161c] p-4">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">
              Avg Active Period
            </span>
            <Wrench className="h-4 w-4 text-emerald-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="font-mono text-2xl font-black text-white sm:text-3xl">
              ₹{averageSpend.toLocaleString('en-IN')}
            </span>
          </div>
          <p className="mt-1 text-[11px] text-zinc-500">
            Across {activePeriodsCount} active {viewMode === 'monthly' ? 'month(s)' : 'year(s)'}
          </p>
        </div>
      </div>

      {/* Main Animated Bar Chart */}
      <AnimatedInvestmentChart
        data={currentChartData}
        viewMode={viewMode}
        selectedYear={selectedYear}
        selectedPeriodLabel={selectedPeriodLabel}
        onSelectPeriod={(period) => {
          setSelectedPeriodLabel((prev) => (prev === period.label ? null : period.label))
        }}
      />

      {/* Detailed Category Investment Cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
        <div className="rounded-2xl border border-lime-400/15 bg-lime-400/5 p-4">
          <div className="flex items-center gap-2">
            <Fuel className="h-4 w-4 text-lime-400" />
            <span className="text-xs font-bold text-zinc-300">Fuel Refills</span>
          </div>
          <div className="mt-2 font-mono text-lg font-black text-lime-400">
            ₹{categoryTotals.fuel.toLocaleString('en-IN')}
          </div>
        </div>

        <div className="rounded-2xl border border-emerald-400/15 bg-emerald-400/5 p-4">
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-emerald-400" />
            <span className="text-xs font-bold text-zinc-300">Docs & Insurance</span>
          </div>
          <div className="mt-2 font-mono text-lg font-black text-emerald-400">
            ₹{categoryTotals.docs.toLocaleString('en-IN')}
          </div>
        </div>

        <div className="rounded-2xl border border-amber-400/15 bg-amber-400/5 p-4">
          <div className="flex items-center gap-2">
            <Wrench className="h-4 w-4 text-amber-400" />
            <span className="text-xs font-bold text-zinc-300">Wear & Parts</span>
          </div>
          <div className="mt-2 font-mono text-lg font-black text-amber-400">
            ₹{categoryTotals.maint.toLocaleString('en-IN')}
          </div>
        </div>

        <div className="rounded-2xl border border-cyan-400/15 bg-cyan-400/5 p-4">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-cyan-400" />
            <span className="text-xs font-bold text-zinc-300">Periodic Service</span>
          </div>
          <div className="mt-2 font-mono text-lg font-black text-cyan-400">
            ₹{categoryTotals.services.toLocaleString('en-IN')}
          </div>
        </div>

        <div className="rounded-2xl border border-rose-400/15 bg-rose-400/5 p-4">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-rose-400" />
            <span className="text-xs font-bold text-zinc-300">Other Repairs</span>
          </div>
          <div className="mt-2 font-mono text-lg font-black text-rose-400">
            ₹{categoryTotals.repairs.toLocaleString('en-IN')}
          </div>
        </div>
      </div>

      {/* Selected Period Transactions Ledger */}
      {activePeriodDetails && (
        <div className="space-y-3 rounded-3xl border border-white/8 bg-[#12161c] p-5 sm:p-6">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-base font-bold text-white">
                Expenditures for {activePeriodDetails.fullLabel || activePeriodDetails.label}
              </h4>
              <p className="text-xs text-zinc-400">
                Detailed transaction records for this period
              </p>
            </div>
            <span className="font-mono text-sm font-bold text-lime-400">
              Total: ₹{Number(activePeriodDetails.totalCost || 0).toLocaleString('en-IN')}
            </span>
          </div>

          {(!activePeriodDetails.items || activePeriodDetails.items.length === 0) ? (
            <p className="py-4 text-center text-xs text-zinc-500">
              No transactions recorded in this period.
            </p>
          ) : (
            <div className="overflow-hidden rounded-2xl border border-white/8 bg-black/40">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-white/8 bg-white/5 text-[11px] font-bold uppercase tracking-wider text-zinc-400">
                  <tr>
                    <th className="px-4 py-3">Date</th>
                    <th className="px-4 py-3">Description</th>
                    <th className="px-4 py-3">Category</th>
                    <th className="px-4 py-3">Notes</th>
                    <th className="px-4 py-3 text-right">Amount Invested</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/6 text-zinc-300">
                  {activePeriodDetails.items.map((item) => (
                    <tr key={item.id} className="transition-colors hover:bg-white/[0.02]">
                      <td className="px-4 py-3 font-mono text-zinc-300">
                        {item.date}
                      </td>
                      <td className="px-4 py-3 font-semibold text-white">
                        {item.title}
                      </td>
                      <td className="px-4 py-3">
                        <span className="rounded-full bg-white/5 px-2 py-0.5 text-[10px] font-bold text-zinc-300">
                          {item.category}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-zinc-400">
                        {item.notes || '—'}
                      </td>
                      <td className="px-4 py-3 text-right font-mono font-bold text-lime-400">
                        ₹{Number(item.amount).toLocaleString('en-IN')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
