import {
  CalendarClock,
  CheckCircle2,
  Database,
  FileCheck,
  FileText,
  History,
  IndianRupee,
  Plus,
  RefreshCw,
  Trash2,
} from 'lucide-react'
import { useState } from 'react'
import PageHeader from '../components/common/PageHeader'
import AddReminderModal from '../components/dates/AddReminderModal'
import CompleteServiceModal from '../components/dates/CompleteServiceModal'
import { getExpiryMeta, getReminderStatus } from '../components/dates/datesUtils'
import DocumentCard from '../components/dates/DocumentCard'
import EditDocumentModal from '../components/dates/EditDocumentModal'
import ServiceReminderCard from '../components/dates/ServiceReminderCard'
import { useFleetData } from '../hooks/useFleetData'

export default function ImportantDatesPage() {
  const {
    primaryVehicle,
    vehicleDocuments = [],
    serviceReminders = [],
    source,
    loading,
    refresh,
    upsertVehicleDocument,
    deleteVehicleDocument,
    addServiceReminder,
    completeServiceReminder,
    deleteServiceReminder,
  } = useFleetData()

  // Tab State: 'documents' | 'reminders' | 'history'
  const [activeTab, setActiveTab] = useState('documents')

  // Modals state
  const [docModalState, setDocModalState] = useState({ isOpen: false, doc: null })
  const [isAddReminderOpen, setIsAddReminderOpen] = useState(false)
  const [completeReminderItem, setCompleteReminderItem] = useState(null)

  const currentOdo = primaryVehicle?.mileage || 0

  // Derived metrics
  const activeReminders = serviceReminders.filter((r) => r.status !== 'Completed')
  const completedReminders = serviceReminders
    .filter((r) => r.status === 'Completed')
    .sort((a, b) => {
      const dateA = a.completedDate ? new Date(a.completedDate).getTime() : 0
      const dateB = b.completedDate ? new Date(b.completedDate).getTime() : 0
      return dateB - dateA
    })

  const totalServiceSpend = completedReminders.reduce(
    (sum, r) => sum + (Number(r.amountPaid) || 0),
    0,
  )

  const expiredDocsCount = vehicleDocuments.filter(
    (d) => getExpiryMeta(d.expiryDate).status === 'Expired',
  ).length

  const expiringSoonDocsCount = vehicleDocuments.filter(
    (d) => getExpiryMeta(d.expiryDate).status === 'Expiring Soon',
  ).length

  const dueRemindersCount = activeReminders.filter(
    (r) => {
      const status = getReminderStatus(r, currentOdo).label
      return status === 'Due Now' || status === 'Overdue'
    },
  ).length

  // Handlers
  const handleOpenAddDoc = () => {
    setDocModalState({
      isOpen: true,
      doc: {
        id: `NEW-${Date.now()}`,
        docType: 'other',
        title: '',
        docNumber: '',
        issuer: '',
        issueDate: '',
        expiryDate: '',
        maxOdometerKm: null,
        notes: '',
      },
    })
  }

  const handleOpenEditDoc = (doc) => {
    setDocModalState({ isOpen: true, doc })
  }

  const handleCloseDocModal = () => {
    setDocModalState({ isOpen: false, doc: null })
  }

  const handleSaveDoc = async (docData) => {
    await upsertVehicleDocument(docData)
  }

  const handleDeleteDoc = async (docId) => {
    if (window.confirm('Are you sure you want to delete this document?')) {
      await deleteVehicleDocument(docId)
    }
  }

  const handleSaveReminder = async (reminderData) => {
    await addServiceReminder(reminderData)
  }

  const handleOpenCompleteReminder = (reminder) => {
    setCompleteReminderItem(reminder)
  }

  const handleConfirmCompleteReminder = async (reminderId, completionInput) => {
    await completeServiceReminder(reminderId, completionInput)
  }

  const handleDeleteReminder = async (reminderId) => {
    if (window.confirm('Are you sure you want to delete this service reminder?')) {
      await deleteServiceReminder(reminderId)
    }
  }

  return (
    <div className="space-y-6">
      {/* Top Page Header */}
      <PageHeader
        title="Important Dates & Service Reminders"
        description="Track vehicle documentation expiration (Insurance, RC, PUC, Warranty) and schedule custom periodic service interval reminders."
        actions={
          <div className="flex flex-wrap items-center gap-2.5">
            <span
              className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${
                source === 'supabase'
                  ? 'border border-lime-400/30 bg-lime-400/10 text-lime-300 shadow-[0_0_12px_rgba(163,230,53,0.18)]'
                  : 'border border-amber-400/30 bg-amber-400/10 text-amber-300'
              }`}
            >
              <Database className="h-3.5 w-3.5" />
              {source === 'supabase' ? 'Supabase Connected' : 'Local Storage Mode'}
            </span>

            <button
              type="button"
              onClick={refresh}
              disabled={loading}
              className="inline-flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold text-zinc-300 transition-colors hover:bg-white/10 hover:text-white disabled:opacity-50"
              title="Refresh records"
            >
              <RefreshCw
                className={`h-3.5 w-3.5 ${loading ? 'animate-spin text-lime-400' : ''}`}
              />
              <span className="hidden sm:inline">Refresh</span>
            </button>
          </div>
        }
      />

      {/* Overview Stat Cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:gap-4">
        {/* Documents Metric */}
        <div className="rounded-2xl border border-white/8 bg-[#12161c] p-4">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">
              Documents
            </span>
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-lime-400/10 text-lime-400">
              <FileCheck className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="font-mono text-2xl font-black text-white">
              {vehicleDocuments.length}
            </span>
            <span className="text-xs text-zinc-400">tracked</span>
          </div>
          <div className="mt-2 flex items-center gap-2 text-[11px]">
            {expiredDocsCount > 0 ? (
              <span className="font-bold text-rose-400">
                {expiredDocsCount} expired
              </span>
            ) : expiringSoonDocsCount > 0 ? (
              <span className="font-bold text-amber-400">
                {expiringSoonDocsCount} expiring soon
              </span>
            ) : (
              <span className="font-semibold text-lime-400">All valid</span>
            )}
          </div>
        </div>

        {/* Active Reminders Metric */}
        <div className="rounded-2xl border border-white/8 bg-[#12161c] p-4">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">
              Active Reminders
            </span>
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-400/10 text-amber-400">
              <CalendarClock className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="font-mono text-2xl font-black text-white">
              {activeReminders.length}
            </span>
            <span className="text-xs text-zinc-400">scheduled</span>
          </div>
          <div className="mt-2 text-[11px]">
            {dueRemindersCount > 0 ? (
              <span className="font-bold text-amber-400">
                {dueRemindersCount} due / overdue
              </span>
            ) : (
              <span className="text-zinc-500">None currently due</span>
            )}
          </div>
        </div>

        {/* Completed Services Metric */}
        <div className="rounded-2xl border border-white/8 bg-[#12161c] p-4">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">
              Services Done
            </span>
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-lime-400/10 text-lime-400">
              <CheckCircle2 className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="font-mono text-2xl font-black text-white">
              {completedReminders.length}
            </span>
            <span className="text-xs text-zinc-400">logged</span>
          </div>
          <div className="mt-2 text-[11px] text-zinc-400">
            Recorded in service log
          </div>
        </div>

        {/* Total Service Spend Metric */}
        <div className="rounded-2xl border border-white/8 bg-[#12161c] p-4">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">
              Total Service Spend
            </span>
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-lime-400/10 text-lime-400">
              <IndianRupee className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="font-mono text-2xl font-black text-lime-400">
              ₹{totalServiceSpend.toLocaleString('en-IN')}
            </span>
          </div>
          <div className="mt-2 text-[11px] text-zinc-400">
            Across {completedReminders.length} service records
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center gap-2 border-b border-white/8 pb-3">
        <button
          type="button"
          onClick={() => setActiveTab('documents')}
          className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all ${
            activeTab === 'documents'
              ? 'bg-lime-400 text-zinc-950 shadow-[0_0_16px_rgba(163,230,53,0.25)]'
              : 'bg-white/5 text-zinc-400 hover:bg-white/10 hover:text-white'
          }`}
        >
          <FileText className="h-4 w-4" />
          Document Expiry
          <span
            className={`rounded-full px-1.5 py-0.2 text-[10px] font-extrabold ${
              activeTab === 'documents'
                ? 'bg-black/20 text-zinc-950'
                : 'bg-white/10 text-zinc-300'
            }`}
          >
            {vehicleDocuments.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('reminders')}
          className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all ${
            activeTab === 'reminders'
              ? 'bg-lime-400 text-zinc-950 shadow-[0_0_16px_rgba(163,230,53,0.25)]'
              : 'bg-white/5 text-zinc-400 hover:bg-white/10 hover:text-white'
          }`}
        >
          <CalendarClock className="h-4 w-4" />
          Service Reminders
          {activeReminders.length > 0 && (
            <span
              className={`rounded-full px-1.5 py-0.2 text-[10px] font-extrabold ${
                activeTab === 'reminders'
                  ? 'bg-black/20 text-zinc-950'
                  : 'bg-lime-400/20 text-lime-300'
              }`}
            >
              {activeReminders.length}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('history')}
          className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all ${
            activeTab === 'history'
              ? 'bg-lime-400 text-zinc-950 shadow-[0_0_16px_rgba(163,230,53,0.25)]'
              : 'bg-white/5 text-zinc-400 hover:bg-white/10 hover:text-white'
          }`}
        >
          <History className="h-4 w-4" />
          Service History & Bills
          {completedReminders.length > 0 && (
            <span
              className={`rounded-full px-1.5 py-0.2 text-[10px] font-extrabold ${
                activeTab === 'history'
                  ? 'bg-black/20 text-zinc-950'
                  : 'bg-white/10 text-zinc-300'
              }`}
            >
              {completedReminders.length}
            </span>
          )}
        </button>
      </div>

      {/* Tab 1: Documents Section */}
      {activeTab === 'documents' && (
        <div className="space-y-4">
          <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
            <div>
              <h3 className="text-base font-bold text-white">
                Vehicle Documentation Expiry
              </h3>
              <p className="text-xs text-zinc-400">
                Live validity countdown for Insurance, RC, PUC, Warranty, and permits
              </p>
            </div>
            <button
              type="button"
              onClick={handleOpenAddDoc}
              className="inline-flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-bold text-zinc-200 hover:bg-white/10"
            >
              <Plus className="h-3.5 w-3.5 text-lime-400" />
              Add Another Document
            </button>
          </div>

          {vehicleDocuments.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-white/10 bg-[#12161c] p-8 text-center">
              <FileText className="mx-auto h-10 w-10 text-zinc-600" />
              <p className="mt-3 text-sm font-semibold text-zinc-300">
                No documents added yet
              </p>
              <p className="mt-1 text-xs text-zinc-500">
                Add your Insurance, RC, PUC, or Warranty details to get expiry countdowns.
              </p>
              <button
                type="button"
                onClick={handleOpenAddDoc}
                className="mt-4 inline-flex items-center gap-2 rounded-xl bg-lime-400 px-4 py-2 text-xs font-bold text-zinc-950"
              >
                <Plus className="h-4 w-4" /> Add Document
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 items-stretch">
              {vehicleDocuments.map((doc) => (
                <DocumentCard
                  key={doc.id}
                  doc={doc}
                  currentOdo={currentOdo}
                  onEdit={handleOpenEditDoc}
                  onDelete={handleDeleteDoc}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Service Reminders Section */}
      {activeTab === 'reminders' && (
        <div className="space-y-4">
          <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
            <div>
              <h3 className="text-base font-bold text-white">
                Scheduled Service Reminders
              </h3>
              <p className="text-xs text-zinc-400">
                Periodic maintenance windows (e.g. Service 1, Service 2). Enter your service milestones.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setIsAddReminderOpen(true)}
              className="inline-flex items-center gap-1.5 rounded-xl bg-lime-400 px-3.5 py-1.5 text-xs font-bold text-zinc-950 shadow-[0_0_12px_rgba(163,230,53,0.25)] hover:bg-lime-300"
            >
              <Plus className="h-3.5 w-3.5" />
              Add Service Reminder
            </button>
          </div>

          {activeReminders.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-white/10 bg-[#12161c] p-8 text-center">
              <CalendarClock className="mx-auto h-10 w-10 text-zinc-600" />
              <p className="mt-3 text-sm font-semibold text-zinc-300">
                No active service reminders
              </p>
              <p className="mt-1 text-xs text-zinc-500 max-w-md mx-auto">
                No reminders are set by default. Click below to add reminders like Service 1, Service 2, or custom service milestone.
              </p>
              <button
                type="button"
                onClick={() => setIsAddReminderOpen(true)}
                className="mt-4 inline-flex items-center gap-2 rounded-xl bg-lime-400 px-4 py-2 text-xs font-bold text-zinc-950 shadow-[0_0_16px_rgba(163,230,53,0.25)]"
              >
                <Plus className="h-4 w-4" /> Add Service Reminder
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {activeReminders.map((reminder) => (
                <ServiceReminderCard
                  key={reminder.id}
                  reminder={reminder}
                  currentOdo={currentOdo}
                  onOpenCompleteModal={handleOpenCompleteReminder}
                  onDelete={handleDeleteReminder}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Completed Service History Section */}
      {activeTab === 'history' && (
        <div className="space-y-4">
          <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
            <div>
              <h3 className="text-base font-bold text-white">
                Completed Service History & Invoices
              </h3>
              <p className="text-xs text-zinc-400">
                Historical records of periodic services marked as done, with amounts paid, odometer, and invoices
              </p>
            </div>
            {completedReminders.length > 0 && (
              <span className="font-mono text-xs font-bold text-lime-400">
                Total Invoiced: ₹{totalServiceSpend.toLocaleString('en-IN')}
              </span>
            )}
          </div>

          {completedReminders.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-white/10 bg-[#12161c] p-8 text-center">
              <History className="mx-auto h-10 w-10 text-zinc-600" />
              <p className="mt-3 text-sm font-semibold text-zinc-300">
                No completed service history yet
              </p>
              <p className="mt-1 text-xs text-zinc-500">
                When you mark an active service reminder as done, its date, odometer, and amount paid will be logged here.
              </p>
            </div>
          ) : (
            <div className="overflow-hidden rounded-2xl border border-white/8 bg-[#12161c]">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="border-b border-white/8 bg-white/5 text-[11px] font-bold uppercase tracking-wider text-zinc-400">
                    <tr>
                      <th className="px-4 py-3">Service Name</th>
                      <th className="px-4 py-3">Type</th>
                      <th className="px-4 py-3">Completed Date</th>
                      <th className="px-4 py-3">Completed Odo</th>
                      <th className="px-4 py-3">Amount Paid</th>
                      <th className="px-4 py-3">Workshop / Invoice</th>
                      <th className="px-4 py-3">Notes</th>
                      <th className="px-4 py-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/6 text-zinc-300">
                    {completedReminders.map((service) => (
                      <tr
                        key={service.id}
                        className="transition-colors hover:bg-white/[0.02]"
                      >
                        <td className="px-4 py-3 font-semibold text-white">
                          {service.title}
                        </td>
                        <td className="px-4 py-3">
                          <span className="rounded-full bg-lime-400/10 px-2 py-0.5 text-[10px] font-bold text-lime-300">
                            {service.serviceType || 'Periodic'}
                          </span>
                        </td>
                        <td className="px-4 py-3 font-mono text-zinc-300">
                          {service.completedDate || '—'}
                        </td>
                        <td className="px-4 py-3 font-mono font-bold text-white">
                          {service.completedOdometerKm
                            ? `${Number(service.completedOdometerKm).toLocaleString('en-IN')} km`
                            : '—'}
                        </td>
                        <td className="px-4 py-3">
                          <span className="font-mono font-bold text-lime-400">
                            ₹{Number(service.amountPaid || 0).toLocaleString('en-IN')}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-zinc-400">
                          <div>{service.serviceCenter || '—'}</div>
                          {service.invoiceNo && (
                            <span className="font-mono text-[10px] text-zinc-500">
                              #{service.invoiceNo}
                            </span>
                          )}
                        </td>
                        <td className="max-w-xs truncate px-4 py-3 text-zinc-400">
                          {service.notes || '—'}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <button
                            type="button"
                            onClick={() => handleDeleteReminder(service.id)}
                            className="rounded-lg p-1.5 text-zinc-500 hover:bg-rose-500/10 hover:text-rose-400"
                            title="Delete record"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Modals */}
      <EditDocumentModal
        isOpen={docModalState.isOpen}
        doc={docModalState.doc}
        onClose={handleCloseDocModal}
        onSubmit={handleSaveDoc}
      />

      <AddReminderModal
        isOpen={isAddReminderOpen}
        existingReminders={serviceReminders}
        onClose={() => setIsAddReminderOpen(false)}
        onSubmit={handleSaveReminder}
      />

      <CompleteServiceModal
        isOpen={Boolean(completeReminderItem)}
        reminder={completeReminderItem}
        currentMileage={currentOdo}
        onClose={() => setCompleteReminderItem(null)}
        onSubmit={handleConfirmCompleteReminder}
      />
    </div>
  )
}
