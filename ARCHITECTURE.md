# Architecture Documentation — Athlete OS (LinkBio MVP)

**Version:** 1.0 | **Date:** February 28, 2026 | **Status:** Living Document

> This document covers the current LinkBio MVP architecture and the planned evolution toward the full Athlete OS platform. See [PRD.md](./PRD.md) for product requirements.

---

## Table of Contents

1. [System Context (C4 Level 1)](#1-system-context-c4-level-1)
2. [Container Architecture (C4 Level 2)](#2-container-architecture-c4-level-2)
3. [Component Architecture (C4 Level 3)](#3-component-architecture-c4-level-3)
4. [Data Architecture](#4-data-architecture)
5. [Authentication & Authorization](#5-authentication--authorization)
6. [API Design](#6-api-design)
7. [Security Architecture](#7-security-architecture)
8. [Frontend Architecture](#8-frontend-architecture)
9. [Infrastructure & Deployment](#9-infrastructure--deployment)
10. [Quality Attributes](#10-quality-attributes)
11. [Architecture Decision Records](#11-architecture-decision-records)
12. [Roadmap: LinkBio → Athlete OS](#12-roadmap-linkbio--athlete-os)

---

## 1. System Context (C4 Level 1)

### Current State: LinkBio MVP

```
┌──────────────────────────────────────────────────────────────────────────┐
│                          SYSTEM CONTEXT                                  │
│                                                                          │
│   ┌─────────┐         ┌──────────────────────┐         ┌─────────────┐  │
│   │ Athlete │ ──────► │                      │ ──────► │  Neon Auth  │  │
│   │ /Parent │         │     LinkBio App      │         │  (Identity) │  │
│   │  /Coach │ ◄────── │  (Athlete Profile &  │ ──────► │  Neon DB    │  │
│   └─────────┘         │   Link Management)   │         │  (Postgres) │  │
│                        │                      │         └─────────────┘  │
│   ┌─────────┐         │  [Vercel / Next.js]  │                           │
│   │ Profile │ ◄────── │                      │ ──────► ┌─────────────┐  │
│   │ Visitor │         └──────────────────────┘         │  Railway    │  │
│   └─────────┘                                          │  (MCP/BFF)  │  │
│                                                         └─────────────┘  │
└──────────────────────────────────────────────────────────────────────────┘
```

### Future State: Athlete OS (Phase 2+)

```
┌──────────────────────────────────────────────────────────────────────────────┐
│                        ATHLETE OS — SYSTEM CONTEXT                           │
│                                                                              │
│  ┌──────────┐   ┌──────────┐   ┌──────────┐   ┌──────────┐                  │
│  │ Athlete  │   │  Parent  │   │  Brand/  │   │  Coach/  │                  │
│  │  User    │   │  User    │   │ Sponsor  │   │  School  │                  │
│  └────┬─────┘   └────┬─────┘   └────┬─────┘   └────┬─────┘                  │
│       └──────────────┴──────────────┴──────────────┘                        │
│                              │                                               │
│                    ┌─────────▼──────────┐                                   │
│                    │   Athlete OS App    │                                   │
│                    │  (Three-Sided       │                                   │
│                    │   Marketplace)      │                                   │
│                    └────────┬───────────┘                                   │
│            ┌────────────────┼────────────────────┐                          │
│            ▼                ▼                    ▼                           │
│    ┌──────────────┐  ┌─────────────┐   ┌──────────────────┐                 │
│    │ Anthropic    │  │  Supabase   │   │   NIL Go         │                 │
│    │ Claude API   │  │  (DB+Auth)  │   │   Clearinghouse  │                 │
│    │ (AI Modules) │  │             │   │   (Compliance)   │                 │
│    └──────────────┘  └─────────────┘   └──────────────────┘                 │
│            ┌────────────────┬────────────────────┐                          │
│            ▼                ▼                    ▼                           │
│    ┌──────────────┐  ┌─────────────┐   ┌──────────────────┐                 │
│    │   Stripe     │  │   Railway   │   │   Vercel         │                 │
│    │  (Billing)   │  │  (Backend)  │   │  (Hosting)       │                 │
│    └──────────────┘  └─────────────┘   └──────────────────┘                 │
└──────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Container Architecture (C4 Level 2)

### Current MVP

```
┌─────────────────────────────────────────────────────────────────────┐
│                    LINKBIO — CONTAINER DIAGRAM                       │
│                                                                      │
│  Browser                                                             │
│  ┌───────────────────────────────────────────────────────────┐      │
│  │              Next.js Application (Vercel)                 │      │
│  │                                                           │      │
│  │  ┌─────────────────┐    ┌──────────────────────────────┐  │      │
│  │  │  React Frontend  │    │   Next.js API Routes         │  │      │
│  │  │  (App Router,    │◄──►│   (Node.js / Edge runtime)  │  │      │
│  │  │   RSC + Client)  │    │                              │  │      │
│  │  │                  │    │   /api/auth/[...path]        │  │      │
│  │  │  Pages:          │    │   /api/profile               │  │      │
│  │  │  • / (home)      │    │   /api/links                 │  │      │
│  │  │  • /login        │    │   /api/links/[id]            │  │      │
│  │  │  • /signup       │    │   /api/links/reorder         │  │      │
│  │  │  • /editor       │    │   /api/slug/check            │  │      │
│  │  │  • /[slug]       │    │                              │  │      │
│  │  └─────────────────┘    └──────────────┬───────────────┘  │      │
│  └───────────────────────────────────────┼───────────────────┘      │
│                                           │                          │
│              ┌────────────────────────────┼────────────────┐        │
│              │                            │                │        │
│              ▼                            ▼                ▼        │
│  ┌─────────────────┐         ┌───────────────────┐  ┌──────────┐   │
│  │   Neon Auth     │         │   Neon Postgres    │  │ Railway  │   │
│  │   (Identity     │         │   (Serverless DB)  │  │  (MCP)   │   │
│  │    Provider)    │         │                    │  │          │   │
│  │                 │         │  Tables:           │  │          │   │
│  │  • Email/Pass   │         │  • profiles        │  │          │   │
│  │  • Google OAuth │         │  • link_items      │  │          │   │
│  │  • Session mgmt │         │  • click_events    │  │          │   │
│  └─────────────────┘         └───────────────────┘  └──────────┘   │
└─────────────────────────────────────────────────────────────────────┘
```

### Planned Athlete OS Architecture

```
┌───────────────────────────────────────────────────────────────────────────┐
│                      ATHLETE OS — CONTAINER DIAGRAM                        │
│                                                                            │
│  ┌─────────────────────────────────────────────────────────────────────┐  │
│  │                  Next.js Application (Vercel)                        │  │
│  │                                                                      │  │
│  │  ┌─────────────┐  ┌─────────────┐  ┌────────────┐  ┌────────────┐  │  │
│  │  │  Athlete    │  │  Parent     │  │  Brand     │  │  Coach     │  │  │
│  │  │  Dashboard  │  │  Dashboard  │  │  Portal    │  │  Dashboard │  │  │
│  │  └──────┬──────┘  └──────┬──────┘  └─────┬──────┘  └─────┬──────┘  │  │
│  │         └────────────────┴────────────────┴──────────────┘          │  │
│  │                                    │                                  │  │
│  │  ┌─────────────────────────────────▼──────────────────────────────┐  │  │
│  │  │                      API Layer                                  │  │  │
│  │  │  /api/ai/contract-review  /api/ai/nil-match                    │  │  │
│  │  │  /api/deals               /api/clearinghouse                   │  │  │
│  │  │  /api/profile             /api/webhooks/stripe                 │  │  │
│  │  └─────────────────────────────────┬──────────────────────────────┘  │  │
│  └───────────────────────────────────┼─────────────────────────────────┘  │
│                                       │                                     │
│         ┌─────────────────────────────┼─────────────────────────────┐      │
│         ▼               ▼             ▼               ▼             ▼      │
│  ┌────────────┐  ┌────────────┐  ┌────────┐  ┌───────────┐  ┌──────────┐  │
│  │ Supabase   │  │ Anthropic  │  │ Stripe │  │  NIL Go   │  │ Railway  │  │
│  │ (DB+Auth+  │  │ Claude API │  │ (Pay)  │  │ (Comply)  │  │ (BFF +   │  │
│  │  Storage)  │  │ claude-    │  │        │  │           │  │  Jobs)   │  │
│  │            │  │ sonnet-4-6 │  │        │  │           │  │          │  │
│  └────────────┘  └────────────┘  └────────┘  └───────────┘  └──────────┘  │
└───────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Component Architecture (C4 Level 3)

### Frontend Component Tree

```
app/
├── layout.tsx                     # Root layout (font, metadata)
│
├── (auth)/                        # Public auth group
│   ├── layout.tsx                 # Centered card container
│   ├── login/page.tsx             # → LoginForm component
│   └── signup/page.tsx            # → SignupForm component
│
├── (dashboard)/                   # Auth-protected group
│   ├── layout.tsx                 # Nav + session display
│   └── editor/page.tsx            # ┐
│       ├── useProfile() hook      # │ Core editor logic
│       ├── ProfileForm            # │ (mutation tracking,
│       ├── LinkList               # │  save orchestration,
│       │   └── LinkItem           # │  responsive layout)
│       ├── AddLinkButton          # │
│       ├── EditorToolbar          # │
│       └── PreviewPanel           # ┘
│           └── MinimalTheme
│
└── api/                           # API route handlers
    ├── auth/[...path]/route.ts    # Neon Auth handler
    ├── profile/route.ts           # GET, POST, PUT
    ├── links/
    │   ├── route.ts               # POST (create)
    │   ├── [id]/route.ts          # DELETE
    │   └── reorder/route.ts       # PUT (batch reorder)
    └── slug/check/route.ts        # GET (availability)
```

### Component Responsibility Matrix

| Component | Responsibility | State | Data Source |
|---|---|---|---|
| `editor/page.tsx` | Orchestrate editor; save batching | Local React state + refs | `useProfile()` |
| `ProfileForm` | Controlled inputs for name/bio/avatar | Lifted to editor | Props |
| `LinkList` | dnd-kit DnD container; render sorted links | Lifted to editor | Props |
| `LinkItem` | Single link card with delete | None | Props |
| `AddLinkButton` | Dialog UI for 3 link types | Dialog open state | Props (callbacks) |
| `PreviewPanel` | iPhone mockup shell | None | Props |
| `MinimalTheme` | Stateless render of profile+links | None | Props |
| `SlugInput` | Debounced slug availability check | Local (loading, status) | `/api/slug/check` |
| `useProfile` | Fetch profile; handle 401 redirect | Loading, error | `/api/profile` |

### Data Flow: Save Operation

```
User clicks "Save"
       │
       ▼
editor/page.tsx (handleSave)
       │
       ├─► PUT /api/profile        ← update displayName, bio, avatarUrl
       │
       ├─► DELETE /api/links/[id]  ← for each id in deletedIdsRef
       │
       ├─► POST /api/links         ← for each item in addedLinksRef
       │       └─► maps tempId → serverId in sortOrder array
       │
       ├─► PUT /api/links/reorder  ← final ordering with real server IDs
       │
       └─► refetch()               ← sync state with server
```

---

## 4. Data Architecture

### Entity-Relationship Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                     DATABASE SCHEMA                                  │
│                                                                      │
│  ┌──────────────────────────────────────┐                           │
│  │ profiles                             │                           │
│  ├──────────────────────────────────────┤                           │
│  │ id           UUID (PK)               │                           │
│  │ userId       TEXT (UNIQUE, NOT NULL)  │ ◄── Neon Auth user.id   │
│  │ slug         TEXT (UNIQUE, NOT NULL)  │ ◄── Public URL handle   │
│  │ displayName  TEXT                    │                           │
│  │ bio          TEXT                    │                           │
│  │ avatarUrl    TEXT (default: "")      │                           │
│  │ theme        TEXT (default: minimal) │                           │
│  │ createdAt    TIMESTAMPTZ             │                           │
│  │ updatedAt    TIMESTAMPTZ             │                           │
│  └────────────────┬─────────────────────┘                           │
│                   │ 1                                                │
│                   │                                                  │
│                   │ ∞                                                │
│  ┌────────────────▼─────────────────────┐                           │
│  │ link_items                           │                           │
│  ├──────────────────────────────────────┤                           │
│  │ id           UUID (PK)               │                           │
│  │ profileId    UUID (FK → profiles)    │ CASCADE DELETE            │
│  │ type         TEXT ("link"|"header"   │                           │
│  │              |"divider")             │                           │
│  │ title        TEXT                    │                           │
│  │ url          TEXT                    │                           │
│  │ sortOrder    INTEGER                 │                           │
│  │ createdAt    TIMESTAMPTZ             │                           │
│  │ updatedAt    TIMESTAMPTZ             │                           │
│  └────────────────┬─────────────────────┘                           │
│                   │ 1                                                │
│                   │                                                  │
│                   │ ∞                                                │
│  ┌────────────────▼─────────────────────┐                           │
│  │ click_events   [Phase 4 — unused MVP]│                           │
│  ├──────────────────────────────────────┤                           │
│  │ id           UUID (PK)               │                           │
│  │ linkItemId   UUID (FK → link_items)  │ CASCADE DELETE            │
│  │ clickedAt    TIMESTAMPTZ             │                           │
│  └──────────────────────────────────────┘                           │
└─────────────────────────────────────────────────────────────────────┘
```

### Index Strategy

| Table | Index | Type | Reason |
|---|---|---|---|
| `profiles` | `userId` | B-tree | Auth lookup (every API call) |
| `profiles` | `slug` | Unique B-tree | Public page lookup + slug check |
| `link_items` | `profileId` | B-tree | Fetch all links for a profile |
| `click_events` | `linkItemId` | B-tree | Analytics aggregation per link |
| `click_events` | `clickedAt` | B-tree | Time-range analytics queries |

### Data Validation Layers

```
Request
  │
  ▼
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│  Client-side │     │  Zod Schema  │     │  Drizzle ORM │
│  (HTML5 +    │────►│  Validation  │────►│  (DB-level   │
│   React)     │     │  (API layer) │     │   types)     │
└──────────────┘     └──────────────┘     └──────────────┘
                             │
                             ▼
                     ┌──────────────┐
                     │  Postgres    │
                     │  Constraints │
                     │  (UNIQUE,    │
                     │   NOT NULL)  │
                     └──────────────┘
```

### Planned Schema Additions (Athlete OS)

```sql
-- Phase 2 additions
CREATE TABLE athlete_profiles (
  id UUID PRIMARY KEY,
  profile_id UUID REFERENCES profiles(id),
  sport TEXT NOT NULL,
  position TEXT,
  school TEXT,
  division TEXT,  -- D1, D2, D3, NAIA, HS
  state TEXT,
  grad_year INTEGER,
  eligibility_status TEXT,
  nil_eligible BOOLEAN DEFAULT false
);

CREATE TABLE nil_deals (
  id UUID PRIMARY KEY,
  athlete_id UUID REFERENCES athlete_profiles(id),
  brand_id UUID REFERENCES brand_profiles(id),
  status TEXT,  -- offered, accepted, submitted, approved
  compensation DECIMAL(10,2),
  nil_go_reference TEXT,
  submitted_at TIMESTAMPTZ,
  deadline TIMESTAMPTZ
);

CREATE TABLE contract_reviews (
  id UUID PRIMARY KEY,
  athlete_id UUID REFERENCES athlete_profiles(id),
  overall_risk TEXT,  -- low, medium, high, critical
  attorney_recommended BOOLEAN,
  clauses JSONB,
  summary TEXT,
  created_at TIMESTAMPTZ
);
```

---

## 5. Authentication & Authorization

### Auth Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                    AUTHENTICATION FLOWS                          │
│                                                                  │
│  Email/Password Signup:                                          │
│  ┌──────┐    ┌──────────┐    ┌───────────┐    ┌─────────────┐  │
│  │ Form │───►│authClient│───►│ Neon Auth │───►│POST /api/   │  │
│  │      │    │.signUp() │    │ (creates  │    │profile      │  │
│  │      │◄───│          │◄───│  user)    │◄───│(creates DB  │  │
│  └──────┘    └──────────┘    └───────────┘    │ record)     │  │
│  redirect:/editor                             └─────────────┘  │
│                                                                  │
│  Google OAuth:                                                   │
│  ┌──────┐    ┌──────────┐    ┌───────────┐    ┌─────────────┐  │
│  │Click │───►│authClient│───►│ Google    │───►│ Neon Auth   │  │
│  │      │    │.signIn   │    │ OAuth     │    │ callback    │  │
│  │      │    │.social() │    │           │    │ handler     │  │
│  └──────┘    └──────────┘    └───────────┘    └──────┬──────┘  │
│                                                        │         │
│                                              redirect:/editor   │
│                                                                  │
│  Protected Route Access:                                         │
│  ┌──────┐    ┌──────────────┐    ┌──────────────────────────┐   │
│  │ GET  │───►│ middleware   │    │ API Route Handler        │   │
│  │/edit │    │ (checks      │    │ auth.getSession()        │   │
│  │ or   │    │  cookie)     │    │ ├─ valid → proceed       │   │
│  │ /api │    │ ├─ found  ──►│───►│ └─ invalid → 401        │   │
│  │      │    │ └─ missing  │    └──────────────────────────┘   │
│  └──────┘    │   redirect  │                                     │
│              │   /login    │                                     │
│              └─────────────┘                                     │
└─────────────────────────────────────────────────────────────────┘
```

### Session Token Storage

| Environment | Cookie Name | HttpOnly | Secure |
|---|---|---|---|
| Production (HTTPS) | `__Secure-neon-auth.session_token` | Yes | Yes |
| Development (HTTP) | `neon-auth.session_token` | Yes | No |

### Authorization Model

```
Users
  │
  ├── Authenticated
  │     ├── Can access: /editor, /analytics, /settings
  │     ├── Can read/write: their own profile and links
  │     └── Cannot access: other users' data
  │
  └── Unauthenticated
        ├── Can access: /, /login, /signup, /[slug] (public profiles)
        └── Can call: /api/slug/check (rate-limited, no auth)
```

---

## 6. API Design

### REST API Overview

| Method | Route | Auth | Rate Limit | Purpose |
|---|---|---|---|---|
| `GET` | `/api/profile` | Required | 30/min | Fetch user profile + links |
| `POST` | `/api/profile` | Required | 30/min | Create initial profile |
| `PUT` | `/api/profile` | Required | 30/min | Update profile fields |
| `POST` | `/api/links` | Required | 30/min | Add link/header/divider |
| `DELETE` | `/api/links/[id]` | Required | 30/min | Delete a link item |
| `PUT` | `/api/links/reorder` | Required | 30/min | Batch reorder links |
| `GET` | `/api/slug/check` | None | 60/min | Check slug availability |
| `*` | `/api/auth/[...path]` | Varies | Neon managed | Neon Auth handler |

### API Design Principles

1. **Ownership enforced at handler level** — every mutating endpoint verifies the user owns the resource before executing
2. **Thin validation → Zod schemas** — all request bodies validated against shared Zod schemas before reaching business logic
3. **Atomic save** — reorder endpoint uses a transaction-like sequential batch to prevent sort order corruption
4. **Consistent error shape**:

```typescript
// Success
{ data: T, status: number }

// Error
{ error: string, details?: ZodError }
```

### Rate Limiting Strategy

```
┌────────────────────────────────────────────────────────────────┐
│                    RATE LIMITING                                │
│                                                                │
│  In-memory Map (per IP)                                        │
│                                                                │
│  Key: IP address                                               │
│  Value: { count: number, resetTime: number }                   │
│                                                                │
│  API Endpoints: 30 req/60s     Slug Check: 60 req/60s         │
│  ┌──────────────────────┐      ┌──────────────────────────┐   │
│  │ Request arrives      │      │ Higher limit allows       │   │
│  │ count < 30 → allow   │      │ real-time debounced       │   │
│  │ count >= 30 → 429    │      │ typing validation         │   │
│  │ resetTime passed →   │      └──────────────────────────┘   │
│  │   reset count        │                                      │
│  └──────────────────────┘                                      │
│                                                                │
│  Note: In-memory — resets on server restart.                   │
│  Phase 2: migrate to Redis/Upstash for persistent limiting.    │
└────────────────────────────────────────────────────────────────┘
```

---

## 7. Security Architecture

### Threat Model

| Threat | Attack Vector | Control |
|---|---|---|
| Unauthorized data access | Direct API calls without session | Auth check in every API handler |
| Cross-user data access | Guessing another user's resource IDs | Ownership verification (profileId match) |
| Slug squatting | Claiming reserved app routes | Reserved words list (26 terms) |
| API abuse | Bot flooding endpoints | In-memory rate limiter |
| XSS via link URLs | Malicious `javascript:` URLs | Zod URL validation (must be valid URL) |
| CSRF | Forged API requests | Neon Auth session cookie (HttpOnly) |
| Injection via profile fields | SQL injection, HTML injection | Drizzle ORM (parameterized queries) |
| Avatar URL abuse | Loading malicious external resources | URL validation; CSP headers (future) |

### Security Controls Map

```
┌─────────────────────────────────────────────────────────────────┐
│                   SECURITY CONTROLS                             │
│                                                                  │
│  Layer 1: Network                                                │
│  └─ HTTPS enforced by Vercel (automatic TLS)                     │
│                                                                  │
│  Layer 2: Authentication                                         │
│  └─ Neon Auth session tokens (HttpOnly cookies)                  │
│  └─ Middleware route protection for dashboard routes             │
│                                                                  │
│  Layer 3: Authorization                                          │
│  └─ Every API handler: auth.getSession() → userId               │
│  └─ Ownership check: resource.userId === session.userId          │
│                                                                  │
│  Layer 4: Input Validation                                       │
│  └─ Zod schemas validate all request bodies and query params     │
│  └─ URL validation prevents javascript: protocol URLs            │
│  └─ Length constraints prevent oversized payloads                │
│                                                                  │
│  Layer 5: Database                                               │
│  └─ Drizzle ORM: parameterized queries (no raw SQL)              │
│  └─ Unique constraints: slug, userId                             │
│  └─ Cascade deletes prevent orphaned records                     │
│                                                                  │
│  Layer 6: Rate Limiting                                          │
│  └─ IP-based in-memory rate limits on all API routes             │
│  └─ Generous limit on slug check (60/min) for UX                │
│                                                                  │
│  Planned (Phase 2):                                              │
│  └─ CSP headers for XSS prevention                               │
│  └─ Redis-backed rate limiting (persistent across restarts)      │
│  └─ File upload scanning (contract PDFs)                         │
│  └─ Supabase RLS policies (row-level security)                   │
└─────────────────────────────────────────────────────────────────┘
```

---

## 8. Frontend Architecture

### Rendering Strategy

```
Page                     Rendering Strategy     Reason
─────────────────────────────────────────────────────────────────
/                        Static (SSG)           No dynamic data
/login, /signup          Static (SSG)           Public, no data
/editor                  Dynamic (SSR)          Auth-protected, personalized
/[slug]                  Dynamic (SSR/ISR)      Public profile (cacheable)
/api/*                   Server (API Routes)    Dynamic data handlers
```

### State Management Architecture

```
Server State                    Client State
────────────────                ─────────────────────────────
useProfile() hook               editor/page.tsx local state:
├── profile: Profile            ├── displayName (string)
├── links: LinkItem[]           ├── bio (string)
├── isLoading: boolean          ├── avatarUrl (string)
└── refetch()                   ├── links: LinkItem[] (local copy)
                                ├── isSaving: boolean
                                ├── layoutMode: both|editor|preview
                                ├── addedLinksRef (new, not yet saved)
                                └── deletedIdsRef (deleted, not yet flushed)
```

### Responsive Layout Strategy

```
Mobile (< lg)              Desktop (lg+)
─────────────────────      ────────────────────────────
Tab toggle:                Side-by-side grid:
┌─────────────────┐        ┌──────────┬─────────────┐
│ [Edit] [Preview]│        │          │             │
├─────────────────┤        │  Editor  │   Preview   │
│                 │        │  Panel   │   (iPhone   │
│  Active Panel   │        │          │    Frame)   │
│  (either/or)    │        │          │             │
│                 │        └──────────┴─────────────┘
└─────────────────┘        Toolbar: Both/Editor/Preview
```

### Component Library Strategy

- **Base:** `shadcn/ui` (new-york style) — un-opinionated, copy-paste components
- **Icons:** `lucide-react` — tree-shakeable SVG icons
- **Animation:** `framer-motion` — page transitions, drag feedback
- **DnD:** `@dnd-kit` — accessible, keyboard-navigable drag-and-drop
- **Notifications:** `sonner` — lightweight toast notifications

---

## 9. Infrastructure & Deployment

### Current Deployment Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    DEPLOYMENT ARCHITECTURE                       │
│                                                                  │
│  Developer                                                       │
│      │                                                           │
│      ├─ git push → GitHub                                        │
│      │                 │                                         │
│      │                 ▼                                         │
│      │         ┌─────────────┐                                   │
│      │         │   Vercel    │  ← Next.js build + deploy         │
│      │         │  (CI/CD)    │  ← Automatic preview URLs         │
│      │         └──────┬──────┘  ← Edge Network (global CDN)     │
│      │                │                                          │
│      │    ┌───────────┼───────────┐                             │
│      │    ▼           ▼           ▼                             │
│      │  Static     Server      Edge                             │
│      │  Assets     Functions   Functions                        │
│      │  (CDN)      (Node.js)   (middleware)                     │
│      │                │                                          │
│      │         ┌──────┴──────┐                                   │
│      │         ▼             ▼                                   │
│      │  ┌────────────┐  ┌──────────┐                            │
│      │  │ Neon DB    │  │  Railway │                            │
│      │  │ (Postgres) │  │  (MCP)   │                            │
│      │  └────────────┘  └──────────┘                            │
└─────────────────────────────────────────────────────────────────┘
```

### Environment Strategy

| Environment | Branch | URL | DB |
|---|---|---|---|
| Development | local | `localhost:3000` | Neon dev branch |
| Preview | PR branches | `*.vercel.app` | Neon dev branch |
| Production | `main` | Custom domain | Neon production |

### Environment Variables

```bash
# Required — all environments
DATABASE_URL=                    # Neon Postgres connection string
NEON_AUTH_BASE_URL=              # Neon Auth endpoint
NEON_AUTH_COOKIE_SECRET=         # Cookie signing secret

# Required — production
NEXT_PUBLIC_APP_URL=             # Public app URL

# Planned — Phase 2
ANTHROPIC_API_KEY=               # Claude API
STRIPE_SECRET_KEY=               # Stripe
STRIPE_WEBHOOK_SECRET=           # Stripe webhook verification
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
NIL_GO_API_KEY=                  # NIL Go clearinghouse
SUPABASE_URL=                    # Phase 2: Supabase migration
SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```

---

## 10. Quality Attributes

### Performance

| Metric | Target | Current |
|---|---|---|
| LCP (Largest Contentful Paint) | < 2.5s | TBD (add Vercel Analytics) |
| FID / INP | < 100ms | TBD |
| CLS | < 0.1 | TBD |
| API response time (profile fetch) | < 200ms | ~50–100ms (Neon serverless) |
| Contract AI review | < 30s | TBD (Phase 2) |

### Scalability Design

- **Stateless API routes** — no server-side session state; scales horizontally on Vercel
- **Serverless Postgres** — Neon auto-scales connections; no connection pooling required
- **Rate limiting caveat** — current in-memory limiter is per-instance; at scale, migrate to Upstash Redis
- **CDN-cached assets** — all static assets served from Vercel Edge Network

### Reliability

- **Vercel SLA:** 99.99% uptime
- **Neon SLA:** 99.95% uptime
- **Failure modes:**
  - DB unavailable → 500 errors on API routes; static pages still render
  - Auth unavailable → login fails; existing sessions still work until cookie expiry
  - Rate limit storage lost on restart → counter resets (acceptable for current scale)

### Maintainability

- **TypeScript strict mode** — catches type errors at compile time
- **Biome** — consistent formatting and linting, faster than ESLint+Prettier
- **Zod schemas** — single source of truth for validation (shared between API and client)
- **Drizzle ORM** — type-safe SQL; schema-as-code with migration support
- **shadcn/ui** — owned component code (no black-box library updates breaking UI)

---

## 11. Architecture Decision Records

See [`docs/adr/`](./docs/adr/) for full ADR history.

### ADR Index

| ID | Title | Status | Date |
|---|---|---|---|
| [ADR-001](./docs/adr/ADR-001-nextjs-app-router.md) | Use Next.js App Router | Accepted | 2026-02-28 |
| [ADR-002](./docs/adr/ADR-002-neon-auth-database.md) | Use Neon for Auth + Database (MVP) | Accepted | 2026-02-28 |
| [ADR-003](./docs/adr/ADR-003-drizzle-orm.md) | Use Drizzle ORM over Prisma | Accepted | 2026-02-28 |
| [ADR-004](./docs/adr/ADR-004-biome-linting.md) | Use Biome over ESLint+Prettier | Accepted | 2026-02-28 |
| [ADR-005](./docs/adr/ADR-005-supabase-migration.md) | Migrate to Supabase for Phase 2 | Proposed | 2026-02-28 |
| [ADR-006](./docs/adr/ADR-006-claude-ai-modules.md) | Use Claude claude-sonnet-4-6 for AI Modules | Proposed | 2026-02-28 |

---

## 12. Roadmap: LinkBio → Athlete OS

### Phase Evolution

```
Phase 1 (Now): LinkBio MVP
─────────────────────────────────────────────────────────
• Profile + link management
• Auth (email + Google)
• Public profile pages
• Drag-and-drop editor
• Tech stack: Next.js 15 + Neon + Drizzle

Phase 2 (~Weeks 7-12): Contract Guard + NIL Matchmaker
─────────────────────────────────────────────────────────
• Migrate DB to Supabase (RLS, Storage, Edge Functions)
• Integrate Anthropic Claude (contract analysis, NIL matching)
• Add Stripe billing (Starter $9.99, Pro $29.99)
• Build Parent Dashboard
• NIL Go clearinghouse integration
• State NIL compliance rule engine

Phase 3 (~Weeks 13-20): Transfer Portal + Combine Optimizer
─────────────────────────────────────────────────────────
• Transfer portal entry + roster vacancy monitoring
• Combine performance benchmarking
• Coach/institutional B2B dashboard
• Elite tier ($99/mo)
• D3 school contracts

Phase 4 (~Weeks 21-30): Highlight Architect + Analytics
─────────────────────────────────────────────────────────
• AI highlight reel generation
• Social sharing integrations
• Click event analytics (click_events table already seeded)
• Data licensing product
• D1 institutional B2B
```

### Key Migration Points

| From | To | When | Reason |
|---|---|---|---|
| Neon Auth | Supabase Auth | Phase 2 | RLS, Storage, Edge Functions needed |
| Neon DB | Supabase Postgres | Phase 2 | RLS policies for multi-tenant data |
| In-memory rate limit | Upstash Redis | Phase 2 | Persistent, multi-instance |
| Next.js API routes only | Railway BFF | Phase 2-3 | Long-running AI jobs, background tasks |
