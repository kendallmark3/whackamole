import { useCallback, useRef } from 'react'

type AudioContextConstructor = typeof AudioContext

function getAudioContextConstructor(): AudioContextConstructor | null {
  if (typeof window === 'undefined') return null
  const win = window as typeof window & { webkitAudioContext?: AudioContextConstructor }
  return win.AudioContext ?? win.webkitAudioContext ?? null
}

export interface UseSoundEffectsResult {
  playWhack: () => void
}

// Synthesizes short SFX with the Web Audio API instead of shipping binary
// audio assets — no licensing questions, no asset pipeline. Lazily creates
// (and resumes) a single AudioContext from within a user-gesture handler, per
// browser autoplay policy. Never throws: no-ops safely if the Web Audio API
// isn't available (e.g. under jsdom in tests, or a locked-down browser),
// since sound is a nice-to-have that must never break gameplay.
export function useSoundEffects(): UseSoundEffectsResult {
  const contextRef = useRef<AudioContext | null>(null)

  const getContext = useCallback((): AudioContext | null => {
    if (contextRef.current) return contextRef.current
    const Ctor = getAudioContextConstructor()
    if (!Ctor) return null
    try {
      contextRef.current = new Ctor()
      return contextRef.current
    } catch {
      return null
    }
  }, [])

  const playWhack = useCallback(() => {
    const ctx = getContext()
    if (!ctx) return

    try {
      if (ctx.state === 'suspended') {
        void ctx.resume()
      }

      const now = ctx.currentTime
      const oscillator = ctx.createOscillator()
      const gain = ctx.createGain()

      oscillator.type = 'triangle'
      oscillator.frequency.setValueAtTime(220, now)
      oscillator.frequency.exponentialRampToValueAtTime(80, now + 0.12)

      gain.gain.setValueAtTime(0.001, now)
      gain.gain.exponentialRampToValueAtTime(0.3, now + 0.01)
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15)

      oscillator.connect(gain)
      gain.connect(ctx.destination)

      oscillator.start(now)
      oscillator.stop(now + 0.15)
    } catch {
      // sound is a nice-to-have; never let it break gameplay
    }
  }, [getContext])

  return { playWhack }
}
