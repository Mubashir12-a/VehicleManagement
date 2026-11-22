import {
  AlertCircle,
  CheckCircle2,
  LogOut,
  Mail,
  Phone,
  Save,
  Shield,
  User,
  X,
} from 'lucide-react'
import { useState } from 'react'
import { useAuth } from '../../context/AuthContextCore'

function ProfileForm({
  user,
  profile,
  onSave,
  onSignOut,
  confirmSignOut,
  isSaving,
  statusMessage,
}) {
  const [fullName, setFullName] = useState(
    () =>
      profile?.full_name ||
      user?.user_metadata?.full_name ||
      user?.email?.split('@')[0] ||
      '',
  )
  const [phone, setPhone] = useState(() => profile?.phone || '')
  const [bio, setBio] = useState(() => profile?.bio || '')
  const [currency, setCurrency] = useState(
    () => profile?.preferences?.currency || '₹',
  )
  const [distanceUnit, setDistanceUnit] = useState(
    () => profile?.preferences?.distanceUnit || 'km',
  )
  const [fuelUnit, setFuelUnit] = useState(
    () => profile?.preferences?.fuelUnit || 'L',
  )

  const getInitials = (name) => {
    if (!name) return 'US'
    const parts = name.trim().split(' ')
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase()
    }
    return name.slice(0, 2).toUpperCase()
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    onSave({
      full_name: fullName.trim(),
      phone: phone.trim(),
      bio: bio.trim(),
      preferences: {
        currency,
        distanceUnit,
        fuelUnit,
      },
    })
  }

  return (
    <>
      {/* Header with Avatar */}
      <div className="px-6 pt-6 pb-4 border-b border-white/6">
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl border-2 border-lime-400 bg-lime-400/15 text-lg font-black text-lime-300 shadow-lg shadow-lime-400/20">
              {getInitials(fullName || user.email)}
            </div>
            <span className="absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full border-2 border-[#0c1017] bg-lime-400" />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-black text-white">
                {fullName || user.email?.split('@')[0]}
              </h3>
              <span className="rounded-full bg-lime-400/10 px-2 py-0.5 text-[10px] font-bold text-lime-400 border border-lime-400/30">
                Verified Owner
              </span>
            </div>
            <p className="text-xs text-zinc-400 flex items-center gap-1.5 mt-0.5">
              <Mail className="h-3 w-3 text-zinc-500" />
              <span>{user.email}</span>
            </p>
          </div>
        </div>
      </div>

      {/* Body */}
      <form
        onSubmit={handleSubmit}
        className="px-6 py-4 space-y-4 max-h-[75vh] overflow-y-auto"
      >
        {/* Status Alert */}
        {statusMessage.text && (
          <div
            className={`flex items-start gap-2.5 rounded-xl border p-3 text-xs ${
              statusMessage.type === 'error'
                ? 'border-rose-500/30 bg-rose-500/10 text-rose-300'
                : 'border-lime-500/30 bg-lime-500/10 text-lime-300'
            }`}
          >
            {statusMessage.type === 'error' ? (
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-rose-400" />
            ) : (
              <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5 text-lime-400" />
            )}
            <div className="flex-1">{statusMessage.text}</div>
          </div>
        )}

        {/* Full Name & Phone */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1">
              Display Name
            </label>
            <div className="relative">
              <User className="absolute left-3 top-2.5 h-4 w-4 text-zinc-500" />
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Enter (e.g. xyz)"
                className="w-full rounded-xl border border-white/10 bg-white/5 py-2 pl-9 pr-3 text-xs text-white placeholder-zinc-500 focus:border-lime-400 focus:outline-none focus:ring-1 focus:ring-lime-400"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1">
              Phone / WhatsApp
            </label>
            <div className="relative">
              <Phone className="absolute left-3 top-2.5 h-4 w-4 text-zinc-500" />
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Enter (e.g. 9123456789)"
                className="w-full rounded-xl border border-white/10 bg-white/5 py-2 pl-9 pr-3 text-xs text-white placeholder-zinc-500 focus:border-lime-400 focus:outline-none focus:ring-1 focus:ring-lime-400"
              />
            </div>
          </div>
        </div>

        {/* Bio / Tagline */}
        <div>
          <label className="block text-xs font-semibold text-zinc-300 mb-1">
            Rider Bio / Tagline
          </label>
          <textarea
            rows={2}
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="Enter bio"
            className="w-full rounded-xl border border-white/10 bg-white/5 p-2.5 text-xs text-white placeholder-zinc-500 focus:border-lime-400 focus:outline-none focus:ring-1 focus:ring-lime-400 resize-none"
          />
        </div>

        {/* Unit Preferences */}
        <div className="rounded-xl border border-white/8 bg-white/2 p-3 space-y-2">
          <span className="block text-xs font-bold text-zinc-300">
            Units & Regional Settings
          </span>
          <div className="grid grid-cols-3 gap-2 text-xs">
            <div>
              <label className="block text-[10px] text-zinc-400 mb-1">
                Currency
              </label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="w-full rounded-lg border border-white/10 bg-black/60 px-2 py-1.5 text-xs text-white focus:border-lime-400 focus:outline-none"
              >
                <option value="₹">₹ (INR)</option>
                <option value="$">$ (USD)</option>
                <option value="€">€ (EUR)</option>
                <option value="£">£ (GBP)</option>
              </select>
            </div>

            <div>
              <label className="block text-[10px] text-zinc-400 mb-1">
                Distance
              </label>
              <select
                value={distanceUnit}
                onChange={(e) => setDistanceUnit(e.target.value)}
                className="w-full rounded-lg border border-white/10 bg-black/60 px-2 py-1.5 text-xs text-white focus:border-lime-400 focus:outline-none"
              >
                <option value="km">Kilometers (km)</option>
                <option value="mi">Miles (mi)</option>
              </select>
            </div>

            <div>
              <label className="block text-[10px] text-zinc-400 mb-1">
                Volume
              </label>
              <select
                value={fuelUnit}
                onChange={(e) => setFuelUnit(e.target.value)}
                className="w-full rounded-lg border border-white/10 bg-black/60 px-2 py-1.5 text-xs text-white focus:border-lime-400 focus:outline-none"
              >
                <option value="L">Liters (L)</option>
                <option value="gal">Gallons (gal)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Security & Sync Status */}
        <div className="rounded-xl border border-white/6 bg-white/2 p-3 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <Shield className="h-4 w-4 text-lime-400" />
            <div>
              <p className="font-semibold text-zinc-200">
                Cloud Isolation Active
              </p>
              <p className="text-[10px] text-zinc-500">
                Data secured with PostgreSQL Row-Level Security
              </p>
            </div>
          </div>
          <span className="text-[10px] font-mono text-zinc-500">
            UID: {user.id.slice(0, 8)}…
          </span>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3 pt-2">
          <button
            type="submit"
            disabled={isSaving}
            className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-lime-400 py-2.5 text-xs font-bold text-zinc-950 transition-all hover:bg-lime-300 disabled:opacity-50"
          >
            {isSaving ? (
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-zinc-950 border-t-transparent" />
            ) : (
              <>
                <Save className="h-4 w-4" />
                <span>Save Changes</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={onSignOut}
            className={`flex items-center gap-1.5 rounded-xl border px-4 py-2.5 text-xs font-bold transition-all ${
              confirmSignOut
                ? 'border-rose-500 bg-rose-500 text-white'
                : 'border-rose-500/30 bg-rose-500/10 text-rose-300 hover:bg-rose-500/20'
            }`}
          >
            <LogOut className="h-4 w-4" />
            <span>{confirmSignOut ? 'Confirm Sign Out?' : 'Sign Out'}</span>
          </button>
        </div>
      </form>
    </>
  )
}

export default function ProfileModal() {
  const {
    user,
    profile,
    isProfileModalOpen,
    closeProfileModal,
    updateProfile,
    signOut,
  } = useAuth()

  const [isSaving, setIsSaving] = useState(false)
  const [statusMessage, setStatusMessage] = useState({ type: '', text: '' })
  const [confirmSignOut, setConfirmSignOut] = useState(false)

  if (!isProfileModalOpen || !user) return null

  const handleSave = async (updates) => {
    setIsSaving(true)
    setStatusMessage({ type: '', text: '' })

    try {
      await updateProfile(updates)
      setStatusMessage({
        type: 'success',
        text: 'Profile and preferences updated successfully!',
      })
      setTimeout(() => {
        setStatusMessage({ type: '', text: '' })
      }, 3000)
    } catch (err) {
      console.error('Failed to update profile:', err)
      setStatusMessage({
        type: 'error',
        text: err.message || 'Failed to update profile.',
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleSignOutClick = async () => {
    if (!confirmSignOut) {
      setConfirmSignOut(true)
      return
    }
    await signOut()
    closeProfileModal()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-lg overflow-hidden rounded-2xl border border-white/10 bg-[#0c1017] shadow-2xl shadow-black/80 text-zinc-100"
        role="dialog"
        aria-modal="true"
      >
        {/* Accent Bar */}
        <div className="h-1 w-full bg-gradient-to-r from-lime-500 via-lime-300 to-emerald-400" />

        {/* Close Button */}
        <button
          type="button"
          onClick={closeProfileModal}
          className="absolute top-4 right-4 rounded-xl p-1.5 text-zinc-400 hover:bg-white/5 hover:text-white transition-colors"
          aria-label="Close"
        >
          <X className="h-5 w-5" />
        </button>

        <ProfileForm
          key={user.id + (profile?.updated_at || '')}
          user={user}
          profile={profile}
          onSave={handleSave}
          onSignOut={handleSignOutClick}
          confirmSignOut={confirmSignOut}
          isSaving={isSaving}
          statusMessage={statusMessage}
        />
      </div>
    </div>
  )
}
