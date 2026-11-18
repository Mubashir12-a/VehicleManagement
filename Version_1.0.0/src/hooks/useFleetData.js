import {
  createContext,
  createElement,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react'
import {
  defaultFuelRefills,
  defaultMaintenanceItems,
  defaultVehicle,
  fleetStatusData as mockStatusData,
  fleetSummary as mockSummary,
  maintenanceSchedule as mockMaintenance,
  monthlyFleetTrends as mockMonthlyTrends,
  vehicleCategoryData as mockCategoryData,
  vehiclesList as mockVehicles,
} from '../data/mockFleetData'
import {
  computeFleetAnalytics,
  computeMonthlyFuelSummary,
  createFuelRefillRecord,
  deleteFuelRefillRecord,
  fetchFleetData,
  updateFuelRefillRecord,
  updateMaintenanceHealthItem,
  updatePrimaryVehicleRecord,
} from '../services/fleetService'

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
  summary: mockSummary,
  monthlyFuelSummary: computeMonthlyFuelSummary(defaultFuelRefills),
  statusData: mockStatusData,
  categoryData: mockCategoryData,
  primaryVehicle: defaultVehicle,
  latestRefill: defaultFuelRefills[0] || null,
  refresh: () => {},
  updatePrimaryVehicle: async () => {},
  logFuelRefill: async () => {},
  addFuelRefill: async () => {},
  editFuelRefill: async () => {},
  deleteFuelRefill: async () => {},
  updateMaintenanceItem: async () => {},
}

const FleetContext = createContext(defaultFallback)

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
    summary: mockSummary,
    monthlyFuelSummary: computeMonthlyFuelSummary(defaultFuelRefills),
    statusData: mockStatusData,
    categoryData: mockCategoryData,
  }))

  const refresh = useCallback(async () => {
    setState((prev) => ({ ...prev, loading: true }))
    const result = await fetchFleetData()
    setState({
      loading: false,
      ...result,
    })
  }, [])

  useEffect(() => {
    let active = true

    fetchFleetData().then((result) => {
      if (!active) return
      setState({
        loading: false,
        ...result,
      })
    })

    return () => {
      active = false
    }
  }, [])

  const primaryVehicle = state.vehicles[0] || defaultVehicle
  const latestRefill = state.fuelRefills[0] || null

  const updatePrimaryVehicle = useCallback(
    async (updates) => {
      const result = await updatePrimaryVehicleRecord(primaryVehicle, updates)
      setState((prev) => {
        const nextVehicles = [result.vehicle]
        const analytics = computeFleetAnalytics(
          nextVehicles,
          prev.monthlyTrends,
          prev.fuelRefills,
          prev.maintenance,
        )
        return {
          ...prev,
          vehicles: nextVehicles,
          ...analytics,
        }
      })
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
        const nextVehicles = [syncedVehicle]
        const analytics = computeFleetAnalytics(
          nextVehicles,
          prev.monthlyTrends,
          nextRefills,
          prev.maintenance,
        )
        return {
          ...prev,
          vehicles: nextVehicles,
          fuelRefills: nextRefills,
          ...analytics,
        }
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
        const nextVehicles = [syncedVehicle]
        const analytics = computeFleetAnalytics(
          nextVehicles,
          prev.monthlyTrends,
          nextRefills,
          prev.maintenance,
        )
        return {
          ...prev,
          vehicles: nextVehicles,
          fuelRefills: nextRefills,
          ...analytics,
        }
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
        const nextVehicles = [syncedVehicle]
        const analytics = computeFleetAnalytics(
          nextVehicles,
          prev.monthlyTrends,
          nextRefills,
          prev.maintenance,
        )
        return {
          ...prev,
          vehicles: nextVehicles,
          fuelRefills: nextRefills,
          ...analytics,
        }
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

  return {
    ...state,
    primaryVehicle,
    latestRefill,
    refresh,
    updatePrimaryVehicle,
    logFuelRefill: addFuelRefill, // Alias for cluster card
    addFuelRefill,
    editFuelRefill,
    deleteFuelRefill,
    updateMaintenanceItem,
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
