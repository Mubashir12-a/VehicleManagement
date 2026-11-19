import {
  defaultComponentServiceLogs,
  defaultFuelRefills,
  defaultMaintenanceItems,
  defaultServiceReminders,
  defaultVehicle,
  defaultVehicleDocuments,
  defaultVehicleRepairs,
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
    fuelType: row.fuel_type || defaultVehicle.fuelType || 'Petrol (E10)',
    mileage: Number(row.mileage) || 0,
    topSpeed: Number(row.top_speed) || defaultVehicle.topSpeed || 0,
    speed: Number(row.top_speed) || defaultVehicle.topSpeed || 0,
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

function mapComponentServiceLogRow(row) {
  return {
    id: row.id,
    vehicleCode: row.vehicle_code,
    itemKey: row.item_key,
    serviceDate: row.service_date,
    odometerKm: Number(row.odometer_km) || 0,
    cost: Number(row.cost) || 0,
    notes: row.notes || '',
    createdAt: row.created_at,
  }
}

function mapVehicleRepairRow(row) {
  return {
    id: row.id,
    vehicleCode: row.vehicle_code,
    repairTitle: row.repair_title,
    category: row.category || 'Repair',
    repairDate: row.repair_date,
    odometerKm: Number(row.odometer_km) || 0,
    cost: Number(row.cost) || 0,
    garageName: row.garage_name || '',
    notes: row.notes || '',
    createdAt: row.created_at,
  }
}

function mapVehicleDocumentRow(row) {
  return {
    id: row.id,
    vehicleCode: row.vehicle_code,
    docType: row.doc_type,
    title: row.title,
    docNumber: row.doc_number || '',
    issuer: row.issuer || '',
    issueDate: row.issue_date || '',
    expiryDate: row.expiry_date,
    maxOdometerKm: row.max_odometer_km ? Number(row.max_odometer_km) : null,
    notes: row.notes || '',
    createdAt: row.created_at,
  }
}

function mapServiceReminderRow(row) {
  return {
    id: row.id,
    vehicleCode: row.vehicle_code,
    title: row.title,
    serviceType: row.service_type || 'Free Service',
    dueDate: row.due_date || '',
    dueDateEnd: row.due_date_end || '',
    dueOdometerKm: row.due_odometer_km ? Number(row.due_odometer_km) : null,
    dueOdometerMaxKm: row.due_odometer_max_km
      ? Number(row.due_odometer_max_km)
      : null,
    status: row.status || 'Pending',
    completedDate: row.completed_date || '',
    completedOdometerKm: row.completed_odometer_km
      ? Number(row.completed_odometer_km)
      : null,
    amountPaid: Number(row.amount_paid) || 0,
    serviceCenter: row.service_center || '',
    invoiceNo: row.invoice_no || '',
    notes: row.notes || '',
    createdAt: row.created_at,
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
    componentServiceLogs: defaultComponentServiceLogs,
    vehicleRepairs: defaultVehicleRepairs,
    vehicleDocuments: defaultVehicleDocuments,
    serviceReminders: defaultServiceReminders,
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
      serviceLogsRes,
      repairsRes,
      docsRes,
      remindersRes,
    ] = await Promise.all([
      supabase
        .from('vehicles')
        .select(
          'id, vehicle_code, name, brand, model, category, sub_type, engine_cc, top_speed, fuel_type, plate, driver, status, mileage, fuel_level, last_service, next_service',
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
      supabase
        .from('component_service_logs')
        .select('*')
        .order('service_date', { ascending: false })
        .order('created_at', { ascending: false }),
      supabase
        .from('vehicle_repairs')
        .select('*')
        .order('repair_date', { ascending: false })
        .order('created_at', { ascending: false }),
      supabase
        .from('vehicle_documents')
        .select('*')
        .order('expiry_date', { ascending: true }),
      supabase
        .from('service_reminders')
        .select('*')
        .order('status', { ascending: false })
        .order('due_date', { ascending: true }),
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

    const currentMileage = Number(primaryVehicle.mileage) || 0
    const rawItems =
      !healthItemsRes.error && (healthItemsRes.data || []).length > 0
        ? healthItemsRes.data
            .filter((i) => i.vehicle_code === primaryCode)
            .map(mapMaintenanceItemRow)
        : defaultMaintenanceItems

    const maintenanceItems = rawItems.map((item) => ({
      ...item,
      lastServiceOdo:
        item.lastServiceOdo > currentMileage ? 0 : item.lastServiceOdo,
    }))

    const componentServiceLogs = !serviceLogsRes.error
      ? (serviceLogsRes.data || [])
          .filter((l) => l.vehicle_code === primaryCode)
          .map(mapComponentServiceLogRow)
      : defaultComponentServiceLogs

    const vehicleRepairs = !repairsRes.error
      ? (repairsRes.data || [])
          .filter((r) => r.vehicle_code === primaryCode)
          .map(mapVehicleRepairRow)
      : defaultVehicleRepairs

    const vehicleDocuments = !docsRes.error
      ? (docsRes.data || [])
          .filter((d) => d.vehicle_code === primaryCode)
          .map(mapVehicleDocumentRow)
      : defaultVehicleDocuments

    const serviceReminders = !remindersRes.error
      ? (remindersRes.data || [])
          .filter((r) => r.vehicle_code === primaryCode)
          .map(mapServiceReminderRow)
      : defaultServiceReminders

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
      componentServiceLogs,
      vehicleRepairs,
      vehicleDocuments,
      serviceReminders,
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
        Number(updates.topSpeed ?? updates.speed ?? currentVehicle.topSpeed) || 0,
      ),
    ),
    speed: Math.max(
      0,
      Math.round(
        Number(updates.topSpeed ?? updates.speed ?? currentVehicle.topSpeed) || 0,
      ),
    ),
    plate: updates.plate.trim().toUpperCase() || currentVehicle.plate,
    status: updates.status || currentVehicle.status,
    fuelType: updates.fuelType || currentVehicle.fuelType || 'Petrol (E10)',
    mileage:
      updates.mileage !== undefined && updates.mileage !== ''
        ? Math.max(0, Number(updates.mileage) || 0)
        : currentVehicle.mileage,
    fuelLevel:
      updates.fuelLevel !== undefined && updates.fuelLevel !== ''
        ? Math.min(100, Math.max(0, Number(updates.fuelLevel) || 0))
        : currentVehicle.fuelLevel,
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
      fuel_type: mergedVehicle.fuelType,
      mileage: mergedVehicle.mileage,
      fuel_level: mergedVehicle.fuelLevel,
    })
    .eq('id', currentVehicle.dbId)
    .select(
      'id, vehicle_code, name, brand, model, category, sub_type, engine_cc, top_speed, fuel_type, plate, driver, status, mileage, fuel_level, last_service, next_service',
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

export async function createComponentServiceLogRecord(
  primaryVehicle,
  item,
  logInput,
) {
  const odoKm = Math.max(0, Number(logInput.odometerKm) || 0)
  const cost = Math.max(0, Number(logInput.cost) || 0)
  const serviceDate =
    logInput.serviceDate || new Date().toISOString().split('T')[0]
  const notes = (logInput.notes || '').trim()

  const localLog = {
    id: `CSL-${Date.now()}`,
    vehicleCode: primaryVehicle.id || 'VH-001',
    itemKey: item.itemKey,
    serviceDate,
    odometerKm: odoKm,
    cost,
    notes,
    createdAt: new Date().toISOString(),
  }

  const updatedItem = {
    ...item,
    lastServiceOdo: odoKm,
  }

  if (!isSupabaseConfigured || !supabase) {
    return { log: localLog, item: updatedItem, savedToSupabase: false }
  }

  try {
    const { data: logData, error: logError } = await supabase
      .from('component_service_logs')
      .insert({
        vehicle_code: primaryVehicle.id || 'VH-001',
        item_key: item.itemKey,
        service_date: serviceDate,
        odometer_km: odoKm,
        cost,
        notes,
      })
      .select('*')
      .single()

    if (logError) {
      console.warn('Failed to insert service log to Supabase:', logError.message)
      return { log: localLog, item: updatedItem, savedToSupabase: false }
    }

    if (item.id && !String(item.id).startsWith('MI-')) {
      await supabase
        .from('maintenance_items')
        .update({
          last_service_odo: odoKm,
          updated_at: new Date().toISOString(),
        })
        .eq('id', item.id)
    } else {
      await supabase
        .from('maintenance_items')
        .update({
          last_service_odo: odoKm,
          updated_at: new Date().toISOString(),
        })
        .eq('vehicle_code', primaryVehicle.id || 'VH-001')
        .eq('item_key', item.itemKey)
    }

    return {
      log: mapComponentServiceLogRow(logData),
      item: updatedItem,
      savedToSupabase: true,
    }
  } catch (err) {
    console.error('Error in createComponentServiceLogRecord:', err)
    return { log: localLog, item: updatedItem, savedToSupabase: false }
  }
}

export async function deleteComponentServiceLogRecord(
  primaryVehicle,
  logId,
  itemKey,
  allItemLogs = [],
) {
  const remaining = allItemLogs.filter(
    (l) => l.itemKey === itemKey && l.id !== logId,
  )
  const newLastOdo =
    remaining.length > 0 ? Math.max(...remaining.map((l) => l.odometerKm)) : 0

  if (!isSupabaseConfigured || !supabase || String(logId).startsWith('CSL-')) {
    return { success: true, newLastOdo }
  }

  try {
    await supabase.from('component_service_logs').delete().eq('id', logId)
    await supabase
      .from('maintenance_items')
      .update({
        last_service_odo: newLastOdo,
        updated_at: new Date().toISOString(),
      })
      .eq('vehicle_code', primaryVehicle.id || 'VH-001')
      .eq('item_key', itemKey)

    return { success: true, newLastOdo }
  } catch (err) {
    console.error('Error in deleteComponentServiceLogRecord:', err)
    return { success: false, newLastOdo }
  }
}

export async function createVehicleRepairRecord(primaryVehicle, repairInput) {
  const odoKm = Math.max(0, Number(repairInput.odometerKm) || 0)
  const cost = Math.max(0, Number(repairInput.cost) || 0)
  const repairTitle = (repairInput.repairTitle || '').trim() || 'General Repair'
  const category = repairInput.category || 'Repair'
  const repairDate =
    repairInput.repairDate || new Date().toISOString().split('T')[0]
  const garageName = (repairInput.garageName || '').trim()
  const notes = (repairInput.notes || '').trim()

  const localRepair = {
    id: `REP-${Date.now()}`,
    vehicleCode: primaryVehicle.id || 'VH-001',
    repairTitle,
    category,
    repairDate,
    odometerKm: odoKm,
    cost,
    garageName,
    notes,
    createdAt: new Date().toISOString(),
  }

  if (!isSupabaseConfigured || !supabase) {
    return { repair: localRepair, savedToSupabase: false }
  }

  try {
    const { data, error } = await supabase
      .from('vehicle_repairs')
      .insert({
        vehicle_code: primaryVehicle.id || 'VH-001',
        repair_title: repairTitle,
        category,
        repair_date: repairDate,
        odometer_km: odoKm,
        cost,
        garage_name: garageName,
        notes,
      })
      .select('*')
      .single()

    if (error) {
      console.warn('Failed to insert vehicle repair to Supabase:', error.message)
      return { repair: localRepair, savedToSupabase: false }
    }

    return {
      repair: mapVehicleRepairRow(data),
      savedToSupabase: true,
    }
  } catch (err) {
    console.error('Error in createVehicleRepairRecord:', err)
    return { repair: localRepair, savedToSupabase: false }
  }
}

export async function deleteVehicleRepairRecord(primaryVehicle, repairId) {
  if (
    !isSupabaseConfigured ||
    !supabase ||
    String(repairId).startsWith('REP-')
  ) {
    return { success: true }
  }

  try {
    await supabase.from('vehicle_repairs').delete().eq('id', repairId)
    return { success: true }
  } catch (err) {
    console.error('Error in deleteVehicleRepairRecord:', err)
    return { success: false }
  }
}

export async function upsertVehicleDocumentRecord(primaryVehicle, docInput) {
  const localDoc = {
    id: docInput.id || `DOC-${Date.now()}`,
    vehicleCode: primaryVehicle.id || 'VH-001',
    docType: docInput.docType || 'other',
    title: (docInput.title || '').trim() || 'Document',
    docNumber: (docInput.docNumber || '').trim(),
    issuer: (docInput.issuer || '').trim(),
    issueDate: docInput.issueDate || '',
    expiryDate: docInput.expiryDate,
    maxOdometerKm: docInput.maxOdometerKm
      ? Number(docInput.maxOdometerKm)
      : null,
    notes: (docInput.notes || '').trim(),
    createdAt: new Date().toISOString(),
  }

  if (!isSupabaseConfigured || !supabase) {
    return { doc: localDoc, savedToSupabase: false }
  }

  try {
    const isExisting =
      docInput.id &&
      !String(docInput.id).startsWith('DOC-')

    if (isExisting) {
      const { data, error } = await supabase
        .from('vehicle_documents')
        .update({
          doc_type: localDoc.docType,
          title: localDoc.title,
          doc_number: localDoc.docNumber,
          issuer: localDoc.issuer,
          issue_date: localDoc.issueDate || null,
          expiry_date: localDoc.expiryDate,
          max_odometer_km: localDoc.maxOdometerKm,
          notes: localDoc.notes,
          updated_at: new Date().toISOString(),
        })
        .eq('id', docInput.id)
        .select('*')
        .single()

      if (error) {
        console.warn('Failed to update vehicle document in Supabase:', error.message)
        return { doc: localDoc, savedToSupabase: false }
      }
      return { doc: mapVehicleDocumentRow(data), savedToSupabase: true }
    } else {
      const { data, error } = await supabase
        .from('vehicle_documents')
        .insert({
          vehicle_code: primaryVehicle.id || 'VH-001',
          doc_type: localDoc.docType,
          title: localDoc.title,
          doc_number: localDoc.docNumber,
          issuer: localDoc.issuer,
          issue_date: localDoc.issueDate || null,
          expiry_date: localDoc.expiryDate,
          max_odometer_km: localDoc.maxOdometerKm,
          notes: localDoc.notes,
        })
        .select('*')
        .single()

      if (error) {
        console.warn('Failed to insert vehicle document to Supabase:', error.message)
        return { doc: localDoc, savedToSupabase: false }
      }
      return { doc: mapVehicleDocumentRow(data), savedToSupabase: true }
    }
  } catch (err) {
    console.error('Error in upsertVehicleDocumentRecord:', err)
    return { doc: localDoc, savedToSupabase: false }
  }
}

export async function deleteVehicleDocumentRecord(primaryVehicle, docId) {
  if (
    !isSupabaseConfigured ||
    !supabase ||
    String(docId).startsWith('DOC-')
  ) {
    return { success: true }
  }

  try {
    await supabase.from('vehicle_documents').delete().eq('id', docId)
    return { success: true }
  } catch (err) {
    console.error('Error in deleteVehicleDocumentRecord:', err)
    return { success: false }
  }
}

export async function createServiceReminderRecord(
  primaryVehicle,
  reminderInput,
) {
  const localReminder = {
    id: `REM-${Date.now()}`,
    vehicleCode: primaryVehicle.id || 'VH-001',
    title: (reminderInput.title || '').trim() || 'Service Reminder',
    serviceType: reminderInput.serviceType || 'Free Service',
    dueDate: reminderInput.dueDate || '',
    dueDateEnd: reminderInput.dueDateEnd || '',
    dueOdometerKm: reminderInput.dueOdometerKm
      ? Number(reminderInput.dueOdometerKm)
      : null,
    dueOdometerMaxKm: reminderInput.dueOdometerMaxKm
      ? Number(reminderInput.dueOdometerMaxKm)
      : null,
    status: 'Pending',
    completedDate: '',
    completedOdometerKm: null,
    amountPaid: 0,
    serviceCenter: '',
    invoiceNo: '',
    notes: (reminderInput.notes || '').trim(),
    createdAt: new Date().toISOString(),
  }

  if (!isSupabaseConfigured || !supabase) {
    return { reminder: localReminder, savedToSupabase: false }
  }

  try {
    const { data, error } = await supabase
      .from('service_reminders')
      .insert({
        vehicle_code: primaryVehicle.id || 'VH-001',
        title: localReminder.title,
        service_type: localReminder.serviceType,
        due_date: localReminder.dueDate || null,
        due_date_end: localReminder.dueDateEnd || null,
        due_odometer_km: localReminder.dueOdometerKm,
        due_odometer_max_km: localReminder.dueOdometerMaxKm,
        status: 'Pending',
        notes: localReminder.notes,
      })
      .select('*')
      .single()

    if (error) {
      console.warn('Failed to insert service reminder to Supabase:', error.message)
      return { reminder: localReminder, savedToSupabase: false }
    }

    return {
      reminder: mapServiceReminderRow(data),
      savedToSupabase: true,
    }
  } catch (err) {
    console.error('Error in createServiceReminderRecord:', err)
    return { reminder: localReminder, savedToSupabase: false }
  }
}

export async function completeServiceReminderRecord(
  primaryVehicle,
  reminderId,
  completionInput,
) {
  const completedDate =
    completionInput.completedDate || new Date().toISOString().split('T')[0]
  const completedOdometerKm = completionInput.completedOdometerKm
    ? Number(completionInput.completedOdometerKm)
    : null
  const amountPaid = Math.max(0, Number(completionInput.amountPaid) || 0)
  const serviceCenter = (completionInput.serviceCenter || '').trim()
  const invoiceNo = (completionInput.invoiceNo || '').trim()
  const notes = (completionInput.notes || '').trim()

  const localUpdated = {
    status: 'Completed',
    completedDate,
    completedOdometerKm,
    amountPaid,
    serviceCenter,
    invoiceNo,
    notes,
  }

  if (
    !isSupabaseConfigured ||
    !supabase ||
    String(reminderId).startsWith('REM-')
  ) {
    return { updates: localUpdated, savedToSupabase: false }
  }

  try {
    const { data, error } = await supabase
      .from('service_reminders')
      .update({
        status: 'Completed',
        completed_date: completedDate,
        completed_odometer_km: completedOdometerKm,
        amount_paid: amountPaid,
        service_center: serviceCenter,
        invoice_no: invoiceNo,
        notes,
        updated_at: new Date().toISOString(),
      })
      .eq('id', reminderId)
      .select('*')
      .single()

    if (error) {
      console.warn('Failed to complete service reminder in Supabase:', error.message)
      return { updates: localUpdated, savedToSupabase: false }
    }

    return {
      reminder: mapServiceReminderRow(data),
      savedToSupabase: true,
    }
  } catch (err) {
    console.error('Error in completeServiceReminderRecord:', err)
    return { updates: localUpdated, savedToSupabase: false }
  }
}

export async function deleteServiceReminderRecord(primaryVehicle, reminderId) {
  if (
    !isSupabaseConfigured ||
    !supabase ||
    String(reminderId).startsWith('REM-')
  ) {
    return { success: true }
  }

  try {
    await supabase.from('service_reminders').delete().eq('id', reminderId)
    return { success: true }
  } catch (err) {
    console.error('Error in deleteServiceReminderRecord:', err)
    return { success: false }
  }
}
