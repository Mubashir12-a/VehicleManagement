import { TrendingDown, TrendingUp } from 'lucide-react'

const accentClasses = {
  indigo: 'bg-lime-400/10 text-lime-400 ring-1 ring-lime-400/20',
  emerald: 'bg-emerald-400/10 text-emerald-400 ring-1 ring-emerald-400/20',
  amber: 'bg-amber-400/10 text-amber-400 ring-1 ring-amber-400/20',
  sky: 'bg-sky-400/10 text-sky-400 ring-1 ring-sky-400/20',
  rose: 'bg-rose-400/10 text-rose-400 ring-1 ring-rose-400/20',
}

export default function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  trendDirection = 'up',
  accent = 'indigo',
}) {
  const isPositive = trendDirection === 'up'

  return (
    <div className="rounded-2xl border border-white/8 bg-[#101419] p-5 transition-colors hover:border-white/15">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
            {title}
          </p>
          <p className="mt-2 text-2xl font-extrabold tracking-tight text-white">
            {value}
          </p>
        </div>
        {Icon && (
          <div
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
              accentClasses[accent] || accentClasses.indigo
            }`}
          >
            <Icon className="h-5 w-5" />
          </div>
        )}
      </div>

      {(trend || subtitle) && (
        <div className="mt-4 flex items-center gap-2 text-xs">
          {trend && (
            <span
              className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 font-semibold ${
                isPositive
                  ? 'bg-lime-400/15 text-lime-300'
                  : 'bg-rose-400/15 text-rose-300'
              }`}
            >
              {isPositive ? (
                <TrendingUp className="h-3 w-3" />
              ) : (
                <TrendingDown className="h-3 w-3" />
              )}
              {trend}
            </span>
          )}
          {subtitle && <span className="truncate text-zinc-500">{subtitle}</span>}
        </div>
      )}
    </div>
  )
}
