import { Calendar, History, IndianRupee, Plus, Trash2, X } from 'lucide-react'
import { useState } from 'react'
import { formatDisplayDate } from '../../utils/dateFormatter'

function ItemServiceHistoryDialogContent({
  onClose,
  item,
  logs = [],
  onDeleteLog,
  onOpenLogModal,
}) {
  const itemLogs = (logs || []).filter((l) => l.itemKey === item.itemKey)
  const totalSpent = itemLogs.reduce(
    (acc, curr) => acc + (Number(curr.cost) || 0),
    0,
  )

  const [deletingId, setDeletingId] = useState(null)

  const handleDelete = async (logId) => {
    if (
      !window.confirm(
        'Delete this service record? The component odometer will recalculate.',
      )
    ) {
      return
    }
    setDeletingId(logId)
    try {
      await onDeleteLog(logId, item.itemKey)
    } finally {
      setDeletingId(null)
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
      <div className="relative w-full max-w-xl overflow-hidden rounded-3xl border border-white/10 bg-[#0d1014] p-6 shadow-2xl sm:p-7">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-white/8 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-lime-400/15 text-lime-400 ring-1 ring-lime-400/30">
              <History className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-lg font-black tracking-tight text-white">
                {item.label} Service History
              </h3>
              <p className="text-xs text-zinc-400">
                {itemLogs.length} past service/replacement log
                {itemLogs.length === 1 ? '' : 's'} recorded
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

        {/* Stats Summary Bar */}
        <div className="mt-4 flex items-center justify-between rounded-2xl border border-white/8 bg-[#12161c] px-4 py-3 text-xs">
          <div>
            <span className="text-zinc-500">Total Spent on {item.label}:</span>{' '}
            <strong className="font-mono font-bold text-white">
              ₹{totalSpent.toLocaleString('en-IN')}
            </strong>
          </div>
          <div>
            <span className="text-zinc-500">Service Interval:</span>{' '}
            <strong className="font-mono font-bold text-lime-300">
              Every {Number(item.intervalKm).toLocaleString('en-IN')} km
            </strong>
          </div>
        </div>

        {/* History List */}
        <div className="mt-4 max-h-[380px] space-y-2.5 overflow-y-auto pr-1">
          {itemLogs.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-white/10 p-8 text-center">
              <History className="h-8 w-8 text-zinc-600" />
              <p className="mt-2 text-sm font-bold text-zinc-300">
                No Service Logs Yet
              </p>
              <p className="mt-1 text-xs text-zinc-500">
                This component is currently tracking from delivery/initial 0 km.
              </p>
              <button
                type="button"
                onClick={() => {
                  onClose()
                  onOpenLogModal(item)
                }}
                className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-lime-400 px-4 py-2 text-xs font-bold text-zinc-950 transition-colors hover:bg-lime-300"
              >
                <Plus className="h-3.5 w-3.5" /> Log First Service
              </button>
            </div>
          ) : (
            itemLogs.map((log) => (
              <div
                key={log.id}
                className="flex flex-col justify-between gap-3 rounded-2xl border border-white/8 bg-[#12161c] p-4 transition-all hover:border-lime-400/20 sm:flex-row sm:items-center"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm font-bold text-lime-300">
                      {log.odometerKm.toLocaleString('en-IN')} km
                    </span>
                    <span className="rounded-full bg-white/5 px-2 py-0.5 text-[10px] font-semibold text-zinc-400">
                      Odometer
                    </span>
                    {Number(log.cost) > 0 && (
                      <span className="inline-flex items-center gap-0.5 font-mono text-xs font-bold text-zinc-200">
                        <IndianRupee className="h-3 w-3 text-zinc-400" />
                        {Number(log.cost).toLocaleString('en-IN')}
                      </span>
                    )}
                  </div>

                  {log.notes && (
                    <p className="text-xs text-zinc-300">{log.notes}</p>
                  )}

                  <div className="flex items-center gap-2 text-[11px] text-zinc-500">
                    <span className="inline-flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {formatDisplayDate(log.serviceDate)}
                    </span>
                  </div>
                </div>

                <div className="flex shrink-0 items-center gap-2">
                  <button
                    type="button"
                    disabled={deletingId === log.id}
                    onClick={() => handleDelete(log.id)}
                    title="Delete this record"
                    className="rounded-xl border border-white/10 p-2 text-zinc-400 transition-colors hover:border-rose-500/30 hover:bg-rose-500/10 hover:text-rose-400 disabled:opacity-50"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="mt-5 flex items-center justify-between border-t border-white/8 pt-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-white/10 px-4 py-2 text-xs font-bold text-zinc-300 hover:bg-white/5"
          >
            Close
          </button>

          <button
            type="button"
            onClick={() => {
              onClose()
              onOpenLogModal(item)
            }}
            className="inline-flex items-center gap-1.5 rounded-xl bg-lime-400 px-4 py-2 text-xs font-bold text-zinc-950 transition-colors hover:bg-lime-300"
          >
            <Plus className="h-3.5 w-3.5" /> Log Another Service
          </button>
        </div>
      </div>
    </div>
  )
}

export default function ItemServiceHistoryModal({
  isOpen,
  onClose,
  item,
  logs = [],
  onDeleteLog,
  onOpenLogModal,
}) {
  if (!isOpen || !item) return null

  return (
    <ItemServiceHistoryDialogContent
      onClose={onClose}
      item={item}
      logs={logs}
      onDeleteLog={onDeleteLog}
      onOpenLogModal={onOpenLogModal}
    />
  )
}
