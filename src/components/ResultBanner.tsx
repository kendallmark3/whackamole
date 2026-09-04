export interface GameResult {
  score: number
  isHighScore: boolean
}

interface ResultBannerProps {
  result: GameResult
}

export function ResultBanner({ result }: ResultBannerProps) {
  return (
    <p className={`result-banner${result.isHighScore ? ' is-high-score' : ''}`}>
      {result.isHighScore
        ? `🎉 New high score: ${result.score}!`
        : `Game over — score: ${result.score}`}
    </p>
  )
}
