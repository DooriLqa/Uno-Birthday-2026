import { createBrowserRouter, Navigate } from 'react-router-dom'
import { GamePage } from '@/pages/game'
import { GamesPage } from '@/pages/games'

export const router = createBrowserRouter([
  { path: '/', element: <GamesPage /> },
  { path: '/games/:gameId', element: <GamePage /> },
  { path: '*', element: <Navigate to="/" replace /> },
])
