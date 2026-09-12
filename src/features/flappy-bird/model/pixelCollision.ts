export type AlphaMask = {
  width: number
  height: number
  alpha: Uint8ClampedArray
}

export type MaskedSprite = {
  mask: AlphaMask
  x: number
  y: number
  width: number
  height: number
  /** Clockwise rotation around the visual centre, in radians. */
  rotation?: number
}

export const SIGNIFICANT_ALPHA = 160
const SAMPLE_STEP = 0.5

const getBounds = ({ x, y, width, height, rotation = 0 }: MaskedSprite) => {
  const halfWidth = width / 2
  const halfHeight = height / 2
  const cosine = Math.abs(Math.cos(rotation))
  const sine = Math.abs(Math.sin(rotation))
  const rotatedHalfWidth = cosine * halfWidth + sine * halfHeight
  const rotatedHalfHeight = sine * halfWidth + cosine * halfHeight
  const centreX = x + halfWidth
  const centreY = y + halfHeight

  return {
    left: centreX - rotatedHalfWidth,
    right: centreX + rotatedHalfWidth,
    top: centreY - rotatedHalfHeight,
    bottom: centreY + rotatedHalfHeight,
  }
}

const prepareSampler = (sprite: MaskedSprite) => {
  const { rotation = 0 } = sprite
  return {
    ...sprite,
    centreX: sprite.x + sprite.width / 2,
    centreY: sprite.y + sprite.height / 2,
    cosine: Math.cos(rotation),
    sine: Math.sin(rotation),
  }
}

const sampleAlpha = (sprite: ReturnType<typeof prepareSampler>, worldX: number, worldY: number) => {
  const { mask, width, height, centreX, centreY, cosine, sine } = sprite
  const deltaX = worldX - centreX
  const deltaY = worldY - centreY
  const localX = cosine * deltaX + sine * deltaY + width / 2
  const localY = -sine * deltaX + cosine * deltaY + height / 2

  if (localX < 0 || localX >= width || localY < 0 || localY >= height) return 0

  const sourceX = Math.min(mask.width - 1, Math.floor((localX / width) * mask.width))
  const sourceY = Math.min(mask.height - 1, Math.floor((localY / height) * mask.height))
  return mask.alpha[sourceY * mask.width + sourceX]
}

export const alphaMasksOverlap = (
  first: MaskedSprite,
  second: MaskedSprite,
  threshold = SIGNIFICANT_ALPHA,
) => {
  const firstBounds = getBounds(first)
  const secondBounds = getBounds(second)
  const left = Math.max(firstBounds.left, secondBounds.left)
  const right = Math.min(firstBounds.right, secondBounds.right)
  const top = Math.max(firstBounds.top, secondBounds.top)
  const bottom = Math.min(firstBounds.bottom, secondBounds.bottom)

  if (left >= right || top >= bottom) return false

  const firstSampler = prepareSampler(first)
  const secondSampler = prepareSampler(second)

  for (let y = top + SAMPLE_STEP / 2; y < bottom; y += SAMPLE_STEP) {
    for (let x = left + SAMPLE_STEP / 2; x < right; x += SAMPLE_STEP) {
      if (
        sampleAlpha(firstSampler, x, y) >= threshold &&
        sampleAlpha(secondSampler, x, y) >= threshold
      ) {
        return true
      }
    }
  }

  return false
}

export const loadAlphaMask = (source: string): Promise<AlphaMask> =>
  new Promise((resolve, reject) => {
    const image = new Image()
    image.onload = () => {
      const canvas = document.createElement('canvas')
      canvas.width = image.naturalWidth
      canvas.height = image.naturalHeight
      const context = canvas.getContext('2d', { willReadFrequently: true })
      if (!context) {
        reject(new Error(`Unable to read collision mask: ${source}`))
        return
      }

      context.drawImage(image, 0, 0)
      const rgba = context.getImageData(0, 0, canvas.width, canvas.height).data
      const alpha = new Uint8ClampedArray(canvas.width * canvas.height)
      for (let sourceIndex = 3, alphaIndex = 0; sourceIndex < rgba.length; sourceIndex += 4) {
        alpha[alphaIndex] = rgba[sourceIndex]
        alphaIndex += 1
      }
      resolve({ width: canvas.width, height: canvas.height, alpha })
    }
    image.onerror = () => reject(new Error(`Unable to load collision mask: ${source}`))
    image.src = source
  })
