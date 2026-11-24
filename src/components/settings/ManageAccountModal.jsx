import {
  AlertCircle,
  Check,
  CheckCircle2,
  Copy,
  Eye,
  EyeOff,
  KeyRound,
  Lock,
  Mail,
  RefreshCw,
  Shield,
  User,
  X,
} from 'lucide-react'
import { useState } from 'react'
import { useAuth } from '../../context/AuthContextCore'

export default function ManageAccountModal({ isOpen, onClose }) {
  const { user, profile, updatePassword, resetPassword } = useAuth()

  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSendingReset, setIsSendingReset] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const [copiedUid, setCopiedUid] = useState(false)

  if (!isOpen || !user) return null

  const handleCopyUid = () => {
    if (!user?.id) return
    navigator.clipboard.writeText(user.id)
    setCopiedUid(true)
    setTimeout(() => setCopiedUid(false), 2000)
  }

  const handleChangePassword = async (e) => {
    e.preventDefault()
    setErrorMessage('')
    setSuccessMessage('')

    if (!newPassword) {
      setErrorMessage('Please enter a new password.')
      return
    }
    if (newPassword.length < 6) {
      setErrorMessage('Password must be at least 6 characters long.')
      return
    }
    if (newPassword !== confirmPassword) {
      setErrorMessage('Passwords do not match. Please verify.')
      return
    }

    setIsSubmitting(true)
    try {
      await updatePassword(newPassword)
      setSuccessMessage('Password changed successfully! Next time you log in, use your new password.')
      setNewPassword('')
      setConfirmPassword('')
    } catch (err) {
      console.error('Password change error:', err)
      setErrorMessage(err?.message || 'Failed to update password. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleSendResetEmail = async () => {
    if (!user?.email || isSendingReset) return
    setErrorMessage('')
    setSuccessMessage('')
    setIsSendingReset(true)

    try {
      await resetPassword(user.email)
      setSuccessMessage(`Password recovery link has been dispatched to ${user.email}. Check your inbox!`)
    } catch (err) {
      setErrorMessage(err?.message || 'Failed to dispatch reset email. Please try again.')
    } finally {
      setIsSendingReset(false)
    }
  }

  const handleClose = () => {
    setNewPassword('')
    setConfirmPassword('')
    setErrorMessage('')
    setSuccessMessage('')
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-3xl overflow-hidden rounded-2xl border border-white/10 bg-[#0c1017] shadow-2xl shadow-black/80 text-zinc-100"
        role="dialog"
        aria-modal="true"
      >
        {/* Neon Lime Top Accent Bar */}
        <div className="h-1 w-full bg-gradient-to-r from-lime-500 via-lime-300 to-emerald-400" />

        {/* Close Button */}
        <button
          type="button"
          onClick={handleClose}
          className="absolute top-4 right-4 rounded-xl p-1.5 text-zinc-400 hover:bg-white/5 hover:text-white transition-colors"
          aria-label="Close"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Header */}
        <div className="px-6 pt-6 pb-4 border-b border-white/6">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-lime-400/40 bg-lime-400/10 text-lime-400 shadow-lg shadow-lime-400/20">
              <Shield className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-black tracking-tight text-white">
                  Manage Account & Security
                </h3>
                <span className="rounded-full bg-lime-400/10 px-2 py-0.5 text-[10px] font-bold text-lime-400 border border-lime-400/30">
                  Cloud Active
                </span>
              </div>
              <p className="text-xs text-zinc-400">
                Credentials, cloud telemetry encryption, and password management.
              </p>
            </div>
          </div>
        </div>

        {/* Modal Body */}
        <div className="px-6 py-5 space-y-5 max-h-[80vh] overflow-y-auto">
          {/* Status Banners */}
          {errorMessage && (
            <div className="flex items-start gap-2.5 rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-xs text-rose-300 animate-in fade-in">
              <AlertCircle className="h-4 w-4 shrink-0 text-rose-400 mt-0.5" />
              <div className="flex-1 font-medium">{errorMessage}</div>
            </div>
          )}

          {successMessage && (
            <div className="flex items-start gap-2.5 rounded-xl border border-lime-500/30 bg-lime-500/10 p-3 text-xs text-lime-300 animate-in fade-in">
              <CheckCircle2 className="h-4 w-4 shrink-0 text-lime-400 mt-0.5" />
              <div className="flex-1 font-semibold">{successMessage}</div>
            </div>
          )}

          {/* Account Overview Box */}
          <div className="rounded-xl border border-white/8 bg-white/3 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-bold text-zinc-300">
                <User className="h-4 w-4 text-lime-400" />
                <span>Account Identity</span>
              </div>
              <span className="text-[10px] font-mono text-zinc-500">
                Encrypted via RLS
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="rounded-lg bg-black/40 p-2.5 border border-white/5">
                <p className="text-[10px] text-zinc-500 mb-0.5">Driver Name</p>
                <p className="font-bold text-white truncate">{profile?.full_name || 'Driver'}</p>
              </div>

              <div className="rounded-lg bg-black/40 p-2.5 border border-white/5">
                <p className="text-[10px] text-zinc-500 mb-0.5">Primary Email</p>
                <p className="font-mono font-bold text-white truncate" title={user.email}>{user.email}</p>
              </div>

              <div className="rounded-lg bg-black/40 p-2.5 border border-white/5 flex items-center justify-between gap-1">
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] text-zinc-500 mb-0.5">Account UID</p>
                  <p className="font-mono font-bold text-zinc-300 truncate">{user.id.slice(0, 10)}…</p>
                </div>
                <button
                  type="button"
                  onClick={handleCopyUid}
                  className="flex items-center gap-1 rounded-md border border-white/10 bg-white/5 px-2 py-1 text-[10px] text-zinc-400 hover:text-white transition-colors"
                >
                  {copiedUid ? (
                    <>
                      <Check className="h-3 w-3 text-lime-400" />
                      <span className="text-lime-400 font-bold">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-3 w-3" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Change Password Form */}
          <div className="rounded-xl border border-lime-400/20 bg-lime-400/3 p-4 space-y-3.5">
            <div className="flex items-center gap-2">
              <KeyRound className="h-4 w-4 text-lime-400" />
              <div>
                <h4 className="text-xs font-black uppercase tracking-wider text-lime-400">
                  Change Password
                </h4>
                <p className="text-[11px] text-zinc-400">
                  Update your authentication key for all connected devices.
                </p>
              </div>
            </div>

            <form onSubmit={handleChangePassword} className="space-y-4 pt-1">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {/* New Password */}
                <div>
                  <label className="block text-[11px] font-semibold text-zinc-300 mb-1">
                    New Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-2.5 h-4 w-4 text-zinc-500" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Enter new password (min. 6 chars)"
                      className="w-full rounded-xl border border-white/10 bg-black/50 py-2 pl-9 pr-9 text-xs text-white placeholder-zinc-500 focus:border-lime-400 focus:outline-none focus:ring-1 focus:ring-lime-400"
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
                </div>

                {/* Confirm Password */}
                <div>
                  <label className="block text-[11px] font-semibold text-zinc-300 mb-1">
                    Confirm New Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-2.5 h-4 w-4 text-zinc-500" />
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Re-enter new password"
                      className="w-full rounded-xl border border-white/10 bg-black/50 py-2 pl-9 pr-9 text-xs text-white placeholder-zinc-500 focus:border-lime-400 focus:outline-none focus:ring-1 focus:ring-lime-400"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-2.5 text-zinc-500 hover:text-zinc-300"
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>
              </div>

              <div className="pt-1 flex flex-col-reverse sm:flex-row sm:items-center sm:justify-between gap-3">
                <button
                  type="button"
                  onClick={handleSendResetEmail}
                  disabled={isSendingReset}
                  className="text-[11px] text-zinc-400 hover:text-lime-400 transition-colors flex items-center gap-1"
                >
                  {isSendingReset ? (
                    <RefreshCw className="h-3 w-3 animate-spin text-lime-400" />
                  ) : (
                    <Mail className="h-3 w-3" />
                  )}
                  <span>Forgot current password? Send reset email</span>
                </button>

                <button
                  type="submit"
                  disabled={isSubmitting || !newPassword}
                  className="inline-flex items-center gap-2 rounded-xl bg-lime-400 px-4 py-2 text-xs font-bold text-zinc-950 hover:bg-lime-300 transition-all shadow-md shadow-lime-400/20 disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
                >
                  {isSubmitting ? (
                    <>
                      <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-zinc-950 border-t-transparent" />
                      <span>Updating...</span>
                    </>
                  ) : (
                    <>
                      <KeyRound className="h-3.5 w-3.5" />
                      <span>Update Password</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-white/6 flex justify-end">
          <button
            type="button"
            onClick={handleClose}
            className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold text-zinc-300 hover:bg-white/10 hover:text-white transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}
