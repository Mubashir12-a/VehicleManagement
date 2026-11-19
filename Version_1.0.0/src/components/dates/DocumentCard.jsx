import {
  AlertTriangle,
  Award,
  CheckCircle2,
  Clock,
  FileCheck,
  FileText,
  Pencil,
  ShieldAlert,
  Trash2,
} from 'lucide-react'
import { getExpiryMeta } from './datesUtils'

const DOC_ICONS = {
  insurance: ShieldAlert,
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

  return (
    <div className="flex h-full min-h-[300px] flex-col justify-between rounded-2xl border border-white/8 bg-[#12161c] p-6 transition-all duration-300 hover:border-lime-400/30 hover:shadow-[0_0_24px_rgba(163,230,53,0.06)]">
      {/* Top and Middle Content */}
      <div className="flex flex-1 flex-col">
        {/* Header - Fixed Height for 100% Horizontal Alignment */}
        <div className="flex min-h-[58px] items-start justify-between gap-3">
          <div className="flex min-w-0 items-start gap-3">
            <div
              className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ring-1 ${
                meta.color === 'rose'
                  ? 'bg-rose-500/15 text-rose-400 ring-rose-500/30'
                  : meta.color === 'amber'
                    ? 'bg-amber-400/15 text-amber-400 ring-amber-400/30'
                    : 'bg-lime-400/10 text-lime-400 ring-lime-400/20'
              }`}
            >
              <Icon className="h-5 w-5" />
            </div>
            <div className="min-w-0 flex-1">
              <h4 className="flex min-h-[40px] items-center text-sm font-bold leading-tight text-zinc-100">
                {doc.title}
              </h4>
              <p className="truncate text-xs text-zinc-400">
                {doc.issuer || 'Official Provider'}
              </p>
            </div>
          </div>

          <span
            className={`inline-flex shrink-0 items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ring-1 ring-inset ${meta.badgeClass}`}
          >
            {meta.status === 'Valid' ? (
              <CheckCircle2 className="h-3 w-3" />
            ) : meta.status === 'Expiring Soon' ? (
              <Clock className="h-3 w-3" />
            ) : (
              <AlertTriangle className="h-3 w-3" />
            )}
            {meta.status}
          </span>
        </div>

        {/* Policy / Cert Number - Standardized Height & Position */}
        <div className="mt-4 flex h-9 items-center justify-between rounded-xl border border-white/6 bg-black/40 px-3.5 font-mono text-xs">
          <span className="text-[10px] uppercase tracking-wider text-zinc-500">
            Cert / Policy #
          </span>
          <span className="font-bold text-zinc-200">
            {doc.docNumber || 'ABC-00000'}
          </span>
        </div>

        {/* Expiry & Countdown Information */}
        <div className="mt-4 flex flex-1 flex-col justify-start space-y-2.5 border-t border-white/6 pt-4">
          <div className="flex items-center justify-between text-xs">
            <span className="text-zinc-400">Valid Until:</span>
            <span className="font-mono font-bold text-white">
              {doc.expiryDate}
            </span>
          </div>

          <div className="flex items-center justify-between text-xs">
            <span className="text-zinc-500">Time Remaining:</span>
            <span
              className={`font-mono font-bold ${
                meta.color === 'rose'
                  ? 'text-rose-400'
                  : meta.color === 'amber'
                    ? 'text-amber-300'
                    : 'text-lime-300'
              }`}
            >
              {meta.label}
            </span>
          </div>

          {Number(doc.maxOdometerKm) > 0 && (
            <div className="flex items-center justify-between pt-1 text-xs">
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

      {/* Footer Actions - Anchored at the Exact Same Bottom Position */}
      <div className="mt-5 flex items-center justify-between border-t border-white/6 pt-4">
        <button
          type="button"
          onClick={() => onEdit(doc)}
          className="inline-flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-3.5 py-2 text-xs font-semibold text-zinc-300 transition-colors hover:border-lime-400/40 hover:bg-lime-400/10 hover:text-lime-300"
        >
          <Pencil className="h-3.5 w-3.5" /> Edit Dates
        </button>

        {onDelete && (
          <button
            type="button"
            onClick={() => onDelete(doc.id)}
            className="rounded-xl p-2 text-zinc-500 transition-colors hover:bg-rose-500/10 hover:text-rose-400"
            title="Delete document"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  )
}
