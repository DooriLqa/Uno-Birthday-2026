import { Application, Graphics, Text } from 'pixi.js'
import { useEffect, useRef } from 'react'

type Props = { emoji: string; onWin: () => void }

export function MiniGameCanvas({ emoji, onWin }: Props) {
  const hostRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const host = hostRef.current
    if (!host) return
    const app = new Application()
    let target: Graphics | undefined
    let isDisposed = false
    let isInitialized = false
    const start = async () => {
      await app.init({ resizeTo: host, backgroundAlpha: 0, antialias: true })
      isInitialized = true
      if (isDisposed) {
        app.destroy(true, { children: true, texture: true })
        return
      }
      host.appendChild(app.canvas)
      const label = new Text({
        text: 'Найди меня!',
        style: { fill: '#14516d', fontSize: 22, fontWeight: '700' },
      })
      label.position.set(18, 18)
      target = new Graphics()
        .circle(0, 0, 48)
        .fill({ color: 0xfff7dc })
        .stroke({ color: 0xffffff, width: 5 })
      const icon = new Text({ text: emoji, style: { fontSize: 55 } })
      icon.anchor.set(0.5)
      target.addChild(icon)
      const move = () =>
        target?.position.set(
          80 + Math.random() * Math.max(1, host.clientWidth - 160),
          110 + Math.random() * Math.max(1, host.clientHeight - 190),
        )
      target.eventMode = 'static'
      target.cursor = 'pointer'
      target.on('pointertap', () => {
        onWin()
        label.text = 'Отлично! Ты справился 🎉'
        move()
      })
      app.stage.addChild(label, target)
      move()
    }
    void start()
    return () => {
      isDisposed = true
      if (isInitialized) app.destroy(true, { children: true, texture: true })
    }
  }, [emoji, onWin])
  return <div ref={hostRef} className="pixi-stage" aria-label="Игровое поле" />
}
