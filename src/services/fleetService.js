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
  maintenanceSchedule as mockMaintenance,
  monthlyFleetTrends as mockMonthlyTrends,
  vehicleCategoryData as mockCategoryData,
  vehiclesList as mockVehicles,
} from '../data/mockFleetData'
import { sortServiceReminders } from '../components/dates/datesUtils'
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
      ? row.sub_type || 'Sedan'
      : row.sub_type || 'Bike'

  return {
    id: row.vehicle_code || row.id,
    dbId: row.id,
    userId: row.user_id || null,
    name: row.name || defaultVehicle.name,
    brand: row.brand || 'None',
    model: row.model || row.name || 'None',
    category,
    subType,
    engineCc: Number(row.engine_cc) || 0,
    plate: row.plate || 'None',
    type: subType,
    driver: row.driver || 'None',
    status: row.status || 'Active',
    fuelType: row.fuel_type || 'None',
    mileage: Number(row.mileage) || 0,
    topSpeed: Number(row.top_speed) || 0,
    speed: Number(row.top_speed) || 0,
    purchaseDate: row.purchase_date || 'DD-MM-YYYY',
    exShowroomPrice: Math.max(0, Number(row.ex_showroom_price) || 0),
    fuelLevel: Number(row.fuel_level) || 0,
    lastService: row.last_service || 'None',
    nextService: row.next_service || 'None',
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
    durationYears: row.duration_years ? Number(row.duration_years) : 1,
    expiryDate: row.expiry_date,
    maxOdometerKm: row.max_odometer_km ? Number(row.max_odometer_km) : null,
    amountPaid: Math.max(0, Number(row.amount_paid) || 0),
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
    dueDateFrom: row.due_date_from || row.due_date || '',
    durationDaysMin: row.duration_days_min ? Number(row.duration_days_min) : null,
    durationDaysMax: row.duration_days_max ? Number(row.duration_days_max) : null,
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

function mapVehicleModificationRow(row) {
  return {
    id: row.id,
    vehicleCode: row.vehicle_code,
    title: row.title,
    category: row.category || 'Accessory',
    brand: row.brand || '',
    installedDate: row.installed_date || '',
    odometerKm:
      row.odometer_km !== null && row.odometer_km !== undefined
        ? Number(row.odometer_km)
        : null,
    cost: Math.max(0, Number(row.cost) || 0),
    installedBy: row.installed_by || 'Self',
    status: row.status || 'Installed',
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
  componentServiceLogs = [],
  vehicleRepairs = [],
  vehicleDocuments = [],
  serviceReminders = [],
  vehicleModifications = [],
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

  // 1. Fuel Spend: every single rupee spent on refills
  const totalFuelSpend = (fuelRefills || []).reduce((sum, item) => {
    const cost =
      Number(
        item.amountSpent ??
          item.totalCost ??
          Number(item.liters || 0) * Number(item.pricePerLiter || 0),
      ) || 0
    return sum + cost
  }, 0)

  // 2. Documents Spend: Insurance, RC, PUC, Warranty fees
  const totalDocumentsSpend = (vehicleDocuments || []).reduce((sum, doc) => {
    const cost = Number(doc.amountPaid ?? doc.amount_paid ?? 0) || 0
    return sum + cost
  }, 0)

  // 3. Services & Maintenance Spend: component logs, repairs, completed service reminders, maintenance logs
  const componentLogsSpend = (componentServiceLogs || []).reduce(
    (sum, log) => sum + (Number(log.cost ?? log.amount ?? 0) || 0),
    0,
  )
  const repairsSpend = (vehicleRepairs || []).reduce(
    (sum, repair) => sum + (Number(repair.cost ?? repair.amount ?? 0) || 0),
    0,
  )
  const remindersSpend = (serviceReminders || []).reduce(
    (sum, rem) =>
      sum + (Number(rem.amountPaid ?? rem.cost ?? rem.amount ?? 0) || 0),
    0,
  )
  const maintenanceLogsSpend = (maintenanceLogs || []).reduce(
    (sum, item) => sum + (Number(item.estimatedCost ?? item.cost ?? 0) || 0),
    0,
  )

  const totalServicesSpend =
    componentLogsSpend + repairsSpend + remindersSpend + maintenanceLogsSpend

  // 4. Modifications & Accessories Spend (Installed parts only)
  const totalModificationsSpend = (vehicleModifications || [])
    .filter((m) => m.status === 'Installed' || !m.status)
    .reduce((sum, item) => sum + (Number(item.cost) || 0), 0)

  // Total operational spend from every single rupee spent everywhere (strictly EXCLUDING bike ex-showroom price)
  const totalSpendTillNow = Number(
    (
      totalFuelSpend +
      totalDocumentsSpend +
      totalServicesSpend +
      totalModificationsSpend
    ).toFixed(2),
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
      totalDocumentsSpend: Number(totalDocumentsSpend.toFixed(2)),
      totalServicesSpend: Number(totalServicesSpend.toFixed(2)),
      totalMaintenanceSpend: Number(totalServicesSpend.toFixed(2)),
      totalModificationsSpend: Number(totalModificationsSpend.toFixed(2)),
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

async function getEffectiveUserId(vehicle = null) {
  if (vehicle?.userId) return vehicle.userId
  if (!isSupabaseConfigured || !supabase) return null
  try {
    const { data } = await supabase.auth.getUser()
    return data?.user?.id || null
  } catch {
    return null
  }
}

export async function fetchFleetData(activeUser = null, targetVehicleCode = null) {
  const storedCode =
    typeof window !== 'undefined'
      ? localStorage.getItem('mkd_active_vehicle_code')
      : null
  const effectiveFallbackCode = targetVehicleCode || storedCode
  const fallbackPrimary =
    mockVehicles.find((v) => v.id === effectiveFallbackCode) ||
    mockVehicles[0] ||
    defaultVehicle

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
    vehicleModifications: defaultVehicleModifications,
    summary: computeFleetAnalytics(
      mockVehicles,
      mockMonthlyTrends,
      defaultFuelRefills,
      mockMaintenance,
      defaultComponentServiceLogs,
      defaultVehicleRepairs,
      defaultVehicleDocuments,
      defaultServiceReminders,
      defaultVehicleModifications,
    ).summary,
    monthlyFuelSummary: computeMonthlyFuelSummary(defaultFuelRefills),
    statusData: mockStatusData,
    categoryData: mockCategoryData,
    primaryVehicle: fallbackPrimary,
    error: null,
  }

  if (!isSupabaseConfigured || !supabase) {
    return fallbackPayload
  }

  // Check active user
  let user = activeUser
  if (!user) {
    try {
      const { data } = await supabase.auth.getUser()
      user = data?.user || null
    } catch {
      user = null
    }
  }

  // If no authenticated user, return guest demo fallback cleanly
  if (!user) {
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
      modsRes,
    ] = await Promise.all([
      supabase
        .from('vehicles')
        .select(
          'id, user_id, vehicle_code, name, brand, model, category, sub_type, engine_cc, top_speed, fuel_type, purchase_date, ex_showroom_price, plate, driver, status, mileage, fuel_level, last_service, next_service',
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
      supabase
        .from('vehicle_modifications')
        .select('*')
        .order('installed_date', { ascending: false })
        .order('created_at', { ascending: false }),
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

    let vehicleRows = vehiclesRes.data || []

    if (vehicleRows.length === 0 && user && !vehiclesRes.error) {
      const newVehicleCode = `VH-${user.id.slice(0, 6).toUpperCase()}`
      const starterVehicle = {
        user_id: user.id,
        vehicle_code: newVehicleCode,
        name: user.user_metadata?.vehicle_name || 'Enter Vehicle Name',
        brand: user.user_metadata?.vehicle_brand || 'None',
        model: user.user_metadata?.vehicle_model || 'None',
        category: 'Two Wheeler',
        sub_type: 'Bike',
        engine_cc: 0,
        top_speed: 0,
        fuel_type: 'None',
        plate: user.user_metadata?.vehicle_plate || 'None',
        driver:
          user.user_metadata?.full_name ||
          'None',
        status: 'Active',
        mileage: 0,
        fuel_level: 0,
        purchase_date: null,
      }

      const { data: createdVehicle } = await supabase
        .from('vehicles')
        .insert([starterVehicle])
        .select('*')
        .single()

      if (createdVehicle) {
        vehicleRows = [createdVehicle]

        const starterItems = defaultMaintenanceItems.map((item, idx) => ({
          user_id: user.id,
          vehicle_code: newVehicleCode,
          item_key: item.itemKey || item.key,
          label: item.label,
          interval_km: item.intervalKm || 1000,
          last_service_odo: 0,
          sort_order: idx + 1,
        }))
        await supabase.from('maintenance_items').insert(starterItems)
      }
    }

    const mappedVehicles = vehicleRows.map(mapVehicleRow)
    const effectiveTargetCode = targetVehicleCode || storedCode
    const primaryVehicle =
      mappedVehicles.find((v) => v.id === effectiveTargetCode) ||
      mappedVehicles[0] ||
      defaultVehicle
    const primaryCode = primaryVehicle.id

    if (typeof window !== 'undefined' && primaryVehicle.id) {
      try {
        localStorage.setItem('mkd_active_vehicle_code', primaryVehicle.id)
      } catch {
        // ignore storage errors
      }
    }

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

    const vehicles = mappedVehicles

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
          .sort(sortServiceReminders)
      : defaultServiceReminders.slice().sort(sortServiceReminders)

    const vehicleModifications = !modsRes.error
      ? (modsRes.data || [])
          .filter((m) => m.vehicle_code === primaryCode)
          .map(mapVehicleModificationRow)
      : defaultVehicleModifications

    const analytics = computeFleetAnalytics(
      vehicles,
      monthlyTrends.length > 0 ? monthlyTrends : mockMonthlyTrends,
      fuelRefills,
      maintenance,
      componentServiceLogs,
      vehicleRepairs,
      vehicleDocuments,
      serviceReminders,
      vehicleModifications,
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
      vehicleModifications,
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
      ? updates.subType || 'Sedan'
      : updates.subType || 'Bike'

  const mergedVehicle = {
    ...currentVehicle,
    name: updates.name ? updates.name.trim() : currentVehicle.name,
    brand: updates.brand ? updates.brand.trim() : currentVehicle.brand,
    model: updates.model ? updates.model.trim() : currentVehicle.model,
    category,
    subType,
    type: subType,
    engineCc: Math.max(0, Number(updates.engineCc) || 0),
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
    plate: updates.plate ? updates.plate.trim().toUpperCase() : currentVehicle.plate,
    driver: updates.driver ? updates.driver.trim() : (currentVehicle.driver || 'None'),
    purchaseDate:
      updates.purchaseDate !== undefined && updates.purchaseDate !== ''
        ? updates.purchaseDate
        : currentVehicle.purchaseDate || null,
    exShowroomPrice:
      updates.exShowroomPrice !== undefined && updates.exShowroomPrice !== ''
        ? Math.max(0, Number(updates.exShowroomPrice) || 0)
        : currentVehicle.exShowroomPrice || 0,
    status: updates.status || currentVehicle.status,
    fuelType: updates.fuelType || currentVehicle.fuelType || 'None',
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
      driver: mergedVehicle.driver,
      type: mergedVehicle.subType,
      status: mergedVehicle.status,
      fuel_type: mergedVehicle.fuelType,
      purchase_date: mergedVehicle.purchaseDate || null,
      ex_showroom_price: mergedVehicle.exShowroomPrice || 0,
      mileage: mergedVehicle.mileage,
      fuel_level: mergedVehicle.fuelLevel,
    })
    .eq('id', currentVehicle.dbId)
    .select(
      'id, vehicle_code, name, brand, model, category, sub_type, engine_cc, top_speed, fuel_type, purchase_date, ex_showroom_price, plate, driver, status, mileage, fuel_level, last_service, next_service',
    )
    .single()

  if (error) {
    throw new Error(error.message || 'Could not update vehicle in Supabase.')
  }

  return { vehicle: mapVehicleRow(data), savedToSupabase: true }
}

export async function createVehicleRecord(user, vehicleInput) {
  const category =
    vehicleInput.category === 'Four Wheeler' ? 'Four Wheeler' : 'Two Wheeler'
  const subType =
    category === 'Four Wheeler'
      ? vehicleInput.subType || 'Sedan'
      : vehicleInput.subType || 'Bike'

  const mockCode = `VH-${Date.now().toString(36).toUpperCase()}`

  if (!isSupabaseConfigured || !supabase || !user?.id) {
    const newVehicle = {
      ...defaultVehicle,
      id: mockCode,
      dbId: mockCode,
      userId: user?.id || null,
      name: vehicleInput.name?.trim() || 'Enter Vehicle Name',
      brand: vehicleInput.brand?.trim() || 'None',
      model: vehicleInput.model?.trim() || 'None',
      category,
      subType,
      type: subType,
      engineCc: Math.max(0, Number(vehicleInput.engineCc) || 0),
      topSpeed: Math.max(0, Number(vehicleInput.topSpeed) || 0),
      speed: Math.max(0, Number(vehicleInput.topSpeed) || 0),
      fuelType: vehicleInput.fuelType?.trim() || 'None',
      plate: vehicleInput.plate?.trim()?.toUpperCase() || 'None',
      driver: vehicleInput.driver?.trim() || 'None',
      status: vehicleInput.status || 'Active',
      mileage: Math.max(0, Number(vehicleInput.mileage) || 0),
      fuelLevel: Math.max(0, Number(vehicleInput.fuelLevel) || 0),
      purchaseDate:
        vehicleInput.purchaseDate && vehicleInput.purchaseDate !== 'DD-MM-YYYY'
          ? vehicleInput.purchaseDate
          : 'DD-MM-YYYY',
      exShowroomPrice: Math.max(0, Number(vehicleInput.exShowroomPrice) || 0),
      lastService: 'None',
      nextService: 'None',
    }
    return {
      vehicle: newVehicle,
      maintenanceItems: defaultMaintenanceItems,
      savedToSupabase: false,
    }
  }

  const newVehicleCode = `VH-${user.id.slice(0, 4).toUpperCase()}-${Date.now().toString(36).toUpperCase()}`
  const payload = {
    user_id: user.id,
    vehicle_code: newVehicleCode,
    name: vehicleInput.name?.trim() || 'Enter Vehicle Name',
    brand: vehicleInput.brand?.trim() || 'None',
    model: vehicleInput.model?.trim() || 'None',
    category,
    sub_type: subType,
    engine_cc: Math.max(0, Number(vehicleInput.engineCc) || 0),
    top_speed: Math.max(0, Number(vehicleInput.topSpeed) || 0),
    fuel_type: vehicleInput.fuelType?.trim() || 'None',
    plate: vehicleInput.plate?.trim()?.toUpperCase() || 'None',
    driver: vehicleInput.driver?.trim() || 'None',
    status: vehicleInput.status || 'Active',
    mileage: Math.max(0, Number(vehicleInput.mileage) || 0),
    fuel_level: Math.max(0, Number(vehicleInput.fuelLevel) || 0),
    purchase_date:
      vehicleInput.purchaseDate && vehicleInput.purchaseDate !== 'DD-MM-YYYY'
        ? vehicleInput.purchaseDate
        : null,
    ex_showroom_price: Math.max(0, Number(vehicleInput.exShowroomPrice) || 0),
  }

  const { data: createdVehicle, error } = await supabase
    .from('vehicles')
    .insert([payload])
    .select('*')
    .single()

  if (error) {
    throw new Error(error.message || 'Could not register new vehicle profile in Supabase.')
  }

  // Provision 18 default maintenance items for the new vehicle profile
  const starterItems = defaultMaintenanceItems.map((item, idx) => ({
    user_id: user.id,
    vehicle_code: newVehicleCode,
    item_key: item.itemKey || item.key,
    label: item.label,
    interval_km: item.intervalKm || 1000,
    last_service_odo: 0,
    sort_order: idx + 1,
  }))

  const { data: createdItems } = await supabase
    .from('maintenance_items')
    .insert(starterItems)
    .select('*')

  const mappedNewVehicle = mapVehicleRow(createdVehicle)
  const mappedItems = (createdItems || []).map(mapMaintenanceItemRow)

  return {
    vehicle: mappedNewVehicle,
    maintenanceItems:
      mappedItems.length > 0 ? mappedItems : defaultMaintenanceItems,
    savedToSupabase: true,
  }
}

export async function deleteVehicleRecord(vehicle) {
  if (!isSupabaseConfigured || !supabase || !vehicle) {
    return { success: true }
  }

  const { error } = await supabase
    .from('vehicles')
    .delete()
    .eq('vehicle_code', vehicle.id)

  if (error) {
    throw new Error(error.message || 'Could not delete vehicle profile from Supabase.')
  }

  return { success: true }
}

export async function resetAllDataRecord(user) {
  if (isSupabaseConfigured && supabase && user?.id) {
    // 1. Delete all user vehicles (which cascades and deletes all child records in PostgreSQL)
    const { error: delError } = await supabase
      .from('vehicles')
      .delete()
      .eq('user_id', user.id)

    if (delError) {
      console.warn('Error deleting user vehicles during reset:', delError.message)
    }

    // 2. Also ensure any user-specific records in child tables are clean
    await Promise.allSettled([
      supabase.from('fuel_refills').delete().eq('user_id', user.id),
      supabase.from('maintenance_items').delete().eq('user_id', user.id),
      supabase.from('service_reminders').delete().eq('user_id', user.id),
      supabase.from('component_service_logs').delete().eq('user_id', user.id),
      supabase.from('vehicle_repairs').delete().eq('user_id', user.id),
      supabase.from('vehicle_documents').delete().eq('user_id', user.id),
      supabase.from('vehicle_modifications').delete().eq('user_id', user.id),
    ])

    // 3. Provision a fresh, clean default vehicle profile
    const newVehicleCode = `VH-${user.id.slice(0, 4).toUpperCase()}-${Date.now().toString(36).toUpperCase()}`
    const payload = {
      user_id: user.id,
      vehicle_code: newVehicleCode,
      name: 'Enter Vehicle Name',
      brand: 'None',
      model: 'None',
      category: 'Two Wheeler',
      sub_type: 'Bike',
      engine_cc: 0,
      top_speed: 0,
      fuel_type: 'None',
      plate: 'None',
      driver: 'None',
      status: 'Active',
      mileage: 0,
      fuel_level: 0,
      purchase_date: null,
      ex_showroom_price: 0,
    }

    const { error: createError } = await supabase
      .from('vehicles')
      .insert([payload])
      .select('*')
      .single()

    if (createError) {
      console.warn('Error creating default vehicle after reset:', createError.message)
    }

    // 4. Provision standard 18 starter maintenance items
    const starterItems = defaultMaintenanceItems.map((item, idx) => ({
      user_id: user.id,
      vehicle_code: newVehicleCode,
      item_key: item.itemKey || item.key,
      label: item.label,
      interval_km: item.intervalKm || 1000,
      last_service_odo: 0,
      sort_order: idx + 1,
    }))

    await supabase.from('maintenance_items').insert(starterItems)

    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem('mkd_active_vehicle_code')
        localStorage.setItem('mkd_active_vehicle_code', newVehicleCode)
      } catch {
        // ignore
      }
    }

    return {
      success: true,
      vehicleCode: newVehicleCode,
    }
  }

  // Guest / Offline fallback: clean all local storage
  if (typeof window !== 'undefined') {
    try {
      localStorage.clear()
    } catch {
      // ignore
    }
  }

  return {
    success: true,
    vehicleCode: defaultVehicle.id,
  }
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

  const activeUserId = await getEffectiveUserId(currentVehicle)

  const { data: refillRow, error: refillError } = await supabase
    .from('fuel_refills')
    .insert([
      {
        ...(activeUserId ? { user_id: activeUserId } : {}),
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
    const activeUserId = await getEffectiveUserId(primaryVehicle)
    const { data: logData, error: logError } = await supabase
      .from('component_service_logs')
      .insert({
        ...(activeUserId ? { user_id: activeUserId } : {}),
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
    const activeUserId = await getEffectiveUserId(primaryVehicle)
    const { data, error } = await supabase
      .from('vehicle_repairs')
      .insert({
        ...(activeUserId ? { user_id: activeUserId } : {}),
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
    durationYears: Number(docInput.durationYears) || 1,
    expiryDate: docInput.expiryDate,
    maxOdometerKm: docInput.maxOdometerKm
      ? Number(docInput.maxOdometerKm)
      : null,
    amountPaid: Math.max(0, Number(docInput.amountPaid) || 0),
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

    const activeUserId = await getEffectiveUserId(primaryVehicle)

    if (isExisting) {
      const { data, error } = await supabase
        .from('vehicle_documents')
        .update({
          doc_type: localDoc.docType,
          title: localDoc.title,
          doc_number: localDoc.docNumber,
          issuer: localDoc.issuer,
          issue_date: localDoc.issueDate || null,
          duration_years: localDoc.durationYears,
          expiry_date: localDoc.expiryDate,
          max_odometer_km: localDoc.maxOdometerKm,
          amount_paid: localDoc.amountPaid,
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
          ...(activeUserId ? { user_id: activeUserId } : {}),
          vehicle_code: primaryVehicle.id || 'VH-001',
          doc_type: localDoc.docType,
          title: localDoc.title,
          doc_number: localDoc.docNumber,
          issuer: localDoc.issuer,
          issue_date: localDoc.issueDate || null,
          duration_years: localDoc.durationYears,
          expiry_date: localDoc.expiryDate,
          max_odometer_km: localDoc.maxOdometerKm,
          amount_paid: localDoc.amountPaid,
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
    dueDateFrom: reminderInput.dueDateFrom || '',
    durationDaysMin: reminderInput.durationDaysMin
      ? Number(reminderInput.durationDaysMin)
      : null,
    durationDaysMax: reminderInput.durationDaysMax
      ? Number(reminderInput.durationDaysMax)
      : null,
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
    const activeUserId = await getEffectiveUserId(primaryVehicle)
    const { data, error } = await supabase
      .from('service_reminders')
      .insert({
        ...(activeUserId ? { user_id: activeUserId } : {}),
        vehicle_code: primaryVehicle.id || 'VH-001',
        title: localReminder.title,
        service_type: localReminder.serviceType,
        due_date_from: localReminder.dueDateFrom || null,
        duration_days_min: localReminder.durationDaysMin,
        duration_days_max: localReminder.durationDaysMax,
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

export async function updateServiceReminderRecord(
  primaryVehicle,
  reminderId,
  updates,
) {
  const localUpdated = {
    id: reminderId,
    vehicleCode: primaryVehicle.id || 'VH-001',
    ...(updates.title !== undefined ? { title: updates.title.trim() } : {}),
    ...(updates.serviceType !== undefined ? { serviceType: updates.serviceType } : {}),
    ...(updates.dueDateFrom !== undefined ? { dueDateFrom: updates.dueDateFrom || '' } : {}),
    ...(updates.durationDaysMin !== undefined
      ? {
          durationDaysMin:
            updates.durationDaysMin !== null && updates.durationDaysMin !== ''
              ? Number(updates.durationDaysMin)
              : null,
        }
      : {}),
    ...(updates.durationDaysMax !== undefined
      ? {
          durationDaysMax:
            updates.durationDaysMax !== null && updates.durationDaysMax !== ''
              ? Number(updates.durationDaysMax)
              : null,
        }
      : {}),
    ...(updates.dueDate !== undefined ? { dueDate: updates.dueDate || '' } : {}),
    ...(updates.dueDateEnd !== undefined ? { dueDateEnd: updates.dueDateEnd || '' } : {}),
    ...(updates.dueOdometerKm !== undefined
      ? {
          dueOdometerKm:
            updates.dueOdometerKm !== null && updates.dueOdometerKm !== ''
              ? Number(updates.dueOdometerKm)
              : null,
        }
      : {}),
    ...(updates.dueOdometerMaxKm !== undefined
      ? {
          dueOdometerMaxKm:
            updates.dueOdometerMaxKm !== null && updates.dueOdometerMaxKm !== ''
              ? Number(updates.dueOdometerMaxKm)
              : null,
        }
      : {}),
    ...(updates.status !== undefined ? { status: updates.status } : {}),
    ...(updates.completedDate !== undefined
      ? { completedDate: updates.completedDate || '' }
      : {}),
    ...(updates.completedOdometerKm !== undefined
      ? {
          completedOdometerKm:
            updates.completedOdometerKm !== null && updates.completedOdometerKm !== ''
              ? Number(updates.completedOdometerKm)
              : null,
        }
      : {}),
    ...(updates.amountPaid !== undefined
      ? { amountPaid: Math.max(0, Number(updates.amountPaid) || 0) }
      : {}),
    ...(updates.serviceCenter !== undefined
      ? { serviceCenter: (updates.serviceCenter || '').trim() }
      : {}),
    ...(updates.invoiceNo !== undefined
      ? { invoiceNo: (updates.invoiceNo || '').trim() }
      : {}),
    ...(updates.notes !== undefined
      ? { notes: (updates.notes || '').trim() }
      : {}),
  }

  if (
    !isSupabaseConfigured ||
    !supabase ||
    String(reminderId).startsWith('REM-')
  ) {
    return { reminder: localUpdated, savedToSupabase: false }
  }

  try {
    const supabasePayload = {
      updated_at: new Date().toISOString(),
    }
    if (updates.title !== undefined) supabasePayload.title = updates.title.trim()
    if (updates.serviceType !== undefined) {
      supabasePayload.service_type = updates.serviceType
    }
    if (updates.dueDateFrom !== undefined) {
      supabasePayload.due_date_from = updates.dueDateFrom || null
    }
    if (updates.durationDaysMin !== undefined) {
      supabasePayload.duration_days_min =
        updates.durationDaysMin !== null && updates.durationDaysMin !== ''
          ? Number(updates.durationDaysMin)
          : null
    }
    if (updates.durationDaysMax !== undefined) {
      supabasePayload.duration_days_max =
        updates.durationDaysMax !== null && updates.durationDaysMax !== ''
          ? Number(updates.durationDaysMax)
          : null
    }
    if (updates.dueDate !== undefined) {
      supabasePayload.due_date = updates.dueDate || null
    }
    if (updates.dueDateEnd !== undefined) {
      supabasePayload.due_date_end = updates.dueDateEnd || null
    }
    if (updates.dueOdometerKm !== undefined) {
      supabasePayload.due_odometer_km =
        updates.dueOdometerKm !== null && updates.dueOdometerKm !== ''
          ? Number(updates.dueOdometerKm)
          : null
    }
    if (updates.dueOdometerMaxKm !== undefined) {
      supabasePayload.due_odometer_max_km =
        updates.dueOdometerMaxKm !== null && updates.dueOdometerMaxKm !== ''
          ? Number(updates.dueOdometerMaxKm)
          : null
    }
    if (updates.status !== undefined) supabasePayload.status = updates.status
    if (updates.completedDate !== undefined) {
      supabasePayload.completed_date = updates.completedDate || null
    }
    if (updates.completedOdometerKm !== undefined) {
      supabasePayload.completed_odometer_km =
        updates.completedOdometerKm !== null && updates.completedOdometerKm !== ''
          ? Number(updates.completedOdometerKm)
          : null
    }
    if (updates.amountPaid !== undefined) {
      supabasePayload.amount_paid = Math.max(0, Number(updates.amountPaid) || 0)
    }
    if (updates.serviceCenter !== undefined) {
      supabasePayload.service_center = (updates.serviceCenter || '').trim()
    }
    if (updates.invoiceNo !== undefined) {
      supabasePayload.invoice_no = (updates.invoiceNo || '').trim()
    }
    if (updates.notes !== undefined) {
      supabasePayload.notes = (updates.notes || '').trim()
    }

    const { data, error } = await supabase
      .from('service_reminders')
      .update(supabasePayload)
      .eq('id', reminderId)
      .select('*')
      .single()

    if (error) {
      console.warn('Failed to update service reminder in Supabase:', error.message)
      return { reminder: localUpdated, savedToSupabase: false }
    }

    return {
      reminder: mapServiceReminderRow(data),
      savedToSupabase: true,
    }
  } catch (err) {
    console.error('Error in updateServiceReminderRecord:', err)
    return { reminder: localUpdated, savedToSupabase: false }
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

export async function createVehicleModificationRecord(
  primaryVehicle,
  modInput,
) {
  const localMod = {
    id: `MOD-${Date.now()}`,
    vehicleCode: primaryVehicle.id || 'VH-001',
    title: (modInput.title || '').trim() || 'Accessory / Mod',
    category: modInput.category || 'Accessory',
    brand: (modInput.brand || '').trim(),
    installedDate:
      modInput.installedDate || new Date().toISOString().slice(0, 10),
    odometerKm:
      modInput.odometerKm !== null &&
      modInput.odometerKm !== '' &&
      modInput.odometerKm !== undefined
        ? Number(modInput.odometerKm)
        : null,
    cost: Math.max(0, Number(modInput.cost) || 0),
    installedBy: modInput.installedBy || 'Self',
    status: modInput.status || 'Installed',
    notes: (modInput.notes || '').trim(),
    createdAt: new Date().toISOString(),
  }

  if (!isSupabaseConfigured || !supabase) {
    return { modification: localMod, savedToSupabase: false }
  }

  try {
    const activeUserId = await getEffectiveUserId(primaryVehicle)
    const { data, error } = await supabase
      .from('vehicle_modifications')
      .insert({
        ...(activeUserId ? { user_id: activeUserId } : {}),
        vehicle_code: primaryVehicle.id || 'VH-001',
        title: localMod.title,
        category: localMod.category,
        brand: localMod.brand || null,
        installed_date: localMod.installedDate || null,
        odometer_km: localMod.odometerKm,
        cost: localMod.cost,
        installed_by: localMod.installedBy || 'Self',
        status: localMod.status,
        notes: localMod.notes || null,
      })
      .select('*')
      .single()

    if (error) {
      console.warn(
        'Failed to insert vehicle modification to Supabase:',
        error.message,
      )
      return { modification: localMod, savedToSupabase: false }
    }

    return {
      modification: mapVehicleModificationRow(data),
      savedToSupabase: true,
    }
  } catch (err) {
    console.error('Error in createVehicleModificationRecord:', err)
    return { modification: localMod, savedToSupabase: false }
  }
}

export async function updateVehicleModificationRecord(
  primaryVehicle,
  modId,
  updates,
) {
  const localUpdated = {
    id: modId,
    ...(updates.title !== undefined ? { title: updates.title.trim() } : {}),
    ...(updates.category !== undefined ? { category: updates.category } : {}),
    ...(updates.brand !== undefined
      ? { brand: (updates.brand || '').trim() }
      : {}),
    ...(updates.installedDate !== undefined
      ? { installedDate: updates.installedDate || '' }
      : {}),
    ...(updates.odometerKm !== undefined
      ? {
          odometerKm:
            updates.odometerKm !== null &&
            updates.odometerKm !== '' &&
            updates.odometerKm !== undefined
              ? Number(updates.odometerKm)
              : null,
        }
      : {}),
    ...(updates.cost !== undefined
      ? { cost: Math.max(0, Number(updates.cost) || 0) }
      : {}),
    ...(updates.installedBy !== undefined
      ? { installedBy: updates.installedBy || 'Self' }
      : {}),
    ...(updates.status !== undefined ? { status: updates.status } : {}),
    ...(updates.notes !== undefined
      ? { notes: (updates.notes || '').trim() }
      : {}),
  }

  if (
    !isSupabaseConfigured ||
    !supabase ||
    String(modId).startsWith('MOD-')
  ) {
    return { modification: localUpdated, savedToSupabase: false }
  }

  try {
    const supabasePayload = {
      updated_at: new Date().toISOString(),
    }
    if (updates.title !== undefined) supabasePayload.title = updates.title.trim()
    if (updates.category !== undefined) {
      supabasePayload.category = updates.category
    }
    if (updates.brand !== undefined) {
      supabasePayload.brand = (updates.brand || '').trim() || null
    }
    if (updates.installedDate !== undefined) {
      supabasePayload.installed_date = updates.installedDate || null
    }
    if (updates.odometerKm !== undefined) {
      supabasePayload.odometer_km =
        updates.odometerKm !== null &&
        updates.odometerKm !== '' &&
        updates.odometerKm !== undefined
          ? Number(updates.odometerKm)
          : null
    }
    if (updates.cost !== undefined) {
      supabasePayload.cost = Math.max(0, Number(updates.cost) || 0)
    }
    if (updates.installedBy !== undefined) {
      supabasePayload.installed_by = updates.installedBy || 'Self'
    }
    if (updates.status !== undefined) {
      supabasePayload.status = updates.status
    }
    if (updates.notes !== undefined) {
      supabasePayload.notes = (updates.notes || '').trim() || null
    }

    const { data, error } = await supabase
      .from('vehicle_modifications')
      .update(supabasePayload)
      .eq('id', modId)
      .select('*')
      .single()

    if (error) {
      console.warn(
        'Failed to update vehicle modification in Supabase:',
        error.message,
      )
      return { modification: localUpdated, savedToSupabase: false }
    }

    return {
      modification: mapVehicleModificationRow(data),
      savedToSupabase: true,
    }
  } catch (err) {
    console.error('Error in updateVehicleModificationRecord:', err)
    return { modification: localUpdated, savedToSupabase: false }
  }
}

export async function deleteVehicleModificationRecord(primaryVehicle, modId) {
  if (
    !isSupabaseConfigured ||
    !supabase ||
    String(modId).startsWith('MOD-')
  ) {
    return { success: true }
  }

  try {
    await supabase.from('vehicle_modifications').delete().eq('id', modId)
    return { success: true }
  } catch (err) {
    console.error('Error in deleteVehicleModificationRecord:', err)
    return { success: false }
  }
}

/**
 * Computes the latest fuel mileage (km/L) from the most recent refills.
 * Prioritizes tank-to-tank intervals (Full Tank -> Full Tank),
 * followed by full tank spans across intermediate refills,
 * or the most recent trip ratio.
 */
export function computeLatestFuelMileage(fuelRefills = []) {
  if (!fuelRefills || fuelRefills.length < 2) return 0

  const list = [...fuelRefills].sort((a, b) => {
    const dateA = String(a.refillDate || '')
    const dateB = String(b.refillDate || '')
    if (dateA !== dateB) return dateA.localeCompare(dateB)
    return (Number(a.odometerKm) || 0) - (Number(b.odometerKm) || 0)
  })

  if (list.length < 2) return 0

  // 1. Check from newest backwards for direct Full Tank -> Full Tank interval
  for (let i = list.length - 1; i >= 1; i--) {
    const curr = list[i]
    const prev = list[i - 1]
    const currOdo = Number(curr.odometerKm) || 0
    const prevOdo = Number(prev.odometerKm) || 0
    const tripDistance = Math.max(0, currOdo - prevOdo)
    const liters = Number(curr.liters) || 0

    if (
      curr.fuelFillType === 'Full Tank' &&
      prev.fuelFillType === 'Full Tank' &&
      tripDistance > 0 &&
      liters > 0
    ) {
      return Number((tripDistance / liters).toFixed(2))
    }
  }

  // 2. Check for Full Tank spanning across partial top-ups
  for (let i = list.length - 1; i >= 1; i--) {
    if (list[i].fuelFillType === 'Full Tank') {
      let spanLiters = 0
      for (let k = i; k >= 1; k--) {
        spanLiters += Number(list[k].liters) || 0
        if (list[k - 1].fuelFillType === 'Full Tank') {
          const spanDist =
            (Number(list[i].odometerKm) || 0) -
            (Number(list[k - 1].odometerKm) || 0)
          if (spanDist > 0 && spanLiters > 0) {
            return Number((spanDist / spanLiters).toFixed(2))
          }
        }
      }
    }
  }

  // 3. Fallback: most recent trip ratio with distance > 0 and liters > 0
  for (let i = list.length - 1; i >= 1; i--) {
    const curr = list[i]
    const prev = list[i - 1]
    const currOdo = Number(curr.odometerKm) || 0
    const prevOdo = Number(prev.odometerKm) || 0
    const tripDistance = Math.max(0, currOdo - prevOdo)
    const liters = Number(curr.liters) || 0

    if (tripDistance > 0 && liters > 0) {
      return Number((tripDistance / liters).toFixed(2))
    }
  }

  return 0
}

/**
 * Computes latest running fuel cost per kilometer (₹/km).
 * Prioritizes direct full tank intervals, multi-fill spans, or most recent trip interval.
 */
export function computeLatestCostPerKm(fuelRefills = []) {
  if (!fuelRefills || fuelRefills.length < 2) return 0

  const list = [...fuelRefills].sort((a, b) => {
    const dateA = String(a.refillDate || '')
    const dateB = String(b.refillDate || '')
    if (dateA !== dateB) return dateA.localeCompare(dateB)
    return (Number(a.odometerKm) || 0) - (Number(b.odometerKm) || 0)
  })

  if (list.length < 2) return 0

  // 1. Direct Full Tank -> Full Tank interval
  for (let i = list.length - 1; i >= 1; i--) {
    const curr = list[i]
    const prev = list[i - 1]
    const currOdo = Number(curr.odometerKm) || 0
    const prevOdo = Number(prev.odometerKm) || 0
    const tripDistance = Math.max(0, currOdo - prevOdo)
    const amountSpent = Number(curr.amountSpent) || 0

    if (
      curr.fuelFillType === 'Full Tank' &&
      prev.fuelFillType === 'Full Tank' &&
      tripDistance > 0 &&
      amountSpent > 0
    ) {
      return Number((amountSpent / tripDistance).toFixed(2))
    }
  }

  // 2. Full Tank spanning across partial top-ups
  for (let i = list.length - 1; i >= 1; i--) {
    if (list[i].fuelFillType === 'Full Tank') {
      let spanSpend = 0
      for (let k = i; k >= 1; k--) {
        spanSpend += Number(list[k].amountSpent) || 0
        if (list[k - 1].fuelFillType === 'Full Tank') {
          const spanDist =
            (Number(list[i].odometerKm) || 0) -
            (Number(list[k - 1].odometerKm) || 0)
          if (spanDist > 0 && spanSpend > 0) {
            return Number((spanSpend / spanDist).toFixed(2))
          }
        }
      }
    }
  }

  // 3. Fallback: most recent trip ratio
  for (let i = list.length - 1; i >= 1; i--) {
    const curr = list[i]
    const prev = list[i - 1]
    const currOdo = Number(curr.odometerKm) || 0
    const prevOdo = Number(prev.odometerKm) || 0
    const tripDistance = Math.max(0, currOdo - prevOdo)
    const amountSpent = Number(curr.amountSpent) || 0

    if (tripDistance > 0 && amountSpent > 0) {
      return Number((amountSpent / tripDistance).toFixed(2))
    }
  }

  // 4. Overall fleet fallback across all refills
  let totalDist = 0
  let totalSpend = 0
  for (let i = 1; i < list.length; i++) {
    const d = Math.max(
      0,
      (Number(list[i].odometerKm) || 0) - (Number(list[i - 1].odometerKm) || 0),
    )
    totalDist += d
    totalSpend += Number(list[i].amountSpent) || 0
  }

  if (totalDist > 0 && totalSpend > 0) {
    return Number((totalSpend / totalDist).toFixed(2))
  }

  return 0
}
