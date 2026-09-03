
**Discovery ID:** whackamole-migration-discovery-002  
**Date:** September 3, 2026  
**Coordinator:** migration-discovery-coordinator  
**Status:** ✅ Ready for Implementation Intent  

---

## 1. Executive Summary

**Service:** Whackamole — A React 19 + Vite game UI application  
**Legacy source:** `/Users/markkendall/copilot/legacy-whackamole/src`  
**Target scaffold:** `/Users/markkendall/copilot/legacy-whackamole/target-scaffold`

### What Is Being Migrated
A monolithic React game component (`App.jsx`, ~130 lines) into a modular, hook-based architecture aligned with the target scaffold. The legacy app implements a 9-hole whack-a-mole game with a 30-second timer, score tracking, and localStorage-based high-score persistence.

### What Was Learned
1. **Low complexity:** The game logic is self-contained with no external APIs or backends. All concerns (state, logic, styling) are co-located in a single component.
2. **Clear migration path:** The target scaffold provides three reusable utilities (`useCountdown`, `highScoreStore`, `scoring.js`) that directly address the legacy app's largest anti-patterns.
3. **Well-understood gaps:** 14 gaps identified; 10 are standard React refactoring patterns (e.g., moving state to `useState`, cleanup to `useEffect`), 2 are infrastructure (testing, CI/CD), and 2 are direct utility reuse.
4. **Risk profile: LOW** — No breaking changes, no external dependencies, no version constraints. The refactored app will have identical observable behavior with improved code quality.

### What Materially Affects Implementation
- **Styling refactoring:** ~50 inline style properties must be replaced with CSS variables or a CSS file. Moderate effort (1 hour), low risk.
- **State restructuring:** Module-level mutable variables and array mutations must be eliminated. Standard React patterns apply; well-understood.
- **Testing as a gate:** No test baseline exists. Creating a baseline before migration and equivalence tests after are recommended to prove behavioral parity.
- **Timeline estimate:** 6–8 hours total (core refactoring 2–3h + styling 1h + test setup 2–3h + CI/CD 30m).

---

## 2. Legacy Behavior Summary

| Responsibility | Input | Output | Side effects | Errors | Evidence |
|---|---|---|---|---|---|
| **App initialization** | Page load | React component renders with UI | `localStorage.getItem('wam_high')` read; window global `__highScore` set | No error handling if `localStorage` unavailable or corrupted | `/Users/markkendall/copilot/legacy-whackamole/src/App.jsx:1–20` |
| **Game start** | Button click (no payload) | Timer starts, `running=true`, mole spawning begins | `setInterval` created (stored in module var `activeTimer`); `setTimeLeft(30)` | Guard: `if (running) return` prevents double-start | Line 38–40 |
| **Timer tick** | Interval callback every 800ms | `timeLeft` decremented by 1; UI updates | When `timeLeft ≤ 0`, `finishGame()` called; interval cleared | Silent failure if `activeTimer` reference lost | Lines 46–56 |
| **Mole spawn/despawn** | Timer tick (variable: every 1600ms initially, 800ms after tick 15) | Random hole index selected, `holes[i] = true` (rendered as emoji), then 700ms delay, `holes[i] = false` | Array mutation in place (`setHoles(holes)` with same reference); React may not detect | No feedback if holes array is corrupted | Lines 33–41 |
| **Click on mole** | Mouse click on hole element with index `i` | If `holes[i]` is true: `score` incremented by 1, React re-render | If `score > highScore`: localStorage write + window global update + high-score state update | If `holes[i]` false: silent return; no feedback | Lines 72–85 |
| **Game finish** | `timeLeft` reaches 0 | `running=false`, UI shows "Start" button, game state freezes | If `score > highScore`: localStorage persisted, alert shown, high-score state updated | No handling if localStorage write fails | Lines 63–70 |
| **Styling** | Render phase | All UI elements styled with inline style objects | No side effects; styles are applied by React/CSS engine | Invalid CSS values (e.g., NaN) silently ignored by browser | Lines 91–128 |
| **High-score persistence** | `score > highScore` condition (checked in 2 places: `finishGame` and `handleWhack`) | localStorage key `'wam_high'` set to string value | Alert shown to user; window global `__highScore` mutated; React state updated | If `localStorage.setItem` fails (quota exceeded, disabled), no error caught | Lines 69–70, 82–84 |

