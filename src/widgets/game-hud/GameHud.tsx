import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import {
  ChevronLeft,
  ChevronRight,
  Clapperboard,
  Map as MapIcon,
  Radio as RadioIcon,
  Volume2,
  X,
} from 'lucide-react'
import { usePawCoinStore } from '@/features/currency/model/store'
import { useInventoryStore, type InventoryItem } from '@/features/inventory/model/store'
import {
  getInventoryItemArtwork,
  getInventoryItemPresentation,
  isArcadeKeychain,
} from '@/features/inventory/model/items'
import { useRadioStore } from '@/features/beach-radio/model/radioStore'
import './GameHud.css'
import { useLibraryPages } from '@/features/beach-library/model/pagesStore'
import { PAGE_ASSETS } from '@/features/beach-library/model/pageAssets'

const INVENTORY_COLUMNS = 2
const RADIO_ITEM_ID = 'beach-radio'
const CORRECT_STATION_ID = 'station-06'

const CREDIT_SECTIONS: { title: string; names: string[] }[] = [
  {
    title: 'Код',
    names: ['DooriLqa', 'croppusha', 'RAMisExpensive', 'Derp', 'JustZoB'],
  },
  {
    title: 'Оформление',
    names: ['nobrainshiba', 'DooriLqa'],
  },
  {
    title: 'Монтаж',
    names: ['JustZoB'],
  },
  {
    title: 'Озвучка',
    names: [
      'Praden',
      'liz0n',
      'yugybunyg',
      'Faridysha',
      'Michelangeloux',
      'Hyomushka',
      'PogUbamBamBam',
      'tomasx',
      'croppusha',
      'chozaher',
      'alfrend',
    ],
  },
  {
    title: 'Special thanks',
    names: ['ChatGPT'],
  },
]

type Props = {
  onOpenRadio?: () => void
  onOpenMap?: () => void
  mapOpen?: boolean
}

