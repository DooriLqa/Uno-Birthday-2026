import { useEffect, useRef, useState } from 'react'
import { locations, type LocationAction, type LocationId } from '../model/locations'
import { useWorldStore, type SceneSnapshot } from '../model/worldStore'
import { playOneShotSound } from '@/shared/lib/audio/playOneShotSound'
import { useDialogueStore } from '@/features/dialogues'
import { useProgressStore } from '@/features/game-progress/model/store'
import { BeachLibrary } from '@/features/beach-library/ui/BeachLibrary'
import ritualSiteExtinguished from '@/shared/assets/locations/wild/ritual-site-extinguished-v4.png'
import ritualSiteLit from '@/shared/assets/locations/wild/ritual-site-lit-v4.png'
import totemCloseupExtinguished from '@/shared/assets/locations/wild/totem-cape-closeup-extinguished-v3.png'
import totemCloseupLit from '@/shared/assets/locations/wild/totem-cape-closeup-lit-v3.png'
import { talkToLibrarian } from '@/features/beach-library/model/librarianDialogue'
import './LocationNavigator.css'

type Props = {
  active: boolean
  visible?: boolean
  onOpenMap: () => void
  onOpenGame: (gameId: string) => void
  onMerchant: () => void
  onSailor: () => void
  onEnterJungleCave: () => void
  onBarista: () => void
}
type Size = { width: number; height: number }
const imageCache = new Map<string, Promise<Size>>()
function preload(source: string) {
  let promise = imageCache.get(source)
  if (!promise) {
    promise = (async () => {
      const image = new Image()
      image.src = source
      await image.decode()
      return { width: image.naturalWidth, height: image.naturalHeight }
    })()
    imageCache.set(source, promise)
    void promise.catch(() => imageCache.delete(source))
  }
  return promise
}

