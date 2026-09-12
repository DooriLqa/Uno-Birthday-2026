import arcadeImage from '@/shared/assets/games/flappy-bird/niche-stream-arcade-v4.png'

export type FlappyBirdLayout = {
  image: string
  /** Dimensions of the reference artwork. Screen coordinates use these units. */
  artwork: { width: number; height: number }
  /** Top-left corner and size of the playable rectangle inside the glass. */
  screen: { x: number; y: number; width: number; height: number; radius: number }
  /** Keep the screen within this fraction of narrow viewports. */
  maxScreenViewportWidth: number
  maxScreenViewportHeight: number
  crt: {
    enabled: boolean
    displacement: number
    scanlineOpacity: number
    grilleOpacity: number
    vignetteOpacity: number
    contrast: number
    saturation: number
  }
}

// Logical physics coordinates do not change when the cabinet or viewport is resized.
export const FLAPPY_WORLD = { width: 720, height: 440 } as const

export const FLAPPY_BIRD_LAYOUT: FlappyBirdLayout = {
  image: arcadeImage,
  artwork: { width: 1672, height: 941 },
  screen: { x: 463, y: 325, width: 737, height: 450, radius: 24 },
  maxScreenViewportWidth: 0.94,
  maxScreenViewportHeight: 0.9,
  crt: {
    enabled: true,
    displacement: 1.4,
    scanlineOpacity: 0.09,
    grilleOpacity: 0.035,
    vignetteOpacity: 0.4,
    contrast: 1.04,
    saturation: 1.06,
  },
}
