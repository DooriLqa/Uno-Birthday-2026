import {
  useRef,
  type PointerEvent,
  type KeyboardEvent,
  type WheelEvent,
  type CSSProperties,
} from 'react'
import './VolumeKnob.css'

interface VolumeKnobProps {
  value: number
  onChange: (value: number) => void

  /**
   * Минимальное и максимальное значение.
   *
   * Для VOLUME:
   * min = 0
   * max = 1
   *
   * Для TUNE:
   * например min = 87.5
   * max = 108
   */
  min?: number
  max?: number

  /**
   * Шаг изменения.
   *
   * Для VOLUME обычно 0.01
   * Для TUNE можно поставить 0.1, 0.2 и т.д.
   */
  step?: number

  /**
   * Подпись для accessibility.
   */
  ariaLabel?: string

  size?: number
}

const START_ANGLE = -35
// const END_ANGLE = -325
const TOTAL_ANGLE = 290

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max)

const valueToAngle = (value: number, min: number, max: number) => {
  const normalized = (value - min) / (max - min)

  return START_ANGLE - clamp(normalized, 0, 1) * TOTAL_ANGLE
}

const pointerToNormalizedValue = (event: PointerEvent<HTMLDivElement>, element: HTMLDivElement) => {
  const rect = element.getBoundingClientRect()

  const centerX = rect.left + rect.width / 2
  const centerY = rect.top + rect.height / 2

  const dx = event.clientX - centerX
  const dy = event.clientY - centerY

  // 0° — вверх
  // 90° — вправо
  // 180° — вниз
  // -90° — влево
  let angle = Math.atan2(dy, dx) * (180 / Math.PI) + 90

  if (angle > 180) {
    angle -= 360
  }

  if (angle < -180) {
    angle += 360
  }

  /*
   * Рабочая дуга:
   *
   * -35°  → 0%
   * -90°  → ~19%
   * -180° → 50%
   * -270° → ~81%
   * -325° → 100%
   *
   * -325° визуально совпадает с +35°.
   */
  let relativeAngle = START_ANGLE - angle

  if (relativeAngle < 0) {
    relativeAngle += 360
  }

  relativeAngle = clamp(relativeAngle, 0, TOTAL_ANGLE)

  return relativeAngle / TOTAL_ANGLE
}

const roundToStep = (value: number, step: number) => {
  const decimals = Math.max(0, (step.toString().split('.')[1] ?? '').length)

  return Number((Math.round(value / step) * step).toFixed(decimals))
}

export function VolumeKnob({
  value,
  onChange,
  min = 0,
  max = 1,
  step = 0.01,
  ariaLabel = 'Громкость радио',
  size = 58,
}: VolumeKnobProps) {
  const knobRef = useRef<HTMLDivElement>(null)

  const safeValue = clamp(value, min, max)

  //   const normalizedValue =
  //     max === min
  //       ? 0
  //       : (safeValue - min) / (max - min)

  const angle = valueToAngle(safeValue, min, max)

  const updateFromPointer = (event: PointerEvent<HTMLDivElement>) => {
    if (!knobRef.current) {
      return
    }

    const normalized = pointerToNormalizedValue(event, knobRef.current)

    const rawValue = min + normalized * (max - min)

    const newValue = roundToStep(clamp(rawValue, min, max), step)

    onChange(newValue)
  }

  const handlePointerDown = (event: PointerEvent<HTMLDivElement>) => {
    event.preventDefault()

    knobRef.current?.setPointerCapture(event.pointerId)

    updateFromPointer(event)
  }

  const handlePointerMove = (event: PointerEvent<HTMLDivElement>) => {
    if (!knobRef.current?.hasPointerCapture(event.pointerId)) {
      return
    }

    updateFromPointer(event)
  }

  const handlePointerUp = (event: PointerEvent<HTMLDivElement>) => {
    if (knobRef.current?.hasPointerCapture(event.pointerId)) {
      knobRef.current.releasePointerCapture(event.pointerId)
    }
  }

  const handleWheel = (event: WheelEvent<HTMLDivElement>) => {
    event.preventDefault()

    const direction = event.deltaY > 0 ? -1 : 1

    const newValue = safeValue + direction * step

    onChange(roundToStep(clamp(newValue, min, max), step))
  }

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    let newValue = safeValue

    switch (event.key) {
      case 'ArrowUp':
      case 'ArrowLeft':
        newValue += step
        break

      case 'ArrowDown':
      case 'ArrowRight':
        newValue -= step
        break

      case 'PageUp':
        newValue += step * 10
        break

      case 'PageDown':
        newValue -= step * 10
        break

      case 'Home':
        newValue = min
        break

      case 'End':
        newValue = max
        break

      default:
        return
    }

    event.preventDefault()

    onChange(roundToStep(clamp(newValue, min, max), step))
  }

  return (
    <div
      ref={knobRef}
      className="volume-knob"
      role="slider"
      tabIndex={0}
      aria-label={ariaLabel}
      aria-valuemin={min}
      aria-valuemax={max}
      aria-valuenow={safeValue}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      onWheel={handleWheel}
      onKeyDown={handleKeyDown}
      style={
        {
          '--knob-size': `${size}px`,
          '--knob-angle': `${angle}deg`,
        } as CSSProperties
      }
    >
      <div className="volume-knob__body">
        <div className="volume-knob__indicator" />
        <div className="volume-knob__center" />
      </div>
    </div>
  )
}
