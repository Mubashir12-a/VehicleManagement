export const defaultVehicle = {
  id: 'VH-001',
  name: 'Enter Vehicle Name',
  brand: 'None',
  model: 'None',
  category: 'Two Wheeler',
  subType: 'Bike',
  engineCc: 0,
  fuelType: 'None',
  plate: 'None',
  driver: 'None',
  status: 'Active',
  purchaseDate: 'DD-MM-YYYY',
  exShowroomPrice: 0,
  mileage: 0,
  topSpeed: 0,
  speed: 0,
  fuelLevel: 0,
  lastService: 'None',
  nextService: 'None',
}

export const vehiclesList = [defaultVehicle]

export const defaultFuelRefills = []

export const defaultMaintenanceItems = [
  {
    id: 'MI-1',
    itemKey: 'engine_oil',
    label: 'Engine Oil',
    category: 'Fluids & Engine',
    intervalKm: 3000,
    lastServiceOdo: 0,
    sortOrder: 1,
  },
  {
    id: 'MI-2',
    itemKey: 'chain_lube',
    label: 'Chain Lube',
    category: 'Drivetrain',
    intervalKm: 500,
    lastServiceOdo: 0,
    sortOrder: 2,
  },
  {
    id: 'MI-3',
    itemKey: 'air_filter',
    label: 'Air Filter',
    category: 'Fluids & Engine',
    intervalKm: 6000,
    lastServiceOdo: 0,
    sortOrder: 3,
  },
  {
    id: 'MI-4',
    itemKey: 'front_tyre',
    label: 'Front Tyre Health',
    category: 'Tyres & Wheels',
    intervalKm: 20000,
    lastServiceOdo: 0,
    sortOrder: 4,
  },
  {
    id: 'MI-5',
    itemKey: 'rear_tyre',
    label: 'Rear Tyre Health',
    category: 'Tyres & Wheels',
    intervalKm: 15000,
    lastServiceOdo: 0,
    sortOrder: 5,
  },
  {
    id: 'MI-6',
    itemKey: 'battery',
    label: 'Battery Health',
    category: 'Electrical',
    intervalKm: 25000,
    lastServiceOdo: 0,
    sortOrder: 6,
  },
  {
    id: 'MI-7',
    itemKey: 'brake_front',
    label: 'Brake Pads Front',
    category: 'Brakes',
    intervalKm: 10000,
    lastServiceOdo: 0,
    sortOrder: 7,
  },
  {
    id: 'MI-8',
    itemKey: 'brake_rear',
    label: 'Brake Pads Rear',
    category: 'Brakes',
    intervalKm: 10000,
    lastServiceOdo: 0,
    sortOrder: 8,
  },
  {
    id: 'MI-9',
    itemKey: 'clutch_plate',
    label: 'Clutch Plate',
    category: 'Drivetrain',
    intervalKm: 25000,
    lastServiceOdo: 0,
    sortOrder: 9,
  },
  {
    id: 'MI-10',
    itemKey: 'spark_plug',
    label: 'Spark Plug',
    category: 'Electrical',
    intervalKm: 12000,
    lastServiceOdo: 0,
    sortOrder: 10,
  },
  {
    id: 'MI-11',
    itemKey: 'coolant',
    label: 'Coolant',
    category: 'Fluids & Engine',
    intervalKm: 15000,
    lastServiceOdo: 0,
    sortOrder: 11,
  },
  {
    id: 'MI-12',
    itemKey: 'chain_replacement',
    label: 'Chain Replacement',
    category: 'Drivetrain',
    intervalKm: 20000,
    lastServiceOdo: 0,
    sortOrder: 12,
  },
  {
    id: 'MI-13',
    itemKey: 'sprocket_replacement',
    label: 'Sprocket Replacement',
    category: 'Drivetrain',
    intervalKm: 20000,
    lastServiceOdo: 0,
    sortOrder: 13,
  },
  {
    id: 'MI-14',
    itemKey: 'brake_fluid_front',
    label: 'Brake Fluid Front',
    category: 'Brakes',
    intervalKm: 15000,
    lastServiceOdo: 0,
    sortOrder: 14,
  },
  {
    id: 'MI-15',
    itemKey: 'brake_fluid_rear',
    label: 'Brake Fluid Rear',
    category: 'Brakes',
    intervalKm: 15000,
    lastServiceOdo: 0,
    sortOrder: 15,
  },
  {
    id: 'MI-16',
    itemKey: 'fork_oil_front',
    label: 'Front Fork Oil Replacement',
    category: 'Suspension',
    intervalKm: 15000,
    lastServiceOdo: 0,
    sortOrder: 16,
  },
  {
    id: 'MI-17',
    itemKey: 'rear_suspension',
    label: 'Rear Suspension Replacement',
    category: 'Suspension',
    intervalKm: 30000,
    lastServiceOdo: 0,
    sortOrder: 17,
  },
  {
    id: 'MI-18',
    itemKey: 'washing',
    label: 'Washing & Detailing',
    category: 'Cleaning',
    intervalKm: 500,
    lastServiceOdo: 0,
    sortOrder: 18,
  },
]

export const defaultComponentServiceLogs = []

export const defaultVehicleRepairs = []

export const defaultVehicleDocuments = []

export const defaultServiceReminders = []

export const defaultVehicleModifications = []

export const fleetSummary = {
  totalVehicles: 1,
  activeVehicles: 1,
  inMaintenance: 0,
  idleVehicles: 0,
  outOfService: 0,
  monthlyFuelSpend: 0,
  monthlyMileage: 0,
  fleetUtilization: 0,
  totalModificationsSpend: 0,
  totalSpendTillNow: 0,
}

export const fleetStatusData = [
  { name: 'Active', value: 1, color: '#a3e635' },
  { name: 'Maintenance', value: 0, color: '#f59e0b' },
  { name: 'Idle', value: 0, color: '#71717a' },
  { name: 'Out of Service', value: 0, color: '#f43f5e' },
]

export const monthlyFleetTrends = []

export const vehicleCategoryData = [
  { category: 'Two Wheeler', active: 1, total: 1 },
  { category: 'Four Wheeler', active: 0, total: 0 },
]

export const maintenanceSchedule = []
