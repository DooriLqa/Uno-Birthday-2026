import arkanoidImage from '@/shared/assets/games/arkanoid/raccoon-arcade-background.png'

export type ArkanoidLayout = {
  image: string

  /** Dimensions of the reference artwork. */
  artwork: {
    width: number
    height: number
  }

  /** Playable game area inside the artwork. */
  screen: {
    x: number
    y: number
    width: number
    height: number
    radius: number
  }

  /** Keep the game screen inside these viewport limits. */
  maxScreenViewportWidth: number
  maxScreenViewportHeight: number
}

export const ARKANOID_WORLD = {
  width: 900,
  height: 600,
} as const

export const ARKANOID_LAYOUT: ArkanoidLayout = {
  image: arkanoidImage,

  artwork: {
    width: 1536,
    height: 1024,
  },

  screen: {
    x: 404,
    y: 264,
    width: 728,
    height: 344,
    radius: 24,
  },

  maxScreenViewportWidth: 0.94,
  maxScreenViewportHeight: 0.9,
}
