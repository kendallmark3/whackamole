import { useCallback, useEffect, useRef, useState } from 'react'

export const GRID = 9

export const DIFFICULTIES = {
  easy: { label: 'Easy', spawnMs: 1400, rampSpawnMs: 900, rampAfterSpawns: 8, upMs: 900 },
  medium: { label: 'Medium', spawnMs: 1000, rampSpawnMs: 650, rampAfterSpawns: 10, upMs: 700 },
  hard: { label: 'Hard', spawnMs: 700, rampSpawnMs: 400, rampAfterSpawns: 12, upMs: 500 },
}

const emptyHoles = () => Array(GRID).fill(false)

// Mole spawn/despawn scheduling, isolated from the component: owns its own
// timeout refs and clears them on stop/unmount, instead of leaking timers
// into module-level state.
export function useMoleSpawner(difficultyKey) {
  const [holes, setHoles] = useState(emptyHoles)
  const spawnTimeoutRef = useRef(null)
  const upTimeoutsRef = useRef(new Set())
  const spawnCountRef = useRef(0)
  const scheduleSpawnRef = useRef(null)

  const clearAll = useCallback(() => {
    if (spawnTimeoutRef.current !== null) {
      clearTimeout(spawnTimeoutRef.current)
      spawnTimeoutRef.current = null
    }
    upTimeoutsRef.current.forEach((id) => clearTimeout(id))
    upTimeoutsRef.current.clear()
  }, [])

  const setHoleUp = useCallback((i, up) => {
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

      scheduleSpawnRef.current()
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
    (i) => {
      setHoleUp(i, false)
    },
    [setHoleUp],
  )

  useEffect(() => clearAll, [clearAll])

  return { holes, start, stop, clearHole }
}
