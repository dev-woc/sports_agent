# ADR-004: Use Biome over ESLint + Prettier

**Date:** 2026-02-28
**Status:** Accepted
**Deciders:** Engineering team

---

## Context

We need a linter and formatter for consistent code quality. The standard choice is ESLint + Prettier, but newer alternatives exist.

## Decision

Use **Biome** as the single tool for both linting and formatting.

## Rationale

- **10–20x faster** than ESLint + Prettier (Rust-based)
- **Single config file** (`biome.json`) replaces `.eslintrc` + `.prettierrc`
- **No plugin conflicts** — ESLint + Prettier frequently conflict on formatting rules requiring `eslint-config-prettier` workarounds
- **Built-in TypeScript support** — no `@typescript-eslint` plugin required
- **CI-friendly** — fast enough to run on every save without noticeable delay

## Alternatives Considered

| Option | Rejected Because |
|---|---|
| ESLint + Prettier | Slow; config complexity; plugin conflicts |
| ESLint only | No formatting; inconsistent code style |
| oxlint | Less mature; no formatting |

## Consequences

- **Positive:** Dramatically faster CI and local lint; simpler config
- **Negative:** Biome has fewer rules than ESLint's ecosystem (missing some niche rules); import sorting behavior differs slightly from Prettier
- **Note:** `biome check --write` fixes both lint and format in one pass
