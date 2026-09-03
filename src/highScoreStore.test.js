import { beforeEach, describe, expect, it, vi } from 'vitest'
import { readHighScore, writeHighScore } from './highScoreStore'

beforeEach(() => {
  localStorage.clear()
})

describe('readHighScore', () => {
  it('returns 0 when nothing is stored', () => {
    expect(readHighScore()).toBe(0)
  })

  it('returns the stored value', () => {
    localStorage.setItem('wam_high', '12')
    expect(readHighScore()).toBe(12)
  })

  it('falls back to 0 for corrupt data', () => {
    localStorage.setItem('wam_high', 'not-a-number')
    expect(readHighScore()).toBe(0)
  })

  it('falls back to 0 when localStorage throws', () => {
    const spy = vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('disabled')
    })
    expect(readHighScore()).toBe(0)
    spy.mockRestore()
  })
})

describe('writeHighScore', () => {
  it('persists the score as a string', () => {
    writeHighScore(7)
    expect(localStorage.getItem('wam_high')).toBe('7')
  })

  it('does not throw when localStorage is unavailable', () => {
    const spy = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('quota exceeded')
    })
    expect(() => writeHighScore(7)).not.toThrow()
    spy.mockRestore()
  })
})
