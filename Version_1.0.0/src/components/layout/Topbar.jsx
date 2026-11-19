import { Bell, Menu } from 'lucide-react'
import { useLocation } from 'react-router-dom'

const routeTitles = {
  '/': 'Dashboard',
  '/fuel-history': 'Fuel Refill History',
  '/maintenance': 'Maintenance Schedule',
  '/important-dates': 'Important Dates & Reminders',
  '/analytics': 'Vehicle Analytics',
  '/settings': 'System Settings',
}

export default function Topbar({ onOpenMenu }) {
  const { pathname } = useLocation()
  const currentTitle = routeTitles[pathname] || 'MKD'

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-white/8 bg-[#0c0f12]/90 px-4 backdrop-blur-md sm:px-6">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onOpenMenu}
          className="rounded-lg p-2 text-zinc-400 hover:bg-white/5 hover:text-white lg:hidden"
          aria-label="Open navigation menu"
        >
          <Menu className="h-5 w-5" />
        </button>
        <h2 className="text-base font-bold tracking-tight text-white sm:text-lg">
          {currentTitle}
        </h2>
      </div>

      <div className="flex items-center gap-3">
        <span className="hidden rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-zinc-400 sm:inline-flex">
          v1.0.0
        </span>

        <button
          type="button"
          className="relative rounded-lg p-2 text-zinc-400 hover:bg-white/5 hover:text-white"
          aria-label="Notifications"
        >
          <Bell className="h-5 w-5" />
          <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-lime-400 shadow-[0_0_6px_#a3e635]" />
        </button>

        <div className="flex h-8 w-8 items-center justify-center rounded-full border border-lime-400/40 bg-lime-400/15 text-xs font-bold text-lime-300">
          MY
        </div>
      </div>
    </header>
  )
}
