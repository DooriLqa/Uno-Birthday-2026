const GAME_STORAGE_KEYS = [
  'arkanoid-progress-v1',
  'beach-party-currency',
  'beach-party-dialogues',
  'beach-party-inventory',
  'beach-party-progress',
  'beach-party-quiz-progress-v2',
  'beach-party-radio',
  'beach-party-totem-code',
  'fishing_catches',
  'robotMazeProgress',
  'tourist-world-v1',
] as const

export const resetGameState = () => {
  for (const key of GAME_STORAGE_KEYS) localStorage.removeItem(key)
  window.location.reload()
}
