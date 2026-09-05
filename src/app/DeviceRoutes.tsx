import { Navigate } from 'react-router-dom'
import { GameFlow } from './GameFlow'

const isMobileDevice = () => window.matchMedia('(max-width: 700px)').matches

export function DesktopRoute() {
  return isMobileDevice() ? <Navigate to="/mobile" replace /> : <GameFlow />
}

export function MobileRoute() {
  return isMobileDevice() ? <GameFlow /> : <Navigate to="/" replace />
}
