# Agent Instructions

Before modifying code:

1. Read [CLAUDE.md](CLAUDE.md) — architecture, testing conventions, the known-fragile pattern to avoid repeating, and what "preserving behavior" means for this game.
2. Check `src/intents/` for background on why the current structure exists (`analysis.md`, `intent3.md`) before assuming something is accidental.
3. Check [automation/README.md](automation/README.md) for existing reusable workflows relevant to the task.
4. Make the smallest change necessary to satisfy the task.
5. Run the relevant checks: `npm test`, `npm run type-check`, `npm run lint`.

When a piece of work reveals a reusable engineering pattern (a bug class, a validation technique, a testing approach likely to recur), run `automation/capture-pattern.md` against it and save the result under `automation/` if it qualifies.

Do not introduce unrelated improvements.
