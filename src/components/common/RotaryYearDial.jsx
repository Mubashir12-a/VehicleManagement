import { ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

function polarToCartesian(centerX, centerY, radius, angleInDegrees) {
  const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180.0
  return {
    x: Number((centerX + radius * Math.cos(angleInRadians)).toFixed(2)),
    y: Number((centerY + radius * Math.sin(angleInRadians)).toFixed(2)),
  }
}

function describeArc(cx, cy, r, startAngle, endAngle) {
  const effectiveEnd = Math.max(startAngle + 0.5, endAngle)
  const start = polarToCartesian(cx, cy, r, effectiveEnd)
  const end = polarToCartesian(cx, cy, r, startAngle)
  const arcSweep = effectiveEnd - startAngle <= 180 ? '0' : '1'

  return [
    'M',
    start.x,
    start.y,
    'A',
    r,
    r,
    0,
    arcSweep,
    0,
    end.x,
    end.y,
  ].join(' ')
}

/**
 * Interactive Automotive Rotary Year Dial
 * Inspired by automotive volume/telemetry dial knobs with glowing arc,
 * needle notch indicator, direct-click rotation, step arrows, and dropdown menu.
 */
export default function RotaryYearDial({
  yearsList = [],
  activeYear,
  onSelectYear,
  label = 'Rotate Year',
}) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const dropdownRef = useRef(null)
  const knobRef = useRef(null)

  const count = yearsList.length
  const currentIndex = Math.max(0, yearsList.indexOf(activeYear))

  // Arc angles: -125 deg to +125 deg (250 deg total sweep, open bottom)
  const startAngle = -125
  const endAngle = 125
  const totalSweep = endAngle - startAngle // 250 deg

  const progressFraction = count > 1 ? currentIndex / (count - 1) : 1
  const needleAngle = count > 1 ? startAngle + progressFraction * totalSweep : 0
  const activeArcEndAngle = count > 1 ? needleAngle : endAngle

  // Rotate to next year on knob click
  const handleKnobClick = () => {
    if (count <= 1) return
    const nextIdx = (currentIndex + 1) % count
    onSelectYear(yearsList[nextIdx])
  }

  const handlePrev = (e) => {
    e.stopPropagation()
    if (count <= 1) return
    const prevIdx = (currentIndex - 1 + count) % count
    onSelectYear(yearsList[prevIdx])
  }

  const handleNext = (e) => {
    e.stopPropagation()
    if (count <= 1) return
    const nextIdx = (currentIndex + 1) % count
    onSelectYear(yearsList[nextIdx])
  }

  // Smooth mouse wheel rotation on the knob
  useEffect(() => {
    const knobEl = knobRef.current
    if (!knobEl || count <= 1) return

    function onWheelEvent(e) {
      e.preventDefault()
      if (e.deltaY < 0) {
        // Wheel up -> Next year
        const nextIdx = (currentIndex + 1) % count
        onSelectYear(yearsList[nextIdx])
      } else if (e.deltaY > 0) {
        // Wheel down -> Prev year
        const prevIdx = (currentIndex - 1 + count) % count
        onSelectYear(yearsList[prevIdx])
      }
    }

    knobEl.addEventListener('wheel', onWheelEvent, { passive: false })
    return () => {
      knobEl.removeEventListener('wheel', onWheelEvent)
    }
  }, [currentIndex, count, onSelectYear, yearsList])

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsDropdownOpen(false)
      }
    }
    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isDropdownOpen])

  return (
    <div className="relative flex items-center gap-2.5" ref={dropdownRef}>
      {/* 1. Interactive Rotary Knob */}
      <div className="relative flex items-center justify-center">
        <button
          ref={knobRef}
          type="button"
          onClick={handleKnobClick}
          className="group relative flex h-14 w-14 items-center justify-center rounded-full transition-transform active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-lime-400"
          title={`Click to rotate year (Current: ${activeYear})`}
          aria-label={`Rotate year. Current: ${activeYear}`}
        >
          {/* SVG Arc Track & Active Glow Track */}
          <svg
            viewBox="0 0 64 64"
            className="pointer-events-none absolute inset-0 h-full w-full"
          >
            <defs>
              <linearGradient id="rotaryTrackGlow" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#84cc16" />
                <stop offset="100%" stopColor="#a3e635" />
              </linearGradient>
              <radialGradient id="knobFaceGrad" cx="35%" cy="35%" r="65%">
                <stop offset="0%" stopColor="#252d38" />
                <stop offset="55%" stopColor="#14181f" />
                <stop offset="100%" stopColor="#0a0d10" />
              </radialGradient>
            </defs>

            {/* Background circular track */}
            <path
              d={describeArc(32, 32, 26, startAngle, endAngle)}
              fill="none"
              stroke="#27272a"
              strokeWidth="4"
              strokeLinecap="round"
            />

            {/* Active lime circular arc */}
            <path
              d={describeArc(32, 32, 26, startAngle, activeArcEndAngle)}
              fill="none"
              stroke="url(#rotaryTrackGlow)"
              strokeWidth="4.5"
              strokeLinecap="round"
              className="transition-all duration-300 ease-out"
              filter="drop-shadow(0 0 5px rgba(163,230,53,0.85))"
            />

            {/* Rotary Knob Face */}
            <circle
              cx="32"
              cy="32"
              r="20"
              fill="url(#knobFaceGrad)"
              stroke="#3f3f46"
              strokeWidth="1.2"
              className="transition-all group-hover:stroke-lime-400/60"
            />

            {/* Rotating Needle Notch */}
            <g
              transform={`rotate(${needleAngle} 32 32)`}
              className="transition-transform duration-300 ease-out"
            >
              <line
                x1="32"
                y1="13"
                x2="32"
                y2="19"
                stroke="#ffffff"
                strokeWidth="2.5"
                strokeLinecap="round"
                filter="drop-shadow(0 0 2.5px #ffffff)"
              />
            </g>
          </svg>

          {/* Center Display: Dashed volume-style indicator and Year text */}
          <div className="pointer-events-none relative z-10 flex flex-col items-center justify-center select-none -mt-0.5">
            <div className="flex items-center gap-0.5 opacity-70">
              <span className="h-0.5 w-1 rounded-full bg-lime-400" />
              <span className="h-0.5 w-1 rounded-full bg-white" />
            </div>
            <span className="font-mono text-[10px] font-black text-white leading-tight mt-0.5">
              {String(activeYear).slice(2)}&apos;
            </span>
          </div>
        </button>
      </div>

      {/* 2. Controls & Dropdown Trigger */}
      <div className="flex flex-col justify-center">
        <div className="flex items-center gap-0.5">
          <button
            type="button"
            onClick={handlePrev}
            disabled={count <= 1}
            className="rounded-lg p-1 text-zinc-400 hover:bg-white/5 hover:text-white disabled:opacity-40 transition-colors"
            title="Previous Year"
          >
            <ChevronLeft className="h-3.5 w-3.5" />
          </button>

          <button
            type="button"
            onClick={() => setIsDropdownOpen((prev) => !prev)}
            className="flex items-center gap-1 rounded-lg border border-lime-400/30 bg-lime-400/10 px-2 py-1 font-mono text-xs font-black text-lime-300 shadow-[0_0_8px_rgba(163,230,53,0.15)] hover:bg-lime-400/20 transition-colors"
            title="Choose year from dropdown"
          >
            <span>{activeYear}</span>
            <ChevronDown className="h-3 w-3 text-lime-400" />
          </button>

          <button
            type="button"
            onClick={handleNext}
            disabled={count <= 1}
            className="rounded-lg p-1 text-zinc-400 hover:bg-white/5 hover:text-white disabled:opacity-40 transition-colors"
            title="Next Year"
          >
            <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>

        <span className="mt-0.5 text-center text-[9px] font-bold uppercase tracking-wider text-zinc-500">
          {label}
        </span>
      </div>

      {/* Dropdown Menu Popup */}
      {isDropdownOpen && (
        <div className="absolute right-0 top-full mt-2 w-36 rounded-2xl border border-white/10 bg-[#0d1014] p-1.5 shadow-2xl ring-1 ring-black/50 z-40 backdrop-blur-xl">
          <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-zinc-500 border-b border-white/6 mb-1">
            Vehicle Years
          </div>
          {yearsList.map((y) => (
            <button
              key={y}
              type="button"
              onClick={() => {
                onSelectYear(y)
                setIsDropdownOpen(false)
              }}
              className={`flex w-full items-center justify-between rounded-xl px-2.5 py-1.5 font-mono text-xs font-bold transition-colors ${
                y === activeYear
                  ? 'bg-lime-400 text-zinc-950 font-black'
                  : 'text-zinc-300 hover:bg-white/5 hover:text-white'
              }`}
            >
              <span>{y}</span>
              {y === activeYear && (
                <span className="h-1.5 w-1.5 rounded-full bg-zinc-950" />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
