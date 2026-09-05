import { useMemo, useState } from 'react'
import './BlackJack.css'

type Card = { id: string; rank: number; image: string; value: number }
export type BlackJackProps = { onWin: () => void; onLoss: () => void }

const CARD_IMAGES = import.meta.glob('/src/assets/cards/*.{png,jpg,jpeg,webp}', { eager: true, import: 'default', query: '?url' }) as Record<string, string>
const SUITS = ['бубен_', 'пик_', 'черв_', 'треф_']
const RANKS = Array.from({ length: 9 }, (_, i) => i + 6)

const createDeck = (): Card[] => SUITS.flatMap((suit) => RANKS.map((rank) => {
    const path = Object.keys(CARD_IMAGES).find((key) => new RegExp(`${suit}${rank}\\.(png|jpg|jpeg|webp)$`).test(key))
    if (!path) throw new Error(`Не найдено изображение карты ${suit}${rank}`)
    return { id: `${suit}${rank}-${Math.random()}`, rank, image: CARD_IMAGES[path], value: rank === 14 ? 11 : Math.min(rank, 10) }
}))

const shuffle = <T,>(items: T[]) => {
    const result = [...items]
    for (let i = result.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1))
            ;[result[i], result[j]] = [result[j], result[i]]
    }
    return result
}

const handValue = (hand: Card[]) => {
    let total = hand.reduce((sum, card) => sum + card.value, 0)
    let aces = hand.filter((card) => card.rank === 14).length
    while (total > 21 && aces > 0) { total -= 10; aces-- }
    return total
}

export function BlackJack({ onWin, onLoss }: BlackJackProps) {
    const [deck, setDeck] = useState<Card[]>([])
    const [player, setPlayer] = useState<Card[]>([])
    const [dealer, setDealer] = useState<Card[]>([])
    const [started, setStarted] = useState(false)
    const [revealed, setRevealed] = useState(false)
    const [result, setResult] = useState<'win' | 'lose' | null>(null)

    const playerValue = useMemo(() => handValue(player), [player])
    const dealerValue = useMemo(() => handValue(dealer), [dealer])

    const startRound = () => {
        const cards = shuffle(createDeck())
        setPlayer([cards[0], cards[2]])
        setDealer([cards[1], cards[3]])
        setDeck(cards.slice(4))
        setStarted(true); setRevealed(false); setResult(null)
    }

    const finish = (nextPlayer: Card[], nextDealer: Card[]) => {
        const p = handValue(nextPlayer), d = handValue(nextDealer)
        const win = p <= 21 && (d > 21 || p > d)
        setRevealed(true); setResult(win ? 'win' : 'lose')
        win ? onWin() : onLoss()
    }

    const hit = () => {
        if (!started || result || !deck.length) return
        const [card, ...rest] = deck
        const next = [...player, card]
        setDeck(rest); setPlayer(next)
        if (handValue(next) > 21) finish(next, dealer)
    }

    const stand = () => {
        if (!started || result) return
        let nextDealer = [...dealer], rest = [...deck]
        while (handValue(nextDealer) < 17 && rest.length) {
            const [card, ...nextRest] = rest
            nextDealer = [...nextDealer, card]; rest = nextRest
        }
        setDeck(rest); setDealer(nextDealer); finish(player, nextDealer)
    }

    return <div className="black-jack">
        <div className="black-jack__table">
            <section className="black-jack__hand">
                <div className="black-jack__hand-header"><h2>Раздающий</h2><span>{revealed ? dealerValue : '?'} очков</span></div>
                <div className="black-jack__cards">{dealer.map((card, i) => <div className="black-jack__card" key={card.id}>{i === 0 && !revealed ? <div className="black-jack__card-back">♠</div> : <img src={card.image} alt={`Карта ${card.rank}`} />}</div>)}</div>
            </section>
            <section className="black-jack__hand">
                <div className="black-jack__hand-header"><h2>Ты</h2><span>{playerValue} очков</span></div>
                <div className="black-jack__cards">{player.map((card) => <div className="black-jack__card" key={card.id}><img src={card.image} alt={`Карта ${card.rank}`} /></div>)}</div>
            </section>
        </div>
        {result && <p className={`black-jack__result black-jack__result--${result}`}>{result === 'win' ? 'Победа!' : 'Увы, ты проиграл.'}</p>}
        <div className="black-jack__controls">{!started || result ? <button type="button" onClick={startRound}>{result ? 'Следующий раунд' : 'Играть'}</button> : <><button type="button" onClick={hit}>Взять карту</button><button type="button" onClick={stand}>Хватит</button></>}</div>
    </div>
}
