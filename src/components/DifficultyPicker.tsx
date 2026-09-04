import { DIFFICULTIES, type DifficultyConfig, type DifficultyKey } from '../hooks/useMoleSpawner'

const DIFFICULTY_ENTRIES = Object.entries(DIFFICULTIES) as Array<[DifficultyKey, DifficultyConfig]>

interface DifficultyPickerProps {
  value: DifficultyKey
  disabled: boolean
  onChange: (key: DifficultyKey) => void
}

export function DifficultyPicker({ value, disabled, onChange }: DifficultyPickerProps) {
  return (
    <div className="difficulty-picker" role="group" aria-label="Difficulty">
      {DIFFICULTY_ENTRIES.map(([key, config]) => (
        <button
          key={key}
          type="button"
          className={`difficulty-button${value === key ? ' is-selected' : ''}`}
          disabled={disabled}
          onClick={() => onChange(key)}
        >
          {config.label}
        </button>
      ))}
    </div>
  )
}
