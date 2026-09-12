import './MobilePage.css'
import ticket from '@/shared/assets/features/mobile/ticket.png'

export function MobilePage() {
  return (
    <main className="mobile-page">
      <img className="mobile-page__ticket" src={ticket} alt="Woof Airlines" />
    </main>
  )
}
