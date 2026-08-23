import { RouterProvider } from 'react-router-dom'
import { router } from './router'
import '@/shared/styles/global.css'

export function App() {
  return <RouterProvider router={router} />
}
