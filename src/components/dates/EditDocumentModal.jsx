import { Calendar, Check, Clock, FileText, Info, X } from 'lucide-react'
import { useState } from 'react'
import { calculateExpiryDate, DEFAULT_DOC_DURATIONS } from './datesUtils'

const DOC_TYPE_META = {
  insurance_comprehensive: {
    label: 'Comprehensive Insurance (Own Damage)',
    defaultDuration: 1,
    defaultTitle: 'Comprehensive Insurance (Own Damage)',
  },
  insurance_third_party: {
    label: 'Third Party Insurance',
    defaultDuration: 5,
    defaultTitle: 'Third Party Insurance',
  },
  rc: {
    label: 'Registration Certificate (RC)',
    defaultDuration: 15,
    defaultTitle: 'Registration Certificate (RC)',
  },
  puc: {
    label: 'PUC Certificate',
    defaultDuration: 1,
    defaultTitle: 'PUC Certificate',
  },
  warranty: {
    label: 'Manufacturer Warranty',
    defaultDuration: 5,
    defaultTitle: 'Manufacturer Vehicle Warranty',
  },
  other: {
    label: 'Other Document',
    defaultDuration: 1,
    defaultTitle: 'Vehicle Document',
  },
}

const PRESET_DURATIONS = [
  { label: '1 Year', value: 1 },
  { label: '2 Years', value: 2 },
  { label: '3 Years', value: 3 },
  { label: '4 Years', value: 4 },
  { label: '5 Years', value: 5 },
  { label: '15 Years (RC)', value: 15 },
]

function normalizeDocType(type) {
  if (type === 'insurance') return 'insurance_comprehensive'
  if (DOC_TYPE_META[type]) return type
  return 'other'
}

