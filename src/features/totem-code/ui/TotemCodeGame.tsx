import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useState, type ReactNode } from 'react'
import { playSegmentTurnSound } from '@/features/totem-code/model/segmentSound'
import totemCorgi from '@/shared/assets/games/totem-code/totem-corgi-three-slot-v4.png'
import totemDachshund from '@/shared/assets/games/totem-code/totem-dachshund-three-slot-v4.png'
import totemHusky from '@/shared/assets/games/totem-code/totem-husky-three-slot-v4.png'
import totemTerrier from '@/shared/assets/games/totem-code/totem-terrier-three-slot-v4.png'
import totemCampfire from '@/shared/assets/games/totem-code/totem-campfire.png'
import totemCampfireExtinguished from '@/shared/assets/games/totem-code/totem-campfire-extinguished-v2.png'
import conceptAloha from '@/shared/assets/games/totem-code/glyphs/concept-aloha.png'
import conceptHula from '@/shared/assets/games/totem-code/glyphs/concept-hula.png'
import conceptLei from '@/shared/assets/games/totem-code/glyphs/concept-lei.png'
import conceptOhana from '@/shared/assets/games/totem-code/glyphs/concept-ohana.png'
import letterA from '@/shared/assets/games/totem-code/glyphs/letter-a.png'
import letterL from '@/shared/assets/games/totem-code/glyphs/letter-l.png'
import letterO from '@/shared/assets/games/totem-code/glyphs/letter-o.png'
import letterR from '@/shared/assets/games/totem-code/glyphs/letter-r.png'
import letterS from '@/shared/assets/games/totem-code/glyphs/letter-s.png'
import letterV from '@/shared/assets/games/totem-code/glyphs/letter-v.png'
import moonCrescent from '@/shared/assets/games/totem-code/glyphs/moon-crescent.png'
import moonFull from '@/shared/assets/games/totem-code/glyphs/moon-full.png'
import moonNew from '@/shared/assets/games/totem-code/glyphs/moon-new.png'
import moonQuarter from '@/shared/assets/games/totem-code/glyphs/moon-quarter.png'
import './TotemCodeGame.css'

type Props = { onComplete: () => void }
type Drum = 'moon' | 'concept' | 'letter'
type TotemValue = Record<Drum, number>
type SymbolOption = { name: string; glyph?: string; image?: string }

const symbols = {
  moon: [
    { name: 'Полнолуние', image: moonFull },
    { name: 'Четверть луны', image: moonQuarter },
    { name: 'Месяц', image: moonCrescent },
    { name: 'Новолуние', image: moonNew },
  ],
  concept: [
    
    { name: 'Леи', image: conceptLei },
    { name: 'Хула', image: conceptHula },
    { name: 'Алоха', image: conceptAloha },
    { name: 'Охана', image: conceptOhana },
  ],
  letter: [
    { name: 'А', image: letterA },
    { name: 'В', image: letterV },
    { name: 'С', image: letterS },
    { name: 'Л', image: letterL },
    { name: 'Р', image: letterR },
    { name: 'О', image: letterO },
  ],
} satisfies Record<Drum, SymbolOption[]>
const totems = [
  
  { name: 'Корги', image: totemCorgi },
 
  { name: 'Хаски', image: totemHusky },
  { name: 'Такса', image: totemDachshund },
  { name: 'Терьер', image: totemTerrier },
   
]

// The rows encode moon phases, Hawaiian concepts, and the carved-letter word «ЛАВА».
const targetCode: TotemValue[] = [
  { moon: 3, concept: 2, letter: 0 },
 
  { moon: 2, concept: 1, letter: 1 },
   { moon: 0, concept: 3, letter: 3 },
  { moon: 1, concept: 0, letter: 5 },
  
]
const initialValues = (): TotemValue[] =>
  totems.map(() => ({ moon: 0, concept: 0, letter: 0 }))
