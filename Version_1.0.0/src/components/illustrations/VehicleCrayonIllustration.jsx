import { useId } from 'react'
import { resolveVehicleVisual } from '../../utils/vehicleIllustration'
import NormalBikeSvg from './NormalBikeSvg'
import NormalCarSvg from './NormalCarSvg'
import RallyCarSvg from './RallyCarSvg'
import ScooterSvg from './ScooterSvg'
import SportsBikeSvg from './SportsBikeSvg'
import SportsCarSvg from './SportsCarSvg'

const ILLUSTRATION_MAP = {
  scooter: ScooterSvg,
  normal_bike: NormalBikeSvg,
  sports_bike: SportsBikeSvg,
  normal_car: NormalCarSvg,
  rally_car: RallyCarSvg,
  sports_car: SportsCarSvg,
}

export default function VehicleCrayonIllustration({
  category,
  subType,
  engineCc,
  model,
  visualKey,
  framed = true,
  className = '',
}) {
  const rawId = useId()
  const uid = rawId.replace(/:/g, '')

  const visual = resolveVehicleVisual({ category, subType, engineCc, model })
  const resolvedKey = visualKey || visual?.key
  const imageSrc = visual?.imageSrc
  const VehicleSvg = ILLUSTRATION_MAP[resolvedKey] || ScooterSvg

  return (
    <div
      className={`relative flex items-center justify-center overflow-hidden ${
        framed
          ? 'rounded-2xl border border-white/8 bg-[#0b0e11]'
          : 'bg-transparent'
      } ${className}`}
    >
      {/* Signature radial lime spotlight glow (matching dark automotive reference) */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(circle at 55% 52%, rgba(163, 230, 53, 0.26) 0%, rgba(132, 204, 22, 0.10) 38%, transparent 70%)',
        }}
      />

      {/* Concentric lime radar rings behind the vehicle */}
      <svg
        viewBox="0 0 360 220"
        className="pointer-events-none absolute inset-0 h-full w-full"
        aria-hidden="true"
      >
        <g stroke="#a3e635" fill="none">
          <circle cx="194" cy="116" r="56" strokeOpacity="0.18" strokeWidth="1" />
          <circle
            cx="194"
            cy="116"
            r="84"
            strokeOpacity="0.14"
            strokeWidth="1"
            strokeDasharray="6 6"
          />
          <circle cx="194" cy="116" r="112" strokeOpacity="0.1" strokeWidth="1" />
          <circle cx="194" cy="116" r="142" strokeOpacity="0.06" strokeWidth="1" />
        </g>
      </svg>

      {/* Transparent 3D illustration image without any background */}
      {imageSrc ? (
        <div className="relative z-10 flex h-full w-full items-center justify-center p-2">
          <img
            src={imageSrc}
            alt={`${visual?.label || 'Vehicle'} illustration`}
            className="max-h-full max-w-full object-contain drop-shadow-[0_20px_35px_rgba(0,0,0,0.85)] filter select-none transition-transform duration-500 hover:scale-105"
            loading="lazy"
          />
        </div>
      ) : (
        <svg
          viewBox="0 0 360 220"
          className="relative z-10 h-full w-full drop-shadow-[0_14px_22px_rgba(0,0,0,0.65)] select-none"
          role="img"
          aria-label={`${resolvedKey.replace('_', ' ')} crayon illustration`}
        >
        <defs>
          {/* Hand-drawn waxy crayon displacement filter (2D with tactile 3D depth) */}
          <filter
            id={`${uid}-crayon`}
            x="-6%"
            y="-6%"
            width="112%"
            height="112%"
          >
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.045 0.08"
              numOctaves="3"
              seed="7"
              result="noise"
            />
            <feDisplacementMap
              in="SourceGraphic"
              in2="noise"
              scale="2.2"
              xChannelSelector="R"
              yChannelSelector="G"
            />
          </filter>

          {/* Deep ground contact shadow on dark carbon surface */}
          <radialGradient id={`${uid}-shadow`} cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#000000" stopOpacity="0.72" />
            <stop offset="65%" stopColor="#000000" stopOpacity="0.32" />
            <stop offset="100%" stopColor="#000000" stopOpacity="0" />
          </radialGradient>

          {/* Rich 3D-shaded matte-crayon body gradients tailored for dark studio */}
          <linearGradient id={`${uid}-teal`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#5eead4" />
            <stop offset="52%" stopColor="#14b8a6" />
            <stop offset="100%" stopColor="#0f514d" />
          </linearGradient>

          <linearGradient id={`${uid}-tan`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#71717a" />
            <stop offset="55%" stopColor="#3f3f46" />
            <stop offset="100%" stopColor="#18181b" />
          </linearGradient>

          <linearGradient id={`${uid}-blue`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#60a5fa" />
            <stop offset="52%" stopColor="#2563eb" />
            <stop offset="100%" stopColor="#172554" />
          </linearGradient>

          <linearGradient id={`${uid}-red`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#a3e635" />
            <stop offset="28%" stopColor="#3f3f46" />
            <stop offset="100%" stopColor="#18181b" />
          </linearGradient>

          <linearGradient id={`${uid}-sky`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#7dd3fc" />
            <stop offset="52%" stopColor="#0284c7" />
            <stop offset="100%" stopColor="#0c4a6e" />
          </linearGradient>

          <linearGradient id={`${uid}-rally`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#60a5fa" />
            <stop offset="48%" stopColor="#1d4ed8" />
            <stop offset="100%" stopColor="#172554" />
          </linearGradient>

          <linearGradient id={`${uid}-orange`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#bef264" />
            <stop offset="46%" stopColor="#84cc16" />
            <stop offset="100%" stopColor="#365314" />
          </linearGradient>
        </defs>

        <VehicleSvg uid={uid} />
      </svg>
      )}
    </div>
  )
}
