# ADR-001: Use Next.js App Router

**Date:** 2026-02-28
**Status:** Accepted
**Deciders:** Engineering team

---

## Context

We need a React framework for the Athlete OS web application. The framework must support server-side rendering for SEO on public profile pages, a clean API route system, and a path to progressive enhancement as AI features are added.

## Decision

Use **Next.js 15** with the **App Router** (introduced in Next.js 13, stable in 14+).

## Rationale

- **React Server Components** reduce client bundle size — athlete profiles are content-heavy and benefit from server rendering
- **Nested layouts** enable the three-dashboard structure (athlete, parent, brand) with shared nav without re-fetching
- **API Routes** co-located with frontend eliminate a separate backend deployment for MVP
- **Edge Middleware** enables auth protection without a full server round-trip
- **Vercel integration** is best-in-class for Next.js; zero-config deployment
- **`src/` directory** with path aliases (`@/*`) keeps imports clean

## Alternatives Considered

| Option | Rejected Because |
|---|---|
| Pages Router | Older pattern; RSC not available; less clean nested layout support |
| Remix | Smaller ecosystem; less Vercel integration; team less familiar |
| Vite + React SPA | No SSR out-of-box; need separate API server; worse SEO for public profiles |
| T3 Stack | tRPC adds complexity for our REST-compatible API design |

## Consequences

- **Positive:** Full-stack in one repo; excellent DX; strong RSC performance
- **Negative:** App Router has a steeper learning curve than Pages Router; some libraries lag in RSC compatibility
- **Note:** Do not use `--turbopack` in development — middleware does not execute correctly with Turbopack in Next.js 15 (documented in README)