export function TotemCodeGame({ onComplete }: Props) {
  const [values, setValues] = useState<TotemValue[]>(initialValues)
  const [isSolved, setIsSolved] = useState(false)

  const spinDrum = (totemIndex: number, drum: Drum, direction: -1 | 1) => {
    if (isSolved) return

    playSegmentTurnSound()
    const optionCount = symbols[drum].length
    const nextValues = values.map((totem, index) =>
      index === totemIndex
        ? { ...totem, [drum]: (totem[drum] + direction + optionCount) % optionCount }
        : totem,
    )
    setValues(nextValues)

    if (
      nextValues.every((totem, index) =>
        (Object.keys(targetCode[index]) as Drum[]).every(
          (drum) => totem[drum] === targetCode[index][drum],
        ),
      )
    ) {
      setIsSolved(true)
      onComplete()
    }
  }

  return (
    <section className="totem-code-game" aria-label="Головоломка с тотемами">
      <div className="totem-code-game__totems">
        <img
          className="totem-code-game__campfire"
          src={isSolved ? totemCampfire : totemCampfireExtinguished}
          alt={isSolved ? 'Зажжённый костёр' : 'Потухший костёр'}
          draggable="false"
        />
        {totems.map((totem, totemIndex) => {
          const value = values[totemIndex]
          return (
            <article
              key={totem.name}
              className={`totem-code-game__totem totem-code-game__totem--${totemIndex + 1}`}
              aria-label={`Тотем: ${totem.name}`}
            >
              <img
                className="totem-code-game__body"
                src={totem.image}
                alt={`${totem.name}, тотем`}
                draggable="false"
              />
              <DrumControl
                className="totem-code-game__drum--moon"
                label={`Фаза луны, ${totem.name}: ${symbols.moon[value.moon].name}`}
                onChange={(direction) => spinDrum(totemIndex, 'moon', direction)}
              >
                <SegmentMark kind="moon" symbol={symbols.moon[value.moon]} />
              </DrumControl>
              <DrumControl
                className="totem-code-game__drum--concept"
                label={`Островное понятие, ${totem.name}: ${symbols.concept[value.concept].name}`}
                onChange={(direction) => spinDrum(totemIndex, 'concept', direction)}
              >
                <SegmentMark
                  kind="concept"
                  symbol={symbols.concept[value.concept]}
                />
              </DrumControl>
              <DrumControl
                className="totem-code-game__drum--letter"
                label={`Нижний резной знак, ${totem.name}: буква ${symbols.letter[value.letter].name}`}
                onChange={(direction) => spinDrum(totemIndex, 'letter', direction)}
              >
                <SegmentMark
                  kind="letter"
                  symbol={symbols.letter[value.letter]}
                />
              </DrumControl>
            </article>
          )
        })}
      </div>
      {isSolved && <p className="totem-code-game__solved">Код принят! Тотемы засияли ✨</p>}
    </section>
  )
}

function SegmentMark({
  symbol,
  kind,
}: {
  symbol: SymbolOption
  kind: Drum
}) {
  return (
    <span
      className={`totem-code-game__carving totem-code-game__carving--${kind}`}
      aria-hidden="true"
    >
      {symbol.image ? (
        <img src={symbol.image} alt="" draggable="false" />
      ) : (
        symbol.glyph
      )}
    </span>
  )
}

function DrumControl({
  children,
  className,
  label,
  onChange,
}: {
  children: ReactNode
  className: string
  label: string
  onChange: (direction: -1 | 1) => void
}) {
  return (
    <div className={`totem-code-game__drum ${className}`} aria-label={label}>
      {children}
      <button
        type="button"
        className="totem-code-game__switch totem-code-game__switch--left"
        onClick={() => onChange(-1)}
        aria-label={`${label}: предыдущее значение`}
      >
        <ChevronLeft size={18} />
      </button>
      <button
        type="button"
        className="totem-code-game__switch totem-code-game__switch--right"
        onClick={() => onChange(1)}
        aria-label={`${label}: следующее значение`}
      >
        <ChevronRight size={18} />
      </button>
    </div>
  )
}
