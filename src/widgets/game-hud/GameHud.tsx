import { Map as MapIcon, Radio as RadioIcon, Volume2 } from 'lucide-react'
import { usePawCoinStore } from '@/features/currency/model/store'
import { useInventoryStore, type InventoryItem } from '@/features/inventory/model/store'
import { useRadioStore } from '@/features/beach-radio/model/radioStore'
import './GameHud.css'

const EMPTY_SLOTS = 2
const RADIO_ITEM_ID = 'beach-radio'
const CORRECT_STATION_ID = 'station-06'

type Props = {
  onOpenRadio?: () => void
  onOpenMap?: () => void
}

export function GameHud({ onOpenRadio, onOpenMap }: Props) {
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
            className="game-hud__map-button"
            onClick={onOpenMap}
            aria-label="Открыть карту"
            title="Карта"
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
            {inventory.slice(0, EMPTY_SLOTS).map((item) => (
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
