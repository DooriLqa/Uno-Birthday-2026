# Равные полки и цветные книги

Инструмент: встроенный image_gen. Изображения скопированы в проект без изменения альфа-канала.

Фон: `src/shared/assets/locations/tourist/library.png`.
Спрайты: `floor-book-teal.png`, `floor-book-rust.png`, `floor-book-blue.png`, `floor-book-gold.png`, `floor-book-purple.png` в этой папке.

## Фон

Edit this tropical library background. Keep all surroundings, camera, framing, 3 columns, empty floor, no books, painterly style unchanged. Correct ONLY horizontal shelf positions so each of the THREE rows of open compartments has EXACTLY EQUAL visible clear height. Top inner ceiling at y=20% of image; bottom usable shelf surface at y=63.6%. Two intermediate shelf surfaces at y=34.53% and y=49.07%. All shelf boards equal thin thickness. The three rows should look equally tall, including bottom row; current bottom row is too short. Three straight horizontal levels across all three columns, no extra shelves. Preserve 16:9 landscape.

## Зелёная книга

Edit target: attached isolated lying book sprite. Produce ONE identical book with identical silhouette, camera angle, gold trim, cream page block, painterly texture and placement. Change cover and spine base color to muted teal green #32766c matching an upright game book of that color. Genuinely transparent alpha background, no floor, no drop shadow outside book, no text. Entire book fully visible with same margins as reference. Square PNG.

## Остальные варианты

Тот же промпт и исходный `floor-book.png`, с заменой `muted teal green #32766c` соответственно на `rust red #a95037`, `muted blue #345c85`, `ochre gold #ad8638`, `muted purple #714e77`. Каждый вариант создан отдельным вызовом image_gen.
