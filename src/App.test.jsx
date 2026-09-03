import { act, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import App from './App'

beforeEach(() => {
  localStorage.clear()
  vi.useFakeTimers()
})

afterEach(() => {
  vi.useRealTimers()
})

describe('App', () => {
  it('scores a point when a visible mole is whacked', () => {
    render(<App />)

    fireEvent.click(screen.getByText('Start Game'))

    // medium difficulty spawns the first mole 1000ms after start
    act(() => {
      vi.advanceTimersByTime(1000)
    })

    const upHole = document.querySelector('.hole.is-up')
    expect(upHole).not.toBeNull()

    fireEvent.click(upHole)

    expect(screen.getByTestId('score')).toHaveTextContent('1')
  })

  it('does not score when whacking a hole with no mole up', () => {
    render(<App />)
    fireEvent.click(screen.getByText('Start Game'))

    const downHole = [...document.querySelectorAll('.hole')].find(
      (hole) => !hole.classList.contains('is-up'),
    )
    fireEvent.click(downHole)

    expect(screen.getByTestId('score')).toHaveTextContent('0')
  })

  it('persists a new high score and shows the banner at game end', () => {
    render(<App />)
    fireEvent.click(screen.getByText('Start Game'))

    act(() => {
      vi.advanceTimersByTime(1000)
    })
    fireEvent.click(document.querySelector('.hole.is-up'))

    act(() => {
      vi.advanceTimersByTime(30000)
    })

    expect(screen.getByText('🎉 New high score: 1!')).toBeInTheDocument()
    expect(screen.getByTestId('high-score')).toHaveTextContent('1')
    expect(localStorage.getItem('wam_high')).toBe('1')
    expect(screen.getByText('Start Game')).toBeInTheDocument()
  })

  it('disables Start and difficulty selection while a game is running', () => {
    render(<App />)
    fireEvent.click(screen.getByText('Start Game'))

    expect(screen.getByText('Playing…')).toBeDisabled()
    expect(screen.getByText('Easy')).toBeDisabled()
  })

  it('opens and closes the how-to-play modal', () => {
    render(<App />)
    fireEvent.click(screen.getByLabelText('How to play'))
    expect(screen.getByText('How to Play')).toBeInTheDocument()

    fireEvent.click(screen.getByText('Got it'))
    expect(screen.queryByText('How to Play')).not.toBeInTheDocument()
  })
})
