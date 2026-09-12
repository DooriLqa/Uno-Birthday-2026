import { useEffect, useState } from 'react'
import { preloadAllAssets, type AssetPreloadProgress } from '@/shared/lib/assets/preloadAssets'
import './AssetPreloader.css'

type Props = {
  onReady: () => void
}

export function AssetPreloader({ onReady }: Props) {
  const [progress, setProgress] = useState<AssetPreloadProgress>({ loaded: 0, total: 0 })

  useEffect(() => {
    let cancelled = false

    void preloadAllAssets((next) => {
      if (!cancelled) setProgress(next)
    }).then(() => {
      if (!cancelled) onReady()
    })

    return () => {
      cancelled = true
    }
  }, [onReady])

  const percent = progress.total === 0 ? 100 : Math.round((progress.loaded / progress.total) * 100)

  return (
    <main className="asset-preloader" aria-live="polite" aria-label="Подготовка">
      <div className="asset-preloader__card">
        <div className="asset-preloader__title">Подготовка острова</div>
        <div className="asset-preloader__text">Загружаем файлы…</div>
        <div
          className="asset-preloader__bar"
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={percent}
        >
          <div className="asset-preloader__fill" style={{ width: `${percent}%` }} />
        </div>
        <div className="asset-preloader__percent">{percent}%</div>
      </div>
    </main>
  )
}
