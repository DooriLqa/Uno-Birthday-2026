import arkanoidImage from '@/shared/assets/games/arkanoid/background.png'

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
    width: 1672,
    height: 941,
  },

  screen: {
    x: 386,
    y: 170,
    width: 900,
    height: 600,
    radius: 40,
  },

  maxScreenViewportWidth: 0.94,
  maxScreenViewportHeight: 0.9,
}
