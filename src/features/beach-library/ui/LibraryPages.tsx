import { useRef } from 'react'
import { useLibraryPages } from '../model/pagesStore'
import { LETTER_PAGE } from '../model/config'
import { PAGE_ASSETS } from '../model/pageAssets'
import './BeachLibrary.css'

export function LibraryPages() {
  const { pages, toggle, move } = useLibraryPages()
  const drag = useRef<{ id: string; dx: number; dy: number } | null>(null)
  return (
    <div className="library-pages">
      {pages.map((page) => {
        const letters = page.id === LETTER_PAGE
        const asset = PAGE_ASSETS[page.id]
        if (!asset) return null
        return (
          <article
            key={page.id}
            className={`library-pages__sheet ${letters ? 'is-letters' : ''}`}
            style={{ left: page.x, top: page.y }}
            aria-label={asset.title}
            onPointerDown={(event) => {
              if ((event.target as HTMLElement).closest('button')) return
              drag.current = { id: page.id, dx: event.clientX - page.x, dy: event.clientY - page.y }
              event.currentTarget.setPointerCapture(event.pointerId)
            }}
            onPointerMove={(event) => {
              if (drag.current?.id !== page.id) return
              move(
                page.id,
                Math.max(0, Math.min(window.innerWidth - 60, event.clientX - drag.current.dx)),
                Math.max(0, Math.min(window.innerHeight - 50, event.clientY - drag.current.dy)),
              )
            }}
            onPointerUp={() => {
              drag.current = null
            }}
            onPointerCancel={() => {
              drag.current = null
            }}
          >
            {asset.src ? (
              <img
                className="library-pages__paper"
                src={asset.src}
                alt={asset.description}
                draggable={false}
              />
            ) : (
              <div className="library-pages__note">
                <small>Пляжная библиотека</small>
                <h2>{asset.title}</h2>
                <p>{asset.description}</p>
              </div>
            )}
            <button
              className="library-pages__return"
              onClick={() => toggle(page.id)}
              aria-label="Убрать страницу в инвентарь"
            >
              ↩
            </button>
          </article>
        )
      })}
    </div>
  )
}
