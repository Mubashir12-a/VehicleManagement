import {
  createContext,
  createElement,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react'
import { useAuth } from '../context/AuthContextCore'
import {
  defaultComponentServiceLogs,
  defaultFuelRefills,
  defaultMaintenanceItems,
  defaultServiceReminders,
  defaultVehicle,
  defaultVehicleDocuments,
  defaultVehicleModifications,
  defaultVehicleRepairs,
  fleetStatusData as mockStatusData,
  fleetSummary as mockSummary,
  maintenanceSchedule as mockMaintenance,
  monthlyFleetTrends as mockMonthlyTrends,
  vehicleCategoryData as mockCategoryData,
  vehiclesList as mockVehicles,
} from '../data/mockFleetData'
import {
  completeServiceReminderRecord,
  computeFleetAnalytics,
  computeMonthlyFuelSummary,
  createComponentServiceLogRecord,
  createFuelRefillRecord,
  createServiceReminderRecord,
  createVehicleModificationRecord,
  createVehicleRecord,
  createVehicleRepairRecord,
  deleteComponentServiceLogRecord,
  deleteFuelRefillRecord,
  deleteServiceReminderRecord,
  deleteVehicleDocumentRecord,
  deleteVehicleModificationRecord,
  deleteVehicleRecord,
  deleteVehicleRepairRecord,
  fetchFleetData,
  updateFuelRefillRecord,
  updateMaintenanceHealthItem,
  updatePrimaryVehicleRecord,
  updateServiceReminderRecord,
  updateVehicleModificationRecord,
  upsertVehicleDocumentRecord,
} from '../services/fleetService'
import { sortServiceReminders } from '../components/dates/datesUtils'

const defaultFallback = {
  loading: false,
  source: 'mock',
  needsSchema: false,
  needsSchemaUpgrade: false,
  error: null,
  vehicles: mockVehicles,
  maintenance: mockMaintenance,
  monthlyTrends: mockMonthlyTrends,
  fuelRefills: defaultFuelRefills,
  maintenanceItems: defaultMaintenanceItems,
  componentServiceLogs: defaultComponentServiceLogs,
  vehicleRepairs: defaultVehicleRepairs,
  vehicleDocuments: defaultVehicleDocuments,
  serviceReminders: defaultServiceReminders,
  vehicleModifications: defaultVehicleModifications,
  summary: mockSummary,
  monthlyFuelSummary: computeMonthlyFuelSummary(defaultFuelRefills),
  statusData: mockStatusData,
  categoryData: mockCategoryData,
  primaryVehicle: defaultVehicle,
  activeVehicleCode: defaultVehicle.id,
  latestRefill: defaultFuelRefills[0] || null,
  refresh: () => {},
  switchActiveVehicle: async () => {},
  addVehicle: async () => {},
  deleteVehicle: async () => {},
  updatePrimaryVehicle: async () => {},
  logFuelRefill: async () => {},
  addFuelRefill: async () => {},
  editFuelRefill: async () => {},
  deleteFuelRefill: async () => {},
  updateMaintenanceItem: async () => {},
  addComponentServiceLog: async () => {},
  deleteComponentServiceLog: async () => {},
  addVehicleRepair: async () => {},
  deleteVehicleRepair: async () => {},
  upsertVehicleDocument: async () => {},
  deleteVehicleDocument: async () => {},
  addServiceReminder: async () => {},
  completeServiceReminder: async () => {},
  updateServiceReminder: async () => {},
  editServiceReminder: async () => {},
  deleteServiceReminder: async () => {},
  addVehicleModification: async () => {},
  updateVehicleModification: async () => {},
  deleteVehicleModification: async () => {},
}

const FleetContext = createContext(defaultFallback)

function recalculateStateAnalytics(prevState, overrideProps = {}) {
  const merged = { ...prevState, ...overrideProps }
  const analytics = computeFleetAnalytics(
    merged.vehicles,
    merged.monthlyTrends,
    merged.fuelRefills,
    merged.maintenance,
    merged.componentServiceLogs,
    merged.vehicleRepairs,
    merged.vehicleDocuments,
    merged.serviceReminders,
    merged.vehicleModifications,
  )
  return {
    ...merged,
    ...analytics,
  }
}

function useProvideFleetData() {
  const [state, setState] = useState(() => ({
    loading: true,
    source: 'mock',
    needsSchema: false,
    needsSchemaUpgrade: false,
    error: null,
    vehicles: mockVehicles,
    maintenance: mockMaintenance,
    monthlyTrends: mockMonthlyTrends,
    fuelRefills: defaultFuelRefills,
    maintenanceItems: defaultMaintenanceItems,
    componentServiceLogs: defaultComponentServiceLogs,
    vehicleRepairs: defaultVehicleRepairs,
    vehicleDocuments: defaultVehicleDocuments,
    serviceReminders: defaultServiceReminders,
    vehicleModifications: defaultVehicleModifications,
    summary: mockSummary,
    monthlyFuelSummary: computeMonthlyFuelSummary(defaultFuelRefills),
    statusData: mockStatusData,
    categoryData: mockCategoryData,
  }))

  const [activeVehicleCode, setActiveVehicleCode] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('mkd_active_vehicle_code') || null
    }
    return null
  })

  const { user } = useAuth()

  const refresh = useCallback(
    async (preferredCode = null) => {
      setState((prev) => ({ ...prev, loading: true }))
      const targetCode = preferredCode || activeVehicleCode
      const result = await fetchFleetData(user, targetCode)
      setState({
        loading: false,
        ...result,
      })
      if (result.primaryVehicle?.id) {
        setActiveVehicleCode(result.primaryVehicle.id)
      }
    },
    [user, activeVehicleCode],
  )

  useEffect(() => {
    let active = true

    fetchFleetData(user, activeVehicleCode).then((result) => {
      if (!active) return
      setState({
        loading: false,
        ...result,
      })
      if (result.primaryVehicle?.id) {
        setActiveVehicleCode(result.primaryVehicle.id)
      }
    })

    return () => {
      active = false
    }
  }, [user, activeVehicleCode])

  const primaryVehicle =
    (state.vehicles || []).find((v) => v.id === activeVehicleCode) ||
    state.vehicles?.[0] ||
    defaultVehicle
  const latestRefill = state.fuelRefills[0] || null

  const switchActiveVehicle = useCallback(
    async (targetVehicleCode) => {
      if (!targetVehicleCode) return
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem('mkd_active_vehicle_code', targetVehicleCode)
        } catch {
          // ignore
        }
      }
      setActiveVehicleCode(targetVehicleCode)
      setState((prev) => ({ ...prev, loading: true }))
      const result = await fetchFleetData(user, targetVehicleCode)
      setState({
        loading: false,
        ...result,
      })
    },
    [user],
  )

  const addVehicle = useCallback(
    async (vehicleInput) => {
      setState((prev) => ({ ...prev, loading: true }))
      const result = await createVehicleRecord(user, vehicleInput)
      if (typeof window !== 'undefined' && result.vehicle?.id) {
        try {
          localStorage.setItem('mkd_active_vehicle_code', result.vehicle.id)
        } catch {
          // ignore
        }
      }
      setActiveVehicleCode(result.vehicle.id)
      const refreshed = await fetchFleetData(user, result.vehicle.id)
      setState({
        loading: false,
        ...refreshed,
      })
      return result
    },
    [user],
  )

  const deleteVehicle = useCallback(
    async (targetVehicleCode) => {
      const targetVehicle = (state.vehicles || []).find(
        (v) => v.id === targetVehicleCode,
      )
      if (!targetVehicle) return

      await deleteVehicleRecord(targetVehicle)
      const remaining = (state.vehicles || []).filter(
        (v) => v.id !== targetVehicleCode,
      )
      const nextActiveCode = remaining[0]?.id || null

      if (typeof window !== 'undefined' && nextActiveCode) {
        try {
          localStorage.setItem('mkd_active_vehicle_code', nextActiveCode)
        } catch {
          // ignore
        }
      }
      setActiveVehicleCode(nextActiveCode)

      const refreshed = await fetchFleetData(user, nextActiveCode)
      setState({
        loading: false,
        ...refreshed,
      })
    },
    [state.vehicles, user],
  )

  const updatePrimaryVehicle = useCallback(
    async (updates) => {
      const result = await updatePrimaryVehicleRecord(primaryVehicle, updates)
      setState((prev) =>
        recalculateStateAnalytics(prev, {
          vehicles: prev.vehicles.map((v) =>
            v.id === result.vehicle.id ? result.vehicle : v,
          ),
        }),
      )
      return result
    },
    [primaryVehicle],
  )

  const addFuelRefill = useCallback(
    async (refillInput) => {
      const result = await createFuelRefillRecord(primaryVehicle, refillInput)
      setState((prev) => {
        const nextRefills = [result.refill, ...prev.fuelRefills].sort(
          (a, b) =>
            new Date(b.refillDate) - new Date(a.refillDate) ||
            b.odometerKm - a.odometerKm,
        )
        const syncedVehicle = {
          ...result.vehicle,
          mileage: nextRefills[0]?.odometerKm ?? result.vehicle.mileage,
          fuelLevel: nextRefills[0]?.fuelLevelAfter ?? result.vehicle.fuelLevel,
        }
        return recalculateStateAnalytics(prev, {
          vehicles: prev.vehicles.map((v) =>
            v.id === syncedVehicle.id ? syncedVehicle : v,
          ),
          fuelRefills: nextRefills,
        })
      })
      return result
    },
    [primaryVehicle],
  )

  const editFuelRefill = useCallback(
    async (refillId, refillInput) => {
      const result = await updateFuelRefillRecord(
        primaryVehicle,
        refillId,
        refillInput,
        state.fuelRefills,
      )
      setState((prev) => {
        const nextRefills = prev.fuelRefills
          .map((r) => (r.id === refillId ? result.refill : r))
          .sort(
            (a, b) =>
              new Date(b.refillDate) - new Date(a.refillDate) ||
              b.odometerKm - a.odometerKm,
          )
        const syncedVehicle = {
          ...result.vehicle,
          mileage: nextRefills[0]?.odometerKm ?? result.vehicle.mileage,
          fuelLevel: nextRefills[0]?.fuelLevelAfter ?? result.vehicle.fuelLevel,
        }
        return recalculateStateAnalytics(prev, {
          vehicles: prev.vehicles.map((v) =>
            v.id === syncedVehicle.id ? syncedVehicle : v,
          ),
          fuelRefills: nextRefills,
        })
      })
      return result
    },
    [primaryVehicle, state.fuelRefills],
  )

  const deleteFuelRefill = useCallback(
    async (refillId) => {
      const result = await deleteFuelRefillRecord(
        primaryVehicle,
        refillId,
        state.fuelRefills,
      )
      setState((prev) => {
        const nextRefills = prev.fuelRefills.filter((r) => r.id !== refillId)
        const syncedVehicle = {
          ...result.vehicle,
          mileage: nextRefills[0]?.odometerKm ?? 0,
          fuelLevel: nextRefills[0]?.fuelLevelAfter ?? 75,
        }
        return recalculateStateAnalytics(prev, {
          vehicles: prev.vehicles.map((v) =>
            v.id === syncedVehicle.id ? syncedVehicle : v,
          ),
          fuelRefills: nextRefills,
        })
      })
      return result
    },
    [primaryVehicle, state.fuelRefills],
  )

  const updateMaintenanceItem = useCallback(async (item, updates) => {
    const result = await updateMaintenanceHealthItem(item, updates)
    setState((prev) => ({
      ...prev,
      maintenanceItems: prev.maintenanceItems.map((existing) =>
        existing.itemKey === item.itemKey ? result.item : existing,
      ),
    }))
    return result
  }, [])

  const addComponentServiceLog = useCallback(
    async (item, logInput) => {
      const result = await createComponentServiceLogRecord(
        primaryVehicle,
        item,
        logInput,
      )
      setState((prev) => {
        const nextLogs = [result.log, ...(prev.componentServiceLogs || [])]
        const nextItems = prev.maintenanceItems.map((existing) =>
          existing.itemKey === item.itemKey ? result.item : existing,
        )
        return recalculateStateAnalytics(prev, {
          componentServiceLogs: nextLogs,
          maintenanceItems: nextItems,
        })
      })
      return result
    },
    [primaryVehicle],
  )

  const deleteComponentServiceLog = useCallback(
    async (logId, itemKey) => {
      const allItemLogs = state.componentServiceLogs || []
      const result = await deleteComponentServiceLogRecord(
        primaryVehicle,
        logId,
        itemKey,
        allItemLogs,
      )
      setState((prev) => {
        const nextLogs = (prev.componentServiceLogs || []).filter(
          (l) => l.id !== logId,
        )
        const nextItems = prev.maintenanceItems.map((existing) =>
          existing.itemKey === itemKey
            ? { ...existing, lastServiceOdo: result.newLastOdo }
            : existing,
        )
        return recalculateStateAnalytics(prev, {
          componentServiceLogs: nextLogs,
          maintenanceItems: nextItems,
        })
      })
      return result
    },
    [primaryVehicle, state.componentServiceLogs],
  )

  const addVehicleRepair = useCallback(
    async (repairInput) => {
      const result = await createVehicleRepairRecord(
        primaryVehicle,
        repairInput,
      )
      setState((prev) => {
        const nextRepairs = [result.repair, ...(prev.vehicleRepairs || [])]
        return recalculateStateAnalytics(prev, {
          vehicleRepairs: nextRepairs,
        })
      })
      return result
    },
    [primaryVehicle],
  )

  const deleteVehicleRepair = useCallback(
    async (repairId) => {
      const result = await deleteVehicleRepairRecord(primaryVehicle, repairId)
      setState((prev) =>
        recalculateStateAnalytics(prev, {
          vehicleRepairs: (prev.vehicleRepairs || []).filter(
            (r) => r.id !== repairId,
          ),
        }),
      )
      return result
    },
    [primaryVehicle],
  )

  const upsertVehicleDocument = useCallback(
    async (docInput) => {
      const result = await upsertVehicleDocumentRecord(primaryVehicle, docInput)
      setState((prev) => {
        const existing = prev.vehicleDocuments || []
        const exists = existing.some((d) => d.id === result.doc.id)
        const nextDocs = exists
          ? existing.map((d) => (d.id === result.doc.id ? result.doc : d))
          : [...existing, result.doc]
        return recalculateStateAnalytics(prev, {
          vehicleDocuments: nextDocs,
        })
      })
      return result
    },
    [primaryVehicle],
  )

  const deleteVehicleDocument = useCallback(
    async (docId) => {
      const result = await deleteVehicleDocumentRecord(primaryVehicle, docId)
      setState((prev) =>
        recalculateStateAnalytics(prev, {
          vehicleDocuments: (prev.vehicleDocuments || []).filter(
            (d) => d.id !== docId,
          ),
        }),
      )
      return result
    },
    [primaryVehicle],
  )

  const addServiceReminder = useCallback(
    async (reminderInput) => {
      const result = await createServiceReminderRecord(
        primaryVehicle,
        reminderInput,
      )
      setState((prev) =>
        recalculateStateAnalytics(prev, {
          serviceReminders: [...(prev.serviceReminders || []), result.reminder].sort(sortServiceReminders),
        }),
      )
      return result
    },
    [primaryVehicle],
  )

  const completeServiceReminder = useCallback(
    async (reminderId, completionInput) => {
      const result = await completeServiceReminderRecord(
        primaryVehicle,
        reminderId,
        completionInput,
      )
      setState((prev) =>
        recalculateStateAnalytics(prev, {
          serviceReminders: (prev.serviceReminders || []).map((r) =>
            r.id === reminderId
              ? result.reminder || { ...r, ...result.updates }
              : r,
          ).sort(sortServiceReminders),
        }),
      )
      return result
    },
    [primaryVehicle],
  )

  const updateServiceReminder = useCallback(
    async (reminderId, reminderUpdates) => {
      const result = await updateServiceReminderRecord(
        primaryVehicle,
        reminderId,
        reminderUpdates,
      )
      setState((prev) =>
        recalculateStateAnalytics(prev, {
          serviceReminders: (prev.serviceReminders || []).map((r) =>
            r.id === reminderId
              ? result.reminder
                ? { ...r, ...result.reminder }
                : { ...r, ...reminderUpdates }
              : r,
          ).sort(sortServiceReminders),
        }),
      )
      return result
    },
    [primaryVehicle],
  )

  const deleteServiceReminder = useCallback(
    async (reminderId) => {
      const result = await deleteServiceReminderRecord(
        primaryVehicle,
        reminderId,
      )
      setState((prev) =>
        recalculateStateAnalytics(prev, {
          serviceReminders: (prev.serviceReminders || []).filter(
            (r) => r.id !== reminderId,
          ),
        }),
      )
      return result
    },
    [primaryVehicle],
  )

  const addVehicleModification = useCallback(
    async (modInput) => {
      const result = await createVehicleModificationRecord(
        primaryVehicle,
        modInput,
      )
      setState((prev) =>
        recalculateStateAnalytics(prev, {
          vehicleModifications: [
            result.modification,
            ...(prev.vehicleModifications || []),
          ],
        }),
      )
      return result
    },
    [primaryVehicle],
  )

  const updateVehicleModification = useCallback(
    async (modId, updates) => {
      const result = await updateVehicleModificationRecord(
        primaryVehicle,
        modId,
        updates,
      )
      setState((prev) =>
        recalculateStateAnalytics(prev, {
          vehicleModifications: (prev.vehicleModifications || []).map((m) =>
            m.id === modId
              ? result.modification
                ? { ...m, ...result.modification }
                : { ...m, ...updates }
              : m,
          ),
        }),
      )
      return result
    },
    [primaryVehicle],
  )

  const deleteVehicleModification = useCallback(
    async (modId) => {
      const result = await deleteVehicleModificationRecord(
        primaryVehicle,
        modId,
      )
      setState((prev) =>
        recalculateStateAnalytics(prev, {
          vehicleModifications: (prev.vehicleModifications || []).filter(
            (m) => m.id !== modId,
          ),
        }),
      )
      return result
    },
    [primaryVehicle],
  )

  return {
    ...state,
    primaryVehicle,
    activeVehicleCode,
    latestRefill,
    refresh,
    switchActiveVehicle,
    addVehicle,
    deleteVehicle,
    updatePrimaryVehicle,
    logFuelRefill: addFuelRefill, // Alias for cluster card
    addFuelRefill,
    editFuelRefill,
    deleteFuelRefill,
    updateMaintenanceItem,
    addComponentServiceLog,
    deleteComponentServiceLog,
    addVehicleRepair,
    deleteVehicleRepair,
    upsertVehicleDocument,
    deleteVehicleDocument,
    addServiceReminder,
    completeServiceReminder,
    updateServiceReminder,
    editServiceReminder: updateServiceReminder,
    deleteServiceReminder,
    addVehicleModification,
    updateVehicleModification,
    deleteVehicleModification,
  }
}

export function FleetProvider({ children }) {
  const value = useProvideFleetData()
  return createElement(FleetContext.Provider, { value }, children)
}

export function useFleetData() {
  const context = useContext(FleetContext)
  return context || defaultFallback
}
