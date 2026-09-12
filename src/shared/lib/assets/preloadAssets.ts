const assetModules = import.meta.glob<string>('/src/**/*.{png,jpg,jpeg,webp,gif,avif,svg,mp3}', {
  eager: true,
  query: '?url',
  import: 'default',
})

const assetUrls = [...new Set(Object.values(assetModules))]

export type AssetPreloadProgress = {
  loaded: number
  total: number
}

const AUDIO_EXTENSIONS = /\.(mp3)(?:[?#].*)?$/i

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

async function loadAudio(url: string): Promise<void> {
  // Fetch the complete file so the browser has the bytes before the game starts.
  // The Audio element then uses the same URL and can reuse the HTTP cache.
  try {
    const response = await fetch(url, { cache: 'force-cache' })
    if (response.ok) {
      await response.arrayBuffer()
      return
    }
  } catch {
    // Fall back to the media element below. A failed preload must not block the site.
  }

  await new Promise<void>((resolve) => {
    const audio = new Audio()
    let settled = false

    const finish = () => {
      if (settled) return
      settled = true
      audio.removeAttribute('src')
      audio.load()
      resolve()
    }

    audio.preload = 'auto'
    audio.addEventListener('canplaythrough', finish, { once: true })
    audio.addEventListener('error', finish, { once: true })
    audio.src = url
    audio.load()

    // Some browsers do not fire canplaythrough for cached media.
    window.setTimeout(finish, 15000)
  })
}

async function loadAsset(url: string): Promise<void> {
  if (AUDIO_EXTENSIONS.test(url)) {
    await loadAudio(url)
    return
  }

  await loadImage(url)
}

export async function preloadAllAssets(
  onProgress?: (progress: AssetPreloadProgress) => void,
): Promise<void> {
  const total = assetUrls.length
  let loaded = 0

  onProgress?.({ loaded, total })

  if (total === 0) return

  await Promise.all(
    assetUrls.map(async (url) => {
      await loadAsset(url)
      loaded += 1
      onProgress?.({ loaded, total })
    }),
  )
}
