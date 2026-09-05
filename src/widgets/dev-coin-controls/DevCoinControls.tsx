import { MessageCircle, Minus, PackagePlus, Plus, Wrench } from 'lucide-react'
import { useState } from 'react'
import { usePawCoinStore } from '@/features/currency/model/store'
import { dialogueTestSamples, openDialogue } from '@/features/dialogues'
import { useInventoryStore, type InventoryItem } from '@/features/inventory/model/store'
import './DevCoinControls.css'

const DEV_ITEMS: InventoryItem[] = [{ id: 'beach-radio', name: 'Радиоприёмник', icon: '📻' }]

export function DevCoinControls() {
  const pawCoins = usePawCoinStore((state) => state.pawCoins)
  const addPawCoins = usePawCoinStore((state) => state.addPawCoins)
  const spendPawCoins = usePawCoinStore((state) => state.spendPawCoins)
  const inventory = useInventoryStore((state) => state.items)
  const addItem = useInventoryStore((state) => state.addItem)
  const removeItem = useInventoryStore((state) => state.removeItem)
  const [open, setOpen] = useState(false)
  const [inventoryOpen, setInventoryOpen] = useState(false)

  return (
    <div className="dev-coin-controls">
      {open && (
        <div className="dev-coin-controls__panel">
          <strong>🐾 Монетки: {pawCoins}</strong>
          <div className="dev-coin-controls__coin-actions">
            <button type="button" onClick={() => spendPawCoins(10)} title="Убавить 10">
              <Minus size={15} /> 10
            </button>
            <button type="button" onClick={() => spendPawCoins(1)} title="Убавить 1">
              <Minus size={15} /> 1
            </button>
            <button type="button" onClick={() => addPawCoins(1)} title="Добавить 1">
              <Plus size={15} /> 1
            </button>
            <button type="button" onClick={() => addPawCoins(10)} title="Добавить 10">
              <Plus size={15} /> 10
            </button>
          </div>

          <button
            type="button"
            className="dev-coin-controls__inventory-toggle"
            onClick={() => setInventoryOpen((value) => !value)}
          >
            <PackagePlus size={15} /> Инвентарь ({inventory.length})
          </button>

          {inventoryOpen && (
            <div className="dev-coin-controls__inventory">
              {DEV_ITEMS.map((item) => {
                const owned = inventory.some((current) => current.id === item.id)
                return (
                  <div className="dev-coin-controls__inventory-row" key={item.id}>
                    <span>
                      {item.icon} {item.name}
                    </span>
                    {owned ? (
                      <button
                        type="button"
                        onClick={() => removeItem(item.id)}
                        title={`Забрать ${item.name}`}
                      >
                        <Minus size={14} />
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => addItem(item)}
                        title={`Выдать ${item.name}`}
                      >
                        <Plus size={14} />
                      </button>
                    )}
                  </div>
                )
              })}
            </div>
          )}

          <div className="dev-coin-controls__dialogues">
            <strong>Тестовые диалоги</strong>
            {dialogueTestSamples.map((dialogue, index) => (
              <button key={dialogue.id} type="button" onClick={() => openDialogue(dialogue)}>
                <MessageCircle size={15} /> Диалог {index + 1}
              </button>
            ))}
          </div>
        </div>
      )}
      <button
        type="button"
        className="dev-coin-controls__toggle"
        onClick={() => setOpen((value) => !value)}
        aria-label="Инструменты разработчика"
      >
        <Wrench size={17} />
      </button>
    </div>
  )
}
