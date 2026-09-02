import type { RadioStation } from './types'

const tracks = (stationId: string, count: number) =>
  Array.from(
    { length: count },
    (_, index) => `/audio/radio/${stationId}/track-${String(index + 1).padStart(2, '0')}.mp3`,
  )

// Каждая станция — отдельная папка. Количество треков можно менять независимо.
export const radioStations: RadioStation[] = [
  { id: 'station-01', frequency: 88.7, trackSrcs: tracks('station-01', 1) },
  { id: 'station-02', frequency: 91.3, trackSrcs: tracks('station-02', 1) },
  { id: 'station-03', frequency: 94.8, trackSrcs: tracks('station-03', 8) },
  { id: 'station-04', frequency: 97.6, trackSrcs: tracks('station-04', 1) },
  { id: 'station-05', frequency: 100.2, trackSrcs: tracks('station-05', 1) },
  { id: 'station-06', frequency: 102.7, trackSrcs: tracks('station-06', 1) },
  { id: 'station-07', frequency: 105.1, trackSrcs: tracks('station-07', 1) },
  { id: 'station-08', frequency: 107.4, trackSrcs: tracks('station-08', 1) },
]
