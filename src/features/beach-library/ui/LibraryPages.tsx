import { useRef } from 'react'
import { useLibraryPages } from '../model/pagesStore'
import { HOLES, INSTRUCTION, LETTER_PAGE, LETTERS, NOTE_PAGE, pageId } from '../model/config'
import './BeachLibrary.css'

export function LibraryPages() {
  const { pages, toggle, move } = useLibraryPages()
  const drag = useRef<{ id: string; dx: number; dy: number } | null>(null)
  return (
    <div className="library-pages">
      {pages.map((page) => {
        const letters = page.id === LETTER_PAGE
        const note = page.id === NOTE_PAGE
        const index = HOLES.findIndex((_, i) => page.id === pageId(i))
        const hole = HOLES[index]
        return (
          <article
            key={page.id}
            className={`library-pages__sheet ${letters ? 'is-letters' : ''}`}
            style={{ left: page.x, top: page.y }}
            aria-label={
              letters ? 'Лист с буквами' : note ? 'Записка библиотекаря' : `Страница ${index + 1}`
            }
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
            <svg viewBox="0 0 300 360" className="library-pages__paper" aria-hidden="true">
              <path
                fill="#f4e5bd"
                fillRule="evenodd"
                stroke="#b4925d"
                d={`M1 1H299V359H1Z ${hole ? `M${hole[0] - 10} ${hole[1] - 10}h20v20h-20Z` : ''}`}
              />
              {letters &&
                LETTERS.map((line, row) =>
                  Array.from(line).map((letter, col) => (
                    <text
                      key={`${row}-${col}`}
                      x={15 + col * 23.3}
                      y={65 + row * 24}
                      fontSize="16"
                      fontFamily="monospace"
                      fill="#4b3826"
                    >
                      {letter}
                    </text>
                  )),
                )}
            </svg>
            <header>
              <span>{letters ? 'Лист с буквами' : note ? 'Записка' : `Страница ${index + 1}`}</span>
              <button onClick={() => toggle(page.id)} aria-label="Убрать страницу в инвентарь">
                ↩
              </button>
            </header>
            {note && <p>{INSTRUCTION}</p>}
            {!letters && !note && <small>Совмести отверстие с буквой</small>}
          </article>
        )
      })}
    </div>
  )
}
