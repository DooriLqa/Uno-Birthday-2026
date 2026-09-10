import { Map as MapIcon, Radio as RadioIcon, Volume2 } from 'lucide-react'
import { usePawCoinStore } from '@/features/currency/model/store'
import { useInventoryStore, type InventoryItem } from '@/features/inventory/model/store'
import { useRadioStore } from '@/features/beach-radio/model/radioStore'
import './GameHud.css'
import { useLibraryPages } from '@/features/beach-library/model/pagesStore'
import { PAGE_ASSETS } from '@/features/beach-library/model/pageAssets'

const EMPTY_SLOTS = 2
const RADIO_ITEM_ID = 'beach-radio'
const CORRECT_STATION_ID = 'station-06'

type Props = {
  onOpenRadio?: () => void
  onOpenMap?: () => void
  mapOpen?: boolean
}

export function GameHud({ onOpenRadio, onOpenMap, mapOpen = false }: Props) {
  const pawCoins = usePawCoinStore((state) => state.pawCoins)
  const inventory = useInventoryStore((state) => state.items)
  const isPowered = useRadioStore((state) => state.isPowered)
  const discoveredStationIds = useRadioStore((state) => state.discoveredStationIds)
  const volume = useRadioStore((state) => state.volume)
  const setPowered = useRadioStore((state) => state.setPowered)
  const setVolume = useRadioStore((state) => state.setVolume)
  const radioFound = discoveredStationIds.includes(CORRECT_STATION_ID)

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
              <InventorySlot key={item.id} item={item} onOpenRadio={onOpenRadio} />
            ))}
            {Array.from({ length: Math.max(0, EMPTY_SLOTS - inventory.length) }, (_, index) => (
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
    </div>
  )
}

function InventorySlot({ item, onOpenRadio }: { item: InventoryItem; onOpenRadio?: () => void }) {
  const isRadio = item.id === RADIO_ITEM_ID
  const togglePage = useLibraryPages((state) => state.toggle)

  if (item.id.startsWith('beach-library-')) {
    return (
      <button
        className="game-hud__slot game-hud__slot--button"
        title={item.name}
        aria-label={item.name}
        onClick={() => togglePage(item.id)}
      >
        {PAGE_ASSETS[item.id] ? (
          <img
            src={PAGE_ASSETS[item.id].src}
            alt=""
            style={{ width: 32, height: 36, objectFit: 'contain' }}
          />
        ) : (
          <span>{item.icon}</span>
        )}
        {item.id.includes('-page-') && <small>{Number(item.id.split('-').at(-1)) + 1}</small>}
      </button>
    )
  }

  if (!isRadio || !onOpenRadio) {
    return (
      <span className={`game-hud__slot`} title={item.name} aria-label={item.name}>
        <span>{item.icon}</span>
      </span>
    )
  }

  return (
    <button
      type="button"
      className="game-hud__slot game-hud__slot--button"
      onClick={onOpenRadio}
      title="Открыть радиоприёмник"
      aria-label="Открыть радиоприёмник"
    >
      <RadioIcon size={22} />
    </button>
  )
}
