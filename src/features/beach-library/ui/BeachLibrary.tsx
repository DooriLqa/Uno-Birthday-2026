import { useEffect, useRef, useState, type CSSProperties } from 'react'
import { BOOKS, GENRES, DIRECTIONS, ROWS, isBookCorrect } from '../model/config'
import { useLibraryStore } from '../model/store'
import { playOneShotSound } from '@/shared/lib/audio/playOneShotSound'
import floorBook from '../assets/floor-book.png'
import { PAGE_ASSETS } from '../model/pageAssets'
import './BeachLibrary.css'

export function BeachLibrary() {
  const { slots, enter, place, rewarded } = useLibraryStore()
  const [held, setHeld] = useState<number | null>(null)
  const [pointer, setPointer] = useState({ x: 50, y: 70 })
  const [category, setCategory] = useState<{ name: string; description: string } | null>(null)
  const [status, setStatus] = useState(
    'Сверху — жанр, слева — направление. Поставь книгу на их пересечение.',
  )
  const [flight, setFlight] = useState<{ x: number; y: number; page: string } | null>(null)
  const canvas = useRef<HTMLDivElement>(null)
  useEffect(() => {
    enter()
  }, [enter])
  useEffect(() => {
    // Picking a floor book removes its focused button. Listen on window so Escape
    // still works on the very first pickup, even when focus falls back to body.
    const cancel = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return
      setHeld(null)
      setCategory(null)
    }
    window.addEventListener('keydown', cancel)
    return () => window.removeEventListener('keydown', cancel)
  }, [])
  const pick = (id: number, element: HTMLElement) => {
    if (held !== null) return
    const bounds = element.getBoundingClientRect()
    const scene = canvas.current!.getBoundingClientRect()
    setPointer({
      x: ((bounds.left + bounds.width / 2 - scene.left) / scene.width) * 100,
      y: ((bounds.top - scene.top) / scene.height) * 100,
    })
    setHeld(id)
  }
  const drop = (slot: number) => {
    if (held === null) return
    const rewards = place(held, slot)
    if (!rewards) {
      setStatus('Не удалось поставить книгу. Выбери место на полке.')
      return
    }
    const correct = isBookCorrect(held, slot)
    playOneShotSound(correct ? '/audio/sfx/coin.mp3' : '/audio/sfx/brick.mp3', 'library', 0.45)
    setStatus(
      rewards.length
        ? `Стеллаж собран! В инвентарь добавлены страницы: ${rewards.length}.`
        : correct
          ? 'Верно! Жанр и направление совпадают.'
          : 'Жанр или направление не совпадает. Книгу можно переставить.',
    )
    if (rewards.length) {
      const row = ROWS[Math.floor(slot / 5)]
      setFlight({ x: row.x + ((slot % 5) * row.width) / 5, y: row.y, page: rewards[0] })
    }
    setHeld(null)
  }
  return (
    <div
      ref={canvas}
      className="beach-library"
      aria-label="Расстановка книг по жанрам и направлениям"
      onPointerMove={(event) => {
        if (held === null) return
        const bounds = event.currentTarget.getBoundingClientRect()
        setPointer({
          x: ((event.clientX - bounds.left) / bounds.width) * 100,
          y: ((event.clientY - bounds.top) / bounds.height) * 100,
        })
      }}
    >
      {GENRES.map((genre, column) => {
        const row = ROWS[column * 3]
        return (
          <button
            key={genre.name}
            className="beach-library__axis beach-library__axis--column"
            style={{ left: `${row.x}%`, width: `${row.width}%` }}
            aria-label={`Жанр: ${genre.name}`}
            onClick={() => setCategory(genre)}
          >
            <span>{genre.icon.includes('/') ? <img src={genre.icon} alt="" /> : genre.icon}</span>
            {genre.name}
          </button>
        )
      })}
      {DIRECTIONS.map((direction, index) => (
        <button
          key={direction.name}
          className="beach-library__axis beach-library__axis--row"
          style={{ top: `${ROWS[index].y + ROWS[index].height / 2}%` }}
          aria-label={`Направление: ${direction.name}`}
          onClick={() => setCategory(direction)}
        >
          <span>
            {direction.icon.includes('/') ? <img src={direction.icon} alt="" /> : direction.icon}
          </span>
          {direction.name}
        </button>
      ))}
      {ROWS.map((row) => (
        <div
          key={row.id}
          className="beach-library__row"
          style={{
            left: `${row.x}%`,
            top: `${row.y}%`,
            width: `${row.width}%`,
            height: `${row.height}%`,
          }}
        >
          {Array.from({ length: 5 }, (_, column) => {
            const slot = row.id * 5 + column
            const id = slots[slot]
            const book = id === null ? null : BOOKS[id]
            return (
              <button
                key={slot}
                className={`beach-library__slot ${held !== null ? 'is-target' : ''}`}
                aria-label={
                  book
                    ? book.title
                    : `${GENRES[row.cabinet].name}, ${DIRECTIONS[row.direction].name}, место ${column + 1}`
                }
                onClick={(event) =>
                  held !== null ? drop(slot) : book && pick(book.id, event.currentTarget)
                }
              >
                {book && held !== book.id && (
                  <span
                    className="beach-library__spine"
                    style={{ '--book-color': book.color } as CSSProperties}
                  />
                )}
              </button>
            )
          })}
        </div>
      ))}
      {BOOKS.filter((book) => !slots.includes(book.id) && held !== book.id).map((book) => (
        <button
          key={book.id}
          className="beach-library__floor"
          aria-label={`Взять книгу: ${book.title}`}
          style={{ left: `${book.x}%`, top: `${book.y}%`, rotate: `${book.angle}deg` }}
          onClick={(event) => pick(book.id, event.currentTarget)}
        >
          <img src={floorBook} alt="" draggable={false} />
        </button>
      ))}
      {held !== null && (
        <div
          className="beach-library__held"
          style={
            {
              left: `${pointer.x}%`,
              top: `${pointer.y}%`,
              '--book-color': BOOKS[held].color,
            } as CSSProperties
          }
        >
          <strong>{BOOKS[held].title}</strong>
          <span className="beach-library__spine" />
        </div>
      )}
      {flight && (
        <span
          key={`${flight.x}-${flight.y}-${rewarded.length}`}
          className="beach-library__flight"
          style={{ left: `${flight.x}%`, top: `${flight.y}%` }}
          onAnimationEnd={() => setFlight(null)}
        >
          <img src={PAGE_ASSETS[flight.page].src} alt="Найденная страница" />
        </span>
      )}
      <div className="beach-library__help">
        <span role="status">{status}</span> <small>Стеллажи: {rewarded.length}/3</small>
        {held !== null && <button onClick={() => setHeld(null)}>Вернуть книгу · Esc</button>}
      </div>
      {category !== null && (
        <div className="beach-library__genre-info" role="dialog" aria-label={category.name}>
          <h3>{category.name}</h3>
          <p>{category.description}</p>
          <button autoFocus onClick={() => setCategory(null)}>
            Понятно
          </button>
        </div>
      )}
    </div>
  )
}