export function GameHud({ onOpenRadio, onOpenMap, mapOpen = false }: Props) {
  const pawCoins = usePawCoinStore((state) => state.pawCoins)
  const inventory = useInventoryStore((state) => state.items)
  const [previewItem, setPreviewItem] = useState<InventoryItem | null>(null)
  const [creditsOpen, setCreditsOpen] = useState(false)
  const isPowered = useRadioStore((state) => state.isPowered)
  const discoveredStationIds = useRadioStore((state) => state.discoveredStationIds)
  const volume = useRadioStore((state) => state.volume)
  const setPowered = useRadioStore((state) => state.setPowered)
  const setVolume = useRadioStore((state) => state.setVolume)
  const radioFound = discoveredStationIds.includes(CORRECT_STATION_ID)
  const renderedSlotCount = Math.max(
    INVENTORY_COLUMNS,
    inventory.length + (inventory.length % INVENTORY_COLUMNS),
  )
  const emptySlotCount = renderedSlotCount - inventory.length

  useEffect(() => {
    if (!creditsOpen) return
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setCreditsOpen(false)
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [creditsOpen])

  return (
    <div className="game-hud" aria-label="Игровой интерфейс">
      <div className="game-hud__left">
        {onOpenMap && (
          <button
            type="button"
            className={`game-hud__map-button ${mapOpen ? 'is-open' : ''}`}
            onClick={onOpenMap}
            aria-label={mapOpen ? 'Закрыть карту' : 'Открыть карту'}
            title={mapOpen ? 'Закрыть карту' : 'Открыть карту'}
          >
            <MapIcon size={20} />
          </button>
        )}
        <div className="game-hud__coins" title="Монетки с лапкой">
          <span className="game-hud__coin-icon">🐾</span>
          <strong>{pawCoins}</strong>
        </div>
      </div>
      <div className="game-hud__right">
        <div className="game-hud__inventory" aria-label="Инвентарь">
          <span className="game-hud__inventory-label">Инвентарь</span>
          <div className="game-hud__slots">
            {inventory.map((item) => (
              <InventorySlot
                key={item.id}
                item={item}
                onOpenRadio={onOpenRadio}
                onInspect={() => setPreviewItem(item)}
              />
            ))}
            {Array.from({ length: emptySlotCount }, (_, index) => (
              <span
                className="game-hud__slot game-hud__slot--empty"
                key={`empty-${index}`}
                aria-hidden="true"
              />
            ))}
          </div>
        </div>

        {radioFound && (
          <div className="game-hud__radio-widget" aria-label="Управление радиоприёмником">
            <button
              type="button"
              className={`game-hud__radio-power ${isPowered ? 'is-on' : ''}`}
              onClick={() => setPowered(!isPowered)}
              aria-label={isPowered ? 'Выключить радио' : 'Включить радио'}
              title={isPowered ? 'Выключить радио' : 'Включить радио'}
            >
              <RadioIcon size={18} />
            </button>
            <label className="game-hud__radio-volume" title="Громкость радио">
              <Volume2 size={15} />
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={volume}
                onChange={(event) => setVolume(Number(event.target.value))}
                aria-label="Громкость радио"
              />
            </label>
            {onOpenRadio && (
              <button
                type="button"
                className="game-hud__radio-open"
                onClick={onOpenRadio}
                aria-label="Открыть радиоприёмник"
                title="Открыть радиоприёмник"
              >
                Настроить
              </button>
            )}
          </div>
        )}
      </div>
      {previewItem && <InventoryPreview item={previewItem} onClose={() => setPreviewItem(null)} />}

      {createPortal(
        <button
          type="button"
          className={`game-hud__credits-button ${creditsOpen ? 'is-active' : ''}`}
          onClick={() => setCreditsOpen((value) => !value)}
          aria-pressed={creditsOpen}
          aria-label={creditsOpen ? 'Остановить титры' : 'Показать титры'}
          title={creditsOpen ? 'Остановить титры' : 'Показать титры'}
        >
          <Clapperboard size={20} />
        </button>,
        document.body,
      )}

      {creditsOpen &&
        createPortal(
          <div className="credits" role="dialog" aria-modal="true" aria-label="Титры">
            <div className="credits__viewport">
              <div className="credits__list">
                <h2 className="credits__title">Титры</h2>
                {CREDIT_SECTIONS.map((section) => (
                  <section className="credits__section" key={section.title}>
                    <h3 className="credits__section-title">{section.title}</h3>
                    <ul className="credits__names">
                      {section.names.map((name) => (
                        <li key={`${section.title}-${name}`}>{name}</li>
                      ))}
                    </ul>
                  </section>
                ))}
                <p className="credits__thanks">Спасибо за игру!</p>
              </div>
            </div>
          </div>,
          document.body,
        )}
    </div>
  )
}

function InventorySlot({
  item,
  onOpenRadio,
  onInspect,
}: {
  item: InventoryItem
  onOpenRadio?: () => void
  onInspect: () => void
}) {
  const presentation = getInventoryItemPresentation(item)
  const togglePage = useLibraryPages((state) => state.toggle)
  const isRadio = item.id === RADIO_ITEM_ID
  const isKeychain = isArcadeKeychain(item.id)
  const artwork = getInventoryItemArtwork(item.id)
  const className = [
    'game-hud__slot',
    presentation.rarity ? 'game-hud__slot--rarity' : '',
    presentation.rarity ? `game-hud__slot--${presentation.rarity}` : '',
    isKeychain ? 'game-hud__slot--keychain' : '',
    isRadio || presentation.inspectable ? 'game-hud__slot--button' : '',
  ]
    .filter(Boolean)
    .join(' ')
  const content = (
    <>
      {artwork ? (
        <img className="game-hud__slot-image" src={artwork} alt="" aria-hidden="true" />
      ) : (
        <span>{presentation.icon}</span>
      )}
      {(item.quantity ?? 1) > 1 && <small>{item.quantity}</small>}
    </>
  )

  if (isRadio && onOpenRadio) {
    return (
      <button
        type="button"
        className={className}
        onClick={onOpenRadio}
        title="Открыть радиоприёмник"
        aria-label="Открыть радиоприёмник"
      >
        <RadioIcon size={28} />
      </button>
    )
  }

  if (item.id.startsWith('beach-library-')) {
    const pageTitle = PAGE_ASSETS[item.id]?.title ?? item.name
    return (
      <button
        className="game-hud__slot game-hud__slot--button"
        title={pageTitle}
        aria-label={pageTitle}
        onClick={() => togglePage(item.id)}
      >
        {PAGE_ASSETS[item.id]?.src ? (
          <img
            src={PAGE_ASSETS[item.id].src}
            alt=""
            style={{ width: 32, height: 36, objectFit: 'contain' }}
          />
        ) : (
          <span>{item.icon}</span>
        )}
      </button>
    )
  }

  if (!presentation.inspectable) {
    return (
      <span className={className} title={presentation.name} aria-label={presentation.name}>
        {content}
      </span>
    )
  }

  return (
    <button
      type="button"
      className={className}
      onClick={onInspect}
      title={`Рассмотреть: ${presentation.name}`}
      aria-label={`Рассмотреть: ${presentation.name}`}
    >
      {content}
    </button>
  )
}

function InventoryPreview({ item, onClose }: { item: InventoryItem; onClose: () => void }) {
  const closeButtonRef = useRef<HTMLButtonElement>(null)
  const [pageIndex, setPageIndex] = useState(0)
  const presentation = getInventoryItemPresentation(item)
  const artwork = getInventoryItemArtwork(item.id)
  const bookPages = presentation.kind === 'book' ? (presentation.pages ?? []) : []
  const isBook = bookPages.length > 0

  const showPreviousPage = () => setPageIndex((current) => Math.max(0, current - 1))
  const showNextPage = () => setPageIndex((current) => Math.min(bookPages.length - 1, current + 1))

  useEffect(() => {
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    closeButtonRef.current?.focus()

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
      if (isBook && event.key === 'ArrowLeft') {
        setPageIndex((current) => Math.max(0, current - 1))
      }
      if (isBook && event.key === 'ArrowRight') {
        setPageIndex((current) => Math.min(bookPages.length - 1, current + 1))
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [bookPages.length, isBook, onClose])

  return createPortal(
    <div
      className={`inventory-preview ${isBook ? 'inventory-preview--book' : ''}`}
      role="dialog"
      aria-modal="true"
      aria-label={isBook ? presentation.name : undefined}
      aria-labelledby={isBook ? undefined : 'inventory-preview-title'}
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose()
      }}
    >
      <article
        className={`inventory-preview__card ${isBook ? 'inventory-preview__card--book' : ''}`}
      >
        <button
          ref={closeButtonRef}
          type="button"
          className="inventory-preview__close"
          onClick={onClose}
          aria-label="Закрыть просмотр предмета"
          title="Закрыть"
        >
          <X size={30} />
        </button>
        {isBook ? (
          <div className="inventory-book">
            <div className="inventory-book__page">
              <img
                className="inventory-book__image"
                src={bookPages[pageIndex]}
                alt={`${presentation.name}, страница ${pageIndex + 1} из ${bookPages.length}`}
              />
              <button
                type="button"
                className="inventory-book__turn-zone inventory-book__turn-zone--previous"
                onClick={showPreviousPage}
                disabled={pageIndex === 0}
                aria-label="Предыдущая страница"
                title="Предыдущая страница"
              >
                <ChevronLeft size={48} />
              </button>
              <button
                type="button"
                className="inventory-book__turn-zone inventory-book__turn-zone--next"
                onClick={showNextPage}
                disabled={pageIndex === bookPages.length - 1}
                aria-label="Следующая страница"
                title="Следующая страница"
              >
                <ChevronRight size={48} />
              </button>
            </div>
            <nav className="inventory-book__pagination" aria-label="Страницы книги">
              {bookPages.map((page, index) => (
                <button
                  type="button"
                  className={index === pageIndex ? 'is-active' : ''}
                  onClick={() => setPageIndex(index)}
                  aria-label={`Открыть страницу ${index + 1}`}
                  aria-current={index === pageIndex ? 'page' : undefined}
                  key={`${page}-${index}`}
                />
              ))}
              <span role="status" aria-live="polite">
                {pageIndex + 1} / {bookPages.length}
              </span>
            </nav>
          </div>
        ) : artwork ? (
          <img className="inventory-preview__image" src={artwork} alt={presentation.name} />
        ) : (
          <span className="inventory-preview__fallback" aria-hidden="true">
            {presentation.icon}
          </span>
        )}
        {!isBook && (
          <div className="inventory-preview__caption">
            <h2 id="inventory-preview-title">{presentation.name}</h2>
            {presentation.description && <p>{presentation.description}</p>}
          </div>
        )}
      </article>
    </div>,
    document.body,
  )
}