import {
  ArrowUpRight,
  Award,
  Calendar,
  CreditCard,
  FileCheck,
  Filter,
  Fuel,
  Layers,
  Receipt,
  RefreshCw,
  Search,
  ShieldCheck,
  Sparkles,
  Wallet,
  Wrench,
} from 'lucide-react'
import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import PageHeader from '../components/common/PageHeader'
import { useAnimatedNumber } from '../hooks/useAnimatedNumber'
import { useFleetData } from '../hooks/useFleetData'

function parseLedgerDate(dateStr) {
  if (!dateStr) return { dateObj: new Date(0), formatted: '—', raw: '' }
  const str = String(dateStr).trim()
  const d = new Date(str.includes('T') ? str : `${str}T00:00:00`)
  if (isNaN(d.getTime())) {
    return { dateObj: new Date(0), formatted: str, raw: str }
  }
  return {
    dateObj: d,
    formatted: d.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }),
    raw: str,
  }
}

export default function FinanceHistoryPage() {
  const {
    primaryVehicle,
    fuelRefills = [],
    vehicleDocuments = [],
    componentServiceLogs = [],
    vehicleRepairs = [],
    serviceReminders = [],
    vehicleModifications = [],
    maintenance = [],
    summary = {},
    loading,
    refresh,
  } = useFleetData()

  const [activeFilter, setActiveFilter] = useState('ALL')
  const [searchQuery, setSearchQuery] = useState('')
  const [sortOrder, setSortOrder] = useState('DATE_DESC')

  // 1. Vehicle Purchase Spend (Ex-Showroom Price)
  const exShowroomPrice = Number(primaryVehicle?.exShowroomPrice) || 0

  // 2. Operational Total Spend (Sum of Fuel + Documents + Services + Modifications from every single rupee logged)
  const totalFuelSpend = Number(summary?.totalFuelSpend || 0)
  const totalDocumentsSpend = Number(summary?.totalDocumentsSpend || 0)
  const totalServicesSpend = Number(summary?.totalServicesSpend || 0)
  const totalModificationsSpend = Number(summary?.totalModificationsSpend || 0)
  const totalOperationalSpend = Number(summary?.totalSpendTillNow || 0)

  // 3. Lifetime Total Investment (Purchase + Operational Total Spend)
  const grandLifetimeInvestment = exShowroomPrice + totalOperationalSpend

  // Animated KPI numbers
  const animLifetime = useAnimatedNumber(grandLifetimeInvestment, 850, 0)
  const animOperational = useAnimatedNumber(totalOperationalSpend, 850, 0)
  const animExShowroom = useAnimatedNumber(exShowroomPrice, 850, 0)
  const animFuel = useAnimatedNumber(totalFuelSpend, 850, 0)
  const animDocs = useAnimatedNumber(totalDocumentsSpend, 850, 0)
  const animServices = useAnimatedNumber(totalServicesSpend, 850, 0)
  const animMods = useAnimatedNumber(totalModificationsSpend, 850, 0)

  // 4. Construct Full Unified Transaction Ledger
  const transactions = useMemo(() => {
    const list = []

    // 1. Vehicle Purchase Record
    if (exShowroomPrice > 0) {
      const pDate = parseLedgerDate(primaryVehicle?.purchaseDate)
      list.push({
        id: 'tx-purchase',
        type: 'PURCHASE',
        categoryLabel: 'Vehicle Purchase',
        title: `${primaryVehicle?.brand || 'Bajaj'} ${primaryVehicle?.model || 'NS400z'} (Ex-Showroom)`,
        subtitle: `Acquisition invoice · Plate: ${primaryVehicle?.plate || '—'}`,
        amount: exShowroomPrice,
        dateObj: pDate.dateObj,
        dateFormatted: pDate.formatted,
        dateRaw: pDate.raw,
        odometerKm: 0,
        badgeColor: 'border-lime-400/40 bg-lime-400/15 text-lime-300',
        icon: Award,
        isCapitalSpend: true,
      })
    }

    // 2. Fuel Refills
    for (const refill of fuelRefills) {
      const cost = Number(
        refill.amountSpent ??
          refill.totalCost ??
          Number(refill.liters || 0) * Number(refill.pricePerLiter || 0),
      ) || 0
      if (cost > 0) {
        const rDate = parseLedgerDate(refill.refillDate)
        list.push({
          id: `tx-fuel-${refill.id}`,
          type: 'FUEL',
          categoryLabel: 'Fuel Refill',
          title: refill.stationName || 'Fuel Station',
          subtitle: `${refill.liters ? `${refill.liters} L` : 'Refill'} @ ₹${refill.pricePerLiter || 105}/L · ${refill.fuelFillType || 'Full Tank'}`,
          amount: cost,
          dateObj: rDate.dateObj,
          dateFormatted: rDate.formatted,
          dateRaw: rDate.raw,
          odometerKm: Number(refill.odometerKm) || 0,
          badgeColor: 'border-amber-400/30 bg-amber-400/10 text-amber-300',
          icon: Fuel,
          isCapitalSpend: false,
        })
      }
    }

    // 3. Vehicle Documents (Insurance, RC, PUC, Warranty)
    for (const doc of vehicleDocuments) {
      const cost = Number(doc.amountPaid ?? doc.amount_paid ?? 0) || 0
      if (cost > 0) {
        const dDate = parseLedgerDate(doc.issueDate || doc.createdAt)
        list.push({
          id: `tx-doc-${doc.id}`,
          type: 'DOCUMENTS',
          categoryLabel: 'Documents & Legal',
          title: doc.title || 'Vehicle Document',
          subtitle: `Issuer: ${doc.issuer || 'Official Provider'} · Policy/Cert #${doc.docNumber || '—'}`,
          amount: cost,
          dateObj: dDate.dateObj,
          dateFormatted: dDate.formatted,
          dateRaw: dDate.raw,
          odometerKm: null,
          badgeColor: 'border-emerald-400/30 bg-emerald-400/10 text-emerald-300',
          icon: FileCheck,
          isCapitalSpend: false,
        })
      }
    }

    // 4. Component Service Logs
    for (const log of componentServiceLogs) {
      const cost = Number(log.cost ?? log.amount ?? 0) || 0
      if (cost > 0) {
        const lDate = parseLedgerDate(log.serviceDate || log.createdAt)
        list.push({
          id: `tx-log-${log.id}`,
          type: 'SERVICES',
          categoryLabel: 'Component Service',
          title: `${log.itemKey || 'Component'} Maintenance`,
          subtitle: log.notes || 'Component inspection or replacement',
          amount: cost,
          dateObj: lDate.dateObj,
          dateFormatted: lDate.formatted,
          dateRaw: lDate.raw,
          odometerKm: Number(log.serviceOdo) || null,
          badgeColor: 'border-cyan-400/30 bg-cyan-400/10 text-cyan-300',
          icon: Wrench,
          isCapitalSpend: false,
        })
      }
    }

    // 5. Vehicle Repairs
    for (const repair of vehicleRepairs) {
      const cost = Number(repair.cost ?? repair.amount ?? 0) || 0
      if (cost > 0) {
        const repDate = parseLedgerDate(repair.repairDate || repair.createdAt)
        list.push({
          id: `tx-rep-${repair.id}`,
          type: 'SERVICES',
          categoryLabel: 'Vehicle Repair',
          title: repair.repairTitle || 'Workshop Repair',
          subtitle: `Garage: ${repair.garageName || 'Authorized Service'} · ${repair.notes || 'Repair maintenance'}`,
          amount: cost,
          dateObj: repDate.dateObj,
          dateFormatted: repDate.formatted,
          dateRaw: repDate.raw,
          odometerKm: Number(repair.odometerKm) || null,
          badgeColor: 'border-rose-400/30 bg-rose-400/10 text-rose-300',
          icon: Wrench,
          isCapitalSpend: false,
        })
      }
    }

    // 6. Service Reminders (completed with cost)
    for (const rem of serviceReminders) {
      const cost = Number(rem.amountPaid ?? rem.cost ?? rem.amount ?? 0) || 0
      if (cost > 0) {
        const remDate = parseLedgerDate(rem.completedDate || rem.dueDate)
        list.push({
          id: `tx-rem-${rem.id}`,
          type: 'SERVICES',
          categoryLabel: 'Periodic Service',
          title: rem.title || 'Scheduled Service',
          subtitle: `${rem.serviceType || 'Periodic Inspection'} · Completed Service`,
          amount: cost,
          dateObj: remDate.dateObj,
          dateFormatted: remDate.formatted,
          dateRaw: remDate.raw,
          odometerKm: Number(rem.completedOdometerKm) || null,
          badgeColor: 'border-violet-400/30 bg-violet-400/10 text-violet-300',
          icon: ShieldCheck,
          isCapitalSpend: false,
        })
      }
    }

    // 7. Maintenance Logs
    for (const m of maintenance) {
      const cost = Number(m.estimatedCost ?? m.cost ?? 0) || 0
      if (cost > 0) {
        const mDate = parseLedgerDate(m.dueDate)
        list.push({
          id: `tx-mnt-${m.id}`,
          type: 'SERVICES',
          categoryLabel: 'Scheduled Maintenance',
          title: m.serviceType || 'Maintenance',
          subtitle: `Work Order: ${m.id} · Priority: ${m.priority || 'Normal'}`,
          amount: cost,
          dateObj: mDate.dateObj,
          dateFormatted: mDate.formatted,
          dateRaw: mDate.raw,
          odometerKm: null,
          badgeColor: 'border-indigo-400/30 bg-indigo-400/10 text-indigo-300',
          icon: Wrench,
          isCapitalSpend: false,
        })
      }
    }

    // 8. Vehicle Modifications & Accessories (Installed only)
    for (const mod of vehicleModifications) {
      if (mod.status === 'Installed' || !mod.status) {
        const cost = Number(mod.cost) || 0
        if (cost > 0) {
          const mDate = parseLedgerDate(mod.installedDate || mod.createdAt)
          list.push({
            id: `tx-mod-${mod.id}`,
            type: 'MODIFICATIONS',
            categoryLabel: 'Accessory / Mod',
            title: mod.title || 'Accessory',
            subtitle: `${mod.category || 'Accessory'} · ${mod.brand ? `Brand: ${mod.brand}` : 'Installed Part'}`,
            amount: cost,
            dateObj: mDate.dateObj,
            dateFormatted: mDate.formatted,
            dateRaw: mDate.raw,
            odometerKm: mod.odometerKm || null,
            badgeColor: 'border-fuchsia-400/30 bg-fuchsia-400/10 text-fuchsia-300',
            icon: Sparkles,
            isCapitalSpend: false,
          })
        }
      }
    }

    return list
  }, [
    exShowroomPrice,
    primaryVehicle,
    fuelRefills,
    vehicleDocuments,
    componentServiceLogs,
    vehicleRepairs,
    serviceReminders,
    vehicleModifications,
    maintenance,
  ])

  // Filtered & Sorted Transactions
  const filteredTransactions = useMemo(() => {
    let result = transactions

    if (activeFilter !== 'ALL') {
      result = result.filter((t) => t.type === activeFilter)
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim()
      result = result.filter(
        (t) =>
          t.title.toLowerCase().includes(q) ||
          t.subtitle.toLowerCase().includes(q) ||
          t.categoryLabel.toLowerCase().includes(q) ||
          t.dateRaw.toLowerCase().includes(q),
      )
    }

    return [...result].sort((a, b) => {
      if (sortOrder === 'DATE_DESC') {
        return b.dateObj.getTime() - a.dateObj.getTime()
      }
      if (sortOrder === 'DATE_ASC') {
        return a.dateObj.getTime() - b.dateObj.getTime()
      }
      if (sortOrder === 'AMOUNT_DESC') {
        return b.amount - a.amount
      }
      if (sortOrder === 'AMOUNT_ASC') {
        return a.amount - b.amount
      }
      return 0
    })
  }, [transactions, activeFilter, searchQuery, sortOrder])

  // Distribution calculations
  const totalAll = grandLifetimeInvestment || 1
  const pctPurchase = ((exShowroomPrice / totalAll) * 100).toFixed(1)
  const pctFuel = ((totalFuelSpend / totalAll) * 100).toFixed(1)
  const pctDocs = ((totalDocumentsSpend / totalAll) * 100).toFixed(1)
  const pctServices = ((totalServicesSpend / totalAll) * 100).toFixed(1)
  const pctMods = ((totalModificationsSpend / totalAll) * 100).toFixed(1)

  return (
    <div className="space-y-6">
      {/* 1. Header */}
      <PageHeader
        title="Finance History & Expenditures"
        description="Unified financial ledger tracking every single rupee spent across vehicle purchase, fuel, documents, services, and reserved custom slots."
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

      {/* 2. Top Summary KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Grand Lifetime Investment */}
        <div className="relative overflow-hidden rounded-3xl border border-lime-400/30 bg-linear-to-b from-lime-400/15 via-[#12161c] to-[#0c0f12] p-5 shadow-2xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-lime-400">
              Lifetime Investment
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-lime-400/20 text-lime-300 ring-1 ring-lime-400/40 shadow-[0_0_12px_rgba(163,230,53,0.25)]">
              <Wallet className="h-4 w-4" />
            </div>
          </div>
          <p className="mt-3 text-3xl font-black tracking-tight text-white tabular-nums">
            ₹{Math.round(animLifetime).toLocaleString('en-IN')}
          </p>
          <p className="mt-1 text-[11px] font-medium text-zinc-400">
            Total money invested (Purchase + Operational)
          </p>
        </div>

        {/* Operational Total Spend (Dashboard Profile Card Match) */}
        <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-[#12161c] p-5 shadow-2xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">
              Operational Total Spend
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/5 text-zinc-300 ring-1 ring-white/10">
              <CreditCard className="h-4 w-4" />
            </div>
          </div>
          <p className="mt-3 text-3xl font-black tracking-tight text-lime-300 tabular-nums">
            ₹{Math.round(animOperational).toLocaleString('en-IN')}
          </p>
          <div className="mt-1 flex items-center gap-1.5 text-[11px] font-semibold text-zinc-400">
            <span className="h-1.5 w-1.5 rounded-full bg-lime-400" />
            <span>Matches Dashboard Profile Card</span>
          </div>
        </div>

        {/* Vehicle Ex-Showroom Spend */}
        <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-[#12161c] p-5 shadow-2xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">
              Ex-Showroom Price
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/5 text-zinc-300 ring-1 ring-white/10">
              <Award className="h-4 w-4" />
            </div>
          </div>
          <p className="mt-3 text-3xl font-black tracking-tight text-white tabular-nums">
            ₹{Math.round(animExShowroom).toLocaleString('en-IN')}
          </p>
          <p className="mt-1 text-[11px] font-medium text-zinc-500">
            Excluded from operational total spend
          </p>
        </div>

        {/* Active Streams Status */}
        <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-[#12161c] p-5 shadow-2xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">
              Financial Streams
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/5 text-zinc-300 ring-1 ring-white/10">
              <Layers className="h-4 w-4" />
            </div>
          </div>
          <p className="mt-3 text-3xl font-black tracking-tight text-white tabular-nums">
            5 <span className="text-lg font-bold text-lime-400">/ 5 Active</span>
          </p>
          <p className="mt-1 text-[11px] font-medium text-lime-400">
            All 5 financial streams fully live & tracked
          </p>
        </div>
      </div>

      {/* 3. The 5 Financial Streams Grid (User explicitly requested 5 types of money spent) */}
      <div>
        <div className="mb-3.5 flex items-center justify-between">
          <h3 className="text-base font-black tracking-tight text-white sm:text-lg">
            The 5 Financial Spending Streams
          </h3>
          <span className="text-xs font-medium text-zinc-400">
            Every single rupee accounted for
          </span>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {/* Stream 1: Vehicle Purchase Spend */}
          <div className="flex flex-col justify-between rounded-3xl border border-lime-400/25 bg-linear-to-b from-lime-400/10 via-[#12161c] to-[#0c0f12] p-5 shadow-xl transition-transform hover:-translate-y-1">
            <div>
              <div className="flex items-center justify-between">
                <span className="rounded-full border border-lime-400/30 bg-lime-400/10 px-2 py-0.5 text-[10px] font-black uppercase tracking-wider text-lime-300">
                  Type 1 · Purchase
                </span>
                <Award className="h-4 w-4 text-lime-400" />
              </div>
              <h4 className="mt-3 text-sm font-bold text-white">
                Vehicle Purchase Spend
              </h4>
              <p className="mt-1 text-2xl font-black text-white tabular-nums">
                ₹{Math.round(animExShowroom).toLocaleString('en-IN')}
              </p>
              <p className="mt-1 text-[11px] leading-relaxed text-zinc-400">
                Base bike ex-showroom price. Capital asset acquisition cost.
              </p>
            </div>

            <div className="mt-4 border-t border-white/8 pt-3 text-[11px] text-zinc-500">
              <span>Status: </span>
              <strong className="text-lime-400">Excluded from Total Spend</strong>
            </div>
          </div>

          {/* Stream 2: Fuel Spend */}
          <div className="flex flex-col justify-between rounded-3xl border border-amber-400/25 bg-linear-to-b from-amber-400/10 via-[#12161c] to-[#0c0f12] p-5 shadow-xl transition-transform hover:-translate-y-1">
            <div>
              <div className="flex items-center justify-between">
                <span className="rounded-full border border-amber-400/30 bg-amber-400/10 px-2 py-0.5 text-[10px] font-black uppercase tracking-wider text-amber-300">
                  Type 2 · Fuel
                </span>
                <Fuel className="h-4 w-4 text-amber-400" />
              </div>
              <h4 className="mt-3 text-sm font-bold text-white">
                Fuel Spend
              </h4>
              <p className="mt-1 text-2xl font-black text-amber-300 tabular-nums">
                ₹{Math.round(animFuel).toLocaleString('en-IN')}
              </p>
              <p className="mt-1 text-[11px] leading-relaxed text-zinc-400">
                Total money spent across all fuel refill transactions.
              </p>
            </div>

            <div className="mt-4 flex items-center justify-between border-t border-white/8 pt-3 text-[11px]">
              <span className="text-zinc-500">{fuelRefills.length} refills logged</span>
              <Link
                to="/fuel-history"
                className="inline-flex items-center gap-0.5 font-bold text-amber-300 hover:underline"
              >
                <span>View</span>
                <ArrowUpRight className="h-3 w-3" />
              </Link>
            </div>
          </div>

          {/* Stream 3: Documents Spend */}
          <div className="flex flex-col justify-between rounded-3xl border border-emerald-400/25 bg-linear-to-b from-emerald-400/10 via-[#12161c] to-[#0c0f12] p-5 shadow-xl transition-transform hover:-translate-y-1">
            <div>
              <div className="flex items-center justify-between">
                <span className="rounded-full border border-emerald-400/30 bg-emerald-400/10 px-2 py-0.5 text-[10px] font-black uppercase tracking-wider text-emerald-300">
                  Type 3 · Documents
                </span>
                <FileCheck className="h-4 w-4 text-emerald-400" />
              </div>
              <h4 className="mt-3 text-sm font-bold text-white">
                Documents Spend
              </h4>
              <p className="mt-1 text-2xl font-black text-emerald-300 tabular-nums">
                ₹{Math.round(animDocs).toLocaleString('en-IN')}
              </p>
              <p className="mt-1 text-[11px] leading-relaxed text-zinc-400">
                Insurance (OD & TP), RC, PUC, and Warranty policies.
              </p>
            </div>

            <div className="mt-4 flex items-center justify-between border-t border-white/8 pt-3 text-[11px]">
              <span className="text-zinc-500">{vehicleDocuments.length} docs registered</span>
              <Link
                to="/important-dates?tab=documents"
                className="inline-flex items-center gap-0.5 font-bold text-emerald-300 hover:underline"
              >
                <span>View</span>
                <ArrowUpRight className="h-3 w-3" />
              </Link>
            </div>
          </div>

          {/* Stream 4: Services Spend */}
          <div className="flex flex-col justify-between rounded-3xl border border-cyan-400/25 bg-linear-to-b from-cyan-400/10 via-[#12161c] to-[#0c0f12] p-5 shadow-xl transition-transform hover:-translate-y-1">
            <div>
              <div className="flex items-center justify-between">
                <span className="rounded-full border border-cyan-400/30 bg-cyan-400/10 px-2 py-0.5 text-[10px] font-black uppercase tracking-wider text-cyan-300">
                  Type 4 · Services
                </span>
                <Wrench className="h-4 w-4 text-cyan-400" />
              </div>
              <h4 className="mt-3 text-sm font-bold text-white">
                Services Spend
              </h4>
              <p className="mt-1 text-2xl font-black text-cyan-300 tabular-nums">
                ₹{Math.round(animServices).toLocaleString('en-IN')}
              </p>
              <p className="mt-1 text-[11px] leading-relaxed text-zinc-400">
                Periodic servicing, component wear replacements & repairs.
              </p>
            </div>

            <div className="mt-4 flex items-center justify-between border-t border-white/8 pt-3 text-[11px]">
              <span className="text-zinc-500">Workshop & logs</span>
              <Link
                to="/maintenance"
                className="inline-flex items-center gap-0.5 font-bold text-cyan-300 hover:underline"
              >
                <span>View</span>
                <ArrowUpRight className="h-3 w-3" />
              </Link>
            </div>
          </div>

          {/* Stream 5: Accessories & Modifications Spend */}
          <div className="flex flex-col justify-between rounded-3xl border border-fuchsia-400/25 bg-linear-to-b from-fuchsia-400/10 via-[#12161c] to-[#0c0f12] p-5 shadow-xl transition-transform hover:-translate-y-1">
            <div>
              <div className="flex items-center justify-between">
                <span className="rounded-full border border-fuchsia-400/30 bg-fuchsia-400/10 px-2 py-0.5 text-[10px] font-black uppercase tracking-wider text-fuchsia-300">
                  Type 5 · Accessories
                </span>
                <Sparkles className="h-4 w-4 text-fuchsia-400" />
              </div>
              <h4 className="mt-3 text-sm font-bold text-white">
                Accessories & Mods
              </h4>
              <p className="mt-1 text-2xl font-black text-fuchsia-300 tabular-nums">
                ₹{Math.round(animMods).toLocaleString('en-IN')}
              </p>
              <p className="mt-1 text-[11px] leading-relaxed text-zinc-400">
                Riding gear, covers, protection, electronics & custom add-ons.
              </p>
            </div>

            <div className="mt-4 flex items-center justify-between border-t border-white/8 pt-3 text-[11px]">
              <span className="text-zinc-500">
                {vehicleModifications.filter((m) => m.status === 'Installed' || !m.status).length} items active
              </span>
              <Link
                to="/modifications"
                className="inline-flex items-center gap-0.5 font-bold text-fuchsia-300 hover:underline"
              >
                <span>View</span>
                <ArrowUpRight className="h-3 w-3" />
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Proportional Spending Distribution Bar */}
      <div className="rounded-3xl border border-white/10 bg-[#0d1014] p-5 shadow-2xl sm:p-6">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between border-b border-white/8 pb-4">
          <div>
            <h4 className="text-base font-bold text-white">
              Spending Distribution & Breakdown
            </h4>
            <p className="text-xs text-zinc-400">
              Proportion of total funds allocated across all active expenditure streams.
            </p>
          </div>
          <div className="flex items-center gap-3 text-xs">
            <span className="font-mono font-bold text-white">
              Grand Total: ₹{Math.round(grandLifetimeInvestment).toLocaleString('en-IN')}
            </span>
          </div>
        </div>

        {/* Stacked Progress Bar */}
        <div className="mt-5">
          <div className="flex h-4 w-full overflow-hidden rounded-full bg-black/50 p-0.5 ring-1 ring-white/10">
            {exShowroomPrice > 0 && (
              <div
                style={{ width: `${pctPurchase}%` }}
                className="h-full rounded-l-full bg-lime-400 transition-all duration-500"
                title={`Purchase: ₹${exShowroomPrice.toLocaleString('en-IN')} (${pctPurchase}%)`}
              />
            )}
            {totalFuelSpend > 0 && (
              <div
                style={{ width: `${pctFuel}%` }}
                className="h-full bg-amber-400 transition-all duration-500"
                title={`Fuel: ₹${totalFuelSpend.toLocaleString('en-IN')} (${pctFuel}%)`}
              />
            )}
            {totalDocumentsSpend > 0 && (
              <div
                style={{ width: `${pctDocs}%` }}
                className="h-full bg-emerald-400 transition-all duration-500"
                title={`Documents: ₹${totalDocumentsSpend.toLocaleString('en-IN')} (${pctDocs}%)`}
              />
            )}
            {totalServicesSpend > 0 && (
              <div
                style={{ width: `${pctServices}%` }}
                className="h-full bg-cyan-400 transition-all duration-500"
                title={`Services: ₹${totalServicesSpend.toLocaleString('en-IN')} (${pctServices}%)`}
              />
            )}
            {totalModificationsSpend > 0 && (
              <div
                style={{ width: `${pctMods}%` }}
                className="h-full rounded-r-full bg-fuchsia-400 transition-all duration-500"
                title={`Accessories: ₹${totalModificationsSpend.toLocaleString('en-IN')} (${pctMods}%)`}
              />
            )}
          </div>

          {/* Legend Items */}
          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-5">
            <div className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-full bg-lime-400 shrink-0" />
              <div className="text-xs">
                <span className="text-zinc-400">Purchase: </span>
                <strong className="text-white">{pctPurchase}%</strong>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-full bg-amber-400 shrink-0" />
              <div className="text-xs">
                <span className="text-zinc-400">Fuel: </span>
                <strong className="text-white">{pctFuel}%</strong>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-full bg-emerald-400 shrink-0" />
              <div className="text-xs">
                <span className="text-zinc-400">Documents: </span>
                <strong className="text-white">{pctDocs}%</strong>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-full bg-cyan-400 shrink-0" />
              <div className="text-xs">
                <span className="text-zinc-400">Services: </span>
                <strong className="text-white">{pctServices}%</strong>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-full bg-fuchsia-400 shrink-0" />
              <div className="text-xs">
                <span className="text-zinc-400">Accessories: </span>
                <strong className="text-white">{pctMods}%</strong>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 5. Complete Chronological Financial Ledger */}
      <div className="rounded-3xl border border-white/10 bg-[#0d1014] p-5 shadow-2xl sm:p-6">
        {/* Ledger Header & Search/Filter Controls */}
        <div className="flex flex-col gap-4 border-b border-white/8 pb-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="flex items-center gap-2.5">
              <Receipt className="h-5 w-5 text-lime-400" />
              <h3 className="text-lg font-bold text-white sm:text-xl">
                Comprehensive Expenditure Ledger
              </h3>
            </div>
            <p className="mt-1 text-xs text-zinc-400">
              Complete transaction log with every single rupee recorded ({filteredTransactions.length} items found).
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* Search Input */}
            <div className="relative min-w-[200px] flex-1 sm:w-64">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-zinc-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search merchant, notes..."
                className="w-full rounded-xl border border-white/10 bg-[#12161c] py-2 pl-9 pr-3 text-xs text-white placeholder-zinc-500 focus:border-lime-400 focus:outline-none"
              />
            </div>

            {/* Sort Selector */}
            <div className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-[#12161c] px-3 py-2 text-xs">
              <Filter className="h-3.5 w-3.5 text-zinc-400" />
              <select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value)}
                className="bg-transparent text-white focus:outline-none text-xs"
              >
                <option value="DATE_DESC">Newest First</option>
                <option value="DATE_ASC">Oldest First</option>
                <option value="AMOUNT_DESC">Highest Amount</option>
                <option value="AMOUNT_ASC">Lowest Amount</option>
              </select>
            </div>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="mt-4 flex flex-wrap items-center gap-2 border-b border-white/6 pb-3">
          {[
            { id: 'ALL', label: 'All Expenditures' },
            { id: 'PURCHASE', label: 'Vehicle Purchase' },
            { id: 'FUEL', label: 'Fuel Refills' },
            { id: 'DOCUMENTS', label: 'Documents & Legal' },
            { id: 'SERVICES', label: 'Services & Maintenance' },
            { id: 'MODIFICATIONS', label: 'Accessories & Mods' },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveFilter(tab.id)}
              className={`rounded-xl px-3.5 py-1.5 text-xs font-bold transition-all ${
                activeFilter === tab.id
                  ? 'bg-lime-400 text-zinc-950 shadow-[0_0_12px_rgba(163,230,53,0.25)]'
                  : 'border border-white/5 bg-white/5 text-zinc-400 hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Ledger Items Feed */}
        <div className="mt-4 divide-y divide-white/6">
          {filteredTransactions.length === 0 ? (
            <div className="py-12 text-center text-xs text-zinc-500">
              No financial transactions match your current search or filter.
            </div>
          ) : (
            filteredTransactions.map((tx) => {
              const Icon = tx.icon
              return (
                <div
                  key={tx.id}
                  className="flex flex-col gap-3 py-3.5 transition-colors hover:bg-white/[0.02] sm:flex-row sm:items-center sm:justify-between px-2 rounded-xl"
                >
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/5 text-zinc-300 ring-1 ring-white/10">
                      <Icon className="h-4 w-4" />
                    </div>

                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-sm font-bold text-white">
                          {tx.title}
                        </span>
                        <span
                          className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider border ${tx.badgeColor}`}
                        >
                          {tx.categoryLabel}
                        </span>
                        {tx.isCapitalSpend && (
                          <span className="rounded-full bg-white/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-zinc-300">
                            Capital Asset
                          </span>
                        )}
                      </div>

                      <p className="mt-0.5 text-xs text-zinc-400">
                        {tx.subtitle}
                      </p>

                      <div className="mt-1 flex items-center gap-3 text-[11px] text-zinc-500">
                        <span className="inline-flex items-center gap-1 font-mono">
                          <Calendar className="h-3 w-3 text-zinc-500" />
                          {tx.dateFormatted}
                        </span>
                        {tx.odometerKm !== null && tx.odometerKm > 0 && (
                          <span className="font-mono">
                            • Odo: {tx.odometerKm.toLocaleString('en-IN')} km
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="text-right sm:shrink-0">
                    <span className="font-mono text-base font-black text-lime-400 sm:text-lg">
                      ₹{Math.round(tx.amount).toLocaleString('en-IN')}
                    </span>
                    <span className="block text-[10px] font-medium text-zinc-500">
                      {tx.isCapitalSpend ? 'Purchase Capital' : 'Operational Log'}
                    </span>
                  </div>
                </div>
              )
            })
          )}
        </div>
      </div>
    </div>
  )
}
