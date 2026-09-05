import { useCallback, useEffect, useRef, useState } from 'react'
import type { CSSProperties, DragEvent, PointerEvent } from 'react'
import './BookShelfGame.css'
import pageArtwork from '@/shared/assets/totem-code/segments/letter-o.png'

type Props = { onComplete: () => void }

type BookColorId = 'rose' | 'sky' | 'sun' | 'mint' | 'violet'

type Book = {
  id: number
  color: BookColorId
  hex: string
  glow: string
}

type ShelfSlot = {
  id: number
  color: BookColorId
}

type FlyingPage = {
  book: Book
  startX: number
  startY: number
  endX: number
  endY: number
}

const BOOK_COUNT = 12
const SHELF_ROW_CAP = 3
const MESSAGE_PAGE_TEXT =
  'С днём рождения! Пусть каждый день будет солнечным, а этот остров хранит самые тёплые воспоминания.'
const randomLetters =
  'Агата рассеянным взглядом проводила лиловое облачко табачного дыма. Она любила курить, но на людях старалась воздерживаться. Закурив вторую сигарету и преодолевая вялость во всем теле, медленно оторвалась от постели. Надела поверх черной блузы бежевый джемпер и встала перед зеркалом. Убедившись, что с одеждой все в порядке, взяла сумочку с туалетными принадлежностями и косметикой и вышла из комнаты. Несмотря на дневное время, в пустом десятиугольном холле было, как обычно, темновато. Лишь стоявший посередине белый стол расплывался в сумраке белым пятном. Десятиугольный осколок неба в потолке был таким же голубовато-серым, как накануне. Первым делом Агата направилась в ванную комнату, быстро умылась и накрасилась. Вернувшись в холл, стала убирать чашки, стаканы и пепельницы, полные окурков, которыми был заставлен стол. И тут…'

const bookColors: Record<BookColorId, { hex: string; glow: string }> = {
  rose: { hex: '#dd6b6b', glow: 'rgba(221, 107, 107, 0.45)' },
  sky: { hex: '#5ea3d9', glow: 'rgba(94, 163, 217, 0.45)' },
  sun: { hex: '#ebbf5b', glow: 'rgba(235, 191, 91, 0.45)' },
  mint: { hex: '#5ab58d', glow: 'rgba(90, 181, 141, 0.45)' },
  violet: { hex: '#9278d1', glow: 'rgba(146, 120, 209, 0.45)' },
}

const colorCycle: BookColorId[] = ['rose', 'sky', 'sun', 'mint', 'violet']
const shelfSlots: ShelfSlot[] = Array.from({ length: BOOK_COUNT }, (_, index) => ({
  id: index + 1,
  color: colorCycle[index % colorCycle.length],
}))

const initialBooks = shelfSlots.map((slot, index) => ({
  id: index + 1,
  color: slot.color,
  hex: bookColors[slot.color].hex,
  glow: bookColors[slot.color].glow,
}))

const getPilePosition = (bookId: number) => {
  const index = bookId - 1
  const column = index % 4
  const row = Math.floor(index / 4)

  return {
    x: 28 + column * 32 + (row % 2 === 0 ? 10 : 18) + (index % 2 === 0 ? 0 : 12),
    y: 18 + row * 14 + (index % 3) * 2,
    rotate: (index % 2 === 0 ? 1 : -1) * (8 + (index % 5) * 2) + (column % 2 === 0 ? 3 : -3),
    scale: 0.96 + (index % 4) * 0.012,
  }
}

type PilePosition = ReturnType<typeof getPilePosition>
type PagePosition = { left: number; top: number }

const initialPilePositions = Object.fromEntries(
  initialBooks.map((book) => [book.id, getPilePosition(book.id)]),
) as Record<number, PilePosition>

