# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

- `npm run dev` — start Vite dev server with HMR
- `npm run build` — production build
- `npm run preview` — preview the production build
- `npm run lint` — run Oxlint (config: `.oxlintrc.json`, plugins: `react`, `oxc`)
- `npm test` — run the Vitest suite once (`npm run test -- --watch` to watch)

To run a single test file: `npx vitest run src/scoring.test.js`. Tests run in `jsdom` via `vite.config.js`'s `test` block; `src/test/setup.js` wires up `@testing-library/jest-dom` matchers.

## History: this was a legacy-migration exercise

The app started as a deliberately bad, monolithic `App.jsx` (module-level mutable state, in-place array mutation, render-time `localStorage`/`window` I/O, duplicated high-score logic, magic-number difficulty ramp, ~50 inline style objects) used as input to an intent-driven refactor exercise. It has since been refactored into the structure below. Two files remain from that exercise as historical/reference material, not as active app code:

- `target-scaffold/` — reference-only convention examples (`useCountdown.js`, `highScoreStore.js`, `scoring.js`) that the real `src/` modules of the same name were built from. Nothing imports from `target-scaffold/`.
- `src/intents/analysis.md` — the original discovery report mapping the legacy component's responsibilities to those conventions, plus a validation-scenario checklist. Useful as background on *why* the code is shaped the way it is, not as an active task list (its gaps have been addressed).

## Architecture

- `src/App.jsx` — top-level game state (score, running, high score, difficulty, help-modal visibility, last-result banner) and rendering. Composes the hooks/modules below; holds no game timing logic itself.
- `src/useCountdown.js` — the 30-second countdown: owns its own `setInterval` via `useRef`, cleans up on stop/unmount, exposes `{ secondsLeft, start, stop }`.
- `src/useMoleSpawner.js` — mole spawn/despawn scheduling. Owns the `holes` boolean array and its own `setTimeout` chain (spawn timer + one up-timer per mole), keyed off a `DIFFICULTIES` config (`easy`/`medium`/`hard`: spawn interval, ramp-up interval, ramp threshold, mole up-duration). Exposes `{ holes, start, stop, clearHole }`. The recursive spawn loop reads the next call through a ref (`scheduleSpawnRef`) rather than closing over itself, to avoid a stale-closure/TDZ issue.
- `src/highScoreStore.js` — the only code that touches `localStorage` (key `wam_high`). Both read and write are wrapped in `try/catch` so a disabled/full/corrupt store degrades to `0` instead of throwing.
- `src/scoring.js` — pure functions (`nextScore`, `isNewHighScore`) with no DOM/storage access.

**Known-fragile pattern to avoid repeating:** an earlier version of `useMoleSpawner` tried to detect a "hit" by setting a local variable inside a `setHoles` updater function and returning it from `whack()`. That relies on React's `dispatchSetState` eagerly invoking the updater synchronously — an internal bailout optimization, not a guarantee — and it silently failed under React 19 (clicks never scored). The fix, and the pattern to follow: read state directly from the calling component's render closure (`App.jsx` checks `holes[i]` itself) rather than trying to smuggle a value out of a state updater.

## Testing

`src/App.test.jsx` uses `vi.useFakeTimers()` + Testing Library to drive full game flows (start → wait for a spawn → whack it → assert the score) — this is the level that catches spawn/timing/state-wiring bugs; the pure-function tests (`scoring.test.js`, `highScoreStore.test.js`) don't. When changing timer or spawn behavior, prefer extending `App.test.jsx` over adding narrower mocks.

## Preserving behavior

Preserve the game's observable behavior (30s round, 3×3 grid, click-to-score, persisted high score) unless explicitly asked to change it.
