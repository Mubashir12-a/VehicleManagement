import {
  AlertCircle,
  CheckCircle2,
  Gauge,
  Plus,
  Sparkles,
  X,
} from 'lucide-react'
import { useState } from 'react'
import { useFleetData } from '../../hooks/useFleetData'
import {
  FOUR_WHEELER_SUBTYPES,
  TWO_WHEELER_SUBTYPES,
  VEHICLE_CATEGORIES,
} from '../../utils/vehicleIllustration'

const FUEL_TYPES = [
  'Petrol (E10)',
  'Petrol (E20)',
  'Petrol (Pure / E0)',
  'Petrol (Premium 95/100 Octane)',
  'Diesel',
  'Electric (EV)',
  'CNG / Hybrid',
  'None',
]

export default function AddVehicleModal({ isOpen, onClose, onVehicleAdded }) {
  const { addVehicle } = useFleetData()

  const [name, setName] = useState('')
  const [brand, setBrand] = useState('')
  const [model, setModel] = useState('')
  const [category, setCategory] = useState('Two Wheeler')
  const [subType, setSubType] = useState('Bike')
  const [plate, setPlate] = useState('')
  const [engineCc, setEngineCc] = useState('')
  const [topSpeed, setTopSpeed] = useState('')
  const [fuelType, setFuelType] = useState('Petrol (E10)')
  const [mileage, setMileage] = useState('')
  const [exShowroomPrice, setExShowroomPrice] = useState('')
  const [purchaseDate, setPurchaseDate] = useState('')

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  if (!isOpen) return null

  const handleCategoryChange = (newCat) => {
    setCategory(newCat)
    if (newCat === 'Four Wheeler') {
      setSubType('Sedan')
    } else {
      setSubType('Bike')
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setErrorMessage('')
    setSuccessMessage('')
    setIsSubmitting(true)

    try {
      const result = await addVehicle({
        name: name.trim() || 'Enter Vehicle Name',
        brand: brand.trim() || 'None',
        model: model.trim() || 'None',
        category,
        subType,
        plate: plate.trim().toUpperCase() || 'None',
        engineCc: Number(engineCc) || 0,
        topSpeed: Number(topSpeed) || 0,
        fuelType: fuelType || 'None',
        mileage: Number(mileage) || 0,
        exShowroomPrice: Number(exShowroomPrice) || 0,
        purchaseDate: purchaseDate || null,
        status: 'Active',
      })

      setSuccessMessage('Vehicle profile created & set as active cockpit!')
      if (onVehicleAdded) {
        onVehicleAdded(result.vehicle)
      }
      setTimeout(() => {
        onClose()
      }, 900)
    } catch (err) {
      console.error('Failed to create vehicle profile:', err)
      setErrorMessage(
        err.message || 'Could not register new vehicle. Please try again.',
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-xl overflow-hidden rounded-2xl border border-white/10 bg-[#0c1017] shadow-2xl shadow-black/80 text-zinc-100"
        role="dialog"
        aria-modal="true"
      >
        {/* Neon Lime Top Accent Line */}
        <div className="h-1 w-full bg-gradient-to-r from-lime-500 via-lime-300 to-emerald-400" />

        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 rounded-xl p-1.5 text-zinc-400 hover:bg-white/5 hover:text-white transition-colors"
          aria-label="Close"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Header */}
        <div className="px-6 pt-6 pb-3 border-b border-white/6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-lime-400/40 bg-lime-400/10 text-lime-400 shadow-lg shadow-lime-400/20">
              <Plus className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-black tracking-tight text-white">
                Add New Vehicle Profile
              </h3>
              <p className="text-xs text-zinc-400">
                Register another vehicle to your garage. All telemetry and service records are isolated.
              </p>
            </div>
          </div>
        </div>

        {/* Form Body */}
        <form
          onSubmit={handleSubmit}
          className="px-6 py-4 space-y-4 max-h-[75vh] overflow-y-auto"
        >
          {/* Status Banners */}
          {errorMessage && (
            <div className="flex items-start gap-2.5 rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-xs text-rose-300">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-rose-400" />
              <div className="flex-1">{errorMessage}</div>
            </div>
          )}

          {successMessage && (
            <div className="flex items-start gap-2.5 rounded-xl border border-lime-500/30 bg-lime-500/10 p-3 text-xs text-lime-300">
              <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5 text-lime-400" />
              <div className="flex-1">{successMessage}</div>
            </div>
          )}

          {/* Vehicle Name & Classification */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1">
                Vehicle Nickname *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter vehicle name"
                className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-white placeholder-zinc-500 focus:border-lime-400 focus:outline-none focus:ring-1 focus:ring-lime-400"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => handleCategoryChange(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-[#12161c] px-3 py-2 text-xs text-white focus:border-lime-400 focus:outline-none focus:ring-1 focus:ring-lime-400"
              >
                {VEHICLE_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1">
                {category === 'Four Wheeler' ? 'Car Type' : 'Bike Style'}
              </label>
              <select
                value={subType}
                onChange={(e) => setSubType(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-[#12161c] px-3 py-2 text-xs text-white focus:border-lime-400 focus:outline-none focus:ring-1 focus:ring-lime-400"
              >
                {(category === 'Four Wheeler'
                  ? FOUR_WHEELER_SUBTYPES
                  : TWO_WHEELER_SUBTYPES
                ).map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Brand, Model, Plate */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1">
                Brand / Manufacturer
              </label>
              <input
                type="text"
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                placeholder="Enter brand"
                className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-white placeholder-zinc-500 focus:border-lime-400 focus:outline-none focus:ring-1 focus:ring-lime-400"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1">
                Model Specification
              </label>
              <input
                type="text"
                value={model}
                onChange={(e) => setModel(e.target.value)}
                placeholder="Enter model"
                className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-white placeholder-zinc-500 focus:border-lime-400 focus:outline-none focus:ring-1 focus:ring-lime-400"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1">
                Registration Plate
              </label>
              <input
                type="text"
                value={plate}
                onChange={(e) => setPlate(e.target.value)}
                placeholder="Enter plate number"
                className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 font-mono uppercase text-xs text-white placeholder-zinc-500 focus:border-lime-400 focus:outline-none focus:ring-1 focus:ring-lime-400"
              />
            </div>
          </div>

          {/* Engine CC, Top Speed, Fuel Type */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1">
                Displacement (CC)
              </label>
              <input
                type="number"
                min="0"
                value={engineCc}
                onChange={(e) => setEngineCc(e.target.value)}
                placeholder="0"
                className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 font-mono text-xs text-white placeholder-zinc-500 focus:border-lime-400 focus:outline-none focus:ring-1 focus:ring-lime-400"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1">
                Top Speed (km/h)
              </label>
              <input
                type="number"
                min="0"
                value={topSpeed}
                onChange={(e) => setTopSpeed(e.target.value)}
                placeholder="0"
                className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 font-mono text-xs text-white placeholder-zinc-500 focus:border-lime-400 focus:outline-none focus:ring-1 focus:ring-lime-400"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1">
                Fuel Standard
              </label>
              <select
                value={fuelType}
                onChange={(e) => setFuelType(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-[#12161c] px-3 py-2 text-xs text-white focus:border-lime-400 focus:outline-none focus:ring-1 focus:ring-lime-400"
              >
                {FUEL_TYPES.map((f) => (
                  <option key={f} value={f}>
                    {f}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Odometer, Purchase Date, Ex-Showroom */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1">
                Initial Odometer (km)
              </label>
              <div className="relative">
                <Gauge className="absolute left-3 top-2.5 h-3.5 w-3.5 text-zinc-500" />
                <input
                  type="number"
                  min="0"
                  value={mileage}
                  onChange={(e) => setMileage(e.target.value)}
                  placeholder="0"
                  className="w-full rounded-xl border border-white/10 bg-white/5 py-2 pl-9 pr-3 font-mono text-xs text-white placeholder-zinc-500 focus:border-lime-400 focus:outline-none focus:ring-1 focus:ring-lime-400"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1">
                Purchase Date
              </label>
              <div className="relative">
                <input
                  type="date"
                  value={purchaseDate}
                  onChange={(e) => setPurchaseDate(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 font-mono text-xs text-white placeholder-zinc-500 focus:border-lime-400 focus:outline-none focus:ring-1 focus:ring-lime-400"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1">
                Ex-Showroom Price (₹)
              </label>
              <input
                type="number"
                min="0"
                value={exShowroomPrice}
                onChange={(e) => setExShowroomPrice(e.target.value)}
                placeholder="0"
                className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 font-mono text-xs text-white placeholder-zinc-500 focus:border-lime-400 focus:outline-none focus:ring-1 focus:ring-lime-400"
              />
            </div>
          </div>

          {/* Submit & Cancel */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/6">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-xs font-semibold text-zinc-300 transition hover:bg-white/10 hover:text-white"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 rounded-xl bg-lime-400 px-5 py-2.5 text-xs font-bold text-zinc-950 transition hover:bg-lime-300 disabled:opacity-50 shadow-md shadow-lime-400/20 active:scale-[0.99]"
            >
              {isSubmitting ? (
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-zinc-950 border-t-transparent" />
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  <span>Register Vehicle Profile</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