export function BookShelfGame({ onComplete }: Props) {
  const [books, setBooks] = useState<Book[]>(initialBooks)
  const [placedBooksBySlot, setPlacedBooksBySlot] = useState<Record<number, Book>>({})
  const [draggedBookId, setDraggedBookId] = useState<number | null>(null)
  const [activeSlotId, setActiveSlotId] = useState<number | null>(null)
  const [fallingBookId, setFallingBookId] = useState<number | null>(null)
  const [dropMotionByBook, setDropMotionByBook] = useState<Record<number, CSSProperties>>({})
  const [pilePositions, setPilePositions] =
    useState<Record<number, PilePosition>>(initialPilePositions)
  const [pileBounds, setPileBounds] = useState<DOMRect | null>(null)
  const [dragPoint, setDragPoint] = useState<{ x: number; y: number } | null>(null)
  const [inventoryPages, setInventoryPages] = useState<Book[]>([])
  const [flyingPage, setFlyingPage] = useState<FlyingPage | null>(null)
  const [placedPages, setPlacedPages] = useState<Book[]>([])
  const [placedPagePositions, setPlacedPagePositions] = useState<Record<number, PagePosition>>({})
  const [specialPageId, setSpecialPageId] = useState<number | null>(null)
  const [draggedPageId, setDraggedPageId] = useState<number | null>(null)
  const [draggedPagePoint, setDraggedPagePoint] = useState<{ x: number; y: number } | null>(null)
  const pileRef = useRef<HTMLDivElement>(null)
  const letterAreaRef = useRef<HTMLDivElement>(null)
  const inventoryRef = useRef<HTMLDivElement>(null)
  const completedDropBookId = useRef<number | null>(null)

  const shelfColumns = Math.max(1, Math.min(BOOK_COUNT, SHELF_ROW_CAP))
  const draggedBook = books.find((book) => book.id === draggedBookId) ?? null
  const draggedPage =
    [...inventoryPages, ...placedPages].find((page) => page.id === draggedPageId) ?? null

  const handlePagePointerDown = (pageId: number, event: PointerEvent<HTMLElement>) => {
    event.preventDefault()
    event.currentTarget.setPointerCapture(event.pointerId)
    setDraggedPageId(pageId)
    setDraggedPagePoint({ x: event.clientX, y: event.clientY })
  }

  const handlePageDropAt = useCallback(
    (pageId: number, clientX: number, clientY: number) => {
      const page = inventoryPages.find((candidate) => candidate.id === pageId)
      const letterAreaBounds = letterAreaRef.current?.getBoundingClientRect()
      if (!letterAreaBounds) return
      const pageWidth = pageId === specialPageId ? 190 : 88
      const pageHeight = pageId === specialPageId ? 150 : 112

      const left = Math.max(
        8,
        Math.min(
          letterAreaBounds.width - pageWidth - 8,
          clientX - letterAreaBounds.left - pageWidth / 2,
        ),
      )
      const top = Math.max(
        8,
        Math.min(
          letterAreaBounds.height - pageHeight - 8,
          clientY - letterAreaBounds.top - pageHeight / 2,
        ),
      )

      if (!page) {
        if (placedPages.some((candidate) => candidate.id === pageId)) {
          setPlacedPagePositions((previousPositions) => ({
            ...previousPositions,
            [pageId]: { left, top },
          }))
        }
        return
      }

      if (placedPages.some((candidate) => candidate.id === page.id)) return

      setPlacedPages((previousPages) => [...previousPages, page])
      setInventoryPages((previousPages) =>
        previousPages.filter((candidate) => candidate.id !== page.id),
      )
      setPlacedPagePositions((previousPositions) => ({
        ...previousPositions,
        [page.id]: { left, top },
      }))
    },
    [inventoryPages, placedPages, specialPageId],
  )

  const handlePageDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    handlePageDropAt(
      Number(event.dataTransfer.getData('application/x-library-page')),
      event.clientX,
      event.clientY,
    )
  }

  const handleInventoryDropById = useCallback(
    (pageId: number) => {
      const page = placedPages.find((candidate) => candidate.id === pageId)
      if (!page || inventoryPages.some((candidate) => candidate.id === page.id)) return

      setInventoryPages((previousPages) => [...previousPages, page])
      setPlacedPages((previousPages) =>
        previousPages.filter((candidate) => candidate.id !== page.id),
      )
      setPlacedPagePositions((previousPositions) => {
        const nextPositions = { ...previousPositions }
        delete nextPositions[page.id]
        return nextPositions
      })
    },
    [inventoryPages, placedPages],
  )

  const handleInventoryDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    handleInventoryDropById(Number(event.dataTransfer.getData('application/x-library-page')))
  }

  const handleDrop = useCallback(
    (slotId: number, slotColor: BookColorId) => {
      if (draggedBookId === null) return false
      if (placedBooksBySlot[slotId]) return false

      const currentBook = books.find((book) => book.id === draggedBookId)
      if (!currentBook || currentBook.color !== slotColor) return false

      const nextPlacedBooks = { ...placedBooksBySlot, [slotId]: currentBook }
      const isFinalPage = Object.keys(nextPlacedBooks).length === BOOK_COUNT
      const slotElement = document.querySelector<HTMLElement>(
        `.library-game__slot[data-slot-id="${slotId}"]`,
      )
      const inventoryBounds = inventoryRef.current?.getBoundingClientRect()
      if (isFinalPage) {
        setSpecialPageId(currentBook.id)
        const letterAreaBounds = letterAreaRef.current?.getBoundingClientRect()
        setPlacedPages((previousPages) => [...previousPages, currentBook])
        if (letterAreaBounds) {
          setPlacedPagePositions((previousPositions) => ({
            ...previousPositions,
            [currentBook.id]: {
              left: Math.max(8, letterAreaBounds.width / 2 - 95),
              top: Math.max(8, letterAreaBounds.height / 2 - 75),
            },
          }))
        }
      } else if (slotElement && inventoryBounds) {
        const slotBounds = slotElement.getBoundingClientRect()
        setFlyingPage({
          book: currentBook,
          startX: slotBounds.left + slotBounds.width / 2 - 16,
          startY: slotBounds.top + slotBounds.height / 2 - 21,
          endX: inventoryBounds.left + inventoryBounds.width / 2 - 16,
          endY: inventoryBounds.top + inventoryBounds.height / 2 - 21,
        })
        window.setTimeout(() => {
          setInventoryPages((previousPages) => [...previousPages, currentBook])
          setFlyingPage(null)
        }, 720)
      }

      setPlacedBooksBySlot(nextPlacedBooks)
      setBooks((previousBooks) => previousBooks.filter((book) => book.id !== currentBook.id))
      completedDropBookId.current = currentBook.id
      setDraggedBookId(null)
      setActiveSlotId(null)

      if (Object.keys(nextPlacedBooks).length === BOOK_COUNT) onComplete()
      return true
    },
    [books, draggedBookId, placedBooksBySlot, onComplete],
  )

  const handleFloorDrop = useCallback(
    (bookId: number, clientX: number, clientY: number) => {
      if (completedDropBookId.current === bookId) {
        completedDropBookId.current = null
        return
      }

      const currentPosition = pilePositions[bookId] ?? getPilePosition(bookId)
      const currentPileBounds = pileRef.current?.getBoundingClientRect()
      const bookWidth = 74
      const bookHeight = 110
      const releaseX = currentPileBounds
        ? clientX - currentPileBounds.left - bookWidth / 2
        : currentPosition.x
      const releaseBottom = currentPileBounds
        ? currentPileBounds.bottom - clientY - bookHeight / 2
        : currentPosition.y
      const landedPosition: PilePosition = {
        ...currentPosition,
        x: Math.max(8, Math.min((currentPileBounds?.width ?? 260) - bookWidth - 8, releaseX)),
        y: 6,
        rotate: currentPosition.rotate + (clientX % 2 === 0 ? 8 : -8),
      }

      setDraggedBookId(null)
      setActiveSlotId(null)
      setDropMotionByBook((previous) => ({
        ...previous,
        [bookId]: {
          '--drop-start-x': `${releaseX - currentPosition.x}px`,
          '--drop-start-y': `${currentPosition.y - releaseBottom}px`,
          '--drop-x': `${landedPosition.x - currentPosition.x}px`,
          '--drop-y': `${currentPosition.y - landedPosition.y}px`,
          '--drop-landing-rotate': `${landedPosition.rotate + 12}deg`,
          '--drop-final-rotate': `${landedPosition.rotate}deg`,
        } as CSSProperties,
      }))
      setFallingBookId(bookId)

      window.setTimeout(() => {
        setPilePositions((previous) => ({ ...previous, [bookId]: landedPosition }))
        setFallingBookId(null)
        setDropMotionByBook((previous) => {
          const next = { ...previous }
          delete next[bookId]
          return next
        })
      }, 1000)
    },
    [pilePositions],
  )

  const handlePointerDown = (bookId: number, event: PointerEvent<HTMLButtonElement>) => {
    event.preventDefault()
    event.currentTarget.setPointerCapture(event.pointerId)
    setDragPoint({ x: event.clientX, y: event.clientY })
    setDraggedBookId(bookId)
  }

  useEffect(() => {
    if (draggedBookId === null) return

    setPileBounds(pileRef.current?.getBoundingClientRect() ?? null)

    const handlePointerMove = (event: globalThis.PointerEvent) => {
      setDragPoint({ x: event.clientX, y: event.clientY })
    }

    const handlePointerUp = (event: globalThis.PointerEvent) => {
      const targetSlot = document
        .elementFromPoint(event.clientX, event.clientY)
        ?.closest<HTMLElement>('.library-game__slot')
      const slotId = targetSlot ? Number(targetSlot.dataset.slotId) : 0
      const slot = shelfSlots.find((candidate) => candidate.id === slotId)
      const placedOnShelf = slot ? handleDrop(slot.id, slot.color) : false

      if (!placedOnShelf) handleFloorDrop(draggedBookId, event.clientX, event.clientY)
      setDragPoint(null)
    }

    window.addEventListener('pointermove', handlePointerMove)
    window.addEventListener('pointerup', handlePointerUp, { once: true })

    return () => {
      window.removeEventListener('pointermove', handlePointerMove)
      window.removeEventListener('pointerup', handlePointerUp)
      setPileBounds(null)
    }
  }, [draggedBookId, handleDrop, handleFloorDrop])

  useEffect(() => {
    if (draggedPageId === null) return

    const handlePointerMove = (event: globalThis.PointerEvent) => {
      setDraggedPagePoint({ x: event.clientX, y: event.clientY })
    }

    const handlePointerUp = (event: globalThis.PointerEvent) => {
      const dropTarget = document.elementFromPoint(event.clientX, event.clientY)
      if (dropTarget?.closest('.library-game__letter-area')) {
        handlePageDropAt(draggedPageId, event.clientX, event.clientY)
      } else if (dropTarget?.closest('.library-game__inventory')) {
        handleInventoryDropById(draggedPageId)
      }
      setDraggedPageId(null)
      setDraggedPagePoint(null)
    }

    window.addEventListener('pointermove', handlePointerMove)
    window.addEventListener('pointerup', handlePointerUp, { once: true })

    return () => {
      window.removeEventListener('pointermove', handlePointerMove)
      window.removeEventListener('pointerup', handlePointerUp)
    }
  }, [draggedPageId, handleInventoryDropById, handlePageDropAt])

  return (
    <div className="library-game__stage">
      <section className="library-game" aria-label="Игра с расстановкой книг по цветам">
        {flyingPage ? (
          <span
            className="library-game__flying-page"
            style={
              {
                left: flyingPage.startX,
                top: flyingPage.startY,
                '--page-flight-x': `${flyingPage.endX - flyingPage.startX}px`,
                '--page-flight-y': `${flyingPage.endY - flyingPage.startY}px`,
                '--page-color': flyingPage.book.hex,
              } as CSSProperties
            }
            aria-hidden="true"
          >
            <span />
          </span>
        ) : null}
        <div className="library-game__header">
          <div className="library-game__badge">Библиотека</div>
          <p className="library-game__instruction">Поставь каждый том в своё место на полке.</p>
        </div>

        <div className="library-game__workspace">
          <div className="library-game__layout">
            <div
              ref={pileRef}
              className={`library-game__pile ${draggedBook ? 'is-dragging' : ''}`}
              aria-label="Разбросанные книги"
            >
              {books.map((book) => {
                const isFalling = fallingBookId === book.id
                const pilePosition = pilePositions[book.id] ?? getPilePosition(book.id)
                const dragX =
                  dragPoint && draggedBookId === book.id && pileBounds
                    ? dragPoint.x - pileBounds.left - 37 - pilePosition.x
                    : 0
                const dragY =
                  dragPoint && draggedBookId === book.id && pileBounds
                    ? pilePosition.y - (pileBounds.bottom - dragPoint.y - 55)
                    : 0

                return (
                  <button
                    key={book.id}
                    type="button"
                    className={`library-book library-book--floor ${isFalling ? 'library-book--falling' : ''} ${draggedBookId === book.id ? 'library-book--dragging' : ''}`}
                    onPointerDown={(event) => handlePointerDown(book.id, event)}
                    style={
                      {
                        '--book-color': book.hex,
                        '--book-glow': book.glow,
                        '--book-tilt': `${pilePosition.rotate}deg`,
                        '--book-scale': String(pilePosition.scale),
                        '--book-stack-x': `${pilePosition.x}px`,
                        '--book-stack-y': `${pilePosition.y}px`,
                        '--drag-x': `${dragX}px`,
                        '--drag-y': `${dragY}px`,
                        ...dropMotionByBook[book.id],
                      } as CSSProperties
                    }
                    aria-label={`Перетащить книгу цвета ${book.color}`}
                  >
                    <span className="library-book__spine" aria-hidden="true" />
                    <span className="library-book__pages" aria-hidden="true" />
                  </button>
                )
              })}
            </div>

            <div className="library-game__shelf-wrap">
              <div
                className={`library-game__shelf ${draggedBook ? 'is-dragging' : ''}`}
                aria-label="Книжная полка"
                style={{ '--shelf-columns': shelfColumns } as CSSProperties}
              >
                {shelfSlots.map((slot, index) => {
                  const isMatch = draggedBook?.color === slot.color
                  const isActive = activeSlotId === slot.id
                  const isVisibleMatch = isMatch && !placedBooksBySlot[slot.id]
                  const placedBook = placedBooksBySlot[slot.id]
                  const isColumnEnd = (index + 1) % shelfColumns === 0
                  const isRowStart = index >= shelfColumns

                  return (
                    <div
                      key={slot.id}
                      data-slot-id={slot.id}
                      className={`library-game__slot ${isColumnEnd ? 'is-column-end' : ''} ${isRowStart ? 'is-row-start' : ''} ${isVisibleMatch ? 'is-highlighted' : ''} ${isActive ? 'is-active' : ''}`}
                      style={
                        {
                          '--slot-color': bookColors[slot.color].hex,
                          '--slot-glow': bookColors[slot.color].glow,
                        } as CSSProperties
                      }
                      onDragOver={(event) => {
                        if (!placedBooksBySlot[slot.id] && draggedBook?.color === slot.color) {
                          event.preventDefault()
                          setActiveSlotId(slot.id)
                        }
                      }}
                      onDragLeave={() => {
                        if (activeSlotId === slot.id) setActiveSlotId(null)
                      }}
                      onDrop={(event) => {
                        event.preventDefault()
                        const draggedId =
                          Number(event.dataTransfer.getData('text/plain')) || draggedBookId
                        if (draggedId) setDraggedBookId(draggedId)
                        handleDrop(slot.id, slot.color)
                      }}
                    >
                      {placedBook ? (
                        <div
                          className="library-book library-book--placed"
                          style={
                            {
                              '--book-color': placedBook.hex,
                              '--book-glow': placedBook.glow,
                              '--book-tilt': '0deg',
                            } as CSSProperties
                          }
                        >
                          <span className="library-book__spine" aria-hidden="true" />
                          <span className="library-book__pages" aria-hidden="true" />
                        </div>
                      ) : null}
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      </section>
      {draggedPage && draggedPagePoint ? (
        <span
          className="library-game__page-drag-preview"
          style={
            {
              left: draggedPagePoint.x - (draggedPage.id === specialPageId ? 95 : 44),
              top: draggedPagePoint.y - (draggedPage.id === specialPageId ? 75 : 56),
              '--page-color': draggedPage.hex,
              '--page-artwork': `url(${pageArtwork})`,
            } as CSSProperties
          }
          aria-hidden="true"
        >
          <span />
          {draggedPage.id === specialPageId ? <strong>{MESSAGE_PAGE_TEXT}</strong> : null}
        </span>
      ) : null}
      <div
        ref={inventoryRef}
        className="library-game__inventory"
        aria-label="Инвентарь найденных страниц"
        onDragOver={(event) => event.preventDefault()}
        onDrop={handleInventoryDrop}
      >
        <div className="library-game__inventory-heading">
          <span className="library-game__inventory-icon" aria-hidden="true">
            ✦
          </span>
          <span>Инвентарь</span>
          <strong>{inventoryPages.length}</strong>
        </div>
        <div className="library-game__inventory-pages">
          {inventoryPages.map((book) => (
            <button
              key={book.id}
              type="button"
              className={`library-game__inventory-page ${book.id === specialPageId ? 'library-game__inventory-page--message' : ''} ${draggedPageId === book.id ? 'is-page-dragging' : ''}`}
              draggable={false}
              style={
                {
                  '--page-color': book.hex,
                  '--page-artwork': `url(${pageArtwork})`,
                } as CSSProperties
              }
              onPointerDown={(event) => handlePagePointerDown(book.id, event)}
              aria-label={`Страница из книги цвета ${book.color}`}
            >
              <span aria-hidden="true" />
              {book.id === specialPageId ? <strong>{MESSAGE_PAGE_TEXT}</strong> : null}
            </button>
          ))}
        </div>
      </div>
      <div
        ref={letterAreaRef}
        className="library-game__letter-area"
        aria-label="Область для страниц"
        onDragOver={(event) => event.preventDefault()}
        onDrop={handlePageDrop}
      >
        <div className="library-game__letter-noise" aria-hidden="true">
          {randomLetters}
        </div>
        <div className="library-game__placed-pages">
          {placedPages.map((page, index) => (
            <span
              key={page.id}
              className={`library-game__placed-page ${page.id === specialPageId ? 'library-game__placed-page--message' : ''} ${draggedPageId === page.id ? 'is-page-dragging' : ''}`}
              draggable={false}
              style={
                {
                  '--page-color': page.hex,
                  '--page-artwork': `url(${pageArtwork})`,
                  '--page-left': `${placedPagePositions[page.id]?.left ?? 18 + (index % 3) * 76}px`,
                  '--page-top': `${placedPagePositions[page.id]?.top ?? 22 + (index % 4) * 42}px`,
                } as CSSProperties
              }
              onPointerDown={(event) => handlePagePointerDown(page.id, event)}
              aria-label={`Размещённая страница ${index + 1}`}
            >
              <span aria-hidden="true" />
              {page.id === specialPageId ? <strong>{MESSAGE_PAGE_TEXT}</strong> : null}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}
