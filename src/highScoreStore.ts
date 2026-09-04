// Single seam for persistence. Nothing else in the app should touch localStorage or window directly.

const KEY = 'wam_high'

export function readHighScore() {
  try {
    const raw = localStorage.getItem(KEY)
    const parsed = raw ? parseInt(raw, 10) : 0
    return Number.isFinite(parsed) ? parsed : 0
  } catch {
    return 0
  }
}

export function writeHighScore(score) {
  try {
    localStorage.setItem(KEY, String(score))
  } catch {
    // localStorage unavailable or full — high score just won't persist this session
  }
}
