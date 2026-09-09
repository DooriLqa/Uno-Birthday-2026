import tropicalIslandMap from '@/shared/assets/island-map/tropical-island-map-expanded.png'
import { worldRegions, type LocationId } from '@/features/location-navigation/model/locations'
import './GameIslandMap.css'

type Props = {
  onOpenRegion: (entry: LocationId) => void
}

export function GameIslandMap({ onOpenRegion }: Props) {
  return (
    <section className="game-island-map" aria-label="Карта регионов острова">
      <div className="game-island-map__active-area">
        <img className="game-island-map__image" src={tropicalIslandMap} alt="Карта острова: туристический пляж, дикий пляж и джунгли" />
        {worldRegions.map((region) => (
          <button key={region.id} type="button"
            className="game-island-map__region" style={region.area}
            aria-disabled={!region.entry}
            aria-label={region.title + (region.entry ? '' : ' — пока недоступна')}
            onClick={region.entry ? () => onOpenRegion(region.entry) : undefined}>
            <span>{region.title}{!region.entry && <small>Пока недоступна</small>}</span>
          </button>
        ))}
      </div>
    </section>
  )
}
