type Position = { x: number; y: number }

// Percentages of the 976 × 620 logical field. The basket is held to the
// character's right. Allow a late catch down to the character's feet.
export const BASKET_CATCH_OFFSET = 2.8
const HALF_WIDTH = 3 + (22 / 976) * 100
const TOP = 75 - (22 / 620) * 100
const BOTTOM = 89 + (22 / 620) * 100

export function isCaught(
  previous: Position,
  next: Position,
  previousBasketX: number,
  basketX: number,
) {
  // Sweep the item's centre relative to the moving basket so neither fast
  // falling items nor a basket moving across them can skip the catch area.
  const start = [previous.x - previousBasketX - BASKET_CATCH_OFFSET, previous.y + (22 / 620) * 100]
  const end = [next.x - basketX - BASKET_CATCH_OFFSET, next.y + (22 / 620) * 100]
  const bounds = [[-HALF_WIDTH, HALF_WIDTH], [TOP, BOTTOM]]
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

export function isMissed(y: number) {
  return y > 94
}
