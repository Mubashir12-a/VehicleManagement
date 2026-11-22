export const VEHICLE_CATEGORIES = ['Two Wheeler', 'Four Wheeler']

export const TWO_WHEELER_SUBTYPES = [
  'Bike',
  'Scooter',
  'Sports Bike',
  'Cafe Racer',
  'Superbike',
]

export const FOUR_WHEELER_SUBTYPES = [
  'Sedan',
  'Hatchback',
  'Compact SUV',
  'SUV',
  'Sports Car',
  'Pickup Truck',
]

export const ILLUSTRATION_TIERS = [
  {
    key: 'ns400z',
    category: 'Two Wheeler',
    subType: 'Bike',
    label: 'Streetfighter (NS400z)',
    rule: 'Naked Streetfighter / Pulsar NS400z',
    sampleCc: 373,
    imageSrc: '/illustrations/ns400z.png',
    badgeColor: 'bg-lime-50 text-lime-700 ring-lime-600/20',
  },
  {
    key: 'scooter',
    category: 'Two Wheeler',
    subType: 'Scooter',
    label: 'Modern Scooter',
    rule: 'All Two-Wheeler Scooters',
    sampleCc: 110,
    imageSrc: '/illustrations/scooter.png',
    badgeColor: 'bg-teal-50 text-teal-700 ring-teal-600/20',
  },
  {
    key: 'sports_bike',
    category: 'Two Wheeler',
    subType: 'Sports Bike',
    label: 'Super Sport Bike',
    rule: 'Fully Faired Aerodynamic Replica',
    sampleCc: 399,
    imageSrc: '/illustrations/sports_bike.png',
    badgeColor: 'bg-rose-50 text-rose-700 ring-rose-600/20',
  },
  {
    key: 'cafe_racer',
    category: 'Two Wheeler',
    subType: 'Cafe Racer',
    label: 'Classic / Cafe Racer',
    rule: 'Retro Round Headlight / Cruiser',
    sampleCc: 350,
    imageSrc: '/illustrations/cafe_racer.png',
    badgeColor: 'bg-amber-50 text-amber-700 ring-amber-600/20',
  },
  {
    key: 'super_bike',
    category: 'Two Wheeler',
    subType: 'Superbike',
    label: 'Heavy Superbike',
    rule: 'Multi-Cylinder Heavy Streetfighter',
    sampleCc: 900,
    imageSrc: '/illustrations/super_bike.png',
    badgeColor: 'bg-purple-50 text-purple-700 ring-purple-600/20',
  },
  {
    key: 'normal_bike',
    category: 'Two Wheeler',
    subType: 'Bike',
    label: 'Normal Bike',
    rule: 'Two-Wheeler Commuter Bike',
    sampleCc: 155,
    imageSrc: '/illustrations/normal_bike.png',
    badgeColor: 'bg-blue-50 text-blue-700 ring-blue-600/20',
  },
  {
    key: 'sedan',
    category: 'Four Wheeler',
    subType: 'Sedan',
    label: 'Executive Sedan',
    rule: 'Notchback Sedan / Saloon',
    sampleCc: 1498,
    imageSrc: '/illustrations/sedan.png',
    badgeColor: 'bg-blue-50 text-blue-700 ring-blue-600/20',
  },
  {
    key: 'hatchback',
    category: 'Four Wheeler',
    subType: 'Hatchback',
    label: 'Sport Hatchback',
    rule: 'Hot Hatch / 5-Door Compact',
    sampleCc: 1197,
    imageSrc: '/illustrations/hatchback.png',
    badgeColor: 'bg-lime-50 text-lime-700 ring-lime-600/20',
  },
  {
    key: 'compact_suv',
    category: 'Four Wheeler',
    subType: 'Compact SUV',
    label: 'Compact SUV / Crossover',
    rule: 'Urban Crossover & Compact SUV',
    sampleCc: 1497,
    imageSrc: '/illustrations/compact_suv.png',
    badgeColor: 'bg-teal-50 text-teal-700 ring-teal-600/20',
  },
  {
    key: 'suv',
    category: 'Four Wheeler',
    subType: 'SUV',
    label: 'Full-Size SUV',
    rule: 'Rugged 4x4 / Full-Size SUV',
    sampleCc: 2755,
    imageSrc: '/illustrations/suv.png',
    badgeColor: 'bg-amber-50 text-amber-700 ring-amber-600/20',
  },
  {
    key: 'sports_car',
    category: 'Four Wheeler',
    subType: 'Sports Car',
    label: 'Performance Sports Coupe',
    rule: 'Aero GT / Track Supercar',
    sampleCc: 2998,
    imageSrc: '/illustrations/sports_car.png',
    badgeColor: 'bg-rose-50 text-rose-700 ring-rose-600/20',
  },
  {
    key: 'pickup',
    category: 'Four Wheeler',
    subType: 'Pickup Truck',
    label: 'Utility Pickup Truck',
    rule: 'Dual-Cab Cargo Bed 4x4',
    sampleCc: 2393,
    imageSrc: '/illustrations/pickup.png',
    badgeColor: 'bg-purple-50 text-purple-700 ring-purple-600/20',
  },
]

