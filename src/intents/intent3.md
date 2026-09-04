# Intent 3: Enterprise-Ready TypeScript Migration + Component Architecture + Sound

## 1. Intent / Goal

Bring `legacy-whackamole` up to an enterprise-grade engineering bar:

1. Migrate the entire application source to TypeScript — no `.js`/`.jsx` files remain in `src/` or in root-level tooling config.
2. Decompose the monolithic `src/App.jsx` render tree into a proper `src/components/` directory of small, typed, single-responsibility components.
3. Raise general code quality to a "solid, professional" bar appropriate for a codebase other engineers will extend: strict typing, no `any` escape hatches without justification, consistent patterns, tests and CI kept green throughout.
4. Add gameplay sound: at minimum, an audible cue when a mole is whacked.

This is an incremental hardening pass, not a rewrite. The current architecture (hooks own their concerns: `useCountdown`, `useMoleSpawner`, `highScoreStore`, `scoring`) is sound and should be preserved — only its file extensions, types, and the render-layer organization change.

## 2. Inputs / Context

Repo-aware assumptions, current as of this intent's authoring:

- **Stack**: React 19.2, Vite 8.2, Oxlint 1.79 (lint), Vitest 4 + `@testing-library/react` 16 (test, `jsdom` environment via `vite.config.js`'s `test` block, setup at `src/test/setup.js`). No TypeScript anywhere yet — `@types/react`/`@types/react-dom` are already installed as devDependencies but unused.
- **Source files in scope** (`src/`, all currently `.js`/`.jsx`):
  - `App.jsx` — top-level state + full render tree (header, stat bar, difficulty picker, start button, result banner, 3×3 mole grid, how-to-play modal) in one component.
  - `useCountdown.js` — 30s countdown timer hook, returns `{ secondsLeft, start, stop }`.
  - `useMoleSpawner.js` — mole spawn/despawn scheduling hook, exports `GRID`, `DIFFICULTIES` (`easy`/`medium`/`hard` config objects), and `useMoleSpawner(difficultyKey)` returning `{ holes, start, stop, clearHole }`. Contains a documented fragile-pattern warning in `CLAUDE.md` about not returning values out of `setState` updaters — preserve that fix (`clearHole` + caller reads `holes[i]` directly) exactly as-is; do not reintroduce the old `whack()`-returns-a-boolean approach.
  - `highScoreStore.js` — sole `localStorage` seam (`readHighScore`/`writeHighScore`), both wrapped in `try/catch`.
  - `scoring.js` — pure functions `nextScore`, `isNewHighScore`.
  - `main.jsx` — React root bootstrap.
  - `App.test.jsx`, `scoring.test.js`, `highScoreStore.test.js` — the existing 14-test Vitest suite; `App.test.jsx` uses `vi.useFakeTimers()` to drive full start→spawn→whack→score→game-end flows and is what caught the last real regression in this codebase (a `whack()` return-value bug). Its coverage must survive the migration/decomposition unreduced.
- **Root config in scope**: `vite.config.js` → `vite.config.ts`.
- **Out of scope**: `target-scaffold/` (explicitly reference-only per its own `README.md` and `CLAUDE.md` — nothing imports it; leave it as historical `.js` evidence, do not convert or delete it as part of this intent). `.github/workflows/ci.yml`, `package.json`, `.oxlintrc.json` are not JS source and are addressed only insofar as they need updated commands/paths.
- **No sound assets currently exist** in the repo (`public/` has only `favicon.svg`, `icons.svg`). No audio dependency is installed.
- **No design doc or reference scaffold** exists for component boundaries or sound design — infer both from the current render tree and game-feel conventions for arcade-style mini-games (see Section 5).

## 3. Outputs

### 3a. TypeScript migration
- Add `typescript` as a devDependency, plus a Vite-standard TS setup: `tsconfig.json` (project references) + `tsconfig.app.json` + `tsconfig.node.json`, matching the current `@vitejs/plugin-react` + Vite 8 toolchain. Enable `strict: true`.
- Rename every `src/**/*.js` → `.ts` and every `src/**/*.jsx` → `.tsx` (components/hooks that return JSX are `.tsx`; pure logic/state modules are `.ts`). Test files follow the same rule (`*.test.ts` / `*.test.tsx`).
- `vite.config.js` → `vite.config.ts`; keep the existing `test` block (`environment: 'jsdom'`, `setupFiles: './src/test/setup.ts'`) working under TS.
- Type every hook's public surface explicitly rather than relying on inference at the call site:
  - `useCountdown(startSeconds: number, onComplete?: () => void): { secondsLeft: number; start: () => void; stop: () => void }`
  - `DifficultyKey = 'easy' | 'medium' | 'hard'`; `DIFFICULTIES: Record<DifficultyKey, DifficultyConfig>` with an exported `DifficultyConfig` interface (`spawnMs`, `rampSpawnMs`, `rampAfterSpawns`, `upMs`, `label`).
  - `useMoleSpawner(difficultyKey: DifficultyKey): { holes: boolean[]; start: () => void; stop: () => void; clearHole: (i: number) => void }`
  - `readHighScore(): number`, `writeHighScore(score: number): void`
  - `nextScore(currentScore: number): number`, `isNewHighScore(score: number, highScore: number): boolean`
- No `any`. Where a genuine unknown boundary exists (e.g. a caught `localStorage` error), type it as `unknown` and narrow, not `any`.
- Update `.oxlintrc.json` if oxlint's TypeScript-aware rules need enabling for the new file types (check `oxlint`'s current TS support before adding a plugin — don't add a rule set that duplicates `tsc`'s own checks).
- Add a `type-check` script (`tsc -b --noEmit` or equivalent for the project-references setup) to `package.json` and wire it into `.github/workflows/ci.yml` alongside the existing `lint` / `test` / `build` steps.

