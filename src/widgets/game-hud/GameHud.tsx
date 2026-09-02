import { Radio as RadioIcon } from 'lucide-react'
import { usePawCoinStore } from '@/features/currency/model/store'
import { useInventoryStore, type InventoryItem } from '@/features/inventory/model/store'
import './GameHud.css'

const EMPTY_SLOTS = 2
const RADIO_ITEM_ID = 'beach-radio'

type Props = {
  onOpenRadio?: () => void
}

export function GameHud({ onOpenRadio }: Props) {
  const pawCoins = usePawCoinStore((state) => state.pawCoins)
  const inventory = useInventoryStore((state) => state.items)

  return (
    <div className="game-hud" aria-label="Игровой интерфейс">
      <div className="game-hud__coins" title="Монетки с лапкой">
        <span className="game-hud__coin-icon">🐾</span>
        <strong>{pawCoins}</strong>
      </div>

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
    </div>
  )
}

function InventorySlot({ item, onOpenRadio }: { item: InventoryItem; onOpenRadio?: () => void }) {
  const isRadio = item.id === RADIO_ITEM_ID

  if (!isRadio || !onOpenRadio) {
    return (
      <span className="game-hud__slot" title={item.name} aria-label={item.name}>
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
