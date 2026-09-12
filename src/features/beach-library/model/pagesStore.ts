import { create } from 'zustand'

type Sheet = { id: string; x: number; y: number }
export const useLibraryPages = create<{
  pages: Sheet[]
  toggle: (id: string) => void
  move: (id: string, x: number, y: number) => void
}>((set) => ({
  pages: [],
  toggle: (id) =>
    set(({ pages }) => ({
      pages: pages.some((page) => page.id === id)
        ? pages.filter((page) => page.id !== id)
        : [
            ...pages,
            {
              id,
              x: Math.max(0, window.innerWidth / 2 - 375),
              y: Math.max(16, window.innerHeight / 2 - 450),
            },
          ],
    })),
  move: (id, x, y) =>
    set(({ pages }) => ({ pages: pages.map((page) => (page.id === id ? { id, x, y } : page)) })),
}))
