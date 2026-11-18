export const defaultVehicle = {
  id: 'VH-001',
  name: 'Pulsar',
  brand: 'Bajaj Auto',
  model: 'NS400z',
  category: 'Two Wheeler',
  subType: 'Bike',
  engineCc: 373,
  plate: 'MH-14-JH-4001',
  driver: 'Owner',
  status: 'Active',
  mileage: 150,
  topSpeed: 150,
  speed: 150,
  fuelLevel: 100,
  lastService: '2026-10-12',
  nextService: '2026-12-15',
}

export const vehiclesList = [defaultVehicle]

export const defaultFuelRefills = [
  {
    id: 'RF-003',
    vehicleCode: 'VH-001',
    refillDate: '2026-11-18',
    odometerKm: 150,
    liters: 12.0,
    pricePerLiter: 105.5,
    amountSpent: 1266.0,
    fuelLevelAfter: 100,
    fuelFillType: 'Full Tank',
    stationName: 'IndianOil COCO',
    location: 'Senapati Bapat Rd',
    notes: 'Full tank before highway ride',
  },
  {
    id: 'RF-002',
    vehicleCode: 'VH-001',
    refillDate: '2026-11-06',
    odometerKm: 115,
    liters: 10.0,
    pricePerLiter: 104.8,
    amountSpent: 1048.0,
    fuelLevelAfter: 95,
    fuelFillType: 'Full Tank',
    stationName: 'HP Auto Care',
    location: 'Baner Road',
    notes: 'Regular weekend top-up',
  },
  {
    id: 'RF-001',
    vehicleCode: 'VH-001',
    refillDate: '2026-10-24',
    odometerKm: 80,
    liters: 8.5,
    pricePerLiter: 104.2,
    amountSpent: 885.7,
    fuelLevelAfter: 75,
    fuelFillType: 'Partial / Reserve',
    stationName: 'Bharat Petroleum',
    location: 'Pune Nagar Rd',
    notes: 'Reserve fill after delivery',
  },
]

export const defaultMaintenanceItems = [
  {
    id: 'MI-1',
    itemKey: 'engine_oil',
    label: 'Engine Oil Change',
    intervalKm: 3000,
    lastServiceOdo: 0,
    sortOrder: 1,
  },
  {
    id: 'MI-2',
    itemKey: 'coolant',
    label: 'Coolant',
    intervalKm: 15000,
    lastServiceOdo: 0,
    sortOrder: 2,
  },
  {
    id: 'MI-3',
    itemKey: 'chain_lube',
    label: 'Chain Lube',
    intervalKm: 500,
    lastServiceOdo: 0,
    sortOrder: 3,
  },
  {
    id: 'MI-4',
    itemKey: 'air_filter',
    label: 'Air Filter',
    intervalKm: 6000,
    lastServiceOdo: 0,
    sortOrder: 4,
  },
  {
    id: 'MI-5',
    itemKey: 'front_tyre',
    label: 'Front Tyre',
    intervalKm: 20000,
    lastServiceOdo: 0,
    sortOrder: 5,
  },
  {
    id: 'MI-6',
    itemKey: 'rear_tyre',
    label: 'Rear Tyre',
    intervalKm: 15000,
    lastServiceOdo: 0,
    sortOrder: 6,
  },
  {
    id: 'MI-7',
    itemKey: 'battery',
    label: 'Battery',
    intervalKm: 25000,
    lastServiceOdo: 0,
    sortOrder: 7,
  },
  {
    id: 'MI-8',
    itemKey: 'brake_front',
    label: 'Brake Front',
    intervalKm: 10000,
    lastServiceOdo: 0,
    sortOrder: 8,
  },
  {
    id: 'MI-9',
    itemKey: 'brake_rear',
    label: 'Brake Rear',
    intervalKm: 10000,
    lastServiceOdo: 0,
    sortOrder: 9,
  },
]

export const fleetSummary = {
  totalVehicles: 1,
  activeVehicles: 1,
  inMaintenance: 0,
  idleVehicles: 0,
  outOfService: 0,
  monthlyFuelSpend: 2314,
  monthlyMileage: 70,
  fleetUtilization: 100,
  totalSpendTillNow: 3199.7,
}

export const fleetStatusData = [
  { name: 'Active', value: 1, color: '#a3e635' },
  { name: 'Maintenance', value: 0, color: '#f59e0b' },
  { name: 'Idle', value: 0, color: '#71717a' },
  { name: 'Out of Service', value: 0, color: '#f43f5e' },
]

export const monthlyFleetTrends = [
  { month: 'Jun', mileage: 0, fuelCost: 0, maintenanceCost: 0 },
  { month: 'Jul', mileage: 0, fuelCost: 0, maintenanceCost: 0 },
  { month: 'Aug', mileage: 0, fuelCost: 0, maintenanceCost: 0 },
  { month: 'Sep', mileage: 0, fuelCost: 0, maintenanceCost: 0 },
  { month: 'Oct', mileage: 80, fuelCost: 885.7, maintenanceCost: 0 },
  { month: 'Nov', mileage: 70, fuelCost: 2314.0, maintenanceCost: 0 },
]

export const vehicleCategoryData = [
  { category: 'Two Wheeler', active: 1, total: 1 },
  { category: 'Four Wheeler', active: 0, total: 0 },
]

export const maintenanceSchedule = [
  {
    id: 'MNT-101',
    vehicleId: 'VH-001',
    vehicleName: 'Bajaj Pulsar NS400z',
    serviceType: 'First Free Inspection & Oil Check',
    dueDate: '2026-12-15',
    estimatedCost: 0,
    priority: 'Medium',
    status: 'Scheduled',
  },
  {
    id: 'MNT-102',
    vehicleId: 'VH-001',
    vehicleName: 'Bajaj Pulsar NS400z',
    serviceType: 'Chain Cleaning & Lube',
    dueDate: '2026-11-30',
    estimatedCost: 150,
    priority: 'Low',
    status: 'Scheduled',
  },
]
