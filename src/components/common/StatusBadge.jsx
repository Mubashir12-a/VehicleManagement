const statusStyles = {
  Active: 'bg-lime-400/15 text-lime-300 ring-lime-400/30',
  Maintenance: 'bg-amber-400/15 text-amber-300 ring-amber-400/30',
  'In Progress': 'bg-amber-400/15 text-amber-300 ring-amber-400/30',
  Idle: 'bg-zinc-500/20 text-zinc-300 ring-zinc-500/30',
  Scheduled: 'bg-sky-400/15 text-sky-300 ring-sky-400/30',
  'Out of Service': 'bg-rose-400/15 text-rose-300 ring-rose-400/30',
  Overdue: 'bg-rose-400/15 text-rose-300 ring-rose-400/30',
  High: 'bg-rose-400/15 text-rose-300 ring-rose-400/30',
  Medium: 'bg-amber-400/15 text-amber-300 ring-amber-400/30',
  Low: 'bg-zinc-500/20 text-zinc-300 ring-zinc-500/30',
}

export default function StatusBadge({ status }) {
  const classes =
    statusStyles[status] || 'bg-zinc-500/20 text-zinc-300 ring-zinc-500/30'

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide ring-1 ring-inset ${classes}`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {status}
    </span>
  )
}
