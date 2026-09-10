import type { RadioStation } from './types'

const stationTrackAssets = import.meta.glob<string>(
  '/src/shared/assets/games/beach-radio/audio/stations/*/*.mp3',
  {
    eager: true,
    import: 'default',
    query: '?url',
  },
)

const tracks = (stationId: string) =>
  Object.entries(stationTrackAssets)
    .filter(([path]) => path.includes(`/stations/${stationId}/`))
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([, source]) => source)

// 102.9 — единственная загадочная станция. В неё можно положить сколько угодно
// треков: они будут идти последовательно и зацикливаться после последнего.
export const CORRECT_STATION_ID = 'station-06'
export const CORRECT_FREQUENCY = 102.9

export const radioStations: RadioStation[] = [
  { id: 'station-01', frequency: 88.7, trackSrcs: tracks('station-01') },
  { id: 'station-02', frequency: 91.3, trackSrcs: tracks('station-02') },
  { id: 'station-03', frequency: 94.8, trackSrcs: tracks('station-03') },
  { id: 'station-04', frequency: 97.6, trackSrcs: tracks('station-04') },
  { id: 'station-05', frequency: 100.2, trackSrcs: tracks('station-05') },
  {
    id: CORRECT_STATION_ID,
    frequency: CORRECT_FREQUENCY,
    trackSrcs: tracks(CORRECT_STATION_ID),
  },
  { id: 'station-07', frequency: 105.1, trackSrcs: tracks('station-07') },
  { id: 'station-08', frequency: 107.4, trackSrcs: tracks('station-08') },
]
