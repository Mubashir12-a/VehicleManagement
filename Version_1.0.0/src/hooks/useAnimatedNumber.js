import { useEffect, useRef, useState } from 'react'

/**
 * High-performance 60/120fps animated number counter hook.
 * Uses native requestAnimationFrame with ease-out cubic interpolation.
 */
export function useAnimatedNumber(targetValue, duration = 650, initialValue) {
  const [displayValue, setDisplayValue] = useState(() =>
    initialValue !== undefined ? Number(initialValue) : Number(targetValue) || 0,
  )
  const displayRef = useRef(displayValue)

  useEffect(() => {
    const end = Number(targetValue) || 0
    const start = displayRef.current
    if (start === end) return

    let startTimestamp = null
    let frameId

    const step = (timestamp) => {
      if (!startTimestamp) startTimestamp = timestamp
      const elapsed = timestamp - startTimestamp
      const progress = Math.min(elapsed / duration, 1)

      // Ease out cubic: fast acceleration, silky-smooth settling
      const easeOut = 1 - Math.pow(1 - progress, 3)
      const current = Math.round(start + (end - start) * easeOut)

      setDisplayValue(current)
      displayRef.current = current

      if (progress < 1) {
        frameId = requestAnimationFrame(step)
      } else {
        setDisplayValue(end)
        displayRef.current = end
      }
    }

    frameId = requestAnimationFrame(step)
    return () => cancelAnimationFrame(frameId)
  }, [targetValue, duration])

  return displayValue
}
