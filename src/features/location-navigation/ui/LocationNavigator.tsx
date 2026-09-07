import { useEffect, useRef, useState, type CSSProperties } from 'react'
import type { LocationAction, LocationDefinition, LocationId } from '../model/locations'
import { locations } from '../model/locations'
import { playOneShotSound } from '@/shared/lib/audio/playOneShotSound'
import './LocationNavigator.css'

type Pan = number
type LocationSnapshot = { locationId: LocationId; pan: Pan }
type Scene = LocationSnapshot
type ImageSize = { width: number; height: number }
type ImageLayout = Pick<CSSProperties, 'width' | 'height' | 'left' | 'top' | 'transform'>

type Props = {
  initialLocationId: LocationId
  onExit: (transitionSound?: string) => void
  onOpenGame: (gameId: string) => void
  onOpenDialogue: (dialogueId: 'merchant-greeting') => void
}

const IMAGE_REVEAL_MS = 140

async function preloadImage(source: string): Promise<ImageSize> {
  const image = new Image()
  image.src = source

  if (!image.complete) {
    await new Promise<void>((resolve, reject) => {
      image.addEventListener('load', () => resolve(), { once: true })
      image.addEventListener('error', () => reject(new Error(`Could not load ${source}`)), {
        once: true,
      })
    })
  }

  await image.decode?.().catch(() => undefined)
  return { width: image.naturalWidth, height: image.naturalHeight }
}

function getImageLayout(location: LocationDefinition, pan: Pan, imageSize?: ImageSize): ImageLayout {
  if (!location.isWide || !imageSize) {
    return { width: '100%', height: '100%', left: 0, top: 0, transform: 'translate3d(0, 0, 0)' }
  }

  const viewportWidth = window.innerWidth
  const viewportHeight = window.innerHeight
  const aspect = imageSize.width / imageSize.height
  const renderedWidth = Math.max(viewportWidth, viewportHeight * aspect)
  const renderedHeight = Math.max(viewportHeight, viewportWidth / aspect)
  const overflowX = Math.max(0, renderedWidth - viewportWidth)

  return {
    width: renderedWidth,
    height: renderedHeight,
    left: 0,
    top: (viewportHeight - renderedHeight) / 2,
    transform: `translate3d(${-overflowX * pan}px, 0, 0)`,
  }
}

function SceneImage({
  scene,
  imageSize,
  className,
}: {
  scene: Scene
  imageSize?: ImageSize
  className?: string
}) {
  const location = locations[scene.locationId]

  return (
    <div className={`location-navigator__scene-layer ${className ?? ''}`} aria-hidden="true">
      <div className="location-navigator__canvas">
        <img
          className={`location-navigator__image ${location.isWide ? 'is-wide' : ''}`}
          style={getImageLayout(location, scene.pan, imageSize)}
          src={location.image}
          alt=""
        />
      </div>
    </div>
  )
}

