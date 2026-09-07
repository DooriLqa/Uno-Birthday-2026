import { RouterProvider } from 'react-router-dom'
import { DialogueLayer } from '@/features/dialogues'
import { AudioSettings } from '@/widgets/audio-settings/AudioSettings'
import { router } from './router'
import '@/shared/styles/global.css'

export function App() {
  return (
    <>
      <RouterProvider router={router} />
      <DialogueLayer />
      <AudioSettings />
    </>
  )
}
