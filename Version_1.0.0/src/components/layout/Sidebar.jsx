import {
  BarChart3,
  Car,
  Database,
  Fuel,
  LayoutDashboard,
  Plus,
  Settings,
  Wrench,
  X,
} from 'lucide-react'
import { NavLink } from 'react-router-dom'
import { useFleetData } from '../../hooks/useFleetData'
import { supabaseConfigStatus } from '../../lib/supabase'

const navItems = [
  { label: 'Dashboard', to: '/', icon: LayoutDashboard, end: true },
  { label: 'My Vehicle', to: '/vehicles', icon: Car },
  { label: 'Fuel History', to: '/fuel-history', icon: Fuel },
  { label: 'Maintenance', to: '/maintenance', icon: Wrench },
  { label: 'Analytics', to: '/analytics', icon: BarChart3 },
  { label: 'Settings', to: '/settings', icon: Settings },
]

export default function Sidebar({ isOpen, onClose }) {
  const { latestRefill, monthlyFuelSummary } = useFleetData()
  const currentMonthSpend = monthlyFuelSummary?.currentMonth?.totalSpent || 0

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/70 backdrop-blur-xs lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-white/8 bg-[#0c0f12] text-zinc-100 transition-transform duration-200 ease-in-out lg:static lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex h-16 items-center justify-between border-b border-white/8 px-5">
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-lime-400/30 bg-[#12161c] p-1 shadow-[0_0_16px_rgba(163,230,53,0.25)]">
              <img
                src="/logo-transparent.png"
                alt="MKD Logo"
                className="h-full w-full object-contain"
              />
            </div>
            <div className="leading-tight">
              <span className="block text-base font-black tracking-tight text-white">
                MKD
              </span>
              <span className="block text-[9px] font-bold uppercase tracking-wider text-lime-400">
                Mobility Keeper · Digital
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-zinc-400 hover:bg-white/5 hover:text-white lg:hidden"
            aria-label="Close navigation menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="space-y-1 px-3 py-4" aria-label="Sidebar">
          {navItems.map((item) => {
            const Icon = item.icon
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-semibold transition-all ${
                    isActive
                      ? 'bg-lime-400 text-zinc-950 shadow-[0_0_18px_rgba(163,230,53,0.25)]'
                      : 'text-zinc-400 hover:bg-white/5 hover:text-zinc-100'
                  }`
                }
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span>{item.label}</span>
              </NavLink>
            )
          })}
        </nav>

        {/* Quick Fuel Card in Sidebar */}
        <div className="mx-3 my-2 rounded-2xl border border-lime-400/25 bg-linear-to-b from-lime-400/10 via-[#12161c] to-[#0c0f12] p-3 shadow-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-lime-400 text-zinc-950 shadow-[0_0_10px_rgba(163,230,53,0.35)]">
                <Fuel className="h-4 w-4 stroke-[2.4]" />
              </div>
              <div>
                <span className="block text-[10px] font-black uppercase tracking-wider text-lime-400">
                  Fuel Card
                </span>
                <span className="block text-xs font-bold text-white">
                  {latestRefill
                    ? `Odo: ${Number(latestRefill.odometerKm || 0).toLocaleString('en-IN')} km`
                    : 'No Refills'}
                </span>
              </div>
            </div>

            <NavLink
              to="/fuel-history"
              onClick={onClose}
              className="flex items-center gap-1 rounded-lg border border-lime-400/30 bg-lime-400/15 px-2 py-1 text-[10px] font-bold text-lime-300 hover:bg-lime-400 hover:text-zinc-950 transition-colors"
            >
              <Plus className="h-3 w-3 stroke-[2.5]" />
              <span>Refill</span>
            </NavLink>
          </div>

          {latestRefill ? (
            <div className="mt-2.5 space-y-1 border-t border-white/8 pt-2 text-[11px]">
              <div className="flex items-center justify-between">
                <span className="text-zinc-400">Recent:</span>
                <span className="font-mono font-bold text-zinc-100">
                  ₹{Number(latestRefill.amountSpent || 0).toLocaleString('en-IN')}
                </span>
              </div>
              <div className="flex items-center justify-between text-[10px] text-zinc-500">
                <span className="truncate max-w-[100px]">{latestRefill.stationName || 'Fuel Station'}</span>
                <span>
                  {latestRefill.liters || 0} L
                  {latestRefill.refillDate
                    ? ` · ${String(latestRefill.refillDate).slice(5)}`
                    : ''}
                </span>
              </div>
              <div className="flex items-center justify-between border-t border-white/6 pt-1 text-[10px]">
                <span className="text-zinc-500">This Month:</span>
                <span className="font-mono font-bold text-lime-300">
                  ₹{Number(currentMonthSpend || 0).toLocaleString('en-IN')}
                </span>
              </div>
            </div>
          ) : (
            <p className="mt-2 text-[11px] text-zinc-500">
              Log your first fuel entry to sync telemetry.
            </p>
          )}
        </div>

        <div className="mt-auto border-t border-white/8 p-4">
          <div className="rounded-xl border border-white/8 bg-[#12161b] p-3.5">
            <div className="flex items-center gap-2 text-xs font-semibold text-zinc-200">
              <Database className="h-3.5 w-3.5 text-lime-400" />
              <span>Supabase Cloud</span>
            </div>
            <p className="mt-1 text-xs text-zinc-500">
              {supabaseConfigStatus.isConfigured
                ? 'Live database synced'
                : 'Using local mock data'}
            </p>
            <span
              className={`mt-2 inline-flex items-center gap-1.5 text-[11px] font-semibold ${
                supabaseConfigStatus.isConfigured
                  ? 'text-lime-400'
                  : 'text-amber-400'
              }`}
            >
              <span
                className={`h-1.5 w-1.5 rounded-full ${
                  supabaseConfigStatus.isConfigured
                    ? 'bg-lime-400 shadow-[0_0_8px_#a3e635]'
                    : 'bg-amber-400'
                }`}
              />
              {supabaseConfigStatus.isConfigured ? 'Connected' : 'Not Connected'}
            </span>
          </div>
        </div>
      </aside>
    </>
  )
}
