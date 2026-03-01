# ADR-002: Use Neon for Auth + Database (MVP)

**Date:** 2026-02-28
**Status:** Accepted (MVP) | Superseded by ADR-005 for Phase 2
**Deciders:** Engineering team

---

## Context

We need an authentication provider and a database for the Athlete OS MVP. Speed of setup and developer experience are the primary concerns at this stage.

## Decision

Use **Neon** for both Postgres database (`@neondatabase/serverless`) and authentication (`@neondatabase/auth`).

## Rationale

- **Single provider** for auth + DB reduces configuration surface area in MVP
- **Serverless Postgres** scales to zero — no idle compute costs during development
- **Neon Auth** provides email/password + Google OAuth with minimal configuration
- **Branch-based DB** enables isolated preview environments matching Vercel preview deployments
- **`@neondatabase/serverless`** uses HTTP/WebSocket transport, compatible with Vercel Edge Functions

## Alternatives Considered

| Option | Rejected Because |
|---|---|
| Supabase | More setup; heavier client SDK; overkill for MVP auth needs |
| Auth.js (NextAuth) | Requires separate session DB; more configuration |
| Clerk | Paid beyond free tier; external dependency for core auth |
| PlanetScale | No longer offers free tier; MySQL vs Postgres preference |

## Consequences

- **Positive:** Fast MVP setup; serverless-native; branch-per-environment
- **Negative:** Neon Auth is less battle-tested than Supabase Auth; no built-in RLS policies
- **Phase 2 migration:** As the platform adds multi-tenant features (athletes, parents, brands, coaches with distinct data visibility), Supabase's Row-Level Security becomes necessary. See ADR-005.