**Key observations:**
- **8 anti-patterns detected** (see evidence): module-level state, array mutations, no cleanup, duplicated logic, global mutation, hardcoded magic numbers, render-time I/O, missing error handling.
- **Single entry point:** `main.jsx` bootstraps React; `App.jsx` is the only component.
- **No sub-components:** All logic and rendering in one component.
- **External storage:** localStorage with key `'wam_high'`, no API calls.

---

## 3. Target Scaffold Mapping

| Legacy responsibility | Target package/location | Pattern reference | Status | Evidence |
|---|---|---|---|---|
| Timer management (setInterval, cleanup) | `useCountdown(startSeconds, onComplete)` hook | `/Users/markkendall/copilot/legacy-whackamole/target-scaffold/useCountdown.js` | **mapped** | Hook exports `{ secondsLeft, start, stop }`; owns interval ref + cleanup in `useEffect` |
| High-score read/write (localStorage) | `readHighScore()`, `writeHighScore(score)` | `/Users/markkendall/copilot/legacy-whackamole/target-scaffold/highScoreStore.js` | **mapped** | Single seam module; replaces 4 scattered `localStorage` calls + window global mutation |
| Score increment logic (business rule) | `nextScore(currentScore)` pure function | `/Users/markkendall/copilot/legacy-whackamole/target-scaffold/scoring.js` | **mapped** | Pure function: `(number) → number`; no side effects |
| High-score comparison logic (business rule) | `isNewHighScore(score, highScore)` pure function | `/Users/markkendall/copilot/legacy-whackamole/target-scaffold/scoring.js` | **mapped** | Pure function: `(number, number) → boolean`; centralizes duplicated check from lines 69, 82 |
| Game state initialization | React `useState` (standard React pattern) | React docs / scaffold conventions | **partially mapped** | Scaffold demonstrates no global state; state lifted to App component level (standard) |
| Mole spawn/despawn logic | Custom hook or `useEffect` callback (standard React pattern) | React hooks best practices | **partially mapped** | Scaffold doesn't provide this; refactoring from inline logic (lines 33–41) to declarative hook-based pattern |
| Inline styles (~50 properties) | CSS variables + CSS file | `/Users/markkendall/copilot/legacy-whackamole/src/index.css` (already has `--text`, `--bg`, `--accent` variables) | **partially mapped** | CSS variables exist; must audit ~50 inline `px` values and `color` properties to replace |
| Build/dev/lint configuration | Vite 8.2.2, Oxlint 1.79.0 | `/Users/markkendall/copilot/legacy-whackamole/package.json`, `vite.config.js`, `.oxlintrc.json` | **mapped** | All scripts and config already in place; no changes needed |
| Module-level mutable state (`activeTimer`, `tickCount`) | Remove entirely; use `useRef` + `useEffect` cleanup (React pattern) | Scaffold rejects module-level state; see `useCountdown` convention | **unmapped** | This is an anti-pattern to eliminate, not a responsibility to relocate; handled by hook-based refactoring |

**Status summary:**
- ✅ **5 direct mappings:** Timer, high-score I/O, score logic, build config  
- ⚠️ **3 partial mappings:** State management (standard React), mole logic (new hook), styling (CSS variables available)  
- ❌ **1 anti-pattern to remove:** Module-level state  

---

## 4. Gap List

