type Position = { x: number; y: number }

// Percentages of the 976 × 620 logical field. The basket is held to the
// character's right. Allow a late catch down to the character's feet.
export const BASKET_CATCH_OFFSET = 2.8
const ITEM_HALF_WIDTH = (22 / 976) * 100
const ITEM_HALF_HEIGHT = (22 / 620) * 100
const HALF_WIDTH = 3 + (22 / 976) * 100
const TOP = 75 - (22 / 620) * 100
const BOTTOM = 89 + (22 / 620) * 100

// The rendered player sprite is centred on basketX. Bad items hurt only when
// they overlap the character's head; the body and basket remain safe.
const HEAD_LEFT = -4.8
const HEAD_RIGHT = 1.2
const HEAD_TOP = 72.5
const HEAD_BOTTOM = 81

// Bonuses may touch any part of the complete character-and-basket sprite.
const PLAYER_LEFT = -5.5
const PLAYER_RIGHT = 5.5
const PLAYER_TOP = 72
const PLAYER_BOTTOM = 91

function sweptPointInBox(
  start: readonly [number, number],
  end: readonly [number, number],
  bounds: readonly [readonly [number, number], readonly [number, number]],
) {
  let enter = 0
  let leave = 1

  for (let axis = 0; axis < 2; axis += 1) {
    const delta = end[axis] - start[axis]
    const [min, max] = bounds[axis]
    if (delta === 0) {
      if (start[axis] < min || start[axis] > max) return false
      continue
    }
    const a = (min - start[axis]) / delta
    const b = (max - start[axis]) / delta
    enter = Math.max(enter, Math.min(a, b))
    leave = Math.min(leave, Math.max(a, b))
    if (enter > leave) return false
  }
  return true
}

export function isCaught(
  previous: Position,
  next: Position,
  previousBasketX: number,
  basketX: number,
) {
  // Sweep the item's centre relative to the moving basket so neither fast
  // falling items nor a basket moving across them can skip the catch area.
  const start = [
    previous.x - previousBasketX - BASKET_CATCH_OFFSET,
    previous.y + ITEM_HALF_HEIGHT,
  ] as const
  const end = [next.x - basketX - BASKET_CATCH_OFFSET, next.y + ITEM_HALF_HEIGHT] as const
  return sweptPointInBox(start, end, [
    [-HALF_WIDTH, HALF_WIDTH],
    [TOP, BOTTOM],
  ])
}

export function isBadItemHit(
  previous: Position,
  next: Position,
  previousBasketX: number,
  basketX: number,
) {
  const start = [previous.x - previousBasketX, previous.y + ITEM_HALF_HEIGHT] as const
  const end = [next.x - basketX, next.y + ITEM_HALF_HEIGHT] as const

  // Expand by half the item size so touching the head with any visible edge
  // counts across its full width and height.
  return sweptPointInBox(start, end, [
    [HEAD_LEFT - ITEM_HALF_WIDTH, HEAD_RIGHT + ITEM_HALF_WIDTH],
    [HEAD_TOP - ITEM_HALF_HEIGHT, HEAD_BOTTOM + ITEM_HALF_HEIGHT],
  ])
}

export function isBonusCaught(
  previous: Position,
  next: Position,
  previousBasketX: number,
  basketX: number,
) {
  const start = [previous.x - previousBasketX, previous.y + ITEM_HALF_HEIGHT] as const
  const end = [next.x - basketX, next.y + ITEM_HALF_HEIGHT] as const

  return sweptPointInBox(start, end, [
    [PLAYER_LEFT - ITEM_HALF_WIDTH, PLAYER_RIGHT + ITEM_HALF_WIDTH],
    [PLAYER_TOP - ITEM_HALF_HEIGHT, PLAYER_BOTTOM + ITEM_HALF_HEIGHT],
  ])
}

export function isMissed(y: number) {
  return y > 94
}
