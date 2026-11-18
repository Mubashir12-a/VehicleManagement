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
import { isSupabaseConfigured, supabase } from '../lib/supabase'

const STATUS_COLORS = {
  Active: '#a3e635',
  Maintenance: '#f59e0b',
  Idle: '#71717a',
  'Out of Service': '#f43f5e',
}

function isMissingTableError(error) {
  if (!error) return false
  return (
    error.code === '42P01' ||
    error.code === 'PGRST205' ||
    error.message?.toLowerCase().includes('could not find the table') ||
    error.message?.toLowerCase().includes('does not exist')
  )
}

function isMissingColumnError(error) {
  if (!error) return false
  return (
    error.code === '42703' ||
    error.code === 'PGRST204' ||
    error.message?.toLowerCase().includes('column')
  )
}

function mapVehicleRow(row) {
  const category =
    row.category === 'Four Wheeler' ? 'Four Wheeler' : 'Two Wheeler'
  const subType =
    category === 'Four Wheeler'
      ? 'Car'
      : row.sub_type === 'Bike'
        ? 'Bike'
        : 'Scooter'

  return {
    id: row.vehicle_code || row.id,
    dbId: row.id,
    name: row.name || defaultVehicle.name,
    brand: row.brand || defaultVehicle.brand,
    model: row.model || row.name || defaultVehicle.model,
    category,
    subType,
    engineCc: Number(row.engine_cc) || defaultVehicle.engineCc,
    plate: row.plate || defaultVehicle.plate,
    type: subType,
    driver: row.driver || 'Owner',
    status: row.status || 'Active',
    mileage: Number(row.mileage) || 0,
    topSpeed: Number(row.top_speed) || defaultVehicle.topSpeed || 150,
    speed: Number(row.top_speed) || defaultVehicle.topSpeed || 150,
    fuelLevel: Number(row.fuel_level) || 0,
    lastService: row.last_service || '—',
    nextService: row.next_service || '—',
  }
}

function mapMaintenanceRow(row) {
  return {
    id: row.work_order_code || row.id,
    dbId: row.id,
    vehicleId: row.vehicle_code,
    vehicleName: row.vehicle_name,
    serviceType: row.service_type,
    dueDate: row.due_date,
    estimatedCost: Number(row.estimated_cost) || 0,
    priority: row.priority,
    status: row.status,
  }
}

function mapMonthlyRow(row) {
  return {
    month: row.month_label,
    mileage: Number(row.mileage) || 0,
    fuelCost: Number(row.fuel_cost) || 0,
    maintenanceCost: Number(row.maintenance_cost) || 0,
  }
}

function mapFuelRefillRow(row) {
  const liters = Number(row.liters) || 0
  const amountSpent = Number(row.amount_spent) || 0
  const pricePerLiter =
    Number(row.price_per_liter) ||
    (liters > 0 ? Number((amountSpent / liters).toFixed(2)) : 105.0)

  return {
    id: row.id,
    vehicleCode: row.vehicle_code,
    refillDate: row.refill_date,
    odometerKm: Number(row.odometer_km) || 0,
    liters,
    pricePerLiter,
    amountSpent,
    fuelLevelAfter: Number(row.fuel_level_after) || 100,
    fuelFillType: row.fuel_fill_type || 'Full Tank',
    stationName: row.station_name || 'Fuel Station',
    location: row.location || 'City',
    notes: row.notes || '',
  }
}

function mapMaintenanceItemRow(row) {
  return {
    id: row.id,
    vehicleCode: row.vehicle_code,
    itemKey: row.item_key,
    label: row.label,
    intervalKm: Number(row.interval_km) || 1000,
    lastServiceOdo: Number(row.last_service_odo) || 0,
    sortOrder: Number(row.sort_order) || 0,
  }
}