export function resolveVehicleVisual({ category, subType, engineCc, model }) {
  const cc = Number(engineCc) || 0
  const m = String(model || '').toLowerCase()
  const st = String(subType || '').toLowerCase()

  if (category === 'Four Wheeler') {
    if (
      st === 'hatchback' ||
      st.includes('hatch') ||
      m.includes('hatch') ||
      m.includes('swift') ||
      m.includes('i20') ||
      m.includes('polo') ||
      m.includes('baleno') ||
      m.includes('golf') ||
      m.includes('tiago') ||
      m.includes('altroz')
    ) {
      return ILLUSTRATION_TIERS.find((t) => t.key === 'hatchback')
    }

    if (
      st === 'pickup truck' ||
      st.includes('pickup') ||
      st.includes('truck') ||
      m.includes('pickup') ||
      m.includes('truck') ||
      m.includes('hilux') ||
      m.includes('d-max') ||
      m.includes('isuzu') ||
      m.includes('f-150') ||
      m.includes('ranger')
    ) {
      return ILLUSTRATION_TIERS.find((t) => t.key === 'pickup')
    }

    if (
      st === 'compact suv' ||
      st.includes('compact') ||
      st.includes('cross') ||
      m.includes('brezza') ||
      m.includes('creta') ||
      m.includes('seltos') ||
      m.includes('nexon') ||
      m.includes('venue') ||
      m.includes('kiger') ||
      m.includes('magnite') ||
      m.includes('sonet') ||
      m.includes('fronx') ||
      m.includes('taigun') ||
      m.includes('kushaq')
    ) {
      return ILLUSTRATION_TIERS.find((t) => t.key === 'compact_suv')
    }

    if (
      st === 'sports car' ||
      st.includes('sport') ||
      st.includes('coupe') ||
      st.includes('gt') ||
      m.includes('supra') ||
      m.includes('mustang') ||
      m.includes('porsche') ||
      m.includes('ferrari') ||
      m.includes('lamborghini') ||
      m.includes('corvette') ||
      m.includes('m4') ||
      m.includes('m3') ||
      m.includes('amg') ||
      m.includes('gtr') ||
      m.includes('gt-r')
    ) {
      return ILLUSTRATION_TIERS.find((t) => t.key === 'sports_car')
    }

    if (
      st === 'suv' ||
      st.includes('suv') ||
      m.includes('suv') ||
      m.includes('thar') ||
      m.includes('fortuner') ||
      m.includes('scorpio') ||
      m.includes('harrier') ||
      m.includes('safari') ||
      m.includes('defender') ||
      m.includes('land cruiser') ||
      m.includes('xuv') ||
      m.includes('endeavour')
    ) {
      return ILLUSTRATION_TIERS.find((t) => t.key === 'suv')
    }

    if (
      st === 'sedan' ||
      st.includes('sedan') ||
      m.includes('sedan') ||
      m.includes('city') ||
      m.includes('verna') ||
      m.includes('dzire') ||
      m.includes('ciaz') ||
      m.includes('civic') ||
      m.includes('octavia') ||
      m.includes('virtus') ||
      m.includes('slavia') ||
      m.includes('aura') ||
      m.includes('amaze') ||
      m.includes('camry')
    ) {
      return ILLUSTRATION_TIERS.find((t) => t.key === 'sedan')
    }

    // Default Four Wheeler if not specified
    return (
      ILLUSTRATION_TIERS.find((t) => t.key === 'sedan') ||
      ILLUSTRATION_TIERS.find((t) => t.category === 'Four Wheeler')
    )
  }

  // Two Wheeler
  if (subType === 'Scooter') {
    return ILLUSTRATION_TIERS.find((t) => t.key === 'scooter')
  }
  if (
    subType === 'Sports Bike' ||
    m.includes('rc') ||
    m.includes('ninja') ||
    m.includes('r15') ||
    m.includes('sport')
  ) {
    return ILLUSTRATION_TIERS.find((t) => t.key === 'sports_bike')
  }
  if (
    subType === 'Cafe Racer' ||
    m.includes('bullet') ||
    m.includes('classic') ||
    m.includes('hunter') ||
    m.includes('continental') ||
    m.includes('cruiser')
  ) {
    return ILLUSTRATION_TIERS.find((t) => t.key === 'cafe_racer')
  }
  if (subType === 'Superbike' || cc > 650) {
    return ILLUSTRATION_TIERS.find((t) => t.key === 'super_bike')
  }

  // Default Two Wheeler is NS400z / Streetfighter
  return ILLUSTRATION_TIERS.find((t) => t.key === 'ns400z')
}
