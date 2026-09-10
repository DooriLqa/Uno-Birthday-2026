# Пляжная библиотека

Игра встроена в `LocationNavigator`, непосредственно поверх `library.png`.
Старая `book-shelf` не изменена; убран только её hotspot в библиотеке.

## Настройка загадки

- `model/config.ts`: `GENRES` — девять жанров, названия, описания, иконки (emoji либо URL изображения) и по пять названий книг.
- `ROWS` — координаты девяти рядов в процентах исходного фона. Верхние три отделения остаются пустыми.
- `LETTERS` — постоянная таблица 12 × 12, без генерации при запуске.
- `HOLES` — восемь отверстий, координаты в листе 300 × 360. Центры букв: x = 15 + столбец × 23.3; базовая линия y = 65 + ряд × 24. Отверстия сейчас демонстрационные, финальный ключ не проверяется.
- `INSTRUCTION` — текст записки с подсказкой.

Клик по книге берёт её в руки, следующий клик по месту ставит её на полку. Esc или кнопка возврата отменяют взятие. Занятые места обмениваются книгами; если книга была с пола, вытесненная книга возвращается на пол. Цвет не кодирует жанр.

За первый и второй полностью правильно собранные стеллажи выдаётся по три страницы, за третий — две страницы и записка. Порядок сборки произвольный. Награды выдаются один раз. Лист с буквами добавляется при первом входе. Все десять предметов находятся в общем инвентаре. Открытый лист перемещается мышью/касанием, кнопка ↩ возвращает его в инвентарь. Лист с буквами всегда под остальными страницами; отверстия действительно прозрачные.

Позиции книг и выданные награды сохраняются в `beach-library-v1`, предметы — в существующем `beach-party-inventory`. Незавершённое перемещение отменяется при уходе из сцены. Позиции открытых страниц живут до перезагрузки; сами предметы сохраняются.

## Спрайт

`assets/floor-book.png` создан встроенным image_gen по фону библиотеки, с прозрачностью. Корешки на полках рисуются CSS.

Промпт генерации:

> Use case: stylized-concept. Generate a single game sprite, a closed teal hardcover book lying flat, seen from above at a shallow three-quarter angle, matching the painterly tropical library reference's scattered floor books: cream page block, rounded worn teal cover, subtle gold edging, warm sunshine. Reference image is style reference only. Isolate ONE book centered, tightly framed, on a genuinely transparent background with alpha. No floor, no scene, no text, no letters, no additional objects. Output a square sprite.

Проверки: `node --test tests/beachLibrary.test.mjs`, `npm run build`.