| Gap | Category | Why | Pattern/reference | Risk | Evidence |
|---|---|---|---|---|---|
| **Replace `setInterval` with `useCountdown` hook** | reuse-as-is | Scaffold provides ready-to-use hook; directly solves module-level `activeTimer` leak | `useCountdown(30, onComplete)` signature | Low | `/Users/markkendall/copilot/legacy-whackamole/target-scaffold/useCountdown.js` |
| **Replace scattered `localStorage` calls with `highScoreStore` seam** | reuse-as-is | Scaffold provides single module interface; replaces 4 separate calls + window global mutation | `readHighScore()`, `writeHighScore(score)` | Low | `/Users/markkendall/copilot/legacy-whackamole/target-scaffold/highScoreStore.js` + legacy lines 13, 70, 84 |
| **Replace score increment logic with `scoring.nextScore()` pure function** | reuse-as-is | Scaffold provides pure function; eliminates duplicated business logic | `nextScore(currentScore) → number` | Low | `/Users/markkendall/copilot/legacy-whackamole/target-scaffold/scoring.js` |
| **Replace high-score comparison with `scoring.isNewHighScore()` pure function** | reuse-as-is | Scaffold provides pure function; currently duplicated at lines 69 and 82 | `isNewHighScore(score, highScore) → boolean` | Low | `/Users/markkendall/copilot/legacy-whackamole/target-scaffold/scoring.js` + legacy lines 69, 82 (duplicated) |
| **Refactor game state to use `useState` hooks** | adapt-pattern | Move `holes`, `score`, `timeLeft`, `running`, `highScore` from component state to individual `useState` calls; standard React pattern | React hooks best practices | Low | Legacy component already uses hooks; just need to eliminate module-level vars and fix mutations |
| **Eliminate module-level mutable state (`activeTimer`, `tickCount`)** | adapt-pattern | `activeTimer` causes memory leak on unmount; `tickCount` is not reset between games. Move to `useRef` + cleanup in `useEffect` | `useCountdown` demonstrates pattern | Low | Lines 4–5 of `/Users/markkendall/copilot/legacy-whackamole/src/App.jsx` |
| **Fix array mutation anti-pattern (`holes[i] = true; setHoles(holes)`)** | adapt-pattern | React requires new reference for state update detection. Use spread or slice: `setHoles([...holes.slice(0, i), true, ...holes.slice(i+1)])` | Standard React pattern | Low | Lines 35, 39 of legacy App.jsx |
| **Move `localStorage.getItem()` from render to `useEffect`** | adapt-pattern | I/O in render phase is an anti-pattern; move to `useEffect(() => { readHighScore() }, [])` | React best practices | Low | Line 13 of legacy App.jsx (currently in render body) |
| **Remove `window.__highScore` global mutation** | adapt-pattern | Anti-pattern; state should flow through React. Use only `highScore` state + `highScoreStore` seam | React best practices | Low | Line 14 of legacy App.jsx; also lines 70, 84 |
| **Extract mole spawn/despawn to utility or custom hook** | adapt-pattern | Lines 33–41 (with internal setTimeout) should be extracted. Current pattern: `popRandomMole()` is called periodically; should be extracted to reusable logic or simplified | React hooks pattern | Medium | Lines 33–41 of legacy App.jsx; lines 58–60 (spawn rate calculation) |
| **Extract difficulty ramp logic to named constant + pure function** | adapt-pattern | Hardcoded threshold (tick 15) and divisors (1, 2) are magic numbers. Extract to constants + pure function for spawn rate calculation | Scaffold convention (see `useCountdown.js` with `TICK_MS = 1000`) | Low | Lines 58–60 of legacy App.jsx (hardcoded: `tickCount % (tickCount > 15 ? 1 : 2) === 0`) |
| **Refactor inline styles to CSS file or CSS modules** | adapt-pattern | ~50 inline style properties (lines 91–128) should be replaced with CSS variables or .css file. CSS variables already exist in `index.css` | CSS variables available at `/Users/markkendall/copilot/legacy-whackamole/src/index.css` | Medium | Lines 91–128 of legacy App.jsx (~50 properties: `fontSize`, `color`, `padding`, `borderRadius`, `width`, etc.) |
| **Add error handling for `localStorage` access** | adapt-pattern | No try/catch for `localStorage.getItem()` or `setItem()`. Handle quota exceeded, disabled, or corrupted data gracefully | Scaffold `highScoreStore` should include error handling | Low | Lines 13, 69–70, 82–84 of legacy App.jsx |
| **Create test baseline + equivalence tests** | net-new | No testing framework or baseline exists. Must capture current behavior (baseline) and write tests to verify refactored app produces identical results | Runtime-validation skill; no example in scaffold | Medium | No existing tests; `npm run build` and manual testing only |
| **Set up GitHub Actions CI/CD pipeline** | net-new | No CI/CD configured. Recommend `npm run build`, `npm run lint`, and `npm run test` on push | Standard GitHub Actions workflow | Low | No `.github/workflows/` directory; operations checklist identifies as gap |

**Gap summary:**
- **reuse-as-is (4 gaps):** Direct utility extractions from scaffold
- **adapt-pattern (9 gaps):** Standard React refactoring + styling
- **net-new (2 gaps):** Testing infrastructure + CI/CD

**Total: 15 gaps** (refined from prior 14; added explicit error-handling gap).

---

## 5. Deployment / Operations Checklist

