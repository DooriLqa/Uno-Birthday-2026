# Unu Birthday 2026

## Быстрый старт

### Требования

- Node.js 20.19+ или 22.12+ (рекомендуется актуальная LTS-версия)
- npm 10+ — устанавливается вместе с Node.js

Проверить установленные версии можно командами:

```bash
node --version
npm --version
```

### Установка и запуск

1. Клонируйте репозиторий и перейдите в папку проекта:

   ```bash
   git clone <URL_РЕПОЗИТОРИЯ>
   cd uno-birthday
   ```

2. Установите зависимости. Эта команда также подключит Git-хуки Husky:

   ```bash
   npm install
   ```

3. Запустите сервер разработки:

   ```bash
   npm run dev
   ```

4. Откройте адрес из вывода команды (обычно `http://localhost:5173`) в браузере.

### Проверка перед отправкой изменений

```bash
npm run format:check  # проверить форматирование
npm run lint          # проверить код
npm run build         # проверить production-сборку
```

Для автоматического форматирования используйте `npm run format`.

Проект-поздравление для Юни

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