function EditDocumentDialogContent({ doc, onClose, onSubmit }) {
  const isEditing = Boolean(doc?.id && !String(doc.id).startsWith('NEW'))

  const initialDocType = normalizeDocType(doc?.docType)
  const [docType, setDocType] = useState(initialDocType)
  const [title, setTitle] = useState(
    doc?.title || DOC_TYPE_META[initialDocType]?.defaultTitle || '',
  )
  const [docNumber, setDocNumber] = useState(doc?.docNumber || '')
  const [issuer, setIssuer] = useState(doc?.issuer || '')
  const [issueDate, setIssueDate] = useState(
    () => doc?.issueDate || new Date().toISOString().split('T')[0],
  )
  const [durationYears, setDurationYears] = useState(
    doc?.durationYears ??
      DEFAULT_DOC_DURATIONS[initialDocType] ??
      DOC_TYPE_META[initialDocType]?.defaultDuration ??
      1,
  )
  const [maxOdometerKm, setMaxOdometerKm] = useState(
    doc?.maxOdometerKm ? String(doc.maxOdometerKm) : '',
  )
  const [amountPaid, setAmountPaid] = useState(
    doc?.amountPaid ? String(doc.amountPaid) : '',
  )
  const [notes, setNotes] = useState(doc?.notes || '')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState(null)

  // Auto-calculated expiry date based on Issue Date + Duration
  const calculatedExpiry = calculateExpiryDate(issueDate, durationYears)

  const handleDocTypeChange = (nextType) => {
    setDocType(nextType)
    const meta = DOC_TYPE_META[nextType]
    if (meta) {
      const currentDefaultTitles = Object.values(DOC_TYPE_META).map(
        (m) => m.defaultTitle,
      )
      if (!title || currentDefaultTitles.includes(title)) {
        setTitle(meta.defaultTitle)
      }
      setDurationYears(meta.defaultDuration)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)

    if (!title.trim()) {
      setError('Document title is required.')
      return
    }

    if (!issueDate) {
      setError('Please provide an issue date.')
      return
    }

    if (!durationYears || Number(durationYears) <= 0) {
      setError('Please provide a valid duration in years.')
      return
    }

    if (!calculatedExpiry) {
      setError('Could not calculate a valid expiry date.')
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
        issueDate,
        durationYears: Number(durationYears),
        expiryDate: calculatedExpiry,
        maxOdometerKm: maxOdometerKm ? Number(maxOdometerKm) : null,
        amountPaid: amountPaid ? Number(amountPaid) : 0,
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal Dialog: Wide, horizontal balance, no vertical scrollbar */}
      <div className="relative max-h-[96vh] w-full max-w-4xl overflow-y-auto rounded-3xl border border-white/10 bg-[#0d1014] p-6 shadow-2xl sm:p-8 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-white/8 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-lime-400/15 text-lime-400 ring-1 ring-lime-400/30">
              <FileText className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-xl font-black tracking-tight text-white">
                {isEditing ? `Edit: ${doc.title}` : 'Add Vehicle Document'}
              </h3>
              <p className="text-xs text-zinc-400">
                Calculates expiry date from issue date & duration
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-white/10 p-2 text-zinc-400 transition-colors hover:bg-white/5 hover:text-white"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {error && (
          <div className="mt-4 rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-xs text-rose-300">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-6 space-y-6">
          {/* 2-Column Wide Grid for Balanced Vertical Footprint */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {/* LEFT COLUMN: Document Identifiers & Pricing */}
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400">
                  Document Type *
                </label>
                <select
                  value={docType}
                  onChange={(e) => handleDocTypeChange(e.target.value)}
                  className="mt-1.5 w-full rounded-xl border border-white/10 bg-[#12161c] px-3.5 py-2.5 text-sm text-white focus:border-lime-400 focus:outline-none focus:ring-1 focus:ring-lime-400"
                >
                  <option value="insurance_comprehensive">
                    Comprehensive Insurance (Own Damage)
                  </option>
                  <option value="insurance_third_party">
                    Third Party Insurance
                  </option>
                  <option value="rc">Registration Certificate (RC)</option>
                  <option value="puc">PUC Certificate</option>
                  <option value="warranty">Warranty</option>
                  <option value="other">Other Document</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400">
                  Document Title *
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter document title"
                  className="mt-1.5 w-full rounded-xl border border-white/10 bg-[#12161c] px-3.5 py-2.5 text-sm text-white focus:border-lime-400 focus:outline-none focus:ring-1 focus:ring-lime-400"
                />
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400">
                    Policy / Cert #
                  </label>
                  <input
                    type="text"
                    value={docNumber}
                    onChange={(e) => setDocNumber(e.target.value)}
                    placeholder="Enter policy / cert #"
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
                    placeholder="Enter issuer / provider"
                    className="mt-1.5 w-full rounded-xl border border-white/10 bg-[#12161c] px-3.5 py-2.5 text-sm text-white focus:border-lime-400 focus:outline-none focus:ring-1 focus:ring-lime-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400">
                    Fee / Premium (₹)
                  </label>
                  <div className="relative mt-1.5">
                    <input
                      type="number"
                      min={0}
                      step="any"
                      value={amountPaid}
                      onChange={(e) => setAmountPaid(e.target.value)}
                      placeholder="0"
                      className="w-full rounded-xl border border-white/10 bg-[#12161c] px-3.5 py-2.5 font-mono text-sm text-white focus:border-lime-400 focus:outline-none focus:ring-1 focus:ring-lime-400"
                    />
                    <span className="absolute right-3.5 top-1/2 -translate-y-1/2 font-mono text-xs text-lime-400">
                      ₹
                    </span>
                  </div>
                </div>

                {docType === 'warranty' ? (
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400">
                      Warranty Odo Limit
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
                ) : (
                  <div className="hidden sm:block" />
                )}
              </div>
            </div>

            {/* RIGHT COLUMN: Validity Calculation & Notes */}
            <div className="space-y-4">
              {/* Validity Calculation Container */}
              <div className="rounded-2xl border border-white/8 bg-[#12161c] p-4.5 space-y-3.5">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-lime-400">
                  <Calendar className="h-4 w-4" />
                  Validity Calculation
                </div>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div>
                    <label className="block text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
                      Issue Date *
                    </label>
                    <input
                      type="date"
                      required
                      value={issueDate}
                      onChange={(e) => setIssueDate(e.target.value)}
                      className="mt-1 w-full rounded-xl border border-white/10 bg-[#0d1014] px-3.5 py-2 font-mono text-sm text-white focus:border-lime-400 focus:outline-none focus:ring-1 focus:ring-lime-400"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
                      Duration (Years) *
                    </label>
                    <input
                      type="number"
                      min={0.1}
                      step="any"
                      required
                      value={durationYears}
                      onChange={(e) => setDurationYears(e.target.value)}
                      placeholder="e.g. 1, 5, 15"
                      className="mt-1 w-full rounded-xl border border-white/10 bg-[#0d1014] px-3.5 py-2 font-mono text-sm text-white focus:border-lime-400 focus:outline-none focus:ring-1 focus:ring-lime-400"
                    />
                  </div>
                </div>

                {/* Quick Presets */}
                <div>
                  <span className="block text-[10px] font-semibold uppercase tracking-wider text-zinc-500 mb-1.5">
                    Quick Presets:
                  </span>
                  <div className="flex flex-wrap items-center gap-1.5">
                    {PRESET_DURATIONS.map((preset) => (
                      <button
                        key={preset.value}
                        type="button"
                        onClick={() => setDurationYears(preset.value)}
                        className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition-colors ${
                          Number(durationYears) === preset.value
                            ? 'border border-lime-400/40 bg-lime-400/20 text-lime-300 font-bold shadow-[0_0_12px_rgba(163,230,53,0.15)]'
                            : 'border border-white/10 bg-white/5 text-zinc-400 hover:bg-white/10 hover:text-white'
                        }`}
                      >
                        {preset.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Highlight Expiry Display */}
                <div className="flex items-center justify-between rounded-xl border border-lime-400/25 bg-linear-to-r from-lime-400/10 via-[#12161c] to-lime-400/5 px-3.5 py-2.5">
                  <div className="flex items-center gap-2">
                    <Info className="h-4 w-4 text-lime-400 shrink-0" />
                    <span className="text-xs text-zinc-300">
                      Calculated Expiration:
                    </span>
                  </div>
                  <span className="font-mono text-sm font-extrabold text-lime-400 tracking-wide">
                    {calculatedExpiry || '—'}
                  </span>
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400">
                  Notes & Details (Optional)
                </label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Enter notes"
                  className="mt-1.5 w-full rounded-xl border border-white/10 bg-[#12161c] px-3.5 py-2.5 text-sm text-white focus:border-lime-400 focus:outline-none focus:ring-1 focus:ring-lime-400"
                />
              </div>
            </div>
          </div>

          {/* Bottom Actions Bar */}
          <div className="flex items-center justify-between border-t border-white/8 pt-4">
            <p className="hidden text-xs text-zinc-500 sm:block">
              Expiry countdown and analytics will update automatically.
            </p>
            <div className="flex items-center gap-3 ml-auto">
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="rounded-xl border border-white/10 px-4 py-2.5 text-xs font-bold text-zinc-300 transition-colors hover:bg-white/5"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex items-center gap-1.5 rounded-xl bg-lime-400 px-5 py-2.5 text-xs font-black text-zinc-950 shadow-[0_0_16px_rgba(163,230,53,0.25)] transition-colors hover:bg-lime-300 disabled:opacity-50"
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
