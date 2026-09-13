import type { GameDefinition } from '@/entities/game/model/types'
import { useProgressStore } from '@/features/game-progress/model/store'
import { useInventoryStore } from '@/features/inventory/model/store'
import { GAME_REWARDS_BY_GAME_ID } from '@/features/inventory/model/items'
type Props = { game: GameDefinition; onBack: () => void; onOpenRadio?: () => void }

export function GamePage({ game, onBack, onOpenRadio }: Props) {
  const completeGame = useProgressStore((state) => state.completeGame)
  const addItem = useInventoryStore((state) => state.addItem)
  const GameScreen = game.Screen

  const handleComplete = () => {
    const isFirstVictory = !useProgressStore.getState().completedGameIds.includes(game.id)
    completeGame(game.id)

    const reward = GAME_REWARDS_BY_GAME_ID[game.id]
    const rewardAlreadyOwned = reward
      ? useInventoryStore.getState().items.some((item) => item.id === reward.id)
      : false
    if ((isFirstVictory || game.id === 'japonsk') && reward && !rewardAlreadyOwned) {
      addItem(reward)
    }
  }

  return (
    <main className={['beach-shell', 'game-overlay', game.pageClassName].filter(Boolean).join(' ')}>
      {game.backgroundImage && (
        <img
          className="game-overlay__background"
          src={game.backgroundImage}
          alt=""
          aria-hidden="true"
        />
      )}
      <div className="game-overlay__content">
        <GameScreen onComplete={handleComplete} onOpenRadio={onOpenRadio} onClose={onBack} />
      </div>
      <button
        type="button"
        className="game-overlay__exit-zone game-overlay__exit-zone--left"
        onClick={onBack}
        aria-label="Вернуться в предыдущую локацию слева"
      />
      <button
        type="button"
        className="game-overlay__exit-zone game-overlay__exit-zone--right"
        onClick={onBack}
        aria-label="Вернуться в предыдущую локацию справа"
      />
    </main>
  )
}
