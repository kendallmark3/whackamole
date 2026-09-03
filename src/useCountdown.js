import { useCallback, useEffect, useRef, useState } from 'react'

const TICK_MS = 1000

// Stateful timer logic isolated in a hook: owns its own interval, cleans up on
// unmount or restart, exposes a small imperative surface instead of leaking a
// raw interval id into the caller.
export function useCountdown(startSeconds, onComplete) {
  const [secondsLeft, setSecondsLeft] = useState(startSeconds)
  const intervalRef = useRef(null)

  const stop = useCallback(() => {
    if (intervalRef.current !== null) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
  }, [])

  const start = useCallback(() => {
    stop()
    setSecondsLeft(startSeconds)
    intervalRef.current = setInterval(() => {
      setSecondsLeft((current) => {
        if (current <= 1) {
          stop()
          onComplete?.()
          return 0
        }
        return current - 1
      })
    }, TICK_MS)
  }, [startSeconds, onComplete, stop])

  useEffect(() => stop, [stop])

  return { secondsLeft, start, stop }
}
