import { useCallback, useState } from 'react'
import { RouterProvider } from 'react-router-dom'
import { DialogueLayer } from '@/features/dialogues'
import { AudioSettings } from '@/widgets/audio-settings/AudioSettings'
import { AssetPreloader } from '@/widgets/asset-preloader/AssetPreloader'
import { GameCursor } from '@/widgets/game-cursor/GameCursor'
import { router } from './router'
import { ProductionAccessGate } from './ProductionAccessGate'
import { LibraryPages } from '@/features/beach-library/ui/LibraryPages'
import '@/shared/styles/global.css'

const isMobileDevice = () => window.matchMedia('(max-width: 700px)').matches

export function App() {
  const [assetsReady, setAssetsReady] = useState(false)
  const handleAssetsReady = useCallback(() => setAssetsReady(true), [])

  // На мобильных устройствах предзагрузка не запускается вообще.
  // Гейт доступа тоже не применяется — сразу рендерится мобильная страница через роутер.
  if (isMobileDevice()) {
    return (
      <>
        <RouterProvider router={router} />
        <LibraryPages />
        <DialogueLayer />
        <AudioSettings />
        <GameCursor />
      </>
    )
  }

  return (
    <ProductionAccessGate>
      {!assetsReady ? (
        <AssetPreloader onReady={handleAssetsReady} />
      ) : (
        <>
          <RouterProvider router={router} />
          <LibraryPages />
          <DialogueLayer />
          <AudioSettings />
          <GameCursor />
        </>
      )}
    </ProductionAccessGate>
  )
}
