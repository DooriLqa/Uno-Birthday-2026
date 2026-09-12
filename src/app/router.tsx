import { createHashRouter } from 'react-router-dom'
import { DesktopRoute, MobileRoute } from './DeviceRoutes'

export const router = createHashRouter([
  { path: '/', element: <DesktopRoute /> },
  { path: '/mobile', element: <MobileRoute /> },
])
