import { useId, type CSSProperties, type ReactNode } from 'react'
import './ArcadeDisplay.css'

export function ArcadeDisplay({ children }: { children: ReactNode }) {
  const filterId = useId()
  return (
    <>
      <svg className="arcade-crt-definitions" aria-hidden="true">
        <defs>
          <filter
            id={filterId}
            x="-2%"
            y="-2%"
            width="104%"
            height="104%"
            colorInterpolationFilters="sRGB"
          >
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.003 0.16"
              numOctaves="1"
              seed="7"
              result="crtNoise"
            />
            <feDisplacementMap
              in="SourceGraphic"
              in2="crtNoise"
              scale={1.4}
              xChannelSelector="R"
              yChannelSelector="G"
            />
          </filter>
        </defs>
      </svg>
      <div
        className="arcade-display has-crt"
        style={{ '--arcade-crt-filter': `url('#${filterId}')` } as CSSProperties}
      >
        {children}
      </div>
    </>
  )
}
