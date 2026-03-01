# ADR-003: Use Drizzle ORM over Prisma

**Date:** 2026-02-28
**Status:** Accepted
**Deciders:** Engineering team

---

## Context

We need an ORM or query builder for type-safe database access from Next.js API routes. The choice affects developer experience, bundle size, and performance at the Edge.

## Decision

Use **Drizzle ORM** with `@neondatabase/serverless` as the database driver.

## Rationale

- **Schema-as-code**: Drizzle schema defined in TypeScript is the single source of truth — types are inferred directly (no separate `prisma generate` step)
- **Lightweight bundle**: Drizzle has no heavy query engine; runs natively in Edge runtimes and Vercel Serverless Functions
- **SQL-like API**: Drizzle's query syntax closely mirrors SQL, making complex queries more predictable
- **Zero connection pooling overhead**: Works directly with Neon's HTTP transport
- **`db:push`** for rapid schema iteration in development without migration files

## Alternatives Considered

| Option | Rejected Because |
|---|---|
| Prisma | Binary query engine incompatible with Edge runtime; large bundle; `prisma generate` adds build step |
| Kysely | Less ergonomic for schema definition; no built-in migration tooling |
| Raw SQL | No type safety; verbose |
| Supabase client | Tied to Supabase; MVP uses Neon |

## Consequences

- **Positive:** Excellent Edge compatibility; fast type inference; clean migration story
- **Negative:** Drizzle Studio UI is less polished than Prisma Studio; smaller community than Prisma
- **Note:** When migrating to Supabase in Phase 2, Drizzle can target Supabase Postgres with the same schema — no ORM change required
