# Beach Day

Стартовый проект с пятью пляжными мини-играми.

## Стек

- React 19 + TypeScript + Vite
- React Router — маршруты каталога и игр
- Zustand с `persist` — прогресс сохраняется в `localStorage`
- PixiJS — игровая сцена
- Локальная UI-система в `src/shared/ui` — лёгкая и легко меняется через CSS
- ESLint, Husky и lint-staged — линт запускается для staged-файлов перед коммитом

## Команды

```bash
npm run dev
npm run lint
npm run format
npm run build
```

## Структура

Код разделён по FSD: `app`, `pages`, `widgets`, `features`, `entities`, `shared`.
Каждая мини-игра лежит в отдельной фиче внутри `src/features` и содержит собственный компонент и CSS-оформление. Каталог мини-игр находится в `src/entities/game/model/games.ts`.

Prettier запускается для всего проекта перед каждым коммитом, затем lint-staged проверяет изменённые файлы.