| Requirement | Existing pattern | Needed? | Evidence |
|---|---|---|---|
| **Build tool** | Vite 8.2.2 with React plugin | ✅ Present | `package.json`: `@vitejs/plugin-react` listed; `vite.config.js` configured |
| **Build command** | `npm run build` | ✅ Present | `package.json` scripts section |
| **Dev server** | Vite dev server (HMR enabled) | ✅ Present | `npm run dev` in scripts; runs on localhost:5173 by default |
| **Linting** | Oxlint 1.79.0 | ✅ Present | `.oxlintrc.json` configured; `npm run lint` in scripts |
| **Entry point** | `/Users/markkendall/copilot/legacy-whackamole/index.html` with `<div id="root"></div>` | ✅ Present | `index.html` configured; `src/main.jsx` bootstraps React |
| **Package manager** | npm (or compatible: yarn, pnpm) | ✅ Present | `package.json` + `package-lock.json` (lock file strategy assumed) |
| **Environment variables** | No `.env` or dotenv setup needed (none used in app) | ❌ Not needed | App is self-contained; no API endpoints or secrets |
| **Test runner** | No Jest, Vitest, or Playwright configured | ⚠️ Gap | No existing test infra; `npm run test` not in scripts |
| **CI/CD pipeline** | No `.github/workflows/` or CI config | ⚠️ Gap | No automated build/lint/test on push; must create |
| **Deployment target** | Static hosting (GitHub Pages, Netlify, Vercel, S3+CloudFront, etc.) | ✅ Suitable | SPA with no backend; `dist/` output compatible with static hosts |
| **Secrets management** | None required (no API keys, DB credentials, auth tokens) | ✅ N/A | Game logic is self-contained; localStorage for high score |
| **Observability** | No error logging, APM, or error boundary | ⚠️ Optional | Recommend post-migration: error boundary + optional logging |
| **Performance budgets** | No performance monitoring configured | ⚠️ Optional | Vite provides build analysis; can add Lighthouse CI post-migration |

**Operations summary:**
- ✅ **Build, dev, lint, deployment target:** Fully configured
- ⚠️ **Testing, CI/CD:** Gaps identified but not blockers (net-new infrastructure)
- ✅ **Secrets, observability:** Not needed (self-contained game)

---

## 6. Required Validation Payloads

| Scenario | Purpose | Expected behavior | Evidence/source |
|---|---|---|---|
| **Timer countdown (happy path)** | Verify 30→0 countdown at 800ms intervals | Timer starts at 30, decrements by 1 every 800ms, stops at 0, triggers `finishGame()` callback | Legacy lines 21, 46–56; Scaffold `useCountdown(30, onComplete)` |
| **Game start button guard** | Verify game doesn't start twice | First click: `running = true`, interval created. Second click: return early, no new interval | Legacy line 39 guard: `if (running) return` |
| **Mole spawn rate (ramp)** | Verify difficulty escalation | Ticks 0–14: spawn every 1600ms (tick % 2). Ticks 15+: spawn every 800ms (tick % 1, always true) | Legacy lines 58–60: `tickCount % (tickCount > 15 ? 1 : 2) === 0` |
| **Mole visibility (show/hide)** | Verify mole visible exactly 700ms | Mole set true, 700ms later set false; no state leakage between games | Legacy lines 35–40 |
| **Click on visible mole (valid hit)** | Score increments | Click hole index with `holes[i] === true` → `score += 1` | Legacy lines 72–85; Scaffold `scoring.nextScore(score)` |
| **Click on empty hole (miss)** | No score increment, silent return | Click hole index with `holes[i] === false` → return early, no state change | Legacy line 74 guard: `if (!holes[i]) return` |
| **Rapid consecutive clicks (duplicate check)** | Only one point per mole spawn | Mole visible, 2+ clicks in <700ms → score increments once | Legacy line 74 guard prevents re-entry |
| **High-score read on startup** | Correct initialization | App loads, reads `localStorage.getItem('wam_high')`, sets state to stored value or 0 | Legacy line 13 |
| **High-score write on new record** | Persistence to localStorage | Score > highScore → localStorage updated, high-score state updated, alert shown | Legacy lines 69–70, 82–84; Scaffold `highScoreStore.writeHighScore()` |
| **High-score display update** | UI reflects current high score | High-score element shows value from state | Legacy line 114 (render): `<div>High Score: {highScore}</div>` |
| **Score display update** | UI reflects current score | Score element shows value from state | Legacy line 113 (render): `<div>Score: {score}</div>` |
| **Timer display update** | UI reflects countdown | Timer element shows value from state | Legacy line 112 (render): `<div>Time Left: {timeLeft}s</div>` |
| **Button enable/disable on game state** | Button reflects `running` state | `running = false` → button text "Start"; `running = true` → button text "Stop" + disabled | Legacy line 107: `onClick={() => handleStart()}`, line 108: text conditional |
| **Grid layout (3×3)** | Correct mole grid structure | 9 holes rendered in 3×3 layout | Legacy lines 119–128: map over 9-element array in 3x3 grid |
| **Mole emoji visibility** | Correct emoji per hole state | Hole with `holes[i] === true` shows emoji; `false` shows empty slot | Legacy line 127: `{holes[i] ? '🐹' : '⬜'}` |
| **localStorage unavailable (degradation)** | Graceful failure | If `localStorage.getItem()` throws or returns undefined: app loads with `highScore = 0`, game continues playable, no crash | Implicit behavior; error handling is gap #13 |
| **localStorage quota exceeded (degradation)** | Write fails gracefully | If `localStorage.setItem('wam_high', ...)` throws: high score not persisted, but app continues; user notified (optional) | Implicit behavior; error handling is gap #13 |
| **Styling consistency (inline → CSS)** | Visual regression test | Refactored app renders pixel-for-pixel identical to legacy (colors, spacing, fonts, grid layout) | Legacy lines 91–128 (inline styles to be replaced with CSS) |
| **Responsive behavior** | Layout adapts to viewport | Grid scales appropriately on mobile/tablet/desktop (if responsive design intended) | No explicit responsive styles in legacy; clarify intent |

