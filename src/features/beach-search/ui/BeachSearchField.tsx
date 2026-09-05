import { beachPanoramaImage, type SearchItem } from '../model/items'

type Props = { items: SearchItem[]; foundIds: string[]; onFind: (itemId: string) => void }

export function BeachSearchField({ items, foundIds, onFind }: Props) {
  return (
    <div className="beach-search-field" tabIndex={0} aria-label="Прокручиваемый пляж с предметами">
      <div
        className="beach-search-field__scene"
        style={{ backgroundImage: `url(${beachPanoramaImage})` }}
      >
        {items.map(
          (item) =>
            !foundIds.includes(item.id) && (
              <button
                key={item.id}
                type="button"
                className="beach-search-field__item"
                style={{ left: item.left, top: item.top, width: item.width, rotate: item.rotation }}
                onClick={() => onFind(item.id)}
                aria-label={`Найти: ${item.label}`}
              >
                <img src={item.image} alt="" />
              </button>
            ),
        )}
      </div>
    </div>
  )
}
