import {
  AlertCircle,
  Car,
  CheckCircle2,
  Eye,
  EyeOff,
  Lock,
  LogIn,
  Mail,
  Phone,
  Shield,
  User,
  UserPlus,
  X,
} from 'lucide-react'
import { useState } from 'react'
import { useAuth } from '../../context/AuthContextCore'

export default function AuthModal() {
  const {
    isAuthModalOpen,
    authModalTab,
    closeAuthModal,
    openAuthModal,
    signInWithEmail,
    signUpWithEmail,
    resetPassword,
  } = useAuth()

  // Form states
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('')
  const [vehicleName, setVehicleName] = useState('')
  const [vehicleBrand, setVehicleBrand] = useState('')
  const [vehicleModel, setVehicleModel] = useState('')
  const [vehiclePlate, setVehiclePlate] = useState('')

  // UI status
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const [isDuplicateEmail, setIsDuplicateEmail] = useState(false)

  if (!isAuthModalOpen) return null

  const handleTabSwitch = (tab) => {
    setErrorMessage('')
    setSuccessMessage('')
    setIsDuplicateEmail(false)
    openAuthModal(tab)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setErrorMessage('')
    setSuccessMessage('')
    setIsDuplicateEmail(false)
    setIsSubmitting(true)

    try {
      if (authModalTab === 'signin') {
        if (!email || !password) {
          throw new Error('Please fill in both email and password.')
        }
        await signInWithEmail(email, password)
        setSuccessMessage('Logged in successfully! Loading your garage...')
        setTimeout(() => {
          closeAuthModal()
        }, 1000)
      } else if (authModalTab === 'signup') {
        if (!email || !password) {
          throw new Error('Email and password are required.')
        }
        if (password.length < 6) {
          throw new Error('Password must be at least 6 characters long.')
        }
        await signUpWithEmail(email, password, {
          fullName: fullName.trim() || 'xyz',
          phone: phone.trim() || '9123456789',
          vehicleName: vehicleName.trim() || 'Enter Vehicle Name',
          vehicleBrand: vehicleBrand.trim() || 'None',
          vehicleModel: vehicleModel.trim() || 'None',
          vehiclePlate: vehiclePlate.trim() || 'None',
        })
        setSuccessMessage(
          'Account created successfully! Check your email if verification is required, or enjoy your cloud garage.',
        )
        setTimeout(() => {
          closeAuthModal()
        }, 1500)
      } else if (authModalTab === 'forgot') {
        if (!email) {
          throw new Error('Please enter your account email address.')
        }
        await resetPassword(email)
        setSuccessMessage(
          'Password reset link has been dispatched to your email address.',
        )
      }
    } catch (err) {
      console.error('Auth error:', err)
      const isDuplicate =
        err?.code === 'EMAIL_ALREADY_EXISTS' ||
        err?.message?.toLowerCase().includes('already registered') ||
        err?.message?.toLowerCase().includes('already exists')

      setIsDuplicateEmail(Boolean(isDuplicate))
      setErrorMessage(
        isDuplicate
          ? 'This email is already registered. Please sign in instead.'
          : err.message || 'An error occurred during authentication. Please retry.',
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-md overflow-hidden rounded-2xl border border-white/10 bg-[#0c1017] shadow-2xl shadow-black/80 text-zinc-100"
        role="dialog"
        aria-modal="true"
      >
        {/* Neon Lime Top Accent Line */}
        <div className="h-1 w-full bg-gradient-to-r from-lime-500 via-lime-300 to-emerald-400" />

        {/* Close Button */}
        <button
          type="button"
          onClick={closeAuthModal}
          className="absolute top-4 right-4 rounded-xl p-1.5 text-zinc-400 hover:bg-white/5 hover:text-white transition-colors"
          aria-label="Close"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Header */}
        <div className="px-6 pt-6 pb-4">
          <div className="flex items-center gap-2.5 mb-1.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-lime-400/40 bg-lime-400/10 text-lime-400">
              <Shield className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-lg font-black tracking-tight text-white">
                {authModalTab === 'signin' && 'Sign In to MKD Garage'}
                {authModalTab === 'signup' && 'Create Your Driver Profile'}
                {authModalTab === 'forgot' && 'Reset Password'}
              </h3>
              <p className="text-xs text-zinc-400">
                {authModalTab === 'signin' &&
                  'Access your cloud telemetry, fuel records, and service reminders.'}
                {authModalTab === 'signup' &&
                  'Start your personal cloud garage with encrypted data isolation.'}
                {authModalTab === 'forgot' &&
                  'Enter your email to receive recovery instructions.'}
              </p>
            </div>
          </div>

          {/* Tab Switcher */}
          {authModalTab !== 'forgot' && (
            <div className="mt-4 flex rounded-xl border border-white/8 bg-black/40 p-1 text-xs font-semibold">
              <button
                type="button"
                onClick={() => handleTabSwitch('signin')}
                className={`flex-1 rounded-lg py-2 transition-all ${
                  authModalTab === 'signin'
                    ? 'bg-lime-400 text-zinc-950 font-bold shadow-md shadow-lime-400/20'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => handleTabSwitch('signup')}
                className={`flex-1 rounded-lg py-2 transition-all ${
                  authModalTab === 'signup'
                    ? 'bg-lime-400 text-zinc-950 font-bold shadow-md shadow-lime-400/20'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                Create Account
              </button>
            </div>
          )}
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="px-6 pb-6 space-y-4">
          {/* Error Banner / Duplicate Email Alert */}
          {errorMessage && (
            <div
              className={`flex items-start gap-2.5 rounded-xl border p-3 text-xs ${
                isDuplicateEmail
                  ? 'border-amber-400/40 bg-amber-400/10 text-amber-200'
                  : 'border-rose-500/30 bg-rose-500/10 text-rose-300'
              }`}
            >
              <AlertCircle
                className={`h-4 w-4 shrink-0 mt-0.5 ${
                  isDuplicateEmail ? 'text-amber-400' : 'text-rose-400'
                }`}
              />
              <div className="flex-1 space-y-2">
                <p className="font-semibold">{errorMessage}</p>
                {isDuplicateEmail && (
                  <button
                    type="button"
                    onClick={() => handleTabSwitch('signin')}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-amber-400 px-3 py-1.5 text-[11px] font-bold text-zinc-950 transition hover:bg-amber-300 shadow-md shadow-amber-400/20"
                  >
                    <span>Sign In to Existing Account</span>
                    <span aria-hidden="true">&rarr;</span>
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Success Banner */}
          {successMessage && (
            <div className="flex items-start gap-2.5 rounded-xl border border-lime-500/30 bg-lime-500/10 p-3 text-xs text-lime-300">
              <CheckCircle2 className="h-4 w-4 shrink-0 text-lime-400 mt-0.5" />
              <div className="flex-1">{successMessage}</div>
            </div>
          )}

          {/* Full Name (Sign Up only) */}
          {authModalTab === 'signup' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">
                  Full Name / Driver Name
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-2.5 h-4 w-4 text-zinc-500" />
                  <input
                    type="text"
                    required
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
          )}

          {/* Email */}
          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-2.5 h-4 w-4 text-zinc-500" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter email"
                className="w-full rounded-xl border border-white/10 bg-white/5 py-2 pl-9 pr-3 text-xs text-white placeholder-zinc-500 focus:border-lime-400 focus:outline-none focus:ring-1 focus:ring-lime-400"
              />
            </div>
          </div>

          {/* Password (Not for forgot password) */}
          {authModalTab !== 'forgot' && (
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold text-zinc-300">
                  Password
                </label>
                {authModalTab === 'signin' && (
                  <button
                    type="button"
                    onClick={() => handleTabSwitch('forgot')}
                    className="text-[11px] text-lime-400 hover:underline"
                  >
                    Forgot password?
                  </button>
                )}
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-2.5 h-4 w-4 text-zinc-500" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
                  className="w-full rounded-xl border border-white/10 bg-white/5 py-2 pl-9 pr-9 text-xs text-white placeholder-zinc-500 focus:border-lime-400 focus:outline-none focus:ring-1 focus:ring-lime-400"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-zinc-500 hover:text-zinc-300"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              {authModalTab === 'signup' && (
                <p className="mt-1 text-[10px] text-zinc-500">
                  Must be at least 6 characters.
                </p>
              )}
            </div>
          )}

          {/* Optional Starter Vehicle Details on Sign Up */}
          {authModalTab === 'signup' && (
            <div className="rounded-xl border border-white/6 bg-white/2 p-3 space-y-2.5">
              <div className="flex items-center gap-1.5 text-[11px] font-bold text-zinc-300">
                <Car className="h-3.5 w-3.5 text-lime-400" />
                <span>Quick Garage Starter (Optional)</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <label className="block text-[10px] text-zinc-400 mb-0.5">
                    Vehicle Nickname
                  </label>
                  <input
                    type="text"
                    value={vehicleName}
                    onChange={(e) => setVehicleName(e.target.value)}
                    placeholder="Enter vehicle name"
                    className="w-full rounded-lg border border-white/10 bg-black/40 px-2.5 py-1.5 text-xs text-white placeholder-zinc-600 focus:border-lime-400 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-zinc-400 mb-0.5">
                    Plate Number
                  </label>
                  <input
                    type="text"
                    value={vehiclePlate}
                    onChange={(e) => setVehiclePlate(e.target.value)}
                    placeholder="Enter plate number"
                    className="w-full rounded-lg border border-white/10 bg-black/40 px-2.5 py-1.5 text-xs text-white placeholder-zinc-600 focus:border-lime-400 focus:outline-none"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <label className="block text-[10px] text-zinc-400 mb-0.5">
                    Brand / Manufacturer
                  </label>
                  <input
                    type="text"
                    value={vehicleBrand}
                    onChange={(e) => setVehicleBrand(e.target.value)}
                    placeholder="Enter brand"
                    className="w-full rounded-lg border border-white/10 bg-black/40 px-2.5 py-1.5 text-xs text-white placeholder-zinc-600 focus:border-lime-400 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-zinc-400 mb-0.5">
                    Model
                  </label>
                  <input
                    type="text"
                    value={vehicleModel}
                    onChange={(e) => setVehicleModel(e.target.value)}
                    placeholder="Enter model"
                    className="w-full rounded-lg border border-white/10 bg-black/40 px-2.5 py-1.5 text-xs text-white placeholder-zinc-600 focus:border-lime-400 focus:outline-none"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-lime-400 py-2.5 text-xs font-bold text-zinc-950 transition-all hover:bg-lime-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-lime-400/20 active:scale-[0.99]"
          >
            {isSubmitting ? (
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-zinc-950 border-t-transparent" />
            ) : (
              <>
                {authModalTab === 'signin' && <LogIn className="h-4 w-4" />}
                {authModalTab === 'signup' && <UserPlus className="h-4 w-4" />}
                {authModalTab === 'forgot' && <Mail className="h-4 w-4" />}
                <span>
                  {authModalTab === 'signin' && 'Sign In to Garage'}
                  {authModalTab === 'signup' && 'Create Account & Initialize'}
                  {authModalTab === 'forgot' && 'Send Recovery Instructions'}
                </span>
              </>
            )}
          </button>

          {/* Footers & Guest Link */}
          <div className="pt-2 text-center text-xs text-zinc-400">
            {authModalTab === 'forgot' ? (
              <button
                type="button"
                onClick={() => handleTabSwitch('signin')}
                className="text-lime-400 hover:underline"
              >
                Back to Sign In
              </button>
            ) : (
              <div className="flex items-center justify-between text-[11px] text-zinc-500 pt-1">
                <span>Previewing without login?</span>
                <button
                  type="button"
                  onClick={closeAuthModal}
                  className="text-zinc-400 hover:text-white underline underline-offset-2"
                >
                  Continue in Guest Mode
                </button>
              </div>
            )}
          </div>
        </form>
      </div>
    </div>
  )
}
