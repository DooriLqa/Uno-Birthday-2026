import { createBrowserRouter, Navigate } from 'react-router-dom'
import { GamePage } from '@/pages/game'
import { GamesPage } from '@/pages/games'
import { TimeAttackPage } from '@/pages/game/ui/TimeAttackPage'

export const router = createBrowserRouter([
  { path: '/', element: <GamesPage /> },

  { path: '/games/time-attack', element: <TimeAttackPage /> },

  { path: '/games/:gameId', element: <GamePage /> },

  { path: '*', element: <Navigate to="/" replace /> },
])