export function LocationNavigator({
  initialLocationId,
  onExit,
  onOpenGame,
  onOpenDialogue,
}: Props) {
  const [scene, setScene] = useState<Scene>({ locationId: initialLocationId, pan: 0 })
  const [outgoingScene, setOutgoingScene] = useState<Scene | null>(null)
  const [isIncomingVisible, setIsIncomingVisible] = useState(true)
  const [history, setHistory] = useState<LocationSnapshot[]>([])
  const [imageSizes, setImageSizes] = useState<Record<string, ImageSize>>({})
  const [, setViewportVersion] = useState(0)
  const transitionLock = useRef(false)
  const revealTimer = useRef<number | null>(null)
  const panFrame = useRef<number | null>(null)
  const panDirection = useRef<-1 | 0 | 1>(0)
  const panLastTimestamp = useRef(0)

  const location = locations[scene.locationId]
  const canPan = Boolean(location.isWide && imageSizes[location.image])
  const hotspotLayout = getImageLayout(location, scene.pan, imageSizes[location.image])

  useEffect(() => {
    void Promise.all(
      Object.values(locations).map(async (item) => [item.image, await preloadImage(item.image)] as const),
    ).then((entries) => setImageSizes(Object.fromEntries(entries)))

    const handleResize = () => setViewportVersion((version) => version + 1)
    window.addEventListener('resize', handleResize)
    return () => {
      window.removeEventListener('resize', handleResize)
      if (revealTimer.current !== null) window.clearTimeout(revealTimer.current)
      if (panFrame.current !== null) window.cancelAnimationFrame(panFrame.current)
    }
  }, [])

  const changeScene = async (nextScene: Scene) => {
    if (transitionLock.current) return
    transitionLock.current = true

    try {
      const nextImageSize = await preloadImage(locations[nextScene.locationId].image)
      setImageSizes((current) => ({ ...current, [locations[nextScene.locationId].image]: nextImageSize }))
      setOutgoingScene(scene)
      setScene(nextScene)
      setIsIncomingVisible(false)

      window.requestAnimationFrame(() => setIsIncomingVisible(true))
      revealTimer.current = window.setTimeout(() => {
        setOutgoingScene(null)
        transitionLock.current = false
      }, IMAGE_REVEAL_MS)
    } catch {
      transitionLock.current = false
    }
  }

  const navigate = (nextLocationId: LocationId) => {
    if (transitionLock.current) return

    playOneShotSound(locations[nextLocationId].transitionSound)
    setHistory((current) => [...current, scene])
    void changeScene({ locationId: nextLocationId, pan: 0 })
  }

  const handleAction = (action: LocationAction) => {
    if (action.type === 'location') navigate(action.locationId)
    if (action.type === 'game') onOpenGame(action.gameId)
    if (action.type === 'dialogue') onOpenDialogue(action.dialogueId)
  }

  const goBack = () => {
    if (transitionLock.current) return

    const previousScene = history.at(-1)
    if (!previousScene) {
      onExit(location.transitionSound)
      return
    }

    playOneShotSound(locations[previousScene.locationId].transitionSound)
    setHistory((current) => current.slice(0, -1))
    void changeScene(previousScene)
  }

  const stopPanning = () => {
    panDirection.current = 0
    if (panFrame.current !== null) window.cancelAnimationFrame(panFrame.current)
    panFrame.current = null
  }

  const startPanning = (direction: -1 | 1) => {
    if (panDirection.current === direction) return

    stopPanning()
    panDirection.current = direction
    panLastTimestamp.current = performance.now()

    const move = (timestamp: number) => {
      const elapsed = timestamp - panLastTimestamp.current
      panLastTimestamp.current = timestamp
      const increment = (elapsed / 1800) * panDirection.current

      setScene((current) => ({
        ...current,
        pan: Math.min(1, Math.max(0, current.pan + increment)),
      }))

      if (panDirection.current !== 0) panFrame.current = window.requestAnimationFrame(move)
    }

    panFrame.current = window.requestAnimationFrame(move)
  }

  return (
    <section className="location-navigator" aria-label={location.title}>
      <div className="location-navigator__scene">
        {outgoingScene && (
          <SceneImage
            scene={outgoingScene}
            imageSize={imageSizes[locations[outgoingScene.locationId].image]}
            className="is-outgoing"
          />
        )}
        <SceneImage
          scene={scene}
          imageSize={imageSizes[location.image]}
          className={isIncomingVisible ? 'is-visible' : 'is-incoming'}
        />

        <div className="location-navigator__hotspot-layer">
          <div
            className={`location-navigator__hotspot-canvas ${location.isWide ? 'is-wide' : ''}`}
            style={hotspotLayout}
          >
            {location.hotspots.map((hotspot) => (
              <button
                key={hotspot.id}
                type="button"
                className={`location-navigator__hotspot ${
                  hotspot.action.type === 'location' ? '' : 'is-interactive'
                } ${hotspot.cursor ? `cursor-${hotspot.cursor}` : ''}`}
                style={hotspot.area}
                onClick={() => handleAction(hotspot.action)}
                aria-label={hotspot.label}
              >
                <span>{hotspot.label}</span>
              </button>
            ))}
          </div>
        </div>

        {canPan && (
          <button
            type="button"
            className="location-navigator__pan-zone location-navigator__pan-zone--left"
            onMouseEnter={() => startPanning(-1)}
            onMouseLeave={stopPanning}
            onFocus={() => startPanning(-1)}
            onBlur={stopPanning}
            aria-label="Показать левую часть пляжа"
          />
        )}
        {canPan && (
          <button
            type="button"
            className="location-navigator__pan-zone location-navigator__pan-zone--right"
            onMouseEnter={() => startPanning(1)}
            onMouseLeave={stopPanning}
            onFocus={() => startPanning(1)}
            onBlur={stopPanning}
            aria-label="Показать правую часть пляжа"
          />
        )}
      </div>
      <div className="location-navigator__caption" aria-hidden="true">
        {location.title}
      </div>
      <button
        type="button"
        className="location-navigator__back-zone"
        onClick={goBack}
        aria-label={history.length ? 'Вернуться назад' : 'Вернуться к карте'}
      />
    </section>
  )
}
