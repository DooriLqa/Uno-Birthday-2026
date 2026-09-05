import { createBrowserRouter, Navigate } from 'react-router-dom'
import { GamePage } from '@/pages/game'
import { BlackJackPage } from '@/pages/game/ui/BlackJack/BlackJackPage'
import { ShellGamePage } from '@/pages/game/ui/ShellGame/ShellGamePage'
import { FindAPairPage } from '@/pages/game/ui/FindAPair/FindAPairPage'
import { WackAMolePage } from '@/pages/game/ui/WackAMole/WackAMolePage'
import { SeaBattlePage } from '@/pages/game/ui/SeaBattle/SeaBattlePage'
import { GamesPage } from '@/pages/games'

export const router = createBrowserRouter([
  { path: '/', element: <GamesPage /> },
  { path: '/games/shell-game', element: <ShellGamePage /> },
  { path: '/games/black-jack', element: <BlackJackPage /> },
  { path: '/games/find-a-pair', element: <FindAPairPage /> },
  { path: '/games/wack-a-mole', element: <WackAMolePage /> },
  { path: '/games/sea-battle', element: <SeaBattlePage /> },
  { path: '/games/:gameId', element: <GamePage /> },
  { path: '*', element: <Navigate to="/" replace /> },
])