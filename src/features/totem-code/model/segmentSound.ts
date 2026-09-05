const segmentTurnAudio = new Audio('/audio/sfx/totem-segment-turn.ogg')

segmentTurnAudio.preload = 'auto'
segmentTurnAudio.volume = 0.45

export function playSegmentTurnSound() {
  segmentTurnAudio.currentTime = 0
  void segmentTurnAudio.play().catch(() => undefined)
}
