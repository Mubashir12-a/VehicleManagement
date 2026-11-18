import { CheckCircle2 } from 'lucide-react'
import PageHeader from '../components/common/PageHeader'
import VehicleHeroCard from '../components/dashboard/VehicleHeroCard'
import VehicleCrayonIllustration from '../components/illustrations/VehicleCrayonIllustration'
import { useFleetData } from '../hooks/useFleetData'
import {
  ILLUSTRATION_TIERS,
  resolveVehicleVisual,
} from '../utils/vehicleIllustration'

const PRESET_SAMPLES = {
  scooter: { name: 'City Glide', brand: 'Honda', model: 'Activa 6G', engineCc: 110 },
  normal_bike: { name: 'Street Pulse', brand: 'Yamaha', model: 'MT-15', engineCc: 155 },
  sports_bike: { name: 'Pulsar', brand: 'Bajaj Auto', model: 'NS400z', engineCc: 373 },
  normal_car: { name: 'Urban Zip', brand: 'Suzuki', model: 'Alto K10', engineCc: 998 },
  rally_car: { name: 'Gravel Storm', brand: 'Subaru', model: 'WRX STI', engineCc: 2457 },
  sports_car: { name: 'Apex GT', brand: 'Porsche', model: '911 GT3', engineCc: 3996 },
}

export default function VehiclesPage() {
  const { primaryVehicle, summary, updatePrimaryVehicle } = useFleetData()
  const vehicle = primaryVehicle || {}
  const activeVisual = resolveVehicleVisual({
    category: vehicle.category,
    subType: vehicle.subType,
    engineCc: vehicle.engineCc,
  })

  const applyPreset = async (tier) => {
    const sample = PRESET_SAMPLES[tier.key]
    await updatePrimaryVehicle({
      ...primaryVehicle,
      name: sample.name,
      brand: sample.brand,
      model: sample.model,
      category: tier.category,
      subType: tier.subType,
      engineCc: sample.engineCc,
    })
  }

  return (
    <div className="space-y-8">
      <PageHeader
        title="My Vehicle"
        description="Currently tracking 1 vehicle across Two Wheeler and Four Wheeler categories."
      />

      <VehicleHeroCard
        vehicle={primaryVehicle}
        summary={summary}
        onSave={updatePrimaryVehicle}
      />

      {/* Built-in Crayon Visual Rules Showcase */}
      <section className="space-y-4">
        <div>
          <h3 className="text-lg font-extrabold tracking-tight text-white">
            Default Built-in Crayon Illustrations
          </h3>
          <p className="mt-0.5 text-sm text-zinc-400">
            Automatically assigned from category (Two Wheeler / Four Wheeler),
            style, and engine CC. Click any card to preview it on your vehicle.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {ILLUSTRATION_TIERS.map((tier) => {
            const isSelected = activeVisual.key === tier.key
            return (
              <div
                key={tier.key}
                className={`flex flex-col rounded-2xl border bg-[#0d1014] p-4 transition-all ${
                  isSelected
                    ? 'border-lime-400/70 ring-1 ring-lime-400/40 shadow-[0_0_24px_rgba(163,230,53,0.12)]'
                    : 'border-white/10 hover:border-white/20'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wider text-zinc-300">
                    {tier.category}
                  </span>
                  {isSelected && (
                    <span className="inline-flex items-center gap-1 text-xs font-bold text-lime-400">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      Active
                    </span>
                  )}
                </div>

                <VehicleCrayonIllustration
                  visualKey={tier.key}
                  className="mt-3 aspect-[16/10] w-full min-h-[160px]"
                />

                <div className="mt-3 flex items-end justify-between gap-2">
                  <div>
                    <p className="text-sm font-bold text-white">{tier.label}</p>
                    <p className="text-xs text-zinc-400">{tier.rule}</p>
                  </div>

                  <button
                    type="button"
                    onClick={() => applyPreset(tier)}
                    className="shrink-0 rounded-lg border border-lime-400/30 bg-lime-400/10 px-2.5 py-1.5 text-xs font-bold text-lime-300 transition-colors hover:bg-lime-400 hover:text-zinc-950"
                  >
                    Try Preset
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      </section>
    </div>
  )
}
