import {
  ArrowRight,
  Bell,
  CheckCircle2,
  ChevronDown,
  FileCheck,
  LogIn,
  LogOut,
  Menu,
  Settings,
  User,
  UserPlus,
  Wrench,
  X,
} from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContextCore'
import { useFleetData } from '../../hooks/useFleetData'
import { formatDisplayDate } from '../../utils/dateFormatter'
import { getExpiryMeta, getReminderStatus, sortServiceReminders } from '../dates/datesUtils'

const routeTitles = {
  '/': 'Dashboard',
  '/fuel-history': 'Fuel Refill History',
  '/maintenance': 'Maintenance Schedule',
  '/important-dates': 'Important Dates & Reminders',
  '/analytics': 'Vehicle Analytics',
  '/finance-history': 'Finance History',
  '/settings': 'System Settings',
}

export default function Topbar({ onOpenMenu }) {
  const { pathname } = useLocation()
  const currentTitle = routeTitles[pathname] || 'MKD'

  const {
    vehicles = [],
    primaryVehicle,
    serviceReminders = [],
    vehicleDocuments = [],
  } = useFleetData()

  const {
    user,
    profile,
    openAuthModal,
    openProfileModal,
    signOut,
  } = useAuth()

  const [isPopoverOpen, setIsPopoverOpen] = useState(false)
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
  const popoverRef = useRef(null)
  const userMenuRef = useRef(null)

  const currentOdo = Number(primaryVehicle?.mileage) || 0

  // Calculate Due Service Reminders (triggered by min duration or min odo)
  const dueServiceReminders = useMemo(() => {
    return (serviceReminders || [])
      .filter((r) => r.status !== 'Completed')
      .map((r) => {
        const meta = getReminderStatus(r, currentOdo)
        return { ...r, meta }
      })
      .filter((r) => r.meta.isDue)
      .sort(sortServiceReminders)
  }, [serviceReminders, currentOdo])

  // Calculate Expiring / Expired Documents
  const alertDocuments = useMemo(() => {
    return (vehicleDocuments || [])
      .map((d) => {
        const meta = getExpiryMeta(d.expiryDate)
        return { ...d, meta }
      })
      .filter(
        (d) => d.meta.status === 'Expired' || d.meta.status === 'Expiring Soon',
      )
  }, [vehicleDocuments])

  const totalAlertsCount = dueServiceReminders.length + alertDocuments.length

  // Close popover and user menu when clicking outside or pressing Escape
  useEffect(() => {
    function handleClickOutside(event) {
      if (popoverRef.current && !popoverRef.current.contains(event.target)) {
        setIsPopoverOpen(false)
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setIsUserMenuOpen(false)
      }
    }

    function handleKeyDown(event) {
      if (event.key === 'Escape') {
        setIsPopoverOpen(false)
        setIsUserMenuOpen(false)
      }
    }

    if (isPopoverOpen || isUserMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      document.addEventListener('keydown', handleKeyDown)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isPopoverOpen, isUserMenuOpen])

  const userDisplayName =
    profile?.full_name ||
    user?.user_metadata?.full_name ||
    user?.email?.split('@')[0] ||
    'Guest Driver'

  const userInitials = useMemo(() => {
    if (!user) return 'GT'
    const name = userDisplayName.trim()
    const parts = name.split(' ')
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase()
    }
    return name.slice(0, 2).toUpperCase()
  }, [user, userDisplayName])

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
        {/* Notifications Icon & Popover */}
        <div className="relative" ref={popoverRef}>
          <button
            type="button"
            onClick={() => setIsPopoverOpen((prev) => !prev)}
            className={`relative rounded-xl p-2 transition-all ${
              totalAlertsCount > 0
                ? 'bg-amber-400/10 text-amber-300 ring-1 ring-amber-400/30 hover:bg-amber-400/20'
                : 'text-zinc-400 hover:bg-white/5 hover:text-white'
            }`}
            aria-label="Notifications"
            title={
              totalAlertsCount > 0
                ? `${totalAlertsCount} active alert${totalAlertsCount > 1 ? 's' : ''}`
                : 'No alerts'
            }
          >
            <Bell
              className={`h-5 w-5 ${
                totalAlertsCount > 0 ? 'text-amber-400 animate-pulse' : ''
              }`}
            />
            {totalAlertsCount > 0 ? (
              <span className="absolute -top-1 -right-1 flex h-4.5 min-w-[18px] items-center justify-center rounded-full bg-rose-500 px-1 font-mono text-[10px] font-black text-white shadow-[0_0_8px_rgba(244,63,94,0.6)]">
                {totalAlertsCount}
              </span>
            ) : (
              <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-lime-400/60" />
            )}
          </button>

          {/* Notifications Dropdown Panel */}
          {isPopoverOpen && (
            <div className="absolute right-0 mt-2 w-80 max-h-[85vh] overflow-y-auto rounded-2xl border border-white/10 bg-[#0e1217] p-4 shadow-2xl ring-1 ring-black/50 z-50 sm:w-96 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
              {/* Header */}
              <div className="flex items-center justify-between border-b border-white/8 pb-3">
                <div className="flex items-center gap-2">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-lime-400/10 text-lime-400">
                    <Bell className="h-4 w-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-white">
                      Notifications
                    </h4>
                    <span className="text-[10px] text-zinc-400">
                      Telemetry & Reminders
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {totalAlertsCount > 0 && (
                    <span className="rounded-full bg-amber-400/15 px-2 py-0.5 text-[10px] font-black uppercase tracking-wider text-amber-300 ring-1 ring-amber-400/30">
                      {totalAlertsCount} Active
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={() => setIsPopoverOpen(false)}
                    className="rounded-lg p-1 text-zinc-400 hover:bg-white/5 hover:text-white"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Popover Content */}
              <div className="mt-3 space-y-3">
                {totalAlertsCount === 0 ? (
                  <div className="py-6 text-center">
                    <CheckCircle2 className="mx-auto h-8 w-8 text-lime-400/70" />
                    <p className="mt-2 text-xs font-bold text-zinc-200">
                      All Systems Up to Date
                    </p>
                    <p className="mt-0.5 text-[11px] text-zinc-500">
                      No service intervals or document renewals currently due.
                    </p>
                  </div>
                ) : (
                  <>
                    {/* Due Service Reminders Section */}
                    {dueServiceReminders.length > 0 && (
                      <div className="space-y-2">
                        <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                          <Wrench className="h-3 w-3 text-amber-400" />
                          <span>
                            Service Reminders Due ({dueServiceReminders.length})
                          </span>
                        </div>

                        {dueServiceReminders.map((reminder) => (
                          <div
                            key={reminder.id}
                            className={`rounded-xl border p-2.5 text-xs ${
                              reminder.meta.isOverdue
                                ? 'border-rose-500/30 bg-rose-500/10 text-rose-300'
                                : 'border-amber-400/30 bg-amber-400/10 text-amber-200'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-white">
                                {reminder.title}
                              </span>
                              <span
                                className={`rounded-full px-2 py-0.5 text-[9px] font-black uppercase tracking-wider ${
                                  reminder.meta.isOverdue
                                    ? 'bg-rose-500/20 text-rose-300'
                                    : 'bg-amber-400/20 text-amber-300'
                                }`}
                              >
                                {reminder.meta.label}
                              </span>
                            </div>

                            <p className="mt-0.5 text-[10px] font-semibold text-lime-400">
                              {reminder.serviceType}
                            </p>

                            {reminder.meta.reasons.length > 0 && (
                              <ul className="mt-1.5 space-y-0.5 text-[10px] text-zinc-300">
                                {reminder.meta.reasons.map((reason, idx) => (
                                  <li key={idx} className="flex items-start gap-1">
                                    <span className="text-amber-400">•</span>
                                    <span>{reason}</span>
                                  </li>
                                ))}
                              </ul>
                            )}
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Expiring / Expired Documents Section */}
                    {alertDocuments.length > 0 && (
                      <div className="space-y-2 pt-2 border-t border-white/6">
                        <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                          <FileCheck className="h-3 w-3 text-rose-400" />
                          <span>
                            Document Expiry Alerts ({alertDocuments.length})
                          </span>
                        </div>

                        {alertDocuments.map((doc) => (
                          <div
                            key={doc.id}
                            className="flex items-center justify-between rounded-xl border border-white/8 bg-white/2 p-2.5 text-xs"
                          >
                            <div>
                              <p className="font-semibold text-white text-[11px]">
                                {doc.title}
                              </p>
                              <p className="text-[10px] text-zinc-500">
                                Expires: {formatDisplayDate(doc.expiryDate)}
                              </p>
                            </div>
                            <span
                              className={`rounded-full px-2 py-0.5 text-[9px] font-black uppercase tracking-wider ${
                                doc.meta.status === 'Expired'
                                  ? 'bg-rose-500/15 text-rose-300'
                                  : 'bg-amber-400/15 text-amber-300'
                              }`}
                            >
                              {doc.meta.status}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* Action Footer */}
              <div className="mt-3.5 border-t border-white/8 pt-3">
                <Link
                  to="/important-dates?tab=reminders"
                  onClick={() => setIsPopoverOpen(false)}
                  className="flex w-full items-center justify-center gap-1.5 rounded-xl bg-lime-400 px-3 py-2 text-xs font-bold text-zinc-950 transition-colors hover:bg-lime-300"
                >
                  <span>Open Service Reminders</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* User Account / Auth Dropdown */}
        <div className="relative" ref={userMenuRef}>
          {user ? (
            <button
              type="button"
              onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
              className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 py-1 px-1.5 hover:bg-white/10 hover:border-lime-400/40 transition-all text-left"
              aria-expanded={isUserMenuOpen}
            >
              <div className="relative flex h-8 w-8 items-center justify-center rounded-lg border border-lime-400/40 bg-lime-400/15 text-xs font-bold text-lime-300">
                {userInitials}
                <span className="absolute -bottom-0.5 -right-0.5 h-2 w-2 rounded-full border border-zinc-950 bg-lime-400" />
              </div>
              <div className="hidden md:block pr-1">
                <p className="text-xs font-bold text-white leading-tight max-w-[110px] truncate">
                  {userDisplayName}
                </p>
                <p className="text-[10px] text-zinc-400 leading-tight">Driver Garage</p>
              </div>
              <ChevronDown className="h-3.5 w-3.5 text-zinc-400 hidden sm:block" />
            </button>
          ) : (
            <div className="flex items-center gap-1.5 sm:gap-2">
              <button
                type="button"
                onClick={() => openAuthModal('signin')}
                className="flex items-center gap-1.5 rounded-xl border border-lime-400/40 bg-lime-400/10 px-2.5 sm:px-3 py-1.5 text-xs font-bold text-lime-300 hover:bg-lime-400 hover:text-zinc-950 transition-all shadow-sm shadow-lime-400/20"
              >
                <LogIn className="h-3.5 w-3.5" />
                <span>Sign In</span>
              </button>
              <button
                type="button"
                onClick={() => openAuthModal('signup')}
                className="flex items-center gap-1.5 rounded-xl bg-lime-400 px-2.5 sm:px-3 py-1.5 text-xs font-bold text-zinc-950 hover:bg-lime-300 transition-all shadow-sm shadow-lime-400/20"
              >
                <UserPlus className="h-3.5 w-3.5" />
                <span className="hidden xs:inline sm:inline">Register</span>
              </button>
            </div>
          )}

          {/* User Menu Dropdown */}
          {user && isUserMenuOpen && (
            <div className="absolute right-0 top-full mt-2 w-56 rounded-2xl border border-white/10 bg-[#0c1017] p-2 shadow-2xl shadow-black/80 backdrop-blur-xl z-30 animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="p-2 border-b border-white/6 mb-1">
                <p className="text-xs font-bold text-white truncate">
                  {userDisplayName}
                </p>
                <p className="text-[10px] text-zinc-400 truncate">{user.email}</p>
                <div className="mt-1.5 inline-flex items-center gap-1 rounded-full bg-lime-400/10 px-2 py-0.5 text-[9px] font-bold text-lime-400 border border-lime-400/30">
                  <span className="h-1.5 w-1.5 rounded-full bg-lime-400 animate-pulse" />
                  <span>Cloud Synchronized</span>
                </div>
              </div>

              {/* Active Vehicle Snippet */}
              <div className="p-2 border-b border-white/6 mb-1 bg-black/40 rounded-xl text-left">
                <div className="flex items-center justify-between text-[10px] text-zinc-400">
                  <span>Cockpit Vehicle</span>
                  <span className="font-mono text-lime-400 font-bold">{primaryVehicle?.plate}</span>
                </div>
                <p className="text-xs font-bold text-white truncate mt-0.5">
                  {primaryVehicle?.name}
                </p>
                <Link
                  to="/settings"
                  onClick={() => setIsUserMenuOpen(false)}
                  className="mt-1.5 flex items-center justify-between text-[10px] text-lime-400 hover:underline"
                >
                  <span>Switch Vehicle ({vehicles.length} in Garage)</span>
                  <span aria-hidden="true">&rarr;</span>
                </Link>
              </div>

              <div className="space-y-0.5 text-xs">
                <button
                  type="button"
                  onClick={() => {
                    setIsUserMenuOpen(false)
                    openProfileModal()
                  }}
                  className="w-full flex items-center gap-2 rounded-xl px-2.5 py-2 text-zinc-300 hover:bg-white/5 hover:text-white transition-colors text-left"
                >
                  <User className="h-4 w-4 text-lime-400" />
                  <span>Driver Profile & Units</span>
                </button>

                <Link
                  to="/settings"
                  onClick={() => setIsUserMenuOpen(false)}
                  className="w-full flex items-center gap-2 rounded-xl px-2.5 py-2 text-zinc-300 hover:bg-white/5 hover:text-white transition-colors"
                >
                  <Settings className="h-4 w-4 text-zinc-400" />
                  <span>Garage Settings</span>
                </Link>
              </div>

              <div className="mt-1 pt-1 border-t border-white/6">
                <button
                  type="button"
                  onClick={async () => {
                    setIsUserMenuOpen(false)
                    await signOut()
                  }}
                  className="w-full flex items-center gap-2 rounded-xl px-2.5 py-2 text-rose-400 hover:bg-rose-500/10 transition-colors text-left font-medium"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
