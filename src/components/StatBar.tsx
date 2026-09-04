interface StatBarProps {
  score: number
  secondsLeft: number
  highScore: number
}

export function StatBar({ score, secondsLeft, highScore }: StatBarProps) {
  return (
    <div className="stat-bar">
      <div className="stat">
        <span className="stat-label">Score</span>
        <span className="stat-value" data-testid="score">
          {score}
        </span>
      </div>
      <div className="stat stat-timer">
        <span className="stat-label">Time</span>
        <span className="stat-value" data-testid="seconds-left">
          {secondsLeft}s
        </span>
      </div>
      <div className="stat">
        <span className="stat-label">High Score</span>
        <span className="stat-value" data-testid="high-score">
          {highScore}
        </span>
      </div>
    </div>
  )
}
