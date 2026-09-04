# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

- `npm run dev` — start Vite dev server with HMR
- `npm run build` — type-check (`tsc -b`) then production build
- `npm run preview` — preview the production build
- `npm run lint` — run Oxlint (config: `.oxlintrc.json`, plugins: `react`, `oxc`, `typescript`)
- `npm run type-check` — type-check only (`tsc -b`, no emit, no build)
- `npm test` — run the Vitest suite once (`npm run test -- --watch` to watch)

To run a single test file: `npx vitest run src/scoring.test.ts`. Tests run in `jsdom` via `vite.config.ts`'s `test` block; `src/test/setup.ts` wires up `@testing-library/jest-dom` matchers and Testing Library's DOM `cleanup` (explicit — `globals: true` is intentionally off, so every test file imports `describe`/`it`/`expect`/etc. from `vitest` directly).

The project is TypeScript throughout (`strict: true`, project references via `tsconfig.json` → `tsconfig.app.json` / `tsconfig.node.json`) — no `.js`/`.jsx` source files remain under `src/`.

## History: this was a legacy-migration exercise

The app started as a deliberately bad, monolithic `App.jsx` (module-level mutable state, in-place array mutation, render-time `localStorage`/`window` I/O, duplicated high-score logic, magic-number difficulty ramp, ~50 inline style objects) used as input to an intent-driven refactor exercise. It has since been refactored into the structure below, then migrated to TypeScript with the render tree split into `src/components/`. Files that remain from that original exercise as historical/reference material, not as active app code:

- `target-scaffold/` — reference-only convention examples (`useCountdown.js`, `highScoreStore.js`, `scoring.js`) that the real `src/` modules of the same name were originally built from. Nothing imports from `target-scaffold/`. Deliberately excluded from the TypeScript migration — it documents an earlier state, not the current one, so it stays as-is.
- `src/intents/analysis.md` — the original discovery report mapping the legacy component's responsibilities to those conventions, plus a validation-scenario checklist. Background on *why* the code is shaped the way it is, not an active task list.
- `src/intents/progresiveintent.md` — a runner-neutral "improve this repository" intent template for driving general repository-improvement passes.
- `src/intents/intent3.md` — the specific intent that drove the TypeScript migration, `src/components/` decomposition, and the whack sound effect. Useful as a worked example of this repo's intent-file conventions if writing another one.

## Architecture

- `src/App.tsx` — owns top-level game state (score, running, high score, difficulty, help-modal visibility, last-result banner) and the timing/spawn/sound hooks. Composes presentational components; holds no rendering detail beyond wiring props.
- `src/components/` — one component per concern, all typed via props interfaces, none holding game state themselves:
  - `GameHeader.tsx` — title + how-to-play trigger
  - `StatBar.tsx` — score / time-left / high-score display (`data-testid="score"|"seconds-left"|"high-score"` — the test suite depends on these)
  - `DifficultyPicker.tsx` — reads `DIFFICULTIES` from `useMoleSpawner`, renders the Easy/Medium/Hard buttons
  - `MoleGrid.tsx` + `MoleHole.tsx` — the 3×3 grid; `MoleHole` owns a single hole's `.hole`/`.is-up` class and `aria-label` contract (also depended on by tests and `App.css`)
  - `ResultBanner.tsx` — post-game message; exports the `GameResult` type `App.tsx` uses for `lastResult` state
  - `HowToPlayModal.tsx` — rules/tips overlay
- `src/hooks/` — stateful logic isolated from rendering:
  - `useCountdown.ts` — the 30-second countdown: owns its own `setInterval` via `useRef`, cleans up on stop/unmount, exposes `{ secondsLeft, start, stop }`.
  - `useMoleSpawner.ts` — mole spawn/despawn scheduling. Owns the `holes: boolean[]` array and its own `setTimeout` chain (spawn timer + one up-timer per mole), keyed off a `DIFFICULTIES: Record<DifficultyKey, DifficultyConfig>` map (`easy`/`medium`/`hard`: spawn interval, ramp-up interval, ramp threshold, mole up-duration). Exposes `{ holes, start, stop, clearHole }`. The recursive spawn loop reads the next call through a ref (`scheduleSpawnRef`) rather than closing over itself, to avoid a stale-closure/TDZ issue.
  - `useSoundEffects.ts` — the whack sound. Synthesizes a short oscillator+gain-envelope "pop" via the Web Audio API rather than shipping a binary audio asset — no asset pipeline, no licensing question. Lazily creates one `AudioContext`, resumes it on the whack click (satisfies the browser autoplay-gesture requirement), and every call is wrapped so a missing/broken Web Audio API (e.g. `jsdom` in tests) no-ops instead of throwing — sound must never be able to break gameplay.
- `src/highScoreStore.ts` — the only code that touches `localStorage` (key `wam_high`). Both read and write are wrapped in `try/catch` so a disabled/full/corrupt store degrades to `0` instead of throwing.
- `src/scoring.ts` — pure functions (`nextScore`, `isNewHighScore`) with no DOM/storage access.

**Known-fragile pattern to avoid repeating:** an earlier version of `useMoleSpawner` tried to detect a "hit" by setting a local variable inside a `setHoles` updater function and returning it from `whack()`. That relies on React's `dispatchSetState` eagerly invoking the updater synchronously — an internal bailout optimization, not a guarantee — and it silently failed under React 19 (clicks never scored). The fix, and the pattern to follow: read state directly from the calling component's render closure (`App.tsx` checks `holes[i]` itself) rather than trying to smuggle a value out of a state updater.

## Testing

`src/App.test.tsx` uses `vi.useFakeTimers()` + Testing Library to drive full game flows (start → wait for a spawn → whack it → assert the score) — this is the level that catches spawn/timing/state-wiring bugs; the pure-function tests (`scoring.test.ts`, `highScoreStore.test.ts`) don't. When changing timer or spawn behavior, prefer extending `App.test.tsx` over adding narrower mocks. The suite runs against the composed `App`, not against individual `src/components/` files in isolation — if you add a component-level test, it should add coverage (e.g. a prop-driven edge case), not duplicate what `App.test.tsx` already proves end-to-end.

## Preserving behavior

Preserve the game's observable behavior (30s round, 3×3 grid, click-to-score, persisted high score, whack sound) unless explicitly asked to change it.
