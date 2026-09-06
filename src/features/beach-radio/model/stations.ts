import type { RadioStation } from './types'

const tracks = (stationId: string, count: number) =>
  Array.from(
    { length: count },
    (_, index) => `/audio/radio/${stationId}/track-${String(index + 1).padStart(2, '0')}.mp3`,
  )

// 102.9 — единственная загадочная станция. В неё можно положить сколько угодно
// треков: они будут идти последовательно и зацикливаться после последнего.
export const CORRECT_STATION_ID = 'station-06'
export const CORRECT_FREQUENCY = 102.9

export const radioStations: RadioStation[] = [
  { id: 'station-01', frequency: 88.7, trackSrcs: tracks('station-01', 1) },
  { id: 'station-02', frequency: 91.3, trackSrcs: tracks('station-02', 1) },
  { id: 'station-03', frequency: 94.8, trackSrcs: tracks('station-03', 1) },
  { id: 'station-04', frequency: 97.6, trackSrcs: tracks('station-04', 1) },
  { id: 'station-05', frequency: 100.2, trackSrcs: tracks('station-05', 1) },
  {
    id: CORRECT_STATION_ID,
    frequency: CORRECT_FREQUENCY,
    trackSrcs: tracks(CORRECT_STATION_ID, 24),
  },
  { id: 'station-07', frequency: 105.1, trackSrcs: tracks('station-07', 1) },
  { id: 'station-08', frequency: 107.4, trackSrcs: tracks('station-08', 1) },
]
