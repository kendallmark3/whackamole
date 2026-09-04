import { describe, expect, it } from 'vitest'
import { isNewHighScore, nextScore } from './scoring'

describe('nextScore', () => {
  it('increments the score by one', () => {
    expect(nextScore(0)).toBe(1)
    expect(nextScore(9)).toBe(10)
  })
})

describe('isNewHighScore', () => {
  it('is true when the score exceeds the high score', () => {
    expect(isNewHighScore(5, 4)).toBe(true)
  })

  it('is false when the score is equal to or below the high score', () => {
    expect(isNewHighScore(4, 4)).toBe(false)
    expect(isNewHighScore(3, 4)).toBe(false)
  })
})
