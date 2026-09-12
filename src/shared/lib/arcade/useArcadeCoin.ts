import { useCallback, useEffect, useRef, useState } from 'react'
import { usePawCoinStore } from '@/features/currency/model/store'
import insertCoinSound from '@/shared/assets/common/audio/insert-coin.mp3'
import { playOneShotSound } from '@/shared/lib/audio/playOneShotSound'

export function useArcadeCoin(soundKey: string) {
  const [inserting, setInserting] = useState(false)
  const pawCoins = usePawCoinStore((state) => state.pawCoins)
  const timerRef = useRef<number | null>(null)

  useEffect(
    () => () => {
      if (timerRef.current !== null) window.clearTimeout(timerRef.current)
    },
    [],
  )

  const insertCoin = useCallback(
    (onReady: () => void) => {
      if (timerRef.current !== null || !usePawCoinStore.getState().spendPawCoins(1)) return
      setInserting(true)
      playOneShotSound(insertCoinSound, soundKey, 0.52)
      timerRef.current = window.setTimeout(() => {
        timerRef.current = null
        setInserting(false)
        onReady()
      }, 1000)
    },
    [soundKey],
  )

  return { insertCoin, inserting, pawCoins }
}
