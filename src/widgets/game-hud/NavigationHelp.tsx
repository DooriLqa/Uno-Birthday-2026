import { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'
import down from '@/shared/assets/common/cursors/arrow-down.png'
import forward from '@/shared/assets/common/cursors/projected-forward.png'
import dialogue from '@/shared/assets/common/cursors/dialogue.png'
import handPoint from '@/shared/assets/common/cursors/hand-point.png'
import left from '@/shared/assets/common/cursors/arrow-left.png'
import right from '@/shared/assets/common/cursors/arrow-right.png'
import './NavigationHelp.css'

export function NavigationHelp({ onClose }: { onClose: () => void }) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  useEffect(() => {
    const dialog = dialogRef.current
    dialog?.showModal()
    window.dispatchEvent(new Event('game-cursor-bring-to-front'))
    const blockGameKeys = (event: KeyboardEvent) => {
      event.stopImmediatePropagation()
    }
    window.addEventListener('keydown', blockGameKeys, true)
    window.addEventListener('keyup', blockGameKeys, true)
    return () => {
      window.removeEventListener('keydown', blockGameKeys, true)
      window.removeEventListener('keyup', blockGameKeys, true)
      dialog?.close()
      window.dispatchEvent(new Event('game-cursor-refresh'))
    }
  }, [])

  return createPortal(
    <dialog
      ref={dialogRef}
      className="navigation-help"
      aria-labelledby="navigation-help-title"
      onCancel={onClose}
      onClick={onClose}
    >
      <button
        type="button"
        className="navigation-help__close"
        onClick={onClose}
        aria-label="Закрыть обучение"
      >
        <X size={24} />
      </button>
      <header className="navigation-help__intro">
        <h2 id="navigation-help-title">Как перемещаться по острову</h2>
        <p>
          Обучение навигации в игре. Наводи мышь на края экрана и объекты — курсор подскажет, что
          можно сделать.
        </p>
      </header>
      <div className="navigation-help__side navigation-help__side--left">
        <img src={left} alt="" />
        <p>Подведи мышь к левому краю, чтобы сдвинуть вид влево.</p>
      </div>
      <div className="navigation-help__center">
        <img src={forward} alt="" />
        <h3>Переход в локацию</h3>
        <p>
          Когда курсор превращается в стрелку перехода, нажми на это место, чтобы пройти дальше.
        </p>
        <div className="navigation-help__interactions">
          <div>
            <img src={dialogue} alt="" />
            <h3>Разговор с NPC</h3>
            <p>Этот курсор появляется над персонажем. Нажми, чтобы поговорить с ним.</p>
          </div>
          <div>
            <img src={handPoint} alt="" />
            <h3>Взаимодействие с предметом</h3>
            <p>Этот курсор появляется над предметом. Нажми, чтобы взаимодействовать с ним.</p>
          </div>
        </div>
        <small>
          Движение по краям доступно в широких локациях. На границе видимой области стрелка
          становится обычным курсором.
        </small>
        <p>
          <strong>Прокрутка инвентаря</strong>
          <br />
          Наведи мышь на инвентарь и прокручивай колёсико, чтобы увидеть остальные предметы.
        </p>
      </div>
      <div className="navigation-help__side navigation-help__side--right">
        <img src={right} alt="" />
        <p>Подведи мышь к правому краю, чтобы сдвинуть вид вправо.</p>
      </div>
      <footer className="navigation-help__exit">
        <img src={down} alt="" />
        <p>
          <strong>Выход назад</strong>
          <br />
          Нажми в этой нижней области, чтобы выйти из локации или некоторых мини-игр.
        </p>
      </footer>
    </dialog>,
    document.body,
  )
}
