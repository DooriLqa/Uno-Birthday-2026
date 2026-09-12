const imageModules = import.meta.glob<string>('/src/**/*.{png,jpg,jpeg,webp,gif,avif,svg}', {
  eager: true,
  query: '?url',
  import: 'default',
})

const imageUrls = [...new Set(Object.values(imageModules))]

export type ImagePreloadProgress = {
  loaded: number
  total: number
}

function loadImage(url: string): Promise<void> {
  return new Promise((resolve) => {
    const image = new Image()
    let settled = false

    const finish = () => {
      if (settled) return
      settled = true
      resolve()
    }

    image.onload = () => {
      // decode() makes the browser finish decoding the bitmap before we continue.
      void image
        .decode()
        .catch(() => {})
        .finally(finish)
    }
    image.onerror = finish
    image.src = url

    if (image.complete) {
      if (image.naturalWidth > 0) {
        void image
          .decode()
          .catch(() => {})
          .finally(finish)
      } else {
        finish()
      }
    }
  })
}

export async function preloadAllImages(onProgress?: (progress: ImagePreloadProgress) => void) {
  const total = imageUrls.length
  let loaded = 0

  onProgress?.({ loaded, total })

  if (total === 0) return

  await Promise.all(
    imageUrls.map(async (url) => {
      await loadImage(url)
      loaded += 1
      onProgress?.({ loaded, total })
    }),
  )
}
