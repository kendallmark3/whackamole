# Feature Automation

These files contain reusable engineering workflows discovered while working on this repo.

## capture-pattern.md

Use after meaningful Copilot work to determine whether a reusable pattern should be saved. Run this after finishing a task to decide whether it should become a new file here.

## validate-persisted-value.md

Use when reading a primitive value (number, boolean, enum-like string) out of untyped external storage (`localStorage`, `sessionStorage`, cookies, URL params). Captured from fixing corrupt high-score handling in `src/highScoreStore.ts` — worth re-checking against any other place this repo reads persisted state the same loose way.
