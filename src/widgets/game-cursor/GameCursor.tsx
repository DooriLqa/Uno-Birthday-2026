import { useEffect, useRef } from 'react'
import './GameCursor.css'

const assets = import.meta.glob<string>('/src/shared/assets/common/cursors/*.png', {
  eager: true,
  query: '?url',
  import: 'default',
})
const cursorUrls = new Map(
  Object.entries(assets).map(([path, url]) => [path.split('/').at(-1), url]),
)

/** Render large cursor sprites within the viewport to avoid browser edge fallback. */
export function GameCursor() {
  const layerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const layer = layerRef.current
    if (!layer) return
    const supportsPopover = typeof layer.showPopover === 'function'
    if (supportsPopover) {
      layer.showPopover()
    } else {
      layer.removeAttribute('popover')
    }
    const root = document.documentElement
    const images = new Map<string, HTMLImageElement>()
    const failed = new Set<string>()
    let x = 0
    let y = 0
    let inside = false
    let frame = 0
    let disposed = false
    let shown: HTMLImageElement | null = null

    const hide = () => {
      root.style.removeProperty('--cursor-rendering')
      layer.dataset.visible = 'false'
    }

    const render = () => {
      frame = 0
      if (disposed || !inside) return
      const target = document.elementFromPoint(x, y)
      if (!target) {
        hide()
        return
      }
      const style = getComputedStyle(target)
      // Explicit system cursors (text, crosshair, resize, etc.) retain their behavior.
      const value =
        style.cursor === 'none' ? style.getPropertyValue('--cursor-image') : style.cursor
      const match = /^url\(["']?([^"')]+)["']?\)\s*(?:(\d+)\s+(\d+))?/.exec(value.trim())
      if (!match) {
        hide()
        return
      }
      const url = cursorUrls.get(match[1].split('/').at(-1)) ?? match[1]
      if (failed.has(url)) {
        hide()
        return
      }
      let image = images.get(url)
      if (!image) {
        image = new Image()
        image.alt = ''
        image.draggable = false
        image.onload = () => {
          if (!disposed) schedule()
        }
        image.onerror = () => {
          failed.add(url)
          if (!disposed) schedule()
        }
        images.set(url, image)
        image.src = url
      }
      if (!image.complete || !image.naturalWidth) {
        hide()
        return
      }
      if (shown !== image) {
        layer.replaceChildren(image)
        shown = image
      }
      image.style.transform = `translate3d(${x - Number(match[2] ?? 0)}px, ${y - Number(match[3] ?? 0)}px, 0)`
      layer.dataset.visible = 'true'
      root.style.setProperty('--cursor-rendering', 'none')
    }

    function schedule() {
      if (!frame && inside && !disposed) frame = requestAnimationFrame(render)
    }

    const track = (event: PointerEvent) => {
      if (event.pointerType !== 'mouse') {
        leave()
        return
      }
      x = event.clientX
      y = event.clientY
      inside = x >= 0 && y >= 0 && x < window.innerWidth && y < window.innerHeight
      if (inside) schedule()
      else hide()
    }
    const leave = () => {
      inside = false
      hide()
    }
    const out = (event: PointerEvent) => {
      if (!event.relatedTarget) leave()
    }
    const visibility = () => {
      if (document.hidden) leave()
    }
    const dragStart = () => leave()

    // Preload the small set so a context change does not expose a native fallback.
    for (const url of cursorUrls.values()) {
      const image = new Image()
      image.alt = ''
      image.draggable = false
      image.onload = schedule
      image.onerror = () => {
        failed.add(url)
        schedule()
      }
      images.set(url, image)
      image.src = url
    }

    document.addEventListener('pointermove', track, true)
    document.addEventListener('pointerover', track, true)
    document.addEventListener('pointerdown', track, true)
    document.addEventListener('pointerup', track, true)
    document.addEventListener('pointerout', out, true)
    document.addEventListener('pointercancel', leave, true)
    document.addEventListener('dragstart', dragStart, true)
    document.addEventListener('visibilitychange', visibility)
    document.addEventListener('scroll', schedule, true)
    window.addEventListener('blur', leave)
    window.addEventListener('resize', schedule)
    return () => {
      disposed = true
      cancelAnimationFrame(frame)
      hide()
      document.removeEventListener('pointermove', track, true)
      document.removeEventListener('pointerover', track, true)
      document.removeEventListener('pointerdown', track, true)
      document.removeEventListener('pointerup', track, true)
      document.removeEventListener('pointerout', out, true)
      document.removeEventListener('pointercancel', leave, true)
      document.removeEventListener('dragstart', dragStart, true)
      document.removeEventListener('visibilitychange', visibility)
      document.removeEventListener('scroll', schedule, true)
      window.removeEventListener('blur', leave)
      window.removeEventListener('resize', schedule)
      if (supportsPopover && layer.matches(':popover-open')) layer.hidePopover()
    }
  }, [])

  return (
    <div
      ref={layerRef}
      className="game-cursor"
      aria-hidden="true"
      data-visible="false"
      popover="manual"
    />
  )
}
