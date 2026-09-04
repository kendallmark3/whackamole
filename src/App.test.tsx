import { act, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import App from './App'

function getUpHole(): HTMLButtonElement {
  const upHole = document.querySelector<HTMLButtonElement>('.hole.is-up')
  if (!upHole) throw new Error('expected an up hole to exist')
  return upHole
}

function getDownHole(): HTMLButtonElement {
  const downHole = [...document.querySelectorAll<HTMLButtonElement>('.hole')].find(
    (hole) => !hole.classList.contains('is-up'),
  )
  if (!downHole) throw new Error('expected a down hole to exist')
  return downHole
}

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

    fireEvent.click(getUpHole())

    expect(screen.getByTestId('score')).toHaveTextContent('1')
  })

  it('registers every hit when two different moles are whacked in the same event batch', () => {
    // Real rapid play can land two clicks (on two already-up moles) before
    // React re-renders between them. A handler that reads `score` from its
    // closure instead of a functional setState update would compute the
    // same "next" value for both clicks and silently drop one hit.
    let toggle = false
    const randomSpy = vi.spyOn(Math, 'random').mockImplementation(() => {
      toggle = !toggle
      return toggle ? 0 : 0.5 // alternates spawn hole index between 0 and 4
    })

    render(<App />)
    fireEvent.click(screen.getByText('Start Game'))

    act(() => {
      // medium ramps after 10 spawns (1000ms apart) to a 650ms pace, while
      // each mole stays up 700ms — so spawn #11 lands while #10 is still up
      vi.advanceTimersByTime(10_660)
    })

    const upHoles = [...document.querySelectorAll<HTMLButtonElement>('.hole.is-up')]
    expect(upHoles).toHaveLength(2)

    act(() => {
      fireEvent.click(upHoles[0])
      fireEvent.click(upHoles[1])
    })

    expect(screen.getByTestId('score')).toHaveTextContent('2')

    randomSpy.mockRestore()
  })

  it('does not score when whacking a hole with no mole up', () => {
    render(<App />)
    fireEvent.click(screen.getByText('Start Game'))

    fireEvent.click(getDownHole())

    expect(screen.getByTestId('score')).toHaveTextContent('0')
  })

  it('persists a new high score and shows the banner at game end', () => {
    render(<App />)
    fireEvent.click(screen.getByText('Start Game'))

    act(() => {
      vi.advanceTimersByTime(1000)
    })
    fireEvent.click(getUpHole())

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
