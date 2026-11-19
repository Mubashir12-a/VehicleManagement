import { Check, Clock, FileText, X } from 'lucide-react'
import { useState } from 'react'

function EditDocumentDialogContent({
  doc,
  onClose,
  onSubmit,
}) {
  const isEditing = Boolean(doc?.id && !String(doc.id).startsWith('NEW'))

  const [title, setTitle] = useState(doc?.title || '')
  const [docType, setDocType] = useState(doc?.docType || 'insurance')
  const [docNumber, setDocNumber] = useState(doc?.docNumber || '')
  const [issuer, setIssuer] = useState(doc?.issuer || '')
  const [issueDate, setIssueDate] = useState(doc?.issueDate || '')
  const [expiryDate, setExpiryDate] = useState(doc?.expiryDate || '')
  const [maxOdometerKm, setMaxOdometerKm] = useState(
    doc?.maxOdometerKm ? String(doc.maxOdometerKm) : '',
  )
  const [notes, setNotes] = useState(doc?.notes || '')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)

    if (!title.trim()) {
      setError('Document title is required.')
      return
    }

    if (!expiryDate) {
      setError('Please provide an expiry date.')
      return
    }

    setIsSubmitting(true)
    try {
      await onSubmit({
        id: doc?.id,
        title: title.trim(),
        docType,
        docNumber: docNumber.trim(),
        issuer: issuer.trim(),
        issueDate: issueDate || null,
        expiryDate,
        maxOdometerKm: maxOdometerKm ? Number(maxOdometerKm) : null,
        notes: notes.trim(),
      })
      onClose()
    } catch (err) {
      setError(err?.message || 'Failed to save document.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-lg overflow-hidden rounded-3xl border border-white/10 bg-[#0d1014] p-6 shadow-2xl sm:p-7">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-white/8 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-lime-400/15 text-lime-400 ring-1 ring-lime-400/30">
              <FileText className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-lg font-black tracking-tight text-white">
                {isEditing ? `Edit: ${doc.title}` : 'Add Vehicle Document'}
              </h3>
              <p className="text-xs text-zinc-400">
                Track expiry date and renewal reminders
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-white/10 p-2 text-zinc-400 transition-colors hover:bg-white/5 hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {error && (
          <div className="mt-4 rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-xs text-rose-300">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          {/* Document Title & Type */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400">
                Document Name *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Motor Insurance"
                className="mt-1.5 w-full rounded-xl border border-white/10 bg-[#12161c] px-3.5 py-2.5 text-sm text-white focus:border-lime-400 focus:outline-none focus:ring-1 focus:ring-lime-400"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400">
                Document Type
              </label>
              <select
                value={docType}
                onChange={(e) => setDocType(e.target.value)}
                className="mt-1.5 w-full rounded-xl border border-white/10 bg-[#12161c] px-3.5 py-2.5 text-sm text-white focus:border-lime-400 focus:outline-none focus:ring-1 focus:ring-lime-400"
              >
                <option value="insurance">Insurance</option>
                <option value="rc">Registration Certificate (RC)</option>
                <option value="puc">PUC Certificate</option>
                <option value="warranty">Warranty</option>
                <option value="other">Other Document</option>
              </select>
            </div>
          </div>

          {/* Policy / Cert Number & Issuer */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400">
                Policy / Cert Number
              </label>
              <input
                type="text"
                value={docNumber}
                onChange={(e) => setDocNumber(e.target.value)}
                placeholder="e.g. POL-88392104"
                className="mt-1.5 w-full rounded-xl border border-white/10 bg-[#12161c] px-3.5 py-2.5 font-mono text-sm text-white focus:border-lime-400 focus:outline-none focus:ring-1 focus:ring-lime-400"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400">
                Issuer / Provider
              </label>
              <input
                type="text"
                value={issuer}
                onChange={(e) => setIssuer(e.target.value)}
                placeholder="e.g. Acko General Insurance / RTO"
                className="mt-1.5 w-full rounded-xl border border-white/10 bg-[#12161c] px-3.5 py-2.5 text-sm text-white focus:border-lime-400 focus:outline-none focus:ring-1 focus:ring-lime-400"
              />
            </div>
          </div>

          {/* Expiry Date & Issue Date */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400">
                Expiry Date *
              </label>
              <input
                type="date"
                required
                value={expiryDate}
                onChange={(e) => setExpiryDate(e.target.value)}
                className="mt-1.5 w-full rounded-xl border border-white/10 bg-[#12161c] px-3.5 py-2.5 font-mono text-sm text-white focus:border-lime-400 focus:outline-none focus:ring-1 focus:ring-lime-400"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400">
                Issue Date (Optional)
              </label>
              <input
                type="date"
                value={issueDate}
                onChange={(e) => setIssueDate(e.target.value)}
                className="mt-1.5 w-full rounded-xl border border-white/10 bg-[#12161c] px-3.5 py-2.5 font-mono text-sm text-white focus:border-lime-400 focus:outline-none focus:ring-1 focus:ring-lime-400"
              />
            </div>
          </div>

          {/* Max Odometer (For warranty) */}
          {docType === 'warranty' && (
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400">
                Warranty Odometer Limit (km) (Optional)
              </label>
              <div className="relative mt-1.5">
                <input
                  type="number"
                  min={0}
                  value={maxOdometerKm}
                  onChange={(e) => setMaxOdometerKm(e.target.value)}
                  placeholder="e.g. 75000"
                  className="w-full rounded-xl border border-white/10 bg-[#12161c] px-3.5 py-2.5 font-mono text-sm text-white focus:border-lime-400 focus:outline-none focus:ring-1 focus:ring-lime-400"
                />
                <span className="absolute right-3.5 top-1/2 -translate-y-1/2 font-mono text-xs text-zinc-500">
                  km
                </span>
              </div>
            </div>
          )}

          {/* Notes */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400">
              Notes & Coverage Details (Optional)
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Zero-depreciation cover with RSA included"
              className="mt-1.5 w-full rounded-xl border border-white/10 bg-[#12161c] px-3.5 py-2.5 text-sm text-white focus:border-lime-400 focus:outline-none focus:ring-1 focus:ring-lime-400"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="rounded-xl border border-white/10 px-4 py-2.5 text-xs font-bold text-zinc-300 hover:bg-white/5"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-1.5 rounded-xl bg-lime-400 px-5 py-2.5 text-xs font-black text-zinc-950 transition-colors hover:bg-lime-300 disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Clock className="h-3.5 w-3.5 animate-spin" /> Saving...
                </>
              ) : (
                <>
                  <Check className="h-3.5 w-3.5" /> Save Document
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function EditDocumentModal({
  isOpen,
  doc,
  onClose,
  onSubmit,
}) {
  if (!isOpen) return null

  return (
    <EditDocumentDialogContent
      doc={doc}
      onClose={onClose}
      onSubmit={onSubmit}
    />
  )
}
