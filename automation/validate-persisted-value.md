# Validate a Persisted Primitive Value

## Purpose

Prevent corrupted or unexpected data read from untyped external storage (`localStorage`, `sessionStorage`, cookies, URL params, or similar) from silently becoming a bad in-memory value.

## When to Use

Use when a module reads a primitive (number, boolean, enum-like string) from storage the application does not fully control — anywhere the stored value could have been edited by hand, written by an older app version, or corrupted, and a loose parse (`parseInt`, `Number()`, truthy checks) would let a partially-valid or out-of-range value leak through instead of failing closed.

Signs a read needs this: the parse function used (`parseInt`, `Number()`) accepts partial or malformed input (e.g. `parseInt("5abc")` → `5`, `parseInt("-5")` → `-5`) without the caller checking that the *entire* raw string is well-formed, or without bounding the parsed result to the values the domain actually allows.

## Inputs

- The storage key being read.
- The raw string value returned by the storage API (may be `null`/absent).
- A strict format constraint the value must satisfy (e.g. "non-negative integer," "one of these enum values").
- A safe default to fall back to when validation fails.

## Procedure

1. Read the raw value inside a `try`/`catch` — the storage API itself can throw (disabled, quota, unavailable).
2. If the raw value is `null`/absent, return the safe default immediately.
3. Validate the *entire* raw string against a strict format check (e.g. a regex anchored with `^...$`) before parsing — do not rely on the parse function alone to reject malformed input, since functions like `parseInt` parse a leading prefix and ignore trailing garbage.
4. Parse only after the format check passes.
5. Apply any additional domain bound the parse function itself won't enforce (e.g. `Number.isSafeInteger` to reject values that parsed but overflowed, or a range/enum check).
6. Return the safe default for every path that fails steps 2–5, and on any thrown error.

## Outputs

A value that is guaranteed to satisfy the domain's format and range constraints, or the safe default — never a partially-parsed or out-of-range value.

## Validation

Add test cases (not just the happy path) for: value absent, well-formed valid value, completely non-conforming value, a value with valid-looking trailing/leading garbage that a loose parse would accept, an out-of-range value that passes the format check but fails the domain bound, and the storage API throwing on read.

## Stop Condition

Stop once the read path can only produce a value that satisfies the documented format/range constraint or the safe default, and every case in Validation has a passing test.

## Origin

Captured while fixing `readHighScore()` in `src/highScoreStore.ts` of this repo — it originally used `parseInt` + `Number.isFinite`, which let `"5abc"` and `"-5"` through as valid scores instead of falling back to `0`.
