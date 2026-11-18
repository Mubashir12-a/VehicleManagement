export const VEHICLE_CATEGORIES = ['Two Wheeler', 'Four Wheeler']

export const TWO_WHEELER_SUBTYPES = [
  'Bike',
  'Scooter',
  'Sports Bike',
  'Cafe Racer',
  'Superbike',
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
    key: 'normal_car',
    category: 'Four Wheeler',
    subType: 'Car',
    label: 'Normal Car',
    rule: 'Four-Wheeler up to 1,000 cc',
    sampleCc: 998,
    badgeColor: 'bg-sky-50 text-sky-700 ring-sky-600/20',
  },
  {
    key: 'rally_car',
    category: 'Four Wheeler',
    subType: 'Car',
    label: 'Rally Car',
    rule: 'Four-Wheeler 1,001 – 3,000 cc',
    sampleCc: 1998,
    badgeColor: 'bg-amber-50 text-amber-700 ring-amber-600/20',
  },
  {
    key: 'sports_car',
    category: 'Four Wheeler',
    subType: 'Car',
    label: 'Sports Car',
    rule: 'Four-Wheeler above 3,000 cc',
    sampleCc: 3996,
    badgeColor: 'bg-orange-50 text-orange-700 ring-orange-600/20',
  },
]

export function resolveVehicleVisual({ category, subType, engineCc, model }) {
  const cc = Number(engineCc) || 0
  const m = String(model || '').toLowerCase()

  if (category === 'Four Wheeler') {
    if (cc > 3000) {
      return ILLUSTRATION_TIERS.find((t) => t.key === 'sports_car')
    }
    if (cc > 1000) {
      return ILLUSTRATION_TIERS.find((t) => t.key === 'rally_car')
    }
    return ILLUSTRATION_TIERS.find((t) => t.key === 'normal_car')
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
