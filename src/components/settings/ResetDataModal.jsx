import {
  AlertTriangle,
  Loader2,
  Trash2,
  X,
} from 'lucide-react'
import { useState } from 'react'

export default function ResetDataModal({ isOpen, onClose, onResetComplete }) {
  const [confirmationInput, setConfirmationInput] = useState('')
  const [isDeleting, setIsDeleting] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  if (!isOpen) return null

  const isConfirmed = confirmationInput.trim().toUpperCase() === 'DELETE'

  const handleConfirm = async (e) => {
    e.preventDefault()
    if (!isConfirmed || isDeleting) return

    setErrorMessage('')
    setIsDeleting(true)

    try {
      await onResetComplete()
      onClose()
    } catch (err) {
      setErrorMessage(
        err.message || 'Failed to erase data. Please try again.',
      )
      setIsDeleting(false)
    }
  }

  const handleClose = () => {
    if (isDeleting) return
    setConfirmationInput('')
    setErrorMessage('')
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-lg overflow-hidden rounded-2xl border border-rose-500/30 bg-[#0f0a0c] shadow-2xl shadow-rose-950/50 text-zinc-100"
        role="dialog"
        aria-modal="true"
      >
        {/* Neon Rose Top Accent Bar */}
        <div className="h-1 w-full bg-gradient-to-r from-rose-600 via-rose-500 to-amber-500" />

        {/* Close Button */}
        <button
          type="button"
          onClick={handleClose}
          disabled={isDeleting}
          className="absolute top-4 right-4 rounded-xl p-1.5 text-zinc-400 hover:bg-white/5 hover:text-white transition-colors disabled:opacity-40"
          aria-label="Close"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Header */}
        <div className="px-6 pt-6 pb-4 border-b border-white/6">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-rose-500/40 bg-rose-500/15 text-rose-400 shadow-lg shadow-rose-500/20">
              <AlertTriangle className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-lg font-black tracking-tight text-white">
                Permanently Delete All Data?
              </h3>
              <p className="text-xs text-rose-300 font-medium">
                This action is irreversible and cannot be undone.
              </p>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-4 text-xs leading-relaxed">
          {errorMessage && (
            <div className="rounded-xl border border-rose-500/40 bg-rose-500/15 p-3 text-rose-300">
              {errorMessage}
            </div>
          )}

          <p className="text-zinc-300">
            You are about to permanently erase all records in your garage profile. Your profile will be reset to a brand-new, clean slate with initial defaults (0 metrics).
          </p>

          <div className="rounded-xl border border-rose-500/20 bg-rose-500/5 p-3.5 space-y-2">
            <p className="font-bold text-rose-400 text-[11px] uppercase tracking-wider">
              The following will be permanently erased:
            </p>
            <ul className="space-y-1.5 text-zinc-400 list-disc list-inside">
              <li>All registered vehicle profiles in your fleet</li>
              <li>Every fuel refill entry, expense log, and mileage calculation</li>
              <li>Component wear tracking, service history, and repairs</li>
              <li>All scheduled maintenance reminders and compliance documents</li>
              <li>All modifications and custom accessories history</li>
            </ul>
          </div>

          <form onSubmit={handleConfirm} className="space-y-4 pt-2">
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                To confirm, type <span className="font-mono font-bold text-rose-400 select-none">DELETE</span> in the box below:
              </label>
              <input
                type="text"
                autoFocus
                disabled={isDeleting}
                value={confirmationInput}
                onChange={(e) => setConfirmationInput(e.target.value)}
                placeholder='Type "DELETE"'
                className="w-full rounded-xl border border-white/10 bg-white/5 px-3.5 py-2.5 font-mono text-xs text-white placeholder-zinc-600 focus:border-rose-500 focus:outline-none focus:ring-1 focus:ring-rose-500 uppercase tracking-widest"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={handleClose}
                disabled={isDeleting}
                className="rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-xs font-semibold text-zinc-300 hover:bg-white/10 hover:text-white transition-colors disabled:opacity-40"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!isConfirmed || isDeleting}
                className="inline-flex items-center gap-2 rounded-xl bg-rose-600 px-5 py-2.5 text-xs font-black text-white hover:bg-rose-500 transition-colors shadow-lg shadow-rose-600/30 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Erasing Everything...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="h-4 w-4" />
                    <span>Permanently Erase All Data</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
