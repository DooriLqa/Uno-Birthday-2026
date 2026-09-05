import { BookOpen, ChevronLeft, ChevronRight, X } from 'lucide-react'
import { useState, type ReactNode } from 'react'
import { playSegmentTurnSound } from '@/features/totem-code/model/segmentSound'
import totemCorgi from '@/shared/assets/totem-code/totem-corgi-aligned.png'
import totemDachshund from '@/shared/assets/totem-code/totem-dachshund-aligned.png'
import totemHusky from '@/shared/assets/totem-code/totem-husky-aligned.png'
import totemTerrier from '@/shared/assets/totem-code/totem-terrier-aligned.png'
import totemStoneBase from '@/shared/assets/totem-code/totem-stone-base-low-angle.png'
import totemCampfire from '@/shared/assets/totem-code/totem-campfire.png'
import './TotemCodeGame.css'

type Props = { onComplete: () => void }
type Drum = 'shape' | 'letter'
type GlyphStyle = 'natural' | 'ornamented'
type TotemValue = Record<Drum, number>

const shapes = [
  { name: 'Круг' },
  { name: 'Квадрат' },
  { name: 'Треугольник' },
  { name: 'Ромб' },
]
const letters = [
  { name: 'В' },
  { name: 'О' },
  { name: 'Д' },
  { name: 'А' },
]
const totems = [
  { name: 'Хаски', image: totemHusky },
  { name: 'Корги', image: totemCorgi },
  { name: 'Такса', image: totemDachshund },
  { name: 'Терьер', image: totemTerrier },
]

// The pairs correspond to the clues: top drum is a shape, bottom drum spells "ВОДА".
const targetCode: TotemValue[] = [
  { shape: 0, letter: 0 },
  { shape: 3, letter: 1 },
  { shape: 1, letter: 2 },
  { shape: 2, letter: 3 },
]
const initialValues = (): TotemValue[] => totems.map(() => ({ shape: 0, letter: 0 }))
const hints = [
  {
    title: 'Страница 1',
    text: 'Хаски выбирает круг, корги — ромб, такса — квадрат, а терьер — треугольник.',
  },
  {
    title: 'Страница 2',
    text: 'Буквы на тотемах слева направо должны сложиться в слово «ВОДА».',
  },
  {
    title: 'Страница 3',
    text: 'У каждого тотема две секции: верхняя показывает фигуру, нижняя — букву.',
  },
]

export function TotemCodeGame({ onComplete }: Props) {
  const [values, setValues] = useState<TotemValue[]>(initialValues)
  const [isSolved, setIsSolved] = useState(false)
  const [hintIndex, setHintIndex] = useState<number | null>(null)
  const [glyphStyle, setGlyphStyle] = useState<GlyphStyle>('natural')

  const spinDrum = (totemIndex: number, drum: Drum, direction: -1 | 1) => {
    if (isSolved) return

    playSegmentTurnSound()
    const nextValues = values.map((totem, index) =>
      index === totemIndex ? { ...totem, [drum]: (totem[drum] + direction + 4) % 4 } : totem,
    )
    setValues(nextValues)

    if (
      nextValues.every(
        (totem, index) =>
          totem.shape === targetCode[index].shape && totem.letter === targetCode[index].letter,
      )
    ) {
      setIsSolved(true)
      onComplete()
    }
  }

  return (
    <section className="totem-code-game" aria-label="Головоломка с тотемами">
      <div className="totem-code-game__heading">
        <h2>Код тотемов</h2>
        <p>Нажимай на барабаны: сверху выбери фигуры, снизу собери слово «ВОДА».</p>
        <div className="totem-code-game__style-switch" role="group" aria-label="Стиль резьбы">
          <span>Резьба:</span>
          <button
            type="button"
            className={glyphStyle === 'natural' ? 'is-active' : undefined}
            aria-pressed={glyphStyle === 'natural'}
            onClick={() => setGlyphStyle('natural')}
          >
            Дерево
          </button>
          <button
            type="button"
            className={glyphStyle === 'ornamented' ? 'is-active' : undefined}
            aria-pressed={glyphStyle === 'ornamented'}
            onClick={() => setGlyphStyle('ornamented')}
          >
            Орнамент
          </button>
        </div>
      </div>
      <div className="totem-code-game__totems">
        <img
          className="totem-code-game__campfire"
          src={totemCampfire}
          alt="Костёр"
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
                className="totem-code-game__base"
                src={totemStoneBase}
                alt=""
                draggable="false"
              />
              <img
                className="totem-code-game__body"
                src={totem.image}
                alt={`${totem.name}, тотем`}
                draggable="false"
              />
              <DrumControl
                className="totem-code-game__drum--upper"
                label={`Фигура ${totem.name}: ${shapes[value.shape].name}`}
                onChange={(direction) => spinDrum(totemIndex, 'shape', direction)}
              >
                <SegmentMark kind="shape" sprite={value.shape} skin={glyphStyle} />
              </DrumControl>
              <DrumControl
                className="totem-code-game__drum--lower"
                label={`Буква ${totem.name}: ${letters[value.letter].name}`}
                onChange={(direction) => spinDrum(totemIndex, 'letter', direction)}
              >
                <SegmentMark kind="letter" sprite={value.letter} skin={glyphStyle} />
              </DrumControl>
            </article>
          )
        })}
      </div>
      <aside className="totem-code-game__hints" aria-label="Подсказки">
        {hints.map((hint, index) => (
          <button key={hint.title} type="button" onClick={() => setHintIndex(index)}>
            <BookOpen size={17} /> Подсказка {index + 1}
          </button>
        ))}
      </aside>
      {isSolved && <p className="totem-code-game__solved">Код принят! Тотемы засияли ✨</p>}
      {hintIndex !== null && (
        <div
          className="totem-code-game__overlay"
          role="presentation"
          onClick={() => setHintIndex(null)}
        >
          <section
            className="totem-code-game__book"
            role="dialog"
            aria-modal="true"
            aria-labelledby="totem-code-game__book-title"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              className="totem-code-game__close"
              onClick={() => setHintIndex(null)}
              aria-label="Закрыть подсказку"
            >
              <X size={20} />
            </button>
            <div className="totem-code-game__page">
              <small>Дневник исследователя</small>
              <h3 id="totem-code-game__book-title">{hints[hintIndex].title}</h3>
              <p>{hints[hintIndex].text}</p>
            </div>
            <div className="totem-code-game__page totem-code-game__page--right" aria-hidden="true">
              <span>✦</span>
              <p>Изучи подсказку и вернись к тотемам.</p>
            </div>
          </section>
        </div>
      )}
    </section>
  )
}

function SegmentMark({
  kind,
  skin,
  sprite,
}: {
  kind: 'shape' | 'letter'
  skin: GlyphStyle
  sprite: number
}) {
  return (
    <span
      className={`totem-code-game__carving totem-code-game__carving--${kind} totem-code-game__carving--${skin} totem-code-game__carving--cell-${sprite}`}
      aria-hidden="true"
    />
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