export function LocationNavigator({
  active,
  visible = active,
  onOpenMap,
  onOpenGame,
  onMerchant,
  onSailor,
  onEnterJungleCave,
  onBarista,
}: Props) {
  const { scene, history, setScene, setHistory } = useWorldStore()
  const location = locations[scene.locationId] ?? locations.pier
  const dialogueOpen = useDialogueStore((state) => state.activeDialogueId !== null)
  const totemCodeSolved = useProgressStore((state) => state.completedGameIds.includes('totem-code'))
  const sceneImage =
    location.id === 'totem-camp'
      ? totemCodeSolved
        ? totemCloseupLit
        : totemCloseupExtinguished
      : location.image
  const [size, setSize] = useState<Size | null>(null)
  const [viewport, setViewport] = useState({ width: window.innerWidth, height: window.innerHeight })
  const [error, setError] = useState('')
  const lock = useRef(false)
  const frame = useRef(0)
  const direction = useRef(0)
  const mounted = useRef(true)

  useEffect(() => {
    mounted.current = true
    const resize = () => setViewport({ width: window.innerWidth, height: window.innerHeight })
    window.addEventListener('resize', resize)
    return () => {
      mounted.current = false
      window.removeEventListener('resize', resize)
      cancelAnimationFrame(frame.current)
    }
  }, [])

  useEffect(() => {
    let cancelled = false
    void preload(location.image)
      .then((next) => {
        if (!cancelled) setSize(next)
      })
      .catch(() => {
        if (!cancelled) setError('Не удалось загрузить сцену. Попробуйте ещё раз.')
      })
    // Prefetch only direct neighbours; failures never hide the current scene.
    for (const hotspot of location.hotspots) {
      if (hotspot.action.type === 'location')
        void preload(locations[hotspot.action.locationId].image).catch(() => {})
    }
    return () => {
      cancelled = true
    }
  }, [location])

  useEffect(() => {
    if (!active || dialogueOpen) {
      direction.current = 0
      cancelAnimationFrame(frame.current)
    }
  }, [active, dialogueOpen])

  const aspect = size ? size.width / size.height : 16 / 9
  const width = Math.max(viewport.width, viewport.height * aspect)
  const height = width / aspect
  const overflow = width - viewport.width
  const layout = {
    width,
    height,
    left: 0,
    top: (viewport.height - height) / 2,
    transform: 'translate3d(' + -overflow * (location.isWide ? scene.pan : 0.5) + 'px,0,0)',
  }
  const stop = () => {
    direction.current = 0
    cancelAnimationFrame(frame.current)
  }
  const change = async (next: SceneSnapshot, nextHistory: SceneSnapshot[]) => {
    if (lock.current) return
    lock.current = true
    stop()
    setError('')
    playOneShotSound(locations[next.locationId].transitionSound)
    try {
      const nextSize = await preload(locations[next.locationId].image)
      if (!mounted.current) return
      setSize(nextSize)
      setScene(next)
      setHistory(nextHistory)
    } catch {
      setError('Не удалось загрузить сцену. Нажмите на переход ещё раз.')
    } finally {
      lock.current = false
    }
  }
  const navigate = (id: LocationId) =>
    void change({ locationId: id, pan: 0.5 }, [...history, scene])
  const action = (item: LocationAction) => {
    if (lock.current || dialogueOpen) return
    if (item.type === 'location') navigate(item.locationId)
    if (item.type === 'game') onOpenGame(item.gameId)
    if (item.type === 'merchant') onMerchant()
    if (item.type === 'sailor') onSailor()
    if (item.type === 'librarian') talkToLibrarian()
    if (item.type === 'map') onOpenMap()
    if (item.type === 'jungle-cave') onEnterJungleCave()
    if (item.type === 'barista') onBarista()
  }
  const back = () => {
    const previous = history.at(-1)
    if (previous) void change(previous, history.slice(0, -1))
    else onOpenMap()
  }
  const pan = (value: number) => {
    stop()
    direction.current = value
    let previous = performance.now()
    const tick = (now: number) => {
      const dt = Math.min(now - previous, 50)
      previous = now
      const current = useWorldStore.getState().scene
      setScene({
        ...current,
        pan: Math.min(
          1,
          Math.max(0, current.pan + (direction.current * dt * 0.33) / Math.max(1, overflow)),
        ),
      })
      if (direction.current) frame.current = requestAnimationFrame(tick)
    }
    frame.current = requestAnimationFrame(tick)
  }

  return (
    <section
      className={`location-navigator ${active ? 'is-active' : ''}`}
      aria-label={location.title}
      style={{ visibility: visible ? 'visible' : 'hidden' }}
      inert={!active || dialogueOpen}
    >
      <div className="location-navigator__scene">
        <img className="location-navigator__image" style={layout} src={sceneImage} alt="" />
        <div className="location-navigator__hotspot-layer">
          <div className="location-navigator__hotspot-canvas is-wide" style={layout}>
            {location.id === 'library' && active && !dialogueOpen && <BeachLibrary />}
            {location.id === 'wild-beach' && (
              <img
                className="location-navigator__ritual-site"
                src={totemCodeSolved ? ritualSiteLit : ritualSiteExtinguished}
                alt=""
                aria-hidden="true"
                draggable="false"
              />
            )}
            {location.hotspots.map((hotspot) => (
              <button
                key={hotspot.id}
                type="button"
                className={
                  'location-navigator__hotspot cursor-' + (hotspot.cursor ?? 'projected-forward')
                }
                style={hotspot.area}
                onClick={() => action(hotspot.action)}
                aria-label={hotspot.label}
              >
                <span>{hotspot.label}</span>
              </button>
            ))}
          </div>
        </div>
        {location.isWide &&
          overflow > 1 &&
          ([-1, 1] as const).map((side) => (
            <button
              key={side}
              type="button"
              className={
                'location-navigator__pan-zone location-navigator__pan-zone--' +
                (side < 0 ? 'left' : 'right')
              }
              onMouseEnter={() => pan(side)}
              onMouseLeave={stop}
              onBlur={stop}
              onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') pan(side)
              }}
              onKeyUp={stop}
              aria-label={side < 0 ? 'Посмотреть влево' : 'Посмотреть вправо'}
            />
          ))}
      </div>
      <div className="location-navigator__caption">{location.title}</div>
      {error && (
        <div className="location-navigator__error" role="alert">
          {error}
        </div>
      )}
      {(history.length > 0 || scene.locationId !== 'pier') && (
        <button
          type="button"
          className="location-navigator__back-zone"
          onClick={back}
          aria-label="Вернуться назад"
        />
      )}
    </section>
  )
}
