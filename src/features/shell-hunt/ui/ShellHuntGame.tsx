import { BookOpen, ChevronLeft, ChevronRight, X } from 'lucide-react'
import { useState } from 'react'
import dogBeagle from '@/shared/assets/totem-code/segments/dog-beagle.png'
import dogCorgi from '@/shared/assets/totem-code/segments/dog-corgi.png'
import dogHusky from '@/shared/assets/totem-code/segments/dog-husky.png'
import dogPoodle from '@/shared/assets/totem-code/segments/dog-poodle.png'
import letterA from '@/shared/assets/totem-code/segments/letter-a.png'
import letterDe from '@/shared/assets/totem-code/segments/letter-de.png'
import letterO from '@/shared/assets/totem-code/segments/letter-o.png'
import letterVe from '@/shared/assets/totem-code/segments/letter-ve.png'
import shapeCircle from '@/shared/assets/totem-code/segments/shape-circle.png'
import shapeDiamond from '@/shared/assets/totem-code/segments/shape-diamond.png'
import shapeSquare from '@/shared/assets/totem-code/segments/shape-square.png'
import shapeTriangle from '@/shared/assets/totem-code/segments/shape-triangle.png'
import totemStoneBase from '@/shared/assets/totem-code/totem-stone-base.png'
import './ShellHuntGame.css'

type Props = { onComplete: () => void }

const variants = [
  ['Корги', 'Хаски', 'Бигль', 'Пудель'],
  ['Круг', 'Квадрат', 'Треугольник', 'Ромб'],
  ['В', 'О', 'Д', 'А'],
]
const segmentSprites = [
  [dogCorgi, dogHusky, dogBeagle, dogPoodle],
  [shapeCircle, shapeSquare, shapeTriangle, shapeDiamond],
  [letterVe, letterO, letterDe, letterA],
]
const rowNames = ['Порода', 'Фигура', 'Буква']
const targetCode = [
  [2, 2, 0],
  [1, 0, 1],
  [3, 1, 2],
  [0, 3, 3],
]
const hints = [
  {
    title: 'Страница 1',
    text: 'Бигль выбрал треугольник, хаски — круг, пудель — квадрат, а корги — ромб.',
  },
  { title: 'Страница 2', text: 'Буквы на тотемах слева направо складываются в слово «ВОДА».' },
  { title: 'Страница 3', text: 'Тотемы стоят в порядке: бигль, хаски, пудель, корги.' },
]
const totemLayouts = [
  { className: 'totem-code-game__totem--one', label: 'Первый тотем' },
  { className: 'totem-code-game__totem--two', label: 'Второй тотем' },
  { className: 'totem-code-game__totem--three', label: 'Третий тотем' },
  { className: 'totem-code-game__totem--four', label: 'Четвёртый тотем' },
]

export function ShellHuntGame({ onComplete }: Props) {
  const [values, setValues] = useState([
    [0, 0, 0],
    [0, 0, 0],
    [0, 0, 0],
    [0, 0, 0],
  ])
  const [hintIndex, setHintIndex] = useState<number | null>(null)
  const [isSolved, setIsSolved] = useState(false)

  const switchSegment = (totemIndex: number, rowIndex: number, direction: number) => {
    if (isSolved) return

    const nextValues = values.map((totem) => [...totem])
    const variantCount = variants[rowIndex].length
    nextValues[totemIndex][rowIndex] =
      (nextValues[totemIndex][rowIndex] + direction + variantCount) % variantCount
    setValues(nextValues)

    if (
      nextValues.every((totem, index) =>
        totem.every((value, row) => value === targetCode[index][row]),
      )
    ) {
      setIsSolved(true)
      onComplete()
    }
  }

  return (
    <section className="totem-code-game" aria-label="Головоломка с тотемами">
      <div className="totem-code-game__title">
        <BookOpen size={20} />
        <span>Код тотемов</span>
      </div>
      <p className="totem-code-game__instruction">Наведи на резной сегмент и выбери значение.</p>
      <div className="totem-code-game__totems">
        {values.map((totem, totemIndex) => (
          <article
            key={totemLayouts[totemIndex].label}
            className={`totem-code-game__totem ${totemLayouts[totemIndex].className}`}
            aria-label={totemLayouts[totemIndex].label}
          >
            <img src={totemStoneBase} alt="" className="totem-code-game__base" draggable="false" />
            {totem.map((value, rowIndex) => (
              <div
                key={rowNames[rowIndex]}
                className={`totem-code-game__segment totem-code-game__segment--${rowIndex + 1}`}
              >
                <img src={segmentSprites[rowIndex][value]} alt="" draggable="false" />
                <button
                  type="button"
                  className="totem-code-game__switch totem-code-game__switch--left"
                  onClick={() => switchSegment(totemIndex, rowIndex, -1)}
                  aria-label={`Предыдущее значение: ${rowNames[rowIndex]}`}
                >
                  <ChevronLeft size={18} />
                </button>
                <button
                  type="button"
                  className="totem-code-game__switch totem-code-game__switch--right"
                  onClick={() => switchSegment(totemIndex, rowIndex, 1)}
                  aria-label={`Следующее значение: ${rowNames[rowIndex]}`}
                >
                  <ChevronRight size={18} />
                </button>
                <span className="totem-code-game__sr-value">{`${rowNames[rowIndex]}: ${variants[rowIndex][value]}`}</span>
              </div>
            ))}
          </article>
        ))}
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
            aria-label="Книжная подсказка"
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
              <h3>{hints[hintIndex].title}</h3>
              <p>{hints[hintIndex].text}</p>
            </div>
            <div className="totem-code-game__page totem-code-game__page--right">
              <span>✦</span>
              <p>Внимательно изучи рисунки и вернись к тотемам.</p>
            </div>
          </section>
        </div>
      )}
    </section>
  )
}