### 3b. Component architecture
- Create `src/components/`. Extract from `App.jsx`'s current render tree (do not change what each renders or how it behaves — this is a decomposition, not a redesign):
  - `GameHeader.tsx` — title + how-to-play trigger button.
  - `StatBar.tsx` — score / time-left / high-score display (currently the three `.stat` blocks with `data-testid="score"|"seconds-left"|"high-score"`; preserve those test ids).
  - `DifficultyPicker.tsx` — the `DIFFICULTIES` button group, `disabled` while a round is running.
  - `MoleGrid.tsx` (+ `MoleHole.tsx` if a single hole's markup/props justify its own file) — the 3×3 grid of hole buttons, preserving `aria-label`, `disabled`, and the `.hole`/`.is-up` class contract that `App.css` and `App.test.jsx` depend on.
  - `ResultBanner.tsx` — the post-game score/high-score message.
  - `HowToPlayModal.tsx` — the rules/tips overlay.
- `App.tsx` keeps ownership of state and the hooks (`useCountdown`, `useMoleSpawner`, score/running/difficulty/etc.) and composes the components above via props. Do not lift state into context/Redux/etc. — nothing in this app currently needs cross-cutting state access beyond what prop-drilling one level already handles; introducing a state library would be unjustified architecture for a 9-hole game.
- Colocate each component's test next to it if a component's behavior is meaningfully unit-testable in isolation (e.g. `DifficultyPicker.test.tsx`), following the existing flat-file convention (`scoring.js` + `scoring.test.js`). Prefer keeping `App.test.tsx`'s existing full-flow tests as the primary regression net; component-level tests should add coverage, not duplicate it.
- No barrel `index.ts` re-export file unless/until the component count makes bare imports genuinely unwieldy — for ~6 components, direct imports (`from '../components/MoleGrid'`) are simpler and are the minimum sufficient structure.

### 3c. Sound
- Add a `useSoundEffects` hook (`src/useSoundEffects.ts`, or `src/hooks/useSoundEffects.ts` if a `hooks/` directory is introduced for it and `useCountdown`/`useMoleSpawner` — decide based on whether 3+ hooks make a dedicated directory clearer; either is acceptable, pick one and apply it consistently) that exposes a `playWhack()` (required) function, called from the same place `App` currently calls `clearHole(i)` on a successful hit.
- **Default implementation: synthesize the sound with the Web Audio API** (a short oscillator + gain-envelope "pop"/"thwack", similar in spirit to classic 8-bit SFX) rather than shipping binary audio assets. This avoids introducing licensing questions, an asset pipeline, or new binary files into the repo, and keeps the feature self-contained in one small module. If real sampled audio is preferred instead, that's a valid alternative — but it requires the user to supply the actual sound files (this intent's executor cannot generate audio assets), so treat "synthesized SFX" as the default path unless asset files are provided before implementation starts.
- Respect browser autoplay policy: only start/resume the `AudioContext` from within a user-gesture-triggered handler (the whack click itself qualifies).
- A countdown-tick or game-over cue is optional/nice-to-have, not required — add only if it can reuse the same synthesis approach with near-zero extra complexity; don't let it expand scope.
- No mute toggle is required by the original ask, but sound should never throw or break gameplay if `AudioContext` is unavailable (e.g. an older/locked-down browser, or tests running under `jsdom`, which has no real Web Audio API) — `playWhack()` must no-op safely rather than throw, mirroring the `try/catch` pattern already used in `highScoreStore.ts`. Confirm `App.test.tsx`'s existing whack tests still pass unmodified under `jsdom` with sound wired in.

