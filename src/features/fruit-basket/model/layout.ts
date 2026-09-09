export type FruitBasketLayout = {
  width: string
  height: string
  x: string
  y: string
}

export const FRUIT_BASKET_LAYOUT: FruitBasketLayout = {
  // Screen bounds in the 1672 × 941 arcade artwork, with a little overlap
  // behind the curved bezel so no transparent seam can appear.
  width: 'calc(var(--fruit-arcade-width) * 756 / 1672)',
  height: 'calc(var(--fruit-arcade-width) * 482 / 1672)',
  x: 'calc(50vw - var(--fruit-arcade-width) * 6 / 1672)',
  y: 'calc(50dvh + var(--fruit-arcade-width) * 80 / 1672)',
}