export function computeMonthlyFuelSummary(fuelRefills = []) {
  const monthMap = new Map()

  for (const refill of fuelRefills) {
    if (!refill.refillDate) continue
    const yyyyMm = refill.refillDate.slice(0, 7) // '2026-11'
    const dateObj = new Date(refill.refillDate + 'T00:00:00Z')
    const monthLabel = dateObj.toLocaleDateString('en-US', {
      month: 'short',
      year: 'numeric',
      timeZone: 'UTC',
    })

    const current = monthMap.get(yyyyMm) || {
      key: yyyyMm,
      label: monthLabel,
      totalSpent: 0,
      totalLiters: 0,
      refillCount: 0,
      refills: [],
    }

    current.totalSpent += Number(refill.amountSpent) || 0
    current.totalLiters += Number(refill.liters) || 0
    current.refillCount += 1
    current.refills.push(refill)
    monthMap.set(yyyyMm, current)
  }

  const sortedMonths = Array.from(monthMap.values()).sort((a, b) =>
    b.key.localeCompare(a.key),
  )

  const now = new Date()
  const currentYm = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`

  const lastMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1)
  const lastYm = `${lastMonthDate.getFullYear()}-${String(lastMonthDate.getMonth() + 1).padStart(2, '0')}`

  const currentMonthData = sortedMonths.find((m) => m.key === currentYm) || {
    key: currentYm,
    label: now.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
    totalSpent: 0,
    totalLiters: 0,
    refillCount: 0,
    refills: [],
  }

  const lastMonthData = sortedMonths.find((m) => m.key === lastYm) || {
    key: lastYm,
    label: lastMonthDate.toLocaleDateString('en-US', {
      month: 'short',
      year: 'numeric',
    }),
    totalSpent: 0,
    totalLiters: 0,
    refillCount: 0,
    refills: [],
  }

  const currentAvgPrice =
    currentMonthData.totalLiters > 0
      ? Number(
          (currentMonthData.totalSpent / currentMonthData.totalLiters).toFixed(2),
        )
      : 0

  const lastAvgPrice =
    lastMonthData.totalLiters > 0
      ? Number(
          (lastMonthData.totalSpent / lastMonthData.totalLiters).toFixed(2),
        )
      : 0

  return {
    currentMonth: {
      ...currentMonthData,
      totalSpent: Number(currentMonthData.totalSpent.toFixed(2)),
      totalLiters: Number(currentMonthData.totalLiters.toFixed(2)),
      avgPrice: currentAvgPrice,
    },
    lastMonth: {
      ...lastMonthData,
      totalSpent: Number(lastMonthData.totalSpent.toFixed(2)),
      totalLiters: Number(lastMonthData.totalLiters.toFixed(2)),
      avgPrice: lastAvgPrice,
    },
    sortedMonths,
  }
}

export function computeFleetAnalytics(
  vehicles,
  monthlyTrends,
  fuelRefills = [],
  maintenanceLogs = [],
) {
  const totalVehicles = vehicles.length
  const statusCounts = {
    Active: 0,
    Maintenance: 0,
    Idle: 0,
    'Out of Service': 0,
  }

  const categoryCounts = {
    'Two Wheeler': { category: 'Two Wheeler', active: 0, total: 0 },
    'Four Wheeler': { category: 'Four Wheeler', active: 0, total: 0 },
  }

  for (const vehicle of vehicles) {
    if (statusCounts[vehicle.status] !== undefined) {
      statusCounts[vehicle.status] += 1
    }

    const catKey =
      vehicle.category === 'Four Wheeler' ? 'Four Wheeler' : 'Two Wheeler'
    categoryCounts[catKey].total += 1
    if (vehicle.status === 'Active') {
      categoryCounts[catKey].active += 1
    }
  }

  const totalFuelSpend = fuelRefills.reduce(
    (sum, item) => sum + (Number(item.amountSpent) || 0),
    0,
  )
  const totalMaintenanceSpend = maintenanceLogs.reduce(
    (sum, item) => sum + (Number(item.estimatedCost) || 0),
    0,
  )
  const totalSpendTillNow = Number(
    (totalFuelSpend + totalMaintenanceSpend).toFixed(2),
  )

  const monthlyFuelSummary = computeMonthlyFuelSummary(fuelRefills)

  const fleetUtilization =
    totalVehicles > 0
      ? Math.round((statusCounts.Active / totalVehicles) * 100)
      : 0

  return {
    summary: {
      totalVehicles,
      activeVehicles: statusCounts.Active,
      inMaintenance: statusCounts.Maintenance,
      idleVehicles: statusCounts.Idle,
      outOfService: statusCounts['Out of Service'],
      monthlyFuelSpend: monthlyFuelSummary.currentMonth.totalSpent,
      monthlyMileage: 0,
      fleetUtilization,
      totalFuelSpend: Number(totalFuelSpend.toFixed(2)),
      totalMaintenanceSpend: Number(totalMaintenanceSpend.toFixed(2)),
      totalSpendTillNow,
    },
    monthlyFuelSummary,
    statusData: Object.entries(statusCounts).map(([name, value]) => ({
      name,
      value,
      color: STATUS_COLORS[name],
    })),
    categoryData: Object.values(categoryCounts),
  }
}

export async function testSupabaseConnection() {
  if (!isSupabaseConfigured || !supabase) {
    return {
      connected: false,
      tablesReady: false,
      message: 'Supabase environment variables are not configured.',
    }
  }

  try {
    const { error, count } = await supabase
      .from('vehicles')
      .select('id, brand, model, category, sub_type, engine_cc', {
        count: 'exact',
      })
      .limit(1)

    if (!error) {
      return {
        connected: true,
        tablesReady: true,
        vehicleCount: count ?? 0,
        message: `Connected to Supabase. Schema is up to date (${count ?? 0} vehicle registered).`,
      }
    }

    if (isMissingColumnError(error)) {
      return {
        connected: true,
        tablesReady: false,
        message:
          'Connected to Supabase, but vehicle profile columns are missing.',
      }
    }

    if (isMissingTableError(error)) {
      return {
        connected: true,
        tablesReady: false,
        message:
          'Connected to Supabase project, but tables are not created yet.',
      }
    }

    return {
      connected: false,
      tablesReady: false,
      message: error.message || 'Unable to query Supabase.',
    }
  } catch (err) {
    return {
      connected: false,
      tablesReady: false,
      message: err?.message || 'Network error reaching Supabase.',
    }
  }
}

export async function fetchFleetData() {
  const fallbackPayload = {
    source: 'mock',
    needsSchema: false,
    needsSchemaUpgrade: false,
    vehicles: mockVehicles,
    maintenance: mockMaintenance,
    monthlyTrends: mockMonthlyTrends,
    fuelRefills: defaultFuelRefills,
    maintenanceItems: defaultMaintenanceItems,
    summary: mockSummary,
    monthlyFuelSummary: computeMonthlyFuelSummary(defaultFuelRefills),
    statusData: mockStatusData,
    categoryData: mockCategoryData,
    error: null,
  }

  if (!isSupabaseConfigured || !supabase) {
    return fallbackPayload
  }

  try {
    const [
      vehiclesRes,
      maintenanceRes,
      monthlyRes,
      refillsRes,
      healthItemsRes,
    ] = await Promise.all([
      supabase
        .from('vehicles')
        .select(
          'id, vehicle_code, name, brand, model, category, sub_type, engine_cc, top_speed, plate, driver, status, mileage, fuel_level, last_service, next_service',
        )
        .order('created_at', { ascending: true })
        .limit(1),
      supabase
        .from('maintenance_logs')
        .select('*')
        .order('due_date', { ascending: true }),
      supabase
        .from('monthly_fleet_metrics')
        .select('*')
        .order('sort_order', { ascending: true }),
      supabase
        .from('fuel_refills')
        .select('*')
        .order('refill_date', { ascending: false })
        .order('created_at', { ascending: false }),
      supabase
        .from('maintenance_items')
        .select('*')
        .order('sort_order', { ascending: true }),
    ])

    const coreError =
      vehiclesRes.error || maintenanceRes.error || monthlyRes.error

    if (coreError) {
      if (isMissingColumnError(coreError)) {
        return {
          ...fallbackPayload,
          needsSchemaUpgrade: true,
          error:
            'Supabase is connected, but public.vehicles needs the new columns.',
        }
      }

      if (isMissingTableError(coreError)) {
        return {
          ...fallbackPayload,
          needsSchema: true,
          error:
            'Supabase is connected, but the database tables have not been created yet.',
        }
      }

      return {
        ...fallbackPayload,
        error: coreError.message || 'Failed to fetch data from Supabase.',
      }
    }

    const mappedVehicles = (vehiclesRes.data || []).map(mapVehicleRow)
    const primaryVehicle = mappedVehicles[0] || defaultVehicle
    const primaryCode = primaryVehicle.id

    const fuelRefills = !refillsRes.error
      ? (refillsRes.data || [])
          .filter((r) => r.vehicle_code === primaryCode)
          .map(mapFuelRefillRow)
      : defaultFuelRefills

    // Odometer is strictly derived from the latest fuel refill (no manual override)
    if (fuelRefills.length > 0 && fuelRefills[0].odometerKm > 0) {
      primaryVehicle.mileage = fuelRefills[0].odometerKm
      primaryVehicle.fuelLevel = fuelRefills[0].fuelLevelAfter
    }

    const vehicles = [primaryVehicle]

    const allMaintenance = (maintenanceRes.data || []).map(mapMaintenanceRow)
    const maintenance = allMaintenance.filter(
      (item) => item.vehicleId === primaryCode,
    )
    const monthlyTrends = (monthlyRes.data || []).map(mapMonthlyRow)

    const maintenanceItems =
      !healthItemsRes.error && (healthItemsRes.data || []).length > 0
        ? healthItemsRes.data
            .filter((i) => i.vehicle_code === primaryCode)
            .map(mapMaintenanceItemRow)
        : defaultMaintenanceItems

    const analytics = computeFleetAnalytics(
      vehicles,
      monthlyTrends.length > 0 ? monthlyTrends : mockMonthlyTrends,
      fuelRefills,
      maintenance,
    )

    return {
      source: 'supabase',
      needsSchema: false,
      needsSchemaUpgrade: false,
      vehicles,
      maintenance:
        maintenance.length > 0 ? maintenance : allMaintenance.slice(0, 3),
      monthlyTrends:
        monthlyTrends.length > 0 ? monthlyTrends : mockMonthlyTrends,
      fuelRefills,
      maintenanceItems,
      ...analytics,
      error: null,
    }
  } catch (err) {
    return {
      ...fallbackPayload,
      error: err?.message || 'Network error while connecting to Supabase.',
    }
  }
}

export async function updatePrimaryVehicleRecord(currentVehicle, updates) {
  const category =
    updates.category === 'Four Wheeler' ? 'Four Wheeler' : 'Two Wheeler'
  const subType =
    category === 'Four Wheeler'
      ? 'Car'
      : updates.subType === 'Bike'
        ? 'Bike'
        : 'Scooter'

  const mergedVehicle = {
    ...currentVehicle,
    name: updates.name.trim() || currentVehicle.name,
    brand: updates.brand.trim() || currentVehicle.brand,
    model: updates.model.trim() || currentVehicle.model,
    category,
    subType,
    type: subType,
    engineCc: Math.max(50, Number(updates.engineCc) || 110),
    topSpeed: Math.max(
      0,
      Math.round(
        Number(updates.topSpeed ?? updates.speed ?? currentVehicle.topSpeed) ||
          150,
      ),
    ),
    speed: Math.max(
      0,
      Math.round(
        Number(updates.topSpeed ?? updates.speed ?? currentVehicle.topSpeed) ||
          150,
      ),
    ),
    plate: updates.plate.trim().toUpperCase() || currentVehicle.plate,
    status: updates.status || currentVehicle.status,
    // Odometer is strictly derived from latest fuel refill (no manual edit)
    mileage: currentVehicle.mileage,
    fuelLevel: currentVehicle.fuelLevel,
  }

  if (!isSupabaseConfigured || !supabase || !currentVehicle.dbId) {
    return { vehicle: mergedVehicle, savedToSupabase: false }
  }

  const { data, error } = await supabase
    .from('vehicles')
    .update({
      name: mergedVehicle.name,
      brand: mergedVehicle.brand,
      model: mergedVehicle.model,
      category: mergedVehicle.category,
      sub_type: mergedVehicle.subType,
      engine_cc: mergedVehicle.engineCc,
      top_speed: mergedVehicle.topSpeed,
      plate: mergedVehicle.plate,
      type: mergedVehicle.subType,
      status: mergedVehicle.status,
      mileage: mergedVehicle.mileage,
      fuel_level: mergedVehicle.fuelLevel,
    })
    .eq('id', currentVehicle.dbId)
    .select(
      'id, vehicle_code, name, brand, model, category, sub_type, engine_cc, top_speed, plate, driver, status, mileage, fuel_level, last_service, next_service',
    )
    .single()

  if (error) {
    throw new Error(error.message || 'Could not update vehicle in Supabase.')
  }

  return { vehicle: mapVehicleRow(data), savedToSupabase: true }
}

function normalizeRefillPayload(refillInput) {
  const odometerKm = Math.max(0, Math.round(Number(refillInput.odometerKm) || 0))
  let liters = Math.max(0, Number(refillInput.liters) || 0)
  let pricePerLiter = Math.max(0, Number(refillInput.pricePerLiter) || 0)
  let amountSpent = Math.max(0, Number(refillInput.amountSpent) || 0)

  // Auto-reconcile in case of precision discrepancy
  if (liters > 0 && pricePerLiter > 0 && (!amountSpent || Math.abs(amountSpent - liters * pricePerLiter) > 0.5)) {
    amountSpent = Number((liters * pricePerLiter).toFixed(2))
  } else if (amountSpent > 0 && pricePerLiter > 0 && !liters) {
    liters = Number((amountSpent / pricePerLiter).toFixed(2))
  } else if (amountSpent > 0 && liters > 0 && !pricePerLiter) {
    pricePerLiter = Number((amountSpent / liters).toFixed(2))
  }

  const fuelFillType =
    refillInput.fuelFillType === 'Partial / Reserve'
      ? 'Partial / Reserve'
      : 'Full Tank'

  const fuelLevelAfter = Math.min(
    100,
    Math.max(
      0,
      Number(refillInput.fuelLevelAfter) ||
        (fuelFillType === 'Full Tank' ? 100 : 75),
    ),
  )

  const refillDate =
    refillInput.refillDate || new Date().toISOString().slice(0, 10)
  const stationName = refillInput.stationName?.trim() || 'Fuel Station'
  const location = refillInput.location?.trim() || 'City'
  const notes = refillInput.notes?.trim() || ''

  return {
    odometerKm,
    liters,
    pricePerLiter,
    amountSpent,
    fuelFillType,
    fuelLevelAfter,
    refillDate,
    stationName,
    location,
    notes,
  }
}

export async function createFuelRefillRecord(currentVehicle, refillInput) {
  const payload = normalizeRefillPayload(refillInput)

  const localRefill = {
    id: `local-${Date.now()}`,
    vehicleCode: currentVehicle.id,
    ...payload,
  }

  const updatedMileage = Math.max(currentVehicle.mileage, payload.odometerKm)
  const localUpdatedVehicle = {
    ...currentVehicle,
    mileage: updatedMileage,
    fuelLevel: payload.fuelLevelAfter,
  }

  if (!isSupabaseConfigured || !supabase || !currentVehicle.dbId) {
    return {
      refill: localRefill,
      vehicle: localUpdatedVehicle,
      savedToSupabase: false,
    }
  }

  const { data: refillRow, error: refillError } = await supabase
    .from('fuel_refills')
    .insert([
      {
        vehicle_code: currentVehicle.id,
        refill_date: payload.refillDate,
        odometer_km: payload.odometerKm,
        liters: payload.liters,
        price_per_liter: payload.pricePerLiter,
        amount_spent: payload.amountSpent,
        fuel_level_after: payload.fuelLevelAfter,
        fuel_fill_type: payload.fuelFillType,
        station_name: payload.stationName,
        location: payload.location,
        notes: payload.notes,
      },
    ])
    .select('*')
    .single()

  if (refillError) {
    throw new Error(refillError.message || 'Failed to add fuel refill.')
  }

  const { data: vehicleRow, error: vehicleError } = await supabase
    .from('vehicles')
    .update({
      mileage: updatedMileage,
      fuel_level: payload.fuelLevelAfter,
    })
    .eq('id', currentVehicle.dbId)
    .select(
      'id, vehicle_code, name, brand, model, category, sub_type, engine_cc, plate, driver, status, mileage, fuel_level, last_service, next_service',
    )
    .single()

  if (vehicleError) {
    throw new Error(
      vehicleError.message || 'Refill saved, but odometer sync failed.',
    )
  }

  return {
    refill: mapFuelRefillRow(refillRow),
    vehicle: mapVehicleRow(vehicleRow),
    savedToSupabase: true,
  }
}

export const logFuelRefillAndSyncOdometer = createFuelRefillRecord

export async function updateFuelRefillRecord(
  currentVehicle,
  refillId,
  refillInput,
  allRefills = [],
) {
  const payload = normalizeRefillPayload(refillInput)

  const updatedRefills = allRefills
    .map((r) => (r.id === refillId ? { ...r, ...payload } : r))
    .sort(
      (a, b) =>
        new Date(b.refillDate) - new Date(a.refillDate) ||
        b.odometerKm - a.odometerKm,
    )

  const latestRefill = updatedRefills[0]
  const targetOdo = latestRefill ? latestRefill.odometerKm : currentVehicle.mileage
  const targetFuelLevel = latestRefill ? latestRefill.fuelLevelAfter : payload.fuelLevelAfter

  const localUpdatedVehicle = {
    ...currentVehicle,
    mileage: targetOdo,
    fuelLevel: targetFuelLevel,
  }

  if (!isSupabaseConfigured || !supabase || String(refillId).startsWith('local-')) {
    return {
      refill: { id: refillId, vehicleCode: currentVehicle.id, ...payload },
      vehicle: localUpdatedVehicle,
      savedToSupabase: false,
    }
  }

  const { data: refillRow, error: refillError } = await supabase
    .from('fuel_refills')
    .update({
      refill_date: payload.refillDate,
      odometer_km: payload.odometerKm,
      liters: payload.liters,
      price_per_liter: payload.pricePerLiter,
      amount_spent: payload.amountSpent,
      fuel_level_after: payload.fuelLevelAfter,
      fuel_fill_type: payload.fuelFillType,
      station_name: payload.stationName,
      location: payload.location,
      notes: payload.notes,
    })
    .eq('id', refillId)
    .select('*')
    .single()

  if (refillError) {
    throw new Error(refillError.message || 'Failed to update fuel refill.')
  }

  const { data: vehicleRow, error: vehicleError } = await supabase
    .from('vehicles')
    .update({
      mileage: targetOdo,
      fuel_level: targetFuelLevel,
    })
    .eq('id', currentVehicle.dbId)
    .select(
      'id, vehicle_code, name, brand, model, category, sub_type, engine_cc, plate, driver, status, mileage, fuel_level, last_service, next_service',
    )
    .single()

  if (vehicleError) {
    throw new Error(
      vehicleError.message || 'Refill updated, but odometer sync failed.',
    )
  }

  return {
    refill: mapFuelRefillRow(refillRow),
    vehicle: mapVehicleRow(vehicleRow),
    savedToSupabase: true,
  }
}

export async function deleteFuelRefillRecord(
  currentVehicle,
  refillId,
  allRefills = [],
) {
  const remaining = allRefills
    .filter((r) => r.id !== refillId)
    .sort(
      (a, b) =>
        new Date(b.refillDate) - new Date(a.refillDate) ||
        b.odometerKm - a.odometerKm,
    )

  const latestRefill = remaining[0]
  const targetOdo = latestRefill ? latestRefill.odometerKm : 0
  const targetFuelLevel = latestRefill ? latestRefill.fuelLevelAfter : 75

  const localUpdatedVehicle = {
    ...currentVehicle,
    mileage: targetOdo,
    fuelLevel: targetFuelLevel,
  }

  if (!isSupabaseConfigured || !supabase || String(refillId).startsWith('local-')) {
    return { vehicle: localUpdatedVehicle, savedToSupabase: false }
  }

  const { error: deleteError } = await supabase
    .from('fuel_refills')
    .delete()
    .eq('id', refillId)

  if (deleteError) {
    throw new Error(deleteError.message || 'Failed to delete fuel refill.')
  }

  const { data: vehicleRow, error: vehicleError } = await supabase
    .from('vehicles')
    .update({
      mileage: targetOdo,
      fuel_level: targetFuelLevel,
    })
    .eq('id', currentVehicle.dbId)
    .select(
      'id, vehicle_code, name, brand, model, category, sub_type, engine_cc, plate, driver, status, mileage, fuel_level, last_service, next_service',
    )
    .single()

  if (vehicleError) {
    throw new Error(
      vehicleError.message || 'Deleted refill, but odometer sync failed.',
    )
  }

  return { vehicle: mapVehicleRow(vehicleRow), savedToSupabase: true }
}

export async function updateMaintenanceHealthItem(item, updates) {
  const nextInterval = Math.max(
    100,
    Number(updates.intervalKm ?? item.intervalKm) || 1000,
  )
  const nextLastOdo = Math.max(
    0,
    Number(updates.lastServiceOdo ?? item.lastServiceOdo) || 0,
  )

  const updatedLocal = {
    ...item,
    intervalKm: nextInterval,
    lastServiceOdo: nextLastOdo,
  }

  if (
    !isSupabaseConfigured ||
    !supabase ||
    !item.id ||
    String(item.id).startsWith('MI-')
  ) {
    return { item: updatedLocal, savedToSupabase: false }
  }

  const { data, error } = await supabase
    .from('maintenance_items')
    .update({
      interval_km: nextInterval,
      last_service_odo: nextLastOdo,
      updated_at: new Date().toISOString(),
    })
    .eq('id', item.id)
    .select('*')
    .single()

  if (error) {
    throw new Error(error.message || 'Failed to update maintenance item.')
  }

  return { item: mapMaintenanceItemRow(data), savedToSupabase: true }
}
