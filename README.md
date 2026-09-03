# Whack-a-Mole

A small React + Vite whack-a-mole game. Pick a difficulty, hit **Start Game**, and click moles as they pop up across a 3×3 grid before the 30-second timer runs out. Your best score is saved locally and beaten scores show a high-score banner.

## Getting started

```bash
npm install
npm run dev       # start the dev server (http://localhost:5173)
```

## Scripts

- `npm run dev` — start the Vite dev server with HMR
- `npm run build` — production build to `dist/`
- `npm run preview` — preview the production build locally
- `npm run lint` — run Oxlint
- `npm test` — run the Vitest test suite

## Project layout

- `src/App.jsx` — the game UI and top-level state (score, timer, difficulty, high score)
- `src/useCountdown.js` — the 30-second countdown timer, as a hook
- `src/useMoleSpawner.js` — mole spawn/despawn scheduling and difficulty presets
- `src/highScoreStore.js` — the single seam for reading/writing the high score to `localStorage`
- `src/scoring.js` — pure scoring rules (`nextScore`, `isNewHighScore`)
- `target-scaffold/` — reference-only convention examples the app's hooks/modules follow (not imported by the app)
- `src/intents/analysis.md` — the original discovery report that guided the refactor from a monolithic legacy component to this structure
- `src/intents/progresiveintent.md` — a runner-neutral "improve this repository" intent used to drive follow-up repository-improvement passes

See [CLAUDE.md](CLAUDE.md) for more on the repository's history and conventions.
