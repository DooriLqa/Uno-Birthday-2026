import { useEffect, useRef, useState, type CSSProperties } from 'react'
import { BOOKS, GENRES, ROWS } from '../model/config'
import { useLibraryStore } from '../model/store'
import { playOneShotSound } from '@/shared/lib/audio/playOneShotSound'
import floorBook from '../assets/floor-book.png'
import './BeachLibrary.css'

export function BeachLibrary() {
  const { slots, enter, place, rewarded } = useLibraryStore()
  const [held, setHeld] = useState<number | null>(null)
  const [pointer, setPointer] = useState({ x: 50, y: 70 })
  const [genre, setGenre] = useState<number | null>(null)
  const [status, setStatus] = useState(
    'Выбери книгу и поставь её в ряд подходящего жанра. Значки на полках — подсказки.',
  )
  const [flight, setFlight] = useState<{ x: number; y: number } | null>(null)
  const canvas = useRef<HTMLDivElement>(null)
  useEffect(() => {
    enter()
  }, [enter])
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
    const correct = BOOKS[held].genre === Math.floor(slot / 5)
    playOneShotSound(correct ? '/audio/sfx/coin.mp3' : '/audio/sfx/brick.mp3', 'library', 0.45)
    setStatus(
      rewards.length
        ? `Стеллаж собран! В инвентарь добавлены страницы: ${rewards.length}.`
        : correct
          ? 'Верно! Эта книга подходит к жанру.'
          : 'Жанр не совпадает. Книгу можно переставить.',
    )
    if (rewards.length) {
      const row = ROWS[Math.floor(slot / 5)]
      setFlight({ x: row.x + ((slot % 5) * row.width) / 5, y: row.y })
    }
    setHeld(null)
  }
  return (
    <div
      ref={canvas}
      className="beach-library"
      aria-label="Расстановка книг по жанрам"
      onPointerMove={(event) => {
        if (held === null) return
        const bounds = event.currentTarget.getBoundingClientRect()
        setPointer({
          x: ((event.clientX - bounds.left) / bounds.width) * 100,
          y: ((event.clientY - bounds.top) / bounds.height) * 100,
        })
      }}
      onKeyDown={(event) => {
        if (event.key === 'Escape') {
          setHeld(null)
          setGenre(null)
        }
      }}
    >
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
          <button
            className="beach-library__genre"
            aria-label={`Жанр: ${GENRES[row.id].name}`}
            onClick={() => setGenre(row.id)}
          >
            {GENRES[row.id].icon.includes('/') ? (
              <img src={GENRES[row.id].icon} alt="" />
            ) : (
              GENRES[row.id].icon
            )}
          </button>
          {Array.from({ length: 5 }, (_, column) => {
            const slot = row.id * 5 + column
            const id = slots[slot]
            const book = id === null ? null : BOOKS[id]
            return (
              <button
                key={slot}
                className={`beach-library__slot ${held !== null ? 'is-target' : ''}`}
                aria-label={book ? book.title : `${GENRES[row.id].name}, место ${column + 1}`}
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
          📄
        </span>
      )}
      <div className="beach-library__help">
        <span role="status">{status}</span> <small>Стеллажи: {rewarded.length}/3</small>
        {held !== null && <button onClick={() => setHeld(null)}>Вернуть книгу · Esc</button>}
      </div>
      {genre !== null && (
        <div className="beach-library__genre-info" role="dialog" aria-label={GENRES[genre].name}>
          <h3>{GENRES[genre].name}</h3>
          <p>{GENRES[genre].description}</p>
          <button autoFocus onClick={() => setGenre(null)}>
            Понятно
          </button>
        </div>
      )}
    </div>
  )
}
