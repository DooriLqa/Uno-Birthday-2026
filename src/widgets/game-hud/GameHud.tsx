import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import {
  Clapperboard,
  Map as MapIcon,
  Radio as RadioIcon,
  Volume2,
} from 'lucide-react'
import { usePawCoinStore } from '@/features/currency/model/store'
import { useInventoryStore, type InventoryItem } from '@/features/inventory/model/store'
import {
  getInventoryItemArtwork,
  getInventoryItemPreviewArtwork,
  getInventoryItemPresentation,
  isArcadeKeychain,
} from '@/features/inventory/model/items'
import { useRadioStore } from '@/features/beach-radio/model/radioStore'
import { useLibraryPages } from '@/features/beach-library/model/pagesStore'
import { MAP_ITEM_ID } from '@/features/location-navigation/model/merchantDialogues'
import './GameHud.css'
import coin from '@/shared/assets/common/branding/coin.png'

const INVENTORY_VISIBLE_SLOTS = 5
const RADIO_ITEM_ID = 'beach-radio'
const CORRECT_STATION_ID = 'station-06'

type Props = {
  onOpenRadio?: () => void
  onOpenMap?: () => void
  mapOpen?: boolean
  showCreditsButton?: boolean
  creditsOpen?: boolean
  onToggleCredits?: () => void
}

export function GameHud({
  onOpenRadio,
  onOpenMap,
  mapOpen = false,
  showCreditsButton = false,
  creditsOpen = false,
  onToggleCredits,
}: Props) {
  const pawCoins = usePawCoinStore((state) => state.pawCoins)
  const inventory = useInventoryStore((state) => state.items)
  const previewItemId = useInventoryStore((state) => state.previewItemId)
  const openItemPreview = useInventoryStore((state) => state.openItemPreview)
  const closeItemPreview = useInventoryStore((state) => state.closeItemPreview)
  const toggleLibraryPage = useLibraryPages((state) => state.toggle)
  const isPowered = useRadioStore((state) => state.isPowered)
  const discoveredStationIds = useRadioStore((state) => state.discoveredStationIds)
  const volume = useRadioStore((state) => state.volume)
  const setPowered = useRadioStore((state) => state.setPowered)
  const setVolume = useRadioStore((state) => state.setVolume)
  const radioFound = discoveredStationIds.includes(CORRECT_STATION_ID)
  const renderedSlotCount = Math.max(INVENTORY_VISIBLE_SLOTS, inventory.length)
  const emptySlotCount = renderedSlotCount - inventory.length
  const previewItem = inventory.find((item) => item.id === previewItemId) ?? null

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
          <img className="game-hud__coin" src={coin} alt="" />
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
                onOpenMap={onOpenMap}
                onInspect={() => openItemPreview(item.id)}
                onToggleLibraryPage={() => toggleLibraryPage(item.id)}
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
      {previewItem && <InventoryPreview item={previewItem} onClose={closeItemPreview} />}
      {showCreditsButton && onToggleCredits &&
        createPortal(
          <button
            type="button"
            className={`game-hud__credits-button ${creditsOpen ? 'is-active' : ''}`}
            onClick={onToggleCredits}
            aria-pressed={creditsOpen}
            aria-label={creditsOpen ? 'Закрыть титры' : 'Показать титры'}
            title={creditsOpen ? 'Закрыть титры' : 'Показать титры'}
          >
            <Clapperboard size={20} />
          </button>,
          document.body,
        )}
    </div>
  )
}

function InventorySlot({
  item,
  onOpenRadio,
  onOpenMap,
  onInspect,
  onToggleLibraryPage,
}: {
  item: InventoryItem
  onOpenRadio?: () => void
  onOpenMap?: () => void
  onInspect: () => void
  onToggleLibraryPage: () => void
}) {
  const presentation = getInventoryItemPresentation(item)
  const isRadio = item.id === RADIO_ITEM_ID
  const isMap = item.id === MAP_ITEM_ID
  const isKeychain = isArcadeKeychain(item.id)
  const isLibraryPage = item.id.startsWith('beach-library-')
  const artwork = getInventoryItemArtwork(item.id)
  const className = [
    'game-hud__slot',
    presentation.rarity ? 'game-hud__slot--rarity' : '',
    presentation.rarity ? `game-hud__slot--${presentation.rarity}` : '',
    isKeychain ? 'game-hud__slot--keychain' : '',
    isRadio || isMap || presentation.inspectable || isLibraryPage ? 'game-hud__slot--button' : '',
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

  if (isMap && onOpenMap) {
    return (
      <button
        type="button"
        className={className}
        onClick={onOpenMap}
        title="Открыть карту острова"
        aria-label="Открыть карту острова"
      >
        {content}
      </button>
    )
  }

  if (isLibraryPage) {
    return (
      <button
        type="button"
        className={className}
        onClick={onToggleLibraryPage}
        title={`Открыть: ${presentation.name}`}
        aria-label={`Открыть: ${presentation.name}`}
      >
        {content}
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
  const [pageIndex, setPageIndex] = useState(0)
  const presentation = getInventoryItemPresentation(item)
  const artwork = getInventoryItemPreviewArtwork(item.id)
  const bookPages = presentation.kind === 'book' ? (presentation.pages ?? []) : []
  const isBook = bookPages.length > 0

  const showPreviousPage = () => setPageIndex((current) => Math.max(0, current - 1))
  const showNextPage = () => setPageIndex((current) => Math.min(bookPages.length - 1, current + 1))

  useEffect(() => {
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

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
      className={`inventory-preview ${isBook ? 'inventory-preview--book' : 'inventory-preview--item'}`}
      role="dialog"
      aria-modal="true"
      aria-label={presentation.name}
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose()
      }}
    >
      <article
        className={`inventory-preview__card ${
          isBook ? 'inventory-preview__card--book' : 'inventory-preview__card--item'
        }`}
      >
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
              />
              <button
                type="button"
                className="inventory-book__turn-zone inventory-book__turn-zone--next"
                onClick={showNextPage}
                disabled={pageIndex === bookPages.length - 1}
                aria-label="Следующая страница"
                title="Следующая страница"
              />
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
      </article>
    </div>,
    document.body,
  )
}
