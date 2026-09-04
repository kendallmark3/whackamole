# Whack-a-Mole

A small React + Vite whack-a-mole game. Pick a difficulty, hit **Start Game**, and click moles as they pop up across a 3×3 grid before the 30-second timer runs out. Your best score is saved locally and beaten scores show a high-score banner.

## Getting started

```bash
npm install
npm run dev       # start the dev server (http://localhost:5173)
```

## Scripts

- `npm run dev` — start the Vite dev server with HMR
- `npm run build` — type-check (`tsc -b`) then production build to `dist/`
- `npm run preview` — preview the production build locally
- `npm run lint` — run Oxlint
- `npm run type-check` — type-check only, no build output
- `npm test` — run the Vitest test suite

## Project layout

TypeScript throughout — no `.js`/`.jsx` source files.

- `src/App.tsx` — top-level game state (score, timer, difficulty, high score) and composition of the components below
- `src/components/` — presentational components extracted from `App.tsx`: `GameHeader`, `StatBar`, `DifficultyPicker`, `MoleGrid` (+ `MoleHole`), `ResultBanner`, `HowToPlayModal`
- `src/hooks/` — `useCountdown` (the 30-second timer), `useMoleSpawner` (spawn/despawn scheduling + difficulty presets), `useSoundEffects` (synthesized Web Audio API whack sound — no audio asset files)
- `src/highScoreStore.ts` — the single seam for reading/writing the high score to `localStorage`
- `src/scoring.ts` — pure scoring rules (`nextScore`, `isNewHighScore`)
- `target-scaffold/` — reference-only convention examples the app's hooks/modules originally followed (not imported by the app; kept as `.js` historical reference, intentionally excluded from the TypeScript migration)
- `src/intents/analysis.md` — the original discovery report that guided the refactor from a monolithic legacy component to this structure
- `src/intents/progresiveintent.md` — a runner-neutral "improve this repository" intent used to drive follow-up repository-improvement passes
- `src/intents/intent3.md` — the intent that drove the TypeScript migration, component decomposition, and sound feature described above

See [CLAUDE.md](CLAUDE.md) for more on the repository's history and conventions.
