import { createBrowserRouter, Navigate } from 'react-router-dom'
import { GamePage } from '@/pages/game'
import { GamesPage } from '@/pages/games'
import { QuizGamePage } from '@/pages/quiz/ui/QuizGamePage'

export const router = createBrowserRouter([
  { path: '/', element: <GamesPage /> },
  { path: '/games/:gameId', element: <GamePage /> },
  { path: '*', element: <Navigate to="/" replace /> },
  { path: '/quiz', element: <QuizGamePage /> },
])
