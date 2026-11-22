import {
  Award,
  Building2,
  Clock,
  FileCheck,
  FileText,
  Pencil,
  ShieldAlert,
  ShieldCheck,
  Trash2,
} from 'lucide-react'
import { getExpiryMeta } from './datesUtils'
import { formatDisplayDate } from '../../utils/dateFormatter'

const DOC_ICONS = {
  insurance: ShieldAlert,
  insurance_comprehensive: ShieldAlert,
  insurance_third_party: ShieldCheck,
  rc: FileCheck,
  puc: Award,
  warranty: FileText,
}

export default function DocumentCard({
  doc,
  currentOdo = 0,
  onEdit,
  onDelete,
}) {
  const Icon = DOC_ICONS[doc.docType] || FileText
  const meta = getExpiryMeta(doc.expiryDate)
  const isExpired = meta.status === 'Expired'
  const isExpiringSoon = meta.status === 'Expiring Soon'

  const docNumStr = String(doc.docNumber || 'ABC-00000').trim()
  const numLen = docNumStr.length

  // Dynamic font size scaling: long numbers scale down, normal numbers stay standard
  let docNumFontClass = 'text-sm'
  if (numLen > 24) {
    docNumFontClass = 'text-[10px] leading-snug tracking-tight'
  } else if (numLen > 18) {
    docNumFontClass = 'text-[11px] leading-snug'
  } else if (numLen > 13) {
    docNumFontClass = 'text-xs'
  } else {
    docNumFontClass = 'text-sm'
  }

  // Card appearance: Normal for valid, Red for expired
  const cardBorderClass = isExpired
    ? 'border-rose-500/40 bg-linear-to-b from-rose-950/25 via-[#160c0e] to-[#0f0709] shadow-[0_0_28px_rgba(244,63,94,0.14)] hover:border-rose-500/60'
    : isExpiringSoon
      ? 'border-amber-400/30 bg-[#131418] hover:border-amber-400/50 hover:shadow-[0_0_24px_rgba(251,191,36,0.08)]'
      : 'border-white/8 bg-[#12161c] hover:border-lime-400/30 hover:shadow-[0_0_24px_rgba(163,230,53,0.06)]'

  return (
    <div
      className={`flex h-full min-h-[320px] flex-col justify-between rounded-2xl border p-5 transition-all duration-300 ${cardBorderClass}`}
    >
      {/* Top and Middle Content */}
      <div className="flex flex-1 flex-col">
        {/* Row 1: Top Row holds Icon on Left and Duration Tag on Right (VALID tag removed) */}
        <div className="flex items-center justify-between">
          <div
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ring-1 ${
              isExpired
                ? 'bg-rose-500/15 text-rose-400 ring-rose-500/30'
                : isExpiringSoon
                  ? 'bg-amber-400/15 text-amber-400 ring-amber-400/30'
                  : 'bg-lime-400/10 text-lime-400 ring-lime-400/20'
            }`}
          >
            <Icon className="h-5 w-5" />
          </div>

          <span
            className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider ring-1 ring-inset ${
              isExpired
                ? 'bg-rose-500/15 text-rose-300 ring-rose-500/30'
                : isExpiringSoon
                  ? 'bg-amber-400/15 text-amber-300 ring-amber-400/30'
                  : 'bg-lime-400/10 text-lime-300 ring-lime-400/25'
            }`}
          >
            <Clock className="h-3 w-3" />
            {doc.durationYears
              ? `${doc.durationYears} ${Number(doc.durationYears) === 1 ? 'Year' : 'Years'} Validity`
              : '1 Year Validity'}
          </span>
        </div>

        {/* Row 2: Provider Tag occupying the whole 2nd row */}
        <div className="mt-3 flex items-center">
          <span className="inline-flex items-center gap-1.5 rounded-lg border border-white/8 bg-white/4 px-2.5 py-1 text-xs text-zinc-300 font-medium max-w-full">
            <Building2 className="h-3.5 w-3.5 text-zinc-400 shrink-0" />
            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 shrink-0">
              Provider:
            </span>
            <span className="truncate font-semibold text-zinc-200">
              {doc.issuer || 'Official Provider'}
            </span>
          </span>
        </div>

        {/* Row 3: Document Title (100% full width, clean and prominent) */}
        <div className="mt-2.5">
          <h4
            className="flex min-h-[38px] items-center text-sm font-bold leading-snug text-white line-clamp-2"
            title={doc.title}
          >
            {doc.title}
          </h4>
        </div>

        {/* Row 4: Policy / Cert Number Card - Label on top row, full number on next row */}
        <div className="mt-3.5 rounded-xl border border-white/6 bg-black/40 px-3 py-2 font-mono">
          <span className="block text-[9px] font-semibold uppercase tracking-wider text-zinc-500">
            Cert / Policy #
          </span>
          <span
            className={`mt-1 block font-bold text-zinc-200 break-all select-all ${docNumFontClass}`}
            title={docNumStr}
          >
            {docNumStr}
          </span>
        </div>

        {/* Expiry & Countdown Information */}
        <div className="mt-3.5 flex flex-1 flex-col justify-start space-y-2 border-t border-white/6 pt-3 text-xs">
          {doc.issueDate && (
            <div className="flex items-center justify-between">
              <span className="text-zinc-500">Issued On:</span>
              <span className="font-mono text-zinc-300">
                {formatDisplayDate(doc.issueDate)}
              </span>
            </div>
          )}

          <div className="flex items-center justify-between">
            <span className="text-zinc-400 font-medium">Valid Until:</span>
            <span
              className={`font-mono font-bold ${
                isExpired ? 'text-rose-400' : 'text-white'
              }`}
            >
              {formatDisplayDate(doc.expiryDate)}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-zinc-500">Time Left:</span>
            <span
              className={`font-mono font-bold ${
                isExpired
                  ? 'text-rose-400 font-extrabold'
                  : isExpiringSoon
                    ? 'text-amber-300'
                    : 'text-lime-300'
              }`}
            >
              {isExpired ? 'EXPIRED' : meta.label}
            </span>
          </div>

          {Number(doc.amountPaid) > 0 && (
            <div className="flex items-center justify-between pt-0.5">
              <span className="text-zinc-500">Premium / Fee:</span>
              <span className="font-mono font-bold text-lime-400">
                ₹{Number(doc.amountPaid).toLocaleString('en-IN')}
              </span>
            </div>
          )}

          {Number(doc.maxOdometerKm) > 0 && (
            <div className="flex items-center justify-between pt-0.5">
              <span className="text-zinc-500">Odo Limit:</span>
              <span className="font-mono text-zinc-300">
                {currentOdo.toLocaleString('en-IN')} /{' '}
                <strong className="text-white">
                  {Number(doc.maxOdometerKm).toLocaleString('en-IN')} km
                </strong>
              </span>
            </div>
          )}

          {doc.notes && (
            <p className="mt-1 line-clamp-2 text-[11px] text-zinc-400">
              {doc.notes}
            </p>
          )}
        </div>
      </div>

      {/* Footer Actions */}
      <div className="mt-4 flex items-center justify-between border-t border-white/6 pt-3">
        <button
          type="button"
          onClick={() => onEdit(doc)}
          className="inline-flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold text-zinc-300 transition-colors hover:border-lime-400/40 hover:bg-lime-400/10 hover:text-lime-300"
        >
          <Pencil className="h-3.5 w-3.5" /> Edit Dates
        </button>

        {onDelete && (
          <button
            type="button"
            onClick={() => onDelete(doc.id)}
            className="rounded-xl p-1.5 text-zinc-500 transition-colors hover:bg-rose-500/10 hover:text-rose-400"
            title="Delete document"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  )
}
