import { Check, Search } from 'lucide-react'
import type { SearchItem } from '../model/items'

type Props = { items: SearchItem[]; foundIds: string[] }

export function BeachSearchChecklist({ items, foundIds }: Props) {
  return (
    <aside className="beach-search-checklist">
      <div className="beach-search-checklist__title">
        <Search size={20} /> Найди предметы
      </div>
      <ul>
        {items.map((item) => {
          const isFound = foundIds.includes(item.id)
          return (
            <li key={item.id} className={isFound ? 'is-found' : ''}>
              <img src={item.image} alt="" />
              <span>{item.label}</span>
              {isFound && <Check size={18} aria-label="Найдено" />}
            </li>
          )
        })}
      </ul>
    </aside>
  )
}
