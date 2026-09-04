import '@testing-library/jest-dom/vitest'
import { cleanup } from '@testing-library/react'
import { afterEach } from 'vitest'

// Testing Library's auto-cleanup relies on a global `afterEach`, which we
// don't enable (vitest `globals: true`) so plain unit tests aren't polluted
// with implicit test-framework globals. Wire cleanup explicitly instead.
afterEach(() => {
  cleanup()
})
