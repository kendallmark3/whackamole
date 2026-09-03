import { useCallback, useEffect, useRef, useState } from 'react'
import './App.css'
import { useCountdown } from './useCountdown'
import { useMoleSpawner, DIFFICULTIES } from './useMoleSpawner'
import { readHighScore, writeHighScore } from './highScoreStore'
import { nextScore, isNewHighScore } from './scoring'

const GAME_SECONDS = 30

function App() {
  const [difficulty, setDifficulty] = useState('medium')
  const [score, setScore] = useState(0)
  const [running, setRunning] = useState(false)
  const [highScore, setHighScore] = useState(() => readHighScore())
  const [showHelp, setShowHelp] = useState(false)
  const [lastResult, setLastResult] = useState(null)

  const scoreRef = useRef(0)
  const startHighScoreRef = useRef(0)

  useEffect(() => {
    scoreRef.current = score
  }, [score])

  const { holes, start: startMoles, stop: stopMoles, clearHole } = useMoleSpawner(difficulty)

  const handleFinish = useCallback(() => {
    setRunning(false)
    stopMoles()
    setLastResult({
      score: scoreRef.current,
      isHighScore: scoreRef.current > startHighScoreRef.current,
    })
  }, [stopMoles])

  const { secondsLeft, start: startTimer } = useCountdown(GAME_SECONDS, handleFinish)

  function startGame() {
    if (running) return
    setScore(0)
    scoreRef.current = 0
    setLastResult(null)
    startHighScoreRef.current = highScore
    setRunning(true)
    startTimer()
    startMoles()
  }

  function handleWhackAt(i) {
    if (!running) return
    if (!holes[i]) return

    clearHole(i)
    const next = nextScore(score)
    setScore(next)

    if (isNewHighScore(next, highScore)) {
      setHighScore(next)
      writeHighScore(next)
    }
  }

  return (
    <div className="game">
      <header className="game-header">
        <h1>🐹 Whack-a-Mole</h1>
        <button
          type="button"
          className="icon-button"
          aria-label="How to play"
          onClick={() => setShowHelp(true)}
        >
          ?
        </button>
      </header>

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

      <div className="difficulty-picker" role="group" aria-label="Difficulty">
        {Object.entries(DIFFICULTIES).map(([key, config]) => (
          <button
            key={key}
            type="button"
            className={`difficulty-button${difficulty === key ? ' is-selected' : ''}`}
            disabled={running}
            onClick={() => setDifficulty(key)}
          >
            {config.label}
          </button>
        ))}
      </div>

      <button type="button" className="start-button" onClick={startGame} disabled={running}>
        {running ? 'Playing…' : 'Start Game'}
      </button>

      {lastResult && !running && (
        <p className={`result-banner${lastResult.isHighScore ? ' is-high-score' : ''}`}>
          {lastResult.isHighScore
            ? `🎉 New high score: ${lastResult.score}!`
            : `Game over — score: ${lastResult.score}`}
        </p>
      )}

      <div className="mole-grid">
        {holes.map((up, i) => (
          <button
            key={i}
            type="button"
            className={`hole${up ? ' is-up' : ''}`}
            onClick={() => handleWhackAt(i)}
            disabled={!running}
            aria-label={up ? 'Whack the mole' : 'Empty hole'}
          >
            {up ? '🐹' : ''}
          </button>
        ))}
      </div>

      {showHelp && (
        <div className="modal-backdrop" onClick={() => setShowHelp(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>How to Play</h2>
            <ul>
              <li>
                Pick a difficulty, then hit <strong>Start Game</strong>.
              </li>
              <li>Click a hole the instant a mole pops up to score a point.</li>
              <li>You've got {GAME_SECONDS} seconds — rack up as many hits as you can.</li>
            </ul>
            <h2>Tips</h2>
            <ul>
              <li>Moles pop up faster the longer the round runs — stay ready.</li>
              <li>Higher difficulty means shorter mole appearances, so scan the whole grid.</li>
              <li>Beat your high score to see the 🎉 banner.</li>
            </ul>
            <button type="button" className="modal-close" onClick={() => setShowHelp(false)}>
              Got it
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default App