## 4. Constraints

- Preserve all currently-observable game behavior: 30s round, 3×3 grid, difficulty-driven spawn/up timing, score/high-score logic, localStorage persistence key (`wam_high`), and the CSS class/`data-testid` contract (`App.css` and the test suite both depend on `.hole`, `.is-up`, `.stat-value`, `data-testid="score"|"seconds-left"|"high-score"`). Renaming/restructuring files must not change any of these.
- Preserve the `useMoleSpawner` fix documented in `CLAUDE.md` (state read from the calling component's render closure, not smuggled out of a `setState` updater) — this is a known-fragile pattern that must not be reintroduced during the TS conversion or decomposition.
- No new runtime dependencies beyond `typescript` (dev) and whatever minimal typing packages TS needs — do not add a state-management library, a UI component library, or an audio library (`howler.js` etc.) for a game this size. The Web Audio API is built into every target browser and needs no dependency.
- No behavior change to the actual bundle output beyond the additions explicitly listed above (sound). This is a structure/type/tooling hardening pass.
- `npm run lint`, `npm test`, `npm run build`, and the new `type-check` script must all pass before this intent is considered complete — the same validation loop already established in this repo (see `CLAUDE.md`, `.github/workflows/ci.yml`).

## 5. Acceptance Criteria

- [ ] Zero `.js`/`.jsx` files remain under `src/`; `vite.config.ts` replaces `vite.config.js`.
- [ ] `tsc -b --noEmit` (or the chosen type-check invocation) passes with `strict: true` and no `any`.
- [ ] `App.tsx` no longer contains the full render tree inline — it composes components from `src/components/`.
- [ ] All existing 14 tests (renamed to `.ts`/`.tsx`) still pass, unmodified in intent (assertions/behavior), after the migration and decomposition.
- [ ] Whacking a mole plays an audible sound in a real browser; `App.test.tsx`'s whack-flow tests still pass under `jsdom` (i.e., sound code doesn't throw when `AudioContext`/`Audio` isn't available in the test environment).
- [ ] `npm run lint`, `npm test`, `npm run build`, and the new type-check script all exit 0.
- [ ] `.github/workflows/ci.yml` runs the type-check step.
- [ ] `README.md` and `CLAUDE.md` project-layout sections are updated to reflect the new `src/components/` (and, if added, `src/hooks/`) structure and the TypeScript toolchain (mirroring how they were kept current after the last structural change in this repo).

## 6. Validation / Evidence

Run, in order, and capture pass/fail output as evidence (matches this repo's existing validation loop):
1. `npm run lint`
2. `npx tsc -b --noEmit` (or equivalent)
3. `npm test`
4. `npm run build`
5. Manual/live check: `npm run dev`, start a round, whack a mole, confirm sound is audible and the score increments (the same live-browser check this repo's prior sessions used to catch the original whack-registration bug — don't skip it just because unit tests pass).

## 7. Stop Conditions

- Stop and ask before deleting or converting `target-scaffold/` — it is explicitly out of scope (historical reference material per its own README).
- Stop and ask if TypeScript's `strict` mode surfaces a genuine behavioral ambiguity in existing logic (rather than a straightforward type annotation gap) — e.g. if it's unclear whether a value can truly be `null`/`undefined` at a given point. Don't paper over it with a non-null assertion (`!`) or `any` to make the compiler quiet.
- Stop and ask if achieving "no `.js` files" would require converting `target-scaffold/`'s reference files (it shouldn't — they're outside `src/` — but confirm this reading is correct if it comes up).
- Do not expand scope into unrelated refactors, a design-system overhaul, or additional gameplay features beyond the sound cue explicitly requested. This is a hardening + sound pass, not a feature pass.

## 8. Delivery Expectations

Implemented directly against `main` in small, coherent commits (this repo has no branch-protection/PR workflow configured yet — see `.github/workflows/ci.yml`, which runs on push and PR but nothing currently gates merges). Group commits logically (e.g. "add TypeScript toolchain," "convert hooks/logic to TS," "extract components," "add sound") rather than one monolithic commit, so the migration is reviewable step by step.
