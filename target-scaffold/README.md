# Target Scaffold Conventions (reference only, not wired into the running app)

These files are *not* imported by `src/App.jsx`. They exist purely as governed-pattern
evidence for discovery — the conventions a rewrite of `legacy-whackamole` should follow.

Conventions demonstrated here:

- **Stateful logic lives in a custom hook** (`useCountdown.js`), not inline in the component.
- **Timers use `useRef` + `useEffect` cleanup**, never a module-level `var`.
- **Business rules are pure functions** (`scoring.js`), independently testable, no DOM/React
  or storage access inside them.
- **No global mutation** — nothing touches `window`; persistence is isolated behind a small
  read/write module (`highScoreStore.js`) instead of being inlined at multiple call sites.
- **Magic numbers are named constants**, not inline literals scattered across handlers.
