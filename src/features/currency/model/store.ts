import { create } from 'zustand'
import { persist } from 'zustand/middleware'

type PawCoinState = {
  pawCoins: number
  addPawCoins: (amount: number) => void
  spendPawCoins: (amount: number) => boolean
}

export const usePawCoinStore = create<PawCoinState>()(
  persist(
    (set, get) => ({
      pawCoins: 3,
      addPawCoins: (amount) =>
        set((state) => ({ pawCoins: Math.max(0, state.pawCoins + Math.floor(amount)) })),
      spendPawCoins: (amount) => {
        const cost = Math.max(0, Math.floor(amount))
        if (get().pawCoins < cost) return false
        set((state) => ({ pawCoins: state.pawCoins - cost }))
        return true
      },
    }),
    { name: 'beach-party-currency' },
  ),
)
