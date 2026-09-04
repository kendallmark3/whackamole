import { useCallback, useEffect, useRef, useState } from 'react'

export const GRID = 9

export type DifficultyKey = 'easy' | 'medium' | 'hard'

export interface DifficultyConfig {
  label: string
  /** ms between spawns before the ramp threshold is reached */
  spawnMs: number
  /** ms between spawns once the ramp threshold is reached */
  rampSpawnMs: number
  /** number of spawns before the faster rampSpawnMs pace kicks in */
  rampAfterSpawns: number
  /** how long a mole stays up before it's auto-cleared */
  upMs: number
}

export const DIFFICULTIES: Record<DifficultyKey, DifficultyConfig> = {
  easy: { label: 'Easy', spawnMs: 1400, rampSpawnMs: 900, rampAfterSpawns: 8, upMs: 900 },
  medium: { label: 'Medium', spawnMs: 1000, rampSpawnMs: 650, rampAfterSpawns: 10, upMs: 700 },
  hard: { label: 'Hard', spawnMs: 700, rampSpawnMs: 400, rampAfterSpawns: 12, upMs: 500 },
}

const emptyHoles = (): boolean[] => Array(GRID).fill(false)

export interface UseMoleSpawnerResult {
  holes: boolean[]
  start: () => void
  stop: () => void
  clearHole: (i: number) => void
}

// Mole spawn/despawn scheduling, isolated from the component: owns its own
// timeout refs and clears them on stop/unmount, instead of leaking timers
// into module-level state.
export function useMoleSpawner(difficultyKey: DifficultyKey): UseMoleSpawnerResult {
  const [holes, setHoles] = useState<boolean[]>(emptyHoles)
  const spawnTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const upTimeoutsRef = useRef<Set<ReturnType<typeof setTimeout>>>(new Set())
  const spawnCountRef = useRef(0)
  const scheduleSpawnRef = useRef<(() => void) | null>(null)

  const clearAll = useCallback(() => {
    if (spawnTimeoutRef.current !== null) {
      clearTimeout(spawnTimeoutRef.current)
      spawnTimeoutRef.current = null
    }
    upTimeoutsRef.current.forEach((id) => clearTimeout(id))
    upTimeoutsRef.current.clear()
  }, [])

  const setHoleUp = useCallback((i: number, up: boolean) => {
    setHoles((prev) => {
      if (prev[i] === up) return prev
      const next = prev.slice()
      next[i] = up
      return next
    })
  }, [])

  const scheduleSpawn = useCallback(() => {
    const config = DIFFICULTIES[difficultyKey] ?? DIFFICULTIES.medium
    spawnCountRef.current += 1
    const delay =
      spawnCountRef.current > config.rampAfterSpawns ? config.rampSpawnMs : config.spawnMs

    spawnTimeoutRef.current = setTimeout(() => {
      const i = Math.floor(Math.random() * GRID)
      setHoleUp(i, true)

      const upTimeout = setTimeout(() => {
        upTimeoutsRef.current.delete(upTimeout)
        setHoleUp(i, false)
      }, config.upMs)
      upTimeoutsRef.current.add(upTimeout)

      scheduleSpawnRef.current?.()
    }, delay)
  }, [difficultyKey, setHoleUp])

  useEffect(() => {
    scheduleSpawnRef.current = scheduleSpawn
  }, [scheduleSpawn])

  const start = useCallback(() => {
    clearAll()
    spawnCountRef.current = 0
    setHoles(emptyHoles())
    scheduleSpawn()
  }, [clearAll, scheduleSpawn])

  const stop = useCallback(() => {
    clearAll()
    setHoles(emptyHoles())
  }, [clearAll])

  const clearHole = useCallback(
    (i: number) => {
      setHoleUp(i, false)
    },
    [setHoleUp],
  )

  useEffect(() => clearAll, [clearAll])

  return { holes, start, stop, clearHole }
}
