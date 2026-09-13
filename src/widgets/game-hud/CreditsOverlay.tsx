import { useEffect } from 'react'
import { createPortal } from 'react-dom'

const CREDIT_SECTIONS: { title: string; names: string[] }[] = [  
  { title: 'Идея и Team Lead', names: ['DooriLqa'] },

  { title: 'Разработчики', names: ['DooriLqa', 'croppusha', 'RAMisExpensive', 'Derp', 'JustZoB'] },{ title: 'Тестирование', names: ['PogUbamBamBam'] },
  { title: 'Оформление', names: ['nobrainshiba', 'DooriLqa'] },
  { title: 'Монтаж радио', names: ['JustZoB'] },
  {
    title: 'Озвучка',
    names: [
      'Praden',
      'liz0n',
      'yugybunyg',
      'Faridysha',
      'HvorostDumb',
      'Michelangeloux',
      'Hyomushka',
      'PogUbamBamBam',
      'TomasX',
      'croppusha',
      'chozaher',
      'AlfrenD',
    ],
  },
  { title: 'Special thanks', names: ['ChatGPT'] },
]

type Props = {
  open: boolean
  onClose: () => void
}

export function CreditsOverlay({ open, onClose }: Props) {
  useEffect(() => {
    if (!open) return
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [onClose, open])

  if (!open) return null

  return createPortal(
    <div
      className="credits"
      role="dialog"
      aria-modal="true"
      aria-label="Титры"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose()
      }}
    >
      <div className="credits__viewport">
        <div className="credits__list">
          <h2 className="credits__title">Титры</h2>
          {CREDIT_SECTIONS.map((section) => (
            <section className="credits__section" key={section.title}>
              <h3 className="credits__section-title">{section.title}</h3>
              <ul className="credits__names">
                {section.names.map((name) => (
                  <li key={`${section.title}-${name}`}>{name}</li>
                ))}
              </ul>
            </section>
          ))}
          <p className="credits__thanks">Спасибо за игру!</p>
        </div>
      </div>
    </div>,
    document.body,
  )
}
