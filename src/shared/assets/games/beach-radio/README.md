# Радио Beach Waves

Единственная правильная частота: 102.9 MHz (station-06).

Структура:

```text
src/shared/assets/games/beach-radio/audio/stations/
  station-01/track-01.mp3
  station-02/track-01.mp3
  station-03/track-01.mp3
  station-04/track-01.mp3
  station-05/track-01.mp3
  station-06/track-01.mp3 ... track-NN.mp3
  station-07/track-01.mp3
  station-08/track-01.mp3
```

Для station-06 можно добавлять новые треки, продолжая нумерацию.
`stations.ts` найдёт их автоматически.

station-01, 02, 03, 04, 05, 07 и 08 — отвлекающие станции. Если папка станции
пуста, она остаётся беззвучной; MP3 можно добавлять и заменять без изменения кода.

При включённом радио все станции продолжают воспроизводиться в фоне.
Слышимость управляется Web Audio GainNode, поэтому переключение станции и
переход на следующий трек не сбрасывают пользовательскую громкость.
