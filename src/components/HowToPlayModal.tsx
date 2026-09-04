import type { MouseEvent } from 'react'

interface HowToPlayModalProps {
  gameSeconds: number
  onClose: () => void
}

export function HowToPlayModal({ gameSeconds, onClose }: HowToPlayModalProps) {
  const stopPropagation = (e: MouseEvent<HTMLDivElement>) => e.stopPropagation()

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={stopPropagation}>
        <h2>How to Play</h2>
        <ul>
          <li>
            Pick a difficulty, then hit <strong>Start Game</strong>.
          </li>
          <li>Click a hole the instant a mole pops up to score a point.</li>
          <li>You've got {gameSeconds} seconds — rack up as many hits as you can.</li>
        </ul>
        <h2>Tips</h2>
        <ul>
          <li>Moles pop up faster the longer the round runs — stay ready.</li>
          <li>Higher difficulty means shorter mole appearances, so scan the whole grid.</li>
          <li>Beat your high score to see the 🎉 banner.</li>
        </ul>
        <button type="button" className="modal-close" onClick={onClose}>
          Got it
        </button>
      </div>
    </div>
  )
}
