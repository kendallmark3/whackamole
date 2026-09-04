// Pure business logic — no DOM, no storage, no React. Easy to unit test in isolation.

export function nextScore(currentScore) {
  return currentScore + 1
}

export function isNewHighScore(score, highScore) {
  return score > highScore
}
