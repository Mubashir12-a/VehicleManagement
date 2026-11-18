import { ArrowDownRight, ArrowUpRight, Calendar, TrendingUp } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function MonthlyFuelCard({ monthlyFuelSummary }) {
  const current = monthlyFuelSummary?.currentMonth || {
    label: 'Current Month',
    totalSpent: 0,
    totalLiters: 0,
    refillCount: 0,
    avgPrice: 0,
  }

  const last = monthlyFuelSummary?.lastMonth || {
    label: 'Last Month',
    totalSpent: 0,
    totalLiters: 0,
    refillCount: 0,
    avgPrice: 0,
  }

  const currentSpent = Number(current.totalSpent) || 0
  const lastSpent = Number(last.totalSpent) || 0
  const currentLiters = Number(current.totalLiters) || 0
  const lastLiters = Number(last.totalLiters) || 0

  // Calculate month-over-month differences
  const spendDiff = currentSpent - lastSpent
  const spendPercentDiff =
    lastSpent > 0
      ? Math.round((spendDiff / lastSpent) * 100)
      : currentSpent > 0
        ? 100
        : 0

  const litersDiff = currentLiters - lastLiters

  return (
    <section className="relative overflow-hidden rounded-3xl border border-white/10 bg-[#0d1014] p-5 shadow-2xl sm:p-7">
      {/* Background ambient glow */}
      <div className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full bg-lime-400/5 blur-3xl" />

      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/8 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-lime-400 shadow-[0_0_8px_#a3e635]" />
            <h3 className="text-base font-extrabold uppercase tracking-wider text-white">
              Monthly Fuel Expense & Refill Comparison
            </h3>
          </div>
          <p className="mt-1 text-xs text-zinc-400">
            Current month update vs last month benchmark · Full logs in Fuel History
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to="/fuel-history"
            className="inline-flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-3.5 py-2 text-xs font-semibold text-zinc-300 transition-colors hover:border-lime-400/40 hover:bg-lime-400/10 hover:text-lime-300"
          >
            <span>View All History</span>
            <span className="font-mono">→</span>
          </Link>
        </div>
      </div>

      {/* 2-Column Comparison Grid: Current Month vs Last Month */}
      <div className="mt-5 grid grid-cols-1 gap-5 md:grid-cols-2">
        {/* Current Month Box (Highlighted in Lime) */}
        <div className="relative overflow-hidden rounded-2xl border border-lime-400/30 bg-linear-to-b from-lime-400/10 via-[#12161c] to-[#0d1014] p-5 shadow-[0_0_24px_rgba(163,230,53,0.08)]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-lime-400 text-zinc-950 font-black text-xs shadow-[0_0_12px_rgba(163,230,53,0.4)]">
                <Calendar className="h-3.5 w-3.5 stroke-[2.5]" />
              </span>
              <div>
                <span className="block text-[10px] font-black uppercase tracking-widest text-lime-400">
                  CURRENT MONTH
                </span>
                <h4 className="text-sm font-bold text-white">{current.label}</h4>
              </div>
            </div>

            <span className="rounded-full border border-lime-400/30 bg-lime-400/15 px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-lime-300">
              Active Period
            </span>
          </div>

          {/* Primary Metric: Total Spent */}
          <div className="mt-4">
            <span className="block text-[11px] font-medium text-zinc-400">
              Total Fuel Filled This Month
            </span>
            <div className="flex items-baseline gap-2">
              <span className="font-mono text-3xl font-black text-white sm:text-4xl">
                ₹{currentSpent.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </span>
              {last.totalSpent > 0 && (
                <span
                  className={`inline-flex items-center gap-0.5 text-xs font-bold ${
                    spendDiff > 0
                      ? 'text-amber-400'
                      : 'text-emerald-400'
                  }`}
                >
                  {spendDiff > 0 ? (
                    <ArrowUpRight className="h-3.5 w-3.5" />
                  ) : (
                    <ArrowDownRight className="h-3.5 w-3.5" />
                  )}
                  {spendPercentDiff > 0 ? `+${spendPercentDiff}%` : `${spendPercentDiff}%`}
                </span>
              )}
            </div>
          </div>

          {/* Secondary Details: Liters, Refills, Avg ₹/L */}
          <div className="mt-4 grid grid-cols-3 gap-2 border-t border-white/8 pt-3 text-center sm:text-left">
            <div className="rounded-xl bg-black/40 p-2.5">
              <span className="block text-[10px] font-bold uppercase tracking-wider text-zinc-500">
                Quantity
              </span>
              <span className="mt-0.5 block font-mono text-sm font-extrabold text-zinc-200">
                {current.totalLiters} <span className="text-[10px] text-zinc-400">L</span>
              </span>
            </div>

            <div className="rounded-xl bg-black/40 p-2.5">
              <span className="block text-[10px] font-bold uppercase tracking-wider text-zinc-500">
                Refills
              </span>
              <span className="mt-0.5 block font-mono text-sm font-extrabold text-zinc-200">
                {current.refillCount}{' '}
                <span className="text-[10px] text-zinc-400">
                  {current.refillCount === 1 ? 'trip' : 'trips'}
                </span>
              </span>
            </div>

            <div className="rounded-xl bg-black/40 p-2.5">
              <span className="block text-[10px] font-bold uppercase tracking-wider text-zinc-500">
                Avg Rate
              </span>
              <span className="mt-0.5 block font-mono text-sm font-extrabold text-lime-300">
                ₹{current.avgPrice}{' '}
                <span className="text-[10px] text-zinc-400">/L</span>
              </span>
            </div>
          </div>
        </div>

        {/* Last Month Box (Benchmark) */}
        <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-[#12161c] p-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/10 text-zinc-300 font-black text-xs">
                <Calendar className="h-3.5 w-3.5" />
              </span>
              <div>
                <span className="block text-[10px] font-black uppercase tracking-widest text-zinc-500">
                  PREVIOUS MONTH
                </span>
                <h4 className="text-sm font-bold text-zinc-200">{last.label}</h4>
              </div>
            </div>

            <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-zinc-400">
              Benchmark
            </span>
          </div>

          {/* Primary Metric: Total Spent */}
          <div className="mt-4">
            <span className="block text-[11px] font-medium text-zinc-400">
              Total Fuel Filled Last Month
            </span>
            <div className="flex items-baseline gap-2">
              <span className="font-mono text-3xl font-black text-zinc-200 sm:text-4xl">
                ₹{lastSpent.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>

          {/* Secondary Details: Liters, Refills, Avg ₹/L */}
          <div className="mt-4 grid grid-cols-3 gap-2 border-t border-white/8 pt-3 text-center sm:text-left">
            <div className="rounded-xl bg-black/30 p-2.5">
              <span className="block text-[10px] font-bold uppercase tracking-wider text-zinc-500">
                Quantity
              </span>
              <span className="mt-0.5 block font-mono text-sm font-extrabold text-zinc-300">
                {last.totalLiters} <span className="text-[10px] text-zinc-500">L</span>
              </span>
            </div>

            <div className="rounded-xl bg-black/30 p-2.5">
              <span className="block text-[10px] font-bold uppercase tracking-wider text-zinc-500">
                Refills
              </span>
              <span className="mt-0.5 block font-mono text-sm font-extrabold text-zinc-300">
                {last.refillCount}{' '}
                <span className="text-[10px] text-zinc-500">
                  {last.refillCount === 1 ? 'trip' : 'trips'}
                </span>
              </span>
            </div>

            <div className="rounded-xl bg-black/30 p-2.5">
              <span className="block text-[10px] font-bold uppercase tracking-wider text-zinc-500">
                Avg Rate
              </span>
              <span className="mt-0.5 block font-mono text-sm font-extrabold text-zinc-300">
                ₹{last.avgPrice}{' '}
                <span className="text-[10px] text-zinc-500">/L</span>
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Comparison Insight Footer */}
      <div className="mt-4 flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-white/6 bg-[#0a0d10] px-4 py-2.5 text-xs text-zinc-400">
        <div className="flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-lime-400" />
          <span>
            Month-over-Month Delta:{' '}
            <strong className="text-zinc-200">
              {spendDiff >= 0 ? `+₹${spendDiff.toFixed(2)}` : `-₹${Math.abs(spendDiff).toFixed(2)}`}
            </strong>{' '}
            spend (
            {litersDiff >= 0 ? `+${litersDiff.toFixed(1)} L` : `${litersDiff.toFixed(1)} L`}
            )
          </span>
        </div>

        <span className="text-[11px] text-zinc-500">
          Updated live via Supabase
        </span>
      </div>
    </section>
  )
}
