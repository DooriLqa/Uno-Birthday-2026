import { RouterProvider } from 'react-router-dom'
import { DialogueLayer } from '@/features/dialogues'
import { AudioSettings } from '@/widgets/audio-settings/AudioSettings'
import { GameCursor } from '@/widgets/game-cursor/GameCursor'
import { router } from './router'
import { LibraryPages } from '@/features/beach-library/ui/LibraryPages'
import '@/shared/styles/global.css'

export function App() {
  return (
    <>
      <RouterProvider router={router} />
      <LibraryPages />
      <DialogueLayer />
      <AudioSettings />
      <GameCursor />
    </>
  )
}
