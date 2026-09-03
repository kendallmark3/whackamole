// Single seam for persistence. Nothing else in the app should touch localStorage or window directly.

const KEY = 'wam_high'

export function readHighScore() {
  const raw = localStorage.getItem(KEY)
  return raw ? parseInt(raw, 10) : 0
}

export function writeHighScore(score) {
  localStorage.setItem(KEY, String(score))
}
