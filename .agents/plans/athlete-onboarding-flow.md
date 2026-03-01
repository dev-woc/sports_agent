# Feature: Athlete Onboarding Flow

The following plan is complete, but validate documentation and codebase patterns before implementing.
Pay special attention to naming of existing utils, types, and models. Import from the right files.

## Feature Description

A multi-step onboarding wizard shown to new athletes immediately after account creation. The wizard collects sport-specific profile data (sport, position, school, division, state, graduation year, eligibility status, and optional social handles), stores it in a new `athlete_profiles` table, then routes the athlete to the editor. The onboarding is a one-time flow — returning users who have already completed it bypass it entirely.

## User Story

As a new college or high school athlete
I want to complete a guided setup that captures my sport, school, and eligibility details
So that the platform can personalize NIL matches, contract guidance, and recruiting tools from day one

## Problem Statement

Today, signup goes directly to the generic profile editor. The platform has no knowledge of the athlete's sport, division, state, or NIL eligibility — the very data required to power Contract Guard, NIL Matchmaker, and the Parent Dashboard. Every athlete-specific feature is blocked without this data.

## Solution Statement

Intercept the post-signup redirect and route athletes to `/onboarding`. A 3-step client-side wizard collects all required data. On completion, the data is persisted to a new `athlete_profiles` table via `POST /api/onboarding` and the athlete is redirected to `/editor`. A dedicated route group `(onboarding)` with its own auth-checking layout keeps the flow clean and separate from the dashboard.

## Feature Metadata

**Feature Type**: New Capability
**Estimated Complexity**: Medium
**Primary Systems Affected**: DB schema, API routes, auth flow, routing, UI components
**Dependencies**: All existing (Drizzle ORM, Zod, Neon Auth, Next.js App Router, shadcn/ui) — no new packages required

---

## CONTEXT REFERENCES

### Relevant Codebase Files — MUST READ BEFORE IMPLEMENTING

- `src/lib/db/schema.ts` (lines 1–66) — Why: Mirror exact pgTable() pattern, column types, index pattern, and relation definitions
- `src/types/index.ts` (lines 1–37) — Why: Add `AthleteProfile` type using same `InferSelectModel` pattern
- `src/lib/validations.ts` (lines 1–71) — Why: Mirror Zod schema pattern; add `athleteProfileSchema` here
- `src/lib/__tests__/validations.test.ts` — Why: Mirror `describe()` / `test()` test structure for new schema tests
- `src/app/(auth)/layout.tsx` (lines 1–7) — Why: Pattern for creating minimal route group layouts
- `src/app/(dashboard)/layout.tsx` (lines 1–28) — Why: Copy auth check pattern (`auth.getSession()` → redirect to `/login`) for the onboarding layout
- `src/app/api/profile/route.ts` (lines 1–114) — Why: Copy exact API route pattern: rate limiting, auth check, 401 shape, Zod parse, Drizzle insert, response shape
- `src/components/auth/signup-form.tsx` (lines 1–100) — Why: Change single redirect from `/editor` → `/onboarding`; understand form/state patterns to mirror
- `src/lib/auth/server.ts` — Why: Understand `auth.getSession()` usage for new route layouts and API handlers
- `src/lib/rate-limit.ts` — Why: Re-use `apiRateLimiter` (already exported); pattern for IP extraction
- `src/app/(auth)/signup/page.tsx` — Why: Understand Card layout pattern to mirror in onboarding steps

### New Files to Create

- `src/lib/sports-data.ts` — Sports, positions, US states, divisions, eligibility statuses constants
- `src/app/(onboarding)/layout.tsx` — Route group layout with auth check and minimal shell
- `src/app/(onboarding)/onboarding/page.tsx` — Server component that renders the wizard
- `src/components/onboarding/onboarding-wizard.tsx` — Client component: 3-step wizard with all form state
- `src/app/api/onboarding/route.ts` — GET (check if complete) + POST (create athlete profile) handlers

### Files to Modify

- `src/lib/db/schema.ts` — Add `athleteProfiles` table, indexes, and relations
- `src/types/index.ts` — Add `AthleteProfile` type export
- `src/lib/validations.ts` — Add `athleteProfileSchema` Zod schema
- `src/components/auth/signup-form.tsx` — Change `router.push("/editor")` → `router.push("/onboarding")`
- `src/lib/__tests__/validations.test.ts` — Add `athleteProfileSchema` tests

### Relevant Documentation

