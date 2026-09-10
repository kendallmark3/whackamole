// Single seam for persistence. Nothing else in the app should touch localStorage or window directly.

const KEY = 'wam_high'

export function readHighScore(): number {
  try {
    const raw = localStorage.getItem(KEY)
    if (raw === null || !/^\d+$/.test(raw)) return 0
    const parsed = parseInt(raw, 10)
    return Number.isSafeInteger(parsed) ? parsed : 0
  } catch {
    return 0
  }
}

export function writeHighScore(score: number): void {
  try {
    localStorage.setItem(KEY, String(score))
  } catch {
    // localStorage unavailable or full — high score just won't persist this session
  }
}
