interface MoleHoleProps {
  isUp: boolean
  disabled: boolean
  onWhack: () => void
}

export function MoleHole({ isUp, disabled, onWhack }: MoleHoleProps) {
  return (
    <button
      type="button"
      className={`hole${isUp ? ' is-up' : ''}`}
      onClick={onWhack}
      disabled={disabled}
      aria-label={isUp ? 'Whack the mole' : 'Empty hole'}
    >
      {isUp ? '🐹' : ''}
    </button>
  )
}
