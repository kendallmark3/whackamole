import { useCallback, useEffect, useRef, useState } from 'react'
import './App.css'
import { useCountdown } from './hooks/useCountdown'
import { useMoleSpawner, type DifficultyKey } from './hooks/useMoleSpawner'
import { useSoundEffects } from './hooks/useSoundEffects'
import { readHighScore, writeHighScore } from './highScoreStore'
import { nextScore, isNewHighScore } from './scoring'
import { GameHeader } from './components/GameHeader'
import { StatBar } from './components/StatBar'
import { DifficultyPicker } from './components/DifficultyPicker'
import { MoleGrid } from './components/MoleGrid'
import { ResultBanner, type GameResult } from './components/ResultBanner'
import { HowToPlayModal } from './components/HowToPlayModal'

const GAME_SECONDS = 30

function App() {
  const [difficulty, setDifficulty] = useState<DifficultyKey>('medium')
  const [score, setScore] = useState(0)
  const [running, setRunning] = useState(false)
  const [highScore, setHighScore] = useState(() => readHighScore())
  const [showHelp, setShowHelp] = useState(false)
  const [lastResult, setLastResult] = useState<GameResult | null>(null)

  const scoreRef = useRef(0)
  const startHighScoreRef = useRef(0)

  useEffect(() => {
    scoreRef.current = score
  }, [score])

  const { holes, start: startMoles, stop: stopMoles, clearHole } = useMoleSpawner(difficulty)
  const { playWhack } = useSoundEffects()

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

  function handleWhackAt(i: number) {
    if (!running) return
    if (!holes[i]) return

    clearHole(i)
    playWhack()

    // Functional updates, not `nextScore(score)` + `setScore(next)`: rapid
    // consecutive whacks on different holes can fire before React re-renders,
    // so multiple handleWhackAt calls would otherwise close over the same
    // stale `score`/`highScore` and each computed the same "next" value —
    // hits landing but not visibly incrementing the score.
    setScore((prevScore) => {
      const next = nextScore(prevScore)
      setHighScore((prevHighScore) => {
        if (!isNewHighScore(next, prevHighScore)) return prevHighScore
        writeHighScore(next)
        return next
      })
      return next
    })
  }

  return (
    <div className="game">
      <GameHeader onShowHelp={() => setShowHelp(true)} />

      <StatBar score={score} secondsLeft={secondsLeft} highScore={highScore} />

      <DifficultyPicker value={difficulty} disabled={running} onChange={setDifficulty} />

      <button type="button" className="start-button" onClick={startGame} disabled={running}>
        {running ? 'Playing…' : 'Start Game'}
      </button>

      {lastResult && !running && <ResultBanner result={lastResult} />}

      <MoleGrid holes={holes} disabled={!running} onWhack={handleWhackAt} />

      {showHelp && (
        <HowToPlayModal gameSeconds={GAME_SECONDS} onClose={() => setShowHelp(false)} />
      )}
    </div>
  )
}

export default App