- [Drizzle ORM pgTable docs](https://orm.drizzle.team/docs/sql-schema-declaration)
  - Why: Exact pgTable() column API for new table
- [Drizzle relations API](https://orm.drizzle.team/docs/relations)
  - Why: Mirror existing relations pattern for new FK
- [Zod object schema](https://zod.dev/?id=objects)
  - Why: athleteProfileSchema construction
- [Next.js Route Groups](https://nextjs.org/docs/app/building-your-application/routing/route-groups)
  - Why: `(onboarding)` route group pattern — folder name excluded from URL

### Patterns to Follow

**DB Schema Pattern** — mirror exactly from `src/lib/db/schema.ts:4–21`:
```typescript
export const athleteProfiles = pgTable(
  "athlete_profiles",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    profileId: uuid("profile_id")
      .notNull()
      .unique()
      .references(() => profiles.id, { onDelete: "cascade" }),
    sport: text("sport").notNull(),
    // ... other columns
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [uniqueIndex("idx_athlete_profiles_profile_id").on(t.profileId)],
);
```

**API Route Pattern** — mirror from `src/app/api/profile/route.ts:39–81` (POST):
```typescript
export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for") ?? "unknown";
  const limit = apiRateLimiter.check(ip);
  if (!limit.success) return NextResponse.json({ error: "Too many requests" }, { status: 429 });

  const session = await auth.getSession();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const result = athleteProfileSchema.safeParse(body);
  if (!result.success) return NextResponse.json({ error: "Invalid request", details: result.error }, { status: 400 });

  // ... DB insert
  return NextResponse.json({ athleteProfile }, { status: 201 });
}
```

**Auth Layout Pattern** — mirror from `src/app/(dashboard)/layout.tsx:1–28`:
```typescript
export const dynamic = "force-dynamic";

export default async function OnboardingLayout({ children }) {
  const session = await auth.getSession();
  if (!session?.user) redirect("/login");
  return <div className="...">{children}</div>;
}
```

**Type Pattern** — mirror from `src/types/index.ts`:
```typescript
export type AthleteProfile = InferSelectModel<typeof athleteProfiles>;
```

**Zod Schema Pattern** — mirror from `src/lib/validations.ts:37–42`:
```typescript
export const athleteProfileSchema = z.object({
  sport: z.string().min(1, "Sport is required"),
  // ...
});
```

**Form State Pattern** — mirror from `src/components/auth/signup-form.tsx`:
- `useState` for each field
- `useState<string | null>(null)` for `error`
- `useState(false)` for `isLoading`
- `async function handleSubmit(e: React.FormEvent)` with `e.preventDefault()`
- Set `isLoading` true before async ops, false in finally block

**Error Response Shape** (all API routes):
```typescript
// 4xx: { error: string, details?: ZodError }
// 2xx: { athleteProfile: AthleteProfile }
```

**Naming Conventions:**
- Files: kebab-case (`onboarding-wizard.tsx`, `sports-data.ts`)
- Exports: camelCase functions, PascalCase components
- DB columns: snake_case in DB string, camelCase in TypeScript

---

## IMPLEMENTATION PLAN

### Phase 1: Foundation (DB, Types, Validation, Constants)

Add all data structures before any UI or API work. DB push must happen before API route can be tested.

**Tasks:**
- Add `athleteProfiles` table to schema
- Add `AthleteProfile` type
- Add `athleteProfileSchema` Zod schema
- Create sports-data constants file

### Phase 2: API Route

Create the onboarding API endpoint using established route patterns.

**Tasks:**
- Create `GET /api/onboarding` — check if current user has an athlete profile
- Create `POST /api/onboarding` — create athlete profile for current user

### Phase 3: UI Components & Route

Build the route group layout, wizard client component, and page.

**Tasks:**
- Create `(onboarding)` route group with auth layout
- Create `onboarding-wizard.tsx` client component (3 steps)
- Create onboarding page (server component)

### Phase 4: Wire Up & Test

Connect signup flow and validate end-to-end.

**Tasks:**
- Update signup redirect
- Push DB schema
- Write validation tests

---

## STEP-BY-STEP TASKS

### TASK 1: UPDATE `src/lib/db/schema.ts`

- **ADD** `athleteProfiles` table after `linkItems` definition
- **PATTERN**: `src/lib/db/schema.ts:4–21` — exact pgTable() + index pattern
- **IMPORTS**: No new imports needed; already has `pgTable`, `uuid`, `text`, `timestamp`, `boolean`, `integer`, `uniqueIndex` from `drizzle-orm/pg-core`; check which column types are imported and add `boolean`, `integer`, `smallint` if missing
- **IMPLEMENT**:
```typescript
export const athleteProfiles = pgTable(
  "athlete_profiles",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    profileId: uuid("profile_id")
      .notNull()
      .unique()
      .references(() => profiles.id, { onDelete: "cascade" }),
    sport: text("sport").notNull(),
    position: text("position").notNull().default(""),
    school: text("school").notNull(),
    division: text("division").notNull(),       // "D1" | "D2" | "D3" | "NAIA" | "NJCAA" | "High School"
    state: text("state").notNull(),             // 2-letter code e.g. "CA"
    gradYear: integer("grad_year").notNull(),
    eligibilityStatus: text("eligibility_status").notNull(),
    nilEligible: boolean("nil_eligible").notNull().default(false),
    socialInstagram: text("social_instagram").notNull().default(""),
    socialTiktok: text("social_tiktok").notNull().default(""),
    socialTwitter: text("social_twitter").notNull().default(""),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [uniqueIndex("idx_athlete_profiles_profile_id").on(t.profileId)],
);
```
- **ADD** relation to existing relations block:
```typescript
// Inside profilesRelations:
athleteProfile: relations.one(athleteProfiles, { ... })
// New athleteProfilesRelations export
export const athleteProfilesRelations = relations(athleteProfiles, ({ one }) => ({
  profile: one(profiles, {
    fields: [athleteProfiles.profileId],
    references: [profiles.id],
  }),
}));
```
- **GOTCHA**: Check which Drizzle column helpers are already imported at the top of schema.ts; add `integer`, `boolean` if missing. The import line will be something like `import { pgTable, uuid, text, timestamp, integer, boolean, uniqueIndex } from "drizzle-orm/pg-core";`
- **VALIDATE**: `npx tsc --noEmit`

---

### TASK 2: UPDATE `src/types/index.ts`

- **ADD** `AthleteProfile` type export
- **PATTERN**: `src/types/index.ts:1–5` — InferSelectModel pattern
- **IMPORTS**: Add `athleteProfiles` to the import from `@/lib/db/schema`
- **IMPLEMENT**:
```typescript
import { profiles, linkItems, clickEvents, athleteProfiles } from "@/lib/db/schema";
// ...existing types...
export type AthleteProfile = InferSelectModel<typeof athleteProfiles>;
```
- **VALIDATE**: `npx tsc --noEmit`

---

### TASK 3: UPDATE `src/lib/validations.ts`

- **ADD** `athleteProfileSchema` at the bottom of the file
- **PATTERN**: `src/lib/validations.ts:37–42` — z.object() pattern
- **IMPLEMENT**:
```typescript
export const DIVISIONS = ["D1", "D2", "D3", "NAIA", "NJCAA", "High School"] as const;
export type Division = (typeof DIVISIONS)[number];

export const athleteProfileSchema = z.object({
  sport: z.string().min(1, "Sport is required"),
  position: z.string().optional().default(""),
  school: z.string().min(1, "School is required").max(100, "School name too long"),
  division: z.enum(DIVISIONS, { errorMap: () => ({ message: "Invalid division" }) }),
  state: z.string().length(2, "Must be a valid 2-letter state code"),
  gradYear: z.number().int().min(2025).max(2032),
  eligibilityStatus: z.string().min(1, "Eligibility status is required"),
  nilEligible: z.boolean().optional().default(false),
  socialInstagram: z.string().optional().default(""),
  socialTiktok: z.string().optional().default(""),
  socialTwitter: z.string().optional().default(""),
});
```
- **GOTCHA**: `z` is already imported at the top of this file — do not add a second import
- **VALIDATE**: `npx tsc --noEmit`

---

### TASK 4: CREATE `src/lib/sports-data.ts` (new file)

- **CREATE** constants file with sports/positions/states/divisions data
- **IMPLEMENT**:
```typescript
export const SPORTS_AND_POSITIONS: Record<string, string[]> = {
  Football: ["QB", "RB", "WR", "TE", "OL", "DL", "LB", "DB", "K", "P"],
  "Men's Basketball": ["PG", "SG", "SF", "PF", "C"],
  "Women's Basketball": ["PG", "SG", "SF", "PF", "C"],
  Baseball: ["P", "C", "1B", "2B", "3B", "SS", "LF", "CF", "RF", "DH"],
  Softball: ["P", "C", "1B", "2B", "3B", "SS", "LF", "CF", "RF", "DP"],
  "Men's Soccer": ["GK", "CB", "LB", "RB", "CDM", "CM", "CAM", "LW", "RW", "ST"],
  "Women's Soccer": ["GK", "CB", "LB", "RB", "CDM", "CM", "CAM", "LW", "RW", "ST"],
  Volleyball: ["S", "L", "OH", "MB", "RS", "OP"],
  "Men's Lacrosse": ["A", "M", "D", "GK", "LSM", "SSDM", "FO"],
  "Women's Lacrosse": ["A", "M", "D", "GK"],
  Wrestling: ["125", "133", "141", "149", "157", "165", "174", "184", "197", "285"],
  "Track & Field": ["Sprints", "Distance", "Hurdles", "Jumps", "Throws", "Pole Vault", "Multi-Event"],
  Swimming: ["Freestyle", "Backstroke", "Breaststroke", "Butterfly", "IM", "Diving"],
  Golf: ["Player"],
  Tennis: ["Singles", "Doubles"],
  "Ice Hockey": ["C", "LW", "RW", "D", "G"],
  Gymnastics: ["All-Around", "Bars", "Beam", "Floor", "Vault"],
  Other: ["Athlete"],
};

export const SPORTS = Object.keys(SPORTS_AND_POSITIONS);

export const US_STATES = [
  { code: "AL", name: "Alabama" },
  { code: "AK", name: "Alaska" },
  { code: "AZ", name: "Arizona" },
  { code: "AR", name: "Arkansas" },
  { code: "CA", name: "California" },
  { code: "CO", name: "Colorado" },
  { code: "CT", name: "Connecticut" },
  { code: "DE", name: "Delaware" },
  { code: "DC", name: "District of Columbia" },
  { code: "FL", name: "Florida" },
  { code: "GA", name: "Georgia" },
  { code: "HI", name: "Hawaii" },
  { code: "ID", name: "Idaho" },
  { code: "IL", name: "Illinois" },
  { code: "IN", name: "Indiana" },
  { code: "IA", name: "Iowa" },
  { code: "KS", name: "Kansas" },
  { code: "KY", name: "Kentucky" },
  { code: "LA", name: "Louisiana" },
  { code: "ME", name: "Maine" },
  { code: "MD", name: "Maryland" },
  { code: "MA", name: "Massachusetts" },
  { code: "MI", name: "Michigan" },
  { code: "MN", name: "Minnesota" },
  { code: "MS", name: "Mississippi" },
  { code: "MO", name: "Missouri" },
  { code: "MT", name: "Montana" },
  { code: "NE", name: "Nebraska" },
  { code: "NV", name: "Nevada" },
  { code: "NH", name: "New Hampshire" },
  { code: "NJ", name: "New Jersey" },
  { code: "NM", name: "New Mexico" },
  { code: "NY", name: "New York" },
  { code: "NC", name: "North Carolina" },
  { code: "ND", name: "North Dakota" },
  { code: "OH", name: "Ohio" },
  { code: "OK", name: "Oklahoma" },
  { code: "OR", name: "Oregon" },
  { code: "PA", name: "Pennsylvania" },
  { code: "RI", name: "Rhode Island" },
  { code: "SC", name: "South Carolina" },
  { code: "SD", name: "South Dakota" },
  { code: "TN", name: "Tennessee" },
  { code: "TX", name: "Texas" },
  { code: "UT", name: "Utah" },
  { code: "VT", name: "Vermont" },
  { code: "VA", name: "Virginia" },
  { code: "WA", name: "Washington" },
  { code: "WV", name: "West Virginia" },
  { code: "WI", name: "Wisconsin" },
  { code: "WY", name: "Wyoming" },
];

export const ELIGIBILITY_STATUSES = [
  "Freshman",
  "Sophomore",
  "Junior",
  "Senior",
  "Graduate",
  "Redshirt Freshman",
  "Redshirt Sophomore",
  "Redshirt Junior",
  "Redshirt Senior",
  "HS Freshman",
  "HS Sophomore",
  "HS Junior",
  "HS Senior",
] as const;

export type EligibilityStatus = (typeof ELIGIBILITY_STATUSES)[number];

export const GRAD_YEARS = [2025, 2026, 2027, 2028, 2029, 2030, 2031, 2032];

// NIL is allowed in High School for these states (as of 2026)
export const HS_NIL_STATES = new Set([
  "CA", "FL", "NY", "NJ", "IL", "NC", "TX", "GA", "CO", "AZ",
  "CT", "DC", "KS", "KY", "LA", "MD", "MA", "MN", "MO", "MT",
  "NE", "NV", "NH", "NM", "ND", "OK", "OR", "RI", "SC", "SD",
  "TN", "UT", "VT", "VA", "WA", "WV", "WI", "WY", "PA", "AR",
  "ID", "IA", "ME", "MS", "AK",
]);

/** Compute NIL eligibility at the point of onboarding (best-effort, not legal advice) */
export function computeNilEligible(division: string, state: string): boolean {
  if (division === "High School") return HS_NIL_STATES.has(state);
  return true; // All college divisions (D1, D2, D3, NAIA, NJCAA) allow NIL
}
```
- **VALIDATE**: `npx tsc --noEmit`

---

### TASK 5: CREATE `src/app/api/onboarding/route.ts` (new file)

- **CREATE** GET + POST handlers following exact pattern from `src/app/api/profile/route.ts`
- **PATTERN**: `src/app/api/profile/route.ts:11–81` — rate limit → auth → validate → DB → respond
- **IMPORTS**:
```typescript
import { type NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { profiles, athleteProfiles } from "@/lib/db/schema";
import { auth } from "@/lib/auth/server";
import { apiRateLimiter } from "@/lib/rate-limit";
import { athleteProfileSchema } from "@/lib/validations";
import { computeNilEligible } from "@/lib/sports-data";
```
- **IMPLEMENT GET** (check if current user already has an athlete profile):
```typescript
export async function GET(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for") ?? "unknown";
  const limit = apiRateLimiter.check(ip);
  if (!limit.success) return NextResponse.json({ error: "Too many requests" }, { status: 429 });

  const session = await auth.getSession();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const profile = await db.query.profiles.findFirst({
    where: eq(profiles.userId, session.user.id),
  });
  if (!profile) return NextResponse.json({ athleteProfile: null });

  const athleteProfile = await db.query.athleteProfiles.findFirst({
    where: eq(athleteProfiles.profileId, profile.id),
  });

  return NextResponse.json({ athleteProfile: athleteProfile ?? null });
}
```
- **IMPLEMENT POST** (create athlete profile):
```typescript
export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for") ?? "unknown";
  const limit = apiRateLimiter.check(ip);
  if (!limit.success) return NextResponse.json({ error: "Too many requests" }, { status: 429 });

  const session = await auth.getSession();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const profile = await db.query.profiles.findFirst({
    where: eq(profiles.userId, session.user.id),
  });
  if (!profile) return NextResponse.json({ error: "Profile not found" }, { status: 404 });

  // Prevent duplicate onboarding
  const existing = await db.query.athleteProfiles.findFirst({
    where: eq(athleteProfiles.profileId, profile.id),
  });
  if (existing) return NextResponse.json({ error: "Onboarding already complete" }, { status: 409 });

  const body = await req.json();
  const result = athleteProfileSchema.safeParse(body);
  if (!result.success) return NextResponse.json({ error: "Invalid request", details: result.error }, { status: 400 });

  const { sport, position, school, division, state, gradYear, eligibilityStatus, socialInstagram, socialTiktok, socialTwitter } = result.data;
  const nilEligible = computeNilEligible(division, state);

  const [athleteProfile] = await db.insert(athleteProfiles).values({
    profileId: profile.id,
    sport,
    position: position ?? "",
    school,
    division,
    state,
    gradYear,
    eligibilityStatus,
    nilEligible,
    socialInstagram: socialInstagram ?? "",
    socialTiktok: socialTiktok ?? "",
    socialTwitter: socialTwitter ?? "",
  }).returning();

  return NextResponse.json({ athleteProfile }, { status: 201 });
}
```
- **GOTCHA**: Use `db.query.athleteProfiles` — this requires the `athleteProfilesRelations` export from schema.ts and the query builder (already configured via Drizzle). If `db.query` isn't configured for the new table, use `db.select().from(athleteProfiles).where(...)` instead (check `src/lib/db/index.ts` for how db is initialized)
- **VALIDATE**: `npx tsc --noEmit`

---

### TASK 6: CREATE `src/app/(onboarding)/layout.tsx` (new file — new route group)

- **CREATE** directory `src/app/(onboarding)/` and layout file
- **PATTERN**: `src/app/(dashboard)/layout.tsx:1–28` — auth check + minimal shell
- **IMPORTS**:
```typescript
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth/server";
```
- **IMPLEMENT**:
```typescript
export const dynamic = "force-dynamic";

export default async function OnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth.getSession();
  if (!session?.user) redirect("/login");

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      {children}
    </div>
  );
}
```
- **GOTCHA**: Route group folder `(onboarding)` does NOT appear in the URL. The page at `(onboarding)/onboarding/page.tsx` resolves to URL `/onboarding`. Create both directories.
- **VALIDATE**: `npx tsc --noEmit`

---

### TASK 7: CREATE `src/components/onboarding/onboarding-wizard.tsx` (new file)

- **CREATE** directory `src/components/onboarding/` and wizard file
- **PATTERN**: `src/components/auth/signup-form.tsx` — `"use client"`, useState per field, async handleSubmit, error/loading state, shadcn/ui Card + Button + Input + Label
- **IMPLEMENT** a 3-step wizard client component:

**Step 1 — Sport & Position:**
- `<select>` for sport (populated from `SPORTS` array from `@/lib/sports-data`)
- `<select>` for position (populated from `SPORTS_AND_POSITIONS[selectedSport]`, disabled until sport selected)
- Sport change resets position to `""`

**Step 2 — School & Program:**
- `<Input>` for school name
- `<select>` for division (DIVISIONS from `@/lib/validations`)
- `<select>` for state (US_STATES from `@/lib/sports-data`)
- `<select>` for grad year (GRAD_YEARS from `@/lib/sports-data`)
- `<select>` for eligibilityStatus (ELIGIBILITY_STATUSES from `@/lib/sports-data`)

**Step 3 — Social (optional):**
- `<Input>` for Instagram handle (placeholder `@handle`)
- `<Input>` for TikTok handle (placeholder `@handle`)
- `<Input>` for Twitter/X handle (placeholder `@handle`)

**Submit on Step 3:**
```typescript
async function handleFinish(e: React.FormEvent) {
  e.preventDefault();
  setIsLoading(true);
  setError(null);
  try {
    const res = await fetch("/api/onboarding", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sport, position, school, division, state,
        gradYear: Number(gradYear),
        eligibilityStatus,
        socialInstagram, socialTiktok, socialTwitter,
      }),
    });
    if (!res.ok) {
      const data = await res.json();
      setError(data.error ?? "Something went wrong");
      return;
    }
    router.push("/editor");
  } catch {
    setError("Network error. Please try again.");
  } finally {
    setIsLoading(false);
  }
}
```

**Progress indicator** (simple step counter):
```tsx
<p className="text-sm text-muted-foreground mb-4">Step {step} of 3</p>
```

**Navigation:**
- Step 1 → 2: "Next" button (validate sport is selected)
- Step 2 → 3: "Next" button (validate school, division, state, gradYear, eligibilityStatus are filled)
- Step 2 → back to 1: "Back" button
- Step 3 → submit: "Finish" button with isLoading state
- Step 3 → back to 2: "Back" button

**Validation before advancing:**
```typescript
function handleNextFromStep1() {
  if (!sport) { setError("Please select a sport"); return; }
  setError(null);
  setStep(2);
}
function handleNextFromStep2() {
  if (!school.trim()) { setError("School name is required"); return; }
  if (!division) { setError("Please select a division"); return; }
  if (!state) { setError("Please select a state"); return; }
  if (!gradYear) { setError("Please select a graduation year"); return; }
  if (!eligibilityStatus) { setError("Please select eligibility status"); return; }
  setError(null);
  setStep(3);
}
```

**Full component state:**
```typescript
const [step, setStep] = useState(1);
const [sport, setSport] = useState("");
const [position, setPosition] = useState("");
const [school, setSchool] = useState("");
const [division, setDivision] = useState("");
const [state, setState] = useState("");
const [gradYear, setGradYear] = useState("");
const [eligibilityStatus, setEligibilityStatus] = useState("");
const [socialInstagram, setSocialInstagram] = useState("");
const [socialTiktok, setSocialTiktok] = useState("");
const [socialTwitter, setSocialTwitter] = useState("");
const [error, setError] = useState<string | null>(null);
const [isLoading, setIsLoading] = useState(false);
```

**Select element Tailwind class** (match Input component style — use `flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm`):
```tsx
<select
  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
  value={sport}
  onChange={(e) => { setSport(e.target.value); setPosition(""); }}
>
  <option value="">Select sport...</option>
  {SPORTS.map((s) => <option key={s} value={s}>{s}</option>)}
</select>
```

- **IMPORTS**:
```typescript
"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SPORTS, SPORTS_AND_POSITIONS, US_STATES, ELIGIBILITY_STATUSES, GRAD_YEARS } from "@/lib/sports-data";
import { DIVISIONS } from "@/lib/validations";
```
- **GOTCHA**: `DIVISIONS` comes from `@/lib/validations`, not sports-data. Keep constants separated by domain.
- **GOTCHA**: `gradYear` is stored as string in select state but must be cast to `Number(gradYear)` before sending to API (matches `z.number().int()` in schema)
- **GOTCHA**: `Card`, `CardContent`, `CardDescription`, `CardHeader`, `CardTitle` sub-components must all be imported explicitly — check `src/components/ui/card.tsx` for exact exports
- **VALIDATE**: `npx tsc --noEmit`

---

### TASK 8: CREATE `src/app/(onboarding)/onboarding/page.tsx` (new file)

- **CREATE** directory `src/app/(onboarding)/onboarding/` and page file
- **IMPLEMENT** simple server component that renders the wizard:
```typescript
import { OnboardingWizard } from "@/components/onboarding/onboarding-wizard";

export default function OnboardingPage() {
  return <OnboardingWizard />;
}
```
- **GOTCHA**: No data fetching needed here; the wizard client component handles everything. Keep this server component thin.
- **VALIDATE**: `npx tsc --noEmit` && start dev server and navigate to `/onboarding`

---

### TASK 9: UPDATE `src/components/auth/signup-form.tsx`

- **UPDATE** the post-signup redirect from `/editor` to `/onboarding`
- **PATTERN**: `src/components/auth/signup-form.tsx` — find the `router.push("/editor")` call after profile creation succeeds
- **IMPLEMENT**: Change line `router.push("/editor")` → `router.push("/onboarding")`
- **GOTCHA**: There is exactly one success redirect in SignupForm. Do not change the Google OAuth button redirect (that stays as `/editor` in `google-button.tsx` for now — Google OAuth users bypass the wizard in MVP)
- **VALIDATE**: `npx tsc --noEmit`

---

### TASK 10: PUSH DB SCHEMA

- **RUN**: `npm run db:push`
- **GOTCHA**: This will prompt for confirmation to create the new `athlete_profiles` table. Accept.
- **VALIDATE**: `npm run db:studio` — verify `athlete_profiles` table exists with correct columns

---

### TASK 11: ADD VALIDATION TESTS to `src/lib/__tests__/validations.test.ts`

- **ADD** `athleteProfileSchema` test block at the bottom of the file
- **PATTERN**: `src/lib/__tests__/validations.test.ts:42–102` — profileSchema tests structure
- **IMPLEMENT**:
```typescript
describe("athleteProfileSchema", () => {
  const valid = {
    sport: "Football",
    position: "QB",
    school: "University of Michigan",
    division: "D1",
    state: "MI",
    gradYear: 2026,
    eligibilityStatus: "Junior",
    socialInstagram: "@johndoe",
    socialTiktok: "",
    socialTwitter: "",
  };

  test("accepts valid athlete profile", () => {
    expect(athleteProfileSchema.safeParse(valid).success).toBe(true);
  });

  test("rejects missing sport", () => {
    const result = athleteProfileSchema.safeParse({ ...valid, sport: "" });
    expect(result.success).toBe(false);
  });

  test("rejects missing school", () => {
    const result = athleteProfileSchema.safeParse({ ...valid, school: "" });
    expect(result.success).toBe(false);
  });

  test("rejects invalid division", () => {
    const result = athleteProfileSchema.safeParse({ ...valid, division: "D5" });
    expect(result.success).toBe(false);
  });

  test("rejects state code longer than 2 chars", () => {
    const result = athleteProfileSchema.safeParse({ ...valid, state: "CAL" });
    expect(result.success).toBe(false);
  });

  test("rejects grad year below 2025", () => {
    const result = athleteProfileSchema.safeParse({ ...valid, gradYear: 2020 });
    expect(result.success).toBe(false);
  });

  test("accepts High School division", () => {
    const result = athleteProfileSchema.safeParse({ ...valid, division: "High School" });
    expect(result.success).toBe(true);
  });

  test("accepts empty optional social fields", () => {
    const result = athleteProfileSchema.safeParse({ ...valid, socialInstagram: "", socialTiktok: "", socialTwitter: "" });
    expect(result.success).toBe(true);
  });
});
```
- **IMPORTS**: Add `import { athleteProfileSchema } from "../validations";` to the import block at top of test file (check existing import structure)
- **VALIDATE**: `npm run test:run`

---

## TESTING STRATEGY

### Unit Tests

- **Framework**: Vitest with global APIs + happy-dom
- **Location**: `src/lib/__tests__/validations.test.ts`
- **Scope**: Test all edge cases of `athleteProfileSchema`:
  - Valid complete submission
  - Required field missing (sport, school, division, state, gradYear, eligibilityStatus)
  - Invalid division enum value
  - State code wrong length (1 char, 3 chars)
  - Grad year out of range (2020, 2040)
  - All DIVISIONS values accepted
  - Optional social fields accept empty strings

### Integration Tests

Manual E2E via dev server (see Level 4 validation below)

### Edge Cases

- User submits onboarding twice → API returns 409 (already handled in route)
- User navigates to `/onboarding` after already completing it → GET check at wizard mount; redirect to `/editor` if already done
- Google OAuth signup bypasses wizard (acceptable for MVP — Google users land on `/editor` directly, wizard is optional)
- State is "AL" (Alabama) + division "High School" → `computeNilEligible` returns `false` (Alabama bans HS NIL)
- Sport selected but no position → `position` field is optional, defaults to `""`

**Add to wizard:** On wizard mount, call GET `/api/onboarding`. If `athleteProfile` is not null, skip wizard and push to `/editor`:
```typescript
useEffect(() => {
  fetch("/api/onboarding")
    .then(r => r.json())
    .then(data => {
      if (data.athleteProfile) router.push("/editor");
    });
}, [router]);
```

---

## VALIDATION COMMANDS

Execute in order. All must pass before considering implementation complete.

### Level 1: Type Safety

```bash
npx tsc --noEmit
```

### Level 2: Linting

```bash
npm run lint
```

### Level 3: Unit Tests

```bash
npm run test:run
```

### Level 4: Manual Validation

Start dev server: `npm run dev`

1. **New signup flow:**
   - Navigate to `http://localhost:3000/signup`
   - Fill out name, email, password, username → Submit
   - Confirm redirect to `http://localhost:3000/onboarding`
   - Wizard step 1 appears (Sport & Position)

2. **Step navigation:**
   - Select a sport → positions populate for that sport
   - Click "Next" without selecting sport → error message appears
   - Select sport + position → click "Next" → Step 2 appears

3. **Step 2:**
   - Fill school name, division, state, grad year, eligibility → click "Next"
   - Click "Next" with empty school → error appears
   - Navigate back → sport/position retained

4. **Step 3 (social):**
   - Leave all social fields empty → click "Finish"
   - Confirm redirect to `/editor`
   - Confirm DB row created: `npm run db:studio` → check `athlete_profiles` table

5. **Idempotency:**
   - Log out and log back in → navigate manually to `/onboarding`
   - Confirm instant redirect to `/editor` (already complete check)

6. **API validation:**
   ```bash
   curl -X POST http://localhost:3000/api/onboarding \
     -H "Content-Type: application/json" \
     -d '{"sport":"Football","school":"","division":"D1","state":"MI","gradYear":2026,"eligibilityStatus":"Junior"}' \
     -b "your-session-cookie"
   # Expect 400 with validation error for empty school
   ```

### Level 5: DB Verification

```bash
npm run db:studio
```
- Verify `athlete_profiles` table has correct columns
- Verify row created after completing wizard

---

## ACCEPTANCE CRITERIA

- [ ] New signup redirects to `/onboarding` (not `/editor`)
- [ ] Wizard shows progress indicator (Step X of 3)
- [ ] Step 1 collects sport + position; position options update when sport changes
- [ ] Cannot advance from Step 1 without selecting a sport
- [ ] Step 2 collects school, division, state, grad year, eligibility status
- [ ] Cannot advance from Step 2 without filling required fields
- [ ] Step 3 collects optional social handles; can submit with all empty
- [ ] Completing wizard POSTs to `/api/onboarding` and creates DB row
- [ ] `nilEligible` is computed automatically from division + state
- [ ] Completing wizard redirects to `/editor`
- [ ] Navigating to `/onboarding` when already onboarded redirects to `/editor`
- [ ] All validation commands pass with zero errors
- [ ] `athleteProfileSchema` unit tests pass
- [ ] No regressions on existing signup/login/editor flows

---

## COMPLETION CHECKLIST

- [ ] TASK 1: `athleteProfiles` table added to schema.ts
- [ ] TASK 2: `AthleteProfile` type exported from types/index.ts
- [ ] TASK 3: `athleteProfileSchema` + `DIVISIONS` added to validations.ts
- [ ] TASK 4: `sports-data.ts` created with all constants
- [ ] TASK 5: `/api/onboarding` route (GET + POST) created
- [ ] TASK 6: `(onboarding)/layout.tsx` created with auth check
- [ ] TASK 7: `onboarding-wizard.tsx` client component created (3 steps)
- [ ] TASK 8: `(onboarding)/onboarding/page.tsx` created
- [ ] TASK 9: Signup redirect updated to `/onboarding`
- [ ] TASK 10: `npm run db:push` executed successfully
- [ ] TASK 11: Validation tests written and passing
- [ ] `npx tsc --noEmit` — zero errors
- [ ] `npm run lint` — zero errors
- [ ] `npm run test:run` — all tests pass
- [ ] Manual E2E walkthrough complete

---

## NOTES

### Design Decisions

- **Native `<select>` over shadcn Select component**: The shadcn Select component is not in `src/components/ui/`. Adding it requires `npx shadcn add select`. To keep this a zero-new-dependency task, use native `<select>` with Tailwind classes matching the Input component's visual style. If shadcn Select is preferred, add it first via `npx shadcn@latest add select`.

- **Single client component wizard vs. separate step components**: Chosen single `OnboardingWizard` component to minimize file count and keep all step state co-located. Step extraction to separate components is a future refactor.

- **Google OAuth bypasses wizard**: Google signup users land directly on `/editor` (unchanged behavior). MVP acceptable — a future task should detect Google users without an athlete profile and redirect them to `/onboarding` via the dashboard layout check.

- **`nilEligible` auto-computed, not user-entered**: Computing NIL eligibility from division + state prevents athletes from miscategorizing themselves. The `HS_NIL_STATES` set reflects the 45+ states that allow HS NIL as of early 2026. This is "best-effort" — the PRD notes state-by-state rules are complex and the platform is not providing legal advice.

- **Division stored as text**: Using `text` not an enum column in Postgres. This matches the existing schema pattern (`type text("type")` in `link_items`) and avoids painful migrations if divisions change.

- **Onboarding separate from dashboard layout**: Using `(onboarding)` route group with its own minimal layout (no nav header) provides a clean wizard experience without the editor navigation bar, which would be distracting during first-time setup.