**Validation evidence binding:**
- Every scenario traces to legacy line ranges + scaffold utility signatures
- 20 scenarios cover: timer, scoring, mole behavior, high-score persistence, UI, degradation, styling
- Definition of **migration equivalence:** All 20 scenarios pass with refactored app

---

## 7. Open Questions and Risks

| Question / Risk | Impact | Owner/source needed | Blocking? |
|---|---|---|---|
| **Favicon.svg location** | Build artifact consistency | Where does `/favicon.svg` live? In `public/` folder or project root? Must verify for build output | No |
| **Unused assets** | Code cleanliness | Should `hero.png`, `react.svg`, `vite.svg` be deleted, or are they intentionally left for future use? | No |
| **Corrupt localStorage handling** | Error resilience | How should app behave if `localStorage.getItem('wam_high')` returns invalid data (e.g., `"abc"`)? Current: `parseInt('abc', 10)` → `NaN` → silent failure. Recommendation: validate and fallback to 0. | No (gap #13 captures this) |
| **Styling strategy for refactored app** | Implementation decisions | Should refactored app use CSS file, CSS modules, or continue with inline styles? Scaffold shows CSS variables available in `index.css`. Recommend audit + migration to CSS file (gap #11). | No |
| **Difficulty configuration exposure** | Future customization | Should the hardcoded ramp (tick 15 threshold, 1/2 divisors) be configurable as settings, or locked into game rules? Not needed for equivalence, but affects future maintainability. | No (captured in gap #10) |
| **Post-migration observability** | Operational readiness | No error logging, monitoring, or error boundaries currently. Recommend adding error boundary + optional console/analytics post-migration. | No (medium-priority ops gap, not blocker) |
| **Test tooling choice** | Quality gate implementation | Which testing framework for gap #14? Options: Vitest (modern, fast), Jest (familiar), Playwright (e2e). Recommend Vitest for unit + integration. | No (out of scope for discovery) |

**Risk summary:**
- **Blocking risks:** None identified
- **Medium risks:** Styling audit scope (gap #11), error handling completeness (gap #13)
- **Low risks:** Asset cleanup, storage degradation, configuration

---

## 8. Definition-of-Done Check

Evidence verification for discovery completeness:

- [x] **Every known legacy responsibility is mapped or flagged**  
  ✅ 8 responsibilities in Table 2 (legacy behavior summary); all mapped or flagged as anti-pattern to remove (module-level state)  
  Evidence: Legacy behavior table (Section 2) + target scaffold mapping table (Section 3)

- [x] **Every gap is classified as reuse-as-is, adapt-pattern, or net-new**  
  ✅ 15 gaps in gap list (Section 4); 4 reuse-as-is, 9 adapt-pattern, 2 net-new  
  Evidence: Gap list table (Section 4, column "Category")

- [x] **Evidence accompanies material conclusions**  
  ✅ All major claims include file paths (absolute paths with `/Users/markkendall/copilot/legacy-whackamole/...`), line ranges, or function signatures  
  Evidence: Every gap links to legacy source lines + scaffold module paths; every behavioral claim references evidence column

- [x] **Deployment/ops requirements are inventoried**  
  ✅ 12 requirements listed; current state and gaps identified  
  Evidence: Deployment checklist (Section 5)

- [x] **Validation scenarios are identified**  
  ✅ 20 behavioral test scenarios defined with payloads and expected behavior  
  Evidence: Validation payloads table (Section 6)

- [x] **No product or deployment code was modified**  
  ✅ This discovery is read-only; no files were edited  
  Evidence: No git diff, no new product code created; only analysis artifacts (this report)

---

## 9. Recommendation

### 🟢 **READY FOR IMPLEMENTATION INTENT**

**Rationale:**
1. ✅ **All legacy responsibilities mapped:** 8 responsibilities → 4 direct scaffold reuse + 9 standard refactorings + 2 infrastructure gaps
2. ✅ **Gaps are well-understood:** No novel problems; all gaps follow established React patterns or use scaffold utilities
3. ✅ **Risk profile is low:** No external dependencies, no API contracts, no version conflicts. Refactoring is straightforward.
4. ✅ **Clear implementation path:** Core refactoring (2–3h) → styling (1h) → testing (2–3h) → CI/CD (30m) phases are well-scoped.
5. ✅ **Definition of done is verified:** Every claim has evidence; no product code was modified.

**Suggested implementation phasing:**
- **Phase A (2–3 hours):** Core refactoring — App.jsx using `useState`, `useCountdown`, `highScoreStore`, `scoring.js`; eliminate module-level state and array mutations
- **Phase B (1 hour):** Styling refactoring — audit ~50 inline styles, replace with CSS variables or CSS file
- **Phase C (2–3 hours):** Quality gates — create test baseline, write equivalence tests (20 scenarios from Section 6)
- **Phase D (30 minutes):** GitHub Actions — add CI/CD workflow (build, lint, test)

**Go/no-go criteria for approval:**
- Implementation will maintain 100% behavioral equivalence with legacy app (verified by test suite)
- All 15 gaps will be addressed in implementation phases A–D
- Code will pass `npm run lint` and new test suite before merge

---

## 10. Approval

| Field | Value |
|---|---|
| **Reviewer** | Mark |
| **Date** | Awaiting approval |
| **Decision** | Pending review |
| **Notes** | Discovery is complete and ready for implementation intent generation upon approval. No unresolved blockers. Recommendation: proceed with implementation phasing A–D as outlined above. |

---

## Appendix: Evidence Manifest

### Legacy Source Files (Absolute Paths)
- `/Users/markkendall/copilot/legacy-whackamole/src/main.jsx` — React bootstrap
- `/Users/markkendall/copilot/legacy-whackamole/src/App.jsx` — Monolithic game component (~130 lines)
- `/Users/markkendall/copilot/legacy-whackamole/src/App.css` — Empty
- `/Users/markkendall/copilot/legacy-whackamole/src/index.css` — Global styles + CSS variables
- `/Users/markkendall/copilot/legacy-whackamole/index.html` — Entry point
- `/Users/markkendall/copilot/legacy-whackamole/package.json` — Dependencies + scripts
- `/Users/markkendall/copilot/legacy-whackamole/vite.config.js` — Vite configuration

### Target Scaffold Files (Absolute Paths)
- `/Users/markkendall/copilot/legacy-whackamole/target-scaffold/useCountdown.js` — Timer hook
- `/Users/markkendall/copilot/legacy-whackamole/target-scaffold/highScoreStore.js` — localStorage seam
- `/Users/markkendall/copilot/legacy-whackamole/target-scaffold/scoring.js` — Pure business logic
- `/Users/markkendall/copilot/legacy-whackamole/target-scaffold/` — Sibling examples (none yet)

### Configuration & Build Files
- `/Users/markkendall/copilot/legacy-whackamole/.oxlintrc.json` — Linting rules
- `/Users/markkendall/copilot/legacy-whackamole/package-lock.json` — Dependency lock (assumed)

### Specialist Reports Used
- **legacy-explorer:** Traced component structure, state, anti-patterns, side effects
- **scaffold-explorer:** Analyzed available utilities, conventions, deployment patterns
- **gap-analysis:** Classified 15 gaps into three categories
- **validation-analyzer:** Specified 20 behavioral test scenarios
- **ops-analyzer:** Inventoried build, deploy, CI/CD requirements

---

**Report generated:** 2026-09-03  
**Version:** 2 (absolute paths)  
**Status:** ✅ Ready for implementation intent