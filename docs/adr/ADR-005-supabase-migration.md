# ADR-005: Migrate to Supabase for Phase 2

**Date:** 2026-02-28
**Status:** Proposed
**Deciders:** Engineering team
**Supersedes:** ADR-002 (Neon Auth + Database)

---

## Context

Phase 2 introduces multi-role access control (athletes, parents, brands, coaches), file storage (contract PDFs, highlight reels), and real-time features (deal status updates). These requirements exceed what Neon Auth/DB alone can cleanly provide.

## Decision

Migrate from Neon (Auth + Postgres) to **Supabase** (Auth + Postgres + Storage + Realtime) at the start of Phase 2.

## Rationale

### Row-Level Security (RLS)
The three-sided marketplace requires that:
- Athletes see only their own data
- Parents see only their linked athletes' data
- Brands see only their own campaigns and matched athlete summaries
- Coaches see aggregated, non-PII athlete data

Supabase RLS policies enforce this at the database level — eliminating a class of application-level authorization bugs. Neon does not support RLS policies out-of-the-box.

### Storage
Contract Guard requires PDF/DOCX upload and storage. Highlight Architect (Phase 4) requires video file storage. Supabase Storage provides:
- Bucket-level access policies (private by default, public for highlight reels)
- CDN delivery
- No separate S3 setup

### Auth Compatibility
Supabase Auth supports email/password, Google OAuth, and magic links — matching the current Neon Auth capabilities. Migration path:
1. Export users from Neon Auth
2. Import to Supabase Auth (password hashes are bcrypt-compatible)
3. Update `@supabase/ssr` client throughout the app

### Schema Compatibility
Drizzle ORM (ADR-003) targets standard Postgres — no query changes required. Schema migration via `drizzle-kit migrate`.

## Migration Plan

1. Create Supabase project; configure Auth providers (email, Google)
2. Export Neon schema + data; import to Supabase
3. Write RLS policies for all tables
4. Replace `@neondatabase/auth` with `@supabase/ssr`
5. Replace `@neondatabase/serverless` Drizzle driver with `postgres` (Supabase connection string)
6. Update environment variables
7. Test auth flows end-to-end in staging

## Alternatives Considered

| Option | Rejected Because |
|---|---|
| Stay on Neon + build RLS manually | Would require application-level RLS in every query — error-prone at scale |
| PlanetScale | MySQL; incompatible with Postgres-specific features |
| Firebase | Not relational; poor fit for structured athlete data |
| AWS RDS + Cognito | Too much infrastructure management for current team size |

## Consequences

- **Positive:** RLS-first security model; unified storage; battle-tested Auth
- **Negative:** One-time migration effort; Supabase has minimum $25/month pricing beyond free tier
- **Risk:** User migration — passwords can be migrated but social OAuth tokens cannot; users will need to re-authorize Google OAuth
