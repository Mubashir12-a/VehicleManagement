import { Activity, DollarSign, Fuel, Wrench } from 'lucide-react'

function PlaceholderMetricCard({ title, icon: Icon, hint }) {
  return (
    <div className="flex flex-col justify-between rounded-xl border border-dashed border-slate-300 bg-slate-50/60 p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-slate-500">{title}</p>
          <p className="mt-2 text-2xl font-bold tracking-tight text-slate-400">
            —
          </p>
        </div>
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-200/70 text-slate-400">
          <Icon className="h-5 w-5" />
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between text-xs">
        <span className="rounded-full bg-slate-200/70 px-2.5 py-0.5 font-medium text-slate-500">
          Coming soon
        </span>
        <span className="truncate text-slate-400">{hint}</span>
      </div>
    </div>
  )
}

export default function DashboardSummaryRow({ summary, refillCount }) {
  return (
    <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {/* Live Metric: Total Spend Till Now */}
      <div className="flex flex-col justify-between rounded-xl border border-slate-200/80 bg-white p-5 shadow-xs">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-sm font-medium text-slate-500">
              Total Spend Till Now
            </p>
            <p className="mt-2 text-2xl font-bold tracking-tight text-slate-900">
              ${Number(summary.totalSpendTillNow || 0).toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </p>
          </div>
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
            <DollarSign className="h-5 w-5" />
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between text-xs text-slate-500">
          <span>
            Fuel: <strong className="text-slate-700">${summary.totalFuelSpend || 0}</strong> ({refillCount})
          </span>
          <span>
            Service: <strong className="text-slate-700">${summary.totalMaintenanceSpend || 0}</strong>
          </span>
        </div>
      </div>

      {/* Reserved Space for Later */}
      <PlaceholderMetricCard
        title="Health"
        icon={Activity}
        hint="Score coming later"
      />
      <PlaceholderMetricCard
        title="Services Done"
        icon={Wrench}
        hint="History coming later"
      />
      <PlaceholderMetricCard
        title="Mileage"
        icon={Fuel}
        hint="km/L coming later"
      />
    </section>
  )
}
