interface GameHeaderProps {
  onShowHelp: () => void
}

export function GameHeader({ onShowHelp }: GameHeaderProps) {
  return (
    <header className="game-header">
      <h1>🐹 Whack-a-Mole</h1>
      <button
        type="button"
        className="icon-button"
        aria-label="How to play"
        onClick={onShowHelp}
      >
        ?
      </button>
    </header>
  )
}
