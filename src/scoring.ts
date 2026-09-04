// Pure business logic — no DOM, no storage, no React. Easy to unit test in isolation.

export function nextScore(currentScore: number): number {
  return currentScore + 1
}

export function isNewHighScore(score: number, highScore: number): boolean {
  return score > highScore
}
