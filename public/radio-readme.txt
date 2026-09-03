Радио Beach Waves

Единственная правильная частота: 102.7 MHz (station-06).

Структура:
public/audio/radio/
  station-01/track-01.mp3
  station-02/track-01.mp3
  station-03/track-01.mp3
  station-04/track-01.mp3
  station-05/track-01.mp3
  station-06/track-01.mp3 ... track-24.mp3
  station-07/track-01.mp3
  station-08/track-01.mp3

Для station-06 можно добавить больше треков: достаточно продолжить нумерацию
track-25.mp3, track-26.mp3 и т.д. и увеличить count в stations.ts.

station-01, 02, 03, 04, 05, 07 и 08 — отвлекающие станции, по одному треку.
Их можно заменить своими MP3, не меняя частоты.

При включённом радио все станции продолжают воспроизводиться в фоне.
Слышимость управляется Web Audio GainNode, поэтому переключение станции и
переход на следующий трек не сбрасывают пользовательскую громкость.
