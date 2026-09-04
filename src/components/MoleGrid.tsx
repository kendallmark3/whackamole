import { MoleHole } from './MoleHole'

interface MoleGridProps {
  holes: boolean[]
  disabled: boolean
  onWhack: (index: number) => void
}

export function MoleGrid({ holes, disabled, onWhack }: MoleGridProps) {
  return (
    <div className="mole-grid">
      {holes.map((isUp, i) => (
        <MoleHole key={i} isUp={isUp} disabled={disabled} onWhack={() => onWhack(i)} />
      ))}
    </div>
  )
}
